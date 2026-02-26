# Login System – Datasikkerhed

Dette projekt implementerer et login-system med sikker password-håndtering og rollebaseret adgangskontrol.

Projektet er lavet i Node.js med Express og bcrypt.

---

## Funktioner

- Login med email og adgangskode (test-brugere findes nederst i filen)
- Passwords gemmes som bcrypt-hashes (med salt)
- Session-baseret login (express-session)
- Rollebaseret adgangskontrol (RBAC)
- Tre roller: admin, editor og viewer

---

## Password-sikkerhed

Passwords gemmes ikke i klartekst.

De gemmes som bcrypt-hashes i:

data/users.json

Ved login verificeres password med:

bcrypt.compare(password, user.passwordHash)

bcrypt inkluderer automatisk salt.

---

## Roller og adgang

Systemet indeholder tre roller:

- admin  
  → adgang til /system  
  → adgang til /edit  
  → adgang til /read  

- editor  
  → adgang til /edit  
  → adgang til /read  

- viewer  
  → adgang til /read  

Middleware bruges til at beskytte routes:
- requireAuth
- requireRole

---

## Installation

1. Installer dependencies:

npm install

2. Opret en .env-fil i projektets rod:

SESSION_SECRET=din-hemmelige-nøgle

3. Start serveren:

npm run dev

---

## Brug

Åbn i browser:

http://localhost:3000/login.html

---

## Test-brugere (kun til udvikling)

Disse brugere er kun til test:

admin@site.dk → AdminPassword!  
editor@site.dk → EditorPassword!  
viewer@site.dk → ViewerPassword!