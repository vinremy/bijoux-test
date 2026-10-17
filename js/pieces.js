/*
 * Mortier — dessins de bijoux en SVG.
 * Ces dessins remplacent les photos tant que les vraies images des pièces ne sont pas fournies.
 * Mortier.draw({ type, metal, stone, cut }) renvoie une chaîne SVG (viewBox 400 × 400).
 */
(function (root) {
  'use strict';

  var METALS = {
    'argent':   { label: 'Argent',   base: '#c7cbc8', shade: '#7f8683', light: '#f4f5f1' },
    'or-jaune': { label: 'Or jaune', base: '#c9a24a', shade: '#8f6d27', light: '#ecd189' },
    'or-rose':  { label: 'Or rose',  base: '#c98f7a', shade: '#93604f', light: '#efc2b0' },
    'or-blanc': { label: 'Or blanc', base: '#c3c8c4', shade: '#868d89', light: '#f1f3ef' }
  };

  var STONES = {
    'grenat':    { label: 'Grenat',    base: '#7e1d26', dark: '#450d14', light: '#c24a52' },
    'opale':     { label: 'Opale',     base: '#2f9c86', dark: '#1d5a63', light: '#9be3a8' },
    'peridot':   { label: 'Péridot',   base: '#6f8d2c', dark: '#3c5214', light: '#b9d36a' },
    'diamant':   { label: 'Diamant',   base: '#d9e3e4', dark: '#93a6aa', light: '#ffffff' },
    'emeraude':  { label: 'Émeraude',  base: '#2f8a64', dark: '#17503a', light: '#74c9a0' },
    'saphir':    { label: 'Saphir',    base: '#3556a6', dark: '#1a2f6b', light: '#7f9fe0' },
    'rubis':     { label: 'Rubis',     base: '#a8263a', dark: '#621321', light: '#e46a78' },
    'morganite': { label: 'Morganite', base: '#e0a49f', dark: '#a9675f', light: '#f6d6d1' },
    'aucune':    { label: 'Sans pierre' }
  };

  var TYPES = {
    'bague':      'Bague',
    'chevaliere': 'Chevalière',
    'alliance':   'Alliance',
    'jonc':       'Jonc',
    'pendentif':  'Pendentif',
    'boucles':    "Boucles d'oreilles"
  };

  var CUTS = { 'ronde': 'Ronde', 'ovale': 'Ovale', 'emeraude': 'Émeraude' };
  var FINISHES = { 'poli': 'Poli miroir', 'martele': 'Martelé', 'texture': 'Texturé' };

  // Petite suite pseudo-aléatoire stable, pour que le martelage soit toujours le même.
  function rand(seed) { var x = seed; return function () { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }

  // Finition dessinée sur la face visible d'un anneau elliptique.
  function finish(kind, cx, cy, rx, ry, irx, iry, dy, mt, from, to) {
    if (kind !== 'martele' && kind !== 'texture') return '';
    var out = '', rnd = rand(Math.round(cx * 7 + rx)), n = kind === 'martele' ? 90 : 70;
    for (var i = 0; i < n; i++) {
      var a = from + (to - from) * rnd();
      var t = 0.15 + 0.7 * rnd();
      var ox = cx + Math.cos(a) * rx, oy = cy + Math.sin(a) * ry;
      var ix = cx + Math.cos(a) * irx, iy = cy + dy + Math.sin(a) * iry;
      var x = ox + (ix - ox) * t, y = oy + (iy - oy) * t;
      if (kind === 'martele') {
        var sz = 3 + rnd() * 4;
        out += ell(x, y, sz, sz * 0.7, rnd() > 0.5 ? mt.light : mt.shade);
      } else {
        var len = 6 + rnd() * 9;
        out += '<path d="M' + r(x - len * 0.5) + ',' + r(y - len * 0.35) + 'l' + r(len) + ',' + r(len * 0.7) + '" stroke="' + (rnd() > 0.35 ? mt.shade : mt.light) + '" stroke-width="2.4" stroke-linecap="round"/>';
      }
    }
    return out;
  }

  function r(n) { return Math.round(n * 10) / 10; }
  function pts(list) { return list.map(function (p) { return r(p[0]) + ',' + r(p[1]); }).join(' '); }
  function poly(list, fill) { return '<polygon points="' + pts(list) + '" fill="' + fill + '"/>'; }
  function ell(cx, cy, rx, ry, fill) { return '<ellipse cx="' + r(cx) + '" cy="' + r(cy) + '" rx="' + r(rx) + '" ry="' + r(ry) + '" fill="' + fill + '"/>'; }
  function ring(cx, cy, rx, ry, irx, iry, dy, fill) {
    // anneau plein : ellipse extérieure moins ellipse intérieure (evenodd)
    var o = 'M' + r(cx - rx) + ',' + r(cy) + 'a' + r(rx) + ',' + r(ry) + ' 0 1,0 ' + r(rx * 2) + ',0a' + r(rx) + ',' + r(ry) + ' 0 1,0 ' + r(-rx * 2) + ',0z';
    var i = 'M' + r(cx - irx) + ',' + r(cy + dy) + 'a' + r(irx) + ',' + r(iry) + ' 0 1,0 ' + r(irx * 2) + ',0a' + r(irx) + ',' + r(iry) + ' 0 1,0 ' + r(-irx * 2) + ',0z';
    return '<path d="' + o + i + '" fill="' + fill + '" fill-rule="evenodd"/>';
  }

  // Couleur d'une facette selon son orientation : lumière en haut à gauche.
  function facetTone(angle, s, k) {
    var light = Math.cos(angle - (-Math.PI * 0.75));
    var v = light + (k % 2 ? 0.25 : -0.25);
    return v > 0.45 ? s.light : v < -0.35 ? s.dark : s.base;
  }

  // Pierre vue de face, à facettes en aplats.
  function gem(cx, cy, w, h, cut, s) {
    var out = '';
    if (cut === 'emeraude') {
      var oct = function (k) {
        var hw = w / 2 * k, hh = h / 2 * k, c = Math.min(hw, hh) * 0.28;
        return [[cx - hw + c, cy - hh], [cx + hw - c, cy - hh], [cx + hw, cy - hh + c], [cx + hw, cy + hh - c],
                [cx + hw - c, cy + hh], [cx - hw + c, cy + hh], [cx - hw, cy + hh - c], [cx - hw, cy - hh + c]];
      };
      var steps = [1, 0.78, 0.56];
      for (var t = 0; t < steps.length - 1; t++) {
        var a = oct(steps[t]), b = oct(steps[t + 1]);
        for (var i = 0; i < 8; i++) {
          var j = (i + 1) % 8;
          var mid = [(a[i][0] + a[j][0]) / 2 - cx, (a[i][1] + a[j][1]) / 2 - cy];
          out += poly([a[i], a[j], b[j], b[i]], facetTone(Math.atan2(mid[1], mid[0]), s, i + t));
        }
      }
      out += poly(oct(0.56), s.base);
      out += poly([[cx - w * 0.18, cy - h * 0.2], [cx - w * 0.02, cy - h * 0.2], [cx - w * 0.12, cy + h * 0.05], [cx - w * 0.22, cy + h * 0.05]], s.light);
      return out;
    }
    var n = 16, O = [], T = [];
    for (var k = 0; k < n; k++) {
      var an = -Math.PI / 2 + k * Math.PI * 2 / n;
      O.push([cx + Math.cos(an) * w / 2, cy + Math.sin(an) * h / 2]);
    }
    for (var m = 0; m < 8; m++) {
      var at = -Math.PI / 2 + Math.PI / 8 + m * Math.PI / 4;
      T.push([cx + Math.cos(at) * w * 0.25, cy + Math.sin(at) * h * 0.25]);
    }
    for (var q = 0; q < n; q++) {
      var p1 = O[q], p2 = O[(q + 1) % n], tt = T[Math.floor(q / 2) % 8];
      var ang = Math.atan2((p1[1] + p2[1]) / 2 - cy, (p1[0] + p2[0]) / 2 - cx);
      out += poly([p1, p2, tt], facetTone(ang, s, q));
    }
    for (var u = 0; u < 8; u++) {
      var ta = T[u], tb = T[(u + 1) % 8], ob = O[(u * 2 + 2) % n];
      var ang2 = Math.atan2((ta[1] + tb[1]) / 2 - cy, (ta[0] + tb[0]) / 2 - cx);
      out += poly([ta, ob, tb], facetTone(ang2 + 0.4, s, u + 1));
    }
    out += poly(T, s.base);
    out += poly([T[5], T[6], [cx, cy]], s.light);
    return out;
  }

  function gemSize(cut, size) {
    if (cut === 'ovale') return [size * 0.78, size * 1.08];
    if (cut === 'emeraude') return [size * 0.8, size * 1.04];
    return [size, size];
  }

  // Monture autour de la pierre : sertissure et griffes.
  function setting(cx, cy, w, h, cut, mt) {
    var out = '';
    if (cut === 'emeraude') {
      out += '<rect x="' + r(cx - w / 2 - 7) + '" y="' + r(cy - h / 2 - 7) + '" width="' + r(w + 14) + '" height="' + r(h + 14) + '" rx="10" fill="' + mt.shade + '"/>';
      out += '<rect x="' + r(cx - w / 2 - 4) + '" y="' + r(cy - h / 2 - 5) + '" width="' + r(w + 8) + '" height="' + r(h + 8) + '" rx="8" fill="' + mt.base + '"/>';
    } else {
      out += ell(cx + 2, cy + 3, w / 2 + 8, h / 2 + 8, mt.shade);
      out += ell(cx, cy, w / 2 + 6, h / 2 + 6, mt.base);
    }
    return out;
  }
  function prongs(cx, cy, w, h, mt) {
    var out = '', d = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (var i = 0; i < 4; i++) {
      var x = cx + d[i][0] * w * 0.36, y = cy + d[i][1] * h * 0.36;
      out += ell(x + 1, y + 1.5, 7, 7, mt.shade) + ell(x, y, 6, 6, mt.light);
    }
    return out;
  }

  function drawBague(mt, s, cut, fin) {
    var o = '';
    o += ring(203, 272, 118, 72, 98, 54, -4, mt.shade);
    o += ring(200, 266, 118, 72, 98, 54, -4, mt.base);
    o += finish(fin, 200, 266, 118, 72, 98, 54, -4, mt, 0.05 * Math.PI, 0.95 * Math.PI);
    o += '<path d="M100,250 A116,70 0 0,1 168,198" stroke="' + mt.light + '" stroke-width="6" fill="none" stroke-linecap="round"/>';
    o += poly([[176, 196], [224, 196], [214, 228], [186, 228]], mt.shade);
    if (s) {
      var wh = gemSize(cut, 104);
      o += setting(200, 164, wh[0], wh[1], cut, mt);
      o += gem(200, 164, wh[0], wh[1], cut, s);
      if (cut !== 'emeraude') o += prongs(200, 164, wh[0], wh[1], mt);
    } else {
      o += ell(202, 170, 52, 32, mt.shade) + ell(200, 166, 50, 30, mt.base) + '<path d="M168,158 A50,30 0 0,1 214,138" stroke="' + mt.light + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
    }
    return o;
  }

  function drawChevaliere(mt, s, cut, fin) {
    var o = '';
    o += ring(203, 278, 108, 64, 92, 50, -4, mt.shade);
    o += ring(200, 272, 108, 64, 92, 50, -4, mt.base);
    o += finish(fin, 200, 272, 108, 64, 92, 50, -4, mt, 0.05 * Math.PI, 0.95 * Math.PI);
    o += poly([[124, 226], [276, 226], [252, 258], [148, 258]], mt.shade);
    o += poly([[118, 168], [282, 168], [300, 200], [258, 236], [142, 236], [100, 200]], mt.shade);
    o += poly([[124, 162], [276, 162], [294, 194], [254, 228], [146, 228], [106, 194]], mt.base);
    o += poly([[124, 162], [276, 162], [294, 194], [106, 194]], mt.light);
    o += poly([[132, 166], [268, 166], [282, 190], [118, 190]], mt.base);
    if (s) {
      var wh = gemSize(cut, 44);
      o += setting(200, 178, wh[0] * 1.2, wh[1] * 0.5, cut, mt);
      o += gem(200, 178, wh[0] * 1.2, wh[1] * 0.5, cut, s);
    } else if (fin === 'martele' || fin === 'texture') {
      var rnd = rand(11);
      for (var i = 0; i < 26; i++) {
        var x = 136 + rnd() * 128, y = 170 + rnd() * 16;
        o += fin === 'martele' ? ell(x, y, 4, 2.4, rnd() > 0.5 ? mt.light : mt.shade)
          : '<path d="M' + r(x) + ',' + r(y - 4) + 'l9,6" stroke="' + mt.shade + '" stroke-width="2.4" stroke-linecap="round"/>';
      }
    }
    return o;
  }

  function drawJonc(mt, s, cut, fin) {
    var o = '';
    o += ring(205, 238, 128, 104, 112, 88, -26, mt.shade);
    o += ring(200, 230, 128, 104, 112, 88, -26, mt.base);
    o += finish(fin, 200, 230, 128, 104, 112, 88, -26, mt, 0.02 * Math.PI, 0.98 * Math.PI);
    o += '<path d="M78,206 A126,102 0 0,1 150,136" stroke="' + mt.light + '" stroke-width="7" fill="none" stroke-linecap="round"/>';
    if (s) {
      var wh = gemSize(cut, 40);
      o += setting(200, 318, wh[0], wh[1] * 0.8, cut, mt) + gem(200, 318, wh[0], wh[1] * 0.8, cut, s);
    }
    return o;
  }

  function drawAlliance(mt, s) {
    var o = '';
    o += ring(204, 236, 132, 96, 108, 76, -6, mt.shade);
    o += ring(200, 228, 132, 96, 108, 76, -6, mt.base);
    o += '<path d="M76,214 A130,94 0 0,1 150,140" stroke="' + mt.light + '" stroke-width="7" fill="none" stroke-linecap="round"/>';
    if (s) {
      for (var i = 0; i < 9; i++) {
        var a = Math.PI * (0.18 + i * 0.08);
        var x = 200 + Math.cos(a) * 120, y = 228 + Math.sin(a) * 86;
        o += ell(x, y, 10, 10, mt.shade) + gem(x, y, 15, 15, 'ronde', s);
      }
    }
    return o;
  }

  function drawPendentif(mt, s, cut, fin) {
    var o = '';
    o += '<path d="M40,0 Q120,150 200,150 Q280,150 360,0" stroke="' + mt.base + '" stroke-width="5" fill="none" stroke-dasharray="1 9" stroke-linecap="round"/>';
    o += '<rect x="188" y="138" width="24" height="34" rx="12" fill="' + mt.shade + '"/>';
    o += '<rect x="192" y="142" width="16" height="26" rx="8" fill="none" stroke="' + mt.base + '" stroke-width="5"/>';
    var wh = gemSize(cut, 130);
    var cy = 176 + wh[1] / 2 + 14;
    if (s) {
      o += setting(200, cy, wh[0], wh[1], cut, mt);
      o += gem(200, cy, wh[0], wh[1], cut, s);
    } else {
      o += ell(203, cy + 3, wh[0] / 2 + 6, wh[1] / 2 + 6, mt.shade) + ell(200, cy, wh[0] / 2 + 4, wh[1] / 2 + 4, mt.base);
      o += ell(200, cy, wh[0] / 2 - 18, wh[1] / 2 - 18, mt.shade) + ell(200, cy, wh[0] / 2 - 22, wh[1] / 2 - 22, mt.base);
      if (fin === 'martele' || fin === 'texture') {
        var rnd = rand(5);
        for (var i = 0; i < 60; i++) {
          var a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 0.9;
          var x = 200 + Math.cos(a) * (wh[0] / 2 - 24) * d, y = cy + Math.sin(a) * (wh[1] / 2 - 24) * d;
          o += fin === 'martele' ? ell(x, y, 4.5, 3.4, rnd() > 0.5 ? mt.light : mt.shade)
            : '<path d="M' + r(x - 6) + ',' + r(y - 5) + 'q6,2 12,10" stroke="' + mt.shade + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
        }
      }
    }
    return o;
  }

  function drawBoucles(mt, s, cut) {
    var o = '';
    [132, 268].forEach(function (x, idx) {
      var y0 = idx ? 104 : 88;
      o += ell(x + 1.5, y0 + 2, 16, 16, mt.shade) + ell(x, y0, 14, 14, mt.light) + ell(x, y0, 9, 9, mt.base);
      o += '<rect x="' + (x - 3) + '" y="' + (y0 + 12) + '" width="6" height="40" fill="' + mt.shade + '"/>';
      var wh = gemSize(cut, 78);
      var cy = y0 + 52 + wh[1] / 2 + 8;
      if (s) {
        o += setting(x, cy, wh[0], wh[1], cut, mt) + gem(x, cy, wh[0], wh[1], cut, s);
        if (cut !== 'emeraude') o += prongs(x, cy, wh[0], wh[1], mt);
      } else {
        o += ell(x + 2, cy + 3, wh[0] / 2 + 4, wh[1] / 2 + 4, mt.shade) + ell(x, cy, wh[0] / 2 + 2, wh[1] / 2 + 2, mt.base);
        o += ell(x - wh[0] * 0.15, cy - wh[1] * 0.18, wh[0] * 0.12, wh[1] * 0.2, mt.light);
      }
    });
    return o;
  }

  // Le mortier et son pilon : l'objet qui donne son nom à l'atelier.
  function drawMortier(tone) {
    var t = tone || { base: '#8e948d', shade: '#5d635d', light: '#c9cbc3', dark: '#3a403d' };
    var o = '';
    o += '<rect x="226" y="40" width="34" height="200" rx="17" transform="rotate(28 243 140)" fill="' + t.shade + '"/>';
    o += '<rect x="222" y="40" width="30" height="196" rx="15" transform="rotate(28 237 138)" fill="' + t.light + '"/>';
    o += ell(200, 196, 138, 34, t.dark);
    o += '<path d="M62,196 Q70,320 160,340 L240,340 Q330,320 338,196 Z" fill="' + t.base + '"/>';
    o += '<path d="M90,214 Q102,300 170,322" stroke="' + t.light + '" stroke-width="10" fill="none" stroke-linecap="round"/>';
    o += '<rect x="132" y="336" width="136" height="22" rx="4" fill="' + t.shade + '"/>';
    o += '<path d="M62,196 A138,34 0 0,1 338,196" stroke="' + t.light + '" stroke-width="6" fill="none"/>';
    return o;
  }

  function draw(opts) {
    opts = opts || {};
    var mt = METALS[opts.metal] || METALS.argent;
    var st = STONES[opts.stone];
    var s = st && st.base ? st : null;
    var cut = CUTS[opts.cut] ? opts.cut : 'ronde';
    var fin = FINISHES[opts.finish] ? opts.finish : 'poli';
    var body;
    switch (opts.type) {
      case 'chevaliere': body = drawChevaliere(mt, s, cut, fin); break;
      case 'jonc':       body = drawJonc(mt, s, cut, fin); break;
      case 'alliance':   body = drawAlliance(mt, s); break;
      case 'pendentif':  body = drawPendentif(mt, s, cut, fin); break;
      case 'boucles':    body = drawBoucles(mt, s, cut); break;
      case 'mortier':    body = drawMortier(); break;
      default:           body = drawBague(mt, s, cut, fin);
    }
    return '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function describe(opts) {
    var type = TYPES[opts.type] || TYPES.bague;
    var metal = (METALS[opts.metal] || METALS.argent).label.toLowerCase();
    var fin = (FINISHES[opts.finish] || FINISHES.poli).toLowerCase();
    var st = STONES[opts.stone];
    var stone = st && st.base ? st.label.toLowerCase() + ', taille ' + (CUTS[opts.cut] || 'Ronde').toLowerCase() : 'sans pierre';
    return type + ' en ' + metal + ' ' + fin + ', ' + stone;
  }

  var api = { draw: draw, describe: describe, METALS: METALS, STONES: STONES, TYPES: TYPES, CUTS: CUTS, FINISHES: FINISHES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Mortier = api;
})(typeof window !== 'undefined' ? window : globalThis);
