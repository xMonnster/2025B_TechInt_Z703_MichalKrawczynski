const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { init, DB_FILE } = require('./db/init_db');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure DB exists and seeded
init();

const db = new sqlite3.Database(DB_FILE);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Members ---
app.get('/api/members', (req, res) => {
  db.all('SELECT id,name,email FROM members', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/members', (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Brak name lub email' });
  const stmt = db.prepare('INSERT INTO members(name,email) VALUES (?,?)');
  stmt.run(name, email, function (err) {
    if (err) {
      if (err.message && err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email już istnieje' });
      return res.status(500).json({ error: err.message });
    }
    res.status(201).location(`/api/members/${this.lastID}`).json({ id: this.lastID });
  });
});

// --- Books ---
app.get('/api/books', (req, res) => {
  const sql = `SELECT b.id, b.title, b.author, b.copies,
    (b.copies - IFNULL(a.active,0)) AS available
    FROM books b
    LEFT JOIN (
      SELECT book_id, COUNT(*) AS active FROM loans WHERE return_date IS NULL GROUP BY book_id
    ) a ON a.book_id = b.id`;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/books', (req, res) => {
  const { title, author, copies } = req.body || {};
  if (!title || !author) return res.status(400).json({ error: 'Brak title lub author' });
  const c = Number.isInteger(copies) ? copies : (copies ? parseInt(copies, 10) : 1);
  const stmt = db.prepare('INSERT INTO books(title,author,copies) VALUES (?,?,?)');
  stmt.run(title, author, c, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).location(`/api/books/${this.lastID}`).json({ id: this.lastID });
  });
});

// --- Loans ---
app.get('/api/loans', (req, res) => {
  const sql = `SELECT l.id, l.member_id, m.name AS member_name, l.book_id, b.title AS book_title, l.loan_date, l.due_date, l.return_date
    FROM loans l
    JOIN members m ON m.id = l.member_id
    JOIN books b ON b.id = l.book_id
    ORDER BY l.id DESC`;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/loans/borrow', (req, res) => {
  const { member_id, book_id, days } = req.body || {};
  if (!member_id || !book_id) return res.status(400).json({ error: 'Brak member_id lub book_id' });
  const term = Number(days) || 14;

  db.serialize(() => {
    db.get('SELECT copies FROM books WHERE id = ?', [book_id], (err, book) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!book) return res.status(404).json({ error: 'Książka nie znaleziona' });
      db.get('SELECT COUNT(*) AS active FROM loans WHERE book_id = ? AND return_date IS NULL', [book_id], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        const active = row.active || 0;
        if (active >= book.copies) return res.status(409).json({ error: 'Brak dostępnych egzemplarzy' });
        const now = new Date();
        const due = new Date(now.getTime() + term * 24 * 3600 * 1000);
        const loanDate = now.toISOString();
        const dueDate = due.toISOString();
        const stmt = db.prepare('INSERT INTO loans(member_id,book_id,loan_date,due_date) VALUES (?,?,?,?)');
        stmt.run(member_id, book_id, loanDate, dueDate, function (err3) {
          if (err3) return res.status(500).json({ error: err3.message });
          res.status(201).location(`/api/loans/${this.lastID}`).json({ id: this.lastID });
        });
      });
    });
  });
});

app.post('/api/loans/return', (req, res) => {
  const { loan_id } = req.body || {};
  if (!loan_id) return res.status(400).json({ error: 'Brak loan_id' });
  db.get('SELECT return_date FROM loans WHERE id = ?', [loan_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Wypożyczenie nie istnieje' });
    if (row.return_date) return res.status(409).json({ error: 'Wypożyczenie już zwrócone' });
    const now = new Date().toISOString();
    db.run('UPDATE loans SET return_date = ? WHERE id = ?', [now, loan_id], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ ok: true });
    });
  });
});

app.listen(PORT, () => console.log(`Serwer działa: http://localhost:${PORT}`));
