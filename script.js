const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const topbar = document.getElementById('topbar');
const menu = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

const onScroll = () => {
  if (window.scrollY > 24) topbar.classList.add('scrolled');
  else topbar.classList.remove('scrolled');
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.classList.toggle('menu-open', open);
});

nav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    menu?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('[data-reveal]').forEach((el, i) => {
  el.style.transitionDelay = `${Math.min((i % 4) * 70, 210)}ms`;
  revealObserver.observe(el);
});

const glow = document.querySelector('.cursor-glow');
if (glow && window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove', e => {
    glow.style.transform = `translate(${e.clientX - 210}px, ${e.clientY - 210}px)`;
  }, { passive: true });
}

document.querySelectorAll('.service, .project, .contact-link').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(900px) rotateX(${-y * 2.2}deg) rotateY(${x * 2.2}deg) translateY(-3px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});


/* ===== Dados externos: config.js + content.js ===== */
(function () {
  const cfg = window.PJJ_CONFIG || {};
  const company = cfg.company || {};
  const content = window.PJJ_CONTENT || {};

  const heroText = document.getElementById('siteHeroText');
  if (heroText && content.heroText) heroText.textContent = content.heroText;

  const aboutLead = document.getElementById('siteAboutLead');
  if (aboutLead && content.aboutLead) aboutLead.textContent = content.aboutLead;

  const instagram = document.getElementById('siteInstagramLink');
  if (instagram && company.instagram) instagram.href = company.instagram;

  const email = document.getElementById('siteEmailLink');
  const emailText = document.getElementById('siteEmailText');
  if(email){
    if(company.email){
      email.href = 'mailto:' + company.email;
      if(emailText) emailText.textContent = company.email;
    } else {
      email.style.display = 'none';
    }
  }

  const waNumber = String(company.whatsapp || '').replace(/\D/g, '');
  const waMessage = encodeURIComponent(company.whatsappMessage || '');
  const waUrl = waNumber ? `https://wa.me/${waNumber}${waMessage ? `?text=${waMessage}` : ''}` : '#';

  ['siteWhatsappLink','siteWhatsappFloat'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.href=waUrl;
  });

  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  const items = Array.isArray(content.portfolio) ? content.portfolio : [];
  grid.innerHTML = '';

  items.forEach((item, index) => {
    const article = document.createElement('article');
    article.className = `project ${index === 0 && items.length > 2 ? 'project-large' : ''}`;
    article.setAttribute('data-reveal', '');
    article.dataset.track = 'portfolio_open';
    article.dataset.projectId = item.id || '';

    const visual = document.createElement('div');
    const type = item.type === 'drone' ? 'visual-drone' : item.type === 'mapping' ? 'visual-map' : 'visual-video';
    visual.className = `project-visual ${type}`;

    if (item.image) {
      visual.classList.add('has-image');
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title || 'Projeto PJJ Produções';
      img.loading = 'lazy';
      visual.appendChild(img);
    } else if (item.type === 'drone') {
      const radar = document.createElement('div');
      radar.className = 'radar';
      visual.appendChild(radar);
    } else if (item.type === 'mapping') {
      const map = document.createElement('div');
      map.className = 'map-grid';
      visual.appendChild(map);
    } else {
      const lines = document.createElement('div');
      lines.className = 'visual-lines';
      visual.appendChild(lines);
    }

    const badge = document.createElement('div');
    badge.className = 'project-badge';
    badge.textContent = item.tag || 'PROJETO';
    visual.appendChild(badge);

    const info = document.createElement('div');
    info.className = 'project-info';
    const text = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = item.title || 'Projeto';
    const p = document.createElement('p');
    p.textContent = item.subtitle || '';
    text.append(h3, p);
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    info.append(text, number);

    article.append(visual, info);
    grid.appendChild(article);

    article.addEventListener('click',()=>{
      window.PJJ_ANALYTICS?.track?.('portfolio_open',{
        id:item.id||'',
        title:item.title||''
      });
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    grid.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  } else {
    grid.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('visible'));
  }
})();


/* ===== Imagem do topo + formulário de contato ===== */
(function(){
  const content = window.PJJ_CONTENT || {};
  const cfg = window.PJJ_CONFIG || {};
  const company = cfg.company || {};

  const media = document.getElementById('siteHeroMedia');
  if(media){
    if(content.heroImage){
      media.classList.add('has-hero-image');
      media.innerHTML = '';
      const img = document.createElement('img');
      img.src = content.heroImage;
      img.alt = 'PJJ Produções';
      img.loading = 'eager';
      media.appendChild(img);
    } else {
      media.classList.remove('has-hero-image');
    }
  }

  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if(!form) return;

  form.addEventListener('submit', async (event)=>{
    event.preventDefault();

    const email = String(company.email || '').trim();
    if(!email){
      status.textContent = 'O formulário está temporariamente indisponível. Fale pelo WhatsApp.';
      status.className = 'form-status error';
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.textContent = 'Enviando…';
    status.className = 'form-status';

    try{
      const data = new FormData(form);
      const body = {};
      data.forEach((value,key)=>body[key]=value);

      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`,{
        method:'POST',
        headers:{'Accept':'application/json','Content-Type':'application/json'},
        body:JSON.stringify(body)
      });

      const result = await response.json().catch(()=>({}));
      if(!response.ok || result.success === false) throw new Error('Falha no envio');

      status.textContent = 'Mensagem enviada. Obrigado pelo contato!';
      status.className = 'form-status success';
      form.reset();
      window.PJJ_ANALYTICS?.track?.('contact_form_submit');
    }catch(error){
      status.textContent = 'Não foi possível enviar agora. Tente novamente ou use o WhatsApp.';
      status.className = 'form-status error';
      window.PJJ_ANALYTICS?.track?.('contact_form_error');
    }finally{
      button.disabled = false;
    }
  });
})();
