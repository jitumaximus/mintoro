/* The orb, both dashboards (28 Nov 2026): strategy channels in -> orb.
   A dandelion with one spike per coin in the scan universe. A scan beam walks through every coin; armed coins glow amber;
   open trades are bright stars in their strategy's colour with live P&L. The side facing the strategy channels turns gold.
   Entries fire a beam out to the coin; exits send green / red shockwaves out of the core. Curved wires join each strategy
   channel (left) to the orb, with pulses travelling along them. Follows the site theme (colours from the --o-* tokens of
   the panel); in dark it glows additively, in light it draws with darker ink. Reduced motion: one still frame, no effects. */
(function () {
  'use strict';
  var TAU = Math.PI * 2;
  function hex(v, f) { var m = /#([0-9a-f]{6})/i.exec(v || ''); if (!m) return f; var n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')'; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t | 0, a[1] + (b[1] - a[1]) * t | 0, a[2] + (b[2] - a[2]) * t | 0]; }
  function hash(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function font(w, px) { return w + ' ' + px + 'px "JetBrains Mono", ui-monospace, monospace'; }
  function bez(a, b, c, d, u) { var v = 1 - u; return v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d; }

  window.MintoroOrbX = function (root) {
    var orbC = root.querySelector('[data-o="orb"]'), wireC = root.querySelector('[data-o="wires"]');
    var grid = root.querySelector('[data-o="grid"]'), cell = root.querySelector('[data-o="cell"]');
    var chans = root.querySelector('[data-o="chans"]'), chk = root.querySelector('[data-o="check"]');
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var C = {};
    function readColors() {
      var cs = getComputedStyle(root);
      ['green', 'cyan', 'amber', 'gold', 'red', 'text', 'hi'].forEach(function (k) { C[k] = hex(cs.getPropertyValue('--o-' + k), [200, 200, 200]); });
      C.book = [0, 1, 2, 3, 4, 5].map(function (k) { return hex(cs.getPropertyValue('--c' + k), C.cyan); });
      C.dark = C.hi[0] + C.hi[1] + C.hi[2] > 500;           // light ink on the panel = dark theme
      C.star = C.dark ? [255, 255, 255] : C.hi;
    }
    readColors();
    var colAt = 0;
    document.addEventListener('mintoro:theme', function () { readColors(); if (reduced) draw(0); });
    if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { readColors(); if (reduced) draw(0); });
    function surface(c) {
      var o = { c: c, x: c.getContext('2d'), W: 1, H: 1 };
      function size() { var r = c.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2); o.W = r.width; o.H = r.height; c.width = Math.max(1, r.width * d); c.height = Math.max(1, r.height * d); o.x.setTransform(d, 0, 0, d, 0, 0); if (reduced) draw(0); }
      if (window.ResizeObserver) new ResizeObserver(size).observe(c);
      o.size = size;
      return o;
    }
    var O = surface(orbC), Wr = surface(wireC);
    var st = { running: false, uni: [], hot: {}, open: [], mood: 0 }, fx = [];   // open: [{s, b, pnl, pm, label}]
    var dirs = null, dirsN = 0, symIndex = {}, proj = [], scanI = 0, T = 0, last = 0, raf = 0, visible = true, chkAt = 0;

    function makeDirs(n) {
      var out = [], g = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < n; i++) { var y = 1 - (i / Math.max(1, n - 1)) * 2, r = Math.sqrt(Math.max(0, 1 - y * y)), th = g * i; out.push([Math.cos(th) * r, y, Math.sin(th) * r, 0.78 + ((hash('d' + i) % 1000) / 1000) * 0.3]); }
      return out;
    }
    function geom() { return { cx: O.W / 2, cy: O.H / 2, R: Math.min(O.W * 0.44, O.H * 0.45) }; }

    function drawOrb(dt) {
      var x = O.x, W = O.W, H = O.H; x.clearRect(0, 0, W, H);
      if (T - colAt > 1) { colAt = T; readColors(); }
      var K = C.dark ? 1 : 1.5;                               // light theme: stronger ink, no additive glow
      var uni = st.uni, N = uni.length || 300;
      if (!dirs || dirsN !== N) { dirs = makeDirs(N); dirsN = N; symIndex = {}; uni.forEach(function (s, i) { symIndex[s] = i; }); }
      var g = geom(), cx = g.cx, cy = g.cy, R = g.R, rot = T * 0.07, tilt = 0.25, energy = st.running ? 1 : 0.35;
      var ct = Math.cos(tilt), s2 = Math.sin(tilt), cr = Math.cos(rot), sr = Math.sin(rot);
      var mood = st.mood, tone = mood >= 0 ? mix(C.cyan, C.green, mood) : mix(C.cyan, C.red, -mood * 0.6);
      var glow = x.createRadialGradient(cx, cy, 0, cx, cy, R * 1.25);
      glow.addColorStop(0, rgba(tone, (C.dark ? .22 : .12) * energy)); glow.addColorStop(0.5, rgba(tone, .05 * energy)); glow.addColorStop(1, rgba(tone, 0));
      x.fillStyle = glow; x.beginPath(); x.arc(cx, cy, R * 1.25, 0, TAU); x.fill();
      if (st.running) scanI = (scanI + dt * 60) % N;
      var ps = [];
      for (var i = 0; i < N; i++) {
        var d = dirs[i], X = d[0] * cr + d[2] * sr, Z = -d[0] * sr + d[2] * cr, Y = d[1];
        var y2 = Y * ct - Z * s2, z2 = Y * s2 + Z * ct;
        ps.push({ i: i, x: cx + X * R * d[3], y: cy + y2 * R * d[3], z: z2, X: X });
      }
      ps.sort(function (a, b) { return a.z - b.z; });
      proj = [];
      x.globalCompositeOperation = C.dark ? 'lighter' : 'source-over';
      var flash = C.dark ? [255, 255, 255] : C.hi;
      ps.forEach(function (p) {
        var s = uni[p.i] || '', dep = (p.z + 1) / 2, dS = (scanI - p.i + N) % N, lit = st.running ? Math.max(0, 1 - dS / 26) : 0;
        var hot = st.hot[s] !== undefined, gold = Math.max(0, -p.X - 0.15) / 0.85;
        var base = mix(mix(C.text, C.cyan, 0.35), C.gold, Math.min(1, gold * 1.2));
        var c = hot ? C.amber : lit > 0 ? mix(base, flash, lit) : base;
        x.strokeStyle = rgba(c, ((0.05 + 0.22 * dep) * (hot ? 2.2 : 1) * K + lit * 0.5) * energy); x.lineWidth = hot || lit > 0.3 ? 1.1 : 0.7;
        x.beginPath(); x.moveTo(cx + (p.x - cx) * 0.08, cy + (p.y - cy) * 0.08); x.lineTo(p.x, p.y); x.stroke();
        var r = (0.8 + 1.6 * dep) * (hot ? 1.6 : 1) + lit * 1.5 + gold * 1.2;
        if (gold > 0.2 && !hot) { x.strokeStyle = rgba(C.gold, (0.25 + 0.5 * dep) * gold * energy); x.lineWidth = 0.8; x.beginPath(); x.arc(p.x, p.y, r + 2.2, 0, TAU); x.stroke(); }
        x.fillStyle = rgba(c, (0.25 + 0.65 * dep + lit * 0.4) * (0.4 + 0.6 * energy) * (C.dark ? 1 : 1.1)); x.beginPath(); x.arc(p.x, p.y, r, 0, TAU); x.fill();
        proj[p.i] = p;
      });
      x.globalCompositeOperation = 'source-over';
      x.textAlign = 'left';
      var ci = Math.floor(scanI) % N, cp = proj[ci];
      if (st.running && cp && uni[ci]) {
        x.strokeStyle = rgba(C.hi, .8); x.lineWidth = 1; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cp.x, cp.y); x.stroke();
        x.font = font(600, 10); x.fillStyle = rgba(C.hi, .9); x.fillText(uni[ci], cp.x + 6, cp.y - 4);
        if (chk && T - chkAt > 0.2) { chkAt = T; chk.textContent = 'checking ' + uni[ci] + ' ' + (ci + 1) + '/' + N; }
      } else if (chk && !st.running) chk.textContent = 'resting';
      st.open.forEach(function (o) {
        var p = proj[symIndex[o.s]] || proj[hash(o.s) % N]; if (!p) return;
        var c = C.book[o.b % 6], pr = 10 + 4 * Math.sin(T * 3 + (o.pm || 0)), gg = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 2);
        gg.addColorStop(0, rgba(c, C.dark ? .9 : .6)); gg.addColorStop(1, rgba(c, 0)); x.fillStyle = gg; x.beginPath(); x.arc(p.x, p.y, pr * 2, 0, TAU); x.fill();
        x.fillStyle = C.dark ? '#fff' : rgba(c, 1); x.beginPath(); x.arc(p.x, p.y, 3.6, 0, TAU); x.fill();
        if (!C.dark) { x.strokeStyle = '#fff'; x.lineWidth = 1.5; x.stroke(); }
        x.strokeStyle = rgba(c, 1); x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx, cy); x.lineTo(p.x, p.y); x.stroke();
        x.font = font(700, 11); x.fillStyle = rgba(C.hi, 1); x.fillText(o.s, p.x + 10, p.y - 4);
        x.font = font(600, 10); x.fillStyle = rgba(o.pnl >= 0 ? C.green : C.red, 1); x.fillText(o.label || '', p.x + 10, p.y + 9);
      });
      x.fillStyle = rgba(C.hi, .9); x.beginPath(); x.arc(cx, cy, 3, 0, TAU); x.fill();
      x.strokeStyle = rgba(tone, .7); x.lineWidth = 1; x.beginPath(); x.arc(cx, cy, 9 + 2 * Math.sin(T * 2), 0, TAU); x.stroke();
      fx = fx.filter(function (f) {
        f.t += dt / 2.2; if (f.t >= 1) return false;
        var e = ease(f.t), c = f.kind === 'entry' ? C.book[f.b % 6] : f.win ? C.green : C.red;
        if (f.kind === 'exit') {
          for (var w = 0; w < 3; w++) { var ee = Math.max(0, e - w * 0.12); x.strokeStyle = rgba(c, (1 - ee) * .8); x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, 10 + ee * R * 1.3, 0, TAU); x.stroke(); }
          x.font = font(700, 17); x.textAlign = 'center'; x.fillStyle = rgba(c, 1 - f.t); x.fillText(f.s + ' ' + f.label, cx, cy - 18 - e * 30);
        } else {
          var p = proj[symIndex[f.s]] || proj[hash(f.s) % N]; if (!p) return true;
          var u = Math.min(1, e * 1.6);
          x.strokeStyle = rgba(c, 1 - f.t); x.lineWidth = 2.5; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + (p.x - cx) * u, cy + (p.y - cy) * u); x.stroke();
          for (var k = 0; k < 3; k++) { var ek = Math.max(0, e - k * .15); x.strokeStyle = rgba(c, (1 - ek) * .9); x.beginPath(); x.arc(p.x, p.y, 4 + ek * 40, 0, TAU); x.stroke(); }
          x.font = font(700, 12); x.textAlign = 'center'; x.fillStyle = rgba(C.hi, 1 - f.t); x.fillText('ENTER ' + f.s, p.x, p.y - 22 - e * 10);
        }
        x.textAlign = 'left';
        return true;
      });
    }

    function drawWires() {
      var x = Wr.x; x.clearRect(0, 0, Wr.W, Wr.H);
      if (getComputedStyle(wireC).display === 'none') return;
      var gr = grid.getBoundingClientRect(), oc = cell.getBoundingClientRect(), oR = orbC.getBoundingClientRect();
      var cx = oR.left - gr.left + oR.width / 2, cy = oR.top - gr.top + oR.height / 2, R = Math.min(oR.width * 0.44, oR.height * 0.45);
      var ch = chans.children;
      for (var i = 0; i < ch.length; i++) {
        var r = ch[i].getBoundingClientRect(), sx = r.right - gr.left, sy = r.top - gr.top + r.height / 2, c = C.book[(+ch[i].getAttribute('data-c') || 0) % 6];
        var ang = Math.PI + (i - (ch.length - 1) / 2) * 0.22, ex = cx + Math.cos(ang) * R * 0.9, ey = cy + Math.sin(ang) * R * 0.9, m = sx + (ex - sx) * 0.55;
        var busy = ch[i].classList.contains('live');
        x.strokeStyle = rgba(c, busy ? .85 : .45); x.lineWidth = busy ? 1.8 : 1.1;
        x.beginPath(); x.moveTo(sx, sy); x.bezierCurveTo(m, sy, m, ey, ex, ey); x.stroke();
        x.fillStyle = rgba(c, 1); x.beginPath(); x.arc(sx, sy, 2.5, 0, TAU); x.fill(); x.beginPath(); x.arc(ex, ey, 3, 0, TAU); x.fill();
        if (st.running) for (var k = 0; k < 2; k++) {
          var u = (T * (0.25 + 0.08 * i) + k * 0.5) % 1;
          x.fillStyle = rgba(c, 1); x.shadowColor = rgba(c, 1); x.shadowBlur = 8;
          x.beginPath(); x.arc(bez(sx, m, m, ex, u), bez(sy, sy, ey, ey, u), 2.2, 0, TAU); x.fill(); x.shadowBlur = 0;
        }
      }
    }

    function draw(dt) { drawOrb(dt); drawWires(); }
    function frame(ts) {
      raf = 0;
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; T += dt;
      draw(dt);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function start() { if (!reduced && !raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
    O.size(); Wr.size();
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }).observe(root);
    document.addEventListener('visibilitychange', start);
    start();

    return {
      // s: running, universe [short symbols], hot {sym: colour slot}, open [{s, b, pnl, pm}], mood (-1 .. 1)
      update: function (s) {
        st.running = !!s.running; st.uni = s.universe || []; st.hot = s.hot || {}; st.open = s.open || [];
        st.mood = Math.max(-1, Math.min(1, s.mood || 0));
        if (reduced) draw(0); else start();
      },
      // {kind: 'entry'|'exit', c: colour slot, sym, value, label}
      flash: function (e) {
        if (reduced || document.hidden) return;
        if (fx.length > 6) fx.shift();
        fx.push({ kind: e.kind, s: e.sym, b: e.c || 0, win: e.value >= 0, label: e.label || '', t: 0 });
        start();
      },
      redraw: function () { if (reduced) draw(0); }
    };
  };
})();
