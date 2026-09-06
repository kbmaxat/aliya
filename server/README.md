# Отправка заявок в Telegram

Сайт статический (GitHub Pages), поэтому пересылку в Telegram делает
маленький обработчик на вашем сервере `89.207.252.172`.

```
Форма на сайте ──POST──> https://ВАШ-ДОМЕН/aliya-lead.php ──> Telegram Bot API ──> ваш чат
```

## 1. Бот

Бот уже создан: **@aliyamaxatpsybot** (t.me/aliyamaxatpsybot).
Токен лежит в `server/config.local.php` (этот файл не коммитится в git).

## 2. Узнать chat_id (куда слать заявки)

**В личку себе:**
1. Откройте https://t.me/aliyamaxatpsybot и отправьте боту любое сообщение (`/start`).
2. Откройте `https://api.telegram.org/bot<ТОКЕН>/getUpdates`
3. Найдите `"chat":{"id":123456789` — это ваш `chat_id`. Впишите его в `config.local.php`.

**В группу (несколько человек видят заявки):**
1. Создайте группу, добавьте бота, отключите ему Privacy Mode в @BotFather
   (`/setprivacy` → Disable) — или просто напишите в группе `/start@aliyamaxatpsybot`.
2. Тот же `getUpdates` покажет `"chat":{"id":-100123...` — id группы (со знаком минус).

## 3. Загрузить обработчик на сервер

1. Скопируйте на сервер в веб-корень **два файла** — `aliya-lead.php` и `config.local.php` —
   так, чтобы `aliya-lead.php` открывался по **HTTPS**: `https://ВАШ-ДОМЕН/aliya-lead.php`
   (HTTP не подойдёт — браузер заблокирует запрос со страницы на github.io).
2. В `config.local.php` уже вписан токен; допишите туда `TG_CHAT_ID` из шага 2.
   (Альтернатива — переменные окружения `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`
   через `SetEnv` в Apache или `env[...]` в PHP-FPM; тогда `config.local.php` не нужен.)
3. Проверьте из консоли:
   ```
   curl -X POST https://ВАШ-ДОМЕН/aliya-lead.php \
     -H "Content-Type: text/plain" \
     -d '{"name":"Тест","phone":"+7 700 000 00 00","anti_spam":"7","consent":"on"}'
   ```
   В Telegram должно прийти сообщение «🟢 Новая заявка с сайта».

## 4. Подключить на сайте

В файле `script.js` (в начале блока «Форма заявки») укажите адрес:

```js
const LEAD_ENDPOINT = 'https://ВАШ-ДОМЕН/aliya-lead.php';
```

После пуша в `main` заявки с формы будут уходить в Telegram.
Если сервер вдруг недоступен — форма автоматически откроет WhatsApp
с тем же текстом (запасной вариант), плюс копия сохраняется в браузере.

## Требования к PHP
- PHP 7.0+;
- желательно расширение `curl` (если нет — используется `file_get_contents`,
  тогда в `php.ini` должно быть `allow_url_fopen = On`);
- исходящие HTTPS-запросы к `api.telegram.org` не должны быть заблокированы фаерволом.
