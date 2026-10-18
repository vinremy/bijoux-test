/* Mortier — motion and interactions */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }

  // Letters of the name: each gets its rank for the staggered entrance.
  $$('.hero__title span, .foot__name span').forEach(function (s, k) { s.style.setProperty('--k', k % 7); });

  // 1. Hero: the rings drift with the scroll and lean toward the pointer.
  var hero = $('.hero');
  var piece = $('.hero__piece');
  var title = $('.hero__title');
  var bar = $('.progress');
  var parallax = $$('.workshop__pic');

  if (fine && !reduce && piece) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      piece.style.setProperty('--mx', (x * 24).toFixed(1) + 'px');
      piece.style.setProperty('--my', (y * 14).toFixed(1) + 'px');
    });
    hero.addEventListener('pointerleave', function () { piece.style.setProperty('--mx', '0px'); piece.style.setProperty('--my', '0px'); });
  }

  function onScroll() {
    var vh = window.innerHeight;
    var doc = document.documentElement;
    bar.style.setProperty('--p', (window.scrollY / Math.max(1, doc.scrollHeight - vh)).toFixed(4));
    if (reduce) return;
    var y = Math.min(window.scrollY, vh);
    if (piece) piece.style.setProperty('--py', (y * -0.18).toFixed(1) + 'px');
    if (title) title.style.setProperty('--ty', (y * 0.12).toFixed(1) + 'px');
    parallax.forEach(function (l) {
      var r = l.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var t = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      l.querySelector('img').style.setProperty('--py', (-8 + t * 8).toFixed(2) + '%');
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // 2. Entrances: the parts of each section rise in turn, once.
  var items = $$('[data-reveal]');
  var groups = new Map();
  items.forEach(function (el) {
    var sec = el.closest('section') || document.body;
    var list = groups.get(sec) || [];
    el.style.setProperty('--i', Math.min(list.length, 6));
    list.push(el); groups.set(sec, list);
  });
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // 3. Design process: drag with the mouse, arrows, progress bar.
  var strip = $('.strip');
  if (strip) {
    var sbar = $('.strip__bar i');
    var syncBar = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      sbar.style.setProperty('--sp', max > 0 ? ((strip.scrollLeft + strip.clientWidth) / strip.scrollWidth).toFixed(3) : 1);
    };
    strip.addEventListener('scroll', function () { requestAnimationFrame(syncBar); }, { passive: true });
    window.addEventListener('resize', syncBar);
    window.addEventListener('load', syncBar);
    syncBar();
    var step = function () { return $('.strip__item', strip).offsetWidth + 8; };
    $$('.strip__btn').forEach(function (b) {
      b.addEventListener('click', function () {
        strip.scrollBy({ left: step() * Number(b.getAttribute('data-dir')), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    strip.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      strip.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * step(), behavior: reduce ? 'auto' : 'smooth' });
    });
    var down = false, startX = 0, startL = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startL = strip.scrollLeft;
      strip.classList.add('is-dragging'); strip.setPointerCapture(e.pointerId);
    });
    strip.addEventListener('pointermove', function (e) {
      if (!down) return;
      moved = e.clientX - startX;
      strip.scrollLeft = startL - moved;
    });
    var end = function () {
      if (!down) return;
      down = false; strip.classList.remove('is-dragging');
      if (Math.abs(moved) > 30) strip.scrollTo({ left: Math.round(strip.scrollLeft / step()) * step(), behavior: 'smooth' });
    };
    strip.addEventListener('pointerup', end);
    strip.addEventListener('pointercancel', end);
  }

  // 4. Technical drawing: a dimension lights up on hover or tap.
  var plan = $('.plan');
  var dimBtns = plan ? $$('.dims button') : [];
  function focusDim(key) {
    plan.classList.toggle('is-focus', !!key);
    $$('.plan__dim', plan).forEach(function (g) { g.classList.toggle('is-on', g.getAttribute('data-dim') === key); });
    dimBtns.forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-dim') === key); });
  }
  dimBtns.forEach(function (b) {
    var key = b.getAttribute('data-dim');
    b.addEventListener('mouseenter', function () { focusDim(key); });
    b.addEventListener('mouseleave', function () { focusDim(null); });
    b.addEventListener('focus', function () { focusDim(key); });
    b.addEventListener('blur', function () { focusDim(null); });
    b.addEventListener('click', function () { focusDim(b.classList.contains('is-on') && !fine ? null : key); });
  });
  if (plan) $$('.plan__dim').forEach(function (g) {
    g.addEventListener('mouseenter', function () { focusDim(g.getAttribute('data-dim')); });
    g.addEventListener('mouseleave', function () { focusDim(null); });
  });

  // Two drawings: switch between the technical and the creative one.
  var views = $$('.switch button');
  if (views.length) {
    var dims = $('#dims'), note = $('#creative-note');
    views.forEach(function (v) {
      v.addEventListener('click', function () {
        var creative = v.id === 'view-creative';
        views.forEach(function (o) { var on = o === v; o.classList.toggle('is-on', on); o.setAttribute('aria-selected', on); });
        $('#stage-tech').hidden = creative; $('#stage-creative').hidden = !creative;
        $('#stage-tech').classList.toggle('is-on', !creative); $('#stage-creative').classList.toggle('is-on', creative);
        dims.hidden = creative; note.hidden = !creative;
        if (!creative && plan) { plan.classList.remove('is-in'); void plan.offsetWidth; plan.classList.add('is-in'); }
      });
    });
  }

  // 5. Selected work: hover or click a name, or use the arrow keys.
  var tabs = $$('.showcase__list button');
  var shots = $$('.showcase__frame img');
  var infos = $$('.showcase .info');
  var scCount = $('#sc-count');
  var active = 0;
  function pick(i) {
    if (i === active) return;
    active = i;
    tabs.forEach(function (t, k) { t.classList.toggle('is-on', k === i); t.setAttribute('aria-selected', k === i); });
    shots.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    infos.forEach(function (n, k) { n.hidden = k !== i; n.classList.toggle('is-on', k === i); });
    scCount.textContent = i + 1;
  }
  // A link like work.html#pearl-ring opens that piece.
  var fromHash = tabs.findIndex(function (t) { return '#' + t.getAttribute('data-anchor') === location.hash; });
  if (fromHash > 0) { pick(fromHash); var feat = $('#selected'); if (feat) setTimeout(function () { feat.scrollIntoView(); }, 50); }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { pick(k); });
    if (fine) t.addEventListener('mouseenter', function () { pick(k); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = (active + d + tabs.length) % tabs.length;
      pick(n); tabs[n].focus();
    });
  });

  // 6. More work: filters, "see all", tilt, viewer.
  var cards = $$('.card');
  var buttons = $$('.filters button');
  var more = $('.more');
  var grid = $('#grid');
  var LIMIT = grid && grid.hasAttribute('data-limit') ? Number(grid.getAttribute('data-limit')) || Infinity : 8;
  var expanded = !more, current = 'all';
  function render(animate) {
    var shown = 0, j = 0;
    cards.forEach(function (c) {
      var inCat = current === 'all' || c.getAttribute('data-cat') === current;
      var extra = inCat && current === 'all' && !expanded && shown >= LIMIT;
      if (inCat) shown++;
      c.classList.toggle('is-out', !inCat);
      c.classList.toggle('is-extra', extra);
      c.classList.remove('is-in-filter');
      if (animate && inCat && !extra) {
        c.classList.add('is-in');
        c.style.setProperty('--j', Math.min(j++, 12)); void c.offsetWidth; c.classList.add('is-in-filter');
      }
    });
    if (more) more.hidden = expanded || current !== 'all';
  }
  if (grid) render(false);
  if (more) $('#more').addEventListener('click', function () { expanded = true; render(true); });
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      current = b.getAttribute('data-filter');
      buttons.forEach(function (o) { var on = o === b; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', on); });
      render(true);
    });
  });

  if (fine && !reduce) {
    cards.forEach(function (c) {
      var im = $('img', c);
      c.addEventListener('pointermove', function (e) {
        var r = im.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        im.style.setProperty('--rx', (x * 7).toFixed(2) + 'deg');
        im.style.setProperty('--ry', (-y * 7).toFixed(2) + 'deg');
      });
      c.addEventListener('pointerleave', function () { im.style.setProperty('--rx', '0deg'); im.style.setProperty('--ry', '0deg'); });
    });
  }

  var viewer = $('#viewer');
  if (viewer && cards.length) (function () {
  var vImg = $('#viewer-img'), vName = $('#viewer-name'), vCount = $('#viewer-count'), vMat = $('#viewer-mat');
  var list = [], pos = 0;
  function show(i) {
    pos = (i + list.length) % list.length;
    var c = list[pos], im = $('img', c);
    vImg.src = im.src; vImg.alt = im.alt;
    vName.textContent = $('span', c).textContent;
    vMat.textContent = c.getAttribute('data-mat') || '';
    vCount.textContent = (pos + 1) + ' / ' + list.length;
    vImg.classList.remove('is-new'); void vImg.offsetWidth; vImg.classList.add('is-new');
  }
  cards.forEach(function (c) {
    c.addEventListener('click', function () {
      list = cards.filter(function (o) { return !o.classList.contains('is-out') && !o.classList.contains('is-extra'); });
      show(list.indexOf(c));
      if (viewer.showModal) viewer.showModal(); else viewer.setAttribute('open', '');
    });
  });
  $('.viewer__prev', viewer).addEventListener('click', function () { show(pos - 1); });
  $('.viewer__next', viewer).addEventListener('click', function () { show(pos + 1); });
  $('.viewer__close', viewer).addEventListener('click', function () { viewer.close(); });
  viewer.addEventListener('click', function (e) { if (e.target === viewer) viewer.close(); });
  viewer.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(pos - 1);
    if (e.key === 'ArrowRight') show(pos + 1);
  });
  var sx = null;
  viewer.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(pos + (dx < 0 ? 1 : -1));
    sx = null;
  });
  })();

  // 7. Contact: check the form, then send the message.
  var mail = $('#mail');
  if (mail) {
    var msg = $('#mail-message'), count = $('#mail-count'), status = $('#mail-status'), btn = $('.mail__btn', mail);
    msg.maxLength = 1000;
    msg.addEventListener('input', function () { count.textContent = msg.value.length + ' / 1000'; });
    $$('input, textarea', mail).forEach(function (f) {
      f.addEventListener('input', function () { var fl = f.closest('.field'); if (fl) fl.classList.remove('is-bad'); });
    });
    mail.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      ['mail-name', 'mail-email', 'mail-message'].forEach(function (id) {
        var f = document.getElementById(id);
        var v = f.value.trim();
        var ok = v !== '' && (f.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
        f.closest('.field').classList.toggle('is-bad', !ok);
        if (!ok && !bad) bad = f;
      });
      if (bad) {
        status.classList.remove('is-ok');
        status.textContent = bad.id === 'mail-email' && bad.value ? 'This email address does not look right.' : 'Please fill in your ' + bad.previousElementSibling.textContent.toLowerCase() + '.';
        bad.focus();
        return;
      }
      var data = {
        name: $('#mail-name').value.trim(),
        email: $('#mail-email').value.trim(),
        topic: $('input[name="topic"]:checked', mail).value,
        message: msg.value.trim()
      };
      var endpoint = mail.getAttribute('data-endpoint');
      var done = function () { mail.classList.add('is-sent'); status.classList.add('is-ok'); btn.disabled = false; };
      if (endpoint) {
        btn.disabled = true;
        status.classList.remove('is-ok');
        status.textContent = 'Sending…';
        fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) {
            if (!r.ok) throw new Error();
            done(); mail.reset(); count.textContent = '0 / 1000';
            status.textContent = 'Thank you ' + data.name + ', your message is on its way. I will reply soon.';
          })
          .catch(function () {
            btn.disabled = false;
            status.textContent = 'The message could not be sent. Please try again, or write directly to ' + mail.getAttribute('data-to') + '.';
          });
      } else {
        var body = data.message + '\n\n— ' + data.name + ' (' + data.email + ')';
        window.location.href = 'mailto:' + mail.getAttribute('data-to') +
          '?subject=' + encodeURIComponent(data.topic + ' — ' + data.name) + '&body=' + encodeURIComponent(body);
        done();
        status.textContent = 'Your email app opens with the message ready. All that is left is to press send.';
      }
    });
  }
})();
