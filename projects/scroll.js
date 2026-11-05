/* ==========================================================================
   Section scroll for the project pages: one screen per section.
   - A scroll moves one section, gliding there with a slow start and a soft landing.
   - A light touch of the wheel or trackpad does nothing; the gesture has to commit.
   - A very hard scroll (fast wheel spin, strong flick or swipe) glides to the top / bottom.
   Works for mouse wheels, trackpads, touch, the keyboard and in-page "#section" links.
   ========================================================================== */

(() => {
  const SCROLL = {
    duration: 1050,       // ms for a one-section move
    jumpDuration: 1500,   // ms for a glide to the top / bottom
    commit: 40,           // px of wheel / trackpad input before a move starts ("weight")
    idleMs: 220,          // quiet time that ends a wheel gesture (trackpad inertia included)
    // Hard scroll → top / bottom:
    mouseNotches: 6,      // mouse: this many wheel notches…
    mouseWindowMs: 380,   // …within this window
    padFactor: 2.2,       // trackpad: input totalling this many screen heights…
    padWindowMs: 500,     // …within this window
    swipeMin: 0.35,       // touch: swipe over this share of the screen…
    swipeVelocity: 1.6,   // …faster than this (px per ms)
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;
  let stops = [];
  let index = 0;
  let anim = null; // { from, to, start, dur }

  /* ---------- stops: the top of every section, then the very bottom (footer) ---------- */

  function measure() {
    const max = root.scrollHeight - window.innerHeight;
    const tops = [...document.querySelectorAll(".hero, .split")].map((s) => Math.min(s.offsetTop, max));
    if (max - tops[tops.length - 1] > 1) tops.push(max); // footer below the last section
    stops = tops;
  }

  function nearest() {
    const y = window.scrollY;
    return stops.reduce((best, s, i) => (Math.abs(s - y) < Math.abs(stops[best] - y) ? i : best), 0);
  }

  /* ---------- the glide ---------- */

  // Slow start, long soft landing: feels weighty rather than snappy.
  const ease = (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

  function goTo(i, dur = SCROLL.duration) {
    i = Math.max(0, Math.min(stops.length - 1, i));
    index = i;
    const to = stops[i];
    const from = window.scrollY;
    if (Math.abs(to - from) < 1) { anim = null; return; }
    if (reduceMotion.matches) { window.scrollTo({ top: to, behavior: "instant" }); anim = null; return; }
    anim = { from, to, start: performance.now(), dur };
    requestAnimationFrame(step);
  }

  function step(now) {
    if (!anim) return;
    const t = Math.min(1, (now - anim.start) / anim.dur);
    window.scrollTo({ top: anim.from + (anim.to - anim.from) * ease(t), behavior: "instant" });
    if (t < 1) requestAnimationFrame(step);
    else anim = null;
  }

  const move = (dir) => goTo(index + dir);
  const jump = (dir) => goTo(dir > 0 ? stops.length - 1 : 0, SCROLL.jumpDuration);

  /* ---------- wheel + trackpad ---------- */

  // One gesture = a run of wheel events with no gap longer than idleMs. Each gesture moves at
  // most one section, unless it turns out to be a hard scroll, which retargets to the end.
  let g = null; // { dir, total, start, last, moved, jumped, notches }

  function normalize(e) {
    if (e.deltaMode === 1) return e.deltaY * 16;
    if (e.deltaMode === 2) return e.deltaY * window.innerHeight;
    return e.deltaY;
  }

  window.addEventListener("wheel", (e) => {
    if (e.ctrlKey) return; // pinch-zoom on trackpads
    e.preventDefault();
    const d = normalize(e);
    if (!d) return;
    const now = performance.now();
    const dir = Math.sign(d);

    if (!g || now - g.last > SCROLL.idleMs || dir !== g.dir) {
      g = { dir, total: 0, start: now, last: now, moved: false, jumped: false, notches: 0 };
    }
    g.last = now;
    g.total += Math.abs(d);
    // Mouse wheels send whole notches (about 100 px each); trackpads send many small deltas.
    if (Math.abs(d) >= 50 && Number.isInteger(d)) g.notches++;

    const age = now - g.start;
    const hard = g.notches
      ? g.notches >= SCROLL.mouseNotches && age <= SCROLL.mouseWindowMs
      : g.total >= window.innerHeight * SCROLL.padFactor && age <= SCROLL.padWindowMs;

    if (hard && !g.jumped) {
      g.jumped = g.moved = true;
      jump(dir);
    } else if (!g.moved && g.total >= SCROLL.commit) {
      g.moved = true;
      if (!anim) index = nearest();
      move(dir);
    }
  }, { passive: false });

  /* ---------- touch ---------- */

  let touch = null;
  window.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) { touch = null; return; }
    touch = { y: e.touches[0].clientY, t: performance.now() };
  }, { passive: true });

  window.addEventListener("touchmove", (e) => { if (touch) e.preventDefault(); }, { passive: false });

  window.addEventListener("touchend", (e) => {
    if (!touch) return;
    const dy = touch.y - e.changedTouches[0].clientY; // > 0: finger moved up = go down
    const dt = Math.max(1, performance.now() - touch.t);
    touch = null;
    if (Math.abs(dy) < 50) return; // a tap or a nudge
    const dir = Math.sign(dy);
    if (Math.abs(dy) > window.innerHeight * SCROLL.swipeMin && Math.abs(dy) / dt > SCROLL.swipeVelocity) jump(dir);
    else { if (!anim) index = nearest(); move(dir); }
  });

  /* ---------- keyboard + in-page links ---------- */

  window.addEventListener("keydown", (e) => {
    if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    const k = e.key;
    let handled = true;
    if (k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey)) move(1);
    else if (k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey)) move(-1);
    else if (k === "Home") jump(-1);
    else if (k === "End") jump(1);
    else handled = false;
    if (handled) { e.preventDefault(); if (!anim) index = nearest(); }
  });

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    const target = a && a.getAttribute("href").length > 1 && document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const i = stops.findIndex((s) => Math.abs(s - Math.min(target.offsetTop, stops[stops.length - 1])) < 2);
    if (i >= 0) goTo(i);
  });

  /* ---------- keep lined up ---------- */

  window.addEventListener("resize", () => {
    measure();
    anim = null;
    window.scrollTo({ top: stops[index] ?? 0, behavior: "instant" });
  });

  measure();
  index = nearest();
  window.scrollTo({ top: stops[index], behavior: "instant" });
})();
