/* ============================================================
   Площадка Среднебелая — app.js
   Все настраиваемые значения — в блоке КОНФИГУРАЦИЯ ниже.
   ============================================================ */

/* ---------------- КОНФИГУРАЦИЯ ---------------- */

// Боевой адрес сайта (используется только для аналитики/отладки; canonical и
// метатеги задаются статически в index.html — заменить там поиском-заменой).
var SITE_URL = 'https://hub28.ru';

// Языковые версии: переключить на true, когда /en/ и /cn/ готовы.
var LANGS_READY = true;

// PDF-тизер: переключить на true, когда файл assets/teaser.pdf загружен.
var TEASER_READY = true;

// Контакты Евгения — подставить перед публикацией.
// Пока значения пустые, на странице остаётся «указывается при публикации».
var CONTACTS = {
  phone: '+7 914 550-05-03',
  email: 'tumoff@mail.ru',
  telegram: '',   // формат: 'username' (без @)
  max: ''         // полная ссылка на профиль в MAX, например 'https://max.ru/u/...'
};

// ---------- ПРИЁМ ЗАЯВОК ----------
// Форма отправляется прямо со страницы, посетителя никуда не уводит.
// Канал доставки выбирается первым из настроенных:
//   1) FORM_ENDPOINT — POST JSON на наш обработчик (предпочтительно: данные
//      российских граждан по ч. 5 ст. 18 152-ФЗ должны собираться в базе на
//      территории РФ, поэтому зарубежные сервисы форм здесь недопустимы);
//   2) TELEGRAM — прямая отправка в Telegram владельцу, работает на статике
//      без сервера; токен виден в коде, поэтому бот должен уметь только
//      писать в один чат;
//   3) mailto — запасной путь, письмо собирается в почтовом клиенте
//      посетителя (последний рубеж, чтобы заявка не потерялась).
var FORM_ENDPOINT = '';

var TELEGRAM = {
  token: '',   // токен бота, формат '123456:AA...'
  chatId: ''   // id чата владельца
};

// Часовой пояс владельца: Благовещенск, UTC+9 (МСК+6).
var OWNER_TZ = 'Asia/Yakutsk';
var OWNER_UTC_OFFSET = 9;
// Рабочее окно владельца по его времени.
var OWNER_HOURS = [9, 20];

// Аналитика. Пустая строка = счётчик не грузится.
var YM_ID = '';   // Яндекс.Метрика, номер счётчика
var GA4_ID = '';  // Google Analytics 4, опционально

// Координаты точек карты [долгота, широта].
// ВНИМАНИЕ: координаты площадки — приблизительные, заменить на центроид
// участка из выписки ЕГРН перед публикацией (открытая позиция № 3 ТЗ).
var MAP_COORDS = [
  { key: 'site',     coords: [128.058, 50.678], main: true },
  { key: 'station',  coords: [128.052, 50.672] },
  { key: 'dryport',  coords: [128.135, 50.605] },
  { key: 'belogorsk',coords: [128.474, 50.921] },
  { key: 'crossing', coords: [127.588, 50.196] },
  { key: 'capital',  coords: [127.535, 50.290] }
];

/* ---------------- ЯЗЫК И БАЗОВЫЙ ПУТЬ ----------------
   Одна и та же сборка обслуживает /, /en/ и /cn/. Язык берём из <html lang>,
   префикс к статике — из data-base, иначе картинки и вендор в подпапках
   разрешаются относительно /en/ и /cn/ и не находятся. */

var LANG = (document.documentElement.getAttribute('lang') || 'ru').toLowerCase().slice(0, 2);
if (LANG === 'zh') LANG = 'cn';
if (LANG !== 'en' && LANG !== 'cn') LANG = 'ru';

var BASE = document.documentElement.getAttribute('data-base') || '';

var STRINGS = {
  ru: {
    copied: 'Скопировано',
    sending: 'Отправляем…',
    submit: 'Отправить заявку',
    lensHintTouch: 'Проведите пальцем — увидите проект',
    mailSubject: 'Заявка с hub28.ru — площадка Среднебелая',
    mailFields: ['Имя', 'Компания', 'Телефон', 'E-mail', 'Формат интереса', 'Комментарий', 'Отправлено с'],
    mailOpened: 'Открылось окно почты с готовым письмом — отправьте его, и мы ответим в течение рабочего дня.',
    mailFallback: 'Если почтовая программа не открылась, напишите на ',
    mailOrCall: ' или позвоните: ',
    sent: 'Заявка отправлена. Мы вернёмся к вам в течение одного рабочего дня.',
    formDownBoth: 'Форма временно недоступна — ',
    formDownPlain: 'Форма временно недоступна. Попробуйте отправить заявку позднее.',
    writeTo: 'напишите на ',
    inTelegram: 'в Telegram: ',
    or: ' или ',
    inMax: 'написать в MAX',
    toastTitle: 'Заявка отправлена',
    toastText: 'Мы вернёмся к вам в течение одного рабочего дня.',
    toastClose: 'Закрыть уведомление',
    ownerNow: 'Сейчас в Благовещенске',
    ownerNight: 'у собственника ночь — звонок лучше запланировать на утро',
    ownerWork: 'рабочее время, можно звонить',
    ownerEve: 'рабочий день закончился',
    meansThere: 'По времени Благовещенска это ',
    tzYours: 'ваш часовой пояс',
    callOpts: [['now', 'Можно прямо сейчас'], ['9-12', 'Утро, 9:00–12:00'], ['12-17', 'День, 12:00–17:00'], ['17-20', 'Вечер, 17:00–20:00'], ['mail', 'Звонить не нужно — пишите на почту']],
    callNowNote: 'Позвоним, как только увидим заявку.',
    callMailNote: 'Ответим письмом, звонить не будем.',
    tzCities: { 2: 'Калининград', 3: 'Москва', 4: 'Самара', 5: 'Екатеринбург', 6: 'Омск', 7: 'Красноярск', 8: 'Иркутск', 9: 'Благовещенск, Якутск', 10: 'Владивосток', 11: 'Магадан', 12: 'Камчатка' },
    map: {
      site: ['Площадка Среднебелая, 11,07 га', ''],
      station: ['Станция примыкания, Забайкальская ж/д', 'станция Среднебелая'],
      dryport: ['Контейнерный терминал, запуск 2026', 'сухой порт «Благовещенск» — 12 км по железной дороге'],
      belogorsk: ['Белогорск — переработка сельхозпродукции', '60 км, новые перерабатывающие мощности'],
      crossing: ['Международный переход Россия — Китай', 'мост Благовещенск — Хэйхэ, таможенный пункт пропуска Кани-Курган — около 70 км'],
      capital: ['Административный центр области', 'Благовещенск — 75 км']
    }
  },
  en: {
    copied: 'Copied',
    sending: 'Sending…',
    submit: 'Send the request',
    lensHintTouch: 'Swipe to see the project',
    mailSubject: 'Request from hub28.ru — Srednebelaya industrial site',
    mailFields: ['Name', 'Company', 'Phone', 'E-mail', 'Interest', 'Comment', 'Sent from'],
    mailOpened: 'Your mail client has opened with a prepared message — send it and we will reply within one business day.',
    mailFallback: 'If the mail client did not open, write to ',
    mailOrCall: ' or call: ',
    sent: 'The request has been sent. We will get back to you within one business day.',
    formDownBoth: 'The form is temporarily unavailable — ',
    formDownPlain: 'The form is temporarily unavailable. Please try again later.',
    writeTo: 'write to ',
    inTelegram: 'on Telegram: ',
    or: ' or ',
    inMax: 'write on MAX',
    toastTitle: 'Request sent',
    toastText: 'We will get back to you within one business day.',
    toastClose: 'Close notification',
    ownerNow: 'Local time in Blagoveshchensk',
    ownerNight: 'it is night at the owner’s end — better to plan a morning call',
    ownerWork: 'business hours, a call is fine',
    ownerEve: 'the business day is over',
    meansThere: 'In Blagoveshchensk time that is ',
    tzYours: 'your time zone',
    callOpts: [['now', 'Any time now'], ['9-12', 'Morning, 9:00–12:00'], ['12-17', 'Daytime, 12:00–17:00'], ['17-20', 'Evening, 17:00–20:00'], ['mail', 'No call needed — write by e-mail']],
    callNowNote: 'We will call as soon as we see the request.',
    callMailNote: 'We will reply by e-mail and will not call.',
    tzCities: { 2: 'Kaliningrad', 3: 'Moscow', 4: 'Samara', 5: 'Yekaterinburg', 6: 'Omsk', 7: 'Krasnoyarsk', 8: 'Irkutsk, Beijing', 9: 'Blagoveshchensk, Yakutsk', 10: 'Vladivostok', 11: 'Magadan', 12: 'Kamchatka' },
    map: {
      site: ['Srednebelaya site, 11.07 ha', ''],
      station: ['Connecting station, Trans-Baikal Railway', 'Srednebelaya station'],
      dryport: ['Container terminal, opened 2026', 'Blagoveshchensk dry port — 12 km by rail'],
      belogorsk: ['Belogorsk — agricultural processing', '60 km, new processing capacity'],
      crossing: ['International Russia — China crossing', 'Blagoveshchensk — Heihe bridge, Kani-Kurgan customs checkpoint — about 70 km'],
      capital: ['Regional capital', 'Blagoveshchensk — 75 km']
    }
  },
  cn: {
    copied: '已复制',
    sending: '发送中…',
    submit: '提交索取申请',
    lensHintTouch: '滑动查看项目效果',
    mailSubject: '来自 hub28.ru 的咨询 — 中别拉亚工业用地',
    mailFields: ['姓名', '公司', '电话', '电子邮箱', '合作方式', '备注', '来源页面'],
    mailOpened: '邮件客户端已打开并生成邮件，发送后我们将在一个工作日内回复。',
    mailFallback: '如果邮件客户端未打开，请发送至 ',
    mailOrCall: ' 或致电：',
    sent: '申请已发送，我们将在一个工作日内回复。',
    formDownBoth: '表单暂时不可用 — ',
    formDownPlain: '表单暂时不可用，请稍后再试。',
    writeTo: '请发送邮件至 ',
    inTelegram: 'Telegram：',
    or: ' 或 ',
    inMax: '通过 MAX 联系',
    toastTitle: '申请已发送',
    toastText: '我们将在一个工作日内回复。',
    toastClose: '关闭提示',
    ownerNow: '布拉戈维申斯克当地时间',
    ownerNight: '当地为夜间，建议安排在上午通话',
    ownerWork: '工作时间，可以致电',
    ownerEve: '工作日已结束',
    meansThere: '按布拉戈维申斯克时间为 ',
    tzYours: '您所在时区',
    callOpts: [['now', '现在即可'], ['9-12', '上午 9:00–12:00'], ['12-17', '下午 12:00–17:00'], ['17-20', '傍晚 17:00–20:00'], ['mail', '无需来电，请发邮件']],
    callNowNote: '我们看到申请后会立即致电。',
    callMailNote: '我们将以邮件回复，不会致电。',
    tzCities: { 3: '莫斯科', 5: '叶卡捷琳堡', 7: '克拉斯诺亚尔斯克', 8: '北京、伊尔库茨克', 9: '布拉戈维申斯克、雅库茨克', 10: '符拉迪沃斯托克' },
    map: {
      site: ['中别拉亚地块，11.07 公顷', ''],
      station: ['接轨站，外贝加尔铁路局', '中别拉亚站'],
      dryport: ['集装箱码头，2026 年投入运营', '"布拉戈维申斯克"内陆港 — 铁路里程 12 公里'],
      belogorsk: ['别洛戈尔斯克 — 农产品加工', '60 公里，新增加工产能'],
      crossing: ['中俄国际口岸', '布拉戈维申斯克—黑河公路大桥，卡尼库尔干口岸 — 约 70 公里'],
      capital: ['州行政中心', '布拉戈维申斯克 — 75 公里']
    }
  }
};

var T = STRINGS[LANG];

var MAP_POINTS = MAP_COORDS.map(function (p) {
  var n = T.map[p.key];
  return { name: n[0], note: n[1], coords: p.coords, main: !!p.main };
});

/* ---------------- СЛУЖЕБНОЕ ---------------- */

function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

/* Отправка цели в аналитику */
function track(goal) {
  try {
    if (YM_ID && typeof ym === 'function') ym(Number(YM_ID), 'reachGoal', goal);
    if (GA4_ID && typeof gtag === 'function') gtag('event', goal);
  } catch (e) { /* аналитика не должна ломать страницу */ }
}

/* ---------------- ШАПКА ---------------- */

(function () {
  var header = $('.site-header');
  var onScroll = function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = $('#burgerBtn');
  var nav = $('#mainNav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Подсветка активного пункта навигации */
  var links = $all('.main-nav a');
  var map = {};
  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var sec = document.getElementById(id);
    if (sec) map[id] = a;
  });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.classList.remove('active'); });
          map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* Языковые версии */
  if (LANGS_READY) {
    $all('.lang-switch .lang.is-disabled').forEach(function (a) {
      a.classList.remove('is-disabled');
      a.removeAttribute('aria-disabled');
      a.removeAttribute('tabindex');
    });
  }

  /* Тизер */
  if (TEASER_READY) {
    $all('.teaser-btn').forEach(function (b) { b.hidden = false; });
  }

  /* Контакты */
  if (CONTACTS.phone) {
    $all('[data-contact="phone"]').forEach(function (el) {
      el.innerHTML = '<a href="tel:' + CONTACTS.phone.replace(/[^\d+]/g, '') + '" data-goal="click_phone">' + CONTACTS.phone + '</a>';
    });
  }
  if (CONTACTS.email) {
    $all('[data-contact="email"]').forEach(function (el) {
      el.innerHTML = '<a href="mailto:' + CONTACTS.email + '" data-goal="click_email">' + CONTACTS.email + '</a>';
    });
  }
  if (CONTACTS.telegram) {
    $all('[data-contact="telegram"]').forEach(function (el) {
      el.innerHTML = '<a href="https://t.me/' + CONTACTS.telegram + '" target="_blank" rel="noopener" data-goal="click_telegram">@' + CONTACTS.telegram + '</a>';
    });
    $all('[data-contact="telegram-link"]').forEach(function (el) {
      el.hidden = false;
      el.href = 'https://t.me/' + CONTACTS.telegram;
      el.target = '_blank';
      el.rel = 'noopener';
      el.setAttribute('data-goal', 'click_telegram');
    });
  }
  if (CONTACTS.max) {
    $all('[data-contact="max"]').forEach(function (el) {
      el.innerHTML = '<a href="' + CONTACTS.max + '" target="_blank" rel="noopener">написать в MAX</a>';
    });
  }
  /* Пустые контакты — прячем строку целиком, чтобы не висело «указывается при публикации» */
  ['phone', 'email', 'telegram', 'max'].forEach(function (k) {
    if (CONTACTS[k]) return;
    $all('[data-contact="' + k + '"]').forEach(function (el) {
      var row = el.closest('.contact-row');
      if (row) row.hidden = true;
    });
  });

  /* Клики-цели */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-goal]');
    if (t) track(t.getAttribute('data-goal'));
  });

  /* Раскрытие таблицы объектов */
  var obj = $('#objectsTable');
  if (obj) {
    obj.addEventListener('toggle', function () {
      if (obj.open) track('open_objects_table');
    });
  }

  /* Прокрутка до 75 % */
  var fired75 = false;
  window.addEventListener('scroll', function () {
    if (fired75) return;
    var h = document.documentElement;
    var progress = (h.scrollTop + window.innerHeight) / h.scrollHeight;
    if (progress >= 0.75) { fired75 = true; track('scroll_75'); }
  }, { passive: true });
})();

/* ---------------- СЧЁТЧИКИ ---------------- */

(function () {
  var els = $all('[data-count]');
  if (!els.length) return;
  var fmt = function (n, mode) {
    n = Math.round(n);
    if (mode === 'space') return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return String(n);
  };
  var animate = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var mode = el.getAttribute('data-format') || '';
    var t0 = null, dur = 1200;
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, mode);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }
})();

/* ---------------- КАРТА ---------------- */
/* MapLibre GL JS — self-hosted (assets/vendor/), грузится динамически
   только когда блок карты попадает в зону видимости. */

(function () {
  var box = $('#mapBox');
  if (!box) return;

  var loaded = false;
  function loadMap() {
    if (loaded) return;
    loaded = true;

    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = BASE + 'assets/vendor/maplibre-gl.css';
    document.head.appendChild(css);

    var js = document.createElement('script');
    js.src = BASE + 'assets/vendor/maplibre-gl.js';
    js.onload = initMap;
    js.onerror = function () { /* остаёмся на статичной схеме */ };
    document.head.appendChild(js);
  }

  function initMap() {
    if (typeof maplibregl === 'undefined') return;
    try {
      var map = new maplibregl.Map({
        container: 'map',
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© участники <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
        },
        center: [128.0, 50.55],
        zoom: 8,
        cooperativeGestures: true
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

      MAP_POINTS.forEach(function (p) {
        var el = document.createElement('div');
        el.style.cssText = 'width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(15,27,45,.4);background:' + (p.main ? '#26A69A' : '#1A237E') + ';' + (p.main ? 'width:22px;height:22px;' : '');
        var popupHtml = '<strong>' + p.name + '</strong>' + (p.note ? '<br>' + p.note : '');
        new maplibregl.Marker({ element: el })
          .setLngLat(p.coords)
          .setPopup(new maplibregl.Popup({ offset: 18 }).setHTML(popupHtml))
          .addTo(map);
      });

      map.on('load', function () {
        box.classList.add('map-ready');
        var b = new maplibregl.LngLatBounds();
        MAP_POINTS.forEach(function (p) { b.extend(p.coords); });
        map.fitBounds(b, { padding: 60, duration: 0 });
      });
    } catch (e) { /* остаёмся на статичной схеме */ }
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { loadMap(); io.disconnect(); }
      });
    }, { rootMargin: '400px' });
    io.observe(box);
  } else {
    loadMap();
  }
})();

/* ---------------- ВСПЛЫВАЮЩЕЕ УВЕДОМЛЕНИЕ ---------------- */

function showToast(title, text) {
  var old = $('#toast');
  if (old) old.parentNode.removeChild(old);

  var box = document.createElement('div');
  box.className = 'toast';
  box.id = 'toast';
  box.setAttribute('role', 'status');
  box.setAttribute('aria-live', 'polite');
  box.innerHTML =
    '<span class="toast-mark" aria-hidden="true"></span>' +
    '<span class="toast-body"><b>' + title + '</b><span>' + text + '</span></span>' +
    '<button type="button" class="toast-x" aria-label="' + T.toastClose + '">&#215;</button>';
  document.body.appendChild(box);
  requestAnimationFrame(function () { box.classList.add('is-in'); });

  var hide = function () {
    box.classList.remove('is-in');
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 400);
  };
  box.querySelector('.toast-x').addEventListener('click', hide);
  setTimeout(hide, 9000);
}

/* ---------------- ВРЕМЯ У СОБСТВЕННИКА ----------------
   Благовещенск — UTC+9 круглый год, перевода часов нет, поэтому считаем
   фиксированным смещением, не полагаясь на базу зон в браузере. */

function pad2(n) { return (n < 10 ? '0' : '') + n; }

function ownerDate() {
  var d = new Date();
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000 + OWNER_UTC_OFFSET * 3600000);
}

(function () {
  var el = $('#ownerClock');
  if (!el) return;
  var tick = function () {
    var d = ownerDate();
    var h = d.getHours();
    var note = (h >= OWNER_HOURS[0] && h < OWNER_HOURS[1]) ? T.ownerWork
             : (h >= OWNER_HOURS[1] && h < 23) ? T.ownerEve
             : T.ownerNight;
    el.innerHTML = '<b>' + T.ownerNow + ' ' + pad2(h) + ':' + pad2(d.getMinutes()) + '</b> — ' + note;
    el.classList.toggle('is-night', !(h >= OWNER_HOURS[0] && h < OWNER_HOURS[1]));
  };
  tick();
  setInterval(tick, 30000);
})();

/* ---------------- ФОРМА ---------------- */

(function () {
  var form = $('#leadForm');
  if (!form) return;

  var status = $('#formStatus');
  var submitBtn = $('#submitBtn');
  var openedAt = Date.now();

  var tzSel = $('#f-tz');
  var callSel = $('#f-call');
  var callHint = $('#callHint');

  /* Часовые пояса: список смещений, свой определяется автоматически */
  var myOffset = Math.round(-new Date().getTimezoneOffset() / 60);
  if (tzSel && !tzSel.options.length) {
    for (var off = -11; off <= 13; off++) {
      var city = T.tzCities[off];
      var label = 'UTC' + (off >= 0 ? '+' : '−') + pad2(Math.abs(off)) + ':00' + (city ? ' · ' + city : '');
      if (off === myOffset) label += ' — ' + T.tzYours;
      var o = document.createElement('option');
      o.value = String(off);
      o.textContent = label;
      if (off === myOffset) o.selected = true;
      tzSel.appendChild(o);
    }
  }

  /* Окно звонка: подписи из словаря языка */
  if (callSel && !callSel.options.length) {
    T.callOpts.forEach(function (pair) {
      var o = document.createElement('option');
      o.value = pair[0];
      o.textContent = pair[1];
      callSel.appendChild(o);
    });
  }

  /* Пересчёт выбранного окна в благовещенское время */
  function updateCallHint() {
    if (!callHint || !callSel || !tzSel) return;
    var v = callSel.value;
    if (v === 'now') { callHint.textContent = T.callNowNote; return; }
    if (v === 'mail') { callHint.textContent = T.callMailNote; return; }
    var parts = v.split('-');
    var shift = OWNER_UTC_OFFSET - parseInt(tzSel.value, 10);
    var a = (parseInt(parts[0], 10) + shift + 24) % 24;
    var b = (parseInt(parts[1], 10) + shift + 24) % 24;
    callHint.textContent = T.meansThere + pad2(a) + ':00–' + pad2(b) + ':00' + (LANG === 'cn' ? '。' : '.');
  }
  if (callSel) callSel.addEventListener('change', updateCallHint);
  if (tzSel) tzSel.addEventListener('change', updateCallHint);
  updateCallHint();

  function setInvalid(input, invalid) {
    var field = input.closest('.field');
    if (field) field.classList.toggle('invalid', invalid);
  }

  function fallbackContacts() {
    var parts = [];
    if (CONTACTS.email) parts.push(T.writeTo + '<a href="mailto:' + CONTACTS.email + '">' + CONTACTS.email + '</a>');
    if (CONTACTS.telegram) parts.push(T.inTelegram + '<a href="https://t.me/' + CONTACTS.telegram + '" target="_blank" rel="noopener">@' + CONTACTS.telegram + '</a>');
    return parts.length ? T.formDownBoth + parts.join(T.or) + '.' : T.formDownPlain;
  }

  /* Значения полей в порядке словаря T.mailFields */
  function collect() {
    var callLabel = callSel && callSel.selectedIndex >= 0 ? callSel.options[callSel.selectedIndex].text : '';
    var tzLabel = tzSel && tzSel.selectedIndex >= 0 ? tzSel.options[tzSel.selectedIndex].text : '';
    var d = ownerDate();
    return {
      name: $('#f-name').value.trim(),
      company: $('#f-company').value.trim(),
      phone: $('#f-phone').value.trim(),
      email: $('#f-email').value.trim(),
      city: $('#f-city') ? $('#f-city').value.trim() : '',
      tz: tzLabel,
      call: callLabel,
      interest: $('#f-interest').value,
      comment: $('#f-comment').value.trim(),
      lang: LANG,
      page: location.href,
      ownerTime: pad2(d.getHours()) + ':' + pad2(d.getMinutes())
    };
  }

  function asText(v) {
    return [
      'Заявка с hub28.ru',
      '',
      'Имя: ' + v.name,
      'Компания: ' + (v.company || '—'),
      'Телефон: ' + (v.phone || '—'),
      'E-mail: ' + (v.email || '—'),
      'Город: ' + (v.city || '—'),
      'Часовой пояс: ' + v.tz,
      'Когда звонить: ' + v.call,
      'Формат интереса: ' + v.interest,
      'Комментарий: ' + (v.comment || '—'),
      '',
      'Язык страницы: ' + v.lang + ' · ' + v.page,
      'Отправлено в ' + v.ownerTime + ' по Благовещенску'
    ].join('\n');
  }

  function succeed(v) {
    form.reset();
    if (tzSel) tzSel.value = String(myOffset);
    updateCallHint();
    status.className = 'form-status ok';
    status.textContent = T.sent;
    showToast(T.toastTitle, T.toastText);
    track('lead_form');
  }

  function fail() {
    status.className = 'form-status err';
    status.innerHTML = fallbackContacts();
  }

  /* Последний рубеж: обработчик не настроен — собираем письмо в почтовом
     клиенте посетителя, чтобы заявка не потерялась молча. */
  function viaMailto(v) {
    if (!CONTACTS.email) { fail(); return; }
    window.location.href = 'mailto:' + CONTACTS.email +
      '?subject=' + encodeURIComponent(T.mailSubject) +
      '&body=' + encodeURIComponent(asText(v));
    status.className = 'form-status ok';
    status.innerHTML = T.mailOpened + '<br>' + T.mailFallback +
      '<a href="mailto:' + CONTACTS.email + '">' + CONTACTS.email + '</a>' +
      (CONTACTS.phone ? T.mailOrCall + '<a href="tel:' + CONTACTS.phone.replace(/[^\d+]/g, '') + '">' + CONTACTS.phone + '</a>' : '') + '.';
    showToast(T.toastTitle, T.toastText);
    track('lead_form');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    var name = $('#f-name');
    var phone = $('#f-phone');
    var email = $('#f-email');
    var interest = $('#f-interest');
    var consent = $('#f-consent');
    var honeypot = form.querySelector('[name="website"]');

    var ok = true;

    setInvalid(name, !name.value.trim()); if (!name.value.trim()) ok = false;

    var hasPhone = phone.value.trim().length >= 6;
    var hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!hasPhone && !hasEmail) {
      setInvalid(phone, true);
      setInvalid(email, email.value.trim().length > 0);
      ok = false;
    } else {
      setInvalid(phone, false);
      setInvalid(email, email.value.trim().length > 0 && !hasEmail);
      if (email.value.trim().length > 0 && !hasEmail) ok = false;
    }

    setInvalid(interest, !interest.value); if (!interest.value) ok = false;
    setInvalid(consent, !consent.checked); if (!consent.checked) ok = false;

    if (!ok) return;

    /* антиспам: honeypot и время заполнения */
    if (honeypot && honeypot.value) return;
    if (Date.now() - openedAt < 3000) return;

    var v = collect();

    if (!FORM_ENDPOINT && !TELEGRAM.token) { viaMailto(v); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = T.sending;

    var req = FORM_ENDPOINT
      ? fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(Object.assign({ _subject: T.mailSubject, text: asText(v) }, v))
        })
      : fetch('https://api.telegram.org/bot' + TELEGRAM.token + '/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM.chatId, text: asText(v), disable_web_page_preview: true })
        });

    req.then(function (r) {
      if (!r.ok) throw new Error('form endpoint error');
      succeed(v);
    }).catch(function () {
      /* канал не ответил — не теряем заявку, отдаём её в почтовый клиент */
      viaMailto(v);
    }).finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = T.submit;
    });
  });
})();

/* ---------------- КОПИРОВАНИЕ КАДАСТРОВЫХ НОМЕРОВ ---------------- */

(function () {
  $all('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy');
      var done = function () {
        var old = btn.textContent;
        btn.textContent = T.copied;
        btn.classList.add('is-done');
        setTimeout(function () { btn.textContent = old; btn.classList.remove('is-done'); }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, function () { fallback(value, done); });
      } else {
        fallback(value, done);
      }
    });
  });
  function fallback(value, done) {
    var ta = document.createElement('textarea');
    ta.value = value;
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* остаётся выделение номера на странице */ }
    document.body.removeChild(ta);
  }
})();

/* ---------------- ЛУПА ПЕРВОГО ЭКРАНА ----------------
   Базовый слой — реальный спутник, под круглой маской — проектная
   визуализация того же кадра. Слои выровнены по контуру участка. */

(function () {
  var stage = $('#lensStage');
  if (!stage) return;
  var layer = $('#lensLayer');
  var tabs = $all('.lens-tab');
  var demoDone = false;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* На тач-экране курсора нет — меняем подсказку */
  if (window.matchMedia('(hover: none)').matches) {
    var hint = $('#lensHint');
    if (hint) hint.textContent = T.lensHintTouch;
  }

  function radius() {
    var w = stage.clientWidth;
    return Math.max(90, Math.min(190, Math.round(w * 0.22)));
  }
  function setLens(x, y) {
    stage.style.setProperty('--lens-x', x + 'px');
    stage.style.setProperty('--lens-y', y + 'px');
    stage.style.setProperty('--lens-r', radius() + 'px');
  }
  function activate(on) {
    stage.classList.toggle('is-active', on);
  }

  stage.addEventListener('pointermove', function (e) {
    var r = stage.getBoundingClientRect();
    demoDone = true;
    activate(true);
    setLens(e.clientX - r.left, e.clientY - r.top);
  });
  stage.addEventListener('pointerleave', function () {
    if (window.matchMedia('(hover: none)').matches) return; /* на тач-экране лупа остаётся */
    activate(false);
  });
  stage.addEventListener('pointerdown', function (e) {
    var r = stage.getBoundingClientRect();
    demoDone = true;
    activate(true);
    setLens(e.clientX - r.left, e.clientY - r.top);
  });

  /* Переключение сценария под лупой */
  var SRC = {
    terminal: 'lens-terminal',
    sklad: 'lens-sklad',
    container: 'lens-container',
    wagons: 'lens-wagons'
  };
  tabs.forEach(function (btn) {
    var key = btn.getAttribute('data-layer');
    var preload = function () {
      var i = new Image();
      i.src = BASE + 'assets/' + SRC[key] + '-1200.webp';
    };
    btn.addEventListener('mouseenter', preload, { once: true });
    btn.addEventListener('click', function () {
      tabs.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var base = SRC[key];
      layer.srcset = BASE + 'assets/' + base + '-768.webp 768w, ' + BASE + 'assets/' + base + '-1200.webp 1200w, ' + BASE + 'assets/' + base + '-1600.webp 1600w';
      layer.src = BASE + 'assets/' + base + '-1200.jpg';
      activate(true);
    });
  });

  /* Одноразовая демонстрация: показать, что здесь интерактив */
  function demo() {
    if (demoDone || reduce) return;
    var w = stage.clientWidth, h = stage.clientHeight;
    var t0 = null, dur = 2600;
    activate(true);
    var step = function (ts) {
      /* пользователь перехватил управление — просто прекращаем показ,
         лупу не гасим: курсор уже внутри кадра */
      if (demoDone) return;
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setLens(w * (0.28 + 0.44 * e), h * (0.62 - 0.34 * e));
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(function () { if (!demoDone) activate(false); }, 500);
    };
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { setTimeout(demo, 700); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(stage);
  }

  window.addEventListener('resize', function () {
    stage.style.setProperty('--lens-r', radius() + 'px');
  }, { passive: true });
})();

/* ---------------- ЛАЙТБОКС ---------------- */

(function () {
  var box = $('#lightbox');
  if (!box) return;
  var img = $('#lbImg');
  var video = $('#lbVideo');
  var cap = $('#lbCaption');
  var closeBtn = $('#lbClose');
  var lastFocus = null;

  /* href — изображение, data-video — ролик сценария (если есть, показываем его) */
  function open(href, caption, alt, videoSrc, poster) {
    lastFocus = document.activeElement;
    if (videoSrc) {
      img.hidden = true;
      img.src = '';
      video.hidden = false;
      video.poster = poster || '';
      video.src = videoSrc;
      video.currentTime = 0;
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* автозапуск заблокирован — остаются элементы управления */ });
    } else {
      video.hidden = true;
      video.removeAttribute('src');
      video.load();
      img.hidden = false;
      img.src = href;
      img.alt = alt || '';
    }
    cap.textContent = caption || '';
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function close() {
    box.hidden = true;
    img.src = '';
    if (!video.hidden) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.hidden = true;
    }
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a.lightbox-link');
    if (link) {
      e.preventDefault();
      var innerImg = link.querySelector('img');
      open(
        link.getAttribute('href'),
        link.getAttribute('data-caption'),
        innerImg ? innerImg.alt : '',
        link.getAttribute('data-video'),
        innerImg ? innerImg.getAttribute('src') : ''
      );
      if (link.getAttribute('data-video')) track('play_video');
      return;
    }
    if (!box.hidden && (e.target === box || e.target === closeBtn || e.target.closest('.lb-close'))) close();
  });
  box.addEventListener('click', function (e) {
    if (e.target === img) close();  /* по видео не закрываем — там свои элементы управления */
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !box.hidden) close();
  });
})();

/* ---------------- COOKIE ---------------- */

(function () {
  var bar = $('#cookieBar');
  var btn = $('#cookieOk');
  if (!bar || !btn) return;
  var KEY = 'sb_cookie_ok';
  try {
    if (!localStorage.getItem(KEY)) bar.classList.add('visible');
  } catch (e) { bar.classList.add('visible'); }
  btn.addEventListener('click', function () {
    bar.classList.remove('visible');
    try { localStorage.setItem(KEY, '1'); } catch (e) { /* приватный режим */ }
  });
})();

/* ---------------- АНАЛИТИКА ---------------- */
/* Счётчики грузятся отложенно: после первого взаимодействия или через 3 с. */

(function () {
  if (!YM_ID && !GA4_ID) return;
  var loaded = false;

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;

    if (YM_ID) {
      (function (m, e, t, r, i, k, a) {
        m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
        m[i].l = 1 * new Date();
        k = e.createElement(t); a = e.getElementsByTagName(t)[0];
        k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
      })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
      ym(Number(YM_ID), 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
      });
    }

    if (GA4_ID) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', GA4_ID);
    }
  }

  var events = ['scroll', 'click', 'keydown', 'touchstart'];
  var once = function () {
    loadAnalytics();
    events.forEach(function (ev) { window.removeEventListener(ev, once); });
  };
  events.forEach(function (ev) { window.addEventListener(ev, once, { passive: true, once: true }); });
  setTimeout(loadAnalytics, 3000);
})();
