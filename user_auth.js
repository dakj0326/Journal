const argon2 = require("argon2");
const { randomUUID } = require("crypto");


function requireAuth(req, res, next) {
  if (!req.session.uid) {
    return res.redirect("/index.html");
  }
    next();
}

    // Signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const uid = randomUUID();
  const passwordHash = await argon2.hash(password);

  try {
    db.prepare(`
      INSERT INTO users (uid, username, password_hash)
      VALUES (?, ?, ?)
    `).run(uid, username, passwordHash);

    res.json({ success: true });

  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(409).json({ error: "Username taken" });
    } else {
      throw err;
    }
  }
});

    // Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare(`
    SELECT uid, password_hash
    FROM users
    WHERE username = ?
  `).get(username);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await argon2.verify(user.password_hash, password);

  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.session.uid = user.uid;

  res.json({ success: true });
});

app.get("/profile", requireAuth, (req, res) => {
  const user = db.prepare(`
    SELECT uid, username, created_at
    FROM users
    WHERE uid = ?
  `).get(req.session.uid);

  if (!user) {
    return res.status(404).end();
  }

  res.json(user);
});


