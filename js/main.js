/* Mortier — comportements de la page */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Dessins : tout élément [data-piece] reçoit son SVG.
  document.querySelectorAll('[data-piece]').forEach(function (el) {
    try { el.insertAdjacentHTML('afterbegin', window.Mortier.draw(JSON.parse(el.getAttribute('data-piece')))); } catch (e) {}
  });

  // 1. Ouverture épinglée : les pièces se relaient sous le nom au fil du défilement.
  var hero = document.querySelector('.hero');
  var stage = hero && hero.querySelector('.hero__stage');
  var frames = hero ? [].slice.call(hero.querySelectorAll('.frame')) : [];
  var action = hero && hero.querySelector('.hero__action');
  var current = -1;
  if (hero) hero.style.setProperty('--n', frames.length);

  function setFrame(i) {
    if (i === current || !frames[i]) return;
    current = i;
    frames.forEach(function (f, k) { f.classList.toggle('is-on', k === i); });
    stage.style.setProperty('--page', frames[i].getAttribute('data-page'));
    frames[i].style.setProperty('--ground', frames[i].getAttribute('data-ground'));
  }
  function onScroll() {
    if (!hero) return;
    var rect = hero.getBoundingClientRect();
    var span = hero.offsetHeight - window.innerHeight;
    var p = span > 0 ? Math.min(0.999, Math.max(0, -rect.top / span)) : 0;
    setFrame(Math.floor(p * frames.length));
    if (action) action.classList.toggle('is-hidden', rect.bottom < window.innerHeight * 0.6);
  }
  frames.forEach(function (f) { f.style.setProperty('--ground', f.getAttribute('data-ground')); });
  setFrame(0);
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // 2. Entrées : chaque partie d'une section monte à son tour, une seule fois.
  var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
  var groups = new Map();
  items.forEach(function (el) {
    var sec = el.closest('section') || document.body;
    var list = groups.get(sec) || [];
    el.style.setProperty('--i', Math.min(list.length, 8));
    list.push(el); groups.set(sec, list);
  });
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // 3. Composer sa pièce : le dessin et la demande suivent les choix.
  var form = document.getElementById('maker');
  if (form) {
    var art = document.getElementById('maker-art');
    var sum = document.getElementById('maker-sum');
    var send = document.getElementById('maker-send');
    var cutBox = document.getElementById('opt-cut');
    var mail = 'atelier@mortier.ca';

    var update = function () {
      var o = {};
      ['type', 'metal', 'finish', 'stone', 'cut'].forEach(function (n) {
        var c = form.querySelector('input[name="' + n + '"]:checked');
        o[n] = c ? c.value : '';
      });
      var noStone = o.stone === 'aucune';
      cutBox.classList.toggle('is-off', noStone);
      var text = window.Mortier.describe(o) + '.';
      art.innerHTML = window.Mortier.draw(o);
      art.setAttribute('aria-label', text);
      sum.textContent = text;
      var body = 'Bonjour,\n\nJ\'aimerais discuter d\'une pièce sur mesure.\n\nPoint de départ : ' + text +
        '\n\nCe que j\'imagine :\n\nPour quand :\n\nMerci !';
      send.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Une pièce sur mesure : ' + window.Mortier.describe(o)) +
        '&body=' + encodeURIComponent(body);
    };
    form.addEventListener('change', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); window.location.href = send.href; });
    update();
  }
})();
