async function api(path, opts) {
  const res = await fetch(path, Object.assign({headers:{'Content-Type':'application/json'}}, opts));
  if (!res.ok) {
    const err = await res.json().catch(()=>({error:res.statusText}));
    throw err;
  }
  return res.json().catch(()=>null);
}

async function load() {
  await loadBooks();
  await loadMembers();
  await loadLoans();
}

async function loadBooks() {
  const books = await api('/api/books');
  const container = document.getElementById('books');
  container.innerHTML = '';
  const sel = document.getElementById('loan_book');
  sel.innerHTML = '';
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Tytuł</th><th>Autor</th><th>Dostępne</th><th></th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  books.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${b.title}</td><td>${b.author}</td><td>${b.available}/${b.copies}</td><td><button data-id="${b.id}">Wypożycz</button></td>`;
    tbody.appendChild(tr);
    const opt = document.createElement('option'); opt.value = b.id; opt.text = b.title + ' ('+b.available+' dostępne)'; sel.appendChild(opt);
  });
  table.appendChild(tbody);
  container.appendChild(table);
  container.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', async ()=>{
      const book_id = btn.getAttribute('data-id');
      const member_id = document.getElementById('loan_member').value;
      if (!member_id) return alert('Wybierz członka');
      try{
        await api('/api/loans/borrow',{method:'POST',body:JSON.stringify({member_id,book_id})});
        await load();
        alert('Wypożyczono');
      }catch(e){alert(e.error || JSON.stringify(e))}
    });
  });
}

async function loadMembers() {
  const members = await api('/api/members');
  const container = document.getElementById('members');
  container.innerHTML = '';
  const sel = document.getElementById('loan_member');
  sel.innerHTML = '<option value="">-- wybierz --</option>';
  members.forEach(m=>{
    const div = document.createElement('div'); div.textContent = `${m.name} <${m.email}>`;
    container.appendChild(div);
    const opt = document.createElement('option'); opt.value = m.id; opt.text = m.name; sel.appendChild(opt);
  });
}

async function loadLoans() {
  const loans = await api('/api/loans');
  const container = document.getElementById('loans');
  container.innerHTML = '';
  const table = document.createElement('table');
  table.innerHTML = '<thead><tr><th>Członek</th><th>Książka</th><th>Data</th><th>Termin</th><th>Zwrot</th><th></th></tr></thead>';
  const tbody = document.createElement('tbody');
  loans.forEach(l=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${l.member_name}</td><td>${l.book_title}</td><td>${l.loan_date?l.loan_date.split('T')[0]:''}</td><td>${l.due_date?l.due_date.split('T')[0]:''}</td><td>${l.return_date?l.return_date.split('T')[0]:'-'}</td><td>${l.return_date? '': `<button data-return="${l.id}">Zwróć</button>`}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
  container.querySelectorAll('button[data-return]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const loan_id = btn.getAttribute('data-return');
      try{
        await api('/api/loans/return',{method:'POST',body:JSON.stringify({loan_id})});
        await load();
        alert('Zwrócono');
      }catch(e){alert(e.error || JSON.stringify(e))}
    });
  });
}

document.getElementById('addBook').addEventListener('click', async ()=>{
  const title = document.getElementById('b_title').value;
  const author = document.getElementById('b_author').value;
  const copies = parseInt(document.getElementById('b_copies').value || '1',10);
  try{ await api('/api/books',{method:'POST',body:JSON.stringify({title,author,copies})}); await load(); alert('Dodano książkę')}catch(e){alert(e.error||JSON.stringify(e))}
});

document.getElementById('addMember').addEventListener('click', async ()=>{
  const name = document.getElementById('m_name').value;
  const email = document.getElementById('m_email').value;
  try{ await api('/api/members',{method:'POST',body:JSON.stringify({name,email})}); await load(); alert('Dodano członka')}catch(e){alert(e.error||JSON.stringify(e))}
});

document.getElementById('borrow').addEventListener('click', async ()=>{
  const member_id = document.getElementById('loan_member').value;
  const book_id = document.getElementById('loan_book').value;
  if(!member_id || !book_id) return alert('Wybierz członka i książkę');
  try{ await api('/api/loans/borrow',{method:'POST',body:JSON.stringify({member_id,book_id})}); await load(); alert('Wypożyczono')}catch(e){alert(e.error||JSON.stringify(e))}
});

load().catch(e=>console.error(e));
