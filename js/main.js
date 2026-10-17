/* Mortier — animations et interactions */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Lettres du nom : chacune reçoit son rang pour l'entrée en cascade.
  document.querySelectorAll('.hero__title span, .foot__name span').forEach(function (s, k) { s.style.setProperty('--k', k % 7); });

  // 1. Ouverture épinglée
  var hero = document.querySelector('.hero');
  var stage = hero.querySelector('.hero__stage');
  var frames = [].slice.call(hero.querySelectorAll('.frame'));
  var countEl = hero.querySelector('.hero__count');
  var nameEl = hero.querySelector('.hero__name');
  var bar = document.querySelector('.progress');
  var current = 0;
  hero.style.setProperty('--n', frames.length);
  stage.style.setProperty('--page', frames[0].getAttribute('data-page'));

  function setFrame(i) {
    if (i === current) return;
    frames.forEach(function (f, k) {
      f.classList.toggle('was-on', k === current);
      f.classList.toggle('is-on', k === i);
    });
    current = i;
    stage.style.setProperty('--page', frames[i].getAttribute('data-page'));
    countEl.textContent = (i + 1) + ' / ' + frames.length;
    nameEl.textContent = frames[i].getAttribute('data-name');
    nameEl.classList.remove('is-new'); void nameEl.offsetWidth; nameEl.classList.add('is-new');
  }

  // Parallaxe des photos des chapitres
  var loupes = [].slice.call(document.querySelectorAll('.loupe'));

  function onScroll() {
    var vh = window.innerHeight;
    var rect = hero.getBoundingClientRect();
    var span = hero.offsetHeight - vh;
    var p = span > 0 ? Math.min(0.999, Math.max(0, -rect.top / span)) : 0;
    setFrame(Math.floor(p * frames.length));

    var doc = document.documentElement;
    bar.style.setProperty('--p', (window.scrollY / Math.max(1, doc.scrollHeight - vh)).toFixed(4));

    if (!reduce) {
      loupes.forEach(function (l) {
        var r = l.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var t = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1 … 1
        l.querySelector('img').style.setProperty('--py', (-6.5 + t * 6.5).toFixed(2) + '%');
      });
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // 2. Entrées : chaque partie d'une section monte à son tour.
  var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
  var groups = new Map();
  items.forEach(function (el) {
    var sec = el.closest('article, section') || document.body;
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

  // 4. Collection : filtres, inclinaison au survol, visionneuse.
  var cards = [].slice.call(document.querySelectorAll('.card'));
  var buttons = [].slice.call(document.querySelectorAll('.filters button'));
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      buttons.forEach(function (o) { var on = o === b; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', on); });
      var j = 0;
      cards.forEach(function (c) {
        var show = f === 'tout' || c.getAttribute('data-cat') === f;
        c.classList.toggle('is-out', !show);
        c.classList.remove('is-in-filter');
        if (show) { c.style.setProperty('--j', j++); void c.offsetWidth; c.classList.add('is-in-filter'); }
      });
    });
  });

  if (fine && !reduce) {
    cards.forEach(function (c) {
      var img = c.querySelector('img');
      c.addEventListener('pointermove', function (e) {
        var r = img.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        img.style.setProperty('--rx', (x * 7).toFixed(2) + 'deg');
        img.style.setProperty('--ry', (-y * 7).toFixed(2) + 'deg');
      });
      c.addEventListener('pointerleave', function () { img.style.setProperty('--rx', '0deg'); img.style.setProperty('--ry', '0deg'); });
    });
  }

  var viewer = document.getElementById('viewer');
  var vImg = document.getElementById('viewer-img');
  var vName = document.getElementById('viewer-name');
  var vCount = document.getElementById('viewer-count');
  var list = [], pos = 0;
  function show(i) {
    pos = (i + list.length) % list.length;
    var c = list[pos], im = c.querySelector('img');
    vImg.src = im.src; vImg.alt = im.alt;
    vName.textContent = c.querySelector('span').textContent;
    vCount.textContent = (pos + 1) + ' / ' + list.length;
    vImg.classList.remove('is-new'); void vImg.offsetWidth; vImg.classList.add('is-new');
  }
  cards.forEach(function (c) {
    c.addEventListener('click', function () {
      list = cards.filter(function (o) { return !o.classList.contains('is-out'); });
      show(list.indexOf(c));
      if (viewer.showModal) viewer.showModal(); else viewer.setAttribute('open', '');
    });
  });
  viewer.querySelector('.viewer__prev').addEventListener('click', function () { show(pos - 1); });
  viewer.querySelector('.viewer__next').addEventListener('click', function () { show(pos + 1); });
  viewer.querySelector('.viewer__close').addEventListener('click', function () { viewer.close(); });
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

  // 5. Me contacter : vérifie le formulaire, puis envoie le message.
  var mail = document.getElementById('mail');
  if (mail) {
    var msg = document.getElementById('mail-message');
    var count = document.getElementById('mail-count');
    var status = document.getElementById('mail-status');
    var btn = mail.querySelector('.mail__btn');
    msg.maxLength = 1000;
    msg.addEventListener('input', function () { count.textContent = msg.value.length + ' / 1000'; });
    mail.querySelectorAll('input, textarea').forEach(function (f) {
      f.addEventListener('input', function () { f.closest('.field').classList.remove('is-bad'); });
    });

    mail.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      ['mail-nom', 'mail-courriel', 'mail-message'].forEach(function (id) {
        var f = document.getElementById(id);
        var ok = f.value.trim() !== '' && (f.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value.trim()));
        f.closest('.field').classList.toggle('is-bad', !ok);
        if (!ok && !bad) bad = f;
      });
      if (bad) {
        status.classList.remove('is-ok');
        status.textContent = bad.id === 'mail-courriel' && bad.value ? 'Cette adresse courriel ne semble pas valide.' : 'Il manque un champ : ' + bad.previousElementSibling.textContent.toLowerCase() + '.';
        bad.focus();
        return;
      }
      var data = {
        nom: document.getElementById('mail-nom').value.trim(),
        courriel: document.getElementById('mail-courriel').value.trim(),
        sujet: mail.querySelector('input[name="sujet"]:checked').value,
        message: msg.value.trim()
      };
      var endpoint = mail.getAttribute('data-endpoint');
      var done = function () {
        mail.classList.add('is-sent');
        status.classList.add('is-ok');
        btn.disabled = false;
      };

      if (endpoint) {
        // Envoi direct par un service de formulaires (Formspree ou équivalent).
        btn.disabled = true;
        status.classList.remove('is-ok');
        status.textContent = 'Envoi en cours…';
        fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) {
            if (!r.ok) throw new Error();
            done(); mail.reset(); count.textContent = '0 / 1000';
            status.textContent = 'Merci ' + data.nom + ', votre message est bien parti. Je vous réponds rapidement.';
          })
          .catch(function () {
            btn.disabled = false;
            status.textContent = "Le message n'a pas pu partir. Réessayez, ou écrivez directement à " + mail.getAttribute('data-to') + '.';
          });
      } else {
        // Sans service : ouvre le logiciel de courriel avec le message déjà rédigé.
        var body = data.message + '\n\n— ' + data.nom + ' (' + data.courriel + ')';
        window.location.href = 'mailto:' + mail.getAttribute('data-to') +
          '?subject=' + encodeURIComponent(data.sujet + ' — ' + data.nom) + '&body=' + encodeURIComponent(body);
        done();
        status.textContent = "Votre logiciel de courriel s'ouvre avec le message prêt. Il ne reste qu'à l'envoyer.";
      }
    });
  }
})();
