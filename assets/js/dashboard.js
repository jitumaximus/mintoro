/* Bot terminal dashboard: polls api.mintoro.app every 5 s and animates what changed. */
(function () {
  'use strict';
  var M = window.Mintoro, h = M.h;
  var BOT = document.body.getAttribute('data-bot');
  var POLL_MS = 5000, LOG_SHOW = 8, WATCH_SHOW = 5;
  var DESC = {
    'POC RETURN': 'US-session volume POC, limit entry when price returns',
    '1H RSI LONG': '1H RSI < 30, bullish divergence on 15m',
    '1H RSI SHORT': '1H RSI > 70, bearish divergence on 5m',
    '2H RSI SHORT': '2H RSI > 70, bearish divergence on 5m',
    '2H RSI LONG': '2H RSI < 30, bullish divergence on 15m',
    '1H BREAKOUT': '1H range ≤ 1%, break up at minute 12',
    '1H BREAKDOWN': '1H range ≤ 1%, break down at minute 12'
  };
  var ICON = { 'POC RETURN': 'POC', '1H RSI LONG': 'RL', '1H RSI SHORT': 'RS', '2H RSI SHORT': '2S', '2H RSI LONG': '2L', '1H BREAKOUT': 'BO', '1H BREAKDOWN': 'BD' };
  var KIND = { ENTRY: 'ENTER', RSI1H_SIGNAL: 'SIGNAL', RSI1H_SKIP: 'SKIP', RSI1H_SCAN: 'SCAN', POC_ORDER: 'ORDER', POC_FILLED: 'FILL',
    POC_MISSED: 'MISS', POC_ORDER_CANCELLED: 'CANCEL', RSI1H_STOP_WIDENED: 'STOP', BREAKEVEN: 'BE', POC_BUILT: 'POC', STARTED: 'START' };
  // which flow stage an event belongs to (SCAN ARM TRIGGER SIZE EXEC LOG)
  var STAGE = { RSI1H_SCAN: 0, POC_BUILT: 0, STARTED: 0, RSI1H_SIGNAL: 2, RSI1H_SKIP: 2, SKIP: 2, RSI1H_STOP_WIDENED: 3,
    POC_ORDER: 3, POC_FILLED: 4, ENTRY: 4, BREAKEVEN: 5, POC_MISSED: 1, POC_ORDER_CANCELLED: 5, EXIT: 5 };

  function q(f) { return document.querySelector('[data-f="' + f + '"]'); }
  var cur = BOT === 'nse' ? 'INR' : 'USD';
  var state = { seen: {}, seenCount: 0, first: true, stage: 0, hot: 0, lastLine: null };

  function evKey(e) { return [e.time, e.kind, e.symbol, e.value, e.book].join('|'); }
  function kindClass(e) {
    if (e.kind === 'EXIT') return e.value >= 0 ? 'k-exit-win' : 'k-exit-loss';
    if (e.kind === 'ENTRY' || e.kind === 'POC_FILLED') return 'k-entry';
    if (e.kind === 'RSI1H_SIGNAL' || e.kind === 'BREAKEVEN' || e.kind === 'RSI1H_STOP_WIDENED') return 'k-arm';
    if (e.kind.indexOf('POC') === 0 || e.kind === 'RSI1H_SCAN') return 'k-order';
    return 'k-skip';
  }
  function evValue(e) {
    if (e.value === null || e.value === undefined) return e.side || '';
    if (e.kind === 'EXIT') return M.money(e.value, cur, { signed: true });
    if (e.kind === 'RSI1H_SCAN') return e.value + ' coins';
    if (e.kind === 'RSI1H_SIGNAL') return 'RSI gap ' + e.value;
    if (e.kind === 'RSI1H_SKIP') return 'RSI ' + e.value;
    return M.price(e.value);
  }
  function evTime(t) {
    if (!t) return '--:--';
    return t.slice(0, 10) === M.todayIST() ? M.hhmm(t) : M.dayMonth(t) + ' ' + M.hhmm(t);
  }

  // ---------- header ----------
  function runLine(ok, text) {
    var run = q('run');
    run.classList.toggle('reconnect', !ok);
    q('dot').className = 'dot' + (ok ? '' : ' off');
    q('runtext').textContent = text;
  }
  function chip(events) {
    var e = events.filter(function (x) { return x.kind === 'ENTRY' || x.kind === 'EXIT'; })[0];
    if (!e) return events[0] ? 'LAST · ' + (KIND[events[0].kind] || events[0].kind) + ' ' + M.shortSym(events[0].symbol || '') : 'SCANNING';
    if (e.kind === 'ENTRY') return 'EXECUTOR · ENTERED ' + M.shortSym(e.symbol) + ' · ' + evTime(e.time) + ' IST';
    return 'EXECUTOR · CLOSED ' + M.shortSym(e.symbol) + ' ' + M.money(e.value, cur, { signed: true }) + ' · ' + evTime(e.time) + ' IST';
  }

  // ---------- strategies ----------
  function bookLine(b) {
    var p = b.open_position;
    if (p) return 'in trade: ' + M.shortSym(p.symbol) + ' ' + (p.side || '');
    var w = b.watch || [];
    if (!w.length) return 'nothing armed · scanning';
    if (w[0].distance_pct !== undefined) return 'next: ' + M.shortSym(w[0].symbol) + ' · ' + M.watchNote(w[0]).replace('POC ', '');
    if (w[0].detail !== undefined && w[0].rsi_2h === undefined) return 'watching ' + b.watch_count + ' ranges';
    return 'armed: ' + w.slice(0, 2).map(function (x) {
      var r = typeof x.rsi_1h === 'number' ? x.rsi_1h : x.rsi_2h;
      return M.shortSym(x.symbol) + ' ' + (typeof r === 'number' ? r.toFixed(1) : '');
    }).join(' · ');
  }
  var bookEls = {};
  function renderBooks(books) {
    var box = q('books');
    books.forEach(function (b, i) {
      var el = bookEls[b.name];
      if (!el) {
        el = h('div', { class: 'strat' },
          h('div', { class: 'row' },
            h('div', { class: 'who' }, h('div', { class: 'ic ic-' + (i % 4), text: ICON[b.name] || b.name.slice(0, 2) }), h('div', { class: 'nm', text: b.name })),
            h('span', { class: 'st' })),
          h('p', { class: 'desc', text: DESC[b.name] || '' }),
          h('p', { class: 'line' }),
          h('p', { class: 'bal' }));
        bookEls[b.name] = el;
        box.appendChild(el);
      }
      var live = !!b.open_position;
      el.classList.toggle('active', live);
      el.querySelector('.st').textContent = live ? 'LIVE' : (b.watch_count ? 'ARMED' : 'SCAN');
      el.querySelector('.line').textContent = bookLine(b);
      var pnl = b.balance !== null && b.start_balance !== null ? b.balance - b.start_balance : null;
      el.querySelector('.bal').textContent = M.money(b.balance, cur, { compact: true }) + ' (' + M.money(pnl, cur, { signed: true, compact: true }) +
        ') · ' + b.trades + ' trades · ' + b.wins + 'W/' + b.losses + 'L · watching ' + b.watch_count;
    });
  }

  // ---------- watch tiles ----------
  var PIPS = ['var(--warn)', 'var(--accent)', 'var(--blue)', 'var(--violet)', 'var(--red)'];
  function renderWatch(books) {
    q('watching').textContent = 'watching ' + M.sumWatch(books);
    var box = q('watch'), top = M.topWatch(books, WATCH_SHOW);
    var keys = top.map(function (t) { return t.w.symbol + t.w.side; }).join(',');
    if (box.getAttribute('data-keys') === keys) {
      top.forEach(function (t, i) { var n = box.children[i] && box.children[i].querySelector('.nt'); if (n) n.textContent = M.watchNote(t.w); });
      return;
    }
    var old = {};
    Array.prototype.forEach.call(box.children, function (c) { old[c.getAttribute('data-k')] = 1; });
    box.textContent = '';
    box.setAttribute('data-keys', keys);
    if (!top.length) { box.appendChild(h('p', { class: 'watch-empty', text: 'Nothing armed right now.' })); return; }
    top.forEach(function (t, i) {
      var k = t.w.symbol + t.w.side;
      var pip = h('span', { class: 'pip' });
      pip.style.background = PIPS[i % PIPS.length];
      box.appendChild(h('div', { class: 'watch' + (old[k] || state.first ? '' : ' new'), 'data-k': k, title: t.book },
        h('div', { class: 'row' }, h('span', { class: 'sym', text: M.shortSym(t.w.symbol) }), pip),
        h('div', { class: 'nt', text: M.watchNote(t.w) })));
    });
  }
  function cycleHot() {
    var tiles = q('watch').querySelectorAll('.watch');
    tiles.forEach(function (t, i) { t.classList.toggle('hot', i === state.hot % Math.max(1, tiles.length)); });
    state.hot++;
  }

  // ---------- flow stages ----------
  function showStage(n) {
    state.stage = n;
    document.querySelectorAll('.stage').forEach(function (s, i) {
      s.classList.toggle('on', i === n);
      s.classList.toggle('done', i < n);
    });
  }
  function stepStages() { showStage((state.stage + 1) % 6); }

  // ---------- open trades ----------
  function reasonFor(sym, events) {
    var pick = null;
    events.forEach(function (e) {
      if (e.symbol !== sym) return;
      if (e.kind === 'RSI1H_SIGNAL' && (!pick || pick.kind !== 'RSI1H_SIGNAL')) pick = e;
      else if (!pick && (e.kind === 'ENTRY' || e.kind === 'POC_FILLED' || e.kind === 'POC_ORDER')) pick = e;
    });
    return pick ? pick.reason : null;
  }
  function renderTrades(books, events) {
    var open = books.filter(function (b) { return b.open_position; });
    var badge = q('openbadge');
    badge.textContent = open.length ? (open.length === 1 ? 'OPEN' : open.length + ' OPEN') : 'FLAT';
    badge.classList.toggle('flat', !open.length);
    var box = q('trades-open');
    var keys = open.map(function (b) { return b.name + b.open_position.symbol; }).join(',');
    if (box.getAttribute('data-keys') !== keys) {
      box.textContent = '';
      box.setAttribute('data-keys', keys);
      if (!open.length) box.appendChild(h('p', { class: 'flat-msg', text: 'No open trade. The bot is flat and scanning.' }));
      open.forEach(function (b) {
        box.appendChild(h('div', { class: 'trade', 'data-book': b.name },
          h('div', { class: 'head' }, h('span', { class: 'sym' }), h('span', { class: 'side' }), h('span', { class: 'pnl' })),
          h('dl', null,
            h('dt', { text: 'book' }), h('dd', { 'data-x': 'book' }),
            h('dt', { text: 'entry' }), h('dd', { 'data-x': 'entry' }),
            h('dt', { text: 'now' }), h('dd', { 'data-x': 'now' }),
            h('dt', { text: 'stop' }), h('dd', { 'data-x': 'stop' }),
            h('dt', { text: 'size' }), h('dd', { 'data-x': 'size' })),
          h('p', { class: 'why' }, h('b', { text: 'reason:' }), ' ', h('span', { 'data-x': 'why' }))));
      });
    }
    open.forEach(function (b) {
      var p = b.open_position, el = box.querySelector('[data-book="' + b.name + '"]');
      if (!el) return;
      el.querySelector('.sym').textContent = M.shortSym(p.symbol);
      el.querySelector('.side').textContent = p.side || '';
      var pnlEl = el.querySelector('.pnl');
      if (p.unrealised_pnl === null || p.unrealised_pnl === undefined) {
        pnlEl.textContent = 'open';
        pnlEl.className = 'pnl muted';
      } else {
        var pc = p.mark_price && p.entry ? (p.side === 'long' ? p.mark_price / p.entry - 1 : 1 - p.mark_price / p.entry) * 100 : null;
        M.tick(pnlEl, p.unrealised_pnl, function (v) { return M.money(v, cur, { signed: true }) + (pc === null ? '' : ' · ' + M.pct(pc, true)); });
        pnlEl.className = 'pnl ' + (p.unrealised_pnl >= 0 ? 'accent' : 'red');
      }
      el.querySelector('[data-x="book"]').textContent = b.name + ' · since ' + evTime(p.opened_at) + ' IST';
      el.querySelector('[data-x="entry"]').textContent = M.price(p.entry);
      el.querySelector('[data-x="now"]').textContent = p.mark_price === null || p.mark_price === undefined ? '— (no live NSE price)' : M.price(p.mark_price);
      el.querySelector('[data-x="stop"]').textContent = M.price(p.stop) +
        (p.entry && p.stop ? ' (' + (Math.abs(p.stop / p.entry - 1) * 100).toFixed(2) + '%)' : '');
      el.querySelector('[data-x="size"]').textContent = M.price(p.size) + (BOT === 'nse' ? ' qty' : ' units');
      el.querySelector('[data-x="why"]').textContent = reasonFor(p.symbol, events) || b.name;
    });
  }

  // ---------- log ----------
  function renderLog(events) {
    var newest = null;
    events.forEach(function (e) {
      var k = evKey(e);
      if (!state.seen[k]) { state.seen[k] = state.first ? 1 : 2; state.seenCount++; if (!state.first && !newest) newest = e; }
    });
    var lines = events.slice(0, LOG_SHOW).reverse(); // oldest first, newest at the bottom
    var box = q('log');
    var keys = lines.map(evKey).join(',');
    if (box.getAttribute('data-keys') !== keys) {
      box.textContent = '';
      box.setAttribute('data-keys', keys);
      lines.forEach(function (e) {
        var cls = kindClass(e), fresh = state.seen[evKey(e)] === 2;
        box.appendChild(h('div', { class: 'log-line' + (fresh ? ' new' : '') },
          h('div', { class: 'meta' },
            h('span', { class: 'muted', text: evTime(e.time) }), ' ',
            h('span', { class: cls, text: KIND[e.kind] || e.kind }), ' ',
            h('span', { text: M.shortSym(e.symbol || '') }), ' ',
            h('span', { class: cls, text: evValue(e) })),
          h('div', { class: 'why', text: (e.book ? e.book + ' · ' : '') + (e.reason || '') })));
      });
      Array.prototype.forEach.call(box.querySelectorAll('.new'), function (n) { setTimeout(function () { n.classList.remove('new'); }, 600); });
    }
    q('loglines').textContent = state.seenCount + ' lines';
    M.tick(q('lineno'), state.seenCount, function (v) { return 'line #' + Math.round(v); });
    if (newest && STAGE[newest.kind] !== undefined) showStage(STAGE[newest.kind]);
  }

  // ---------- equity ----------
  function renderEquity(d) {
    var t = d.totals, now = t.balance + (t.unrealised_pnl || 0);
    var c = M.curve((d.equity_total || []).map(function (p) { return p.balance; }).concat([now]), 1000, 180, 10);
    q('start').textContent = M.money(t.start_balance, cur, { compact: true });
    var nowEl = q('now');
    M.tick(nowEl, now, function (v) { return M.money(v, cur, { compact: true }); });
    nowEl.className = now >= t.start_balance ? 'accent' : 'red';
    var since = (d.equity_total || [])[0];
    q('since').textContent = since && since.time ? 'since ' + M.dayMonth(since.time) : '';
    if (!c) return;
    var line = q('line'), area = q('area'), base = q('base');
    var down = c.end < c.first;
    if (line.getAttribute('points') !== c.line) {
      line.setAttribute('points', c.line);
      area.setAttribute('points', '0,180 ' + c.line + ' 1000,180');
      line.classList.remove('draw'); void line.getBBox(); if (!M.reduced()) line.classList.add('draw');
    }
    line.classList.toggle('down', down);
    area.classList.toggle('down', down);
    var y = c.y(t.start_balance).toFixed(1);
    base.setAttribute('y1', y); base.setAttribute('y2', y);
  }

  // ---------- main ----------
  function render(d) {
    var books = d.books || [], events = d.events || [], t = d.totals;
    var running = d.status === 'active';
    var label = !running ? 'bot ' + d.status : BOT === 'nse' ? (M.nseMarketOpen() ? 'running · market open' : 'running · market closed') : 'running';
    runLine(running, label);
    q('chip').textContent = chip(events);
    M.tick(q('balance'), t.balance, function (v) { return M.money(v, cur, { compact: true }); });
    M.tick(q('trades'), t.trades, function (v) { return String(Math.round(v)); });
    M.tick(q('wins'), t.wins, function (v) { return String(Math.round(v)); });
    M.tick(q('losses'), t.losses, function (v) { return String(Math.round(v)); });
    q('online').textContent = books.length + (running ? ' online' : ' stopped');
    renderBooks(books);
    renderWatch(books);
    var skipped = events.filter(function (e) { return e.kind === 'SKIP' || e.kind === 'RSI1H_SKIP'; }).length;
    M.tick(q('skipped'), skipped, function (v) { return String(Math.round(v)); });
    var last = events.filter(function (e) { return e.kind === 'EXIT'; })[0];
    var lc = q('lastclose');
    lc.textContent = last ? M.money(last.value, cur, { signed: true }) : '—';
    lc.className = 'v ' + (last ? (last.value >= 0 ? 'accent' : 'red') : '');
    q('lastclosenote').textContent = last ? (last.reason || '').toLowerCase() + ' · ' + M.shortSym(last.symbol) + ' · ' + (last.book || '') : 'no closed trade in the log';
    renderTrades(books, events);
    renderLog(events);
    renderEquity(d);
    state.first = false;
  }
  function failed() {
    runLine(false, 'Reconnecting…');
  }

  document.addEventListener('DOMContentLoaded', function () {
    showStage(0);
    M.poll(BOT, POLL_MS, render, failed);
    if (!M.reduced()) {
      setInterval(stepStages, 1400);
      setInterval(cycleHot, 1500);
    }
  });
})();
