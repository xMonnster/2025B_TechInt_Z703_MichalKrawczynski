-- Inicjalizacja bazy SQLite dla lab03
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME DEFAULT (datetime('now')),
  approved INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Przykładowe dane
INSERT INTO posts (title, body) VALUES ('Witaj świecie', 'To jest pierwszy post na blogu.');
INSERT INTO posts (title, body) VALUES ('Drugi post', 'Kolejny ciekawy wpis.');

INSERT INTO comments (post_id, author, body, approved) VALUES (1, 'Agnieszka', 'Świetny wpis!', 1);
INSERT INTO comments (post_id, author, body, approved) VALUES (1, 'Jan', 'Czekam na zatwierdzenie', 0);
