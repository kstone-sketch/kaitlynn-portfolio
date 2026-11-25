(function () {
  // sticky header border
  const head = document.querySelector('.site-head');
  const onScroll = () => head && head.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // mobile menu
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open'); btn.setAttribute('aria-expanded', false);
    }));
  }

  // studio tiles
  const data = window.STUDIO || [];
  const byId = Object.fromEntries(data.map(d => [d.id, d]));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tile = d => `
    <button class="ctile rv" type="button" data-id="${d.id}" data-cat="${d.cat}" aria-label="${esc(d.title)}: see details">
      <div class="shot"${d.bg ? ` style="background:${d.bg}"` : ''}><img src="${d.img}" alt="" loading="lazy"${d.fit ? ` style="object-fit:${d.fit};object-position:center"` : ''}></div>
      <div class="meta"><span class="kind">${esc(d.kind)}</span><h3>${esc(d.title)}</h3><p>${esc(d.blurb)}</p></div>
    </button>`;
  document.querySelectorAll('[data-studio]').forEach(el => {
    const skip = (el.dataset.exclude || '').split(',');
    const ids = (el.dataset.studio === 'all' ? data.map(d => d.id) : el.dataset.studio.split(',')).filter(id => !skip.includes(id));
    el.innerHTML = ids.map(id => byId[id]).filter(Boolean).map(tile).join('');
  });

  // filters
  const filters = document.querySelector('.filters');
  if (filters) {
    filters.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      filters.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      const g = document.querySelector('[data-studio="all"]'); if (g) g.classList.remove('collapsed');
      const sa = document.querySelector('.show-all'); if (sa) sa.remove();
      const cat = b.dataset.cat;
      document.querySelectorAll('[data-studio="all"] .ctile').forEach(t => {
        t.hidden = !(cat === 'all' || t.dataset.cat === cat);
      });
    });
  }

  // lightbox
  const lb = document.getElementById('lb');
  if (lb) {
    const card = lb.querySelector('.lb-card');
    let last = null;
    const open = d => {
      last = document.activeElement;
      const extra = (d.more || []).map(src => `<img src="${src}" alt="" loading="lazy" style="margin-top:10px">`).join('');
      card.innerHTML = `
        <div class="lb-img"><div><img src="${d.img}" alt="${esc(d.title)} screenshot">${extra}</div></div>
        <div class="lb-txt">
          <span class="hand" style="font-size:20px">${esc(d.kind)}</span>
          <h3 id="lb-title">${esc(d.title)}</h3>
          <p>${esc(d.body)}</p>
          <ul class="tags">${d.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
          <p style="font-size:14.5px;border-top:1px solid #e6e4e2;padding-top:14px;margin:0">${esc(d.built || 'Strategy, copy, design and build by me, in-house at The Treetop ABA. Coded with Claude Code.')}</p>
        </div>`;
      lb.classList.add('open'); document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus({ preventScroll: true });
    };
    const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; last && last.focus({ preventScroll: true }); };
    document.addEventListener('click', e => {
      const t = e.target.closest('.ctile'); if (t && byId[t.dataset.id]) open(byId[t.dataset.id]);
    });
    lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.lb-close')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }


  // gallery lightbox: [data-gal="id"] opens <script id="gal-id"> JSON {title, items:[{src,cap,thumb}]}
  const gal = document.getElementById('gal');
  if (gal) {
    let items = [], idx = 0, last = null;
    const img = gal.querySelector('.gal-stage img'), cap = gal.querySelector('.gal-stage figcaption');
    const cnt = gal.querySelector('.count'), ttl = gal.querySelector('.gal-top h3 span'), th = gal.querySelector('.gal-thumbs');
    const show = i => {
      idx = (i + items.length) % items.length;
      img.src = items[idx].src; img.alt = items[idx].cap || ''; cap.textContent = items[idx].cap || '';
      cnt.textContent = (idx + 1) + ' / ' + items.length;
      [...th.children].forEach((b, k) => b.setAttribute('aria-current', k === idx));
      const c = th.children[idx]; if (c) th.scrollTo({ left: th.scrollLeft + c.getBoundingClientRect().left - th.getBoundingClientRect().left - (th.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
    };
    const open = (id, i) => {
      const d = JSON.parse(document.getElementById('gal-' + id).textContent);
      items = d.items; ttl.textContent = d.title;
      th.innerHTML = items.map((it, k) => `<button type="button" aria-label="Image ${k + 1}"><img src="${it.thumb || it.src}" alt="" loading="lazy"></button>`).join('');
      last = document.activeElement; gal.classList.add('open'); document.body.style.overflow = 'hidden';
      show(i || 0); gal.querySelector('.gal-x').focus({ preventScroll: true });
    };
    const close = () => { gal.classList.remove('open'); document.body.style.overflow = ''; img.removeAttribute('src'); if (last) last.focus({ preventScroll: true }); };
    document.addEventListener('click', e => { const t = e.target.closest('[data-gal]'); if (t) { e.preventDefault(); open(t.dataset.gal, +(t.dataset.i || 0)); } });
    gal.querySelector('.gal-x').addEventListener('click', close);
    gal.querySelector('.prev').addEventListener('click', () => show(idx - 1));
    gal.querySelector('.next').addEventListener('click', () => show(idx + 1));
    th.addEventListener('click', e => { const b = e.target.closest('button'); if (b) show([...th.children].indexOf(b)); });
    document.addEventListener('keydown', e => {
      if (!gal.classList.contains('open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1);
    });
  }

  // play / watch modal: [data-play="id"] clones <template id="tpl-id">; iframes load from data-src on open
  const play = document.getElementById('play');
  if (play) {
    const body = play.querySelector('.play-body'); let last = null;
    const load = root => root.querySelectorAll('[data-src]').forEach(f => { if (!f.getAttribute('src')) f.setAttribute('src', f.dataset.src); });
    const open = id => {
      body.innerHTML = ''; body.appendChild(document.getElementById('tpl-' + id).content.cloneNode(true));
      body.querySelectorAll('.tabpane:not([hidden])').forEach(load);
      if (!body.querySelector('.tabpane')) load(body);
      last = document.activeElement; play.classList.add('open'); document.body.style.overflow = 'hidden';
      play.querySelector('.play-x').focus({ preventScroll: true });
    };
    const close = () => { play.classList.remove('open'); body.innerHTML = ''; document.body.style.overflow = ''; if (last) last.focus({ preventScroll: true }); };
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-play]'); if (t) { e.preventDefault(); open(t.dataset.play); return; }
      const tab = e.target.closest('.tabs button');
      if (tab && play.contains(tab)) {
        const tabs = [...tab.parentNode.children], panes = body.querySelectorAll('.tabpane');
        tabs.forEach((b, k) => { const on = b === tab; b.setAttribute('aria-selected', on); panes[k].hidden = !on; if (on) load(panes[k]); });
      }
    });
    play.querySelector('.play-x').addEventListener('click', close);
    play.addEventListener('click', e => { if (e.target === play) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && play.classList.contains('open')) close(); });
  }

  // progressive "show all"
  document.querySelectorAll('[data-showall]').forEach(b => b.addEventListener('click', () => {
    const g = document.getElementById(b.dataset.showall); if (g) g.classList.remove('collapsed'); b.parentNode.remove();
  }));


  // interactive studio-of-one walkthrough
  document.querySelectorAll('[data-studio-flow]').forEach(root => {
    const tabs = [...root.querySelectorAll('[role="tab"]')], panels = [...root.querySelectorAll('.st-panel')];
    const figs = [...root.querySelectorAll('.st-visual figure')], fill = root.querySelector('.st-line i');
    const count = root.querySelector('.st-count'), btn = root.querySelector('.st-play');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches, DUR = 5500;
    let i = 0, timer = null, playing = !reduce, inView = false, hover = false;
    const pad = n => String(n).padStart(2, '0');
    const set = (n, focus) => {
      i = (n + tabs.length) % tabs.length;
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; t.classList.toggle('done', k < i); });
      panels.forEach((p, k) => p.classList.toggle('is-on', k === i));
      figs.forEach((f, k) => f.classList.toggle('is-on', k === i));
      fill.style.width = (i / (tabs.length - 1) * 100) + '%';
      count.textContent = pad(i + 1) + ' / ' + pad(tabs.length);
      root.classList.remove('ticking'); void root.offsetWidth;
      if (playing && inView && !hover) root.classList.add('ticking');
      if (focus) tabs[i].focus();
    };
    const run = () => { clearTimeout(timer); if (playing && inView && !hover) timer = setTimeout(() => { set(i + 1); run(); }, DUR); };
    const stop = () => { playing = false; clearTimeout(timer); root.classList.remove('ticking'); btn.dataset.state = 'paused'; btn.setAttribute('aria-label', 'Play the walkthrough'); };
    const start = () => { playing = true; btn.dataset.state = 'playing'; btn.setAttribute('aria-label', 'Pause the walkthrough'); set(i); run(); };
    tabs.forEach((t, k) => t.addEventListener('click', () => { stop(); set(k); }));
    root.querySelector('[role="tablist"]').addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); stop(); set(i + (e.key === 'ArrowRight' ? 1 : -1), true); }
    });
    btn.addEventListener('click', () => (playing ? stop() : start()));
    root.addEventListener('mouseenter', () => { hover = true; root.classList.add('hold'); clearTimeout(timer); });
    root.addEventListener('mouseleave', () => { hover = false; root.classList.remove('hold'); if (playing) { set(i); run(); } });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(en => {
        inView = en.isIntersecting;
        if (inView && playing) { set(i); run(); } else { clearTimeout(timer); root.classList.remove('ticking'); }
      }), { threshold: 0.35 }).observe(root);
    }
    if (reduce) stop();
    set(0);
  });


  // interactive tool kit
  document.querySelectorAll('[data-kit]').forEach(kit => {
    const btns = [...kit.querySelectorAll('.kit-cats button')], chips = [...kit.querySelectorAll('.kit-tools li')];
    const blurbs = [...kit.querySelectorAll('.kit-blurb')];
    const show = cat => {
      btns.forEach(b => b.setAttribute('aria-selected', b.dataset.cat === cat));
      blurbs.forEach(p => { p.hidden = p.dataset.cat !== cat; });
      let o = 0;
      chips.forEach(c => {
        const match = cat === 'all' || c.dataset.cat === cat;
        c.classList.toggle('on', match && cat !== 'all');
        c.classList.toggle('dim', !match);
        c.style.setProperty('--o', match ? o++ : 0);
      });
    };
    btns.forEach(b => b.addEventListener('click', () => { kit.classList.add('settled'); show(b.dataset.cat); }));
    kit.querySelector('.kit-cats').addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const i = btns.findIndex(b => b.getAttribute('aria-selected') === 'true');
      const n = btns[(i + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length];
      n.focus(); n.click();
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(en => {
        if (en.isIntersecting) { kit.classList.add('go'); setTimeout(() => kit.classList.add('settled'), 1800); io.disconnect(); }
      }), { threshold: 0.25 });
      io.observe(kit);
    } else kit.classList.add('go', 'settled');
  });

  // reveal on scroll
  const els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  } else els.forEach(el => el.classList.add('in'));
})();

/* Treetop short-form videos: the browser's own <video> player keeps sound and picture in sync
   (TikTok's embedded player sends the sound through Web Audio, which lags behind the picture). */
(function () {
  document.querySelectorAll('.tt').forEach(function (g) {
    var track = g.querySelector('.tt-track');
    var cards = [].slice.call(g.querySelectorAll('.tt-card'));
    function pauseOthers(v) {
      document.querySelectorAll('.tt-card video').forEach(function (o) { if (o !== v && !o.paused) o.pause(); });
    }
    cards.forEach(function (card) {
      var v = card.querySelector('video'), btn = card.querySelector('.tt-play');
      function start() {
        pauseOthers(v);
        card.classList.add('on');
        v.controls = true;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      }
      btn.addEventListener('click', function () { start(); v.focus({ preventScroll: true }); });
      v.addEventListener('play', function () { pauseOthers(v); card.classList.add('on'); v.controls = true; });
      v.addEventListener('ended', function () { card.classList.remove('on'); v.controls = false; v.load(); });
    });
    // pause a video once it scrolls out of the carousel
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (!e.isIntersecting) { var v = e.target.querySelector('video'); if (!v.paused) v.pause(); } });
      }, { root: track, threshold: 0.15 });
      cards.forEach(function (c) { io.observe(c); });
    }
    // arrows page through by the number of whole cards on screen
    var prev = g.querySelector('.tt-prev'), next = g.querySelector('.tt-next');
    function step() {
      var c = cards[0]; if (!c) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 16, w = c.getBoundingClientRect().width + gap;
      return w * Math.max(1, Math.floor((track.clientWidth + gap) / w));
    }
    function ends() {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', ends, { passive: true });
    window.addEventListener('resize', ends);
    ends();
  });
})();
