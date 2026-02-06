const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_DIR = path.join(__dirname);
const DB_FILE = path.join(DB_DIR, 'library.db');

function init() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new sqlite3.Database(DB_FILE);

  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    db.run(`CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      copies INTEGER NOT NULL CHECK(copies >= 0)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      loan_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      return_date TEXT NULL,
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
      FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
    )`);

    // Seed only if empty
    let pending = 2; // members + books
    const done = () => {
      pending -= 1;
      if (pending === 0) {
        db.close(err => {
          if (err) console.error(err);
          else console.log('Baza danych utworzona/załadowana:', DB_FILE);
        });
      }
    };

    db.get('SELECT COUNT(*) AS c FROM members', (err, row) => {
      if (err) { console.error(err); return done(); }
      if (row.c === 0) {
        const stmt = db.prepare('INSERT INTO members(name,email) VALUES (?,?)');
        stmt.run('Ala Kowalska', 'ala@example.com');
        stmt.run('Jan Nowak', 'jan@example.com');
        stmt.finalize(done);
      } else {
        done();
      }
    });

    db.get('SELECT COUNT(*) AS c FROM books', (err, row) => {
      if (err) { console.error(err); return done(); }
      if (row.c === 0) {
        const stmt = db.prepare('INSERT INTO books(title,author,copies) VALUES (?,?,?)');
        stmt.run('Clean Code', 'R. Martin', 3);
        stmt.run('Domain-Driven Design', 'E. Evans', 2);
        stmt.run("You Don't Know JS", 'K. Simpson', 4);
        stmt.finalize(done);
      } else {
        done();
      }
    });
  });
}

if (require.main === module) init();

module.exports = { init, DB_FILE };
