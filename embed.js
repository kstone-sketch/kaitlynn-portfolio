/* Wix embed mode. The frame can't read the Wix page's scroll position, so pop-ups are
   placed inside the part of the frame the visitor can actually see. Invisible 1px markers
   every STEP px report (via IntersectionObserver, which measures against the real screen)
   which stretch of the frame is on screen right now. */
(function () {
  var MAX = 780, MIN = 420, STEP = 40;
  var vis = {}, marks = [];
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { var y = +e.target.dataset.y; if (e.isIntersecting) vis[y] = 1; else delete vis[y]; });
  }, { threshold: 0 }) : null;

  function build() {
    if (!io) return;
    marks.forEach(function (m) { io.unobserve(m); m.remove(); });
    marks = []; vis = {};
    var dh = document.documentElement.scrollHeight;
    for (var y = 0; y < dh; y += STEP) {
      var m = document.createElement('i');
      m.setAttribute('aria-hidden', 'true');
      m.style.cssText = 'position:absolute;left:0;top:' + y + 'px;width:1px;height:1px;pointer-events:none;visibility:hidden';
      m.dataset.y = y;
      document.body.appendChild(m); io.observe(m); marks.push(m);
    }
  }
  var lastH = 0, t = 0;
  function rebuild() {
    clearTimeout(t);
    t = setTimeout(function () { var h = document.documentElement.scrollHeight; if (h !== lastH) { lastH = h; build(); } }, 150);
  }
  window.addEventListener('load', rebuild);
  window.addEventListener('resize', rebuild);
  if (document.readyState !== 'loading') rebuild(); else document.addEventListener('DOMContentLoaded', rebuild);

  function visibleRange() {
    var ys = Object.keys(vis).map(Number);
    if (!ys.length) return null;
    return [Math.min.apply(null, ys), Math.max.apply(null, ys)];
  }

  function place(y) {
    var dh = document.documentElement.scrollHeight, top, h;
    var r = visibleRange();
    if (r && y >= r[0] - STEP && y <= r[1] + STEP) {
      // fit inside what's on screen, centred on the click
      h = Math.min(MAX, Math.max(Math.min(MIN, dh), r[1] - r[0]));
      top = Math.min(Math.max(r[0], y - h / 2), r[1] - h);
      top = Math.max(0, Math.min(top, dh - h));
    } else {
      h = Math.min(MAX, dh);
      top = Math.max(0, Math.min(y - h / 2, dh - h));
    }
    document.documentElement.style.setProperty('--mtop', Math.round(top) + 'px');
    document.documentElement.style.setProperty('--mh', Math.round(h) + 'px');
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-gal],[data-play],.ctile');
    if (!el) return;
    var y = e.pageY || (el.getBoundingClientRect().top + window.scrollY + 20);
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
