const $ = (id) => document.getElementById(id);
const search = $('search');
const results = $('results');
const noteForm = $('noteForm');
const titleIn = $('title');
const bodyIn = $('body');
const tagsIn = $('tags');
const tagsList = $('tagsList');

let lastQuery = '';
let currentTagFilter = '';

async function fetchNotes(q = '', tag = '') {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (tag) params.set('tag', tag);
  const res = await fetch('/api/notes?' + params.toString());
  return res.json();
}

function highlight(text, q) {
  if (!q) return escapeHtml(text);
  const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(safeQ, 'gi');
  return escapeHtml(text).replace(re, (m) => `<mark>${m}</mark>`);
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderNotes(list) {
  results.innerHTML = '';
  if (!list.length) { results.innerHTML = '<p>Brak notatek.</p>'; return; }
  for (const n of list) {
    const el = document.createElement('div'); el.className = 'note';
    const t = document.createElement('h3'); t.innerHTML = highlight(n.title, lastQuery);
    const dt = document.createElement('div'); dt.style.fontSize='0.9em'; dt.style.color='#666'; dt.textContent = n.created_at;
    const b = document.createElement('p'); b.innerHTML = highlight(snippet(n.body, lastQuery), lastQuery);
    el.appendChild(t); el.appendChild(dt); el.appendChild(b);
    if (n.tags && n.tags.length) {
      const tagwrap = document.createElement('div'); tagwrap.className='tags';
      for (const tg of n.tags) {
        const tspan = document.createElement('span'); tspan.className='tag'; tspan.textContent = tg; tspan.onclick = () => { currentTagFilter = tg; reload(); };
        tagwrap.appendChild(tspan);
      }
      el.appendChild(tagwrap);
    }
    results.appendChild(el);
  }
}

function snippet(text, q) {
  if (!q) return text.length > 200 ? text.slice(0,200) + '…' : text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text.slice(0,200) + (text.length>200 ? '…' : '');
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + q.length + 40);
  return (start ? '…' : '') + text.slice(start,end) + (end < text.length ? '…' : '');
}

async function reload() {
  const q = lastQuery;
  const tag = currentTagFilter;
  const notes = await fetchNotes(q, tag);
  renderNotes(notes);
  await renderTagBar();
}

search.addEventListener('input', (e) => {
  lastQuery = e.target.value;
  currentTagFilter = '';
  reload();
});

noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleIn.value.trim();
  const body = bodyIn.value.trim();
  const tags = tagsIn.value.split(',').map(s=>s.trim()).filter(Boolean);
  if (!title || !body) { alert('Tytuł i treść są wymagane'); return; }
  const created = await fetch('/api/notes', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title, body})});
  if (!created.ok) { alert('Błąd dodawania notatki'); return; }
  const data = await created.json();
  const id = data.id;
  if (tags.length) {
    await fetch(`/api/notes/${id}/tags`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({tags})});
  }
  titleIn.value=''; bodyIn.value=''; tagsIn.value='';
  lastQuery=''; search.value=''; currentTagFilter='';
  reload();
});

async function renderTagBar() {
  const res = await fetch('/api/tags');
  const all = await res.json();
  tagsList.innerHTML = '';
  if (!all.length) { tagsList.textContent = 'Brak tagów.'; return; }
  const label = document.createElement('div'); label.textContent = 'Filtruj po tagu:'; tagsList.appendChild(label);
  for (const t of all) {
    const btn = document.createElement('button'); btn.className='tag'; btn.textContent = t.name;
    btn.onclick = () => { currentTagFilter = t.name; reload(); };
    tagsList.appendChild(btn);
  }
  const clear = document.createElement('button'); clear.textContent = 'Wyczyść filtr'; clear.onclick = () => { currentTagFilter=''; reload(); };
  tagsList.appendChild(clear);
}

// initial load
reload();