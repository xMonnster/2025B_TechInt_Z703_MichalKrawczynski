# Specyfikacja zadań — Technologie Internetowe 

Poniższe opisy są **specyfikacjami do samodzielnej implementacji**. Każdy lab zawiera: kontekst, wymagania funkcjonalne, wymagania niefunkcjonalne, minimalny model danych, kontrakt API (jeśli dotyczy), wymagania UI, kryteria akceptacji (testy) oraz zadania rozszerzające (bonusy). Studenci mogą używać dowolnego stosu (Node/Express, .NET, Python/Flask, itp.), o ile spełnią kontrakt oraz kryteria. Dla uproszczenia zakładaj bazę plikową/SQLite lub MSSQL — wybór należy do zespołu.

## Wymagania niefunkcjonalne (dla wszystkich labów)
- **Walidacja danych** po stronie backendu (statusy: `400/401/403/404/409/422/500` w zależności od sytuacji).
- **Bezpieczeństwo:** minimalnie `X-Content-Type-Options: nosniff`, rozważ CSP i `Referrer-Policy`.
- **HTTP**: poprawne `Content-Type`, `Location` przy `201 Created`, sensowne `Cache-Control`.
- **Jakość:** proste logowanie żądań; rozsądna struktura plików; czytelny README z instrukcją uruchomienia.

## Kryteria oceny (rubryka)
- **Kompletność funkcjonalna (40%)** — wszystkie endpointy/UI zadziałały zgodnie ze specyfikacją.
- **Jakość API i walidacja (20%)** — kody statusów, komunikaty błędów, kontrakt.
- **Model danych i spójność (20%)** — klucze, integralność, indeksy (gdzie zasadne).
- **Front‑end (10%)** — dostępność podstawowa, UX minimalny, brak błędów JS.
- **Dokumentacja (10%)** — README, instrukcja uruchomienia, przykładowe żądania.

## Oddanie
- Repo z kodem + `README.md` (jak uruchomić).
- Zrzuty ekranu „happy path” (min. 3 na lab).
- Plik `tests.rest` lub kolekcja Postman/Insomnia (opcjonalnie) z przykładami wywołań.

---
