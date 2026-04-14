const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { db } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

function makeToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

// Limit login/setup to 10 attempts per 15-minute window per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts — please wait 15 minutes and try again.' },
});

// Whether any users exist — drives the first-run setup screen
router.get('/setup-status', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  res.json({ needsSetup: count === 0 });
});

// Create the first admin account (only works when no users exist)
router.post('/setup', authLimiter, (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (count > 0) return res.status(400).json({ message: 'Setup already complete' });

  const { name, username, password } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ message: 'name, username and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const id = crypto.randomUUID();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, name, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, name.trim(), username.trim().toLowerCase(), hash, 'admin', new Date().toISOString());

  const user = { id, name: name.trim(), username: username.trim().toLowerCase(), role: 'admin' };
  res.json({ token: makeToken(id), user });
});

// Login
router.post('/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get((username || '').toLowerCase());
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  const user = { id: row.id, name: row.name, username: row.username, role: row.role };
  res.json({ token: makeToken(row.id), user });
});

// Current user
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

// List all users (admin only)
router.get('/users', requireAuth, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, name, username, role, created_at as createdAt FROM users ORDER BY created_at').all();
  res.json(users);
});

// Create a user (admin only)
router.post('/users', requireAuth, requireAdmin, (req, res) => {
  const { name, username, password, role = 'user' } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ message: 'name, username and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username.toLowerCase());
  if (existing) return res.status(400).json({ message: 'Username already taken' });

  const id = crypto.randomUUID();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, name, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, name.trim(), username.trim().toLowerCase(), hash, role, new Date().toISOString());

  res.status(201).json({ id, name: name.trim(), username: username.trim().toLowerCase(), role });
});

// Delete a user (admin only, can't delete yourself)
router.delete('/users/:id', requireAuth, requireAdmin, (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: "You can't delete your own account" });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// Change own password
router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(currentPassword, row.password_hash)) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  if ((newPassword || '').length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .run(bcrypt.hashSync(newPassword, 10), req.user.id);
  res.json({ message: 'Password updated' });
});

module.exports = router;
