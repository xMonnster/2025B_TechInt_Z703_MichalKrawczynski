# Opis projektu (po polsku)

Projekt: prosty notatnik z tagami i wyszukiwaniem — realizacja lab 06.

Co zrobiłem:
- Stworzyłem prosty backend w Node.js (Express) i bazę SQLite (`notes.db`).
- W bazie utworzone tabele: `notes`, `tags`, `note_tags` (wiele-do-wielu).
- Zaimplementowałem API:
  - `GET /api/notes?q=...&tag=...` — wyszukiwanie po tytule/treści oraz opcjonalne filtrowanie po tagu.
  - `POST /api/notes {title, body}` — tworzenie notatki (zwraca `201` i `Location`).
  - `GET /api/tags` — lista tagów.
  - `POST /api/notes/:id/tags {tags:[...]}` — tworzy brakujące tagi i przypisuje je do notatki.
- Dodałem prosty interfejs w `public/index.html` i `public/app.js` (wszystko w języku polskim):
  - Pole wyszukiwania, lista wyników, formularz tworzenia notatki z możliwością dodania tagów (przez przecinek).
  - Klikając tag filtruje wyniki (bonus: filtracja po tagu i podświetlanie fraz).
- Dodałem minimalną walidację i nagłówki bezpieczeństwa (`X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy`).

Jak uruchomić (skrót):
1. Zainstaluj zależności: `npm install`
2. Uruchom serwer: `npm start` (serwer na `http://localhost:3000`)

Zastosowanie i uwagi:
- Aplikacja jest prosta i spełnia minimalne wymagania z notatek: dodawanie notatek, tagów, wyszukiwanie (LIKE) oraz filtrowanie.
- Baza `notes.db` zostanie utworzona automatycznie przy pierwszym uruchomieniu.

Pliki istotne:
- `index.js` — serwer i API
- `db.js` — inicjalizacja SQLite
- `public/index.html`, `public/app.js` — frontend
- `opis.md` — ten plik


