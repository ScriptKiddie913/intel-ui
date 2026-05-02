async function postQuery(q){
  const res = await fetch('/api/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})});
  return res.json();
}

function appendChat(text, cls='user'){
  const chat = document.getElementById('chat');
  const d = document.createElement('div'); d.className = 'msg '+cls; d.textContent = text; chat.appendChild(d); chat.scrollTop = chat.scrollHeight;
}

function renderResults(data){
  const out = document.getElementById('results'); out.innerHTML='';
  if(data.telegram && data.telegram.error){
    out.innerHTML = `<div class="card">Error: ${data.telegram.error}</div>`; return;
  }
  const meta = document.createElement('div'); meta.className='card'; meta.innerHTML = `<strong>Keypoints:</strong> ${data.keypoints.join(', ')}<br><strong>Search:</strong> ${data.search_query}`;
  out.appendChild(meta);

  const msgs = (data.telegram && data.telegram.messages) || [];
  if(msgs.length===0){ out.innerHTML += `<div class="card">No messages found.</div>`; return; }
  msgs.forEach(m=>{
    const c = document.createElement('div'); c.className='card';
    let html = `<div>${m.text.replace(/\n/g,'<br>')}</div>`;
    if(m.link) html += `<div style="margin-top:8px"><a href="${m.link}" target="_blank">Open on Telegram</a></div>`;
    c.innerHTML = html; out.appendChild(c);
  })
}

document.getElementById('send').addEventListener('click', async ()=>{
  const inp = document.getElementById('inp'); const q = inp.value.trim(); if(!q) return;
  appendChat(q,'user');
  appendChat('Searching...', 'bot');
  const res = await postQuery(q);
  // remove the last 'Searching...' message
  const chat = document.getElementById('chat'); chat.removeChild(chat.lastChild);
  appendChat('Results ready', 'bot');
  renderResults(res);
});
