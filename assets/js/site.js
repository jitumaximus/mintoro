/* Mintoro Technologies — shared site code: theme toggle, IST clock, live-data helpers. No dependencies. */
(function () {
  'use strict';
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return !!(media && media.matches);
  }
  function syncThemeButtons() {
    var label = isDark() ? 'Light' : 'Dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      var span = b.querySelector('.label');
      if (span) span.textContent = label + (b.hasAttribute('data-theme-long') ? ' theme' : '');
      b.setAttribute('aria-label', 'Switch to ' + label.toLowerCase() + ' theme');
    });
  }
  function toggleTheme() {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mintoro-theme', next); } catch (e) { /* not remembered, still switched */ }
    syncThemeButtons();
    document.dispatchEvent(new CustomEvent('mintoro:theme'));
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-theme-toggle]');
    if (b) toggleTheme();
  });
  if (media && media.addEventListener) media.addEventListener('change', syncThemeButtons);

  // ---------- IST helpers ----------
  var IST = 'Asia/Kolkata';
  function clockIST() {
    return new Date().toLocaleTimeString('en-GB', { timeZone: IST, hour12: false });
  }
  function todayIST() {
    return new Date().toLocaleDateString('en-CA', { timeZone: IST }); // YYYY-MM-DD
  }
  function startClocks() {
    function tick() {
      var c = clockIST();
      document.querySelectorAll('[data-clock]').forEach(function (el) { el.textContent = c; });
    }
    tick();
    setInterval(tick, 1000);
  }
  // API times are ISO 8601 in IST (+05:30): read them as text, so every viewer sees IST.
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function hhmm(t) { return t ? t.slice(11, 16) : '—'; }
  function dayMonth(t) {
    if (!t) return '—';
    return String(parseInt(t.slice(8, 10), 10)) + ' ' + MONTHS[parseInt(t.slice(5, 7), 10) - 1];
  }

  // ---------- formatting ----------
  function money(v, cur, opts) {
    opts = opts || {};
    if (v === null || v === undefined || isNaN(v)) return '—';
    var abs = Math.abs(v), body;
    if (cur === 'INR') {
      body = opts.compact && abs >= 100000
        ? '₹' + (abs / 100000).toFixed(2) + 'L'
        : '₹' + abs.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    } else {
      body = '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    var sign = v < 0 ? '−' : (opts.signed && v > 0 ? '+' : '');
    return sign + body;
  }
  function price(v) {
    if (v === null || v === undefined || isNaN(v)) return '—';
    return Number(v).toLocaleString('en-US', { maximumSignificantDigits: 8 });
  }
  function pct(v, signed) {
    if (v === null || v === undefined || isNaN(v)) return '—';
    return (v < 0 ? '−' : (signed && v > 0 ? '+' : '')) + Math.abs(v).toFixed(2) + '%';
  }
  function shortSym(s) {
    if (!s) return '—';
    return String(s).replace(/^NSE:/, '').replace(/\d{2}[A-Z]{3}FUT$/, '');
  }

  // ---------- DOM ----------
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') el.textContent = v;
      else if (k === 'class') el.className = v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return el;
  }
  function setText(sel, text, scope) {
    (scope || document).querySelectorAll(sel).forEach(function (el) { el.textContent = text; });
  }

  // Number tick-up: animate from the previous value to the new one.
  function tick(el, value, fmt) {
    if (!el) return;
    var prev = el._mtValue;
    el._mtValue = value;
    if (value === null || value === undefined || isNaN(value)) { el.textContent = fmt(value); return; }
    if (prev === undefined || prev === null || isNaN(prev) || prev === value || (reduced && reduced.matches)) {
      el.textContent = fmt(value);
      return;
    }
    el.classList.remove('tick-up', 'tick-down');
    void el.offsetWidth;
    el.classList.add(value > prev ? 'tick-up' : 'tick-down');
    var start = performance.now(), dur = 700;
    cancelAnimationFrame(el._mtRaf);
    (function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(p < 1 ? prev + (value - prev) * e : value);
      if (p < 1) el._mtRaf = requestAnimationFrame(step);
    })(start);
  }

  // Equity points -> SVG polyline "x,y" string inside a w x h box.
  function curve(values, w, h, pad) {
    pad = pad === undefined ? 8 : pad;
    var vals = values.filter(function (v) { return typeof v === 'number' && !isNaN(v); });
    if (vals.length < 2) return null;
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals), span = max - min || 1;
    var pts = vals.map(function (v, i) {
      return [i / (vals.length - 1) * w, h - pad - (v - min) / span * (h - 2 * pad)];
    });
    return {
      line: pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '),
      last: pts[pts.length - 1], min: min, max: max, first: vals[0], end: vals[vals.length - 1],
      y: function (v) { return h - pad - (v - min) / span * (h - 2 * pad); }
    };
  }

  // ---------- live API ----------
  var API = 'https://api.mintoro.app/v1/bots/';
  function fetchBot(bot) {
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 8000) : null;
    return fetch(API + bot, { credentials: 'omit', cache: 'no-store', signal: ctl ? ctl.signal : undefined })
      .then(function (r) {
        if (timer) clearTimeout(timer);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
  }
  // Poll every `ms`; pause while the tab is hidden. onData(data), onError(err).
  function poll(bot, ms, onData, onError) {
    var timer = null, busy = false;
    function run() {
      if (busy) return;
      busy = true;
      fetchBot(bot).then(function (d) { busy = false; onData(d); }, function (e) { busy = false; onError(e); });
    }
    function schedule() { clearInterval(timer); timer = setInterval(function () { if (!document.hidden) run(); }, ms); }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) run(); });
    run();
    schedule();
  }

  // Most relevant watch items: round-robin over each book's list (already sorted best-first by the API).
  function topWatch(books, n) {
    var lists = books.map(function (b) { return (b.watch || []).map(function (w) { return { w: w, book: b.name }; }); });
    var out = [], seen = {}, i = 0, more = true;
    while (out.length < n && more) {
      more = false;
      for (var b = 0; b < lists.length && out.length < n; b++) {
        if (i < lists[b].length) {
          more = true;
          var it = lists[b][i];
          if (!seen[it.w.symbol]) { seen[it.w.symbol] = 1; out.push(it); }
        }
      }
      i++;
    }
    return out;
  }
  function watchNote(w) {
    if (w.distance_pct !== undefined) return w.distance_pct === null ? 'POC ' + price(w.level) : 'POC ' + w.distance_pct.toFixed(2) + '% away';
    if (typeof w.rsi_1h === 'number') return '1H RSI ' + w.rsi_1h.toFixed(1) + ' · ' + w.side;
    if (typeof w.rsi_2h === 'number') return '2H RSI ' + w.rsi_2h.toFixed(1) + ' · ' + w.side;
    var m = /\(([\d.]+%)\)/.exec(w.detail || '');
    return (m ? 'range ' + m[1] : 'range') + ' · ' + (w.side === 'long' ? 'breakout' : 'breakdown');
  }
  function sumWatch(books) { return books.reduce(function (s, b) { return s + (b.watch_count || 0); }, 0); }
  function todayPnl(data) {
    var day = todayIST(), s = 0;
    (data.books || []).forEach(function (b) {
      (b.equity || []).forEach(function (p) { if (p.time && p.time.slice(0, 10) === day && typeof p.pnl === 'number') s += p.pnl; });
    });
    return s;
  }
  function nseMarketOpen() {
    var now = new Date();
    var wd = now.toLocaleDateString('en-GB', { timeZone: IST, weekday: 'short' });
    var hm = now.toLocaleTimeString('en-GB', { timeZone: IST, hour12: false, hour: '2-digit', minute: '2-digit' });
    return wd !== 'Sat' && wd !== 'Sun' && hm >= '09:15' && hm < '15:30';
  }

  // Every open trade of a book, oldest first (the crypto 1H RSI books can hold several at once since 26 Nov 2026).
  function positions(b) {
    if (b && Array.isArray(b.open_positions)) return b.open_positions;
    return b && b.open_position ? [b.open_position] : [];
  }
  function tradesLabel(ps) {
    return ps.map(function (p) { return shortSym(p.symbol) + (p.side ? ' ' + p.side : ''); }).join(' · ');
  }

  window.Mintoro = {
    isDark: isDark, reduced: function () { return !!(reduced && reduced.matches); },
    clockIST: clockIST, todayIST: todayIST, hhmm: hhmm, dayMonth: dayMonth,
    money: money, price: price, pct: pct, shortSym: shortSym, h: h, setText: setText, tick: tick, curve: curve,
    fetchBot: fetchBot, poll: poll, topWatch: topWatch, watchNote: watchNote, sumWatch: sumWatch,
    todayPnl: todayPnl, nseMarketOpen: nseMarketOpen, positions: positions, tradesLabel: tradesLabel
  };

  document.addEventListener('DOMContentLoaded', function () { syncThemeButtons(); startClocks(); });
})();
