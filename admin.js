const CFG=window.PJJ_CONFIG||{}, BASE_CONTENT=window.PJJ_CONTENT||{};
const KEY='pjj-admin-state-v2';
const imageBlobs=new Map();
let heroImageBlob=null;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

function clone(v){return JSON.parse(JSON.stringify(v))}
let state=(()=>{
  try{const s=localStorage.getItem(KEY);return s?JSON.parse(s):{config:clone(CFG),content:clone(BASE_CONTENT)}}catch{return{config:clone(CFG),content:clone(BASE_CONTENT)}}
})();

function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function toast(t){document.querySelector('.toast')?.remove();const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2200)}
function slug(v){return String(v||'projeto').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55)||'projeto'}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

const loginScreen=$('#loginScreen'), app=$('#app');
function unlock(){loginScreen.hidden=true;app.hidden=false;hydrate();renderProjects();updateOverview();setupAnalytics()}
$('#loginForm').addEventListener('submit',e=>{
  e.preventDefault();
  const pass=$('#passwordInput').value;
  const expected=CFG.panel?.password||'';
  if(pass===expected){sessionStorage.setItem('pjj_panel_ok','1');unlock()}
  else $('#loginError').textContent='Senha incorreta.';
});
if(sessionStorage.getItem('pjj_panel_ok')==='1') unlock();
$('#logoutBtn')?.addEventListener('click',()=>{sessionStorage.removeItem('pjj_panel_ok');location.reload()});

$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>openTab(b.dataset.tab)));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>openTab(b.dataset.go)));
function openTab(name){
  $$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
  $$('.tab').forEach(t=>t.classList.toggle('active',t.id==='tab-'+name));
  if(name==='analytics') loadAnalytics();
}

function hydrate(){
  const c=state.config.company||{}, p=state.config.panel||{}, ct=state.content||{};
  $('#instagram').value=c.instagram||'';$('#whatsapp').value=c.whatsapp||'';$('#email').value=c.email||'';
  $('#location').value=c.location||'';$('#whatsappMessage').value=c.whatsappMessage||'';
  $('#panelPassword').value=p.password||'';$('#heroText').value=ct.heroText||'';$('#aboutLead').value=ct.aboutLead||'';renderHeroPreview();
}
function syncContent(){
  state.config.company=state.config.company||{};state.config.panel=state.config.panel||{};
  Object.assign(state.config.company,{
    instagram:$('#instagram').value.trim(),whatsapp:$('#whatsapp').value.replace(/\D/g,''),
    email:$('#email').value.trim(),location:$('#location').value.trim(),
    whatsappMessage:$('#whatsappMessage').value.trim()
  });
  state.config.panel.password=$('#panelPassword').value;
  state.content.heroText=$('#heroText').value.trim();
  state.content.aboutLead=$('#aboutLead').value.trim();
  save();updateOverview();toast('Alterações salvas no navegador.');
}
$('#saveContent').addEventListener('click',syncContent);

$('#heroImageInput')?.addEventListener('change',async e=>{
  const f=e.target.files?.[0]; if(!f)return;
  if(!f.type.startsWith('image/')) return toast('Escolha uma imagem.');
  toast('Preparando imagem do topo…');
  heroImageBlob=await compressImage(f,2200,.86);
  state.content.heroImage='assets/site/hero.jpg';
  if(state.content._heroPreview) URL.revokeObjectURL(state.content._heroPreview);
  state.content._heroPreview=URL.createObjectURL(heroImageBlob);
  save();renderHeroPreview();toast('Imagem do topo adicionada.');
});
$('#removeHeroImage')?.addEventListener('click',()=>{
  heroImageBlob=null;
  state.content.heroImage='';
  state.content._heroPreview='';
  save();renderHeroPreview();
});



function renderHeroPreview(){
  const box=$('#heroImagePreview'); if(!box)return;
  const src=state.content._heroPreview||state.content.heroImage||'';
  box.innerHTML=src?`<img src="${esc(src)}" alt="">`:'<span>Sem imagem</span>';
}

function updateOverview(){
  $('#statProjects').textContent=(state.content.portfolio||[]).length;
  $('#statWhats').textContent=state.config.company?.whatsapp?'OK':'—';
  const a=state.config.analytics||{};
  $('#statAnalytics').textContent=a.enabled?'ON':'OFF';
  $('#statAnalyticsSub').textContent=a.enabled?'Configurado':'Não configurado';
}

function compressImage(file,maxW=1800,q=.84){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();r.onerror=reject;r.onload=()=>{
      const img=new Image();img.onerror=reject;img.onload=()=>{
        const ratio=Math.min(1,maxW/img.width);const w=Math.round(img.width*ratio),h=Math.round(img.height*ratio);
        const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);
        c.toBlob(blob=>blob?resolve(blob):reject(new Error('Falha ao converter imagem')),'image/jpeg',q)
      };img.src=r.result
    };r.readAsDataURL(file)
  })
}
function renderProjects(){
  const el=$('#projects');el.innerHTML='';state.content.portfolio=Array.isArray(state.content.portfolio)?state.content.portfolio:[];
  state.content.portfolio.forEach((item,i)=>el.appendChild(projectEditor(item,i)));
  if(!state.content.portfolio.length){el.innerHTML='<div class="empty-state">Nenhum projeto. Use “Adicionar projeto”.</div>'}
  updateOverview()
}
function projectEditor(item,index){
  const wrap=document.createElement('article');wrap.className='project-editor';
  const previewSrc=item._preview||item.image||'';
  wrap.innerHTML=`<div><div class="project-image">${previewSrc?`<img src="${esc(previewSrc)}">`:`<div class="empty">Nenhuma foto<br>selecionada</div>`}</div>
  <div class="image-controls"><label class="btn small primary">Escolher foto<input class="file-input" type="file" accept="image/*"></label><button class="btn small ghost remove-image">Remover foto</button></div></div>
  <div class="project-fields"><label class="field"><span>Título</span><input class="title" value="${esc(item.title)}"></label>
  <label class="field"><span>Categoria</span><select class="type"><option value="video" ${item.type==='video'?'selected':''}>Audiovisual</option><option value="drone" ${item.type==='drone'?'selected':''}>Drone</option><option value="mapping" ${item.type==='mapping'?'selected':''}>Mapeamento</option></select></label>
  <label class="field full"><span>Descrição curta / cliente</span><input class="subtitle" value="${esc(item.subtitle)}"></label>
  <label class="field full"><span>Etiqueta</span><input class="tag" maxlength="24" value="${esc(item.tag||'PROJETO')}"></label></div>
  <div class="editor-actions"><div class="move-group"><button class="btn small ghost up">↑ Subir</button><button class="btn small ghost down">↓ Descer</button></div><button class="btn small danger delete">Excluir</button></div>`;
  const sync=()=>{item.title=wrap.querySelector('.title').value;item.subtitle=wrap.querySelector('.subtitle').value;item.tag=wrap.querySelector('.tag').value;item.type=wrap.querySelector('.type').value;item.id=item.id||slug(item.title);save()};
  wrap.querySelectorAll('input:not(.file-input),select').forEach(e=>e.addEventListener('input',sync));
  wrap.querySelector('.file-input').addEventListener('change',async e=>{
    const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('image/'))return toast('Escolha uma imagem.');
    toast('Preparando imagem…');const blob=await compressImage(f);const id=item.id||slug(item.title)+'-'+Date.now();item.id=id;
    const filename=slug(item.title||id)+'-'+String(index+1).padStart(2,'0')+'.jpg';item.image='assets/portfolio/'+filename;
    imageBlobs.set(item.image,blob);item._preview=URL.createObjectURL(blob);save();renderProjects();toast('Foto adicionada.')
  });
  wrap.querySelector('.remove-image').onclick=()=>{if(item.image)imageBlobs.delete(item.image);item.image='';item._preview='';save();renderProjects()};
  wrap.querySelector('.delete').onclick=()=>{if(confirm('Excluir este projeto?')){state.content.portfolio.splice(index,1);save();renderProjects()}};
  wrap.querySelector('.up').onclick=()=>{if(index<1)return;[state.content.portfolio[index-1],state.content.portfolio[index]]=[state.content.portfolio[index],state.content.portfolio[index-1]];save();renderProjects()};
  wrap.querySelector('.down').onclick=()=>{if(index>=state.content.portfolio.length-1)return;[state.content.portfolio[index+1],state.content.portfolio[index]]=[state.content.portfolio[index],state.content.portfolio[index+1]];save();renderProjects()};
  return wrap
}
$('#addProject').onclick=()=>{state.content.portfolio.push({id:'projeto-'+Date.now(),title:'Novo projeto',subtitle:'Projeto / Cliente',tag:'PROJETO',type:'video',image:''});save();renderProjects()};

function cleanState(){
  const c=clone(state);c.content.portfolio.forEach(p=>delete p._preview);delete c.content._heroPreview;return c
}
function configText(c){
  return `window.PJJ_CONFIG = ${JSON.stringify(c,null,2)};\n`
}
function contentText(c){
  return `window.PJJ_CONTENT = ${JSON.stringify(c,null,2)};\n`
}
async function exportBundle(){
  syncContent();const s=cleanState();const zip=new JSZip();
  zip.file('config.js',configText(s.config));zip.file('content.js',contentText(s.content));
  if(s.content.heroImage){
    if(heroImageBlob){
      zip.file(s.content.heroImage,heroImageBlob);
    }else{
      try{
        const hr=await fetch('../'+s.content.heroImage,{cache:'no-store'});
        if(hr.ok)zip.file(s.content.heroImage,await hr.blob());
      }catch{}
    }
  }
  for(const p of s.content.portfolio){
    if(!p.image)continue;
    if(imageBlobs.has(p.image)){zip.file(p.image,imageBlobs.get(p.image));continue}
    try{
      const resp=await fetch('../'+p.image,{cache:'no-store'});
      if(resp.ok)zip.file(p.image,await resp.blob())
    }catch{}
  }
  const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pjj-atualizacao-site.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);toast('Pacote gerado.')
}
$('#exportBundle').onclick=exportBundle;

let analyticsReady=false;
function setupAnalytics(){
  const a=state.config.analytics||{};
  analyticsReady=!!(a.enabled&&a.supabaseUrl&&a.supabaseAnonKey);
  $('#analyticsOff').hidden=analyticsReady;$('#analyticsOn').hidden=!analyticsReady
}
$('#refreshStats').onclick=loadAnalytics;
async function loadAnalytics(){
  setupAnalytics();if(!analyticsReady)return;
  const a=state.config.analytics;const base=a.supabaseUrl.replace(/\/$/,'')+'/rest/v1/analytics_events?select=event_name,session_id,created_at&order=created_at.desc&limit=5000';
  try{
    const r=await fetch(base,{headers:{apikey:a.supabaseAnonKey,Authorization:'Bearer '+a.supabaseAnonKey}});
    if(!r.ok)throw new Error();const rows=await r.json();
    const views=rows.filter(x=>x.event_name==='page_view');$('#viewsCount').textContent=views.length;
    $('#sessionsCount').textContent=new Set(views.map(x=>x.session_id)).size;
    $('#whatsClicks').textContent=rows.filter(x=>x.event_name==='whatsapp_click').length;
    $('#instaClicks').textContent=rows.filter(x=>x.event_name==='instagram_click').length;
    const events={};rows.forEach(x=>events[x.event_name]=(events[x.event_name]||0)+1);
    $('#eventsTable').innerHTML=Object.entries(events).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="metric-row"><span>${esc(k)}</span><strong>${v}</strong></div>`).join('');
    const days={};for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days[d.toISOString().slice(0,10)]=0}
    views.forEach(x=>{const d=(x.created_at||'').slice(0,10);if(d in days)days[d]++});
    $('#daysTable').innerHTML=Object.entries(days).map(([d,v])=>`<div class="metric-row"><span>${new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</span><strong>${v}</strong></div>`).join('')
  }catch{toast('Não foi possível carregar as métricas. Confira o Supabase.')}
}
