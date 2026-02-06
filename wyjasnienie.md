# Wyjaśnienie plików projektu — Wypożyczalnia książek

Poniżej krótki opis co robi każdy plik i gdzie szukać najważniejszej logiki.

- `package.json` — konfiguracja projektu Node.js, skrypty `start` i `init-db` oraz zależności (`express`, `sqlite3`, `body-parser`).

- `server.js` — główny serwer Express. Udostępnia statyczne pliki z `public/` oraz API:
  - `GET /api/books` — lista książek z polem `available` (wyliczane jako `copies - aktywne_wypożyczenia`).
  - `POST /api/books` — dodaje książkę (walidacja: `title` i `author`).
  - `GET /api/members` — lista członków.
  - `POST /api/members` — dodaje członka (walidacja: `name` i `email`; email unikalny → 409).
  - `GET /api/loans` — lista wypożyczeń (łączy `members` i `books`).
  - `POST /api/loans/borrow` — próba wypożyczenia; sprawdza dostępność i wstawia rekord z `loan_date` i `due_date` (domyślnie 14 dni). Zwraca `409` gdy brak egzemplarzy.
  - `POST /api/loans/return` — ustawia `return_date` (błąd 409 jeśli już zwrócono).
  Serwer ustawia też minimalne nagłówki bezpieczeństwa (`X-Content-Type-Options`, `Referrer-Policy`).

- `db/init_db.js` — skrypt tworzący plik SQLite `db/library.db` (jeśli nie istnieje), tabele `members`, `books`, `loans` oraz podstawowe dane (seed). Wywoływany automatycznie przy starcie serwera i może być uruchomiony osobno (`npm run init-db`).

- `public/index.html` — prosty frontend. Zawiera UI do przeglądania książek, dodawania książek i członków oraz wypożyczania/zwrotów.

- `public/app.js` — logika frontendu: wywołuje API, renderuje tabele, obsługuje formularze i przyciski. Komunikaty i etykiety są po polsku.

- `opis.md` — krótka dokumentacja projektu: co zostało zrobione, jak uruchomić aplikację i propozycje dalszych usprawnień.

- `tests.rest` — przykładowe żądania HTTP (GET/POST) które możesz wczytać w rozszerzeniu REST Client lub użyć jako wzór do testów manualnych.

Główne założenia i gdzie szukać walidacji:
- Sprawdzenie dostępności egzemplarzy: w `server.js` przed wstawieniem do `loans` liczymy aktywne wypożyczenia (`return_date IS NULL`) i porównujemy z `books.copies`.
- Unikalność email: zapewniona przez constraint UNIQUE w SQLite oraz obsługa błędu w `POST /api/members` (zwraca 409).

Uruchomienie lokalne (skrót):
```
cd "c:\techniki internetowe\lab 1"
npm install
npm run init-db   # opcjonalne
npm start
```

Plik bazy: `db/library.db` (utworzony przez `db/init_db.js`).
