/* Émines de Rien — hero video, parallax, gallery lightbox, direct booking.
   Everything here is an enhancement: with JS off the poster, the photographs,
   the copy and every link still work. */
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
      ? [['./assets/hero-720.mp4', 'video/mp4']]
      : [['./assets/hero-1080.webm', 'video/webm'],
         ['./assets/hero-1080.mp4', 'video/mp4']];

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

  // Don't decode a hero nobody is looking at.
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
    // If a frame was requested but never delivered — a hidden tab, a pane that
    // isn't painting — don't let the pending flag wedge the listener forever.
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

    // Softer travel on phones, where the viewport is short and scroll is fast.
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
    lbCap.textContent = d.a + ' — ' + (lbIndex + 1) + ' of ' + lbData.length;
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
        // Keep focus inside the dialog while it is open.
        var f = lb.querySelectorAll('button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Swipe on touch.
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
    var tomorrow = new Date(today.getTime() + 864e5);
    elIn.min = iso(today);
    elOut.min = iso(tomorrow);

    function nightsBetween() {
      if (!elIn.value || !elOut.value) return 0;
      var a = new Date(elIn.value + 'T00:00:00');
      var b = new Date(elOut.value + 'T00:00:00');
      return Math.round((b - a) / 864e5);
    }

    function syncDates() {
      if (elIn.value) {
        // Check-out must be at least the night after arrival.
        var next = new Date(new Date(elIn.value + 'T00:00:00').getTime() + 864e5);
        elOut.min = iso(next);
        if (elOut.value && elOut.value <= elIn.value) elOut.value = iso(next);
      }
      var n = nightsBetween();
      elNights.textContent = n > 0
        ? n + (n === 1 ? ' night' : ' nights') + ' · arrive from 17:00, leave by 11:00'
        : '';
    }
    elIn.addEventListener('change', syncDates);
    elOut.addEventListener('change', syncDates);
    syncDates();

    function fmt(d) {
      try {
        return new Date(d + 'T00:00:00')
          .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
      } catch (e) { return d; }
    }

    function compose(v) {
      return [
        'Booking request — Émines de Rien',
        '',
        'Check-in:  ' + fmt(v.checkin) + ' (from 17:00)',
        'Check-out: ' + fmt(v.checkout) + ' (by 11:00)',
        'Nights:    ' + v.nights,
        'Guests:    ' + v.guests,
        '',
        'Name:  ' + v.name,
        'Email: ' + v.email,
        'Phone: ' + (v.phone || '—'),
        '',
        'Message:',
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
      };

      if (!v.checkin) return invalid(elIn, 'Please choose your arrival date.');
      if (!v.checkout) return invalid(elOut, 'Please choose your departure date.');
      if (v.nights < 1) return invalid(elOut, 'Check-out needs to be after check-in.');
      if (!v.name) return invalid(document.getElementById('bkName'), 'Please add your name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
        return invalid(document.getElementById('bkEmail'), 'Please check your email address.');
      }

      var body = compose(v);
      var subject = 'Booking request — ' + v.checkin + ' to ' + v.checkout
        + ' (' + v.guests + ' guests)';

      if (BOOKING.endpoint) {
        elSubmit.disabled = true;
        setStatus('Sending your request…');
        fetch(BOOKING.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ _subject: subject, summary: body, ...v }),
        }).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset(); syncDates();
          setStatus('Thank you — your request is on its way. Céline & Stéphane usually reply within the hour.', 'ok');
        }).catch(function () {
          setStatus('That didn’t go through. Please try again in a moment.', 'err');
          offerCopy(body);
        }).then(function () { elSubmit.disabled = false; });
        return;
      }

      if (BOOKING.email) {
        window.location.href = 'mailto:' + BOOKING.email
          + '?subject=' + encodeURIComponent(subject)
          + '&body=' + encodeURIComponent(body);
        setStatus('Your mail app should be opening with the request filled in. If nothing happens, copy it below.', 'ok');
        offerCopy(body);
        return;
      }

      // Nothing configured yet — never leave the guest at a dead end.
      setStatus('Your request is ready to send — copy it across and we’ll confirm your dates.', 'ok');
      offerCopy(body);
    });

    function offerCopy(text) {
      var box = document.getElementById('bkCopy');
      if (!box) {
        box = document.createElement('textarea');
        box.id = 'bkCopy';
        box.className = 'copybox';
        box.setAttribute('readonly', '');
        box.setAttribute('aria-label', 'Your booking request');
        elStatus.after(box);

        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn btn--ghost btn--sm';
        b.style.marginTop = '.7rem';
        b.textContent = 'Copy request';
        b.addEventListener('click', function () {
          box.select();
          var done = function () { b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = 'Copy request'; }, 2200); };
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
