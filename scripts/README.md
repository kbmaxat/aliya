# PDF-документы

`commercial-offer.html` и `business-plan.html` — исходники, из которых собираются PDF.
Правьте HTML и пересоберите PDF печатью через headless-браузер (Chrome или Edge):

```bash
# Коммерческое предложение → в assets (публикуется на сайте)
msedge --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="../assets/documents/commercial-offer.pdf" \
  "file:///ПОЛНЫЙ/ПУТЬ/scripts/commercial-offer.html"

# Бизнес-план → локально, в репозиторий не коммитим
msedge --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="../бизнес-план.pdf" \
  "file:///ПОЛНЫЙ/ПУТЬ/scripts/business-plan.html"
```

Цвета и структура совпадают с сайтом (зелёный / шалфейный / терракотовый).
Кириллица и знак ₸ берутся из системных шрифтов — отдельный шрифт подключать не нужно.

Пакеты и цены (2026): START 120 000 / 60 000 ₸, STANDARD 170 000 / 90 000 ₸,
PRO 260 000 / 130 000 ₸ (организациям / школам). Материалы включены во все пакеты.
