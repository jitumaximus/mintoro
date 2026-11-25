/* Scanning orb for the bot dashboards: a slowly turning dotted sphere. While the bot is scanning, every instrument in
   its universe drifts in from the edges in turn (a fixed shuffled sweep) and is "checked" in the core; watched ones are
   pushed back out in the accent colour. At rest (bot stopped, market closed) the orb only breathes. Reduced motion: one still frame. */
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

  function sphere(n) {        // evenly spread points (Fibonacci sphere)
    var pts = [], g = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    return pts;
  }

  window.MintoroOrb = function (canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return { update: function () {} };
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var PTS = sphere(240);
    var W = 0, H = 0, dpr = 1;
    var col = {}, colAt = 0;
    var st = { running: false, symbols: [], hot: [], count: 0 };
    var energy = 0, rot = 0, pulse = 0, clock = 0, last = 0, nextSpawn = 0, parts = [], visible = true, raf = 0;
    // The sweep walks the whole universe in a fixed shuffled order, so every instrument comes through in turn.
    var order = [], orderKey = '', cursor = 0, centre = { sym: '', n: 0, t: 0 };

    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      col.accent = hexRgb(cs.getPropertyValue('--accent'), [52, 224, 161]);
      col.violet = hexRgb(cs.getPropertyValue('--violet'), [179, 157, 251]);
      col.fg = hexRgb(cs.getPropertyValue('--fg'), [232, 236, 239]);
      col.muted = hexRgb(cs.getPropertyValue('--muted'), [154, 167, 180]);
      col.dark = (cs.getPropertyValue('color-scheme') || '').indexOf('dark') !== -1 ||
        (col.fg[0] + col.fg[1] + col.fg[2]) > 500;
    }
    function resize() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw(0);
    }
    function radius() { return Math.max(42, Math.min(H * 0.3, W * 0.2)); }

    function shuffle(a) {
      for (var i = a.length - 1; i > 0; i--) { var j = Math.random() * (i + 1) | 0, x = a[i]; a[i] = a[j]; a[j] = x; }
      return a;
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
      if (parts.length >= (W < 520 ? 6 : 12)) return;
      var hot = st.hot.length && Math.random() < 0.22, sym, n = 0;
      if (hot) sym = st.hot[Math.random() * st.hot.length | 0];
      else { cursor = (cursor + 1) % order.length; sym = order[cursor]; n = cursor + 1; }
      parts.push({ sym: sym, n: n, hot: hot, out: hot, ang: freeAngle(hot), t: 0,
        dur: (hot ? 3.4 : 2.2) + Math.random() * 1.0, wob: (Math.random() - .5) * 0.5 });
    }

    function edge(ang) {        // distance from the centre to the canvas edge (minus a margin) in this direction
      var rx = W / 2 - Math.min(64, 20 + W * 0.07), ry = H / 2 - 14, c = Math.cos(ang), s = Math.sin(ang);
      return 1 / Math.sqrt((c * c) / (rx * rx) + (s * s) / (ry * ry));
    }

    function draw(dt) {
      if (Date.now() - colAt > 600) { readColors(); colAt = Date.now(); }
      var target = st.running ? 1 : 0;
      energy += (target - energy) * Math.min(1, dt * (target ? 1.6 : 0.9));
      if (reduced) energy = target;
      clock += dt;
      rot += dt * (0.05 + 0.42 * energy);
      pulse = Math.max(0, pulse - dt * 1.8);
      var cx = W / 2, cy = H / 2, R = radius();
      var breathe = 0.5 + 0.5 * Math.sin(clock * (0.7 + energy * 1.3));
      var tone = mix(col.muted, col.accent, 0.25 + 0.75 * energy);
      ctx.clearRect(0, 0, W, H);

      // halo
      var hr = Math.min(R * 2.1, H / 2);
      var halo = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, hr);
      halo.addColorStop(0, rgba(tone, (col.dark ? 0.22 : 0.14) * (0.45 + 0.55 * energy) + pulse * 0.12 + breathe * 0.04));
      halo.addColorStop(1, rgba(tone, 0));
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, hr, 0, TAU); ctx.fill();

      // core
      var core = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.05, cx, cy, R);
      core.addColorStop(0, rgba(mix(tone, [255, 255, 255], col.dark ? 0.35 : 0.55), 0.55 * (0.5 + 0.5 * energy) + pulse * 0.25));
      core.addColorStop(0.55, rgba(tone, 0.16 + 0.1 * energy + breathe * 0.05));
      core.addColorStop(1, rgba(tone, 0.04));
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();

      // dotted sphere
      var tilt = 0.38, ct = Math.cos(tilt), stl = Math.sin(tilt), cr = Math.cos(rot), sr = Math.sin(rot);
      for (var i = 0; i < PTS.length; i++) {
        var p = PTS[i];
        var x = p[0] * cr + p[2] * sr, z = -p[0] * sr + p[2] * cr, y = p[1];
        var y2 = y * ct - z * stl, z2 = y * stl + z * ct;
        var depth = (z2 + 1) / 2;                       // 0 back .. 1 front
        ctx.fillStyle = rgba(tone, 0.12 + depth * (0.55 + 0.3 * energy));
        ctx.beginPath(); ctx.arc(cx + x * R, cy + y2 * R, 0.6 + depth * 1.5, 0, TAU); ctx.fill();
      }

      // orbit rings and the scan sweep
      ctx.lineWidth = 1;
      for (var k = 0; k < 2; k++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((k ? -0.5 : 0.35) + rot * (k ? -0.35 : 0.25));
        ctx.strokeStyle = rgba(k ? col.violet : tone, 0.16 + 0.2 * energy);
        ctx.setLineDash(k ? [2, 7] : [1, 0]);
        ctx.beginPath(); ctx.ellipse(0, 0, R * (1.35 + k * 0.22), R * (0.42 + k * 0.1), 0, 0, TAU); ctx.stroke();
        ctx.restore();
      }
      ctx.setLineDash([]);
      if (energy > 0.05) {
        var a0 = clock * 1.6;
        ctx.strokeStyle = rgba(col.accent, 0.55 * energy);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, R * 1.08, a0, a0 + 0.9); ctx.stroke();
        ctx.lineWidth = 1;
      }

      // symbols flowing in and out
      if (!reduced && st.running) {
        nextSpawn -= dt;
        if (nextSpawn <= 0) { spawn(); nextSpawn = (0.2 + Math.random() * 0.2) * (W < 520 ? 1.6 : 1); }
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
        var size = q.out ? 11 + 3 * e : 13 - 4 * e;
        ctx.font = (q.hot ? '700 ' : '600 ') + size.toFixed(1) + 'px Inter, system-ui, sans-serif';
        if (q.hot) {
          ctx.shadowColor = rgba(col.accent, 0.8); ctx.shadowBlur = 10;
          ctx.fillStyle = rgba(col.accent, fade);
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = rgba(col.fg, fade * (q.out ? 0.75 : 0.6));
        }
        ctx.fillText(q.sym, px, py);
      }
      ctx.shadowBlur = 0;

      // the instrument just checked, in the core
      var total = st.count || order.length;
      if (energy > 0.05 && centre.sym) {
        var age = clock - centre.t, a = Math.min(1, age * 6) * energy;
        var fs = Math.max(11, Math.min(16, R * 0.2));
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
    start();

    return {
      update: function (s) {
        st.running = !!s.running;
        st.symbols = s.symbols || [];
        st.hot = s.hot || [];
        st.count = s.count || 0;
        var key = st.symbols.length + ':' + st.symbols.join(',');
        if (key !== orderKey) {           // reshuffle only when the universe itself changes
          orderKey = key;
          order = shuffle(st.symbols.slice());
          cursor = Math.min(cursor, Math.max(0, order.length - 1));
        }
        if (reduced) { readColors(); draw(0); } else start();
      }
    };
  };
})();
