<?php
/**
 * aliya-lead.php — приём заявки с сайта и пересылка в Telegram.
 *
 * Разместите файл на сервере Алии по HTTPS-адресу, например:
 *   https://ВАШ-ДОМЕН/aliya-lead.php
 * и пропишите этот адрес в script.js -> const LEAD_ENDPOINT.
 *
 * Токен бота и chat_id задайте одним из способов (в порядке приоритета):
 *   1) файл server/config.local.php рядом с этим файлом (НЕ коммитится в git):
 *        <?php
 *        define('TG_BOT_TOKEN', '123456:AA...');
 *        define('TG_CHAT_ID', '123456789');
 *   2) переменные окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID
 *      (в конфиге веб-сервера / PHP-FPM / .htaccess SetEnv).
 */

@include __DIR__ . '/config.local.php';

$BOT_TOKEN = defined('TG_BOT_TOKEN') && TG_BOT_TOKEN
    ? TG_BOT_TOKEN
    : (getenv('TELEGRAM_BOT_TOKEN') ?: '00000000:PASTE_YOUR_BOT_TOKEN');
$CHAT_ID = defined('TG_CHAT_ID') && TG_CHAT_ID
    ? TG_CHAT_ID
    : (getenv('TELEGRAM_CHAT_ID') ?: '000000000');

/* Разрешаем запросы только с сайта (можно оставить * при желании). */
$ALLOWED_ORIGIN = 'https://kbmaxat.github.io';

header('Access-Control-Allow-Origin: ' . $ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

/* Тело приходит как text/plain с JSON-строкой (так браузер не делает preflight). */
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

/* Простейшая защита от ботов. */
$antiSpam = trim((string)($data['anti_spam'] ?? ''));
$consent  = (string)($data['consent'] ?? '');
$hasFields = trim((string)($data['name'] ?? '')) !== ''
          || trim((string)($data['phone'] ?? '')) !== ''
          || trim((string)($data['email'] ?? '')) !== ''
          || trim((string)($data['comment'] ?? '')) !== '';

if ($antiSpam !== '7' || $consent === '' || !$hasFields) {
    http_response_code(422);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'validation']);
    exit;
}

/* Текст сообщения. */
$fields = [
    'Имя'                   => $data['name']         ?? '',
    'Телефон'               => $data['phone']        ?? '',
    'Email'                 => $data['email']        ?? '',
    'Тип обращения'         => $data['request_type'] ?? '',
    'Организация'           => $data['organization'] ?? '',
    'Количество участников' => $data['participants'] ?? '',
    'Желаемая дата'         => $data['date']         ?? '',
    'Комментарий'           => $data['comment']      ?? '',
];
$lines = ['🟢 Новая заявка с сайта'];
foreach ($fields as $label => $value) {
    $value = trim((string)$value);
    if ($value !== '') {
        $lines[] = $label . ': ' . $value;
    }
}
$text = implode("\n", $lines);

/* Отправка в Telegram. */
$url  = 'https://api.telegram.org/bot' . $BOT_TOKEN . '/sendMessage';
$post = http_build_query([
    'chat_id'                  => $CHAT_ID,
    'text'                     => $text,
    'disable_web_page_preview' => 'true',
]);

$ok = false;
if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $post,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
    ]);
    $resp = curl_exec($ch);
    $ok   = $resp !== false && curl_getinfo($ch, CURLINFO_HTTP_CODE) === 200;
    curl_close($ch);
} else {
    $ctx  = stream_context_create(['http' => [
        'method'        => 'POST',
        'header'        => 'Content-Type: application/x-www-form-urlencoded',
        'content'       => $post,
        'timeout'       => 10,
        'ignore_errors' => true,
    ]]);
    $resp = @file_get_contents($url, false, $ctx);
    $ok   = $resp !== false && strpos((string)$resp, '"ok":true') !== false;
}

header('Content-Type: application/json; charset=utf-8');
if ($ok) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'telegram_failed']);
}
