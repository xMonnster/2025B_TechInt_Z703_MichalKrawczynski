# Opis projektu — Filmy i oceny

Krótko: napisałem prostą aplikację (Node.js/Express + SQLite) realizującą wymagania z zadania "Lab04 — Filmy i oceny".

Co zrobiłem:
- Stworzyłem bazę SQLite (`movies.db`) oraz skrypt `init_db.js`, który tworzy tabele `movies` i `ratings` i wstawia przykładowe dane w języku polskim.
- Backend: `server.js` — Express z trzema ważnymi endpointami:
  - `GET /api/movies` — zwraca listę filmów z `avg_score` (średnia zaokrąglona do 2 miejsc) i `votes` (liczba głosów), sortowane malejąco.
  - `POST /api/movies {title, year}` — dodaje film (z walidacją roku), zwraca `201` i `Location`.
  - `POST /api/ratings {movie_id, score}` — dodaje ocenę (walidacja 1..5), zwraca `201`.
- Frontend: `public/index.html` i `public/app.js` — prosta strona (w języku polskim) pokazująca listę filmów, formularz dodawania filmu oraz formularz dodawania oceny; po każdej operacji UI odświeża dane bez restartowania serwera.
- Minimalne wymagania niefunkcjonalne: proste logowanie żądań, walidacja na backendzie, nagłówki bezpieczeństwa (`X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy`).

Jak to działa (w podstawach):
- Aplikacja przechowuje filmy w tabeli `movies` i oceny w `ratings` powiązane przez `movie_id`.
- Średnia (`avg_score`) obliczana jest zapytaniem SQL jako AVG(score) i zaokrąglana do dwóch miejsc.
- Frontend używa `fetch` do komunikacji z API i renderuje tabelę oraz aktualizuje listę filmów po operacjach.

Uruchomienie:
1. Zainstaluj zależności: `npm install`
2. Zainicjalizuj bazę: `npm run init-db` (utworzy `movies.db`)
3. Uruchom serwer: `npm start` i otwórz `http://localhost:3000`

