async function fetchJson(url, opts){
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

async function loadPosts(){
  const posts = await fetchJson('/api/posts');
  const el = document.getElementById('posts');
  el.innerHTML = '';
  for (const p of posts){
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `<h3>${escapeHtml(p.title)}</h3><div>${escapeHtml(p.body)}</div><div class='minor'>${p.created_at}</div><button data-id='${p.id}'>Komentarze</button><div class='comments' id='c-${p.id}'></div>`;
    el.appendChild(div);
    div.querySelector('button').addEventListener('click', ()=> toggleComments(p.id));
  }
}

function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

async function toggleComments(postId){
  const node = document.getElementById('c-'+postId);
  if (node.innerHTML) { node.innerHTML = ''; return; }
  const comments = await fetchJson(`/api/posts/${postId}/comments`);
  node.innerHTML = comments.map(c=>`<div><b>${escapeHtml(c.author)}</b> (${c.created_at}):<div>${escapeHtml(c.body)}</div></div>`).join('<hr>') || '<div>Brak zatwierdzonych komentarzy.</div>';
  // form
  const form = document.createElement('form');
  form.innerHTML = `<h4>Dodaj komentarz</h4><input name='author' placeholder='Imię' required><br><textarea name='body' placeholder='Komentarz' required rows='3' style='width:100%'></textarea><br><button>Wyślij</button>`;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const payload = { author: fd.get('author'), body: fd.get('body') };
    try{
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
      });
      if (res.status===201){ alert('Komentarz dodany; będzie widoczny po zatwierdzeniu przez moderatora.'); form.reset(); }
      else { const json = await res.json(); alert('Błąd: '+ (json.error||res.status)); }
    }catch(err){ alert('Błąd: '+err.message); }
  });
  node.appendChild(document.createElement('hr'));
  node.appendChild(form);
}

// add post
document.getElementById('postForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const body = document.getElementById('body').value.trim();
  if (!title||!body) return alert('Tytuł i treść są wymagane');
  const res = await fetch('/api/posts', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title,body})});
  if (res.status===201){ document.getElementById('title').value=''; document.getElementById('body').value=''; loadPosts(); }
  else { const j = await res.json(); alert('Błąd: '+(j.error||res.status)); }
});

loadPosts();