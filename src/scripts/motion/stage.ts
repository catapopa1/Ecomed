/**
 * The stage (D1 test, Cata 25 Nov 2026: "not just simple scroll between sections, but animations").
 * All scenes are stacked full-screen layers inside one pinned stage; the scroll drives one timeline.
 * Each scene names how it ENTERS with data-tx; between transitions a scene "holds": if it is taller
 * than the screen its content scrolls inside it; [data-htrack] scrolls sideways; [data-quotes] steps.
 *
 *   <div data-stage> <div class="scene">…</div> <div class="scene" data-tx="zoomslide">…</div> … </div>
 *
 * Scrubbed, so scrolling up plays everything backwards. No JS / reduced motion: the scenes are
 * ordinary stacked sections (nothing is hidden by CSS; from-states are set here).
 */
import { gsap, ScrollTrigger } from './core';

type Tx = (tl: gsap.core.Timeline, a: HTMLElement, b: HTMLElement, t: number, d: number) => void;

/** a scene's content box (the Section inside the layer) */
const body = (s: HTMLElement) => s.firstElementChild as HTMLElement;
/** its content (moved, never scaled up: see the rule below) */
const inner = (s: HTMLElement) => body(s).querySelector<HTMLElement>(':scope > .section-inner') ?? body(s);

/* Rule: nothing is ever scaled ABOVE 1. Chrome rasterises a layer at its resting size; enlarging it shows a
   blurry copy that keeps snapping sharp mid-animation (Cata: "like a TV cable not properly put in"). */
const TX: Record<string, { d: number; run: Tx }> = {
  /** Cata's idea: the screen zooms out, slides away sideways, the next arrives zoomed out and zooms in */
  zoomslide: {
    d: 1.6,
    run(tl, a, b, t, d) {
      const r = '2.2rem';
      const g = 'sine.inOut';
      tl.to(a, { scale: 0.78, borderRadius: r, duration: d * 0.3, ease: g }, t)
        .fromTo(b, { xPercent: 112, scale: 0.78, borderRadius: r }, { xPercent: 0, duration: d * 0.42, ease: g }, t + d * 0.29)
        .to(a, { xPercent: -112, duration: d * 0.42, ease: g }, t + d * 0.29)
        .to(b, { scale: 1, borderRadius: 0, duration: d * 0.3, ease: g }, t + d * 0.7);
    },
  },
  /** a circle opens from the centre and the next scene grows out of it; the old one sinks back */
  iris: {
    d: 1.2,
    run(tl, a, b, t, d) {
      tl.fromTo(b, { clipPath: 'circle(0vmax at 50% 55%)' }, { clipPath: 'circle(82vmax at 50% 55%)', duration: d, ease: 'none' }, t)
        .fromTo(inner(b), { y: '3rem', opacity: 0.3 }, { y: 0, opacity: 1, duration: d, ease: 'none' }, t)
        .to(a, { scale: 0.88, rotate: -2, duration: d, ease: 'none' }, t);
    },
  },
  /** a window opens in the middle of the old scene, then we fly through it into the new one.
   *  The clip-path is written by hand each frame: the browser shortens inset() values when it reads them back,
   *  and tweening between a shortened and a full value made the window jump (Cata: "it instantly appears"). */
  portal: {
    d: 1.5,
    run(tl, a, b, t, d) {
      const st = { p: 0 };
      const lerp = (x: number, y: number, u: number) => x + (y - x) * u;
      const ease = gsap.parseEase('sine.inOut');
      const draw = () => {
        // 0 → 0.4: the window opens to 52% × 48% of the screen; 0.4 → 1: it grows to the full screen
        const p = st.p;
        let v: number, h: number, r: number;
        if (p < 0.4) { const u = ease(p / 0.4); v = lerp(50, 24, u); h = lerp(50, 26, u); r = 2.6; }
        else { const u = ease((p - 0.4) / 0.6); v = lerp(24, 0, u); h = lerp(26, 0, u); r = lerp(2.6, 0, u); }
        b.style.clipPath = `inset(${v}% ${h}% ${v}% ${h}% round ${r}rem)`;
      };
      draw();
      tl.fromTo(st, { p: 0 }, { p: 1, duration: d, ease: 'none', onUpdate: draw, immediateRender: false }, t)
        .fromTo(inner(b), { y: '2.5rem' }, { y: 0, duration: d, ease: 'none' }, t)
        .to(a, { scale: 0.9, opacity: 0.5, duration: d, ease: 'none' }, t);
    },
  },
  /** vertical blinds: the new scene rises in staggered columns (Codrops SVG-mask column pattern, in clip-path) */
  blinds: {
    d: 1.3,
    run(tl, a, b, t, d) {
      const N = 9, lag = 0.35;              // each column starts lag/N of the way after the previous
      const st = { p: 0 };
      const ease = gsap.parseEase('sine.inOut');
      const draw = () => {
        let pts = '0% 100%';
        for (let k = 0; k < N; k++) {
          const local = Math.min(1, Math.max(0, (st.p * (1 + lag) - (k / (N - 1)) * lag)));
          const top = (1 - ease(local)) * 100;
          const x0 = (k / N) * 100, x1 = ((k + 1) / N) * 100 + 0.05;
          pts += `,${x0}% 100%,${x0}% ${top}%,${x1}% ${top}%,${x1}% 100%`;
        }
        b.style.clipPath = `polygon(${pts},100% 100%)`;
      };
      draw();                              // hidden from the start (no frame of the full scene)
      tl.fromTo(st, { p: 0 }, { p: 1, duration: d, onUpdate: draw }, t)
        .fromTo(body(b), { yPercent: 8 }, { yPercent: 0, duration: d, ease: 'none' }, t)
        .to(a, { yPercent: -10, scale: 0.94, duration: d, ease: 'none' }, t);
    },
  },
  /** the stage turns like a cube: the old face tips away upwards, the new one comes up from below */
  cube: {
    d: 1.3,
    run(tl, a, b, t, d) {
      // origin set (not tweened) at the start: a tweened origin made the old face drift (Cata: "it glitches")
      tl.set(a, { transformOrigin: '50% 100%' }, t)
        .to(a, { yPercent: -100, rotateX: 62, duration: d, ease: 'none' }, t)
        .fromTo(b, { yPercent: 100, rotateX: -62, transformOrigin: '50% 0%' }, { yPercent: 0, rotateX: 0, duration: d, ease: 'none' }, t);
    },
  },
  /** a diagonal wipe sweeps across from the left; the old scene drifts away to the left and dims */
  diagonal: {
    d: 1.2,
    run(tl, a, b, t, d) {
      tl.fromTo(b, { clipPath: 'polygon(0% 0%, 0% 0%, -35% 100%, -35% 100%)' }, { clipPath: 'polygon(0% 0%, 135% 0%, 100% 100%, -35% 100%)', duration: d, ease: 'none' }, t)
        .fromTo(body(b), { xPercent: 8 }, { xPercent: 0, duration: d, ease: 'none' }, t)
        .to(a, { xPercent: -14, opacity: 0.4, duration: d, ease: 'none' }, t);
    },
  },
  /** the last card lifts up over the stage with rounded top corners; the old one falls back and dims */
  lift: {
    d: 1.1,
    run(tl, a, b, t, d) {
      tl.fromTo(b, { yPercent: 100, borderRadius: '2.6rem 2.6rem 0 0' }, { yPercent: 0, borderRadius: '0rem 0rem 0 0', duration: d, ease: 'none' }, t)
        .to(a, { scale: 0.9, yPercent: -4, opacity: 0.35, transformOrigin: '50% 0%', duration: d, ease: 'none' }, t);
    },
  },
};

let recSpan: [number, number, number] | null = null;
let recApply: ((t: number) => void) | null = null;   // [scene index, first stop, last stop] of the recommendations
let pageTo = (y: number) => scrollTo({ top: y, behavior: 'smooth' });
/** paging.ts hands over its glide so the skip button moves like a scroll */
export function setPager(fn: (y: number) => void) { pageTo = fn; }
/** a small seeded random, so each card's curves are the same on every visit */
const rnd = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
type Pt = [number, number];
type Curve = [Pt, Pt, Pt, Pt];
const bez = ([p0, p1, p2, p3]: Curve, u: number): Pt => {
  const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
};
const SVGNS = 'http://www.w3.org/2000/svg';

function recLines(tl: gsap.core.Timeline, scene: HTMLElement, box: HTMLElement, getT: () => number, setT: (x: number) => void, stops: number[], idx: number) {
  const cards = [...box.querySelectorAll<HTMLElement>('.q')];
  const wash = [...box.querySelectorAll<HTMLElement>('.rec-wash i')];
  if (cards.length < 2) return;
  // measure the layout with the stage's own transforms off (the entrance has already set its from-state)
  const sec = body(scene), keep = [scene.style.transform, sec.style.transform];
  scene.style.transform = sec.style.transform = 'none';
  const sr = sec.getBoundingClientRect(), cr = cards[0].getBoundingClientRect();
  scene.style.transform = keep[0]; sec.style.transform = keep[1];
  const W = sr.width, H = sr.height;
  const k = cr.width / cards[0].offsetWidth || 1;        // the section's fit-scale: card moves are in its own units
  const home: Pt = [cr.left - sr.left + cr.width / 2, cr.top - sr.top + cr.height / 2];
  const L0: Pt = [home[0] - cr.width / 2 - 6, home[1]], R0: Pt = [home[0] + cr.width / 2 + 6, home[1]];
  // one curve per side per card: leaves the card level, bends once, exits past the edge or the bottom
  const curve = (start: Pt, dir: 1 | -1, r: () => number): Curve => {
    const room = dir > 0 ? W - start[0] : start[0];
    const side = room > 120 && r() < 0.5;               // off the side, else off the bottom
    const end: Pt = side
      ? [dir > 0 ? W + 80 : -80, start[1] + H * (0.05 + r() * 0.3)]
      : [start[0] + dir * Math.max(60, room * (0.25 + r() * 0.6)), H + 80];
    const c1: Pt = [start[0] + dir * Math.min(room * 0.8, 70 + r() * 170), start[1] + (r() - 0.5) * 50];
    const c2: Pt = side ? [end[0] - dir * (140 + r() * 200), end[1] - (r() - 0.3) * 160] : [end[0] + dir * (r() - 0.5) * 220, end[1] - (150 + r() * 220)];
    return [start, c1, c2, end];
  };
  const curves = cards.map((_, n) => { const r = rnd(9173 + n * 101); return { L: curve(L0, -1, r), R: curve(R0, 1, r) }; });
  // the drawing layer covers the scene; each card has its pair of paths, in its colour
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'rec-lines'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('aria-hidden', 'true');
  const d = (c: Curve) => `M${c[0]} C${c[1]} ${c[2]} ${c[3]}`;
  const paths = cards.map((c, n) => {
    const col = getComputedStyle(c).getPropertyValue('--c').trim() || '#9cc8f0';
    return (['L', 'R'] as const).map((side) => {
      const p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', d(curves[n][side])); p.setAttribute('pathLength', '1'); p.setAttribute('stroke', col); p.style.color = col;
      svg.append(p);
      gsap.set(p, { strokeDasharray: '1 1', strokeDashoffset: n ? 1 : 0 });   // only the first card's lines show at the start
      return p;
    });
  });
  scene.append(svg);
  // where a card is while it rides a line: u=0 at home, u=1 its centre at the line's far end (shrunk, faded)
  const place = (c: HTMLElement, cv: Curve, u: number, out: boolean) => {
    const [px, py] = bez(cv, u), off = 1 - u;
    const x = px + (home[0] - cv[0][0]) * off - home[0], y = py + (home[1] - cv[0][1]) * off - home[1];
    gsap.set(c, { x: x / k, y: y / k, scale: 1 - 0.82 * Math.min(1, u * 1.15), rotate: (out ? -1 : 1) * u * 8, opacity: u > 0.9 ? Math.max(0, (1 - u) / 0.1) : 1 });
  };
  const t0 = getT(), STEP = 1.3, LEAVE = 0.55, COME_AT = 0.3, COME = 0.65;
  const easeIn = gsap.parseEase('power2.in'), easeOut = gsap.parseEase('power2.out');
  // the cards follow the timeline's own time (works the same forwards, backwards and after a refresh)
  const apply = (T: number) => cards.forEach((c, n) => {
    const comeA = t0 + (n - 1) * STEP + COME_AT, leaveA = t0 + n * STEP;
    if (n && T < comeA) { gsap.set(c, { opacity: 0 }); return; }
    if (n && T < comeA + COME) { place(c, curves[n - 1].R, 1 - easeOut((T - comeA) / COME), false); return; }
    if (n < cards.length - 1 && T > leaveA) { place(c, curves[n].L, Math.min(1, easeIn((T - leaveA) / LEAVE)), true); return; }
    place(c, curves[n].L, 0, true);
  });
  recApply = apply;
  apply(-1);
  let t = t0;
  recSpan = [idx, t, 0];
  cards.forEach((_, n) => {
    if (!n) return;
    const [pl, pr] = paths[n - 1], [nl, nr] = paths[n];
    tl.to(pl, { strokeDashoffset: -1, duration: 0.4, ease: 'power1.in' }, t + 0.25)          // the left line follows the card out
      .to(pr, { strokeDashoffset: 1, duration: 0.55, ease: 'power2.out' }, t + COME_AT)        // the arriving card rolls the right line up
      .to(wash[n - 1], { opacity: 0, duration: 0.6 }, t + 0.25)
      .fromTo(wash[n], { opacity: 0 }, { opacity: 1, duration: 0.6, immediateRender: false }, t + 0.25)
      .fromTo([nl, nr], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: 'sine.out', immediateRender: false }, t + 0.85);
    t += STEP;
    stops.push(t);
  });
  recSpan[2] = t;
  setT(t);
}

const HOLD = 0;             // no rest between stops: the glide lands on the stop itself (popa)
let st: ScrollTrigger | null = null;
let tlMade: gsap.core.Timeline | null = null;

export function buildStage(root: ParentNode = document) {
  const stage = root.querySelector<HTMLElement>('[data-stage]');
  if (!stage) return;
  stage.classList.add('stage-on');
  const scenes = [...stage.querySelectorAll<HTMLElement>(':scope > .scene')];
  const vh = window.innerHeight;
  scenes.forEach((s, i) => { s.style.zIndex = String(i + 1); if (i) gsap.set(s, { visibility: 'hidden' }); });

  recSpan = null; recApply = null;
  const tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate() { recApply?.(this.time()); } });
  let t = 0;
  const stops: number[] = [0];
  const enterAt: number[] = [0];                 // timeline times the stepper stops at
  /** split a continuous stretch [a, b] into stops about one screen apart */
  const stretch = (a: number, b: number) => { const n = Math.max(1, Math.round((b - a) / 0.85)); for (let k = 1; k <= n; k++) stops.push(a + ((b - a) * k) / n); };
  scenes.forEach((s, i) => {
    if (i) {
      enterAt[i] = t;
      const tx = TX[s.dataset.tx ?? ''] ?? TX.lift;
      tl.set(s, { visibility: 'visible' }, t);
      tx.run(tl, scenes[i - 1], s, t, tx.d);
      t += tx.d;
      tl.set(scenes[i - 1], { visibility: 'hidden' }, t);
    }
    t += HOLD / 2;
    // a little taller than the screen: shrink its content slightly so the whole section shows under the header
    const sec = body(s), inner = sec.querySelector<HTMLElement>(':scope > .section-inner');
    let extra = sec.offsetHeight - vh;
    if (extra > 2 && inner) {
      const cs = getComputedStyle(sec);
      const avail = vh - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const k = avail / inner.offsetHeight;
      if (k >= 0.72) { sec.style.height = `${vh}px`; gsap.set(inner, { scale: k, transformOrigin: '50% 50%' }); extra = 0; }
    }
    if (i) stops.push(t);                      // the scene has fully arrived
    // sideways track
    s.querySelectorAll<HTMLElement>('[data-htrack]').forEach((track) => {
      const view = track.parentElement!, pcs = getComputedStyle(view);
      const dist = track.scrollWidth - (view.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight));   // ends with the last card fully in, at the gutter
      if (dist <= 0) return;
      const len = dist / vh * 1.1;
      tl.fromTo(track, { x: 0 }, { x: -dist, duration: len }, t);
      stretch(t, t + len);
      t += len;
    });
    // recommendations (Cata 25 Nov): the card has a line on its left and one on its right; each swerves once
    // and runs off the screen (left side or bottom / right side or bottom). Scrolling down, the card leaves
    // along its left line, the next one arrives along the right line from where it leaves the screen, and then
    // the lines move: the old pair goes, the new card's own pair draws out of its edges.
    s.querySelectorAll<HTMLElement>('[data-rec]').forEach((box) => recLines(tl, s, box, () => t, (x) => { t = x; }, stops, i));
    // taller than the screen: the content scrolls inside the layer
    if (extra > 4) { const len = extra / vh; tl.to(body(s), { y: -extra, duration: len }, t); stretch(t, t + len); t += len; }
    t += HOLD / 2;
  });
  stops.push(t);

  tlMade = tl;
  // which scene is on screen (past the middle of its entrance): the header follows its ground, and hides on
  // scenes marked data-no-header (the full-screen video)
  const mids = scenes.map((_, i) => (i ? enterAt[i] + (TX[scenes[i].dataset.tx ?? '']?.d ?? TX.lift.d) / 2 : -1));
  let shown = -1;
  const total = t;
  // skip button inside the recommendations: down → the next scene, up → the scene before
  const skip = recSpan ? scenes[recSpan[0]].querySelector<HTMLButtonElement>('.rec-skip') : null;
  let skipDir = 1;
  const span = recSpan;
  if (skip && span) {
    const prevStop = enterAt[span[0]];
    const nextScene = scenes[span[0] + 1];
    const nextStop = nextScene ? span[2] + (TX[nextScene.dataset.tx ?? ''] ?? TX.lift).d : span[2];
    skip.onclick = () => { if (st) pageTo(st.start + (skipDir > 0 ? nextStop : prevStop) * vh); };
  }
  const setSkip = (dir: number) => {
    if (!skip || dir === skipDir) return;
    skipDir = dir;
    skip.classList.toggle('up', dir < 0);
    skip.querySelector('.lbl')!.textContent = dir < 0 ? skip.dataset.up! : skip.dataset.down!;
  };
  const tell = (time: number) => {
    let k = 0;
    for (let i = 0; i < mids.length; i++) if (time >= mids[i]) k = i;
    if (k === shown) return;
    shown = k;
    const sec = body(scenes[k]);
    dispatchEvent(new CustomEvent('stage-scene', { detail: { ground: sec.dataset.ground ?? 'light', noHeader: scenes[k].hasAttribute('data-no-header') } }));
  };
  st = ScrollTrigger.create({ trigger: stage, start: 'top top', end: () => `+=${t * vh}`, pin: true, scrub: 0.14, animation: tl,
    onUpdate: (self) => { tell(self.progress * total); if (span && self.progress * total < span[1] + 0.3) setSkip(1); else if (span && self.progress * total > span[2] - 0.3) setSkip(-1); else if (self.direction) setSkip(self.direction); }, onRefresh: (self) => tell(self.progress * total) });
  tStops = [...new Set(stops.map((x) => +x.toFixed(4)))].sort((a, b) => a - b);
  stageVh = vh;
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__stage = () => ({ stops: tStops, extra: scenes.map((c) => body(c).offsetHeight - vh) });
}

/** the stage's stops and range in page pixels, for the site-wide wheel paging (paging.ts) */
let tStops: number[] = [], stageVh = 0;
export function stagePaging(): { stops: number[]; range: [number, number] } | null {
  if (!st) return null;
  return { stops: tStops.map((t) => st!.start + t * stageVh), range: [st.start, st.end] };
}

export function killStage() {
  tStops = [];
  document.querySelectorAll('.rec-lines').forEach((x) => x.remove());
  st?.kill(); st = null;
  tlMade?.revert(); tlMade = null;
  document.querySelectorAll<HTMLElement>('[data-stage]').forEach((s) => {
    s.classList.remove('stage-on');
    s.querySelectorAll<HTMLElement>(':scope > .scene').forEach((c) => { c.style.zIndex = ''; (c.firstElementChild as HTMLElement).style.height = ''; gsap.set([c, c.firstElementChild, c.querySelector('.section-inner')], { clearProps: 'all' }); });
  });
}
