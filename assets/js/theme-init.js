/* Runs in <head> before paint: apply a remembered theme choice (system setting otherwise). */
(function () {
  try {
    var t = localStorage.getItem('mintoro-theme');
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
  } catch (e) { /* storage blocked: follow the system setting */ }
})();
