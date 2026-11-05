/* ==========================================================================
   Hero — "signal and noise"
   Vanilla JS, no dependencies. Edit the CONFIG block below.
   ========================================================================== */

/* ---------- CONFIG ---------- */

// startPosition: where each window begins drifting, as percentages of the hero image area
// (left/top of the window's top-left corner). Overlapping starts are nudged apart before the first frame.
const PROJECTS = [
  {
    id: "project-01",
    filename: "project_beoopsie.net",
    title: "beoopsie",
    description: "Marketing Creative at beoopsie, a handmade 3D press-on nail label. I create the social media content, handle the product photography, write the newsletters and develop and manage the Shopify website.",
    image: "assets/projects/beoopsie-thumb.webp", // 640px: plenty for the small window, ~48 KB
    imageLarge: "assets/projects/beoopsie-hands-hq.webp",
    icon: "assets/icons/beoopsie.png",
    imageLargePosition: "50% 30%", // same window size as the others; keeps the top thumbnail whole
    // Headline bottom-right + crown logo top-right, set over the expanded image.
    overlay: {
      title: "One label\ncovered end to end",
      subtitle: "content, visuals and a storefront built around limited drops",
      logo: "assets/icons/beoopsie-crown-slim.svg",
      bottomRight: true,
    },
    dates: "01/2025 – Current",
    // "View project →" opens this page full screen, above the taskbar.
    page: "projects/beoopsie.html",
    url: "#",
    startPosition: { left: 4, top: 6 },
  },
  {
    id: "project-02",
    filename: "project_njoy.net",
    title: "nJoy",
    description: "B2B Marketing Specialist at nJoy, a UPS, solar energy and IT&C brand. I run LinkedIn ABM campaigns, create materials for business partners, adapt content for social media and coordinate visuals for campaigns and trade fairs.",
    image: "assets/projects/njoy.webp",
    imageLarge: "assets/projects/njoy-large.webp",
    imageLargePosition: "50% 100%", // keep the products whole; only empty sky is cropped
    // Headline + logo set over the expanded image (the image itself has no text).
    overlay: {
      title: "Partner communications\nand LinkedIn ABM in the\nelectro-backup sector.",
      logo: "assets/icons/njoy-logo.webp",
    },
    icon: "assets/icons/njoy.png",
    dates: "11/2025 – Current",
    // "View project →" opens this page full screen, above the taskbar.
    page: "projects/njoy.html",
    url: "#",
    startPosition: { left: 12, top: 48 },
  },
  {
    id: "project-03",
    filename: "project_university.net",
    title: "UVT FEAA",
    description: "Bachelor’s degree in Marketing (2022–2025), now a Master’s student in Digital and Strategic Marketing at the Faculty of Economics and Business Administration, West University of Timișoara.",
    image: "assets/projects/university.webp",
    icon: "assets/icons/university.png",
    dates: "2022 – Current", // Bachelor's in Marketing (2022–2025), Master's ongoing, FEAA
    imageLarge: "assets/projects/university-large.webp",
    // UVT FEAA logo, top-left over a soft dark fade so it reads on the pale building.
    overlay: {
      logo: "assets/icons/feaa-logo.png",
      logoLeft: true,
    },
    // "View project →" opens this page full screen, above the taskbar.
    page: "projects/university.html",
    url: "#",
    startPosition: { left: 72, top: 12 },
  },
];

// Side projects: listed in the "side projects" desktop folder; each opens its page full screen.
// image: thumbnail shown in the folder (leave "" for a placeholder until it's added).
const SIDE_PROJECTS = [
  {
    id: "work-and-travel-2024",
    filename: "side_work_and_travel_2024.net",
    title: "Work and Travel 2024",
    meta: "2024",
    image: "assets/projects/work-and-travel-thumb.webp",
    page: "projects/work-and-travel-2024.html",
  },
  {
    id: "bavi-feeling",
    filename: "side_bavi_feeling.net",
    title: "Bavi Feeling",
    meta: "",
    image: "assets/projects/bavi-feeling-thumb.webp",
    page: "projects/bavi-feeling.html",
  },
  {
    id: "erasmus-malta",
    filename: "side_erasmus_malta.net",
    title: "Erasmus+ Malta",
    meta: "",
    image: "assets/projects/erasmus-malta-thumb.webp",
    page: "projects/erasmus-malta.html",
  },
];

const CONFIG = {
  motionFps: 30,        // physics steps per second (fixed timestep, same speed on 60 Hz and 120 Hz)
  speed: 0.06,          // drift speed of HERO windows, as a fraction of the hero width per second
  // Rectangles windows bounce off, as percentages of the background art (they follow it when
  // short screens crop its top).
  obstacles: [
  ],
  showObstacles: false, // true: outline the obstacles with a dashed white line, for tuning
  cursorClearing: true, // true: grain is ~40% weaker within ~120 px of the cursor.
  transitionMs: 350,    // FLIP duration for expand / restore / minimize (0 under reduced motion).
  closeMs: 200,         // fade + scale-down when a window is closed.
};

// Grain, mirroring the Photoshop "Add Noise" layer.
// Defaults were measured from the reference render (field ≈ #a9a9a9, grain σ ≈ 6–8 levels).
const GRAIN = {
  background: "#a9a9a9", // flat field under the grain; keep in sync with --gray in css/style.css
  amount: 3,             // Add Noise amount, % (σ for gaussian / half-range for uniform, as % of 255)
  distribution: "gaussian", // "gaussian" | "uniform"
  blendMode: "overlay",  // layer blend: "overlay" keeps the background video visible through the grain ("normal" is an opaque gray field)
  opacity: 100,          // layer opacity, %
  fps: 14,
  frames: 8,
  tile: 256,             // px per pre-generated frame; tiled with random offsets
};

/* ---------- Setup ---------- */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileQuery = window.matchMedia("(max-width: 767.98px)");
// Keep in sync with the phone section of css/xp.css.
const phoneLayout = window.matchMedia("(max-width: 767.98px), (max-height: 500px), (orientation: portrait) and (max-width: 1100px)");
const DPR = Math.min(window.devicePixelRatio || 1, 2);

const hero = document.querySelector(".hero");
const media = document.querySelector(".hero-media");
const grainCanvas = document.querySelector(".grain");
const grainCtx = grainCanvas.getContext("2d");
const bgVideo = document.querySelector(".bg-video");

function hexToGray(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return Math.round(((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114);
}

function gaussian() {
  // Box–Muller
  let u = 0;
  while (u === 0) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

/** Pre-render monochrome noise tiles once. */
function makeNoiseTiles(count, size, center, sigma, distribution) {
  const tiles = [];
  for (let f = 0; f < count; f++) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(size, size);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = distribution === "uniform" ? (Math.random() * 2 - 1) * sigma : gaussian() * sigma;
      const v = Math.max(0, Math.min(255, center + n));
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    tiles.push(c);
  }
  return tiles;
}

/* ---------- Grain layer ---------- */

const grain = (() => {
  const bgGray = hexToGray(GRAIN.background);
  // Normal blend: noise centred on the field gray. Other modes: centred on neutral 50% gray.
  const center = GRAIN.blendMode === "normal" ? bgGray : 128;
  const sigma = (GRAIN.amount / 100) * 255;
  const tiles = makeNoiseTiles(GRAIN.frames, GRAIN.tile, center, sigma, GRAIN.distribution);
  const patterns = tiles.map((t) => grainCtx.createPattern(t, "repeat"));

  grainCanvas.style.mixBlendMode = GRAIN.blendMode;
  grainCanvas.style.opacity = GRAIN.opacity / 100;

  let frame = 0;
  let w = 0;
  let h = 0;
  const cursor = { x: 0, y: 0, inside: false };

  function resize() {
    const r = grainCanvas.getBoundingClientRect(); // the full background frame, which may extend above the crop
    w = Math.max(1, Math.round(r.width * DPR));
    h = Math.max(1, Math.round(r.height * DPR));
    if (grainCanvas.width !== w || grainCanvas.height !== h) {
      grainCanvas.width = w;
      grainCanvas.height = h;
    }
    draw();
  }

  function draw() {
    const ox = Math.floor(Math.random() * GRAIN.tile);
    const oy = Math.floor(Math.random() * GRAIN.tile);
    grainCtx.save();
    grainCtx.translate(-ox, -oy);
    grainCtx.fillStyle = patterns[frame];
    grainCtx.fillRect(ox, oy, w, h);
    grainCtx.restore();
    if (CONFIG.cursorClearing && cursor.inside && !reduceMotion.matches) clearAroundCursor();
  }

  // "Clear signal": a flat wash at 40% cuts grain contrast by ~40% near the cursor.
  function clearAroundCursor() {
    const r = 120 * DPR;
    const x = cursor.x * DPR;
    const y = cursor.y * DPR;
    const g = grainCtx.createRadialGradient(x, y, 0, x, y, r);
    const c = `${center}, ${center}, ${center}`;
    g.addColorStop(0, `rgba(${c}, 0.4)`);
    g.addColorStop(0.6, `rgba(${c}, 0.3)`);
    g.addColorStop(1, `rgba(${c}, 0)`);
    grainCtx.fillStyle = g;
    grainCtx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function step() {
    frame = (frame + 1) % patterns.length;
    draw();
  }

  return { resize, draw, step, cursor, bgGray, center, sigma };
})();

/* ---------- Animation loop (paused when hidden / off-screen) ---------- */

const loop = (() => {
  let raf = 0;
  let last = 0;
  let heroVisible = true;
  const interval = 1000 / GRAIN.fps;

  function tick(t) {
    raf = requestAnimationFrame(tick);
    if (t - last < interval) return;
    last = t;
    grain.step();
  }

  function shouldRun() {
    return heroVisible && !document.hidden && !reduceMotion.matches;
  }

  function update() {
    if (shouldRun() && !raf) {
      raf = requestAnimationFrame(tick);
    } else if (!shouldRun() && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    // The background video follows the grain: paused when hidden, off-screen or under reduced motion.
    if (shouldRun()) bgVideo.play().catch(() => {});
    else bgVideo.pause();
  }

  return {
    update,
    setHeroVisible(v) { heroVisible = v; update(); },
  };
})();

/* ---------- Project windows ---------- */

const windowsEl = document.getElementById("windows");
const dockEl = document.getElementById("dock");
const taskbarEl = document.querySelector(".taskbar");
const overlayEl = document.getElementById("win-overlay");

// Thin caption-button glyphs (10×10, 1px strokes), Windows style.
const ICONS = {
  minimize: '<path d="M0 5.5h10"/>',
  maximize: '<rect x=".5" y=".5" width="9" height="9"/>',
  restore: '<path d="M2.5 2.5V.5h7v7h-2"/><rect x=".5" y="2.5" width="7" height="7"/>',
  close: '<path d="M.5.5l9 9M9.5.5l-9 9"/>',
};
const icon = (name) => `<svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
const duration = (ms) => (reduceMotion.matches ? 0 : ms);

let zTop = PROJECTS.length;
let expanded = null; // the one EXPANDED window, if any
let opener = null;   // element focused before the dialog opened

const wins = PROJECTS.map((p, i) => {
  const slot = document.createElement("div");
  slot.className = "win-slot";
  slot.style.zIndex = i + 1;

  const titleId = `win-title-${p.id}`;
  slot.innerHTML = `
    <article class="win" data-state="hero" tabindex="-1">
      <div class="win-bar">
        <img class="win-ico" alt="">
        <span class="win-name"></span>
        <span class="win-ctrls">
          <button type="button" class="win-btn" data-action="minimize" aria-label="Minimize">${icon("minimize")}</button>
          <button type="button" class="win-btn win-max" data-action="maximize" aria-label="Maximize">${icon("maximize")}</button>
          <button type="button" class="win-btn win-restore" data-action="restore" aria-label="Restore" hidden>${icon("restore")}</button>
          <button type="button" class="win-btn win-close" data-action="close" aria-label="Close">${icon("close")}</button>
        </span>
      </div>
      <button type="button" class="win-body" data-action="maximize"><img class="win-img" alt=""><span class="win-art" aria-hidden="true"><span class="win-art-title"></span><span class="win-art-sub"></span><img class="win-art-logo" alt=""></span></button>
      <div class="win-details">
        <h2 class="win-title" id="${titleId}"></h2>
        <p class="win-desc"></p>
        <div class="win-foot">
          <a class="win-link">View project →</a>
          <span class="win-dates"></span>
        </div>
      </div>
    </article>`;

  const win = slot.querySelector(".win");
  const img = slot.querySelector(".win-img");
  win.setAttribute("aria-label", `Project window: ${p.filename}`);
  // "project_" is wrapped so narrow phones can hide it and show the part that differs.
  slot.querySelector(".win-name").innerHTML = p.filename.replace(/^project_/, '<span class="win-prefix">project_</span>');
  slot.querySelector(".win-ico").src = p.icon;
  slot.querySelector(".win-body").setAttribute("aria-label", `Open ${p.title}`);
  img.src = p.image;
  img.alt = `Preview image for ${p.title}`;
  slot.querySelector(".win-title").textContent = p.title;
  slot.querySelector(".win-desc").textContent = p.description;
  slot.querySelector(".win-dates").textContent = p.dates || "";
  const art = slot.querySelector(".win-art");
  if (p.overlay) {
    if (p.overlay.title) art.querySelector(".win-art-title").textContent = p.overlay.title;
    else art.querySelector(".win-art-title").remove();
    if (p.overlay.subtitle) art.querySelector(".win-art-sub").textContent = p.overlay.subtitle;
    else art.querySelector(".win-art-sub").remove();
    if (p.overlay.logo) art.querySelector(".win-art-logo").src = p.overlay.logo;
    else art.querySelector(".win-art-logo").remove();
    if (p.overlay.logoLeft) art.classList.add("win-art--logo-left");
    if (p.overlay.bottomRight) art.classList.add("win-art--bottom-right");
  } else {
    art.remove();
  }
  const link = slot.querySelector(".win-link");
  link.href = p.page || p.url;
  if (p.page) link.dataset.action = "view";
  windowsEl.appendChild(slot);

  if (p.imageLarge) new Image().src = p.imageLarge; // warm the cache so expanding doesn't flash

  const w = {
    p,
    index: i,
    titleId,
    slot,
    win,
    img,
    maxBtn: slot.querySelector(".win-max"),
    restoreBtn: slot.querySelector(".win-restore"),
    state: "hero",
    prev: "hero", // where a displaced EXPANDED window goes back to
    frame: null,
    busy: false,
  };
  slot.addEventListener("pointerdown", () => bringToFront(w));
  slot.addEventListener("focusin", () => bringToFront(w));
  return w;
});
wins.forEach(addFrame);

/* --- helpers --- */

function bringToFront(w) {
  if (w.state !== "expanded") w.slot.style.zIndex = ++zTop;
}

const isShown = (el) => el && el.isConnected && el.getClientRects().length > 0;

/** FLIP: element is already in its final layout; animate it in from `first`. */
function flipFrom(el, first, ms = CONFIG.transitionMs) {
  const d = duration(ms);
  const last = el.getBoundingClientRect();
  if (!d || !first || !last.width || !last.height) return Promise.resolve();
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const sx = first.width / last.width;
  const sy = first.height / last.height;
  return el
    .animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transform: "none" }],
      { duration: d, easing: EASE }
    )
    .finished.catch(() => {});
}

/** Animate an element from where it is now onto `target`; the caller hides it afterwards. */
function flyTo(el, target, keyframeExtras = {}) {
  const d = duration(CONFIG.transitionMs);
  const r = el.getBoundingClientRect();
  if (!d || !r.width || !r.height) return Promise.resolve(null);
  const dx = target.left - r.left;
  const dy = target.top - r.top;
  const anim = el.animate(
    [
      { transform: "none", opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(${target.width / r.width}, ${target.height / r.height})`, opacity: keyframeExtras.opacity ?? 0.6 },
    ],
    { duration: d, easing: EASE, fill: "forwards" }
  );
  return anim.finished.then(() => anim, () => anim);
}

function setOverlay(on) {
  const fading = overlayEl.getAnimations();
  fading.forEach((a) => a.cancel());
  if (on === !overlayEl.hidden) return;
  if (on) {
    overlayEl.hidden = false;
    overlayEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration(CONFIG.transitionMs), easing: "linear" });
  } else {
    const d = duration(CONFIG.transitionMs);
    if (!d) { overlayEl.hidden = true; return; }
    overlayEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: d, easing: "linear" })
      .finished.then(() => { if (!expanded) overlayEl.hidden = true; }, () => {});
  }
}

// Everything behind the dialog becomes inert while a window is EXPANDED.
function setInert(activeWin) {
  const on = Boolean(activeWin);
  media.inert = on;
  wins.forEach((w) => { w.slot.inert = on && w !== activeWin; });
}

function setState(w, state) {
  w.state = state;
  w.win.dataset.state = state;
  const ex = state === "expanded";
  w.win.classList.toggle("is-expanded", ex);
  w.slot.classList.toggle("has-expanded", ex);
  w.maxBtn.hidden = ex;
  w.restoreBtn.hidden = !ex;
  w.slot.hidden = state === "docked" || state === "closed";
  if (w.frame) w.frame.dataset.state = state; // drives the taskbar indicator
  if (ex) {
    w.win.setAttribute("role", "dialog");
    w.win.setAttribute("aria-modal", "true");
    w.win.setAttribute("aria-labelledby", w.titleId);
    w.win.removeAttribute("aria-label");
  } else {
    w.win.removeAttribute("role");
    w.win.removeAttribute("aria-modal");
    w.win.removeAttribute("aria-labelledby");
    w.win.setAttribute("aria-label", `Project window: ${w.p.filename}`);
    w.slot.style.height = "";
  }
  const src = ex ? w.p.imageLarge || w.p.image : w.p.image;
  if (w.img.getAttribute("src") !== src) w.img.src = src;
  w.img.style.objectPosition = (ex && w.p.imageLargePosition) || "";
}

function returnFocus(w) {
  let target = isShown(opener) ? opener : null;
  if (!target) {
    if (w.state === "hero") target = w.maxBtn;
    else if (w.state === "docked") target = w.frame;
    else target = wins.find((o) => o.state === "hero")?.maxBtn || w.frame;
  }
  opener = null;
  target?.focus({ preventScroll: true });
}

/* --- taskbar: one pinned icon per project, always visible --- */

function addFrame(w) {
  const frame = document.createElement("button");
  frame.type = "button";
  frame.className = "dock-frame";
  frame.setAttribute("aria-label", `Open ${w.p.title}`);
  frame.title = w.p.title;
  frame.dataset.state = w.state;
  frame.innerHTML = `<span class="dock-thumb"><img alt=""></span><span class="dock-label"></span>`;
  frame.querySelector("img").src = w.p.icon || w.p.image;
  frame.querySelector(".dock-label").textContent = w.p.title;
  frame.addEventListener("click", () => {
    // This project's full-screen page is open or minimized: the icon toggles it.
    if (page.w === w && page.state !== "closed") {
      if (page.state === "open") minimizePage();
      else if (page.state === "minimized") showPage(frame.querySelector(".dock-thumb").getBoundingClientRect());
      return;
    }
    if (phoneLayout.matches) return openProject(w);
    if (page.state === "open") minimizePage(); // another project comes forward
    opener = frame;
    expand(w);
  });
  dockEl.appendChild(frame);
  w.frame = frame;
}

/* --- transitions --- */

// Expand and restore may interrupt each other mid-flight: the FLIP starts from the
// window's current on-screen rect. Minimize and close run to completion (`busy`).
function stopMotion(w) {
  w.win.getAnimations().forEach((a) => a.cancel());
}

async function expand(w) {
  if (phoneLayout.matches) return openProject(w); // phones skip the preview and open the page
  if (w.busy || w.state === "expanded") return;
  if (expanded) displace(expanded);

  // Docked or closed windows grow out of their taskbar icon; closed ones restore to the hero.
  const fromIcon = w.state === "docked" || w.state === "closed";
  const first = (fromIcon ? w.frame.querySelector(".dock-thumb") : w.win).getBoundingClientRect();
  stopMotion(w);
  w.prev = w.state === "docked" ? "docked" : "hero";
  if (!fromIcon) w.slot.style.height = `${w.slot.offsetHeight}px`; // hold its place in the mobile list

  setState(w, "expanded");
  expanded = w;
  setOverlay(true);
  setInert(w);
  w.win.focus({ preventScroll: true });
  await flipFrom(w.win, first);
}

/** EXPANDED → HERO. */
async function restore(w, { focus = true } = {}) {
  if (w.busy || w.state !== "expanded") return;
  const first = w.win.getBoundingClientRect();
  stopMotion(w);
  if (expanded === w) { expanded = null; setOverlay(false); setInert(null); }
  setState(w, "hero");
  motion.rejoin(w); // back at its last HERO position, previous velocity kept
  bringToFront(w);
  if (focus) returnFocus(w);
  await flipFrom(w.win, first);
}

/** HERO or EXPANDED → DOCKED. */
async function minimize(w, { focus = true } = {}) {
  if (w.busy || (w.state !== "hero" && w.state !== "expanded")) return;
  w.busy = true;
  const wasExpanded = w.state === "expanded";
  const hadFocus = w.win.contains(document.activeElement);
  if (wasExpanded && expanded === w) { expanded = null; setOverlay(false); setInert(null); }

  const anim = await flyTo(w.win, w.frame.querySelector(".dock-thumb").getBoundingClientRect());
  setState(w, "docked");
  anim?.cancel();
  if (focus && (wasExpanded || hadFocus)) {
    if (!wasExpanded) opener = null;
    returnFocus(w);
  }
  w.busy = false;
}

/** Any state → CLOSED (for this visit only; state lives in memory). */
async function close(w) {
  if (w.busy || w.state === "closed") return;
  w.busy = true;
  const wasExpanded = w.state === "expanded";
  if (wasExpanded && expanded === w) { expanded = null; setOverlay(false); setInert(null); }
  const d = duration(CONFIG.closeMs);
  if (d) {
    const anim = w.win.animate(
      [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.92)" }],
      { duration: d, easing: "ease-in", fill: "forwards" }
    );
    await anim.finished.catch(() => {});
    setState(w, "closed");
    anim.cancel();
  } else {
    setState(w, "closed");
  }
  if (!wasExpanded) opener = null;
  returnFocus(w);
  w.busy = false;
}

/** A second window is expanding: send the first back where it came from. */
function displace(w) {
  if (w.prev === "docked") minimize(w, { focus: false });
  else restore(w, { focus: false });
}

/** DOCKED or CLOSED → HERO, growing back out of the taskbar icon (used by Show desktop). */
async function unminimize(w) {
  if (w.busy || (w.state !== "docked" && w.state !== "closed")) return;
  const first = w.frame.querySelector(".dock-thumb").getBoundingClientRect();
  setState(w, "hero");
  motion.rejoin(w);
  bringToFront(w);
  await flipFrom(w.win, first);
}

/* --- full-screen project page ("View project →") --- */

// One page window at a time. It fills the screen down to the taskbar. A project's page belongs
// to its window (page.w), which waits in the taskbar and whose icon toggles the page; a side
// project's page belongs to the folder (page.side) and minimizes into its desktop icon.
const pageEl = document.getElementById("page-win");
const pageFrame = pageEl.querySelector(".page-win-frame");
const page = { w: null, side: null, state: "closed" }; // "open" | "minimized" | "closed"

// Where a minimized page goes: its project's taskbar icon, or the side projects desktop icon.
const pageHome = () => (page.w ? page.w.frame.querySelector(".dock-thumb") : desktopGlyph);

function placePage() {
  const r = taskbarEl.getBoundingClientRect();
  pageEl.style.setProperty("--page-win-bottom", `${Math.max(0, window.innerHeight - r.top)}px`);
}

function loadPage({ filename, title, page: src, icon: pageIcon }, side) {
  pageEl.classList.toggle("is-side", side);
  pageEl.querySelector(".win-name").textContent = filename;
  pageEl.querySelector(".win-ico").src = pageIcon || "assets/icons/folder.svg";
  pageFrame.title = title;
  if (pageFrame.getAttribute("src") !== src) pageFrame.src = src;
}

/** Phones: open a project's page straight away; a page it replaces floats back on the desktop. */
function openProject(w) {
  const previous = page.state !== "closed" && page.w !== w ? page.w : null;
  if (previous) {
    hidePage("closed");
    setState(previous, "hero");
    motion.rejoin(previous);
  }
  openPage(w);
}

function openPage(w) {
  if (w.busy) return;
  // A window on the desktop grows out of itself; a closed or minimized one out of its taskbar icon.
  const first = (w.slot.hidden ? w.frame.querySelector(".dock-thumb") : w.win).getBoundingClientRect();
  if (page.state !== "closed" && page.w !== w) hidePage("closed");
  if (expanded === w) { expanded = null; setOverlay(false); setInert(null); }
  stopMotion(w);
  setState(w, "docked");
  page.w = w;
  page.side = null;
  loadPage(w.p, false);
  showPage(first);
}

/** Open a side project's page, growing out of its tile in the folder. */
function openSidePage(sp, first) {
  if (page.state !== "closed") hidePage("closed");
  page.w = null;
  page.side = sp;
  loadPage(sp, true);
  showPage(first);
}

function showPage(first) {
  if (expanded) displace(expanded);
  placePage();
  pageEl.hidden = false;
  page.state = "open";
  if (page.w) page.w.frame.dataset.state = "expanded";
  windowsEl.inert = true;
  pageEl.focus({ preventScroll: true });
  return flipFrom(pageEl, first);
}

function hidePage(state) {
  page.state = state;
  pageEl.hidden = true;
  windowsEl.inert = false;
  if (state === "closed") pageFrame.removeAttribute("src");
  if (page.w?.frame.dataset.state === "expanded") page.w.frame.dataset.state = page.w.state;
}

async function minimizePage() {
  if (page.state !== "open") return;
  page.state = "minimizing";
  const anim = await flyTo(pageEl, pageHome().getBoundingClientRect());
  hidePage("minimized");
  anim?.cancel();
}

/** Close the page; a project's window closes with it (its taskbar icon reopens it). */
async function closePage() {
  if (page.state === "closed") return;
  const w = page.w;
  if (page.state === "open") {
    page.state = "closing";
    const d = duration(CONFIG.closeMs);
    if (d) {
      const anim = pageEl.animate(
        [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.96)" }],
        { duration: d, easing: "ease-in", fill: "forwards" }
      );
      await anim.finished.catch(() => {});
      hidePage("closed");
      anim.cancel();
    } else hidePage("closed");
  } else hidePage("closed");
  if (w && w.state === "docked") setState(w, "closed");
  (w ? w.frame : desktopIcon).focus({ preventScroll: true });
}

/** Full screen → floating on the desktop: the page shrinks and slides into the window's last spot.
 *  A side project goes back to its folder instead. */
function pageToDesktop() {
  if (page.state !== "open") return;
  if (!page.side) return projectPageToDesktop();
  hidePage("closed");
  openFolder();
}

function projectPageToDesktop() {
  const w = page.w;
  const first = pageEl.getBoundingClientRect();
  hidePage("closed");
  setState(w, "hero");
  motion.rejoin(w);
  bringToFront(w);
  w.maxBtn.focus({ preventScroll: true });
  return flipFrom(w.win, first, CONFIG.transitionMs * 1.4);
}

/** Full screen → the windowed (expanded) project view. */
function pageToWindow() {
  if (page.state !== "open" || !page.w) return;
  const w = page.w;
  const first = pageEl.getBoundingClientRect();
  hidePage("closed");
  w.prev = "hero";
  setState(w, "expanded");
  expanded = w;
  setOverlay(true);
  setInert(w);
  w.win.focus({ preventScroll: true });
  return flipFrom(w.win, first);
}

pageEl.addEventListener("click", (e) => {
  const action = e.target.closest("[data-page]")?.dataset.page;
  if (action === "desktop") pageToDesktop();
  else if (action === "minimize") minimizePage();
  else if (action === "restore") pageToWindow();
  else if (action === "close") {
    // Phones: closing a project page returns to the desktop with its window still floating.
    if (phoneLayout.matches && page.w) pageToDesktop();
    else closePage();
  }
});
// "Back to all projects" inside the page sends the project back to the desktop
// ("Back to side projects" on a side project's page reopens the folder).
window.addEventListener("message", (e) => {
  if (e.source === pageFrame.contentWindow && e.data === "project-window:close") pageToDesktop();
});
window.addEventListener("resize", () => { if (page.state === "open") placePage(); });

/* --- side projects folder: desktop icon, taskbar icon, Explorer-style window --- */

const folderEl = document.getElementById("folder");
const folderGrid = document.getElementById("folder-grid");
document.getElementById("folder-path").textContent =
  `C:\\Andrei\\side projects · ${SIDE_PROJECTS.length} item${SIDE_PROJECTS.length === 1 ? "" : "s"}`;

SIDE_PROJECTS.forEach((sp) => {
  const li = document.createElement("li");
  li.innerHTML = `
    <button type="button" class="folder-item">
      <span class="folder-thumb"></span>
      <span class="folder-name"></span>
      <span class="folder-meta"></span>
    </button>`;
  const btn = li.querySelector("button");
  const thumb = li.querySelector(".folder-thumb");
  if (sp.image) thumb.innerHTML = `<img src="${sp.image}" alt="">`;
  else { thumb.textContent = "Image"; thumb.classList.add("is-empty"); }
  li.querySelector(".folder-name").textContent = sp.title;
  const meta = li.querySelector(".folder-meta");
  if (sp.meta) meta.textContent = sp.meta; else meta.remove();
  btn.setAttribute("aria-label", `Open ${sp.title}`);
  btn.addEventListener("click", () => {
    const first = thumb.getBoundingClientRect();
    folderEl.close();
    openSidePage(sp, first);
  });
  folderGrid.appendChild(li);
});

function openFolder() {
  if (folderEl.open) return;
  if (page.state === "open") minimizePage();
  if (expanded) restore(expanded, { focus: false });
  folderEl.showModal();
}

// Desktop icon, Windows-style: a click selects it, a double-click opens it. Keyboard (Enter /
// Space) and touch taps open it straight away, since neither has a double-click. A minimized
// side project's page lives in the icon, so opening it brings that page back first.
const desktopIcon = document.querySelector("[data-folder]");
const desktopGlyph = desktopIcon.querySelector(".folder-glyph");
function activateFolder() {
  if (page.side && page.state === "minimized") return showPage(desktopGlyph.getBoundingClientRect());
  openFolder();
}
let iconPointer = "mouse";
let lastIconClick = 0;
const DOUBLE_CLICK_MS = 500; // a little more forgiving than most system settings
desktopIcon.addEventListener("pointerdown", (e) => { iconPointer = e.pointerType; });
desktopIcon.addEventListener("click", (e) => {
  if (e.detail === 0 || iconPointer === "touch") return activateFolder();
  const now = performance.now();
  if (now - lastIconClick < DOUBLE_CLICK_MS) {
    lastIconClick = 0;
    activateFolder();
  } else {
    lastIconClick = now;
  }
});
// A double-click would otherwise select text (it lands on the folder window's title as it opens).
desktopIcon.addEventListener("mousedown", (e) => { if (e.detail > 1) e.preventDefault(); });

/* --- Show desktop: every project floats on the desktop --- */

document.getElementById("show-desktop").addEventListener("click", () => {
  if (folderEl.open) folderEl.close();
  if (page.state === "open" && page.w) projectPageToDesktop();
  else if (page.state !== "closed") hidePage("closed");
  wins.forEach((w) => {
    if (w.state === "expanded") restore(w, { focus: false });
    else unminimize(w); // docked or closed windows grow out of their taskbar icons
  });
});

/* --- events --- */

windowsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const w = wins.find((o) => o.slot.contains(btn));
  if (!w) return;
  const action = btn.dataset.action;
  if (action === "view") {
    e.preventDefault();
    openPage(w);
  } else if (action === "maximize") {
    opener = btn;
    expand(w);
  } else if (action === "restore") restore(w);
  else if (action === "minimize") minimize(w);
  else if (action === "close") close(w);
});

overlayEl.addEventListener("click", () => { if (expanded) restore(expanded); });

// Focus trap for the expanded dialog.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Tab" || !expanded) return;
  const items = [...expanded.win.querySelectorAll("button, a[href]")].filter(isShown);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const inside = expanded.win.contains(document.activeElement);
  if (e.shiftKey && (document.activeElement === first || !inside)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
    e.preventDefault();
    first.focus();
  }
});

/* ---------- Screensaver motion (HERO windows only) ---------- */

// Windows drift in straight diagonals at constant speed, bounce off the bounds and the
// obstacle rectangles, and collide with each other as equal-mass axis-aligned boxes.
// Positions are px inside the hero image area; directions are unit vectors.
const motion = (() => {
  const STEP = 1 / CONFIG.motionFps;
  const MIN_AXIS = 0.3; // keep both direction components ≥ 30% so paths stay diagonal
  let W = 0;
  let H = 0;
  let raf = 0;
  let last = 0;
  let acc = 0;
  let inView = true;

  const bodies = wins.map((w) => ({ w, x: 0, y: 0, px: 0, py: 0, rx: 0, ry: 0, dx: 0, dy: 0, bw: 0, bh: 0, paused: false }));
  const bodyOf = (w) => bodies[wins.indexOf(w)];
  // A window leaves the simulation the moment a minimize/close starts (`busy`), not when it ends.
  const inSim = (b) => b.w.state === "hero" && !b.w.busy;

  function normalize(b) {
    let len = Math.hypot(b.dx, b.dy) || 1;
    b.dx /= len;
    b.dy /= len;
    const sx = Math.sign(b.dx) || 1;
    const sy = Math.sign(b.dy) || 1;
    if (Math.abs(b.dx) < MIN_AXIS) { b.dx = sx * MIN_AXIS; b.dy = sy * Math.sqrt(1 - MIN_AXIS ** 2); }
    else if (Math.abs(b.dy) < MIN_AXIS) { b.dy = sy * MIN_AXIS; b.dx = sx * Math.sqrt(1 - MIN_AXIS ** 2); }
  }

  function randomDiagonal(b) {
    const angle = (Math.PI / 180) * (30 + Math.random() * 30); // 30°–60° off horizontal
    b.dx = Math.cos(angle) * (Math.random() < 0.5 ? -1 : 1);
    b.dy = Math.sin(angle) * (Math.random() < 0.5 ? -1 : 1);
  }

  // Obstacles are percentages of the background art, which is bottom-anchored and may be
  // cropped at the top on short screens, so map them through its frame to stay on what they cover.
  const art = document.querySelector(".hero-art");
  function toPx(o) {
    const aw = art.offsetWidth || W;
    const ah = art.offsetHeight || H;
    const top = art.offsetTop; // ≤ 0 when the top is cropped
    return { x: (o.left / 100) * aw, y: top + (o.top / 100) * ah, w: (o.width / 100) * aw, h: (o.height / 100) * ah };
  }

  // The side projects desktop icon is an obstacle too, so drifting windows never cover it.
  const iconEl = document.querySelector(".desktop-icon");
  function obstacles() {
    const list = CONFIG.obstacles.map(toPx);
    if (iconEl?.offsetWidth) {
      const pad = 10;
      list.push({ x: iconEl.offsetLeft - pad, y: iconEl.offsetTop - pad, w: iconEl.offsetWidth + pad * 2, h: iconEl.offsetHeight + pad * 2 });
    }
    return list;
  }

  // Bounds and obstacles: push out along the axis of least penetration and reflect that component.
  function resolveStatic(b, obs) {
    for (const o of obs) {
      const ox = Math.min(b.x + b.bw - o.x, o.x + o.w - b.x);
      const oy = Math.min(b.y + b.bh - o.y, o.y + o.h - b.y);
      if (ox <= 0 || oy <= 0) continue;
      if (ox < oy) {
        const left = b.x + b.bw / 2 < o.x + o.w / 2;
        b.x += left ? -ox : ox;
        b.dx = left ? -Math.abs(b.dx) : Math.abs(b.dx);
      } else {
        const above = b.y + b.bh / 2 < o.y + o.h / 2;
        b.y += above ? -oy : oy;
        b.dy = above ? -Math.abs(b.dy) : Math.abs(b.dy);
      }
    }
    if (b.x < 0) { b.x = 0; b.dx = Math.abs(b.dx); }
    if (b.x + b.bw > W) { b.x = Math.max(0, W - b.bw); b.dx = -Math.abs(b.dx); }
    if (b.y < 0) { b.y = 0; b.dy = Math.abs(b.dy); }
    if (b.y + b.bh > H) { b.y = Math.max(0, H - b.bh); b.dy = -Math.abs(b.dy); }
  }

  // Window vs window: separate along the minimum-penetration axis, swap that velocity component.
  // A paused (hovered/focused) window acts as a static obstacle.
  function overlaps(a, b) {
    return Math.min(a.x + a.bw - b.x, b.x + b.bw - a.x) > 0 && Math.min(a.y + a.bh - b.y, b.y + b.bh - a.y) > 0;
  }

  // `flip` separates along the other axis — used when the minimum-penetration axis is
  // blocked (e.g. a wall on one side, an obstacle on the other), so windows can't stay stuck.
  function resolvePair(a, b, flip = false) {
    const ox = Math.min(a.x + a.bw - b.x, b.x + b.bw - a.x);
    const oy = Math.min(a.y + a.bh - b.y, b.y + b.bh - a.y);
    if (ox <= 0 || oy <= 0) return;
    if (a.paused && b.paused) {
      // Both held still (hover + keyboard focus) yet overlapping: separate without moving the hovered one.
      if (a.w.slot.matches(":hover")) b.paused = false; else a.paused = false;
      resolvePair(a, b, flip);
      a.paused = b.paused = true;
      return;
    }
    const axis = (ox < oy) !== flip ? "x" : "y";
    const pen = axis === "x" ? ox : oy;
    const size = axis === "x" ? "bw" : "bh";
    const d = axis === "x" ? "dx" : "dy";
    const aFirst = a[axis] + a[size] / 2 < b[axis] + b[size] / 2; // a is left/above b

    if (a.paused || b.paused) {
      const [mover, still] = a.paused ? [b, a] : [a, b];
      const moverFirst = mover === a ? aFirst : !aFirst;
      mover[axis] += moverFirst ? -pen : pen;
      mover[d] = moverFirst ? -Math.abs(mover[d]) : Math.abs(mover[d]);
      normalize(mover);
      return;
    }
    a[axis] += aFirst ? -pen / 2 : pen / 2;
    b[axis] += aFirst ? pen / 2 : -pen / 2;
    [a[d], b[d]] = [b[d], a[d]];
    normalize(a);
    normalize(b);
  }

  function resolve(list, iterations) {
    const obs = obstacles();
    const pass = (flip) => {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (!flip || overlaps(list[i], list[j])) resolvePair(list[i], list[j], flip);
        }
      }
      list.forEach((b) => resolveStatic(b, obs));
    };
    for (let k = 0; k < iterations; k++) pass(false);
    // Anything still overlapping is blocked on its easy axis: separate along the other one.
    for (let k = 0; k < iterations; k++) pass(true);
    // Last resort for traps no single-axis push can escape (a window restored into an occupied
    // spot, pinned between another window and an obstacle): move it to the nearest free position.
    list.forEach((b) => { if (isBlocked(b, b.x, b.y, list, obs)) placeFree(b, list, obs); });
  }

  function isBlocked(b, x, y, list, obs) {
    const e = 0.5;
    if (x < -e || y < -e || x + b.bw > W + e || y + b.bh > H + e) return true;
    const hit = (o) => Math.min(x + b.bw - o.x, o.x + o.w - x) > e && Math.min(y + b.bh - o.y, o.y + o.h - y) > e;
    if (obs.some(hit)) return true;
    return list.some((o) => o !== b && hit({ x: o.x, y: o.y, w: o.bw, h: o.bh }));
  }

  function placeFree(b, list, obs) {
    let best = null;
    let bestD = Infinity;
    const sx = Math.max(1, W / 100);
    const sy = Math.max(1, H / 100);
    for (let y = 0; y <= H - b.bh; y += sy) {
      for (let x = 0; x <= W - b.bw; x += sx) {
        const d = (x - b.x) ** 2 + (y - b.y) ** 2;
        if (d < bestD && !isBlocked(b, x, y, list, obs)) { best = [x, y]; bestD = d; }
      }
    }
    if (best) [b.x, b.y] = best;
  }

  function step() {
    const s = CONFIG.speed * W * STEP;
    const list = bodies.filter(inSim);
    list.forEach((b) => {
      b.px = b.x;
      b.py = b.y;
      if (!b.paused) {
        b.x += b.dx * s;
        b.y += b.dy * s;
      }
    });
    resolve(list, 4);
  }

  function place(b, x, y) {
    b.rx = x; // last drawn position = its "last HERO position"
    b.ry = y;
    b.w.slot.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  }

  function render(alpha = 1) {
    bodies.forEach((b) => {
      if (inSim(b)) place(b, b.px + (b.x - b.px) * alpha, b.py + (b.y - b.py) * alpha);
    });
    outlines.forEach(({ el, o }) => {
      const r = toPx(o);
      Object.assign(el.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    });
  }

  function settle(b) {
    b.px = b.x;
    b.py = b.y;
  }

  function measure(b) {
    if (b.w.slot.offsetWidth) {
      b.bw = b.w.slot.offsetWidth;
      b.bh = b.w.slot.offsetHeight;
    }
  }

  /** Re-measure the hero area, scale positions to it and clamp everything back inside. */
  function layout() {
    const r = media.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (W && H) {
      const kx = r.width / W;
      const ky = (r.height - taskbarEl.offsetHeight) / H;
      bodies.forEach((b) => { b.x *= kx; b.y *= ky; b.rx *= kx; b.ry *= ky; });
    }
    W = r.width;
    H = r.height - taskbarEl.offsetHeight; // windows drift above the taskbar
    bodies.forEach(measure);
    const list = bodies.filter(inSim);
    resolve(list, 12);
    list.forEach(settle);
    render(1);
  }

  function tick(t) {
    raf = requestAnimationFrame(tick);
    const dt = last ? Math.min((t - last) / 1000, 0.25) : 0;
    last = t;
    if (expanded) return; // everything holds still while a window is EXPANDED
    acc += dt;
    while (acc >= STEP) {
      step();
      acc -= STEP;
    }
    render(acc / STEP);
  }

  function shouldRun() {
    return inView && !document.hidden && !reduceMotion.matches;
  }

  function update() {
    if (shouldRun() && !raf) {
      last = 0;
      acc = 0;
      bodies.forEach(settle);
      raf = requestAnimationFrame(tick);
    } else if (!shouldRun() && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
      render(1);
    }
  }

  /** A window returns to HERO at its last HERO position, keeping its previous velocity. */
  function rejoin(w) {
    const b = bodyOf(w);
    measure(b);
    b.x = b.rx;
    b.y = b.ry;
    const list = bodies.filter(inSim);
    const obs = obstacles();
    if (isBlocked(b, b.x, b.y, list, obs)) placeFree(b, list, obs); // its old spot may be taken now
    settle(b);
    place(b, b.x, b.y);
  }

  // Hovering or (keyboard-)focusing a window holds it still. Focus left behind by a mouse
  // click, or returned to a button after the dialog closes, doesn't freeze it; hover covers mice.
  bodies.forEach((b) => {
    const slot = b.w.slot;
    const keyboardFocus = () => Boolean(slot.querySelector(":focus-visible")) || slot.matches(":focus-visible");
    const hold = () => { b.paused = slot.matches(":hover") || keyboardFocus(); };
    slot.addEventListener("pointerenter", () => { b.paused = true; });
    slot.addEventListener("pointerleave", () => requestAnimationFrame(hold));
    slot.addEventListener("focusin", () => requestAnimationFrame(hold));
    slot.addEventListener("focusout", () => requestAnimationFrame(hold));
  });

  // Optional tuning aid.
  const outlines = CONFIG.showObstacles
    ? CONFIG.obstacles.map((o) => {
        const el = document.createElement("div");
        el.className = "obstacle-outline";
        windowsEl.appendChild(el);
        return { el, o };
      })
    : [];

  function init() {
    const r = media.getBoundingClientRect();
    W = r.width;
    H = r.height - taskbarEl.offsetHeight;
    bodies.forEach((b) => {
      measure(b);
      b.x = (b.w.p.startPosition.left / 100) * W;
      b.y = (b.w.p.startPosition.top / 100) * H;
      randomDiagonal(b);
    });
    // Nudge overlapping starts apart before the first frame.
    resolve(bodies.filter(inSim), 30);
    bodies.forEach(settle);
    render(1);
  }

  return {
    init,
    layout,
    update,
    rejoin,
    setInView(v) { inView = v; update(); },
    bodies, // exposed for debugging in the console
  };
})();

/* ---------- Equal-width name lines ---------- */

// Lines marked [data-fit] in a block are tracked out to the width of the longest one,
// like the comp: ANDREESCU ↔ ANDREI-ALIN.
function fitLines(block) {
  const lines = [...block.querySelectorAll("[data-fit]")];
  lines.forEach((l) => { l.style.letterSpacing = ""; l.style.marginRight = ""; });
  const textWidth = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return range.getBoundingClientRect().width;
  };
  const widths = lines.map(textWidth);
  const target = Math.max(...widths);
  lines.forEach((l, i) => {
    const n = l.textContent.length;
    if (n < 2 || widths[i] >= target - 0.25) return;
    // Spread the gap over the n-1 inner gaps; cancel the trailing spacing so the
    // last glyph lands exactly on the shared edge (matters for the right-aligned title).
    const extra = (target - widths[i]) / (n - 1);
    const base = parseFloat(getComputedStyle(l).letterSpacing) || 0;
    l.style.letterSpacing = `${base + extra}px`;
    l.style.marginRight = `${-extra}px`;
  });
}

const fitAllLines = () => document.querySelectorAll(".name").forEach(fitLines);
let fitRaf = 0;
window.addEventListener("resize", () => {
  cancelAnimationFrame(fitRaf);
  fitRaf = requestAnimationFrame(fitAllLines);
});
document.fonts?.ready.then(() => { fitAllLines(); });

/* ---------- Cursor tracking for "clear signal" ---------- */

if (CONFIG.cursorClearing) {
  media.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const r = grainCanvas.getBoundingClientRect();
    grain.cursor.x = e.clientX - r.left;
    grain.cursor.y = e.clientY - r.top;
    grain.cursor.inside = true;
  });
  media.addEventListener("pointerleave", () => { grain.cursor.inside = false; });
}

/* ---------- Escape closes the expanded window ---------- */

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && expanded) restore(expanded);
});

/* ---------- Taskbar pop-ups: business card flyout + About me ---------- */

// Business card: a native popover (light dismiss, Escape, toggled by the name button),
// placed 12px above the right end of the taskbar, wherever the taskbar is on the page.
const cardEl = document.getElementById("card");
function placeCard() {
  const r = taskbarEl.getBoundingClientRect();
  const gap = 12;
  cardEl.style.right = `${document.documentElement.clientWidth - r.right + gap}px`;
  cardEl.style.bottom = `${window.innerHeight - r.top + gap}px`;
}
let cardOpen = false;
cardEl.addEventListener("beforetoggle", (e) => { if (e.newState === "open") placeCard(); });
cardEl.addEventListener("toggle", (e) => {
  cardOpen = e.newState === "open";
  if (cardOpen) fitLines(cardEl.querySelector(".bcard-name")); // measurable only once shown
});
window.addEventListener("resize", () => { if (cardOpen) placeCard(); });
window.addEventListener("scroll", () => { if (cardOpen) placeCard(); }, { passive: true });

// Email link: a mailto: does nothing on computers with no email app set up, so a click also
// copies the address and says so. The link still opens the email app where there is one.
const emailLink = cardEl.querySelector('a[href^="mailto:"]');
const emailAddress = emailLink.textContent;
let emailReset = 0;
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const box = document.createElement("textarea");
    box.value = text;
    cardEl.appendChild(box);
    box.select();
    const ok = document.execCommand("copy");
    box.remove();
    return ok;
  }
}
emailLink.setAttribute("aria-live", "polite");
emailLink.addEventListener("click", async () => {
  if (!(await copyText(emailAddress))) return;
  emailLink.textContent = "Email copied";
  clearTimeout(emailReset);
  emailReset = setTimeout(() => { emailLink.textContent = emailAddress; }, 2000);
});

// Start menu: a native popover placed on top of the taskbar's left end; every item closes it.
const startEl = document.getElementById("start-menu");
function placeStart() {
  const r = taskbarEl.getBoundingClientRect();
  startEl.style.left = `${r.left}px`;
  startEl.style.bottom = `${window.innerHeight - r.top}px`;
}
startEl.addEventListener("beforetoggle", (e) => { if (e.newState === "open") placeStart(); });
startEl.querySelectorAll(".start-item").forEach((item) => {
  item.addEventListener("click", () => {
    startEl.hidePopover();
    if (item.dataset.start === "folder") activateFolder();
    if (item.dataset.start === "card") cardEl.showPopover();
  });
});

// Tapping outside the card or Start menu only closes it: that click never reaches the windows or
// folder underneath. The taskbar stays live, so its buttons work straight away, as on Windows.
let swallowNextClick = false;
document.addEventListener("pointerdown", (e) => {
  const flyoutOpen = cardEl.matches(":popover-open") || startEl.matches(":popover-open");
  swallowNextClick = flyoutOpen && !e.target.closest(".taskbar, #card, #start-menu");
}, true);
document.addEventListener("click", (e) => {
  if (!swallowNextClick) return;
  swallowNextClick = false;
  e.preventDefault();
  e.stopPropagation();
}, true);

// About me: native modal <dialog>: focus trap, Escape and focus return come with it.
document.querySelectorAll("[data-dialog]").forEach((btn) => {
  const dialog = document.getElementById(btn.dataset.dialog);
  btn.addEventListener("click", () => dialog.showModal());
});
document.querySelectorAll("dialog").forEach((dialog) => {
  // A click on the backdrop lands on the <dialog> itself.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.closest("[data-close]")) dialog.close();
  });
});

/* ---------- Performance: pause when hidden or scrolled away ---------- */

document.addEventListener("visibilitychange", () => { loop.update(); motion.update(); });
new IntersectionObserver(([entry]) => {
  loop.setHeroVisible(entry.isIntersecting);
  motion.setInView(entry.isIntersecting);
}).observe(hero);

/* ---------- Media query changes ---------- */

reduceMotion.addEventListener("change", () => { loop.update(); grain.draw(); motion.update(); });
mobileQuery.addEventListener("change", () => { motion.layout(); motion.update(); });

/* ---------- Init ---------- */

new ResizeObserver(() => { grain.resize(); motion.layout(); }).observe(media);
grain.resize();
fitAllLines();
motion.init();
loop.update();
motion.update();
