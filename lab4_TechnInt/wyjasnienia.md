# Wyjaśnienie działania projektu — Filmy i oceny

Poniżej krótko opisano, co robią poszczególne pliki i jak przebiega podstawowy przepływ danych.

## Główne pliki

- `package.json`
  - Zawiera metadane projektu i skrypty uruchomieniowe: `npm run init-db` (inicjalizacja bazy) oraz `npm start` (uruchomienie serwera).

- `init_db.js`
  - Tworzy plik SQLite `movies.db`, tabele `movies` i `ratings`, ustawia constraint CHECK dla oceny oraz wstawia przykładowe dane w języku polskim.
  - Uruchamia się raz przed pierwszym startem (komenda `npm run init-db`).

- `movies.db`
  - Plik bazy danych SQLite (generowany przez `init_db.js`). Zawiera tabele `movies` i `ratings`.

- `server.js`
  - Backend w Express:
    - Middleware: proste logowanie żądań oraz nagłówki bezpieczeństwa (`X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy`).
    - Statyczne pliki: serwuje `public/` (frontend).
    - Endpointy API:
      - `GET /api/movies` — zwraca listę filmów z dodatkowymi polami `avg_score` (średnia, zaokrąglona do 2 miejsc) i `votes` (liczba głosów). Obsługuje opcjonalne parametry zapytań (np. `year`, `top`).
      - `POST /api/movies {title, year}` — dodaje film; waliduje obecność pól i sensowny rok; zwraca `201` i nagłówek `Location`.
      - `POST /api/ratings {movie_id, score}` — dodaje ocenę; waliduje zakres `score` (1..5) i istnienie filmu; zwraca `201`.
    - Błędy i statusy:
      - 400 — brak wymaganych pól
      - 422 — nieprawidłowa wartość (np. `score` poza 1..5)
      - 404 — nie znaleziono filmu
      - 500 — błąd bazy danych

- `public/index.html`
  - Prosty frontend (HTML) w języku polskim: formularz dodawania filmu, formularz dodawania oceny oraz tabela z rankingiem filmów.

- `public/app.js`
  - Logika frontendowa (czysty JS):
    - `fetchMovies()` — pobiera `/api/movies` i zwraca JSON.
    - `renderMovies(movies)` — renderuje tabelę i listę wyboru filmów w formularzu ocen.
    - Obsługa formularzy: wysyła `POST` do `/api/movies` lub `/api/ratings`, po sukcesie odświeża listę (bez restartu serwera) i informuje użytkownika.

- `opis.md` i `README.md`
  - `opis.md` — opis co zostało zrobione i krótkie wyjaśnienie projektu.
  - `README.md` — instrukcja uruchomienia oraz szybka dokumentacja API.

- `tests.rest`
  - Przykładowe wywołania (GET/POST) do testowania endpointów lokalnie (można użyć w VS Code REST Client lub Postmanie).

- `.gitignore`
  - Wyklucza `node_modules/` i plik bazy `*.db` z repozytorium.

## Co się dzieje podczas typowego użycia

1. Uruchamiasz: `npm run init-db` → tworzy `movies.db` z przykładowymi filmami i ocenami.
2. Uruchamiasz: `npm start` → Express serwuje stronę i udostępnia API.
3. Frontend (`public/app.js`) pobiera `/api/movies` i wyświetla ranking.
4. Użytkownik dodaje film lub ocenę → frontend wysyła `POST` do odpowiedniego endpointu → backend zapisuje w SQLite → frontend odświeża listę, która pokazuje zaktualizowaną średnią i liczbę głosów.

## Uwagi dot. implementacji i walidacji

- Średnia (`avg_score`) obliczana jest w zapytaniu SQL: `AVG(score)` i zaokrąglana do 2 miejsc (`ROUND(..., 2)`).
- Scores są wymuszane przez CHECK w schemacie (`score >=1 AND score <=5`) oraz sprawdzane w kodzie serwera (zwrot `422` gdy poza zakresem).
- Odpowiednie statusy HTTP i nagłówki bezpieczeństwa zostały dodane zgodnie z wymaganiami niefunkcjonalnymi.

