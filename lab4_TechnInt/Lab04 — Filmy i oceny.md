## Lab04 — Filmy i oceny (Movies)

**Cel:** Ranking filmów na podstawie głosów użytkowników.

### Wymagania funkcjonalne
1. **Filmy:**
   - Dodanie (`title`, `year`), lista.
2. **Oceny:**
   - Dodawanie oceny `score ∈ [1..5]` dla `movie_id`.
3. **Ranking:**
   - Zwracanie listy filmów z `avg_score` (średnia zaokrąglona do 2 miejsc) i `votes` (liczba głosów), posortowane malejąco po `avg_score`.

### Model danych
- `movies(id, title, year)`
- `ratings(id, movie_id→movies.id, score CHECK 1..5)`

### Kontrakt API
- `GET /api/movies` → każdy rekord z `avg_score`, `votes`.
- `POST /api/movies {title,year}` → `201`.
- `POST /api/ratings {movie_id,score}` → `201`.

### UI (minimum)
- Lista filmów z wyświetleniem średniej i liczby głosów.
- Formularz oceny.

### Akceptacja
- Dodanie oceny aktualizuje średnią i liczbę głosów bez restartu.
- Walidacja zakresu `score`.

### Bonusy
- Filtrowanie po roku.
- Top‑N (np. `/api/movies/top?limit=5`).

---
