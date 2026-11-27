/* Bot terminal dashboard: polls api.mintoro.app every 5 s and animates what changed. */
(function () {
  'use strict';
  var M = window.Mintoro, h = M.h;
  var BOT = document.body.getAttribute('data-bot');
  var POLL_MS = 5000;
  var DESC = {      // deliberately general: the strategy logic is not published
    'BOOK JUMP': 'Order-flow strategy (retired 23 Nov)',
    'BJ ABSORB': 'Order-flow strategy (retired 23 Nov)',
    'POC RETURN': 'Mean-reversion to key price levels (retired 26 Nov)',
    '1H RSI LONG (v1)': 'Momentum-exhaustion longs, first version (retired 27 Nov)',
    '1H RSI SHORT (v1)': 'Momentum-exhaustion shorts, first version (retired 27 Nov)',
    'EMA20 PULLBACK': 'Trend pullbacks, both sides (retired 27 Nov)',
    '1H RSI LONG': 'Momentum-exhaustion longs',
    '1H RSI SHORT': 'Momentum-exhaustion shorts',
    'EMA20 LONG': 'Trend pullbacks, long side',
    'EMA20 SHORT': 'Trend pullbacks, short side',
    '4H RETRACE LONG': 'Big-candle retracements, long side',
    '4H RETRACE SHORT': 'Big-candle retracements, short side',
    '2H RSI SHORT': 'Momentum-exhaustion shorts',
    '2H RSI LONG': 'Momentum-exhaustion longs',
    '1H BREAKOUT': 'Range breakouts, long side',
    '1H BREAKDOWN': 'Range breakdowns, short side'
  };
  var ICON = { 'EMA20 LONG': 'EL', 'EMA20 SHORT': 'ES', '4H RETRACE LONG': '4L', '4H RETRACE SHORT': '4S', 'POC RETURN': 'POC', '1H RSI LONG': 'RL', '1H RSI SHORT': 'RS', '2H RSI SHORT': '2S', '2H RSI LONG': '2L', '1H BREAKOUT': 'BO', '1H BREAKDOWN': 'BD' };
  var KIND = { ENTRY: 'ENTER', RSI1H_SIGNAL: 'SIGNAL', RSI1H_SKIP: 'SKIP', RSI1H_SCAN: 'SCAN', POC_ORDER: 'ORDER', POC_FILLED: 'FILL',
    POC_MISSED: 'MISS', POC_ORDER_CANCELLED: 'CANCEL', RSI1H_STOP_WIDENED: 'STOP', BREAKEVEN: 'BE', POC_BUILT: 'POC', STARTED: 'START' };

  // colour follows the book, never its position (six validated slots, site.css --c0..--c5)
  var COLOR = { '1H RSI LONG': 0, '1H RSI SHORT': 1, 'EMA20 LONG': 2, 'EMA20 SHORT': 3, '4H RETRACE LONG': 4, '4H RETRACE SHORT': 5 };
  function colorOf(name, i) { return COLOR[name] !== undefined ? COLOR[name] : i % 6; }
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
  function isCurrent(b) { return isRunning(b) || M.positions(b).length > 0; }   // a paused book stays here until its trades close
  function bookLine(b) {
    var ps = M.positions(b);
    if (b.state === 'paused') return ps.length ? 'Paused · closing ' + M.tradesLabel(ps) : 'Paused · no new trades';
    if (ps.length) return (ps.length > 1 ? 'In ' + ps.length + ' trades: ' : 'In trade: ') + M.tradesLabel(ps);
    var w = b.watch || [];
    if (!w.length) return 'Nothing armed · scanning';
    if (w[0].distance_pct !== undefined) return 'Next: ' + M.shortSym(w[0].symbol) + ' · ' + M.watchNote(w[0]).replace('POC ', '');
    if (w[0].detail !== undefined && w[0].rsi_2h === undefined) return 'Watching ' + b.watch_count + ' ranges';
    if (w[0].kind === 'pullback' || w[0].kind === 'retrace') return 'Armed: ' + w.slice(0, 3).map(function (x) { return M.shortSym(x.symbol) + ' ' + x.side; }).join(' · ');
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
            h('div', { class: 'who' }, h('div', { class: 'ic ic-' + colorOf(b.name, i), text: ICON[b.name] || b.name.slice(0, 2) }), h('div', { class: 'nm', text: b.name })),
            h('span', { class: 'st' })),
          h('p', { class: 'desc', text: DESC[b.name] || '' }),
          h('p', { class: 'line' }),
          h('p', { class: 'bal' }));
        bookEls[b.name] = el;
        box.appendChild(el);
      }
      var nOpen = M.positions(b).length, live = nOpen > 0, paused = b.state === 'paused';
      el.classList.toggle('active', live);
      el.classList.toggle('paused', paused && !live);
      el.querySelector('.st').textContent = live ? (nOpen > 1 ? nOpen + ' trades' : 'In trade') : paused ? 'Paused' : (b.watch_count ? 'Armed' : 'Scanning');
      el.querySelector('.line').textContent = bookLine(b);
      var pnl = b.balance !== null && b.start_balance !== null ? b.balance - b.start_balance : null;
      el.querySelector('.bal').textContent = M.money(b.balance, cur, { compact: true }) + ' (' + M.money(pnl, cur, { signed: true, compact: true }) +
        ') · ' + b.trades + ' trades · ' + b.wins + 'W / ' + b.losses + 'L' + (paused ? '' : ' · watching ' + b.watch_count);
    });
  }

  // ---------- balance by strategy ----------
  // The running strategies' balances add up to the headline balance; colours match the strategy icons.
  function splitBar(box, items, key, total) {
    var sig = items.map(function (it) { return it.b.name + ':' + (it.b[key] || 0).toFixed(2); }).join('|');
    if (box.getAttribute('data-keys') === sig) return;
    var fresh = box.getAttribute('data-keys') === null || box.children.length !== items.length;
    box.setAttribute('data-keys', sig);
    if (fresh) {
      box.textContent = '';
      items.forEach(function (it) { box.appendChild(h('span', { class: 'sw-' + it.c })); });
    }
    items.forEach(function (it, i) {
      var v = Math.max(0, it.b[key] || 0), pc = total ? v / total * 100 : 0, seg = box.children[i];
      seg.style.flexGrow = String(Math.max(pc, 0.5));
      seg.style.flexBasis = '0';
      seg.textContent = pc >= 9 ? Math.round(pc) + '%' : '';
      seg.title = it.b.name + ': ' + M.money(v, cur) + ' (' + pc.toFixed(1) + '%)';
    });
  }
  function renderSplit(d, current) {
    var sec = q('split');
    var items = current.map(function (b, i) { return { b: b, c: colorOf(b.name, i) }; }).filter(function (it) { return isRunning(it.b); });
    sec.hidden = items.length < 2;
    if (sec.hidden) return;
    var now = items.reduce(function (a, it) { return a + (it.b.balance || 0); }, 0);
    var start = items.reduce(function (a, it) { return a + (it.b.start_balance || 0); }, 0);
    q('splitsum').textContent = items.length + ' strategies · ' + M.money(now, cur, { compact: true }) + ' of ' + M.money(start, cur, { compact: true }) + ' start';
    splitBar(q('splitstart'), items, 'start_balance', start);
    splitBar(q('splitnow'), items, 'balance', now);
    var box = q('splitrows');
    var keys = items.map(function (it) { return it.b.name; }).join('|');
    if (box.getAttribute('data-keys') !== keys) {
      box.textContent = '';
      box.setAttribute('data-keys', keys);
      items.forEach(function (it) {
        var sw = h('i', { class: 'sw-' + it.c });
        box.appendChild(h('div', { class: 'split-card', 'data-k': it.b.name },
          h('div', { class: 'nm' }, sw, h('span', { text: it.b.name }), h('span', { class: 'tag', hidden: true })),
          h('div', { class: 'bal' }),
          h('div', { class: 'chg' }),
          h('p', { class: 'meta' })));
      });
    }
    items.forEach(function (it, i) {
      var b = it.b, el = box.children[i];
      var pnl = (b.balance || 0) - (b.start_balance || 0), pc = b.start_balance ? pnl / b.start_balance * 100 : 0;
      var share = now ? (b.balance || 0) / now * 100 : 0;
      var wr = b.trades ? Math.round(b.wins / b.trades * 100) + '% win rate' : 'no trades yet';
      M.tick(el.querySelector('.bal'), b.balance || 0, function (v) { return M.money(v, cur); });
      var chg = el.querySelector('.chg');
      chg.textContent = M.money(pnl, cur, { signed: true }) + ' (' + M.pct(pc, true) + ')';
      chg.className = 'chg ' + (pnl >= 0 ? 'accent' : 'red');
      var ps = M.positions(b), tag = el.querySelector('.tag');
      tag.hidden = !ps.length;
      if (ps.length) tag.textContent = ps.length > 1 ? ps.length + ' trades' : 'in trade';
      var priced = ps.filter(function (p) { return typeof p.unrealised_pnl === 'number'; });
      var upnl = priced.reduce(function (a, p) { return a + p.unrealised_pnl; }, 0);
      var open = ps.length && priced.length === ps.length
        ? ' · open trade' + (ps.length > 1 ? 's ' : ' ') + M.money(upnl, cur, { signed: true }) : '';
      el.querySelector('.meta').textContent = 'Started ' + M.money(b.start_balance, cur, { compact: true }) + ' · now ' + share.toFixed(1) +
        '% of balance\n' + b.trades + ' trades · ' + b.wins + 'W / ' + b.losses + 'L · ' + wr + open;
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
  // Every watched instrument gets its turn: the highlight walks across the tiles, then the next page comes in.
  var PIPS = ['var(--warn)', 'var(--accent)', 'var(--blue)', 'var(--violet)', 'var(--red)', 'var(--accent)'];
  var watchAll = [], watchPage = 0;
  function pageSize() {     // one full row of tiles on wide screens, 3 rows (6 tiles) on phones
    var cols = (getComputedStyle(q('watch')).gridTemplateColumns || '').split(' ').filter(Boolean).length || 2;
    return cols >= 4 ? cols : cols * 3;
  }
  function renderWatch(books) {
    watchAll = M.topWatch(books, 1000);
    var pages = Math.max(1, Math.ceil(watchAll.length / pageSize()));
    if (watchPage >= pages) watchPage = 0;
    drawWatch();
  }
  function drawWatch() {
    var ps = pageSize(), n = watchAll.length, from = Math.min(watchPage * ps, Math.max(0, n - 1)), top = watchAll.slice(from, from + ps);
    q('watching').textContent = 'Watching ' + n + (n > ps ? ' · ' + (from + 1) + '–' + (from + top.length) : '');
    var box = q('watch');
    var keys = top.map(function (t) { return t.w.symbol + t.w.side; }).join(',');
    if (box.getAttribute('data-keys') === keys) {
      top.forEach(function (t, i) { var c = box.children[i] && box.children[i].querySelector('.nt'); if (c) c.textContent = M.watchNote(t.w); });
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
      pip.style.background = PIPS[(from + i) % PIPS.length];
      box.appendChild(h('div', { class: 'watch' + (old[k] || state.first ? '' : ' new'), 'data-k': k, title: t.book },
        h('div', { class: 'row' }, h('span', { class: 'sym', text: M.shortSym(t.w.symbol) }), pip),
        h('div', { class: 'nt', text: M.watchNote(t.w) })));
    });
  }
  function cycleHot() {
    if (document.hidden) return;
    var tiles = q('watch').querySelectorAll('.watch');
    if (state.hot >= tiles.length) {                 // walked past the last tile: next page
      state.hot = 0;
      var pages = Math.ceil(watchAll.length / pageSize());
      if (pages > 1) { watchPage = (watchPage + 1) % pages; drawWatch(); tiles = q('watch').querySelectorAll('.watch'); }
    }
    tiles.forEach(function (t, i) { t.classList.toggle('hot', i === state.hot); });
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
    var sc = d.scan || {};
    var syms = [], seen = {}, hot = [], hseen = {};
    function add(s) { s = M.shortSym(s || ''); if (s && !seen[s]) { seen[s] = 1; syms.push(s); } }
    function addHot(s) { s = M.shortSym(s || ''); if (s && !hseen[s]) { hseen[s] = 1; hot.push(s); } }
    (sc.universe || []).forEach(add);
    books.forEach(function (b) {
      (b.watch || []).forEach(function (w) { add(w.symbol); addHot(w.symbol); });
      M.positions(b).forEach(function (p) { add(p.symbol); addHot(p.symbol); });
    });
    if (!(sc.universe || []).length) events.forEach(function (e) { add(e.symbol); });
    var n = sc.count || (sc.universe || []).length || scanUniverse(books, events);
    orb.update({ running: scanning, symbols: syms, hot: hot, count: n });
    q('orbdot').className = 'dot' + (scanning ? '' : ' off');
    q('orbtext').textContent = scanning
      ? 'Scanning ' + (n ? n + ' instruments' : 'the market') + ' for opportunities'
      : !botUp ? 'Resting · bot ' + d.status
      : 'Resting · NSE market closed · opens 09:15 IST (Mon–Fri)';
    var w = watchAll.length, sub = [];
    if (sc.last_full) sub.push((scanning ? 'Full scan hourly · last ' : 'Last full scan ') +
      (sc.last_full.slice(0, 10) === M.todayIST() ? '' : M.dayMonth(sc.last_full) + ' ') + M.hhmm(sc.last_full) + ' IST');
    if (scanning && w) sub.push(w + ' on watch');
    q('orbsub').textContent = sub.join(' · ');
  }

  // ---------- open trades ----------
  function renderTrades(books, events) {
    var open = [];                                   // every open trade: {b: book, p: position, k: key}
    books.forEach(function (b) {
      M.positions(b).forEach(function (p) { open.push({ b: b, p: p, k: b.name + '|' + p.symbol }); });
    });
    var badge = q('openbadge');
    badge.textContent = open.length ? open.length + ' open' : 'Flat';
    badge.classList.toggle('flat', !open.length);
    var box = q('trades-open');
    var keys = open.map(function (o) { return o.k; }).join(',');
    if (box.getAttribute('data-keys') !== keys) {
      box.textContent = '';
      box.setAttribute('data-keys', keys);
      if (!open.length) box.appendChild(h('p', { class: 'flat-msg', text: 'No open trade. The bot is flat and scanning.' }));
      open.forEach(function (o) {
        box.appendChild(h('div', { class: 'trade', 'data-key': o.k },
          h('div', { class: 'head' }, h('span', { class: 'sym' }), h('span', { class: 'side' }), h('span', { class: 'pnl' })),
          h('dl', null,
            h('dt', { text: 'Strategy' }), h('dd', { 'data-x': 'book' }),
            h('dt', { text: 'Entry' }), h('dd', { 'data-x': 'entry' }),
            h('dt', { text: 'Now' }), h('dd', { 'data-x': 'now' }),
            h('dt', { text: 'Stop' }), h('dd', { 'data-x': 'stop' }),
            h('dt', { text: 'Hard stop', 'data-x': 'hard-t' }), h('dd', { 'data-x': 'hard' }),
            h('dt', { text: 'Size' }), h('dd', { 'data-x': 'size' }),
            h('dt', { text: 'Liquidation', 'data-x': 'liq-t' }), h('dd', { 'data-x': 'liq' }),
            h('dt', { text: 'If stopped', 'data-x': 'loss-t' }), h('dd', { 'data-x': 'loss' })),
          h('p', { class: 'mg', title: 'Margin', 'data-x': 'margin' })));
      });
    }
    open.forEach(function (o) {
      var b = o.b, p = o.p, el = null;
      for (var i = 0; i < box.children.length; i++) {
        if (box.children[i].getAttribute('data-key') === o.k) { el = box.children[i]; break; }
      }
      if (!el) return;
      el.querySelector('.sym').textContent = M.shortSym(p.symbol);
      el.querySelector('.side').textContent = p.side || '';
      var pnlEl = el.querySelector('.pnl');
      if (p.unrealised_pnl === null || p.unrealised_pnl === undefined) {
        pnlEl.textContent = 'open';
        pnlEl.className = 'pnl muted';
      } else {
        var pc = p.mark_price && p.entry ? (p.side === 'long' ? p.mark_price / p.entry - 1 : 1 - p.mark_price / p.entry) * 100 : null;
        var pm = typeof p.pnl_pct_margin === 'number' ? p.pnl_pct_margin : null;   // crypto: return on the margin used
        M.tick(pnlEl, p.unrealised_pnl, function (v) {
          return M.money(v, cur, { signed: true }) + (pm !== null ? ' · ' + mpct(pm)
            : pc === null ? '' : ' · ' + M.pct(pc, true));
        });
        pnlEl.className = 'pnl ' + (p.unrealised_pnl >= 0 ? 'accent' : 'red');
      }
      el.querySelector('[data-x="book"]').textContent = b.name + ' · since ' + evTime(p.opened_at) + ' IST';
      el.querySelector('[data-x="entry"]').textContent = M.price(p.entry);
      el.querySelector('[data-x="now"]').textContent = p.mark_price === null || p.mark_price === undefined ? '— (waiting for the live price)'
        : M.price(p.mark_price) + (typeof p.price_move_pct === 'number' ? ' (price ' + M.pct(p.price_move_pct, true) + ')' : '');
      // stop: its price distance from the entry and, for crypto, what filling it means on the margin (fees incl.)
      var sp = p.entry && p.stop ? (Math.abs(p.stop / p.entry - 1) * 100).toFixed(2) + '%' : null;
      var sm = typeof p.stop_pct_margin === 'number' ? p.stop_pct_margin : null;
      // EMA20 PULLBACK: until breakeven the nearer stop is a 5m close beyond a level (close_stop); the hard stop then
      // gets its own row. The API's stop_price_pct / stop_pct_margin are for close_stop in that case.
      var cs = typeof p.close_stop === 'number';
      if (cs && typeof p.stop_price_pct === 'number') sp = p.stop_price_pct.toFixed(2) + '%';
      el.querySelector('[data-x="stop"]').textContent = (cs ? 'close ' + (p.side === 'long' ? 'below ' : 'above ') + M.price(p.close_stop)
        : M.price(p.stop)) + (sp === null ? '' : sm === null ? ' (' + sp + ')'
        : ' (price ' + sp + ' · ' + mpct(sm) + (sm > 0 ? ' locked' : '') + ')');
      el.querySelector('[data-x="hard-t"]').hidden = el.querySelector('[data-x="hard"]').hidden = !cs;
      el.querySelector('[data-x="hard"]').textContent = cs ? M.price(p.stop) +
        (p.entry ? ' (' + (Math.abs(p.stop / p.entry - 1) * 100).toFixed(2) + '%)' : '') : '';
      el.querySelector('[data-x="size"]').textContent = typeof p.qty === 'number'
        ? M.price(p.qty) + ' ' + M.shortSym(p.symbol) : M.price(p.size) + (BOT === 'nse' ? ' qty' : ' units');
      // liquidation price and the loss if the current stop fills (% of the strategy's balance); hidden when unknown
      var liq = typeof p.liq_price === 'number', loss = typeof p.loss_pct === 'number';
      el.querySelector('[data-x="liq-t"]').hidden = el.querySelector('[data-x="liq"]').hidden = !liq;
      el.querySelector('[data-x="liq"]').textContent = liq ? M.price(p.liq_price) +
        (p.entry ? ' (' + (Math.abs(p.liq_price / p.entry - 1) * 100).toFixed(2) + '%)' : '') : '';
      el.querySelector('[data-x="loss-t"]').hidden = el.querySelector('[data-x="loss"]').hidden = !loss;
      el.querySelector('[data-x="loss"]').textContent = !loss ? '' : p.loss_pct > 0
        ? '−' + p.loss_pct.toFixed(1) + '% of book' : '+' + (-p.loss_pct).toFixed(1) + '% of book locked in';
      var mg = el.querySelector('[data-x="margin"]');            // margin the position ties up, bottom right
      mg.hidden = typeof p.margin !== 'number';
      mg.textContent = typeof p.margin === 'number' ? M.money(p.margin, cur) : '';
      mg.setAttribute('aria-label', 'Margin ' + mg.textContent);
    });
  }

  // % of margin: whole numbers from 10% (+80%), one decimal below (−4.5%), true minus sign
  function mpct(v) {
    var a = Math.abs(v);
    return (v < 0 ? '−' : v > 0 ? '+' : '') + (a >= 10 ? a.toFixed(0) : a.toFixed(1)) + '%';
  }

  // ---------- log ----------
  // The API sends every line since the start of the newest line's day (at least 40). The box scrolls;
  // it sticks to the newest line unless the reader has scrolled up, then a button offers a jump back down.
  var logUnread = 0;
  function logAtBottom(box) { return box.scrollHeight - box.scrollTop - box.clientHeight < 24; }
  function logJump() {
    var btn = q('logjump');
    if (!btn) {
      btn = h('button', { type: 'button', class: 'log-jump', 'data-f': 'logjump', hidden: true });
      q('log').parentNode.insertBefore(btn, q('log').nextSibling);
      btn.addEventListener('click', function () { var box = q('log'); box.scrollTop = box.scrollHeight; });
      q('log').addEventListener('scroll', function () { if (logAtBottom(q('log'))) { logUnread = 0; btn.hidden = true; } }, { passive: true });
    }
    return btn;
  }
  function dayLabel(t) { return t.slice(0, 10) === M.todayIST() ? 'Today · ' + M.dayMonth(t) : M.dayMonth(t); }
  function renderLog(events) {
    var added = 0;
    events.forEach(function (e) {
      var k = evKey(e);
      if (!state.seen[k]) { state.seen[k] = state.first ? 1 : 2; state.seenCount++; if (!state.first) added++; }
    });
    var lines = events.slice().reverse(); // oldest first, newest at the bottom
    var box = q('log'), btn = logJump();
    var keys = lines.length + ':' + (lines.length ? evKey(lines[0]) + ',' + evKey(lines[lines.length - 1]) : '');
    if (box.getAttribute('data-keys') !== keys) {
      var stick = state.first || logAtBottom(box), top = box.scrollTop;
      var frag = document.createDocumentFragment(), day = null;
      lines.forEach(function (e) {
        var d = (e.time || '').slice(0, 10);
        if (d && d !== day) { day = d; frag.appendChild(h('div', { class: 'log-day', text: dayLabel(e.time) })); }
        var cls = kindClass(e), fresh = state.seen[evKey(e)] === 2;
        frag.appendChild(h('div', { class: 'log-line' + (fresh ? ' new' : '') },
          h('div', { class: 'meta' },
            h('span', { class: 'muted', text: e.time ? M.hhmm(e.time) : '--:--' }), ' ',
            h('span', { class: cls, text: KIND[e.kind] || e.kind }), ' ',
            h('span', { text: M.shortSym(e.symbol || '') }), ' ',
            h('span', { class: cls, text: evValue(e) })),
          h('div', { class: 'why', text: [e.book, e.kind === 'EXIT' ? e.reason : null].filter(Boolean).join(' · ') })));
        if (fresh) state.seen[evKey(e)] = 1;
      });
      box.textContent = '';
      box.appendChild(frag);
      box.setAttribute('data-keys', keys);
      if (stick) { box.scrollTop = box.scrollHeight; logUnread = 0; }
      else { box.scrollTop = top; logUnread += added; }
      Array.prototype.forEach.call(box.querySelectorAll('.new'), function (n) { setTimeout(function () { n.classList.remove('new'); }, 600); });
    }
    btn.hidden = !logUnread;
    btn.textContent = '↓ ' + logUnread + ' new line' + (logUnread === 1 ? '' : 's');
    var first = lines[0];
    var newest = lines[lines.length - 1];               // today's lines; before today's first line, the last session's
    q('loghead').textContent = !newest || !newest.time || newest.time.slice(0, 10) === M.todayIST() ? "Today's events" : 'Latest events · ' + M.dayMonth(newest.time);
    q('loglines').textContent = lines.length + ' lines' + (first && first.time ? ' · from ' + M.dayMonth(first.time) : '');
    M.tick(q('lineno'), state.seenCount, function (v) { return 'line #' + Math.round(v); });
  }

  // ---------- equity ----------
  // Points are spaced by trade (each closed trade moves the curve), so the date ticks mark where each day starts.
  var eq = { pts: [], c: null, i: -1, start: 0, hideT: 0, bound: false };
  function eqTime(t) { return t ? M.dayMonth(t) + ', ' + M.hhmm(t) + ' IST' : ''; }
  function eqShow(i) {
    var n = eq.pts.length;
    if (n < 2 || !eq.c) return;
    i = Math.max(0, Math.min(n - 1, i));
    eq.i = i;
    var p = eq.pts[i], x = i / (n - 1) * 100, y = eq.c.y(p.v) / 180 * 100;
    var pin = q('eqpin'), cross = q('eqcross'), tip = q('eqtip'), plot = q('eqplot');
    pin.style.left = x + '%'; pin.style.top = y + '%'; pin.className = 'eq-pin' + (p.v < eq.start ? ' down' : '');
    cross.style.left = x + '%';
    var chg = p.v - eq.start, pc = eq.start ? chg / eq.start * 100 : 0;
    tip.textContent = '';
    tip.appendChild(h('b', { text: M.money(p.v, cur) }));
    tip.appendChild(h('span', { class: 'chg ' + (chg >= 0 ? 'accent' : 'red'), text: M.money(chg, cur, { signed: true }) + ' (' + M.pct(pc, true) + ')' }));
    tip.appendChild(h('span', { class: 't', text: ' · ' + (p.now ? 'now' : 'trade ' + i) }));
    tip.appendChild(h('span', { class: 't blk', text: eqTime(p.t) }));
    pin.hidden = cross.hidden = tip.hidden = false;
    var W = plot.clientWidth, tw = tip.offsetWidth, px = x / 100 * W;
    var left = px + 14 + tw > W ? px - 14 - tw : px + 14;           // beside the pin, flipped near the right edge
    tip.style.left = Math.max(0, Math.min(W - tw, left)) + 'px';
    tip.style.top = (y / 100 * 180 > 90 ? 0 : 90) + 'px';
  }
  function eqHide() { eq.i = -1; q('eqpin').hidden = q('eqcross').hidden = q('eqtip').hidden = true; }
  function eqBind() {
    if (eq.bound) return;
    eq.bound = true;
    var plot = q('eqplot');
    function at(ev) {
      var r = plot.getBoundingClientRect();
      return Math.round(Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) * (eq.pts.length - 1));
    }
    plot.addEventListener('pointerdown', function (ev) { clearTimeout(eq.hideT); eqShow(at(ev)); });
    plot.addEventListener('pointermove', function (ev) {
      if (ev.pointerType === 'mouse' || ev.buttons || ev.pressure) { clearTimeout(eq.hideT); eqShow(at(ev)); }
    });
    plot.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') eqHide(); });
    ['pointerup', 'pointercancel'].forEach(function (k) {
      plot.addEventListener(k, function (ev) {
        if (ev.pointerType !== 'mouse') { clearTimeout(eq.hideT); eq.hideT = setTimeout(eqHide, 3000); }
      });
    });
    plot.addEventListener('keydown', function (ev) {
      var n = eq.pts.length, i = eq.i < 0 ? n - 1 : eq.i;
      if (ev.key === 'ArrowLeft') i--; else if (ev.key === 'ArrowRight') i++;
      else if (ev.key === 'Home') i = 0; else if (ev.key === 'End') i = n - 1;
      else if (ev.key === 'Escape') { eqHide(); return; } else return;
      ev.preventDefault(); eqShow(i);
    });
    plot.addEventListener('blur', eqHide);
    window.addEventListener('resize', function () { if (eq.i >= 0) eqShow(eq.i); });
  }
  function eqAxis() {
    var axis = q('eqaxis'), n = eq.pts.length;
    axis.textContent = '';
    if (n < 2) return;
    var gap = (axis.clientWidth || 600) < 520 ? 22 : 11;       // minimum spacing between ticks, % of width
    var marks = [], prev = null;
    eq.pts.forEach(function (p, i) {
      var d = (p.t || '').slice(0, 10);                        // the live 'now' point is not a trade day
      if (d && d !== prev && !p.now) { marks.push({ i: i, t: p.t }); prev = d; }
    });
    if (!marks.length) return;                                  // no trade day yet (e.g. no running strategy)
    var last = n - 1, kept = [];
    marks.forEach(function (m) {
      var x = m.i / last * 100;
      if (kept.length && x - kept[kept.length - 1].x < gap) return;
      kept.push({ x: x, t: m.t });
    });
    var newest = marks[marks.length - 1], nx = newest.i / last * 100;   // always show the latest day
    if (kept[kept.length - 1].t !== newest.t) {
      while (kept.length > 1 && nx - kept[kept.length - 1].x < gap) kept.pop();
      if (kept.length === 1 && nx - kept[0].x < gap) kept = [];
      kept.push({ x: nx, t: newest.t });
    }
    kept.forEach(function (k) {
      var s = h('span', { class: k.x < gap / 2 ? 'first' : k.x > 100 - gap / 2 ? 'last' : '', text: M.dayMonth(k.t) });
      s.style.left = k.x + '%';
      axis.appendChild(s);
    });
  }
  function renderEquity(d) {
    var t = d.totals, now = t.balance + (t.unrealised_pnl || 0);
    eq.pts = (d.equity_total || []).filter(function (p) { return typeof p.balance === 'number' && !isNaN(p.balance); })
      .map(function (p) { return { t: p.time, v: p.balance }; });
    eq.pts.push({ t: d.generated_at, v: now, now: true });
    eq.start = t.start_balance;
    var c = M.curve(eq.pts.map(function (p) { return p.v; }), 1000, 180, 10);
    eq.c = c;
    q('start').textContent = M.money(t.start_balance, cur, { compact: true });
    var nowEl = q('now');
    M.tick(nowEl, now, function (v) { return M.money(v, cur, { compact: true }); });
    nowEl.className = now >= t.start_balance ? 'accent' : 'red';
    var since = (d.equity_total || [])[0];
    q('since').textContent = since && since.time ? 'Since ' + M.dayMonth(since.time) : '';
    eqBind();
    eqAxis();
    if (!c) { eqHide(); return; }
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
    if (eq.i >= 0) eqShow(Math.min(eq.i, eq.pts.length - 1));
  }

  // ---------- daily P&L bars (26 Nov 2026) ----------
  // One bar per day (crypto: midnight to midnight New York time, EST/EDT handled by the API; NSE: one trading
  // session, IST), realised P&L of the running
  // strategies by trade close time, stacked by session: US market hours (NYSE regular hours) vs other hours.
  // Gains stack up from the zero line, losses down; the day's net sits above each bar.
  var dl = { days: [], key: '', i: -1, bound: false, scrolled: false };
  var WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function dlShort(v) {                                          // compact signed label that fits a narrow bar
    var a = Math.abs(v), s = v > 0 ? '+' : v < 0 ? '−' : '', t;
    if (cur === 'INR') t = a >= 1e5 ? (a / 1e5).toFixed(a >= 1e6 ? 0 : 1) + 'L' : a >= 1e4 ? Math.round(a / 1e3) + 'k'
      : a >= 1e3 ? (a / 1e3).toFixed(1) + 'k' : String(Math.round(a));
    else t = a >= 1e3 ? (a / 1e3).toFixed(1) + 'k' : a >= 10 ? String(Math.round(a)) : a.toFixed(1);
    return s + t;
  }
  function dlName(iso) {
    var dt = new Date(iso + 'T12:00:00Z');
    return WEEKDAY[dt.getUTCDay()] + ' ' + M.dayMonth(iso);
  }
  function dlBuild(days) {
    var box = q('daily');
    box.textContent = '';
    box.appendChild(h('div', { class: 'dl-zero' }));
    var prevMon = '';
    days.forEach(function (d, i) {
      var mon = M.dayMonth(d.date).split(' ')[1];
      var col = h('div', { class: 'dl-col' + (i === days.length - 1 ? ' today' : ''), 'data-i': String(i) },
        h('span', { class: 'dl-val' }),
        h('div', { class: 'dl-plot' },
          h('i', { class: 'dl-seg ot pos' }), h('i', { class: 'dl-seg us pos' }),
          h('i', { class: 'dl-seg ot neg' }), h('i', { class: 'dl-seg us neg' })),
        h('span', { class: 'dl-day' }, String(parseInt(d.date.slice(8, 10), 10)),
          h('span', { class: 'm', text: mon !== prevMon ? mon : '' })));
      prevMon = mon;
      box.appendChild(col);
    });
  }
  function dlShow(i) {
    var days = dl.days, box = q('daily'), tip = q('dailytip');
    if (i < 0 || i >= days.length) return;
    dl.i = i;
    var cols = box.querySelectorAll('.dl-col');
    cols.forEach(function (c, k) { c.classList.toggle('on', k === i); });
    var d = days[i];
    tip.textContent = '';
    tip.appendChild(h('span', { class: 't', text: dlName(d.date) + (BOT === 'nse' ? ' · session' : ' · New York day') }));
    tip.appendChild(h('b', { class: d.net > 0 ? 'accent' : d.net < 0 ? 'red' : '',
      text: d.trades ? M.money(d.net, cur, { signed: true }) : 'No closed trades' }));
    if (d.trades && BOT !== 'nse') {                             // NSE: one series, no US-session split
      [['us', 'US market hours', d.us], ['ot', 'Other hours', d.other]].forEach(function (r) {
        tip.appendChild(h('div', { class: 'row' }, h('span', null, h('i', { class: 'sw ' + r[0] }), r[1]),
          h('span', { text: M.money(r[2], cur, { signed: true }) })));
      });
    }
    if (d.trades) tip.appendChild(h('div', { class: 'row t' }, h('span', { text: 'Trades closed' }), h('span', { text: String(d.trades) })));
    tip.hidden = false;
    var panel = tip.parentNode, pr = panel.getBoundingClientRect(), cr = cols[i].getBoundingClientRect();
    var tw = tip.offsetWidth, left = cr.right - pr.left + 6;
    if (left + tw > pr.width - 8) left = cr.left - pr.left - tw - 6;            // flip near the right edge
    tip.style.left = Math.max(8, left) + 'px';
    tip.style.top = (cr.top - pr.top + 18) + 'px';
  }
  function dlHide() {
    dl.i = -1;
    q('dailytip').hidden = true;
    q('daily').querySelectorAll('.dl-col.on').forEach(function (c) { c.classList.remove('on'); });
  }
  function dlBind() {
    if (dl.bound) return;
    dl.bound = true;
    var box = q('daily');
    function idx(ev) {
      var c = ev.target.closest && ev.target.closest('.dl-col');
      return c ? parseInt(c.getAttribute('data-i'), 10) : -1;
    }
    box.addEventListener('pointermove', function (ev) {
      if (ev.pointerType === 'mouse') { var i = idx(ev); if (i >= 0 && i !== dl.i) dlShow(i); }
    });
    box.addEventListener('pointerdown', function (ev) {
      var i = idx(ev);
      clearTimeout(dl.hideT);
      if (i >= 0) dlShow(i);
    });
    box.addEventListener('pointerup', function (ev) {
      if (ev.pointerType !== 'mouse') { clearTimeout(dl.hideT); dl.hideT = setTimeout(dlHide, 3000); }
    });
    box.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') dlHide(); });
    box.addEventListener('keydown', function (ev) {
      var n = dl.days.length, i = dl.i < 0 ? n - 1 : dl.i;
      if (ev.key === 'ArrowLeft') i--; else if (ev.key === 'ArrowRight') i++;
      else if (ev.key === 'Home') i = 0; else if (ev.key === 'End') i = n - 1;
      else if (ev.key === 'Escape') { dlHide(); return; } else return;
      ev.preventDefault();
      dlShow(Math.max(0, Math.min(n - 1, i)));
    });
    box.addEventListener('blur', dlHide);
    window.addEventListener('resize', function () { if (dl.i >= 0) dlShow(dl.i); });
  }
  function renderDaily(d) {
    var box = q('daily');
    if (!box) return;
    var days = (d.daily && d.daily.days) || [];
    dl.days = days;
    var key = days.map(function (x) { return x.date; }).join(',');
    if (key !== dl.key) { dl.key = key; dlBuild(days); if (dl.i >= days.length) dlHide(); }
    dlBind();
    var pos = days.map(function (x) { return Math.max(x.us, 0) + Math.max(x.other, 0); });
    var neg = days.map(function (x) { return -(Math.min(x.us, 0) + Math.min(x.other, 0)); });
    var maxP = Math.max.apply(null, [0].concat(pos)), maxN = Math.max.apply(null, [0].concat(neg));
    if (!maxP && !maxN) maxP = maxN = 1;
    var H = 150, GAP = 2, unit = (H - 4) / (maxP + maxN), zero = 2 + maxP * unit;   // px from the top of the plot
    box.querySelector('.dl-zero').style.top = (18 + zero) + 'px';
    var cols = box.querySelectorAll('.dl-col');
    days.forEach(function (x, i) {
      var col = cols[i];
      if (!col) return;
      var segs = col.querySelectorAll('.dl-seg');                // ot pos, us pos, ot neg, us neg
      function place(el, v, from, up) {                           // returns where the next segment starts
        var hgt = Math.abs(v) * unit;
        el.hidden = !v;
        if (!v) return from;
        hgt = Math.max(2, hgt);
        el.style.height = hgt + 'px';
        el.style.top = (up ? from - hgt : from) + 'px';
        return up ? from - hgt - GAP : from + hgt + GAP;
      }
      var top = place(segs[0], Math.max(x.other, 0), zero, true);
      place(segs[1], Math.max(x.us, 0), x.other > 0 ? top : zero, true);
      var bot = place(segs[2], Math.min(x.other, 0), zero, false);
      place(segs[3], Math.min(x.us, 0), x.other < 0 ? bot : zero, false);
      segs[0].classList.toggle('end', !(x.us > 0)); segs[1].classList.add('end');
      segs[2].classList.toggle('end', !(x.us < 0)); segs[3].classList.add('end');
      var val = col.querySelector('.dl-val');
      val.textContent = x.trades ? dlShort(x.net) : '';
      val.className = 'dl-val' + (x.net > 0 ? ' up' : x.net < 0 ? ' down' : '');
      col.setAttribute('aria-label', dlName(x.date) + ': ' + (x.trades ? M.money(x.net, cur, { signed: true }) : 'no closed trades'));
    });
    var total = days.reduce(function (a, x) { return a + x.net; }, 0);
    var sum = q('dailysum');
    sum.textContent = days.length ? M.money(total, cur, { signed: true }) + ' in ' + days.length + ' ' + (BOT === 'nse' ? 'sessions' : 'days') : '—';
    sum.className = total > 0 ? 'accent' : total < 0 ? 'red' : '';
    q('dailyunit').textContent = BOT === 'nse' ? 'sessions' : 'days';
    q('dailynote').textContent = BOT === 'nse'
      ? 'One bar per trading session (the bot squares off by 15:15 IST). Realised P&L of the running strategies by close time.'
      : 'One bar per day, midnight to midnight New York time (10:30 IST in winter, 09:30 IST in summer), so each US session sits in a single bar. Realised P&L of the running strategies by close time; US market hours = NYSE 9:30–16:00 New York (20:00–02:30 IST in winter, 19:00–01:30 in summer), holidays excluded. The last bar is still running.';
    box.closest('.daily').classList.toggle('single', BOT === 'nse');
    var tb = q('dailytable').querySelector('tbody');
    tb.textContent = '';
    days.forEach(function (x) {
      tb.appendChild(h('tr', null, h('th', { scope: 'row', text: dlName(x.date) }),
        h('td', { text: M.money(x.us, cur, { signed: true }) }), h('td', { text: M.money(x.other, cur, { signed: true }) }),
        h('td', { text: M.money(x.net, cur, { signed: true }) }), h('td', { text: String(x.trades) })));
    });
    if (!dl.scrolled) {                                          // phones: start at the latest day
      var sc = q('dailyscroll');
      sc.scrollLeft = sc.scrollWidth;
      dl.scrolled = true;
    }
    if (dl.i >= 0) dlShow(dl.i);
  }

  // ---------- main ----------
  function render(d) {
    var all = d.books || [], events = d.events || [], t = d.totals;
    var books = all.filter(isCurrent);
    var running = d.status === 'active';
    var label = !running ? 'bot ' + d.status : BOT === 'nse' ? (M.nseMarketOpen() ? 'running · market open' : 'running · market closed') : 'running';
    runLine(running, label);
    var nRunAll = all.filter(isRunning).length;
    q('chip').textContent = nRunAll ? chip(events) : 'No strategy running';
    M.tick(q('balance'), t.balance, function (v) { return M.money(v, cur, { compact: true }); });
    M.tick(q('trades'), t.trades, function (v) { return String(Math.round(v)); });
    M.tick(q('wins'), t.wins, function (v) { return String(Math.round(v)); });
    M.tick(q('losses'), t.losses, function (v) { return String(Math.round(v)); });
    var nRun = books.filter(isRunning).length;
    q('online').textContent = running ? nRun + ' running' : books.length + ' stopped';
    renderBooks(books);
    renderSplit(d, books);
    renderWatch(books.filter(isRunning));
    renderOrb(d, books.filter(isRunning), events);
    if (!nRunAll) q('orbtext').textContent = 'No strategy running · all strategies retired';
    var skipped = events.slice(0, 40).filter(function (e) { return e.kind === 'SKIP' || e.kind === 'RSI1H_SKIP'; }).length;
    M.tick(q('skipped'), skipped, function (v) { return String(Math.round(v)); });
    var last = events.filter(function (e) { return e.kind === 'EXIT'; })[0];
    var lc = q('lastclose');
    lc.textContent = last ? M.money(last.value, cur, { signed: true }) : '—';
    lc.className = 'v ' + (last ? (last.value >= 0 ? 'accent' : 'red') : '');
    q('lastclosenote').textContent = last ? (last.reason ? last.reason + ' · ' : '') + M.shortSym(last.symbol) + ' · ' + (last.book || '') : 'No closed trade in the log';
    renderTrades(all, events);
    renderLog(events);
    renderEquity(d);
    renderDaily(d);
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
    setInterval(cycleHot, 1500);
  });
})();
