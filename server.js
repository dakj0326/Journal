const express = require("express");
const session = require("express-session");
const Database = require("better-sqlite3");

const app = express();

// --- middleware ---
app.use(express.json());

app.use(
  session({
    name: "sid",
    secret: "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    }
  })
);

// --- database ---
const db = new Database("users.db");

// ✅ SCHEMA CREATION MUST RUN
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// --- routes ---
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/profile", (req, res) => {
  if (!req.session.uid) {
    return res.status(401).end();
  }

  const user = db.prepare(
    "SELECT uid, username, created_at FROM users WHERE uid = ?"
  ).get(req.session.uid);

  res.json(user);
});

// --- start server ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
