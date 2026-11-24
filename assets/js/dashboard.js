/* Bot terminal dashboard: polls api.mintoro.app every 5 s and animates what changed. */
(function () {
  'use strict';
  var M = window.Mintoro, h = M.h;
  var BOT = document.body.getAttribute('data-bot');
  var POLL_MS = 5000, LOG_SHOW = 8, WATCH_SHOW = 5;
  var DESC = {      // deliberately general: the strategy logic is not published
    'BOOK JUMP': 'Order-flow strategy (retired 23 Nov)',
    'BJ ABSORB': 'Order-flow strategy (retired 23 Nov)',
    'POC RETURN': 'Mean-reversion to key price levels',
    '1H RSI LONG': 'Momentum-exhaustion longs',
    '1H RSI SHORT': 'Momentum-exhaustion shorts',
    '2H RSI SHORT': 'Momentum-exhaustion shorts',
    '2H RSI LONG': 'Momentum-exhaustion longs',
    '1H BREAKOUT': 'Range breakouts, long side',
    '1H BREAKDOWN': 'Range breakdowns, short side'
  };
  var ICON = { 'POC RETURN': 'POC', '1H RSI LONG': 'RL', '1H RSI SHORT': 'RS', '2H RSI SHORT': '2S', '2H RSI LONG': '2L', '1H BREAKOUT': 'BO', '1H BREAKDOWN': 'BD' };
  var KIND = { ENTRY: 'ENTER', RSI1H_SIGNAL: 'SIGNAL', RSI1H_SKIP: 'SKIP', RSI1H_SCAN: 'SCAN', POC_ORDER: 'ORDER', POC_FILLED: 'FILL',
    POC_MISSED: 'MISS', POC_ORDER_CANCELLED: 'CANCEL', RSI1H_STOP_WIDENED: 'STOP', BREAKEVEN: 'BE', POC_BUILT: 'POC', STARTED: 'START' };

  function q(f) { return document.querySelector('[data-f="' + f + '"]'); }
  var cur = BOT === 'nse' ? 'INR' : 'USD';
  var state = { seen: {}, seenCount: 0, first: true, hot: 0, lastLine: null };
  var orb = null;

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
    if (!e) return 'Scanning for setups';
    if (e.kind === 'ENTRY') return 'Last entry: ' + M.shortSym(e.symbol) + ' · ' + evTime(e.time) + ' IST';
    return 'Last close: ' + M.shortSym(e.symbol) + ' ' + M.money(e.value, cur, { signed: true }) + ' · ' + evTime(e.time) + ' IST';
  }

  // ---------- strategies ----------
  function isRunning(b) { return !b.state || b.state === 'running'; }
  function isCurrent(b) { return isRunning(b) || !!b.open_position; }     // a paused book stays here until its trade closes
  function bookLine(b) {
    var p = b.open_position;
    if (b.state === 'paused') return p ? 'Paused · closing ' + M.shortSym(p.symbol) + ' ' + (p.side || '') : 'Paused · no new trades';
    if (p) return 'In trade: ' + M.shortSym(p.symbol) + ' ' + (p.side || '');
    var w = b.watch || [];
    if (!w.length) return 'Nothing armed · scanning';
    if (w[0].distance_pct !== undefined) return 'Next: ' + M.shortSym(w[0].symbol) + ' · ' + M.watchNote(w[0]).replace('POC ', '');
    if (w[0].detail !== undefined && w[0].rsi_2h === undefined) return 'Watching ' + b.watch_count + ' ranges';
    return 'Armed: ' + w.slice(0, 2).map(function (x) {
      var r = typeof x.rsi_1h === 'number' ? x.rsi_1h : x.rsi_2h;
      return M.shortSym(x.symbol) + ' ' + (typeof r === 'number' ? r.toFixed(1) : '');
    }).join(' · ');
  }
  var bookEls = {};
  function renderBooks(books) {
    var box = q('books'), keep = {};
    books.forEach(function (b) { keep[b.name] = 1; });
    Object.keys(bookEls).forEach(function (n) { if (!keep[n]) { bookEls[n].remove(); delete bookEls[n]; } });
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
      var live = !!b.open_position, paused = b.state === 'paused';
      el.classList.toggle('active', live);
      el.classList.toggle('paused', paused && !live);
      el.querySelector('.st').textContent = live ? 'In trade' : paused ? 'Paused' : (b.watch_count ? 'Armed' : 'Scanning');
      el.querySelector('.line').textContent = bookLine(b);
      var pnl = b.balance !== null && b.start_balance !== null ? b.balance - b.start_balance : null;
      el.querySelector('.bal').textContent = M.money(b.balance, cur, { compact: true }) + ' (' + M.money(pnl, cur, { signed: true, compact: true }) +
        ') · ' + b.trades + ' trades · ' + b.wins + 'W / ' + b.losses + 'L' + (paused ? '' : ' · watching ' + b.watch_count);
    });
  }

  // ---------- past strategies (paused / retired) ----------
  function lastTradeTime(b) {
    var eq = b.equity || [];
    return eq.length > 1 ? eq[eq.length - 1].time : null;
  }
  function renderPast(d) {
    var past = (d.books || []).filter(function (b) { return !isCurrent(b); });
    var sec = q('past');
    sec.hidden = !past.length;
    if (!past.length) return;
    var pt = d.past_totals || past.reduce(function (a, b) {
      a.balance += b.balance || 0; a.start_balance += b.start_balance || 0;
      a.trades += b.trades; a.wins += b.wins; a.losses += b.losses; return a;
    }, { balance: 0, start_balance: 0, trades: 0, wins: 0, losses: 0 });
    var pnl = pt.balance - pt.start_balance;
    var sum = q('pastsum');
    sum.textContent = '';
    sum.appendChild(h('span', { text: past.length + (past.length === 1 ? ' strategy · ' : ' strategies · ') + pt.trades + ' trades · ' +
      pt.wins + 'W / ' + pt.losses + 'L · P&L ' }));
    sum.appendChild(h('b', { class: pnl >= 0 ? 'accent' : 'red', text: M.money(pnl, cur, { signed: true }) }));
    var body = q('pastrows'), rows = [];
    past.forEach(function (b) {
      var p = b.balance !== null && b.start_balance !== null ? b.balance - b.start_balance : null;
      var wr = b.trades ? Math.round(b.wins / b.trades * 100) + '%' : '—';
      var last = lastTradeTime(b);
      var ran = (b.since ? M.dayMonth(b.since) : '—') + ' – ' + (last ? M.dayMonth(last) : b.trades ? '—' : 'no trades');
      rows.push(h('tr', null,
        h('th', { scope: 'row' }, h('span', { class: 'pn', text: b.name }), h('span', { class: 'pd', text: DESC[b.name] || '' })),
        h('td', { 'data-label': 'Status' }, h('span', { class: 'pill ' + (b.state || 'retired'), text: b.state === 'paused' ? 'Paused' : 'Retired' })),
        h('td', { class: 'num', 'data-label': 'Active', text: ran }),
        h('td', { class: 'num', 'data-label': 'Trades', text: String(b.trades) }),
        h('td', { class: 'num', 'data-label': 'Won / lost' }, h('span', { class: 'accent', text: String(b.wins) }), ' / ', h('span', { class: 'red', text: String(b.losses) })),
        h('td', { class: 'num', 'data-label': 'Win rate', text: wr }),
        h('td', { class: 'num ' + (p === null ? '' : p >= 0 ? 'accent' : 'red'), 'data-label': 'P&L', text: M.money(p, cur, { signed: true }) }),
        h('td', { class: 'num', 'data-label': 'Final balance', text: M.money(b.balance, cur) })));
    });
    var keys = rows.map(function (r) { return r.textContent; }).join('|');
    if (body.getAttribute('data-keys') !== keys) {
      body.textContent = '';
      body.setAttribute('data-keys', keys);
      rows.forEach(function (r) { body.appendChild(r); });
    }
  }

  // ---------- watch tiles ----------
  var PIPS = ['var(--warn)', 'var(--accent)', 'var(--blue)', 'var(--violet)', 'var(--red)'];
  function renderWatch(books) {
    q('watching').textContent = 'Watching ' + M.sumWatch(books);
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

  // ---------- scanning orb ----------
  function scanUniverse(books, events) {
    var scan = events.filter(function (e) { return e.kind === 'RSI1H_SCAN' && e.value; })[0];
    if (scan) return Math.round(scan.value);
    return books.reduce(function (m, b) { return Math.max(m, b.watch_count || 0); }, 0);
  }
  function renderOrb(d, books, events) {
    if (!orb) return;
    var botUp = d.status === 'active', marketOpen = BOT !== 'nse' || M.nseMarketOpen();
    var scanning = botUp && marketOpen;
    var syms = [], seen = {}, hot = [];
    function add(list, s) { s = M.shortSym(s || ''); if (s && !seen[list === hot ? 'h' + s : s]) { seen[list === hot ? 'h' + s : s] = 1; list.push(s); } }
    books.forEach(function (b) {
      (b.watch || []).forEach(function (w) { add(syms, w.symbol); });
      if (b.open_position) add(hot, b.open_position.symbol);
    });
    M.topWatch(books, WATCH_SHOW).forEach(function (t) { add(hot, t.w.symbol); });
    events.forEach(function (e) { add(syms, e.symbol); });
    orb.update({ running: scanning, symbols: syms, hot: hot });
    var n = scanUniverse(books, events);
    q('orbdot').className = 'dot' + (scanning ? '' : ' off');
    q('orbtext').textContent = scanning
      ? 'Scanning ' + (n ? n + ' instruments' : 'the market') + ' for opportunities'
      : !botUp ? 'Resting · bot ' + d.status
      : 'Resting · NSE market closed · opens 09:15 IST (Mon–Fri)';
  }

  // ---------- open trades ----------
  function renderTrades(books, events) {
    var open = books.filter(function (b) { return b.open_position; });
    var badge = q('openbadge');
    badge.textContent = open.length ? open.length + ' open' : 'Flat';
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
            h('dt', { text: 'Strategy' }), h('dd', { 'data-x': 'book' }),
            h('dt', { text: 'Entry' }), h('dd', { 'data-x': 'entry' }),
            h('dt', { text: 'Now' }), h('dd', { 'data-x': 'now' }),
            h('dt', { text: 'Stop' }), h('dd', { 'data-x': 'stop' }),
            h('dt', { text: 'Size' }), h('dd', { 'data-x': 'size' }))));
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
          h('div', { class: 'why', text: [e.book, e.kind === 'EXIT' ? e.reason : null].filter(Boolean).join(' · ') })));
      });
      Array.prototype.forEach.call(box.querySelectorAll('.new'), function (n) { setTimeout(function () { n.classList.remove('new'); }, 600); });
    }
    q('loglines').textContent = state.seenCount + ' lines';
    M.tick(q('lineno'), state.seenCount, function (v) { return 'line #' + Math.round(v); });
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
    q('since').textContent = since && since.time ? 'Since ' + M.dayMonth(since.time) : '';
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
    var all = d.books || [], events = d.events || [], t = d.totals;
    var books = all.filter(isCurrent);
    var running = d.status === 'active';
    var label = !running ? 'bot ' + d.status : BOT === 'nse' ? (M.nseMarketOpen() ? 'running · market open' : 'running · market closed') : 'running';
    runLine(running, label);
    q('chip').textContent = chip(events);
    M.tick(q('balance'), t.balance, function (v) { return M.money(v, cur, { compact: true }); });
    M.tick(q('trades'), t.trades, function (v) { return String(Math.round(v)); });
    M.tick(q('wins'), t.wins, function (v) { return String(Math.round(v)); });
    M.tick(q('losses'), t.losses, function (v) { return String(Math.round(v)); });
    var nRun = books.filter(isRunning).length;
    q('online').textContent = running ? nRun + ' running' : books.length + ' stopped';
    renderBooks(books);
    renderWatch(books.filter(isRunning));
    renderOrb(d, books.filter(isRunning), events);
    var skipped = events.filter(function (e) { return e.kind === 'SKIP' || e.kind === 'RSI1H_SKIP'; }).length;
    M.tick(q('skipped'), skipped, function (v) { return String(Math.round(v)); });
    var last = events.filter(function (e) { return e.kind === 'EXIT'; })[0];
    var lc = q('lastclose');
    lc.textContent = last ? M.money(last.value, cur, { signed: true }) : '—';
    lc.className = 'v ' + (last ? (last.value >= 0 ? 'accent' : 'red') : '');
    q('lastclosenote').textContent = last ? (last.reason ? last.reason + ' · ' : '') + M.shortSym(last.symbol) + ' · ' + (last.book || '') : 'No closed trade in the log';
    renderTrades(all, events);
    renderLog(events);
    renderEquity(d);
    renderPast(d);
    state.first = false;
  }
  function failed() {
    runLine(false, 'Reconnecting…');
    if (orb) orb.update({ running: false, symbols: [], hot: [] });
    q('orbdot').className = 'dot off';
    q('orbtext').textContent = 'Reconnecting…';
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.MintoroOrb && q('orb')) orb = window.MintoroOrb(q('orb'));
    M.poll(BOT, POLL_MS, render, failed);
    if (!M.reduced()) setInterval(cycleHot, 1500);
  });
})();
