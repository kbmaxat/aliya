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
  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((el) => el.classList.add('in'));
  } else {
    // ступенчатая задержка для соседних .reveal внутри одного контейнера
    const groups = new Map();
    revealItems.forEach((el) => {
      const parent = el.parentElement;
      const list = groups.get(parent) || [];
      list.push(el);
      groups.set(parent, list);
    });
    groups.forEach((list) => {
      if (list.length < 2) return;
      list.forEach((el, i) => {
        el.style.setProperty('--reveal-delay', Math.min(i * 75, 375) + 'ms');
      });
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
    );
    revealItems.forEach((el) => revealObserver.observe(el));

    /* ---------- Мягкий параллакс фоновых фигур в hero ---------- */
    const parallax = Array.from(document.querySelectorAll('[data-parallax]')).map((el) => ({
      el,
      speed: parseFloat(el.dataset.parallax) || 0,
    }));
    if (parallax.length) {
      let ticking = false;
      const update = () => {
        const y = window.scrollY;
        parallax.forEach(({ el, speed }) => {
          el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
        });
        ticking = false;
      };
      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
          }
        },
        { passive: true }
      );
      update();
    }
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
     LEAD_ENDPOINT — обработчик на сервере, который шлёт заявку боту в Telegram
     (см. /server/aliya-lead.php). Если сервер недоступен или ещё не настроен,
     форма автоматически откроется в WhatsApp с тем же текстом. */
  const LEAD_ENDPOINT = 'https://maxatlab.kz/aliya-lead.php';
  const WHATSAPP_NUMBER = '77761550328';
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const statusNode = form.querySelector('.form-status');
  const showStatus = (message, type) => {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.className = 'form-status field--full';
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

  const openWhatsApp = (payload) => {
    const waUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=` + encodeURIComponent(buildMessage(payload));
    const win = window.open(waUrl, '_blank', 'noopener');
    if (win) {
      showStatus('Открываем WhatsApp с вашей заявкой — отправьте сообщение, чтобы завершить.', 'success');
    } else {
      showStatus('Не удалось открыть WhatsApp. Напишите напрямую: +7 776 155 03 28.', 'error');
    }
  };

  const sendToServer = async (payload) => {
    // text/plain — «простой» запрос без CORS-preflight; ответ читаем в режиме cors.
    const res = await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, text: buildMessage(payload), page: location.href }),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const result = await res.json();
    if (result.ok !== true) throw new Error('Delivery was not confirmed');
    return result;
  };

  form.addEventListener('submit', async (event) => {
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

    const submitBtn = form.querySelector('.submit-button');
    const payload = Object.fromEntries(new FormData(form).entries());
    saveLocally(payload);

    if (LEAD_ENDPOINT) {
      if (submitBtn) submitBtn.disabled = true;
      showStatus('Отправляем заявку…', '');
      try {
        await sendToServer(payload);
        showStatus('Заявка отправлена. Я свяжусь с вами в ближайшее время.', 'success');
        form.reset();
      } catch (error) {
        console.warn('Не удалось отправить на сервер, открываем WhatsApp:', error);
        openWhatsApp(payload);
        form.reset();
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
      return;
    }

    openWhatsApp(payload);
    form.reset();
  });
})();
