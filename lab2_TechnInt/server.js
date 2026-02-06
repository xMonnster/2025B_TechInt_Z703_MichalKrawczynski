const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { db, init } = require('./db');

const app = express();
init();

app.use(helmet({ contentSecurityPolicy: false }));
app.use((req, res, next) => {
  // Minimal security headers beyond helmet
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
app.use(bodyParser.json());
app.use(express.static('public'));

// Simple request logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// In-memory cart (simple, per server)
const cart = new Map(); // productId -> qty

// --- Products ---
app.get('/api/products', (req, res) => {
  db.all('SELECT id, name, price FROM products', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

app.post('/api/products', (req, res) => {
  const { name, price } = req.body;
  if (!name || price == null || isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ error: 'Nieprawidłowe dane produktu' });
  }
  db.run('INSERT INTO products(name, price) VALUES (?, ?)', [name, Number(price)], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.status(201).location(`/api/products/${this.lastID}`).json({ id: this.lastID, name, price: Number(price) });
  });
});

// --- Cart ---
app.get('/api/cart', (req, res) => {
  const items = [];
  const ids = Array.from(cart.keys());
  if (ids.length === 0) return res.json({ items: [], total: 0 });
  const placeholders = ids.map(() => '?').join(',');
  db.all(`SELECT id,name,price FROM products WHERE id IN (${placeholders})`, ids, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    let total = 0;
    rows.forEach(r => {
      const qty = cart.get(r.id) || 0;
      const line = { product_id: r.id, name: r.name, price: r.price, qty };
      line.line_total = Number((r.price * qty).toFixed(2));
      total += line.line_total;
      items.push(line);
    });
    res.json({ items, total: Number(total.toFixed(2)) });
  });
});

app.post('/api/cart/add', (req, res) => {
  const { product_id, qty } = req.body;
  const q = Number(qty);
  if (!product_id || isNaN(q) || q <= 0) return res.status(400).json({ error: 'Nieprawidłowa ilość' });
  db.get('SELECT id FROM products WHERE id = ?', [product_id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'Produkt nie znaleziony' });
    const prev = cart.get(product_id) || 0;
    cart.set(product_id, prev + q);
    res.status(200).json({ product_id, qty: cart.get(product_id) });
  });
});

app.patch('/api/cart/item', (req, res) => {
  const { product_id, qty } = req.body;
  const q = Number(qty);
  if (!product_id || isNaN(q) || q <= 0) return res.status(400).json({ error: 'Nieprawidłowa ilość' });
  if (!cart.has(product_id)) return res.status(404).json({ error: 'Pozycja w koszyku nie znaleziona' });
  cart.set(product_id, q);
  res.json({ product_id, qty: q });
});

app.delete('/api/cart/item/:product_id', (req, res) => {
  const id = Number(req.params.product_id);
  if (!cart.has(id)) return res.status(404).json({ error: 'Pozycja w koszyku nie znaleziona' });
  cart.delete(id);
  res.status(204).send();
});

// --- Checkout ---
app.post('/api/checkout', (req, res) => {
  const ids = Array.from(cart.keys());
  if (ids.length === 0) return res.status(400).json({ error: 'Koszyk jest pusty' });

  // fetch current prices and compute total; ensure products exist
  const placeholders = ids.map(() => '?').join(',');
  db.all(`SELECT id, price FROM products WHERE id IN (${placeholders})`, ids, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (rows.length !== ids.length) return res.status(400).json({ error: 'Niektóre produkty nie istnieją' });

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      db.run('INSERT INTO orders DEFAULT VALUES', function (err) {
        if (err) { db.run('ROLLBACK'); return res.status(500).json({ error: 'DB error' }); }
        const orderId = this.lastID;
        const insertStmt = db.prepare('INSERT INTO order_items(order_id, product_id, qty, price) VALUES (?, ?, ?, ?)');
        let total = 0;
        for (const r of rows) {
          const q = cart.get(r.id);
          const price = r.price;
          insertStmt.run(orderId, r.id, q, price);
          total += q * price;
        }
        insertStmt.finalize(err2 => {
          if (err2) { db.run('ROLLBACK'); return res.status(500).json({ error: 'DB error' }); }
          db.run('COMMIT');
          cart.clear();
          res.status(201).location(`/api/orders/${orderId}`).json({ order_id: orderId, total: Number(total.toFixed(2)) });
        });
      });
    });
  });
});

// --- Orders (basic) ---
app.get('/api/orders/:id', (req, res) => {
  const id = Number(req.params.id);
  db.get('SELECT id, created_at FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!order) return res.status(404).json({ error: 'Zamówienie nie znalezione' });
    db.all('SELECT product_id, qty, price FROM order_items WHERE order_id = ?', [id], (err2, items) => {
      if (err2) return res.status(500).json({ error: 'DB error' });
      const total = items.reduce((s, it) => s + it.qty * it.price, 0);
      res.json({ order, items, total: Number(total.toFixed(2)) });
    });
  });
});

// Fallback / error handling
app.use((req, res) => res.status(404).json({ error: 'Nie znaleziono' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
