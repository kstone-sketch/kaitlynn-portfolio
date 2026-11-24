/* Wix embed mode: position pop-ups where the visitor clicked (the frame can't see the page's scroll). */
(function () {
  var MAX = 780;
  function place(y) {
    var dh = document.documentElement.scrollHeight, h = Math.min(MAX, dh);
    var top = Math.max(0, Math.min(y - h / 2, dh - h));
    document.documentElement.style.setProperty('--mtop', top + 'px');
    document.documentElement.style.setProperty('--mh', h + 'px');
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-gal],[data-play],.ctile');
    if (!t) return;
    var y = e.pageY || (t.getBoundingClientRect().top + window.scrollY + 20);
    place(y);
  }, true);
})();
/* paint the frame with the section's own color so any extra height blends in */
(function () {
  var first = document.querySelector('main > *');
  if (!first) return;
  var bg = getComputedStyle(first).backgroundColor;
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') { document.documentElement.style.background = bg; document.body.style.background = bg; }
})();
