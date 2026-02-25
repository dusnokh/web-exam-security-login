import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersPath = path.join(__dirname, "..", "data", "users.json");

export async function getAllUsers() {
  const raw = await fs.readFile(usersPath, "utf-8");
  return JSON.parse(raw);
}

export async function findUserByEmail(email) {
  const users = await getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}