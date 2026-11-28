/* Apps list (revamp 28 Nov 2026): one live card per bot, built from the API so every running strategy shows.
   Same definitions as the dashboards: Balance = realised balance of the running strategies, Open P&L = live value
   of the open trades, Today = realised P&L of the running strategies since 00:00 IST. */
(function () {
  'use strict';
  var M = window.Mintoro;
  var COLOR = { '1H RSI LONG': 0, '1H RSI SHORT': 1, 'EMA20 LONG': 2, 'EMA20 SHORT': 3, '4H RETRACE LONG': 4, '4H RETRACE SHORT': 5 };
  var FACE_CYCLE = ['scan', 'look', 'scan', 'think'];
  var seen = {};                                   // bot -> summary for the strip at the top

  function q(scope, f) { return scope.querySelector('[data-f="' + f + '"]'); }
  function isRunning(b) { return !b.state || b.state === 'running'; }
  function isCurrent(b) { return isRunning(b) || M.positions(b).length > 0; }
  function upnlOf(b) {
    return M.positions(b).reduce(function (a, p) { return a + (typeof p.unrealised_pnl === 'number' ? p.unrealised_pnl : 0); }, 0);
  }
  function istParts(d) {
    var s = d.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false, weekday: 'short', hour: '2-digit', minute: '2-digit' });
    var m = /(\w{3}).*?(\d{2}):(\d{2})/.exec(s);
    return { wd: m[1], min: parseInt(m[2], 10) * 60 + parseInt(m[3], 10) };
  }
  function span(mins) {
    var d = Math.floor(mins / 1440), h = Math.floor(mins % 1440 / 60), m = mins % 60;
    return d ? d + 'd ' + h + 'h' : h ? h + 'h ' + m + 'm' : m + 'm';
  }
  // NSE session line (weekdays 09:15–15:30 IST; exchange holidays are not known here).
  function nseWhen() {
    var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], t = istParts(new Date());
    var wd = DAYS.indexOf(t.wd), OPEN = 555, CLOSE = 930;
    if (wd >= 1 && wd <= 5 && t.min >= OPEN && t.min < CLOSE) return { open: true, text: 'Market open · closes 15:30 IST (in ' + span(CLOSE - t.min) + ')' };
    var add = 0, day = wd;
    if (!(wd >= 1 && wd <= 5 && t.min < OPEN)) {       // next weekday
      do { day = (day + 1) % 7; add++; } while (day === 0 || day === 6);
    }
    var mins = add * 1440 + OPEN - t.min;
    return { open: false, text: 'Market closed · opens ' + (add === 0 ? 'today' : add === 1 ? 'tomorrow' : DAYS[day]) + ' 09:15 IST (in ' + span(mins) + ')' };
  }
  function when(t) {
    if (!t) return '';
    return (t.slice(0, 10) === M.todayIST() ? '' : M.dayMonth(t) + ' ') + M.hhmm(t) + ' IST';
  }

  // ---------- bot face: same moods as the dashboards ----------
  var faces = {};
  function faceSet(bot, mode) {
    var el = q(document.querySelector('[data-app="' + bot + '"]'), 'face');
    ['scan', 'look', 'think', 'sleep'].forEach(function (m) { el.classList.toggle('m-' + m, m === mode); });
  }
  function faceStep(bot) {
    var f = faces[bot];
    if (!f.awake) return;
    var mode = FACE_CYCLE[f.i++ % FACE_CYCLE.length];
    if (mode === 'think' && !f.busy && Math.random() < 0.5) mode = 'look';
    faceSet(bot, mode);
    f.timer = setTimeout(function () { faceStep(bot); }, mode === 'scan' ? 7000 : 4500);
  }
  function setFace(bot, awake, busy) {
    var f = faces[bot] || (faces[bot] = { i: bot === 'nse' ? 1 : 0 });
    f.busy = busy;
    if (awake === f.awake) return;
    f.awake = awake;
    clearTimeout(f.timer);
    if (awake && !M.reduced()) faceStep(bot); else faceSet(bot, awake ? 'scan' : 'sleep');
  }

  // ---------- strategy rows ----------
  function rowState(b, cur) {
    var ps = M.positions(b);
    if (ps.length) {
      return ps.map(function (p) {
        var v = p.unrealised_pnl, has = typeof v === 'number';
        return M.h('span', { class: 'tr' },
          M.h('b', { text: M.shortSym(p.symbol) }), ' ' + (p.side || ''),
          has ? M.h('span', { class: v >= 0 ? 'accent' : 'red', text: ' ' + M.money(v, cur, { signed: true }) }) : '');
      }).concat(b.state === 'paused' ? [M.h('span', { class: 'muted', text: ' · paused' })] : []);
    }
    if (b.state === 'paused') return [M.h('span', { class: 'muted', text: 'paused' })];
    var range = b.name === 'POC RETURN' || b.name.indexOf('BREAK') !== -1;
    if (b.watch_count) return [M.h('span', { class: range ? 'muted' : 'arm', text: b.watch_count + (range ? ' in range' : ' armed') })];
    return [M.h('span', { class: 'muted', text: 'scanning' })];
  }
  function renderRows(card, books, cur) {
    var box = q(card, 'rows');
    box.textContent = '';
    books.forEach(function (b, i) {
      var k = COLOR[b.name] !== undefined ? COLOR[b.name] : i % 6, n = M.positions(b).length, u = upnlOf(b);
      var row = M.h('div', { class: 'srow' + (n ? (u >= 0 ? ' win' : ' lose') : '') },
        M.h('span', { class: 'sw sw-' + k, 'aria-hidden': 'true' }),
        M.h('span', { class: 'sn', text: b.name }),
        M.h.apply(null, ['span', { class: 'ss' }].concat(rowState(b, cur))));
      box.appendChild(row);
    });
  }
  function spark(svg, pts) {
    var path = svg.querySelector('path');
    var vs = (pts || []).slice(-40).map(function (p) { return p.balance; }).filter(function (v) { return typeof v === 'number'; });
    if (vs.length < 2) { path.setAttribute('d', ''); return; }
    var lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs), r = hi - lo || 1;
    path.setAttribute('d', vs.map(function (v, i) {
      return (i ? 'L' : 'M') + (i / (vs.length - 1) * 100).toFixed(1) + ' ' + (20 - (v - lo) / r * 18).toFixed(1);
    }).join(' '));
    svg.classList.toggle('down', vs[vs.length - 1] < vs[0]);
  }
  function lastEvent(d, names, cur) {
    var e = (d.events || []).filter(function (e) { return (e.kind === 'ENTRY' || e.kind === 'EXIT') && names[e.book]; })[0];
    if (!e) return 'No trades yet on the running strategies';
    var s = M.shortSym(e.symbol) + (e.side ? ' ' + e.side : '');
    if (e.kind === 'EXIT' && typeof e.value === 'number') {
      return [M.h('span', { class: 'muted', text: 'Last exit · ' }), M.h('b', { text: s }), ' ',
        M.h('span', { class: e.value >= 0 ? 'accent' : 'red', text: M.money(e.value, cur, { signed: true }) }),
        M.h('span', { class: 'muted', text: ' · ' + e.book + ' · ' + when(e.time) })];
    }
    return [M.h('span', { class: 'muted', text: 'Last entry · ' }), M.h('b', { text: s }),
      M.h('span', { class: 'muted', text: ' · ' + e.book + ' · ' + when(e.time) })];
  }
  function put(el, parts) {
    el.textContent = '';
    (Array.isArray(parts) ? parts : [parts]).forEach(function (p) { el.appendChild(typeof p === 'string' ? document.createTextNode(p) : p); });
  }

  function render(bot, d) {
    var card = document.querySelector('[data-app="' + bot + '"]');
    if (!card) return;
    var cur = d.currency, active = d.status === 'active';
    var books = (d.books || []).filter(isCurrent), run = books.filter(isRunning), names = {};
    books.forEach(function (b) { names[b.name] = 1; });
    var nse = bot === 'nse' ? nseWhen() : null, awake = active && (!nse || nse.open);

    q(card, 'dot').className = 'dot' + (active ? (awake ? '' : ' idle') : ' off');
    var st = q(card, 'status');
    st.classList.remove('reconnect');
    st.textContent = !active ? d.status : awake ? (nse ? 'trading' : 'trading 24/7') : 'asleep';
    q(card, 'when').textContent = !active ? 'Bot is ' + d.status
      : nse ? nse.text
      : 'Runs 24/7' + (d.scan && d.scan.last_full ? ' · last full scan ' + when(d.scan.last_full) + (d.scan.count ? ' · ' + d.scan.count + ' coins' : '') : '');
    card.style.order = nse && nse.open ? -1 : 0;

    var bal = run.reduce(function (a, b) { return a + (b.balance || 0); }, 0);
    var upnl = books.reduce(function (a, b) { return a + upnlOf(b); }, 0);
    var nOpen = books.reduce(function (a, b) { return a + M.positions(b).length; }, 0);
    var day = M.todayIST(), today = 0;
    run.forEach(function (b) {
      (b.equity || []).forEach(function (p) { if (p.time && p.time.slice(0, 10) === day && typeof p.pnl === 'number') today += p.pnl; });
    });
    M.tick(q(card, 'balance'), bal, function (v) { return M.money(v, cur, { compact: true }); });
    [['today', today], ['upnl', upnl]].forEach(function (x) {
      var el = q(card, x[0]);
      M.tick(el, x[1], function (v) { return M.money(v, cur, { signed: true, compact: true }); });
      el.classList.toggle('accent', x[1] > 0.005);
      el.classList.toggle('red', x[1] < -0.005);
    });
    if (!nOpen) q(card, 'upnl').textContent = '—';
    q(card, 'open').textContent = String(nOpen);
    spark(q(card, 'spark'), d.equity_total);
    q(card, 'nrun').textContent = run.length + ' running';
    renderRows(card, books, cur);
    put(q(card, 'last'), lastEvent(d, names, cur));
    var past = (d.books || []).length - books.length, pl = q(card, 'pastlink');
    pl.hidden = !past;
    pl.textContent = past + ' past strateg' + (past === 1 ? 'y' : 'ies') + ' →';

    var armed = run.reduce(function (a, b) { return a + (b.watch_count || 0); }, 0);
    setFace(bot, awake, nOpen + (armed ? 1 : 0));
    seen[bot] = { awake: awake, open: nOpen, run: run.length };
    strip();
  }
  function strip() {
    var s = { awake: 0, open: 0, run: 0 }, n = 0;
    Object.keys(seen).forEach(function (k) { var v = seen[k]; if (!v) return; n++; s.awake += v.awake ? 1 : 0; s.open += v.open; s.run += v.run; });
    var el = document.querySelector('[data-f="strip"]');
    if (!el || !n) return;
    put(el, [M.h('span', { text: '2 bots' }),
      M.h('span', { class: s.awake ? 'on' : '', text: s.awake + ' trading now' }),
      M.h('span', { text: s.open + ' open trade' + (s.open === 1 ? '' : 's') }),
      M.h('span', { text: s.run + ' strategies running' })]);
  }
  function failed(bot) {
    var card = document.querySelector('[data-app="' + bot + '"]');
    if (!card) return;
    q(card, 'dot').className = 'dot off';
    var st = q(card, 'status');
    st.textContent = 'reconnecting…';
    st.classList.add('reconnect');
    setFace(bot, false, 0);
  }
  document.addEventListener('DOMContentLoaded', function () {
    ['crypto', 'nse'].forEach(function (bot) {
      M.poll(bot, 5000, function (d) { render(bot, d); }, function () { failed(bot); });
    });
  });
})();
