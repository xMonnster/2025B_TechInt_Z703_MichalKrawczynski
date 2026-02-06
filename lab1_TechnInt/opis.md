# Opis projektu — Wypożyczalnia książek

Co zrobiłem:
- Utworzyłem prostą aplikację w JavaScript (Node.js + Express) oraz bazę SQLite.
- Dodałem skrypt inicjalizujący bazę: `db/init_db.js` (tworzy tabele i seeduje przykładowe dane).
- Zaimplementowałem API zgodne z wymaganiami labu (endpointy w `server.js`):
  - `GET /api/books`, `POST /api/books`
  - `GET /api/members`, `POST /api/members`
  - `GET /api/loans`, `POST /api/loans/borrow`, `POST /api/loans/return`
- Prosty front-end w `public/` (`index.html`, `app.js`) w języku polskim: lista książek, formularze dodawania, wypożyczanie i zwroty.

Kluczowe założenia i implementacja:
- Model danych (SQLite): `members(id,name,email UNIQUE)`, `books(id,title,author,copies)`, `loans(id,member_id,book_id,loan_date,due_date,return_date)`.
- Walidacja dostępności: przed dodaniem rekordu wypożyczenia sprawdzam liczbę aktywnych wypożyczeń (return_date IS NULL) i porównuję z `copies`. Jeśli brak dostępnych egzemplarzy, API zwraca HTTP 409 z komunikatem.
- Unikalność email: przy próbie dodania istniejącego email zwracany jest kod 409.
- Bezpieczeństwo minimalne: nagłówki `X-Content-Type-Options: nosniff` i `Referrer-Policy` ustawione globalnie.

Jak uruchomić (Windows):
1. Zainstaluj zależności:
```
cd "c:\techniki internetowe\lab 1"
npm install
```
2. Zainicjuj bazę (opcjonalne, serwer sam wywołuje init przy starcie):
```
npm run init-db
```
3. Uruchom serwer:
```
npm start
```
4. Otwórz przeglądarkę: `http://localhost:3000` .

