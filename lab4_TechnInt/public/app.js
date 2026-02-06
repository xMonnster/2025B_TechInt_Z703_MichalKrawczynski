async function fetchMovies() {
  const res = await fetch('/api/movies');
  return res.json();
}

function renderMovies(movies) {
  const tbody = document.querySelector('#movies-table tbody');
  tbody.innerHTML = '';
  const select = document.querySelector('#rating-form select[name="movie_id"]');
  select.innerHTML = '';
  movies.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${m.title}</td><td>${m.year}</td><td>${m.avg_score.toFixed(2)}</td><td>${m.votes}</td>`;
    tbody.appendChild(tr);

    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.title} (${m.year})`;
    select.appendChild(opt);
  });
}

async function refresh() {
  const movies = await fetchMovies();
  renderMovies(movies);
}

document.getElementById('movie-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = { title: form.title.value.trim(), year: form.year.value };
  const res = await fetch('/api/movies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (res.status === 201) { form.reset(); await refresh(); alert('Film dodany'); }
  else { const err = await res.json(); alert('Błąd: ' + (err.error || res.status)); }
});

document.getElementById('rating-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = { movie_id: parseInt(form.movie_id.value, 10), score: parseInt(form.score.value, 10) };
  const res = await fetch('/api/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (res.status === 201) { await refresh(); alert('Ocena dodana'); }
  else { const err = await res.json(); alert('Błąd: ' + (err.error || res.status)); }
});

// start
refresh();