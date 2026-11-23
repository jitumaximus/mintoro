/* Home: live crypto terminal card + small live stats on both bot cards. */
(function () {
  'use strict';
  var M = window.Mintoro;
  function q(scope, f) { return scope.querySelector('[data-f="' + f + '"]'); }

  function setStatus(scope, ok, text) {
    var dot = q(scope, 'dot'), st = q(scope, 'status');
    if (dot) dot.className = 'dot' + (ok ? '' : ' off');
    if (st) { st.textContent = text; st.classList.toggle('reconnect', !ok); }
  }
  function pill(ok) {
    var dot = document.querySelector('[data-live-dot]'), txt = document.querySelector('[data-live-text]');
    if (dot) dot.className = 'dot' + (ok ? '' : ' off');
    if (txt) txt.textContent = ok ? 'bots live' : 'reconnecting…';
  }

  function cardStat(bot, d) {
    var card = document.querySelector('[data-bot-card="' + bot + '"]');
    if (!card) return;
    var running = d.status === 'active';
    var label = !running ? d.status : bot === 'nse' ? (M.nseMarketOpen() ? 'market open' : 'market closed') : 'live';
    setStatus(card, running, label);
    var t = d.totals;
    q(card, 'stat').textContent = 'balance ' + M.money(t.balance, d.currency, { compact: true }) + ' · ' +
      t.trades + ' trades · ' + t.open_positions + ' open';
  }

  var hero = document.querySelector('.hero-term');
  function heroCrypto(d) {
    var t = d.totals, books = d.books || [];
    setStatus(hero, d.status === 'active', d.status === 'active' ? 'crypto bot · running' : 'crypto bot · ' + d.status);
    var eq = t.balance + (t.unrealised_pnl || 0);
    M.tick(q(hero, 'equity'), eq, function (v) { return M.money(v, 'USD'); });
    var ch = t.start_balance ? (eq / t.start_balance - 1) * 100 : null;
    var chEl = q(hero, 'change');
    chEl.textContent = M.pct(ch, true) + ' since ' + M.dayMonth((books[0] || {}).since);
    chEl.className = 'chg ' + (ch >= 0 ? 'accent' : 'red');
    var c = M.curve((d.equity_total || []).map(function (p) { return p.balance; }).concat([eq]), 400, 120, 8);
    if (c) {
      var line = q(hero, 'line'), area = q(hero, 'area'), dot = q(hero, 'last');
      var down = c.end < c.first;
      if (line.getAttribute('points') !== c.line) {
        line.setAttribute('points', c.line);
        area.setAttribute('points', '0,120 ' + c.line + ' 400,120');
        line.classList.remove('draw'); void line.getBBox(); if (!M.reduced()) line.classList.add('draw');
      }
      line.classList.toggle('down', down); area.classList.toggle('down', down); dot.classList.toggle('down', down);
      dot.setAttribute('cx', c.last[0].toFixed(1)); dot.setAttribute('cy', c.last[1].toFixed(1));
    }
    var byName = {};
    books.forEach(function (b) { byName[b.name] = b; });
    var poc = byName['POC RETURN'], lo = byName['1H RSI LONG'], sh = byName['1H RSI SHORT'];
    q(hero, 'poc').textContent = poc ? (poc.open_position ? 'in trade' : 'watching ' + poc.watch_count) : '—';
    q(hero, 'long').textContent = lo ? (lo.open_position ? 'in trade' : lo.watch_count + ' armed') : '—';
    q(hero, 'short').textContent = sh ? (sh.open_position ? 'in trade' : sh.watch_count + ' armed') : '—';
  }

  var okC = null, okN = null;
  function failed(bot) {
    if (bot === 'crypto') { okC = false; if (hero) setStatus(hero, false, 'crypto bot · reconnecting…'); }
    else okN = false;
    var card = document.querySelector('[data-bot-card="' + bot + '"]');
    if (card) setStatus(card, false, 'reconnecting…');
    pill(okC !== false && okN !== false);
  }
  document.addEventListener('DOMContentLoaded', function () {
    M.poll('crypto', 5000, function (d) { okC = true; heroCrypto(d); cardStat('crypto', d); pill(okN !== false); }, function () { failed('crypto'); });
    M.poll('nse', 10000, function (d) { okN = true; cardStat('nse', d); pill(okC !== false); }, function () { failed('nse'); });
  });
})();
