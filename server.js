import "dotenv/config";
import express from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

import { findUserByEmail } from "./services/userStore.js";

import { requireAuth } from "./middleware/requireAuth.js";
import { requireRole } from "./middleware/requireRole.js";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET missing in .env");
}

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// parse form data + JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true only when HTTPS
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// static files
app.use(express.static(path.join(__dirname, "public")));

// redirect root to login page
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

/**
 * POST /login
 * - find user by email
 * - compare password with bcrypt.compare
 * - create session with minimal user info
 */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email og adgangskode skal udfyldes.");
    }

    const user = await findUserByEmail(email);

    // don't reveal whether email exists
    if (!user) {
      return res.status(401).send("Forkert email eller adgangskode.");
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return res.status(401).send("Forkert email eller adgangskode.");
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Der skete en fejl på serveren.");
  }
});

/**
 * GET /dashboard
 */
app.get("/dashboard", requireAuth, (req, res) => {
  const { email, role } = req.session.user;

  res.send(`
    <h1>Dashboard</h1>
    <p>Du er logget ind som <strong>${email}</strong> med rollen <strong>${role}</strong>.</p>

    <ul>
      <li><a href="/read">Læs-side</a></li>
      <li><a href="/edit">Redigér-side</a></li>
      <li><a href="/system">Systemopsætning</a></li>
    </ul>

    <form method="POST" action="/logout">
      <button type="submit">Log ud</button>
    </form>

    <p><a href="/login.html">Tilbage til login</a></p>
  `);
});
// READ: viewer/editor/admin
app.get("/read", requireAuth, requireRole("viewer", "editor", "admin"), (req, res) => {
  res.send(`
    <h1>Læs-side</h1>
    <p>Du har adgang til at læse indhold.</p>
    <p><a href="/dashboard">Tilbage til dashboard</a></p>
  `);
});

// EDIT: editor/admin
app.get("/edit", requireAuth, requireRole("editor", "admin"), (req, res) => {
  res.send(`
    <h1>Redigér-side</h1>
    <p>Du har adgang til at skrive og ændre indhold.</p>
    <p><a href="/dashboard">Tilbage til dashboard</a></p>
  `);
});

// SYSTEM: admin only
app.get("/system", requireAuth, requireRole("admin"), (req, res) => {
  res.send(`
    <h1>Systemopsætning</h1>
    <p>Kun admin har adgang til denne side.</p>
    <p><a href="/dashboard">Tilbage til dashboard</a></p>
  `);
});

/**
 * POST /logout
 */
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("Du er nu logget ud.");
  });
});

// debug endpoint
app.get("/me", (req, res) => {
  res.json({ user: req.session.user ?? null });
});

app.listen(PORT, () => {
  console.log(`Server kører på http://localhost:${PORT}`);
});