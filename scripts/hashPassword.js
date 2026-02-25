import bcrypt from "bcrypt";

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.log("Brug: npm run hash -- dinAdgangskode");
  process.exit(1);
}

const saltRounds = 12;
const hash = await bcrypt.hash(plainPassword, saltRounds);

console.log("Adgangskode (plaintext):", plainPassword);
console.log("Password hash (gem denne i users.json):", hash);