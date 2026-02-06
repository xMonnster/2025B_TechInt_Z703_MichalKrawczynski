const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = path.join(__dirname, 'lab03.db');
const INIT_SQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

// Init DB if not exists
const dbExists = fs.existsSync(DB_FILE);
const db = new sqlite3.Database(DB_FILE);

if (!dbExists) {
  db.exec(INIT_SQL, (err) => {
    if (err) console.error('Błąd inicjalizacji DB:', err);
    else console.log('Baza danych zainicjalizowana.');
  });
}

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Minimalne nagłówki bezpieczeństwa
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'no-referrer');
  res.set('Content-Security-Policy', "default-src 'self' 'unsafe-inline' data:");
  next();
});

// Logger prosty
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// GET /api/posts
app.get('/api/posts', (req, res) => {
  db.all("SELECT id, title, body, created_at FROM posts ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json({error: 'Błąd serwera'});
    res.json(rows);
  });
});

// POST /api/posts
app.post('/api/posts', (req, res) => {
  const { title, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'title i body są wymagane' });
  db.run("INSERT INTO posts (title, body) VALUES (?, ?)", [title, body], function(err) {
    if (err) return res.status(500).json({ error: 'Błąd tworzenia posta' });
    res.status(201).location(`/api/posts/${this.lastID}`).json({ id: this.lastID });
  });
});

// GET /api/posts/:id/comments (tylko zatwierdzone)
app.get('/api/posts/:id/comments', (req, res) => {
  const postId = Number(req.params.id);
  db.all("SELECT id, author, body, created_at FROM comments WHERE post_id = ? AND approved = 1 ORDER BY created_at DESC", [postId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    res.json(rows);
  });
});

// POST /api/posts/:id/comments -> approved=0
app.post('/api/posts/:id/comments', (req, res) => {
  const postId = Number(req.params.id);
  const { author, body } = req.body || {};
  if (!author || !body) return res.status(400).json({ error: 'author i body są wymagane' });
  // Sprawdź czy post istnieje
  db.get("SELECT id FROM posts WHERE id = ?", [postId], (err, post) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    if (!post) return res.status(404).json({ error: 'Post nie istnieje' });
    db.run("INSERT INTO comments (post_id, author, body, approved) VALUES (?, ?, ?, 0)", [postId, author, body], function(err) {
      if (err) return res.status(500).json({ error: 'Błąd zapisu komentarza' });
      res.status(201).location(`/api/comments/${this.lastID}`).json({ id: this.lastID, approved: 0 });
    });
  });
});

// POST /api/comments/:id/approve -> ustawia approved=1
app.post('/api/comments/:id/approve', (req, res) => {
  const id = Number(req.params.id);
  db.get("SELECT id, approved FROM comments WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    if (!row) return res.status(404).json({ error: 'Komentarz nie istnieje' });
    if (row.approved === 1) return res.status(409).json({ error: 'Komentarz już zatwierdzony' });
    db.run("UPDATE comments SET approved = 1 WHERE id = ?", [id], function(err) {
      if (err) return res.status(500).json({ error: 'Błąd zapisu' });
      res.json({ ok: true });
    });
  });
});

// Moderator: GET pending comments
app.get('/api/comments/pending', (req, res) => {
  db.all("SELECT id, post_id, author, body, created_at FROM comments WHERE approved = 0 ORDER BY created_at ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    res.json(rows);
  });
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer uruchomiony na http://localhost:${PORT}`));
