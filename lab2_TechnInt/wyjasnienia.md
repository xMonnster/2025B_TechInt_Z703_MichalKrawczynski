# Wyjaśnienia plików projektu — Lab02 (Prosty sklep)

Poniżej krótkie i zwięzłe wyjaśnienie co robi każdy ważny plik w projekcie.

- `server.js`
  - Główny serwer Express. Definiuje wszystkie endpointy API:
    - `GET /api/products`, `POST /api/products` — produkty (CRUD podstawowy).
    - `GET /api/cart`, `POST /api/cart/add`, `PATCH /api/cart/item`, `DELETE /api/cart/item/:id` — operacje na koszyku (koszyk przechowywany w pamięci procesu).
    - `POST /api/checkout` — finalizacja zamówienia: zapisuje `orders` i `order_items` w SQLite, używa snapshotu ceny, czyści koszyk, zwraca `201` + `Location`.
  - Ustawia też nagłówki bezpieczeństwa (helmet) i prosty logger żądań.
  - Obsługuje podstawowe kody statusu (400, 404, 201, 204, 500).

- `db.js`
  - Inicjalizacja bazy SQLite (`shop.db`). Tworzy tabele jeśli nie istnieją:
    - `products(id, name, price)`
    - `orders(id, created_at)`
    - `order_items(id, order_id, product_id, qty, price)` — `price` jest snapshotem ceny z momentu zamówienia.
  - Zawiera prosty seed (kilka przykładowych produktów).

- `public/index.html`
  - Minimalny frontend: lista produktów i panel koszyka oraz przycisk „Zamów”.
  - Plik statyczny serwowany przez Express.

- `public/app.js`
  - Logika klienta (fetch + DOM): pobiera `/api/products`, pokazuje listę, wysyła żądania do `/api/cart` i `/api/checkout`.
  - Obsługuje dodawanie, edycję ilości i usuwanie pozycji oraz wyświetlanie sumy.

- `package.json`
  - Zależności projektu (`express`, `helmet`, `sqlite3`, `body-parser`) oraz skrypty (`npm start`).

- `README.md`
  - Instrukcja uruchomienia i krótki opis dostępnych endpointów oraz sposobu działania aplikacji.

- `opis.md`
  - Dokumentacja wykonanej pracy: czego dotyczy projekt, jakie założenia przyjęto i jakie ograniczenia (np. koszyk w pamięci procesu).

- `tests.rest`
  - Kolekcja przykładowych żądań (REST) do przetestowania API: tworzenie produktów, operacje na koszyku, checkout, scenariusze negatywne.
  - Można użyć rozszerzenia REST Client w VS Code albo przetestować ręcznie za pomocą curl.

- `shop.db` (plik generowany)
  - SQLite DB utworzona przy pierwszym uruchomieniu serwera. Zawiera tabele i seed.

Jak testować lokalnie (szybko):
1. `npm install`
2. `npm start`
3. Otwórz `http://localhost:3000` w przeglądarce, lub użyj `tests.rest` do sprawdzenia API.

Uwagi:
- Koszyk jest prosty (Map w pamięci). Po restarcie serwera koszyk się resetuje.
- Checkout zapisuje snapshot ceny w `order_items`, więc późniejsze zmiany ceny produktu nie wpływają na już złożone zamówienia.

