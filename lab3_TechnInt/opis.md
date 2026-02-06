# Opis (lab03 — Blog z moderacją)

Wykonałem prostą aplikację blogową napisaną w Node.js z użyciem Express i bazy SQLite.

Co zawiera projekt:
- `index.js` — prosty serwer HTTP (Express) z API zgodnym z wymaganiami labu.
- `init.sql` — skrypt tworzący tabele `posts` i `comments` oraz przykładowe dane.
- `lab03.db` — plik bazy (utworzony przy pierwszym uruchomieniu serwera).
- `public/` — prosty frontend po polsku (`index.html`, `moderator.html`, `app.js`).
- `opis.md` — ten plik.

Krótki opis działania:
- Posty można tworzyć przez `POST /api/posts` (w UI formularz w `index.html`).
- Komentarze do posta tworzone są przez `POST /api/posts/:id/comments` i domyślnie mają `approved=0` (nie widoczne publicznie).
- Moderator ma stronę `moderator.html`, która pobiera komentarze oczekujące (`GET /api/comments/pending`) i pozwala zatwierdzić (`POST /api/comments/:id/approve`).
- Publiczny widok komentarzy (`GET /api/posts/:id/comments`) zwraca tylko zatwierdzone komentarze (`approved=1`).

Uwagi implementacyjne:
- Proste walidacje (`400` jeśli brakuje pól), `404` gdy post/komentarz nie istnieje, `409` gdy próba zatwierdzenia już zatwierdzonego komentarza.
- Nagłówki bezpieczeństwa: `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy`.


Instrukcja uruchomienia (skrót):
1. Zainstaluj zależności: `npm install`
2. Uruchom serwer: `npm start`
3. Otwórz: `http://localhost:3000/` (widok publiczny) lub `http://localhost:3000/moderator.html` (panel moderatora)


