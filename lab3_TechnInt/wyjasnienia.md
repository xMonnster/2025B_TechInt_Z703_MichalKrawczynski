# Wyjaśnienie plików (lab03 — Blog z moderacją)

Poniżej znajduje się krótki opis, co robi każdy plik w projekcie i jak współpracują ze sobą.

## Główne pliki projektu

- `package.json`
  - Definicja projektu Node.js i zależności (`express`, `sqlite3`, `body-parser`).
  - Skrypt `npm start` uruchamia `index.js`.

- `index.js` (serwer) 🔧
  - Główny plik aplikacji (Express).
  - Inicjalizuje bazę SQLite (plik `lab03.db`) — jeśli plik nie istnieje, wykonuje `init.sql`.
  - Udostępnia statyczne pliki z katalogu `public/`.
  - Ustawia podstawowe nagłówki bezpieczeństwa (`X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy`).
  - Realizuje API zgodne ze specyfikacją:
    - `GET /api/posts` — lista postów
    - `POST /api/posts` — tworzenie posta (zwalidowane pola)
    - `GET /api/posts/:id/comments` — zwraca tylko zatwierdzone komentarze (`approved=1`)
    - `POST /api/posts/:id/comments` — dodaje komentarz z `approved=0`
    - `GET /api/comments/pending` — lista komentarzy oczekujących (panel moderatora)
    - `POST /api/comments/:id/approve` — zatwierdzenie komentarza
  - Zwraca sensowne kody błędów: `400`, `404`, `409`, `500`.

- `init.sql` (schemat + seed) 🗄️
  - Tworzy tabele `posts` i `comments` oraz przykładowe wpisy.
  - Ustawia `approved` domyślnie na `0` dla komentarzy.
  - Używany tylko przy pierwszym uruchomieniu (gdy `lab03.db` nie istnieje).

- `lab03.db` (pliki bazy) ⚠️
  - Plik bazy SQLite — nie zamieszczony w repo (jest tworzony lokalnie przy uruchomieniu). 

## Frontend (katalog `public/`) 🖥️

- `public/index.html`
  - Publikuje prosty interfejs publiczny po polsku: lista postów, formularz dodawania postów, link do moderatora.
  - Ładuje `app.js`.

- `public/app.js`
  - Klient JS obsługujący:
    - Pobieranie i wyświetlanie listy postów (`GET /api/posts`).
    - Pokazywanie/ukrywanie sekcji komentarzy dla danego posta.
    - Pobieranie tylko zatwierdzonych komentarzy (`GET /api/posts/:id/comments`).
    - Formularz dodawania komentarza (`POST /api/posts/:id/comments`) — po wysłaniu informuje użytkownika, że komentarz będzie widoczny po zatwierdzeniu.
    - Proste zabezpieczenie przed XSS (funkcja `escapeHtml`).

- `public/moderator.html`
  - Prosty panel moderatora: pobiera komentarze oczekujące (`GET /api/comments/pending`) i pozwala zatwierdzić (`POST /api/comments/:id/approve`).
  - To prosty interfejs bez uwierzytelniania (do rozbudowy jako poprawka bezpieczeństwa).

## Dokumentacja i testy

- `opis.md`
  - Krótkie podsumowanie projektu, opis działania i instrukcja uruchomienia po polsku.

- `README.md`
  - Instrukcja uruchomienia, lista spełnionych wymagań i przykładowe polecenia curl.

- `tests.rest`
  - Zbiór przykładów żądań REST (poprawne i błędne scenariusze) do użycia np. z rozszerzeniem REST Client w VS Code.

## Jak pliki współdziałają (krótka sekwencja)
1. Uruchamiasz `npm start` → `index.js` uruchamia serwer.
2. Jeśli plik `lab03.db` nie istnieje, `index.js` wykonuje `init.sql` aby stworzyć tabele i dane startowe.
3. Przeglądarka żąda `http://localhost:3000/` → serwer zwraca `public/index.html`.
4. `index.html` ładuje `app.js`, który wywołuje API (`/api/posts`, `/api/posts/:id/comments`) aby pokazać dane.
5. Dodanie komentarza wysyła `POST /api/posts/:id/comments` (serwer zapisuje `approved=0`).
6. Moderator używa `moderator.html` aby zatwierdzić komentarze (`POST /api/comments/:id/approve`), przez co komentarz staje się widoczny w publicznym widoku.

