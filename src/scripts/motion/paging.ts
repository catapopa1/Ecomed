/**
 * Site-wide wheel paging (Cata, 25 Nov 2026; applies to the whole website):
 * - one scroll gesture, however small or hard, glides to the NEXT section: soft start, long gentle landing;
 * - a new swipe during a glide carries on to the section after; a push that keeps going adds one every STEP_GAP;
 * - it always lands exactly on a section, never between two.
 * Ported 1:1 from popa-insolventa (src/scripts/scenes.ts, "section stops"): same timings, same gesture rules.
 *
 * Stops: the top of every section in <main>, the footer, the page bottom, plus the stage's own stops
 * (stage.ts). A section much taller than the screen reads normally (the wheel follows freely inside it, up
 * to its last screen), so no content is ever jumped over. Scrollbar stays native; keys page one section.
 * Desktop (> 820px) with motion allowed; phones scroll natively for now.
 */
import { ScrollTrigger } from './core';
import { stagePaging, setPager } from './stage';

const FREE = 1.6;             // a stretch longer than this many screens (outside the stage) reads freely
const NUDGE = 12;             // px of wheel before a touch counts as a gesture
const GAP = 200;              // ms without wheel input that ends a gesture
const STEP_GAP = 600;         // a push that keeps going (not inertia) adds the next section every this many ms (popa)

let off: (() => void) | null = null;

export function killPaging() { off?.(); off = null; setPager((y) => scrollTo({ top: y, behavior: 'smooth' })); }

export function buildPaging() {
  killPaging();
  if (innerWidth <= 820) return;

  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  const ease = (x: number) => x * x * (3 - 2 * x);
  const maxY = () => document.documentElement.scrollHeight - innerHeight;

  let stops: number[] = [];
  let free: [number, number][] = [];
  const computeStops = () => {
    const m = maxY();
    const stage = stagePaging();
    const out = [0, m];
    document.querySelectorAll<HTMLElement>('main > *, .site-footer').forEach((el) => {
      if (el.querySelector('[data-stage]') || el.hasAttribute('data-stage')) return;
      const pos = getComputedStyle(el).position;
      if (pos === 'fixed' || pos === 'absolute' || el.offsetHeight < innerHeight * 0.3) return;   // overlays, labels: not sections
      out.push(el.getBoundingClientRect().top + scrollY);
    });
    if (stage) out.push(...stage.stops, stage.range[1]);
    stops = out.map((y) => Math.round(Math.max(0, Math.min(m, y)))).sort((a, b) => a - b).filter((y, i, a) => i === 0 || y - a[i - 1] > 24);
    free = [];
    for (let i = 1; i < stops.length; i++) {
      const a = stops[i - 1], b = stops[i];
      const inStage = stage && a >= stage.range[0] - 2 && b <= stage.range[1] + 2;
      if (!inStage && b - a > innerHeight * FREE) free.push([a, b]);
    }
  };
  const ahead = (y: number, dir: number) => (dir > 0 ? stops.find((s) => s > y + 2) : stops.findLast((s) => s < y - 2));
  const freeAt = (y: number, dir: number) => free.find(([a, b]) => (dir > 0 ? y >= a - 2 && y < b - 2 : y > a + 2 && y <= b + 2));
  const scrollsInside = (t: EventTarget | null, dy: number) => {
    for (let el = t instanceof Element ? t : null; el && el !== document.body; el = el.parentElement) {
      if (el.scrollHeight <= el.clientHeight + 1 || !/auto|scroll/.test(getComputedStyle(el).overflowY)) continue;
      if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
    }
    return false;
  };

  /* ── the glide (popa): soft start RISE s, gentle landing over the last LAND of the way ── */
  const RISE = 0.16, LAND = 0.55;
  const glideTime = (dist: number) => Math.max(0.75, Math.min(1.15, 0.6 + (0.2 * dist) / innerHeight));   // popa, exactly
  type Glide = { t0: number; from: number; to: number; dur: number; w0: number; c: number; rise: number; table: Float64Array };
  const N = 240;
  const rampUp = (u: number, rise: number) => (u >= rise ? 1 : ease(u / rise));
  const rampDown = (u: number) => (u <= 1 - LAND ? 1 : 1 - ease((u - (1 - LAND)) / LAND));
  const speed = (g: Glide, u: number) => (g.w0 * (1 - rampUp(u, g.rise)) + g.c * rampUp(u, g.rise)) * rampDown(u);
  const plan = (from: number, to: number, v0: number, t0: number, fixed?: number): Glide | null => {
    const d = to - from;
    if (Math.abs(d) < 1) return null;
    const g: Glide = { t0, from, to, dur: fixed ?? glideTime(Math.abs(d)), w0: 0, c: 0, rise: 0, table: new Float64Array(N + 1) };
    for (let k = 0; k < 3; k++) {
      g.rise = Math.min(0.5, RISE / g.dur);
      g.w0 = (v0 * g.dur) / d;
      let A = 0, B = 0;
      for (let i = 0; i < N; i++) {
        const u = (i + 0.5) / N, r = rampUp(u, g.rise), f = rampDown(u);
        A += ((1 - r) * f) / N;
        B += (r * f) / N;
      }
      g.c = (1 - g.w0 * A) / B;
      if (g.c >= g.w0 * 0.5 || k === 2) break;
      g.dur = Math.max(0.3, Math.abs(d) / (Math.abs(v0) * (A + 0.5 * B)));
    }
    let p = 0;
    g.table[0] = 0;
    for (let i = 1; i <= N; i++) { p += (speed(g, (i - 1) / N) + speed(g, i / N)) / 2 / N; g.table[i] = p; }
    const end = g.table[N] || 1;
    for (let i = 1; i <= N; i++) g.table[i] /= end;
    return g;
  };
  const at = (g: Glide, now: number) => {
    const u = clamp01((now - g.t0) / 1000 / g.dur);
    const x = u * N, i = Math.min(N - 1, Math.floor(x));
    return g.from + (g.to - g.from) * (g.table[i] + (g.table[i + 1] - g.table[i]) * (x - i));
  };
  const velocity = (g: Glide, now: number) => {
    const u = (now - g.t0) / 1000 / g.dur;
    return u >= 1 ? 0 : (speed(g, Math.max(0, u)) * (g.to - g.from)) / g.dur / (g.table[N] || 1);
  };

  let cur = 0, tgt = 0, moving = false, lastT = 0, lastSet = -1, raf = 0, dense = false;
  let flight: Glide | null = null;
  const frame = (now: number) => {
    const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 1 / 60;
    lastT = now;
    if (lastSet >= 0 && Math.abs(scrollY - lastSet) > 3) { stopGlide(); return; }   // scrollbar or a link moved it: let it
    let done: boolean;
    if (flight) {
      cur = at(flight, now);
      done = now - flight.t0 >= flight.dur * 1000;
      if (done) { cur = tgt = flight.to; flight = null; }
    } else {
      // inside a long section: the page follows the wheel closely
      const tau = dense ? 0.045 : 0.1;
      let move = (tgt - cur) * (1 - Math.exp(-dt / tau));
      if (Math.abs(move) < 1) move = Math.sign(tgt - cur) * Math.min(1, Math.abs(tgt - cur));
      cur += move;
      done = Math.abs(tgt - cur) < 0.5;
      if (done) cur = tgt;
    }
    scrollTo({ top: cur, behavior: 'instant' });
    lastSet = scrollY;
    ScrollTrigger.update();
    if (done) { moving = false; lastT = 0; lastSet = -1; } else raf = requestAnimationFrame(frame);
  };
  const run = () => { if (!moving) { moving = true; lastT = 0; lastSet = -1; raf = requestAnimationFrame(frame); } };
  const stopGlide = () => { flight = null; moving = false; lastT = 0; lastSet = -1; cur = tgt = scrollY; };
  const heading = () => (flight ? flight.to : tgt);
  const speedNow = (now: number) => (flight ? velocity(flight, now) : moving ? (tgt - cur) / (dense ? 0.045 : 0.1) : 0);
  const glideTo = (to: number, now: number, fixed?: number) => {
    const from = moving ? cur : scrollY;
    const g = plan(from, Math.max(0, Math.min(maxY(), to)), speedNow(now), now, fixed);
    if (!g) return;
    flight = g; tgt = g.to; run();
  };

  setPager((y) => { computeStops(); const dist = Math.abs(y - scrollY) / innerHeight; glideTo(y, performance.now(), Math.max(1.8, Math.min(3.2, dist * 0.5))); });   // skip button: calm, ~0.5 s a screen

  /* ── gestures ── */
  let lastWheel = -1e9, gDir = 0, used = false, push = 0, stepAt = -1e9;
  let peak = 0, trough = Infinity, recent: number[] = [];
  let timed: [number, number][] = [];
  const inWindow = (from: number, to: number) => timed.filter(([t]) => t > from && t <= to).map(([, m]) => m);
  /** still pushing as hard as a quarter of a second ago (a finger held moving, a wheel spun on): trackpad inertia always fades */
  const sustained = (now: number) => {
    const late = inWindow(now - 120, now), early = inWindow(now - 370, now - 120);
    if (!late.length || !early.length) return false;
    const avg = late.reduce((a, b) => a + b, 0) / late.length;
    return avg >= Math.max(6, peak * 0.4, Math.max(...early) * 0.85);
  };
  /** a new swipe started during the trackpad's inertia (its speed had faded and suddenly climbs again) */
  const renewed = (mag: number) => {
    if (mag > peak) { peak = mag; trough = mag; return false; }
    trough = Math.min(trough, mag);
    const [a, b] = recent.slice(-2);
    return recent.length >= 2 && trough < peak * 0.4 && mag >= Math.max(18, peak * 0.45) && mag > trough * 3 && b > a && mag > b && a > trough * 1.3;
  };
  /** one more section in direction dir, from wherever the page is already heading */
  const step = (dir: number, now: number) => {
    const h = heading();
    const base = moving && Math.sign(h - cur) === dir ? h : moving ? cur : scrollY;
    const s = ahead(base, dir);
    used = true; stepAt = now;
    if (s !== undefined) glideTo(s, now);
  };

  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || document.documentElement.classList.contains('menu-open')) return;
    const dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1);
    if (!dy || Math.abs(e.deltaX) > Math.abs(dy) || scrollsInside(e.target, dy)) return;
    e.preventDefault();
    const now = performance.now();
    const mag = Math.abs(dy), dir = Math.sign(dy);
    const fresh = now - lastWheel > GAP;
    dense = now - lastWheel < 40 && mag < 60;
    lastWheel = now;
    if (fresh) { recent = []; timed = []; computeStops(); }
    const again = !fresh && renewed(mag);
    if (fresh || dir !== gDir || (again && now - stepAt > 160)) {
      gDir = dir; used = false; push = 0; peak = mag; trough = Infinity;
    }
    recent.push(mag);
    if (recent.length > 20) recent.shift();
    timed.push([now, mag]);
    while (timed.length && timed[0][0] < now - 500) timed.shift();
    if (!moving) cur = tgt = scrollY;

    // inside a long section: follow the wheel, up to its first or last screen
    const zone = freeAt(heading(), dir);
    if (zone && !flight) {
      if (used) return;
      const next = Math.max(zone[0], Math.min(zone[1], tgt + dy));
      if (next !== tgt + dy) { used = true; stepAt = now; }   // reached its end: the rest of this gesture stops there
      tgt = next;
      run();
      return;
    }
    if (!used) { push += mag; if (push >= NUDGE) step(dir, now); return; }
    if (now - stepAt > STEP_GAP && sustained(now)) step(dir, now);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest('input, textarea, select, [contenteditable], [role="menu"], [role="listbox"]')) return;
    const down = e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey) || e.key === 'ArrowDown';
    const up = e.key === 'PageUp' || (e.key === ' ' && e.shiftKey) || e.key === 'ArrowUp';
    if (!down && !up) return;
    computeStops();
    const dir = down ? 1 : -1;
    if (freeAt(moving ? heading() : scrollY, dir) && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) return;  // arrows read a long section line by line
    e.preventDefault();
    if (!moving) cur = tgt = scrollY;
    used = false;
    step(dir, performance.now());
  };

  addEventListener('wheel', onWheel, { passive: false });
  addEventListener('keydown', onKey);
  off = () => { removeEventListener('wheel', onWheel); removeEventListener('keydown', onKey); cancelAnimationFrame(raf); };
}
