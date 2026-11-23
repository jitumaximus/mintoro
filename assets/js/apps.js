/* Apps list: live balance / today / open and a state line per book. */
(function () {
  'use strict';
  var M = window.Mintoro;
  function q(scope, f) { return scope.querySelector('[data-f="' + f + '"]'); }

  function bookState(b) {
    if (b.open_position) return 'in trade · ' + M.shortSym(b.open_position.symbol) + ' ' + (b.open_position.side || '');
    if (b.name === 'POC RETURN' || b.name.indexOf('BREAK') !== -1) return b.watch_count ? 'watching ' + b.watch_count : 'scanning';
    return b.watch_count ? b.watch_count + ' armed' : 'scanning';
  }

  function render(bot, d) {
    var card = document.querySelector('[data-app="' + bot + '"]');
    if (!card) return;
    var running = d.status === 'active';
    q(card, 'dot').className = 'dot' + (running ? '' : ' off');
    var st = q(card, 'status');
    st.classList.remove('reconnect');
    st.textContent = !running ? d.status : bot === 'nse' ? (M.nseMarketOpen() ? 'market open' : 'market closed') : 'running';
    var cur = d.currency;
    M.tick(q(card, 'balance'), d.totals.balance, function (v) { return M.money(v, cur, { compact: true }); });
    var today = M.todayPnl(d), tEl = q(card, 'today');
    M.tick(tEl, today, function (v) { return M.money(v, cur, { signed: true }); });
    tEl.classList.toggle('accent', today > 0);
    tEl.classList.toggle('red', today < 0);
    q(card, 'open').textContent = String(d.totals.open_positions);
    (d.books || []).forEach(function (b) {
      var row = card.querySelector('[data-book="' + b.name + '"] [data-f="state"]');
      if (row) row.textContent = bookState(b);
    });
  }
  function failed(bot) {
    var card = document.querySelector('[data-app="' + bot + '"]');
    if (!card) return;
    q(card, 'dot').className = 'dot off';
    var st = q(card, 'status');
    st.textContent = 'reconnecting…';
    st.classList.add('reconnect');
  }
  document.addEventListener('DOMContentLoaded', function () {
    ['crypto', 'nse'].forEach(function (bot) {
      M.poll(bot, 5000, function (d) { render(bot, d); }, function () { failed(bot); });
    });
  });
})();
