const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    const expanded = nav.classList.contains('open');
    navToggle.setAttribute('aria-expanded', String(expanded));
  });
}

const form = document.querySelector('#contact-form');
if (form) {
  const statusNode = form.querySelector('.form-status');
  const showStatus = (message, type) => {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.className = 'form-status';
    if (type) statusNode.classList.add(type);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const antiSpam = form.querySelector('input[name="anti_spam"]');
    if (antiSpam && antiSpam.value.trim() !== '7') {
      antiSpam.setAttribute('aria-invalid', 'true');
      antiSpam.focus();
      showStatus('Проверка spam: введите число 7.', 'error');
      return;
    }

    const botToken = form.dataset.telegramBot || '';
    const chatId = form.dataset.telegramChatId || '';
    const cloudSheetUrl = form.dataset.googleSheetUrl || '';
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const text = [
      'Новая заявка с сайта',
      `Имя: ${payload.name || '-'}`,
      `Телефон: ${payload.phone || '-'}`,
      `Email: ${payload.email || '-'}`,
      `Тип обращения: ${payload.request_type || '-'}`,
      `Организация: ${payload.organization || '-'}`,
      `Количество участников: ${payload.participants || '-'}`,
      `Желаемая дата: ${payload.date || '-'}`,
      `Комментарий: ${payload.comment || '-'}`,
    ].join('\n');

    try {
      if (botToken && chatId) {
        const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true,
          }),
        });

        if (!telegramResponse.ok) {
          throw new Error('Telegram request failed');
        }
      }

      if (cloudSheetUrl) {
        try {
          await fetch(cloudSheetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              ...payload,
            }),
          });
        } catch (sheetError) {
          console.warn('Cloud sheet integration not available yet, saving locally instead.', sheetError);
        }
      }

      const stored = JSON.parse(localStorage.getItem('aliya-form-submissions') || '[]');
      stored.push({
        timestamp: new Date().toISOString(),
        ...payload,
      });
      localStorage.setItem('aliya-form-submissions', JSON.stringify(stored));

      showStatus('Заявка отправлена. В ближайшее время с вами свяжутся.', 'success');
      form.reset();
    } catch (error) {
      console.error(error);
      try {
        const stored = JSON.parse(localStorage.getItem('aliya-form-submissions') || '[]');
        stored.push({
          timestamp: new Date().toISOString(),
          ...payload,
        });
        localStorage.setItem('aliya-form-submissions', JSON.stringify(stored));
      } catch (storageError) {
        console.error(storageError);
      }
      showStatus('Форма принята. Пока Telegram и облачная таблица не подключены, данные сохраняются локально до настройки интеграции.', 'error');
      form.reset();
    }
  });
}
