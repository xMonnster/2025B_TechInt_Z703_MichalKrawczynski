const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
app.use(express.json());

// Minimal logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Security headers (minimal)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  // minimal CSP allowing our inline scripts/styles for simplicity
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  next();
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// API
// GET /api/notes?q=...&tag=...
app.get('/api/notes', async (req, res) => {
  const q = req.query.q ? req.query.q.trim() : '';
  const tag = req.query.tag ? req.query.tag.trim() : '';

  let baseSql = `
    SELECT n.id, n.title, n.body, n.created_at,
           GROUP_CONCAT(t.name) as tags
    FROM notes n
    LEFT JOIN note_tags nt ON nt.note_id = n.id
    LEFT JOIN tags t ON t.id = nt.tag_id
  `;
  const where = [];
  const params = [];

  if (q) {
    where.push(`(n.title LIKE ? OR n.body LIKE ?)`);
    params.push(`%${q}%`, `%${q}%`);
  }
  if (tag) {
    where.push(`n.id IN (SELECT nt2.note_id FROM note_tags nt2 JOIN tags t2 ON t2.id = nt2.tag_id WHERE t2.name = ?)`);
    params.push(tag);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const groupSql = `GROUP BY n.id ORDER BY n.created_at DESC`;
  const finalSql = `${baseSql} ${whereSql} ${groupSql}`;

  try {
    const rows = await db.all(finalSql, params);
    const notes = rows.map(r => ({
      id: r.id,
      title: r.title,
      body: r.body,
      created_at: r.created_at,
      tags: r.tags ? r.tags.split(',') : []
    }));
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// POST /api/notes {title, body}
app.post('/api/notes', async (req, res) => {
  const { title, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'title i body są wymagane' });

  try {
    const info = await db.run('INSERT INTO notes(title, body, created_at) VALUES(?,?,datetime("now"))', [title.trim(), body.trim()]);
    const id = info.lastID;
    res.setHeader('Location', `/api/notes/${id}`);
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd zapisu' });
  }
});

// GET /api/tags
app.get('/api/tags', async (req, res) => {
  try {
    const rows = await db.all('SELECT id, name FROM tags ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// POST /api/notes/:id/tags {tags: ["work","home"]}
app.post('/api/notes/:id/tags', async (req, res) => {
  const noteId = parseInt(req.params.id, 10);
  const tags = Array.isArray(req.body.tags) ? req.body.tags : null;
  if (!tags || !Array.isArray(tags) || tags.length === 0) return res.status(400).json({ error: 'tags musi być niepustą tablicą' });

  try {
    const note = await db.get('SELECT id FROM notes WHERE id = ?', [noteId]);
    if (!note) return res.status(404).json({ error: 'Notatka nie istnieje' });

    for (const rawName of tags) {
      const name = String(rawName).trim();
      if (!name) continue;
      await db.run('INSERT OR IGNORE INTO tags(name) VALUES(?)', [name]);
      const t = await db.get('SELECT id FROM tags WHERE name = ?', [name]);
      if (t && t.id) await db.run('INSERT OR IGNORE INTO note_tags(note_id, tag_id) VALUES(?,?)', [noteId, t.id]);
    }

    const updated = await db.all('SELECT t.id, t.name FROM tags t JOIN note_tags nt ON nt.tag_id = t.id WHERE nt.note_id = ? ORDER BY t.name', [noteId]);
    res.json({ tags: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd zapisu tagów' });
  }
});

// simple 404 for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Nie znaleziono endpointu' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serwer uruchomiony na http://localhost:${port}`));