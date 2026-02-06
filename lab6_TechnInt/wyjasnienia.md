# Wyjaśnienia projektu — Notatnik z tagami i wyszukiwaniem

Niniejszy plik zawiera wyjaśnienie działania aplikacji i krótki opis roli poszczególnych plików w projekcie.

## Krótki opis działania (przepływ)
- Użytkownik korzysta z interfejsu w przeglądarce (`public/index.html`) lub wywołuje API bezpośrednio.
- Tworzenie notatki: klient wysyła POST /api/notes z JSON {title, body} → serwer (w `index.js`) zapisuje w tabeli `notes` i zwraca status 201 oraz id nowego rekordu.
- Dodawanie tagów: klient wysyła POST /api/notes/:id/tags z JSON {tags:[...]} → serwer tworzy brakujące wpisy w `tags` (unikalne po `name`) i tworzy wiersze w tabeli `note_tags` (relacja wiele-do-wielu). Relacja ma PK (`note_id`,`tag_id`) więc ten sam tag nie zostanie przypisany dwa razy.
- Wyszukiwanie: GET /api/notes?q=fraza (opcjonalnie `&tag=xxx`) → serwer wykona zapytanie SQL, używając `LIKE` dla pola `title` i `body`, dodatkowo może ograniczyć wyniki do notatek powiązanych z podanym tagiem; wyniki zawierają złączone tagi dla każdej notatki.

## Opis plików i ich rola
- `package.json` — metadane projektu, skrypty uruchomieniowe (`npm start`), zależności (Express, sqlite3). Przydatne polecenia: `npm install`, `npm start`.

- `index.js` — główny serwer Express:
  - Middleware: parsowanie JSON, prosty logger żądań, nagłówki bezpieczeństwa (`X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy`).
  - Serwuje pliki statyczne z `public/`.
  - Zawiera API:
    - `GET /api/notes?q=&tag=` — wyszukiwanie i filtrowanie (zwraca listę notatek z listą tagów).
    - `POST /api/notes` — tworzenie notatki (walidacja wejścia → 400 gdy brak pól).
    - `GET /api/tags` — zwraca wszystkie tagi.
    - `POST /api/notes/:id/tags` — tworzenie tagów i przypisanie ich do notatki; zwraca 404 gdy notatka nie istnieje.
  - Odpowiednio ustawia statusy i nagłówki `Location` dla 201.

- `db.js` — inicjalizacja bazy SQLite i funkcje pomocnicze:
  - Tworzy plik bazy `notes.db` (automatycznie przy pierwszym uruchomieniu).
  - Ustawia `PRAGMA foreign_keys = ON` i tworzy tabele: `notes`, `tags`, `note_tags` oraz indeksy.
  - Eksportuje pomocnicze funkcje `all(sql, params)`, `get(sql, params)`, `run(sql, params)` które zwracają Promisy ułatwiające obsługę asynchroniczną.

- `public/index.html` — prosty frontend:
  - Formularz dodawania notatki (`title`, `body`, `tags` jako ciąg rozdzielony przecinkami).
  - Pole wyszukiwania i miejsce na listę wyników.
  - Teksty w języku polskim (można je edytować bezpośrednio tutaj).

- `public/app.js` — logika klienta:
  - Wysyła żądania do API (`fetch`) dla dodawania notatek i tagów oraz pobierania wyników i listy tagów.
  - Obsługuje pole wyszukiwania (podświetlanie fraz), skracanie treści do fragmentów, i filtrowanie po tagach (kliknięcie tagu ustawia filtr).
  - Prosta walidacja po stronie klienta (np. wymagane pola przy dodawaniu notatki).

- `opis.md` — krótki opis projektu po polsku (co zostało zrobione i jak uruchomić).
- `README.md` — podstawowe instrukcje uruchomieniowe i opis endpointów (do oddania pracy/labów).
- `tests.rest` — przykładowe żądania REST do szybkiego testowania (można importować do narzędzi HTTP lub użyć w edytorze VS Code).
- `.gitignore` — ignoruje `node_modules/`, `notes.db`, `.env` itp.
- `notes.db` — plik bazy danych SQLite (powstaje automatycznie; nie powinien być commitowany do repozytorium).

## Walidacja i bezpieczeństwo
- Walidujemy wymagane pola na backendzie (zwracamy 400 jeśli brakuje `title` lub `body`).
- Minimalne nagłówki bezpieczeństwa ustawione w `index.js` (można rozszerzyć o CSP, HSTS, itp.).
- Poprawne typy treści (`Content-Type: application/json`) oraz sensowne kody odpowiedzi użyte tam, gdzie to konieczne (201, 400, 404, 500).

## Szybkie wskazówki rozwoju / dalsze ulepszenia
- Zamiana `LIKE` na FTS5 (pełnotekstowe wyszukiwanie) dla lepszej jakości wyszukiwania i wydajności.
- Dodanie testów automatycznych (np. Mocha + supertest) dla endpointów API.
- Obsługa paginacji i limitów w `GET /api/notes` gdy będą duże zbiory.
- Drobne usprawnienia UI: edycja/usuwanie notatek, zarządzanie tagami, lepsze UX przy filtrowaniu.

## Jak testować lokalnie (krótko)
1. `npm install`
2. `npm start`
3. Otwórz `http://localhost:3000` lub użyj `tests.rest` / curl / Postman do wywołań API.

---

