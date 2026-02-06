## Lab03 — Blog  komentarze z moderacją (Blog)

**Cel:** Blog z dodawaniem komentarzy i ręczną moderacją (approve).

### Wymagania funkcjonalne
1. **Posty:**
   - Dodawanie (`title`, `body`), lista, szczegóły.
2. **Komentarze:**
   - Dodawanie do posta (`author`, `body`), domyślnie `approved=0`.
   - Moderacja: endpoint, który ustawia `approved=1`.
   - Widok publiczny pokazuje tylko `approved=1`.

### Model danych
- `posts(id, title, body, created_at)`
- `comments(id, post_id→posts.id, author, body, created_at, approved DEFAULT 0)`

### Kontrakt API
- `GET /api/posts` | `POST /api/posts`.
- `GET /api/posts/{id}/comments` — **tylko** zatwierdzone.
- `POST /api/posts/{id}/comments {author,body}` → `201 {approved:0}`.
- `POST /api/comments/{id}/approve` → `200`.

### UI (minimum)
- Lista postów z przyciskiem „Komentarze”.
- Formularz dodania komentarza.
- Panel moderatora (może być prosty: lista oczekujących z przyciskiem „Zatwierdź”).

### Akceptacja
- Nowy komentarz **nie** jest widoczny, dopóki nie zostanie zatwierdzony.
- Zatwierdzony komentarz natychmiast widoczny w widoku publicznym.

### Bonusy
- Paginacja komentarzy.
- Prosty anty‑spam (limit na IP / treść).

---
