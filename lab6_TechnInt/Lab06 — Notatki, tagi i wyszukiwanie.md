## Lab06 — Notatki, tagi i wyszukiwanie (Notes)

**Cel:** Notatnik z tagowaniem i wyszukiwaniem pełnotekstowym (min. LIKE).

### Wymagania funkcjonalne
1. **Notatki:**
   - Dodawanie `title`, `body`, znacznik `created_at`.
   - Lista z możliwością wyszukiwania `q` po tytule lub treści.
2. **Tagi:**
   - Słownik tagów; przypisywanie tagów do notatki (wiele do wielu).

### Model danych
- `notes(id, title, body, created_at)`
- `tags(id, name UNIQUE)`
- `note_tags(note_id→notes.id, tag_id→tags.id, PK(note_id,tag_id))`

### Kontrakt API
- `GET /api/notes?q=...` — filtruje `title`/`body` (LIKE lub FTS5 jeśli potrafisz).
- `POST /api/notes {title,body}` → `201`.
- `GET /api/tags` → lista wszystkich tagów.
- `POST /api/notes/{id}/tags {tags:["work","home"]}` → tworzy brakujące tagi i linki.

### UI (minimum)
- Pole „Szukaj…”, lista wyników (tytuł + fragment treści).
- Formularz dodania notatki i przypisania tagów.

### Akceptacja
- Wyszukiwanie zwraca poprawne rekordy dla fraz w tytule i treści.
- Tag może być przypisany tylko raz do danej notatki (unikalność relacji).

### Bonusy
- Filtrowanie po tagach (`/api/notes?tag=work`).
- Podświetlanie fraz w wynikach.

---
