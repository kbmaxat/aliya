// Алия Жакупова — интерактив лендинга

(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  /* ---------- Мобильное меню ---------- */
  if (navToggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    };

    navToggle.addEventListener('click', () => {
      setOpen(!nav.classList.contains('open'));
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  /* ---------- Тень шапки при скролле ---------- */
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Появление блоков при прокрутке ---------- */
  const revealItems = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((el) => el.classList.add('in'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );
    revealItems.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Подсветка активного пункта меню ---------- */
  const navLinks = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          navLinks.forEach((link) =>
            link.classList.toggle('is-active', link.getAttribute('href') === id)
          );
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((section) => spyObserver.observe(section));
  }

  /* ---------- Текущий год в подвале ---------- */
  const yearNode = document.querySelector('[data-year]');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  /* ---------- Форма заявки ---------- */
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const statusNode = form.querySelector('.form-status');
  const showStatus = (message, type) => {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.className = 'form-status';
    if (type) statusNode.classList.add(type);
  };

  const saveLocally = (payload) => {
    try {
      const stored = JSON.parse(localStorage.getItem('aliya-form-submissions') || '[]');
      stored.push({ timestamp: new Date().toISOString(), ...payload });
      localStorage.setItem('aliya-form-submissions', JSON.stringify(stored));
    } catch (error) {
      console.warn('Не удалось сохранить заявку локально:', error);
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const antiSpam = form.querySelector('input[name="anti_spam"]');
    if (antiSpam && antiSpam.value.trim() !== '7') {
      antiSpam.setAttribute('aria-invalid', 'true');
      antiSpam.focus();
      showStatus('Проверка от спама: введите число 7.', 'error');
      return;
    }
    if (antiSpam) antiSpam.removeAttribute('aria-invalid');

    const consent = form.querySelector('input[name="consent"]');
    if (consent && !consent.checked) {
      consent.focus();
      showStatus('Отметьте согласие на обработку данных.', 'error');
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    saveLocally(payload);

    showStatus('Заявка принята. Я свяжусь с вами в ближайшее время — при необходимости напишите в WhatsApp.', 'success');
    form.reset();
  });
})();
