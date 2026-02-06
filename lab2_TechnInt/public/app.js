async function fetchProducts() {
  const res = await fetch('/api/products');
  return res.json();
}

async function fetchCart() {
  const res = await fetch('/api/cart');
  return res.json();
}

function toCurrency(v) { return v.toFixed(2) + ' zł'; }

async function renderProducts() {
  const products = await fetchProducts();
  const el = document.getElementById('products');
  el.innerHTML = '';
  products.forEach(p => {
    const d = document.createElement('div'); d.className = 'product';
    d.innerHTML = `<div><strong>${p.name}</strong><div>${toCurrency(p.price)}</div></div>`;
    const add = document.createElement('button'); add.textContent = 'Dodaj do koszyka';
    add.onclick = async () => {
      await fetch('/api/cart/add', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ product_id: p.id, qty: 1 }) });
      renderCart();
    };
    d.appendChild(add);
    el.appendChild(d);
  });
}

async function renderCart() {
  const data = await fetchCart();
  const el = document.getElementById('cart-contents');
  if (!data.items || data.items.length === 0) { el.innerHTML = '(pusty)'; return; }
  const ul = document.createElement('div');
  data.items.forEach(it => {
    const row = document.createElement('div');
    row.innerHTML = `${it.name} — ${toCurrency(it.price)} x <input type="number" min="1" value="${it.qty}" data-id="${it.product_id}" style="width:60px"> = ${toCurrency(it.line_total)} <button data-id="${it.product_id}">Usuń</button>`;
    ul.appendChild(row);
  });
  const total = document.createElement('div'); total.style.marginTop = '8px'; total.innerHTML = `<strong>Suma: ${toCurrency(data.total)}</strong>`;
  el.innerHTML = ''; el.appendChild(ul); el.appendChild(total);

  // attach events
  el.querySelectorAll('input[type=number]').forEach(inp => {
    inp.addEventListener('change', async () => {
      const id = Number(inp.dataset.id);
      const qty = Number(inp.value);
      if (qty <= 0) return; // simple
      await fetch('/api/cart/item', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ product_id: id, qty }) });
      renderCart();
    });
  });
  el.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      await fetch(`/api/cart/item/${id}`, { method: 'DELETE' });
      renderCart();
    });
  });
}

document.getElementById('checkout').addEventListener('click', async () => {
  const r = await fetch('/api/checkout', { method: 'POST' });
  if (r.status === 201) {
    const data = await r.json();
    document.getElementById('checkout-result').textContent = `Zamówienie utworzone: ID=${data.order_id}, suma=${data.total.toFixed(2)} zł`;
    renderCart();
  } else {
    const err = await r.json();
    alert('Błąd: ' + (err.error || JSON.stringify(err)));
  }
});

renderProducts();
renderCart();
