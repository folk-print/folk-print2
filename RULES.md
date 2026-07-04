# Folk Print — maket-builder · Правила и контекст

Справочник по проекту: что где лежит, как деплоить, какие конвенции соблюдать.
Обновляй этот файл при значимых изменениях. (См. также `HANDOFF.md`, `TODO.md`.)

---

## 1. Что это
- **Folk Print** — лендинг печати/брендирования одежды (Ташкент). **Vite 5 + React 18**, чистый JS/JSX (без TypeScript).
- Две страницы:
  - **B2B** (`/`) — «Бизнесу», корпоративная одежда → `src/site/B2B.jsx`
  - **B2C** (`/lichnoe`) — «Личное» → `src/site/B2C.jsx`
- Ещё есть 3D-конструктор `/studio` (Three.js, lazy, тяжёлый — без нужды не трогать).
- Хостинг: VPS `morfo` = **167.233.74.104**, Docker + nginx, живёт на **http://167.233.74.104:8101**.
- Исходник: **`~/folk-print/maket-builder/`** на сервере — НЕ под git, правки прямо здесь, эта копия = источник правды.

## 2. Деплой — ТОЛЬКО так
```bash
# 1) бэкап перед правкой
ssh morfo 'cd ~/folk-print/maket-builder/src/site && cp B2B.jsx B2B.jsx.bak'
# 2) правишь файл (локально → scp, либо прямо на сервере)
# 3) пересборка + рестарт контейнера
ssh morfo 'cd ~/folk-print/maket-builder && docker compose up -d --build'
```
- Сборка идёт ВНУТРИ Docker (`npm ci && vite build`). **Если билд падает — старый контейнер продолжает работать**, сайт не ложится. Билдить безопасно; синтакс-ошибки ловятся на этом шаге.
- ВСЕГДА делай `cp X X.bakN` перед правкой. На сервере уже много `.bak` — откат = `cp X.bakN X` + ребилд.

## 3. Структура (`src/site/`)
- **`B2B.jsx` / `B2C.jsx`** — самодостаточные страницы. Каждая = компонент + словарь строк `STR = { ru:{…}, uz:{…} }` сверху + один большой инлайн `<style>{…}` (все медиа-запросы там же).
- **`brand.js`** — ЕДИНЫЙ источник контактов/фактов. Менять только тут:
  `phone` (= менеджер **B2B**), `phone2` (= менеджер **B2C**), `telegram`, `instagram`, `address`, `mapSrc` (iframe-виджет Яндекс-карты), `mapLink` (кликабельная ссылка), `hours`.
- **`Slot.jsx`** — компонент картинки. Отдаёт **WebP через `<picture>` + JPEG-фолбэк автоматически** (`src` пишешь как `/photos/x.jpg`, webp подставляется сам). Проп `priority` → eager-загрузка (для hero/LCP). `alt` берётся из `label`.
- **`clients.js`** — стена логотипов «нам доверяют» (массив; поле `logo: '/logos/{slug}.webp'`).
- **`motion.jsx`** — `Reveal` (появление при скролле), `useCountUp`, `usePrefersReducedMotion`.
- **`lang.jsx`** — `useLang`, `LangToggle` (UZ/RU). **`Logo.jsx`** — лого (variant: `black`/`amber`).
- `public/photos/` — фото (`.jpg` + `.webp` рядом). `public/logos/` — логотипы (`.webp`, ≤240px).

## 4. Конвенции (соблюдать)
**i18n.** Любая надпись — строкой в `STR.ru` И `STR.uz`, вывод `{t.key}`. Динамика: `const uz = lang === 'uz'` → `uz ? '…' : '…'`.

**Картинки.**
- Фото → в `public/photos/` как `.jpg`, **обязательно сконвертить в `.webp`** (то же имя, q≈80, ширина ≤1100). Slot подставит webp сам — `src` не меняешь.
- Логотипы → `public/logos/` как `.webp`, **ширина ≤240px** (показываются ~36px, нельзя лить мегапиксели!), путь в `clients.js`.
- Hero-картинке → `<Slot priority …>`.
- Правило: НИКОГДА не лей 1000px+ картинку под маленький контейнер. (WebP-пасс дал −64% веса: 6.3→2.2 МБ.)

**Контакты.** Только через `brand.js`. `phone` = B2B-менеджер, `phone2` = B2C-менеджер (подписи «Менеджер по B2B/B2C» в контактах и «(B2B)/(B2C)» в футере).

**Кнопки заказа** («Получить КП», «Получить расчёт», «Рассчитать заказ», sticky, в меню, в баннере CTA) → ведут на **`#zayavka`** (форма заявки, у неё `id="zayavka"`), НЕ на `#cta` (это баннер «Оденем вашу команду / Есть идея»).

**Карусель** (кейсы/работы): данные массивом → `ref` + стрелки `el.scrollBy({left: ±(cardWidth+16), behavior:'smooth'})`; контейнер `overflow-x:auto; scroll-snap-type:x mandatory`; карточки `flex:0 0 clamp(…); scroll-snap-align:start`. Свайп на телефоне нативный. Скроллбар прячется (`scrollbar-width:none` + `::-webkit-scrollbar{display:none}`).

**Плашка hero «Нам доверяют»** (B2B) → ссылка на `#cases`.

**Sticky-кнопка** показывается до **880px** (совпадает с точкой бургера, чтобы не было «дыры» без CTA).

## 5. МОБИЛКА — критичный нюанс тестирования
Headless-скриншот `--window-size=390` **ВРЁТ**: из-за `<meta width=device-width>` страница рисуется ~500px и обрезается до 390 → ложная «обрезка». Чтобы увидеть РЕАЛЬНУЮ мобилку:
- Гони Chrome через **CDP**: `Emulation.setDeviceMetricsOverride{width:390, mobile:true}` + **высота 12000** (иначе reveal-секции `opacity:0` и пустые).
- Python `websocket-client` + флаг Chrome `--remote-allow-origins=*`.
- Метрика «всё ок»: `document.documentElement.scrollWidth === innerWidth` (нет горизонтального overflow).
- Пустые полосы в статичном высоком скрине = НЕ баг, это reveal-секции (они появляются при скролле/в-вьюпорте).

## 6. Карта секций
**B2B (`/`):** hero → stats → catalog (ЧТО МЫ БРЕНДИРУЕМ) → advantages (ПОЧЕМУ) → how + методы нанесения → **cases (КЕЙСЫ — карусель, 6 карточек)** + лого-марки → big-cta → contacts (**форма `#zayavka`**) → footer (с Яндекс-картой).
**B2C (`/lichnoe`):** hero → occasions (ПРИНТЫ ДЛЯ ЛЮБОГО ПОВОДА) → how → quality (КАЧЕСТВО ПЕЧАТИ, 6 карточек) → prices (ПРОСТЫЕ ЦЕНЫ) → **works (НАШИ РАБОТЫ — карусель, 6 карточек)** + лого-марки → big-cta → contacts (**форма `#zayavka`**) → footer (с картой).
> Прайс-таблица «ЦЕНЫ ОТ ТИРАЖА» из B2B удалена. В hero B2B плашка = «Нам доверяют · Coca-Cola · KFC · Uzum · Artel».

## 7. Что ещё стоит знать
- UZ/UZ-перевод для карточек-«пустышек» в каруселях — заглушки на RU, заменить при наполнении реальными кейсами.
- Telegram/Instagram бренда — один аккаунт (`folkprint_b2b` / `folkprint.b2b`) на обе страницы.
- У бренда нет email (`brand.email = ''`) — общение через телефон/Telegram.
- Часы: `brand.hours` = «Пн–Сб 10:00–19:00» (источник правды; в `TODO` помечено «owner: подтвердить»).

## 8. 3D-конструктор `/studio` (легаси-ядро, тяжёлое — без нужды не трогать)
Изначальное ядро приложения: **живой in-browser 3D-конструктор макета** одежды. Клиент таскает принты на 4 зоны (перёд/спина/рукава), видит их на 3D-майке в реальном времени, экспортирует/заказывает. Полностью клиентский (бэкенд не нужен для работы).
- **Стек:** React 18 + Fabric.js v6 (2D-доска) + Three.js 0.169 + @react-three/fiber/drei (3D-превью). Модель: `public/models/tshirt.glb`.
- **Роут:** `/studio` → `src/site/StudioTee.jsx` (**lazy-load** — тянет Three.js, поэтому лендинги остаются лёгкими).
- **Ключевые файлы (`src/`):** `state/DesignerContext.jsx` (состояние: доска, dirty-зоны, экспорт, заказ) · `components/DesignBoard.jsx` (Fabric-канвас + навигатор зон) · `components/Editor3D.jsx` (3D-майка, композит зон → CanvasTexture) · `components/PrintsPanel.jsx` (слои/инструменты) · `components/ProductHeader.jsx` (UZ/RU, экспорт, кнопка «Заказать») · `lib/garment.js` (UV → 4 зоны) · `lib/board.js` · `lib/composite.js` (аффинный варп треугольниками) · `lib/order.js` (`buildOrderPayload`+`submitOrder`) · `lib/export.js` (PNG/JSON) · `config/runtime.js` (`orderEndpoint`, `modelUrl`) · `config/products.js`.
- **Заказ → Telegram (НЕ построено):** кнопка «Заказать» уже собирает payload (`{spec, artwork PNG, 3D-snapshot PNG, цвет}`). Нужен маленький бэкенд/serverless: принимает JSON → вызывает Telegram Bot API (`sendPhoto`/`sendDocument`), **токен держать на сервере, не в браузере**, затем прописать `orderEndpoint` в `runtime.js`. Без endpoint кнопка просто скачивает JSON.
- **Веб-компонент:** `<folk-designer lang model>` собирается через `npm run build:wc` (`vite.wc.config.js`) в один самодостаточный файл (`dist-wc/`).
- Полная дока конструктора — в **`HANDOFF.md`**. Мёртвый код на удаление (из HANDOFF): `components/DesignCanvas2D.jsx`, `DesignerStage.jsx`, `PreviewStage3D.jsx`, `lib/printArea.js`.

---

## 9. Обновление 2026-07-01 — два бота, лид-релей, мобильный FAB, соц-иконки

**Лид-релей = отдельный проект `~/folk-print/leadbot/`** (контейнер `folk-leadbot`, порт **8103**, zero-dep Node). Обрабатывает `/lead` (формы сайта) и `/order` (3D-студия). Фронт шлёт сюда: формы B2B/B2C → `http://167.233.74.104:8103/lead`, 3D → `orderEndpoint` в `config/runtime.js` = `:8103/order`. (Старый контейнер `maket-builder-api`:8090 — осиротевший, фронтом НЕ используется.)

- **ДВА бота (по `source`):** B2B-форма → бот `@folkprintbot`, B2C-форма → бот `@Folkprint_btc_bot`. Оба постят в ОДНУ группу. Env в `leadbot/.env`: `BOT_TOKEN_B2B`, `BOT_TOKEN_B2C` (+ `BOT_TOKEN` = фолбэк), `CHAT_ID`. Маршрутизация: `d.source==='b2c' ? B2C : B2B`.
- **⚠️ Группа мигрировала в супергруппу.** Рабочий `CHAT_ID = -1004394290447` (старый basic-group `-5396957413` МЁРТВ — `sendMessage` даёт «group chat was upgraded to a supergroup»). Если добавят новый чат — брать id из ответа `migrate_to_chat_id` или `getChat`.
- Деплой лид-бота: `cd ~/folk-print/leadbot && docker compose up -d --build`. Проверка: `curl :8103/health`; тест: `curl -X POST :8103/lead -d '{"source":"b2b","fields":{...}}'` → `{"ok":true,"delivered":true}`. Лиды всегда пишутся в `leadbot/data/leads.jsonl` даже если доставка упала.

**Формы (B2B.jsx / B2C.jsx).** Раньше сабмит был только `setSent(true)` (POST терялся при рефакторингах) — восстановлен: `onSubmit` шлёт `fetch(:8103/lead, {source, hp, fields})`, у `<textarea>` теперь `name="message"`, добавлен honeypot `<input name="hp">` (скрыт off-screen). B2B поля: Компания/Телефон/Сообщение; B2C: Имя/Телефон/Сообщение.

**Мобильный FAB-телефон.** Круглая кнопка звонка (`.b2b-fab-phone` / `.b2c-fab-phone`), портал в `<body>`, показ ≤880px вместе со sticky-CTA (тот же `showCta`), справа НАД sticky «Получить КП»/«Заказать принт» (`right:16px; bottom:calc(80px+safe-area); z-index:61`). Тёмный кружок + янтарная иконка + пульс-кольцо (`@keyframes fabPing`). Номер = свой на страницу: B2B → `telHref()` (brand.phone), B2C → `tel:+998333388608`.

**Соц-иконки.** У кнопок/ссылок Telegram и Instagram добавлены inline-SVG (плейн + камера) — на ОБЕИХ страницах: контакт-пилюли + футер.

**Фото КЕЙСОВ (только B2B `CASES`).** «Подарки сотрудникам» → `/photos/case-gifts-kpmg.jpg` (KPMG-бокс), «Спецодежда для завода» → `/photos/case-workwear-tmk.jpg` (TMK-ворквеар). ВАЖНО: каталог по-прежнему использует `podarki.jpg`/`specodezhda.jpg` — новые файлы отдельные, чтобы не менять каталог. Оба с `.webp`-парой (1100px, q80).

## 10. Обновление 2026-07-01 (ч.2) — 3D-баннер, фото «Наши работы», FAB крупнее

**B2C (`/lichnoe`):**
- **Новая секция `#studio-cta`** между `#how` и `#prices` — тёмная карточка «СОБЕРИ СВОЙ ПРИНТ САМ» с картинкой студии и кнопкой `<Link to="/studio">` (React-router переход на 3D-конструктор). Тексты инлайн `uz ? … : …`. Фото — `/photos/studio-banner.jpg` (из `image-grand.png`).
- **Фото карусели «Наши работы» (WORKS+GIFTS) заменены** на новые (все с `.webp`-парой, 4:5 портрет, 880px): `work-birthday` (мерч ко дню рожд.), `work-caps` (кепки King/Queen), `work-tee` (футболка Cyberpunk — кроп на передний принт), `work-hoodie` (худи), `work-notebook`/`work-thermos`/`work-keychain`/`work-giftset` (сувениры). Источники — файлы с прямыми кириллич. именами в `Desktop/local-enviroment/photos-for-website/` (кепки.png, футболка.png, худи.png, блокнот.png, термос.png, брелок.png, подарочный-набор.png) + `image-коднюрождения.png`. Старые `case-birthday/case-caps/gift-*` больше не используются (можно удалить). `tee-anime.jpg`/`hoodie.jpg` ОСТАВЛЕНЫ — они ещё в big-CTA полароидах.

**Обе страницы:** FAB-телефон увеличен `54→60px`, отодвинут от края `right 16→22px`, иконка 24→27, тень чуть сильнее.

## 11. Обновление 2026-07-01 (ч.3)
- Фото карточки «Мерч ко дню рождения» → `/photos/work-birthday-cat.jpg` (из `мерч-др.png`, котокороб «Happy Birthday»). Старый `work-birthday.*` не используется.
- Фото 3D-баннера `#studio-cta` → `/photos/studio-banner-tee.jpg` (из `конструктор.png`, футболка FOLK PRINT на печатном столе). Старый `studio-banner.*` не используется. Заголовок баннера оставлен «СОБЕРИ СВОЙ ПРИНТ САМ».

## 12. Обновление 2026-07-01 (ч.4)
- B2B, секция «Методы нанесения», карточка «Лазерная печать» → фото `/photos/method-emboss.jpg` (из `лазерка.png`, тон-в-тон тиснёный лого ALPINE). NB: фото по факту про тиснение/объёмную печать, а не лазер — при желании переименовать метод.
- B2C «Наши работы»: Термосы → `work-thermos-cat.jpg` (кото-термос), Блокноты → `work-notebook-muzh.jpg` («Лучшему мужу»), Подарочные наборы → `work-giftset-boss.jpg` («Лучшему боссу»). Источники: `термос.png`/`блокнот.png`/`набор.png`. Старый `laser.jpg`, `work-thermos/notebook/giftset` не используются.

## 13. Обновление 2026-07-01 (ч.5) — B2B контакты
- Header B2B: добавлен номер телефона `{brand.phone}` (иконка-кружок + номер) между LangToggle и CTA. Только ПК: `.b2b-head-phone` скрыт `@media (max-width:1023px)`. На мобиле работает FAB-звонок.
- Секция «Запросить предложение»: возвращён B2C-номер `{brand.phone2}` (чип B2C) под B2B-номером.
- Футер, колонка «Контакты»: добавлена ссылка Instagram (`igHref()` → instagram.com/folkprint.b2b). Основная кнопка Instagram в контактах уже вела на igHref.
- ВАЖНО про рассинхрон: рабочая копия в scratchpad ушла вперёд деплоя (абсолютный `:8103` в форме, доп. ссылки в футере) — эти правки НЕ задеплоены и это правильно. Форма на деплое шлёт на same-origin `/api/lead`, nginx проксирует → `hostgw:8103/lead` (контейнер folk-leadbot). Не менять на абсолютный URL. Источник правды = задеплоенный файл на сервере.

## 14. Обновление 2026-07-01 (ч.6) — B2C шапка
- Header B2C (`/lichnoe`): добавлен номер телефона в шапку (иконка-кружок + номер) между LangToggle и CTA, аналогично B2B. Только ПК: `.b2c-head-phone` скрыт `@media(max-width:1023px)`. Номер — B2C (`tel:+998333388608` / `{t.contactsPhone2}`), т.к. на личной странице приоритетен B2C. Контакты B2C оставлены как есть — только один (B2C) номер.

## 15. Обновление 2026-07-01 (ч.7) — оба номера везде
- Оба номера (B2B `brand.phone` + B2C `brand.phone2`) теперь во ВСЕХ контактных блоках обеих страниц. Порядок: на B2B — сначала B2B, потом B2C; на B2C — сначала B2C, потом B2B.
- B2B: контакты уже имели оба (чипы amber=B2B / dark=B2C). Добавлен B2C в футер «Контакты».
- B2C: в контактах добавлен B2B со ВТОРЫМ чипом (amber `.b2b-num-chip` linear-gradient, как на B2B). В футер «Контакты» добавлен B2B `(B2B)` (класс `.link-amber`). B2C-страница берёт номер B2B из `brand.phone` (в её STR нет отдельной строки для B2B-номера); соц-сети у B2C свои (Folkprintme / folkprint.uz) — их не трогали.

## 16. Обновление 2026-07-01 (ч.8) — тумблер аудитории
- Переключатель аудитории переименован на ОБЕИХ страницах: RU «БИЗНЕСУ/ЛИЧНОЕ» → «ДЛЯ БИЗНЕСА/ДЛЯ СЕБЯ»; UZ → «BIZNES UCHUN / OʻZIM UCHUN». Строки: B2B `switchBusiness`/`switchPersonal`; B2C `heroBadgeBusiness`/`heroBadgePersonal` (в ru+uz).
- Обе кнопки тумблера получили класс `.aud-seg`; добавлен `@media(max-width:460px){.aud-seg{padding:7px 13px!important;font-size:12px!important;letter-spacing:.02em!important}}` — на телефоне пилюля компактнее (влезает даже в 320px). Десктоп без изменений (13px/8px 18px).

## 17. Обновление 2026-07-01 (ч.9) — sticky CTA + FAB всегда видны на мобиле
- На ОБЕИХ страницах мобильные `.b2b/.b2c-sticky-cta` и `.b2b/.b2c-fab-phone` теперь ВСЕГДА видны (не зависят от скролла). В `@media(max-width:880px)` базовое состояние изменено на видимое: sticky `transform:translateY(0);opacity:1`, fab `transform:translateY(0) scale(1);opacity:1`. Классы `.show` и стейт `showCta` (scrollY>560 && !ctaReached) стали рудиментом — не удалял, безвредны. Раньше кнопки прятались в герое (top) и у секции контактов (ctaReached).

## 18. Обновление 2026-07-01 (ч.10) — hover кнопки «Смотреть каталог» (B2C)
- B2C `.btn-outline-dark:hover` был `background:#15120D;color:#F5EFE5` (чёрный) → стал `background:#FCAC45;border-color:#FCAC45;color:#15120D` (янтарный), как B2B `.b2b-hero-outline:hover`. Класс используется только на кнопке «Смотреть каталог» в герое. NB: рамка визуально остаётся тёмной — inline `border:1.5px solid #15120D` перебивает CSS border-color без !important (то же и на B2B, поведение идентичное).

## 19. Обновление 2026-07-04 — фото каталога + кодовое слово ботов
- B2B каталог: Спецодежда → `/photos/specodezhda-set.jpg` (спред: куртка/полукомбинезон/футболка/каска/ботинки/перчатки/сумка, gold pd), Бизнес-подарки → `/photos/podarki-box.jpg` (бокс+термос+блокнот+ручка, gold FOLK PRINT). B2C «Своя идея» (occ) → `/photos/occ-ownidea-model.jpg` (модель в чёрной футболке+кепка+шоппер+термос). Старые specodezhda/podarki/occ-ownidea не используются.
- Leadbot (см. память morfo-server-infra): добавлено кодовое слово `Folk2015` — любой чат, написавший его боту, подписывается и получает заявки. Существующая группа (CHAT_ID) остаётся постоянным получателем — формат заявок не изменился.
