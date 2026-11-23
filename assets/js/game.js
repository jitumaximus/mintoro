/* Nova's Star Dash page: screenshot picker and star twinkle offsets. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.sky circle.st').forEach(function (c) {
      c.style.animationDelay = (parseFloat(c.getAttribute('data-d')) || 0) + 's';
    });
    var main = document.querySelector('[data-f="main"]');
    var btns = document.querySelectorAll('[data-shot]');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        main.src = b.getAttribute('data-shot');
        main.alt = b.getAttribute('data-alt');
        main.classList.remove('fade'); void main.offsetWidth; main.classList.add('fade');
      });
    });
  });
})();
