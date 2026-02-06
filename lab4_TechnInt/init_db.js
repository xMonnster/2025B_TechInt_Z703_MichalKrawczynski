const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFile = path.join(__dirname, 'movies.db');
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    score INTEGER NOT NULL CHECK(score >= 1 AND score <= 5),
    FOREIGN KEY(movie_id) REFERENCES movies(id) ON DELETE CASCADE
  )`);

  // Wstępne dane (po polsku)
  db.run(`DELETE FROM ratings`);
  db.run(`DELETE FROM movies`);

  const insertMovie = db.prepare('INSERT INTO movies (title, year) VALUES (?,?)');
  insertMovie.run('Król Lew', 1994);
  insertMovie.run('Cicha Noc', 2017);
  insertMovie.run('Zimna wojna', 2018);
  insertMovie.run('Kamerdyner', 2018);
  insertMovie.finalize();

  const insertRating = db.prepare('INSERT INTO ratings (movie_id, score) VALUES (?,?)');
  insertRating.run(1, 5);
  insertRating.run(1, 4);
  insertRating.run(3, 5);
  insertRating.run(3, 4);
  insertRating.run(2, 3);
  insertRating.finalize();

  console.log('Baza danych została zainicjalizowana: movies.db');
});

db.close();