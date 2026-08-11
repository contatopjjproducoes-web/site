const CFG = window.PJJ_CONFIG || {};
const STORAGE_KEY = 'pjj-admin-state-v3';

function pjjClone(v){ return JSON.parse(JSON.stringify(v)); }
function pjjGetState(){
  try{
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved) return JSON.parse(saved);
  }catch(e){}
  return {
    config: pjjClone(window.PJJ_CONFIG || {}),
    content: pjjClone(window.PJJ_CONTENT || {})
  };
}
function pjjSaveState(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function pjjToast(text){
  document.querySelector('.toast')?.remove();
  const el=document.createElement('div');el.className='toast';el.textContent=text;
  document.body.appendChild(el);setTimeout(()=>el.remove(),2200);
}
function pjjEsc(v){
  return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function pjjSlug(v){
  return String(v||'projeto').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55)||'projeto';
}
function requireAuth(){
  if(sessionStorage.getItem('pjj_panel_ok')!=='1'){
    location.replace('index.html');
    return false;
  }
  return true;
}
function setupLogout(){
  document.getElementById('logoutBtn')?.addEventListener('click',()=>{
    sessionStorage.removeItem('pjj_panel_ok');
    location.replace('index.html');
  });
}
