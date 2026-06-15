/* ── state ── */
let currentLang = localStorage.getItem('lang') || 'tr';
let favorites = new Set(JSON.parse(localStorage.getItem('favs') || '[]'));
let activeFilter = 'all';
let searchQuery = '';

/* ── lang ── */
function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  const t = window.T[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      el.tagName === 'TITLE' ? (document.title = t[key]) : (el.textContent = t[key]);
    }
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  document.getElementById('lang-tr')?.classList.toggle('lang-active', lang === 'tr');
  document.getElementById('lang-en')?.classList.toggle('lang-active', lang === 'en');

  updateFavButtons();
}

function loadLang(lang, cb) {
  if (window.T && window.T[lang]) return cb();
  const s = document.createElement('script');
  s.src = `lang/${lang}.js`;
  s.onload = cb;
  document.head.appendChild(s);
}

function toggleLang() {
  const next = currentLang === 'tr' ? 'en' : 'tr';
  loadLang(next, () => applyLang(next));
}

/* ── menu ── */
function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('open');
}

/* ── smooth scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      document.getElementById('nav-links')?.classList.remove('open');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── favorites ── */
function saveFavs() {
  localStorage.setItem('favs', JSON.stringify([...favorites]));
}

function toggleFav(id, btn) {
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }
  saveFavs();
  updateFavBtn(btn, id);
  if (activeFilter === 'fav') applyFilter();
}

function updateFavBtn(btn, id) {
  const isFav = favorites.has(id);
  btn.classList.toggle('fav-active', isFav);
  btn.setAttribute('aria-label', isFav
    ? (window.T[currentLang]['ui.fav.remove'] || 'Favoriden çıkar')
    : (window.T[currentLang]['ui.fav.add'] || 'Favoriye ekle'));
  btn.querySelector('.fav-icon').textContent = isFav ? '♥' : '♡';
}

function updateFavButtons() {
  document.querySelectorAll('.fav-btn').forEach(btn => {
    updateFavBtn(btn, btn.dataset.id);
  });
}

/* ── share ── */
function shareCard(card, type) {
  const title = card.querySelector('h3')?.textContent || document.title;
  const url = window.location.href.split('?')[0];
  const text = encodeURIComponent(`${title} — ${url}`);

  if (type === 'wa') {
    window.open(`https://wa.me/?text=${text}`, '_blank');
  } else if (type === 'x') {
    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
  } else if (type === 'copy') {
    navigator.clipboard.writeText(`${title} — ${url}`).then(() => {
      const btn = card.querySelector('[data-share="copy"] .share-label');
      if (!btn) return;
      const orig = btn.textContent;
      btn.textContent = window.T[currentLang]['ui.share.copied'] || 'Kopyalandı!';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    });
  }
}

/* ── inject card actions ── */
function injectCardActions() {
  const cards = document.querySelectorAll('.recipe-card, .herb-card');
  cards.forEach((card, i) => {
    if (card.querySelector('.card-actions')) return;
    const id = card.id || `card-${i}`;
    if (!card.id) card.id = id;

    const t = window.T[currentLang];
    const waLabel = t['ui.share.wa'] || 'WhatsApp';
    const copyLabel = t['ui.share.copy'] || 'Link';
    const xLabel = t['ui.share.x'] || 'X';
    const favLabel = favorites.has(id) ? (t['ui.fav.remove'] || 'Favoriden çıkar') : (t['ui.fav.add'] || 'Favoriye ekle');
    const favIcon = favorites.has(id) ? '♥' : '♡';

    const actions = document.createElement('div');
    actions.className = 'card-actions';
    actions.innerHTML = `
      <div class="share-group">
        <button class="share-btn" data-share="wa" aria-label="${waLabel}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.523 5.855L.057 23.886a.25.25 0 0 0 .305.35l6.228-1.635A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.643-.522-5.148-1.422l-.368-.22-3.798.997.997-3.686-.24-.38A9.943 9.943 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
          <span class="share-label">${waLabel}</span>
        </button>
        <button class="share-btn" data-share="x" aria-label="${xLabel}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          <span class="share-label">${xLabel}</span>
        </button>
        <button class="share-btn" data-share="copy" aria-label="${copyLabel}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span class="share-label">${copyLabel}</span>
        </button>
      </div>
      <button class="fav-btn ${favorites.has(id) ? 'fav-active' : ''}" data-id="${id}" aria-label="${favLabel}">
        <span class="fav-icon">${favIcon}</span>
      </button>`;

    actions.querySelector('[data-share="wa"]').addEventListener('click', e => { e.stopPropagation(); shareCard(card, 'wa'); });
    actions.querySelector('[data-share="x"]').addEventListener('click', e => { e.stopPropagation(); shareCard(card, 'x'); });
    actions.querySelector('[data-share="copy"]').addEventListener('click', e => { e.stopPropagation(); shareCard(card, 'copy'); });
    actions.querySelector('.fav-btn').addEventListener('click', e => { e.stopPropagation(); toggleFav(id, e.currentTarget); });

    card.appendChild(actions);
  });
}

/* ── search & filter ── */
function applyFilter() {
  const q = searchQuery.toLowerCase();
  const cards = document.querySelectorAll('.recipe-card, .herb-card');
  let visible = 0;

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const matchSearch = !q || text.includes(q);
    const matchFav = activeFilter !== 'fav' || favorites.has(card.id);
    const show = matchSearch && matchFav;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  document.getElementById('no-results').hidden = visible > 0;

  if (activeFilter === 'fav' && visible === 0 && !q) {
    const noRes = document.getElementById('no-results');
    noRes.hidden = false;
    noRes.querySelector('span').textContent = window.T[currentLang]['ui.fav.empty'] || 'Henüz favori eklemediniz.';
  } else if (visible === 0) {
    const noRes = document.getElementById('no-results');
    noRes.hidden = false;
    noRes.querySelector('span').textContent = window.T[currentLang]['ui.no_results'] || 'Sonuç bulunamadı.';
  }
}

document.getElementById('search-input')?.addEventListener('input', e => {
  searchQuery = e.target.value;
  applyFilter();
});

document.getElementById('pill-row')?.addEventListener('click', e => {
  const pill = e.target.closest('.pill');
  if (!pill) return;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  activeFilter = pill.dataset.filter;
  applyFilter();
});

/* ── intersection observer ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.recipe-card, .herb-card, .tip-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  observer.observe(el);
});

/* ── init ── */
injectCardActions();
applyLang(currentLang);
