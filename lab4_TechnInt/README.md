# Lab04 — Filmy i oceny

Prosty projekt realizujący wymagania zaliczeniowe: filmy + oceny. Dane i komunikaty są po polsku.

Szybki start:
1. `npm install`
2. `npm run init-db` — tworzy `movies.db` i przykładowe dane
3. `npm start` — serwer na `http://localhost:3000`

API:
- `GET /api/movies` — lista filmów z `avg_score` i `votes` (JSON)
- `POST /api/movies {title,year}` — dodaj film (201 + Location)
- `POST /api/ratings {movie_id,score}` — dodaj ocenę 1..5 (201)

Uwagi o jakości:
- Walidacja po stronie backendu (kody 400/422/404/500)
- Minimalne nagłówki bezpieczeństwa (X-Content-Type-Options, CSP, Referrer-Policy)
- Proste logowanie żądań

Pliki:
- `server.js` — backend
- `init_db.js` — inicjalizacja SQLite
- `public/` — frontend (HTML/JS)
- `opis.md` — opis wykonanej pracy
