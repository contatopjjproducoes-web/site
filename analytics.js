/*
  Analytics simples para GitHub Pages + Supabase.
  Se analytics.enabled = false, este arquivo não envia nada.
*/
(function(){
  const cfg = window.PJJ_CONFIG?.analytics;
  if(!cfg?.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    window.PJJ_ANALYTICS = { track: () => {} };
    return;
  }

  const endpoint = cfg.supabaseUrl.replace(/\/$/,'') + '/rest/v1/analytics_events';
  const sessionKey = 'pjj_session_id';
  let sessionId = sessionStorage.getItem(sessionKey);
  if(!sessionId){
    sessionId = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
    sessionStorage.setItem(sessionKey,sessionId);
  }

  async function track(eventName, meta={}){
    const payload = {
      event_name: eventName,
      session_id: sessionId,
      page_path: location.pathname,
      referrer_host: (() => {
        try { return document.referrer ? new URL(document.referrer).hostname : ''; }
        catch { return ''; }
      })(),
      metadata: meta
    };

    try{
      await fetch(endpoint,{
        method:'POST',
        keepalive:true,
        headers:{
          'Content-Type':'application/json',
          'apikey':cfg.supabaseAnonKey,
          'Authorization':'Bearer '+cfg.supabaseAnonKey,
          'Prefer':'return=minimal'
        },
        body:JSON.stringify(payload)
      });
    }catch(e){}
  }

  window.PJJ_ANALYTICS = { track };

  track('page_view');

  document.addEventListener('click', e=>{
    const target=e.target.closest('[data-track]');
    if(!target) return;
    track(target.dataset.track,{
      label:(target.textContent||'').trim().slice(0,120)
    });
  },{passive:true});
})();
