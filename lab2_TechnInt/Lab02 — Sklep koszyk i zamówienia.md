## Lab02 — Sklep: koszyk i zamówienia (Shop)

**Cel:** Zaimplementować prosty koszyk i finalizację zamówienia z zapisem do bazy.

### Wymagania funkcjonalne
1. **Produkty:**
   - CRUD produktów (`name`, `price >= 0`). Lista do wyboru.
2. **Koszyk:**
   - Dodawanie pozycji (`product_id`, `qty>=1`), odczyt zawartości, usuwanie/zmiana ilości.
3. **Zamówienie:**
   - Utworzenie zamówienia z pozycji koszyka, zapis do DB: `orders`, `order_items` (snapshot ceny). Wyliczenie sumy.

### Minimalny model danych
- `products(id, name, price CHECK >=0)`
- `orders(id, created_at)`
- `order_items(id, order_id→orders.id, product_id→products.id, qty, price)`

### Kontrakt API
- `GET /api/products` | `POST /api/products`.
- `GET /api/cart` | `POST /api/cart/add {product_id,qty}` | `PATCH /api/cart/item {product_id,qty}` | `DELETE /api/cart/item/{product_id}`.
- `POST /api/checkout` → `201 {order_id,total}`.

### UI (minimum)
- Lista produktów z przyciskiem „Dodaj do koszyka”.
- Podgląd koszyka, możliwość modyfikacji ilości, przycisk „Zamów”.

### Akceptacja
- Po checkout koszyk jest pusty; w DB pojawia się `orders` + `order_items` z poprawnymi kwotami.
- Walidacja `qty>0`; cena pozycji = „snapshot” (nie liczyć z bieżącej ceny po zmianie w produktach).

### Bonusy
- Kupony rabatowe (np. `-10%`), walidacja i raport sumy.
- Historia zamówień.

---
