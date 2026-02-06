# Lab03 — Blog z komentarzami i moderacją

Prosta implementacja wymagań z pliku `Lab03 — Blog komentarze z moderacją.md`.

Wymagania spełnione (minimum):
- Model danych: `posts`, `comments` z kolumną `approved` (domyślnie 0)
- API: `GET /api/posts`, `POST /api/posts`, `GET /api/posts/:id/comments` (tylko zatwierdzone), `POST /api/posts/:id/comments`, `POST /api/comments/:id/approve`
- UI: lista postów, formularz dodawania komentarza, panel moderatora
- Walidacja i statusy (400, 404, 409, 500), prosty logging i nagłówki bezpieczeństwa

Uruchomienie:
1. `npm install`
2. `npm start`
3. Otwórz `http://localhost:3000/`

Przykładowe żądania (curl):
- Dodaj posta: curl -X POST -H "Content-Type: application/json" -d '{"title":"Tytuł","body":"Treść"}' http://localhost:3000/api/posts
- Dodaj komentarz: curl -X POST -H "Content-Type: application/json" -d '{"author":"Jan","body":"Hello"}' http://localhost:3000/api/posts/1/comments
- Zatwierdź komentarz: curl -X POST http://localhost:3000/api/comments/2/approve

Pliki:
- `index.js` — serwer
- `init.sql` — schemat i seed
- `public/` — frontend
- `opis.md` — opis projektu po polsku

Uwagi: baza SQLite zostanie utworzona przy pierwszym uruchomieniu (plik `lab03.db`).
