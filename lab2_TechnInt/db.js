const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, 'shop.db');

const db = new sqlite3.Database(DB_PATH);

function init() {
  const createProducts = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price NUMERIC NOT NULL CHECK(price >= 0)
    );
  `;
  const createOrders = `
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const createOrderItems = `
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      qty INTEGER NOT NULL CHECK(qty > 0),
      price NUMERIC NOT NULL
    );
  `;

  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON;');
    db.run(createProducts);
    db.run(createOrders);
    db.run(createOrderItems);

    // seed if empty
    db.get('SELECT COUNT(1) as cnt FROM products', (err, row) => {
      if (err) return console.error('DB seed check error', err);
      if (row.cnt === 0) {
        const stmt = db.prepare('INSERT INTO products(name, price) VALUES (?, ?)');
        stmt.run('Klawiatura', 129.99);
        stmt.run('Mysz', 79.90);
        stmt.run('Monitor', 899.00);
        stmt.finalize();
        console.log('Seeded products');
      }
    });
  });
}

module.exports = { db, init };
