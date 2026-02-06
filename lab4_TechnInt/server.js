const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'movies.db'));

const app = express();
app.use(express.json());

// Proste logowanie
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Minimalne nagłówki bezpieczeństwa
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// GET /api/movies (obsługa ?year i ?top opcjonalnie)
app.get('/api/movies', (req, res) => {
  let sql = `SELECT m.id, m.title, m.year, ROUND(IFNULL(AVG(r.score), 0), 2) as avg_score, COUNT(r.id) as votes
             FROM movies m LEFT JOIN ratings r ON r.movie_id = m.id`;
  const params = [];
  if (req.query.year) {
    sql += ' WHERE m.year = ?';
    params.push(req.query.year);
  }
  sql += ' GROUP BY m.id ORDER BY avg_score DESC';
  if (req.query.top) {
    const limit = parseInt(req.query.top, 10) || 5;
    sql += ` LIMIT ${limit}`;
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Błąd bazy danych' });
    rows.forEach(r => { r.avg_score = parseFloat(r.avg_score); r.votes = parseInt(r.votes); });
    res.json(rows);
  });
});

// POST /api/movies
app.post('/api/movies', (req, res) => {
  const { title, year } = req.body;
  if (!title || !year) return res.status(400).json({ error: 'Brakuje pola title lub year' });
  const y = parseInt(year, 10);
  if (isNaN(y) || y < 1888 || y > 2100) return res.status(422).json({ error: 'Nieprawidłowy rok' });

  db.run('INSERT INTO movies (title, year) VALUES (?,?)', [title, y], function (err) {
    if (err) return res.status(500).json({ error: 'Błąd bazy danych' });
    res.status(201).location(`/api/movies/${this.lastID}`).json({ id: this.lastID });
  });
});

// POST /api/ratings
app.post('/api/ratings', (req, res) => {
  const { movie_id, score } = req.body;
  if (movie_id == null || score == null) return res.status(400).json({ error: 'Brakuje pola movie_id lub score' });
  const s = parseInt(score, 10);
  if (isNaN(s) || s < 1 || s > 5) return res.status(422).json({ error: 'score musi być 1..5' });

  db.get('SELECT id FROM movies WHERE id = ?', [movie_id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Błąd bazy danych' });
    if (!row) return res.status(404).json({ error: 'Film nie istnieje' });

    db.run('INSERT INTO ratings (movie_id, score) VALUES (?,?)', [movie_id, s], function (err) {
      if (err) return res.status(500).json({ error: 'Błąd bazy danych' });
      res.status(201).location(`/api/movies/${movie_id}`).json({ id: this.lastID });
    });
  });
});

// fallback dla nieznanych ścieżek
app.use((req, res) => res.status(404).json({ error: 'Nie znaleziono' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer uruchomiony na http://localhost:${PORT}`));