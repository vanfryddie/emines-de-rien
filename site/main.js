/* Émines de Rien — hero video, parallax, gallery lightbox, direct booking.
   Shared by every language: each page ships its own strings in #i18n.
   Everything here is an enhancement — with JS off the poster, the
   photographs, the copy and every link still work. */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════
     ► SET ONE OF THESE TWO AND THE BOOKING FORM GOES LIVE.

       endpoint — a form service URL (Formspree, Basin, Netlify Forms…).
                  The request is POSTed as JSON; hosts get an email.
                  e.g. 'https://formspree.io/f/xxxxxxxx'

       email    — the hosts' address. The guest's mail app opens with the
                  whole request pre-filled and ready to send.
                  e.g. 'bonjour@eminesderien.com'

     Leave both empty and the form still works: it composes the request and
     offers it for copying, so nobody ever hits a dead end.
     ══════════════════════════════════════════════════════════════════ */
  var BOOKING = {
    endpoint: '',
    email: '',
  };

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── this page's strings ───────────────────────────────────────── */
  var T = {};
  try {
    var tEl = document.getElementById('i18n');
    if (tEl) T = JSON.parse(tEl.textContent);
  } catch (e) { T = {}; }
  var LOCALE = T.locale || root.lang || 'en';

  function fill(s, vars) {
    return String(s || '').replace(/\{(\w+)\}/g, function (m, k) {
      return (k in vars) ? vars[k] : m;
    });
  }

  /** Slavic plural categories differ; Polish needs one / few / many. */
  function nightsLabel(n) {
    var f = T.nights || { one: '{n} night', other: '{n} nights' };
    var form;
    if (T.code === 'pl') {
      var m10 = n % 10, m100 = n % 100;
      if (n === 1) form = f.one;
      else if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) form = f.few;
      else form = f.many;
    } else {
      form = (n === 1) ? f.one : (f.other || f.many || f.one);
    }
    return fill(form, { n: n });
  }

  /* ── reveals ───────────────────────────────────────────────────── */
  if (!reduced.matches) root.classList.add('js-anim');

  var reveals = document.querySelectorAll('.reveal');
  reveals.forEach(function (el) {
    if (el.dataset.d) el.style.setProperty('--d', el.dataset.d);
  });

  if ('IntersectionObserver' in window && !reduced.matches) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── hero video ────────────────────────────────────────────────── */
  var video = document.getElementById('heroVideo');
  var base = root.lang && document.querySelector('link[rel="stylesheet"]')
    ? (document.querySelector('link[href$="styles.css"]').getAttribute('href')
        .replace('styles.css', '')) : './';

  function connectionIsThin() {
    var c = navigator.connection;
    if (!c) return false;
    if (c.saveData) return true;
    return /^(slow-2g|2g)$/.test(c.effectiveType || '');
  }

  function attachVideo() {
    if (!video || video.dataset.ready) return;
    // Honour motion preference and metered data: the poster is the loop's
    // own first frame, so the hero never looks broken without it.
    if (reduced.matches || connectionIsThin()) return;

    var narrow = window.matchMedia('(max-width: 899px)').matches;
    var sources = narrow
      ? [[base + 'assets/hero-720.mp4', 'video/mp4']]
      : [[base + 'assets/hero-1080.webm', 'video/webm'],
         [base + 'assets/hero-1080.mp4', 'video/mp4']];

    sources.forEach(function (s) {
      var el = document.createElement('source');
      el.src = s[0]; el.type = s[1];
      video.appendChild(el);
    });

    video.dataset.ready = '1';
    video.addEventListener('playing', function () {
      video.classList.add('is-playing');
    }, { once: true });

    video.load();
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () {});
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(attachVideo, { timeout: 1600 });
  } else {
    window.addEventListener('load', function () { setTimeout(attachVideo, 220); });
  }

  function playVideo() {
    if (!video || !video.dataset.ready) return;
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () {});
  }

  var hero = document.querySelector('.hero');
  if (video && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) playVideo(); else video.pause();
      });
    }, { threshold: 0.05 }).observe(hero);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (video) video.pause(); } else playVideo();
  });

  /* ── scroll: nav state + layered parallax ──────────────────────── */

  var nav = document.getElementById('nav');
  var para = document.getElementById('para');
  var layers = para
    ? Array.prototype.slice.call(para.querySelectorAll('.para__layer')) : [];

  var paraVisible = false;
  if (para && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      paraVisible = entries[0].isIntersecting;
      if (paraVisible) request();
    }, { rootMargin: '120px 0px' }).observe(para);
  } else {
    paraVisible = true;
  }

  var ticking = false, lastReq = 0;
  function request() {
    var now = Date.now();
    // If a frame was requested but never delivered — a hidden tab, a pane
    // that isn't painting — don't let the flag wedge the listener forever.
    if (ticking && now - lastReq < 400) return;
    ticking = true;
    lastReq = now;
    requestAnimationFrame(update);
  }

  function update() {
    ticking = false;
    var y = window.pageYOffset || root.scrollTop;
    if (nav) nav.classList.toggle('is-stuck', y > 40);

    if (!layers.length || !paraVisible || reduced.matches) return;

    var rect = para.getBoundingClientRect();
    var vh = window.innerHeight || root.clientHeight;
    // -1 entering from below, +1 once it has left above.
    var progress = (vh / 2 - (rect.top + rect.height / 2)) / ((vh + rect.height) / 2);
    if (progress < -1) progress = -1; else if (progress > 1) progress = 1;

    // Softer travel on phones, where the viewport is short and scroll fast.
    var range = window.innerWidth < 700 ? 52 : 108;

    for (var i = 0; i < layers.length; i++) {
      var d = parseFloat(layers[i].dataset.depth) || 0;
      layers[i].style.transform =
        'translate3d(0,' + (-progress * range * d).toFixed(2) + 'px,0)';
    }
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });

  function onMotionChange() {
    if (!reduced.matches) return;
    root.classList.remove('js-anim');
    layers.forEach(function (l) { l.style.transform = ''; });
    if (video) video.pause();
  }
  if (reduced.addEventListener) reduced.addEventListener('change', onMotionChange);
  else if (reduced.addListener) reduced.addListener(onMotionChange);

  update();

  /* ── language menu: close on outside click / Escape ────────────── */
  var lang = document.querySelector('.lang');
  if (lang) {
    document.addEventListener('click', function (e) {
      if (lang.open && !lang.contains(e.target)) lang.open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lang.open) {
        lang.open = false;
        lang.querySelector('summary').focus();
      }
    });
  }

  /* ── gallery lightbox ──────────────────────────────────────────── */

  var lbData = [];
  try {
    var dataEl = document.getElementById('lbData');
    if (dataEl) lbData = JSON.parse(dataEl.textContent);
  } catch (e) { lbData = []; }

  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbIndex = 0;
  var lastFocus = null;

  function lbShow(i) {
    if (!lbData.length) return;
    lbIndex = (i + lbData.length) % lbData.length;
    var d = lbData[lbIndex];
    lbImg.src = d.s;
    lbImg.alt = d.a;
    lbCap.textContent = d.a + ' — '
      + fill(T.of || '{i} of {n}', { i: lbIndex + 1, n: lbData.length });
  }

  function lbOpen(i) {
    if (!lb) return;
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lbShow(i);
    document.getElementById('lbClose').focus();
  }

  function lbClose() {
    if (!lb) return;
    lb.hidden = true;
    document.body.style.overflow = '';
    lbImg.removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  var grid = document.getElementById('grid');
  if (grid && lb) {
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.grid__btn');
      if (btn) lbOpen(parseInt(btn.dataset.i, 10) || 0);
    });
    document.getElementById('lbClose').addEventListener('click', lbClose);
    document.getElementById('lbPrev').addEventListener('click', function () { lbShow(lbIndex - 1); });
    document.getElementById('lbNext').addEventListener('click', function () { lbShow(lbIndex + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });

    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
      else if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
      else if (e.key === 'Tab') {
        var f = lb.querySelectorAll('button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    var tx = 0, ty = 0;
    lb.addEventListener('touchstart', function (e) {
      tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      var dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ── direct booking ────────────────────────────────────────────── */

  var form = document.getElementById('bookForm');
  if (form) {
    var elIn = document.getElementById('bkIn');
    var elOut = document.getElementById('bkOut');
    var elGuests = document.getElementById('bkGuests');
    var elNights = document.getElementById('bkNights');
    var elStatus = document.getElementById('bkStatus');
    var elSubmit = document.getElementById('bkSubmit');

    // Format from local parts: toISOString() is UTC, which lands a day early
    // for anyone east of Greenwich — including Belgium.
    var iso = function (d) {
      var m = d.getMonth() + 1, day = d.getDate();
      return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m
        + '-' + (day < 10 ? '0' : '') + day;
    };

    var today = new Date();
    elIn.min = iso(today);
    elOut.min = iso(new Date(today.getTime() + 864e5));

    function nightsBetween() {
      if (!elIn.value || !elOut.value) return 0;
      var a = new Date(elIn.value + 'T00:00:00');
      var b = new Date(elOut.value + 'T00:00:00');
      return Math.round((b - a) / 864e5);
    }

    function syncDates() {
      if (elIn.value) {
        var next = new Date(new Date(elIn.value + 'T00:00:00').getTime() + 864e5);
        elOut.min = iso(next);
        if (elOut.value && elOut.value <= elIn.value) elOut.value = iso(next);
      }
      var n = nightsBetween();
      elNights.textContent = n > 0 ? nightsLabel(n) + ' · ' + (T.arrive || '') : '';
    }
    elIn.addEventListener('change', syncDates);
    elOut.addEventListener('change', syncDates);
    syncDates();

    function fmt(d) {
      try {
        return new Date(d + 'T00:00:00').toLocaleDateString(LOCALE,
          { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
      } catch (e) { return d; }
    }

    function compose(v) {
      var c = T.c || {};
      return [
        c.head || 'Booking request — Émines de Rien',
        '',
        (c.in || 'Check-in') + ':  ' + fmt(v.checkin) + ' (' + (c.from || '') + ')',
        (c.out || 'Check-out') + ': ' + fmt(v.checkout) + ' (' + (c.by || '') + ')',
        (c.nights || 'Nights') + ':    ' + v.nights,
        (c.guests || 'Guests') + ':    ' + v.guests,
        '',
        (c.name || 'Name') + ':  ' + v.name,
        (c.email || 'Email') + ': ' + v.email,
        (c.phone || 'Phone') + ': ' + (v.phone || '—'),
        '',
        (c.msg || 'Message') + ':',
        (v.message || '—'),
      ].join('\n');
    }

    function setStatus(msg, kind) {
      elStatus.textContent = msg;
      elStatus.className = 'book__status' + (kind ? ' is-' + kind : '');
    }

    function invalid(el, msg) {
      el.setAttribute('aria-invalid', 'true');
      el.focus();
      setStatus(msg, 'err');
      return false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ['bkIn', 'bkOut', 'bkName', 'bkEmail'].forEach(function (id) {
        document.getElementById(id).removeAttribute('aria-invalid');
      });

      var v = {
        checkin: elIn.value,
        checkout: elOut.value,
        nights: nightsBetween(),
        guests: elGuests.value,
        name: document.getElementById('bkName').value.trim(),
        email: document.getElementById('bkEmail').value.trim(),
        phone: document.getElementById('bkPhone').value.trim(),
        message: document.getElementById('bkMsg').value.trim(),
        lang: T.code || root.lang,
      };

      if (!v.checkin) return invalid(elIn, T.errIn);
      if (!v.checkout) return invalid(elOut, T.errOut);
      if (v.nights < 1) return invalid(elOut, T.errOrder);
      if (!v.name) return invalid(document.getElementById('bkName'), T.errName);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
        return invalid(document.getElementById('bkEmail'), T.errEmail);
      }

      var body = compose(v);
      var subject = fill(T.subject || 'Booking request — {a} to {b} ({g} guests)',
        { a: v.checkin, b: v.checkout, g: v.guests });

      if (BOOKING.endpoint) {
        elSubmit.disabled = true;
        setStatus(T.sending);
        fetch(BOOKING.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ _subject: subject, summary: body, ...v }),
        }).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset(); syncDates();
          setStatus(T.sent, 'ok');
        }).catch(function () {
          setStatus(T.failed, 'err');
          offerCopy(body);
        }).then(function () { elSubmit.disabled = false; });
        return;
      }

      if (BOOKING.email) {
        window.location.href = 'mailto:' + BOOKING.email
          + '?subject=' + encodeURIComponent(subject)
          + '&body=' + encodeURIComponent(body);
        setStatus(T.mailHint, 'ok');
        offerCopy(body);
        return;
      }

      // Nothing configured yet — never leave the guest at a dead end.
      setStatus(T.ready, 'ok');
      offerCopy(body);
    });

    function offerCopy(text) {
      var box = document.getElementById('bkCopy');
      if (!box) {
        box = document.createElement('textarea');
        box.id = 'bkCopy';
        box.className = 'copybox';
        box.setAttribute('readonly', '');
        box.setAttribute('aria-label', T.copyLabel || 'Your booking request');
        elStatus.after(box);

        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn btn--ghost btn--sm';
        b.style.marginTop = '.7rem';
        b.textContent = T.copy || 'Copy request';
        b.addEventListener('click', function () {
          box.select();
          var done = function () {
            b.textContent = T.copied || 'Copied';
            setTimeout(function () { b.textContent = T.copy || 'Copy request'; }, 2200);
          };
          if (navigator.clipboard) navigator.clipboard.writeText(box.value).then(done, done);
          else { try { document.execCommand('copy'); done(); } catch (e) {} }
        });
        box.after(b);
      }
      box.value = text;
    }
  }

  /* ── odds and ends ─────────────────────────────────────────────── */

  var cue = document.querySelector('.scroll-cue');
  if (cue) cue.addEventListener('click', function () {
    var t = document.getElementById('about');
    if (t) t.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
  });

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
