// Алия Серикбаевна — интерактив лендинга

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

  /* ---------- Форма заявки ----------
     Готового бэкенда у статического сайта нет, поэтому заявка:
     1) резервно сохраняется в localStorage браузера посетителя;
     2) открывает WhatsApp (+7 776 155 03 28) с уже собранным текстом —
        так сообщение реально доходит до Алии.
     Для сбора заявок в почту / Google-таблицу / Telegram нужен
     небольшой сервис (Formspree, Google Apps Script и т.п.). */
  const WHATSAPP_NUMBER = '87761550328';
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

  const buildMessage = (p) =>
    [
      'Заявка с сайта',
      p.name && `Имя: ${p.name}`,
      p.phone && `Телефон: ${p.phone}`,
      p.email && `Email: ${p.email}`,
      p.request_type && `Тип обращения: ${p.request_type}`,
      p.organization && `Организация: ${p.organization}`,
      p.participants && `Количество участников: ${p.participants}`,
      p.date && `Желаемая дата: ${p.date}`,
      p.comment && `Комментарий: ${p.comment}`,
    ]
      .filter(Boolean)
      .join('\n');

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

    const waUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=` + encodeURIComponent(buildMessage(payload));
    const win = window.open(waUrl, '_blank', 'noopener');

    if (win) {
      showStatus('Открываем WhatsApp с вашей заявкой — отправьте сообщение, чтобы завершить.', 'success');
    } else {
      showStatus('Не удалось открыть WhatsApp. Напишите напрямую: 8 (776) 155-03-28.', 'error');
    }
    form.reset();
  });
})();
