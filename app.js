/* ============================================================
   Площадка Среднебелая — app.js
   Все настраиваемые значения — в блоке КОНФИГУРАЦИЯ ниже.
   ============================================================ */

/* ---------------- КОНФИГУРАЦИЯ ---------------- */

// Боевой адрес сайта (используется только для аналитики/отладки; canonical и
// метатеги задаются статически в index.html — заменить там поиском-заменой).
var SITE_URL = 'https://hub28.ru';

// Языковые версии: переключить на true, когда /en/ и /cn/ готовы.
var LANGS_READY = false;

// PDF-тизер: переключить на true, когда файл assets/teaser.pdf загружен.
var TEASER_READY = false;

// Контакты Евгения — подставить перед публикацией.
// Пока значения пустые, на странице остаётся «указывается при публикации».
var CONTACTS = {
  phone: '+7 914 550-05-03',
  email: 'tumoff@mail.ru',
  telegram: '',   // формат: 'username' (без @)
  max: ''         // полная ссылка на профиль в MAX, например 'https://max.ru/u/...'
};

// Приём заявок: FormSubmit (AJAX) — пересылает заявки на почту.
// Первая отправка требует одноразового подтверждения по письму на этот адрес.
var FORM_ENDPOINT = 'https://formsubmit.co/ajax/tumoff@mail.ru';

// Аналитика. Пустая строка = счётчик не грузится.
var YM_ID = '';   // Яндекс.Метрика, номер счётчика
var GA4_ID = '';  // Google Analytics 4, опционально

// Координаты точек карты [долгота, широта].
// ВНИМАНИЕ: координаты площадки — приблизительные, заменить на центроид
// участка из выписки ЕГРН перед публикацией (открытая позиция № 3 ТЗ).
var MAP_POINTS = [
  { name: 'Площадка Среднебелая, 11,07 га', note: '', coords: [128.058, 50.678], main: true },
  { name: 'Станция примыкания, Забайкальская ж/д', note: 'станция Среднебелая', coords: [128.052, 50.672] },
  { name: 'Контейнерный терминал, запуск 2026', note: 'сухой порт «Благовещенск» — 12 км по железной дороге', coords: [128.135, 50.605] },
  { name: 'ПЛК «Дальагротерминал», МЭЗ «Амурский»', note: 'Белогорск — 60 км', coords: [128.474, 50.921] },
  { name: 'Пункт пропуска на границе с КНР', note: 'автомобильный мост Благовещенск — Хэйхэ — около 70 км', coords: [127.588, 50.196] },
  { name: 'Административный центр области', note: 'Благовещенск — 75 км', coords: [127.535, 50.290] }
];

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
    css.href = 'assets/vendor/maplibre-gl.css';
    document.head.appendChild(css);

    var js = document.createElement('script');
    js.src = 'assets/vendor/maplibre-gl.js';
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

/* ---------------- ФОРМА ---------------- */

(function () {
  var form = $('#leadForm');
  if (!form) return;

  var status = $('#formStatus');
  var submitBtn = $('#submitBtn');
  var openedAt = Date.now();

  function setInvalid(input, invalid) {
    var field = input.closest('.field');
    if (field) field.classList.toggle('invalid', invalid);
  }

  function fallbackContacts() {
    var parts = [];
    if (CONTACTS.email) parts.push('напишите на <a href="mailto:' + CONTACTS.email + '">' + CONTACTS.email + '</a>');
    if (CONTACTS.telegram) parts.push('в Telegram: <a href="https://t.me/' + CONTACTS.telegram + '" target="_blank" rel="noopener">@' + CONTACTS.telegram + '</a>');
    return parts.length ? 'Форма временно недоступна — ' + parts.join(' или ') + '.' : 'Форма временно недоступна. Попробуйте отправить заявку позднее.';
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

    if (!FORM_ENDPOINT) {
      status.className = 'form-status err';
      status.innerHTML = fallbackContacts();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';

    var payload = {
      _subject: 'Заявка с hub28.ru — площадка Среднебелая',
      name: name.value.trim(),
      company: $('#f-company').value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      interest: interest.value,
      comment: $('#f-comment').value.trim(),
      page: location.href
    };

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error('form endpoint error');
      form.reset();
      status.className = 'form-status ok';
      status.textContent = 'Заявка отправлена. Мы вернёмся к вам в течение одного рабочего дня.';
      track('lead_form');
    }).catch(function () {
      status.className = 'form-status err';
      status.innerHTML = fallbackContacts();
    }).finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить заявку';
    });
  });
})();

/* ---------------- ЛАЙТБОКС ---------------- */

(function () {
  var box = $('#lightbox');
  if (!box) return;
  var img = $('#lbImg');
  var cap = $('#lbCaption');
  var closeBtn = $('#lbClose');
  var lastFocus = null;

  function open(href, caption, alt) {
    lastFocus = document.activeElement;
    img.src = href;
    img.alt = alt || '';
    cap.textContent = caption || '';
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function close() {
    box.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a.lightbox-link');
    if (link) {
      e.preventDefault();
      var innerImg = link.querySelector('img');
      open(link.getAttribute('href'), link.getAttribute('data-caption'), innerImg ? innerImg.alt : '');
      return;
    }
    if (!box.hidden && (e.target === box || e.target === closeBtn || e.target.closest('.lb-close'))) close();
  });
  box.addEventListener('click', function (e) {
    if (e.target === img) close();
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
