# Lab06 — Notatki z tagami i wyszukiwaniem

Prosty notatnik z backendem Express i bazą SQLite.

Wymagania minimalne:
- Node.js
- `npm install` (zainstaluje zależności)

Uruchomienie:
1. `npm install`
2. `npm start`
3. Otwórz `http://localhost:3000`

API:
- `GET /api/notes?q=...&tag=...` — lista notatek, filtry `q` i `tag`
- `POST /api/notes {title,body}` — tworzy notatkę, zwraca `{id}`
- `GET /api/tags` — lista tagów
- `POST /api/notes/:id/tags {tags:[...]}` — przypisuje tagi do notatki

Plik `opis.md` zawiera krótką dokumentację po polsku.

Uwagi:
- Baza `notes.db` tworzona jest automatycznie przy starcie aplikacji.

