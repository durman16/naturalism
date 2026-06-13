let currentLang = localStorage.getItem('lang') || 'tr';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  const t = translations[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      if (el.tagName === 'TITLE') {
        document.title = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key] !== undefined) {
      el.innerHTML = t[key];
    }
  });

  const trBtn = document.getElementById('lang-tr');
  const enBtn = document.getElementById('lang-en');
  if (lang === 'tr') {
    trBtn.classList.add('lang-active');
    enBtn.classList.remove('lang-active');
  } else {
    enBtn.classList.add('lang-active');
    trBtn.classList.remove('lang-active');
  }
}

function toggleLang() {
  applyLang(currentLang === 'tr' ? 'en' : 'tr');
}

function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('open');
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      document.getElementById('nav-links')?.classList.remove('open');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

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

applyLang(currentLang);
