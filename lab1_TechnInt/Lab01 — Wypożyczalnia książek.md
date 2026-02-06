## Lab01 — Wypożyczalnia książek (Library)

**Cel:** Zaimplementować system wypożyczalni z kontrolą dostępności egzemplarzy.

### Kontekst
Mała biblioteka uczelniana prowadzi listę czytelników, książek oraz wypożyczeń. Nie dopuszczamy wypożyczenia, jeśli brak wolnych egzemplarzy.

### Wymagania funkcjonalne
1. **Użytkownicy (Members):**
   - Dodanie członka: `name`, `email` (unikalny).
   - Lista członków, podgląd szczegółów.
2. **Książki (Books):**
   - Dodanie książki: `title`, `author`, `copies` (liczba egzemplarzy, domyślnie 1).
   - Lista książek z informacją o liczbie dostępnych egzemplarzy.
3. **Wypożyczenia (Loans):**
   - Wypożycz: `member_id`, `book_id`, `loan_date` (dzisiejsza), `due_date` (domyślnie +14 dni).
   - Zwrot: ustaw `return_date`.
   - **Walidacja dostępności:** liczba **aktywnych** wypożyczeń danej książki < `copies`.

### Minimalny model danych
- `members(id, name, email UNIQUE)`
- `books(id, title, author, copies)`
- `loans(id, member_id→members.id, book_id→books.id, loan_date, due_date, return_date NULL)`

### Kontrakt API (przykładowy)
- `GET /api/members` — lista.
- `POST /api/members {name,email}` → `201` + `Location`.
- `GET /api/books` — lista z `available` (wyliczane lub zapytaniem).
- `POST /api/books {title,author,copies}` → `201`.
- `GET /api/loans` — lista (z joinami: tytuł, czytelnik, daty).
- `POST /api/loans/borrow {member_id,book_id,days?}` → `201` lub `409 no copies`.
- `POST /api/loans/return {loan_id}` → `200/409` (jeśli już zwrócono).

### Wymagania UI (minimum)
- Widok książek z liczbą dostępnych sztuk; przycisk „Wypożycz”.
- Formularz dodawania czytelnika i książki.
- Widok aktywnych wypożyczeń i zwrot.

### Kryteria akceptacji (testy)
- Nie można wypożyczyć, gdy `active_loans >= copies` (oczekiwany `409`).
- Dodanie/zwrot aktualizuje liczby bez restartu aplikacji.
- Email członka jest unikalny (drugi insert → `409/400`).

### Bonusy
- Paginacja i filtrowanie: `GET /api/books?author=...`.
- Kary za przetrzymanie (raport „overdue”).

---
