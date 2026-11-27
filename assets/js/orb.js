/* Scanning orb for the bot dashboards (v2, 28 Nov 2026).
   - A dotted sphere turns; a brighter radar band sweeps across it; watched instruments glow as points on its surface.
   - One thin orbit ring per running strategy, in that strategy's colour (--c0..--c5). Every open trade is a bright
     bead travelling on its strategy's ring: faster and bigger the more it is up or down, green or red halo.
   - Entries shoot from the core out to the strategy's ring and burst there; exits send a green / red ripple out of the core.
   - Mood: when the running strategies are up today the orb leans green and breathes quicker; down, it turns cooler and calmer.
   - While scanning, every instrument of the universe drifts in from the edges in turn and is "checked" in the core.
   At rest (bot stopped, market closed) the orb only breathes. Reduced motion: one still frame, no flashes. */
(function () {
  'use strict';
  var TAU = Math.PI * 2;

  function hexRgb(v, fallback) {
    v = (v || '').trim();
    var m = /^#([0-9a-f]{6})$/i.exec(v);
    if (!m) return fallback;
    var n = parseInt(m[1], 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')'; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t | 0, a[1] + (b[1] - a[1]) * t | 0, a[2] + (b[2] - a[2]) * t | 0]; }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function hash(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }

  function sphere(n) {        // evenly spread points (Fibonacci sphere)
    var pts = [], g = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r, Math.atan2(Math.sin(th) * r, Math.cos(th) * r)]);
    }
    return pts;
  }

  // ring k: tilt and size; six slots, spread so that no two rings lie on top of each other
  var RINGS = [
    { rot: 0.32, rx: 1.30, ry: 0.36 }, { rot: -0.42, rx: 1.42, ry: 0.42 }, { rot: 0.95, rx: 1.24, ry: 0.30 },
    { rot: -1.05, rx: 1.36, ry: 0.34 }, { rot: 0.10, rx: 1.52, ry: 0.48 }, { rot: -0.18, rx: 1.18, ry: 0.26 }
  ];

  window.MintoroOrb = function (canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return { update: function () {} };
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var PTS = sphere(300);
    var W = 0, H = 0, dpr = 1;
    var col = {}, colAt = 0;
    var st = { running: false, symbols: [], hot: [], count: 0, books: [], mood: 0 };
    var energy = 0, rot = 0, pulse = 0, clock = 0, last = 0, nextSpawn = 0, parts = [], visible = true, raf = 0;
    var mood = 0, beads = {}, fx = [];
    var order = [], orderKey = '', cursor = 0, centre = { sym: '', n: 0, t: 0 };

    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      col.accent = hexRgb(cs.getPropertyValue('--accent'), [52, 224, 161]);
      col.violet = hexRgb(cs.getPropertyValue('--violet'), [179, 157, 251]);
      col.blue = hexRgb(cs.getPropertyValue('--blue'), [122, 184, 255]);
      col.red = hexRgb(cs.getPropertyValue('--red'), [255, 122, 122]);
      col.fg = hexRgb(cs.getPropertyValue('--fg'), [232, 236, 239]);
      col.muted = hexRgb(cs.getPropertyValue('--muted'), [154, 167, 180]);
      col.bg = hexRgb(cs.getPropertyValue('--bg'), [11, 14, 18]);
      col.book = [];
      for (var k = 0; k < 6; k++) col.book.push(hexRgb(cs.getPropertyValue('--c' + k), col.accent));
      col.dark = (col.fg[0] + col.fg[1] + col.fg[2]) > 500;
    }
    function resize() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw(0);
    }
    function small() { return W < 520; }
    function radius() { return Math.max(46, Math.min(H * 0.27, W * (small() ? 0.27 : 0.19))); }

    function shuffle(a) {
      for (var i = a.length - 1; i > 0; i--) { var j = Math.random() * (i + 1) | 0, x = a[i]; a[i] = a[j]; a[j] = x; }
      return a;
    }
    function edge(ang) {        // distance from the centre to the canvas edge (minus a margin) in this direction
      var rx = W / 2 - Math.min(64, 20 + W * 0.07), ry = H / 2 - 14, c = Math.cos(ang), s = Math.sin(ang);
      return 1 / Math.sqrt((c * c) / (rx * rx) + (s * s) / (ry * ry));
    }
    function freeAngle(out) {  // start where the label is furthest from the labels on screen (labels are wide, so x counts less)
      var best = Math.random() * TAU, bestGap = -1, cx = W / 2, cy = H / 2, R = radius();
      for (var k = 0; k < 16; k++) {
        var a = Math.random() * TAU, d0 = out ? R * 0.85 : edge(a), gap = 1e9;
        var x = cx + Math.cos(a) * d0, y = cy + Math.sin(a) * d0;
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].x === undefined) continue;
          var dx = (x - parts[i].x) / 80, dy = (y - parts[i].y) / 18, g = dx * dx + dy * dy;
          if (g < gap) gap = g;
        }
        if (gap > bestGap) { bestGap = gap; best = a; }
      }
      return best;
    }
    function spawn() {
      if (!order.length) return;
      if (parts.length >= (small() ? 5 : 11)) return;
      var hot = st.hot.length && Math.random() < 0.22, sym, n = 0;
      if (hot) sym = st.hot[Math.random() * st.hot.length | 0];
      else { cursor = (cursor + 1) % order.length; sym = order[cursor]; n = cursor + 1; }
      parts.push({ sym: sym, n: n, hot: hot, out: hot, ang: freeAngle(hot), t: 0,
        dur: (hot ? 3.4 : 2.2) + Math.random() * 1.0, wob: (Math.random() - .5) * 0.5 });
    }

    // a point on ring k at parameter a: screen x/y and whether it is in front of the sphere
    function ringPt(k, a, cx, cy, R) {
      var g = RINGS[k % 6], lx = Math.cos(a) * g.rx * R, ly = Math.sin(a) * g.ry * R;
      var c = Math.cos(g.rot), s = Math.sin(g.rot);
      return { x: cx + lx * c - ly * s, y: cy + lx * s + ly * c, front: Math.sin(a) > 0 };
    }
    function bookRing(name) {
      for (var i = 0; i < st.books.length; i++) if (st.books[i].name === name) return st.books[i].c;
      return 0;
    }

    function drawRings(cx, cy, R, front) {
      // the half of each ring behind the sphere first, the front half after it
      for (var i = 0; i < st.books.length; i++) {
        var b = st.books[i], k = b.c, g = RINGS[k % 6], c = col.book[k % 6], busy = b.trades.length > 0;
        ctx.save();
        ctx.translate(cx, cy); ctx.rotate(g.rot);
        ctx.lineWidth = busy ? 1.6 : 1;
        ctx.strokeStyle = rgba(c, (busy ? 0.55 : 0.22) * (0.5 + 0.5 * energy) * (front ? 1 : 0.55));
        ctx.beginPath();
        ctx.ellipse(0, 0, g.rx * R, g.ry * R, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
        ctx.stroke();
        ctx.restore();
      }
    }
    function drawBeads(cx, cy, R, front, dt) {
      for (var i = 0; i < st.books.length; i++) {
        var b = st.books[i], c = col.book[b.c % 6];
        for (var j = 0; j < b.trades.length; j++) {
          var t = b.trades[j], key = b.name + '|' + t.sym, bd = beads[key];
          if (!bd) bd = beads[key] = { a: (hash(key) % 628) / 100, seen: 0 };
          bd.seen = clock;
          var m = Math.min(1, Math.abs(t.pm || 0) / 60);              // 0 .. 1 as the trade moves up to ±60% on margin
          if (front) bd.a += dt * (0.18 + 0.9 * m) * (0.4 + 0.6 * energy);
          var p = ringPt(b.c, bd.a, cx, cy, R);
          if (p.front !== front) continue;
          var up = (t.pnl || 0) >= 0, glow = up ? col.accent : col.red;
          var r0 = (small() ? 3.2 : 4) + 3 * m, beat = 0.5 + 0.5 * Math.sin(clock * (2 + 4 * m) + j);
          var hal = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r0 * (3.2 + beat));
          hal.addColorStop(0, rgba(glow, (col.dark ? 0.55 : 0.35) * (front ? 1 : 0.5)));
          hal.addColorStop(1, rgba(glow, 0));
          ctx.fillStyle = hal;
          ctx.beginPath(); ctx.arc(p.x, p.y, r0 * (3.2 + beat), 0, TAU); ctx.fill();
          ctx.fillStyle = rgba(c, front ? 1 : 0.55);
          ctx.beginPath(); ctx.arc(p.x, p.y, r0, 0, TAU); ctx.fill();
          ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(col.dark ? [255, 255, 255] : col.bg, front ? 0.85 : 0.4);
          ctx.stroke();
          if (front && !small()) {
            ctx.font = '600 11px Inter, system-ui, sans-serif';
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillStyle = rgba(col.fg, 0.85);
            ctx.fillText(t.sym, p.x + r0 + 6, p.y - 7);
            ctx.font = '600 10px Inter, system-ui, sans-serif';
            ctx.fillStyle = rgba(glow, 0.95);
            ctx.fillText(t.label || '', p.x + r0 + 6, p.y + 7);
          }
          t._x = p.x; t._y = p.y;
        }
      }
    }

    function drawFx(cx, cy, R, dt) {
      for (var i = fx.length - 1; i >= 0; i--) {
        var f = fx[i];
        f.t += dt / f.dur;
        if (f.t >= 1) { fx.splice(i, 1); continue; }
        if (f.kind === 'exit') {                        // ripple from the core, green or red, with the result
          var c = f.win ? col.accent : col.red, e = easeOut(f.t);
          for (var w = 0; w < 2; w++) {
            var tt = Math.max(0, e - w * 0.18);
            ctx.lineWidth = 3 - w;
            ctx.strokeStyle = rgba(c, (1 - tt) * 0.8);
            ctx.beginPath(); ctx.arc(cx, cy, R * (0.6 + tt * 1.7), 0, TAU); ctx.stroke();
          }
          if (f.t < 0.15) pulse = Math.min(1, pulse + dt * 4);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.font = '700 ' + (small() ? 15 : 18) + 'px Inter, system-ui, sans-serif';
          ctx.fillStyle = rgba(c, Math.min(1, (1 - f.t) * 2.2));
          ctx.fillText(f.label, cx, cy - R * (1.05 + 0.35 * e));
          ctx.font = '600 11px Inter, system-ui, sans-serif';
          ctx.fillStyle = rgba(col.fg, Math.min(1, (1 - f.t) * 2) * 0.8);
          ctx.fillText('CLOSED ' + f.sym, cx, cy - R * (1.05 + 0.35 * e) + 17);
        } else {                                        // entry: a comet from the core to the strategy's ring, then a burst
          var k = bookRing(f.book), bc = col.book[k % 6];
          var tgt = ringPt(k, f.a, cx, cy, R);
          if (f.t < 0.55) {
            var u = ease(f.t / 0.55), x = cx + (tgt.x - cx) * u, y = cy + (tgt.y - cy) * u;
            for (var s = 0; s < 8; s++) {               // tail
              var v = Math.max(0, u - s * 0.035), sx = cx + (tgt.x - cx) * v, sy = cy + (tgt.y - cy) * v;
              ctx.fillStyle = rgba(bc, (1 - s / 8) * 0.8);
              ctx.beginPath(); ctx.arc(sx, sy, 4.5 - s * 0.45, 0, TAU); ctx.fill();
            }
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = '700 13px Inter, system-ui, sans-serif';
            ctx.fillStyle = rgba(col.fg, 0.95);
            ctx.fillText(f.sym, x, y - 14);
          } else {
            var b2 = (f.t - 0.55) / 0.45, ra = 6 + b2 * 34;
            var gr = ctx.createRadialGradient(tgt.x, tgt.y, 0, tgt.x, tgt.y, ra);
            gr.addColorStop(0, rgba(bc, (1 - b2) * 0.9));
            gr.addColorStop(1, rgba(bc, 0));
            ctx.fillStyle = gr;
            ctx.beginPath(); ctx.arc(tgt.x, tgt.y, ra, 0, TAU); ctx.fill();
            for (var q = 0; q < 10; q++) {              // sparks
              var an = q / 10 * TAU + f.a, d = 6 + easeOut(b2) * 30;
              ctx.fillStyle = rgba(bc, 1 - b2);
              ctx.beginPath(); ctx.arc(tgt.x + Math.cos(an) * d, tgt.y + Math.sin(an) * d, 1.8, 0, TAU); ctx.fill();
            }
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = '700 12px Inter, system-ui, sans-serif';
            ctx.fillStyle = rgba(col.fg, (1 - b2));
            ctx.fillText('ENTERED ' + f.sym, tgt.x, tgt.y - 22 - b2 * 10);
          }
        }
      }
    }

    function draw(dt) {
      if (Date.now() - colAt > 600) { readColors(); colAt = Date.now(); }
      var target = st.running ? 1 : 0;
      energy += (target - energy) * Math.min(1, dt * (target ? 1.6 : 0.9));
      mood += (st.mood - mood) * Math.min(1, dt * 0.8);
      if (reduced) { energy = target; mood = st.mood; }
      clock += dt;
      rot += dt * (0.05 + 0.42 * energy);
      pulse = Math.max(0, pulse - dt * 1.8);
      var cx = W / 2, cy = H / 2, R = radius();
      var breathe = 0.5 + 0.5 * Math.sin(clock * (0.6 + energy * (1.1 + 0.9 * Math.max(0, mood))));
      // tone: green when up, cooler blue when down; a slow drift towards violet keeps it alive
      var drift = 0.5 + 0.5 * Math.sin(clock * 0.12);
      var base = mood >= 0 ? col.accent : mix(col.accent, col.blue, Math.min(1, -mood));
      var live = mix(base, col.violet, (col.dark ? 0.28 : 0.18) * drift * (1 - Math.max(0, mood)));
      var tone = mix(col.muted, live, 0.25 + 0.75 * energy);
      ctx.clearRect(0, 0, W, H);

      // halo (bloom in dark mode)
      var hr = Math.min(R * 2.4, H / 2 + R * 0.4);
      var halo = ctx.createRadialGradient(cx, cy, R * 0.35, cx, cy, hr);
      halo.addColorStop(0, rgba(tone, (col.dark ? 0.30 : 0.14) * (0.45 + 0.55 * energy) + pulse * 0.16 + breathe * 0.05));
      halo.addColorStop(0.5, rgba(tone, (col.dark ? 0.08 : 0.04) * (0.5 + 0.5 * energy)));
      halo.addColorStop(1, rgba(tone, 0));
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, hr, 0, TAU); ctx.fill();

      drawRings(cx, cy, R, false);
      drawBeads(cx, cy, R, false, dt);

      // core
      var core = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.05, cx, cy, R);
      core.addColorStop(0, rgba(mix(tone, [255, 255, 255], col.dark ? 0.35 : 0.55), 0.55 * (0.5 + 0.5 * energy) + pulse * 0.25));
      core.addColorStop(0.55, rgba(tone, 0.16 + 0.1 * energy + breathe * 0.05));
      core.addColorStop(1, rgba(tone, 0.04));
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();

      // dotted sphere with a radar band sweeping round it
      var tilt = 0.38, ct = Math.cos(tilt), stl = Math.sin(tilt), cr = Math.cos(rot), sr = Math.sin(rot);
      var sweep = clock * 0.9;
      if (col.dark) ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < PTS.length; i++) {
        var p = PTS[i];
        var x = p[0] * cr + p[2] * sr, z = -p[0] * sr + p[2] * cr, y = p[1];
        var y2 = y * ct - z * stl, z2 = y * stl + z * ct;
        var depth = (z2 + 1) / 2;                       // 0 back .. 1 front
        var lon = Math.atan2(z, x), dl = Math.abs(((lon - sweep) % TAU + TAU + Math.PI) % TAU - Math.PI);
        var band = energy * Math.max(0, 1 - dl / 0.45);  // 1 on the sweep line, 0 beyond ±0.45 rad
        ctx.fillStyle = rgba(band > 0.05 ? mix(tone, [255, 255, 255], band * 0.4) : tone,
          0.10 + depth * (0.5 + 0.3 * energy) + band * 0.5 * depth);
        ctx.beginPath(); ctx.arc(cx + x * R, cy + y2 * R, 0.6 + depth * 1.4 + band * 1.1, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // watched instruments: glowing points fixed on the sphere surface
      for (var hI = 0; hI < st.hot.length && hI < 40; hI++) {
        var pp = PTS[hash(st.hot[hI]) % PTS.length];
        var hx = pp[0] * cr + pp[2] * sr, hz = -pp[0] * sr + pp[2] * cr, hy = pp[1];
        var hy2 = hy * ct - hz * stl, hz2 = hy * stl + hz * ct, hd = (hz2 + 1) / 2;
        if (hd < 0.35) continue;
        var px0 = cx + hx * R, py0 = cy + hy2 * R, tw = 0.6 + 0.4 * Math.sin(clock * 2.2 + hI);
        var gg = ctx.createRadialGradient(px0, py0, 0, px0, py0, 7 + 3 * tw);
        gg.addColorStop(0, rgba(col.accent, (col.dark ? 0.9 : 0.7) * hd * (0.4 + 0.6 * energy)));
        gg.addColorStop(1, rgba(col.accent, 0));
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(px0, py0, 7 + 3 * tw, 0, TAU); ctx.fill();
        ctx.fillStyle = rgba(col.dark ? [255, 255, 255] : col.accent, hd * (0.5 + 0.5 * energy));
        ctx.beginPath(); ctx.arc(px0, py0, 1.8, 0, TAU); ctx.fill();
      }

      drawRings(cx, cy, R, true);
      drawBeads(cx, cy, R, true, dt);

      // the scan arc
      if (energy > 0.05) {
        var a0 = clock * 1.6;
        ctx.strokeStyle = rgba(tone, 0.6 * energy);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy, R * 1.07, a0, a0 + 0.9); ctx.stroke();
        ctx.lineCap = 'butt';
        ctx.lineWidth = 1;
      }

      // symbols flowing in and out
      if (!reduced && st.running) {
        nextSpawn -= dt;
        if (nextSpawn <= 0) { spawn(); nextSpawn = (0.2 + Math.random() * 0.2) * (small() ? 1.8 : 1); }
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var j = parts.length - 1; j >= 0; j--) {
        var q = parts[j];
        q.t += dt / q.dur;
        if (q.t >= 1) {
          if (!q.out) { pulse = Math.min(1, pulse + 0.25); centre = { sym: q.sym, n: q.n, t: clock }; }
          parts.splice(j, 1); continue;
        }
        var far = edge(q.ang), near = R * 0.85;
        var e = ease(q.t), d = q.out ? near + (far - near) * e : far - (far - near) * e;
        var ang = q.ang + q.wob * (q.out ? e : 1 - e);
        var px = cx + Math.cos(ang) * d, py = cy + Math.sin(ang) * d;
        q.x = px; q.y = py;
        var fade = q.out ? Math.min(1, q.t * 5) * Math.min(1, (1 - q.t) * 2.5) : Math.min(1, q.t * 4) * Math.min(1, (1 - q.t) * 3.2);
        var size = (q.out ? 11 + 3 * e : 13 - 4 * e) * (small() ? 1.08 : 1);
        ctx.font = (q.hot ? '700 ' : '600 ') + size.toFixed(1) + 'px Inter, system-ui, sans-serif';
        if (q.hot) {
          ctx.shadowColor = rgba(col.accent, 0.8); ctx.shadowBlur = col.dark ? 10 : 4;
          ctx.fillStyle = rgba(col.accent, fade);
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = rgba(col.fg, fade * (q.out ? 0.75 : 0.55));
        }
        ctx.fillText(q.sym, px, py);
      }
      ctx.shadowBlur = 0;

      drawFx(cx, cy, R, dt);

      // the instrument just checked, in the core
      var total = st.count || order.length;
      if (energy > 0.05 && centre.sym) {
        var age = clock - centre.t, a = Math.min(1, age * 6) * energy;
        var fs = Math.max(12, Math.min(17, R * 0.2));
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '600 ' + (fs * 0.62).toFixed(1) + 'px Inter, system-ui, sans-serif';
        ctx.fillStyle = rgba(col.fg, 0.55 * a);
        ctx.fillText('CHECKING', cx, cy - fs * 0.95);
        ctx.font = '700 ' + fs.toFixed(1) + 'px Inter, system-ui, sans-serif';
        ctx.fillStyle = rgba(col.fg, 0.95 * a);
        ctx.fillText(centre.sym, cx, cy);
        if (centre.n && total) {
          ctx.font = '500 ' + (fs * 0.68).toFixed(1) + 'px Inter, system-ui, sans-serif';
          ctx.fillStyle = rgba(col.fg, 0.55 * a);
          ctx.fillText(Math.min(centre.n, total) + ' / ' + total, cx, cy + fs * 1.05);
        }
      }
      // forget beads of trades that closed
      for (var kk in beads) if (beads[kk].seen < clock - 2) delete beads[kk];
    }

    function frame(t) {
      raf = 0;
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      draw(dt);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function start() { if (!reduced && !raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }

    readColors(); colAt = Date.now();
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }).observe(canvas);
    }
    document.addEventListener('visibilitychange', start);
    document.addEventListener('mintoro:theme', function () { readColors(); if (reduced) draw(0); });
    start();

    return {
      // s: running, symbols, hot, count, books [{name, c, trades: [{sym, pnl, pm, label}]}], mood (-1 .. 1)
      update: function (s) {
        st.running = !!s.running;
        st.symbols = s.symbols || [];
        st.hot = s.hot || [];
        st.count = s.count || 0;
        st.books = s.books || [];
        st.mood = Math.max(-1, Math.min(1, s.mood || 0));
        var key = st.symbols.length + ':' + st.symbols.join(',');
        if (key !== orderKey) {           // reshuffle only when the universe itself changes
          orderKey = key;
          order = shuffle(st.symbols.slice());
          cursor = Math.min(cursor, Math.max(0, order.length - 1));
        }
        if (reduced) { readColors(); draw(0); } else start();
      },
      // a new entry or exit: {kind: 'entry'|'exit', book, sym, value, label}
      flash: function (e) {
        if (reduced || document.hidden) return;
        if (fx.length > 6) fx.shift();
        if (e.kind === 'exit') fx.push({ kind: 'exit', sym: e.sym, win: e.value >= 0, label: e.label, t: 0, dur: 2.6 });
        else fx.push({ kind: 'entry', sym: e.sym, book: e.book, a: (hash(e.book + '|' + e.sym) % 628) / 100, t: 0, dur: 2.2 });
        start();
      }
    };
  };
})();
