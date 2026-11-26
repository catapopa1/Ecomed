/**
 * Builds the home hero's "self-drawing" data from the real voucher 16 drawing (M/desene, transparent PNG):
 * the face, mirrored so it looks left, towards the headline. Voucher 15 is only read to tell the band and
 * circles (which both drawings share) apart from the face, so the band can be drawn first.
 *
 * For each drawing: the line pixels are thinned to a 1-px skeleton (Zhang-Suen), the skeleton is split
 * into pieces at junctions, and pieces are re-joined across crossings where they continue straight on,
 * giving long strokes. In the page, each stroke is a thick line in an SVG mask that "draws" (dash
 * transition) and so uncovers the real artwork underneath, as if it were being drawn.
 *
 * Usage: node scripts/hero-strokes.mjs <folder with desen_voucher_15.png and desen_voucher_16.png>
 * Writes src/assets/hero/hero-band.webp (band + circles), hero-face.webp (the face) and
 * src/data/heroStrokes.json. Split so that each pen uncovers only its own lines.
 */
import sharp from 'sharp';
import fs from 'node:fs';

const SRC = process.argv[2];
const OUT_IMG = 'src/assets/hero', OUT_JSON = 'src/data/heroStrokes.json';
fs.mkdirSync(OUT_IMG, { recursive: true });

async function load(n) {
  const img = sharp(`${SRC}/desen_voucher_${n}.png`).flop();
  const { data, info } = await img.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

/* ── skeleton ── */
function skeleton({ data, w, h }, thr = 90) {
  const b = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) b[i] = data[i * 4 + 3] > thr ? 1 : 0;
  const del = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      del.length = 0;
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (!b[i]) continue;
        const p2 = b[i - w], p3 = b[i - w + 1], p4 = b[i + 1], p5 = b[i + w + 1], p6 = b[i + w], p7 = b[i + w - 1], p8 = b[i - 1], p9 = b[i - w - 1];
        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (B < 2 || B > 6) continue;
        const s = [p2, p3, p4, p5, p6, p7, p8, p9, p2];
        let A = 0; for (let k = 0; k < 8; k++) if (!s[k] && s[k + 1]) A++;
        if (A !== 1) continue;
        if (pass === 0 ? (p2 * p4 * p6 || p4 * p6 * p8) : (p2 * p4 * p8 || p2 * p6 * p8)) continue;
        del.push(i);
      }
      for (const i of del) b[i] = 0;
      if (del.length) changed = true;
    }
  }
  return b;
}

const N8 = (w) => [-w - 1, -w, -w + 1, -1, 1, w - 1, w, w + 1];

/* ── pieces between junctions/ends, then joined across crossings ── */
function strokes(b, w, h) {
  const nb = N8(w);
  const deg = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (b[i]) { let d = 0; for (const o of nb) if (b[i + o]) d++; deg[i] = d; }
  const isNode = (i) => deg[i] !== 2;
  const used = new Set(); // edge keys "a-b" of pixel steps
  const key = (a, c) => (a < c ? a + '-' + c : c + '-' + a);
  const pieces = [];
  const walk = (start, next) => {
    const path = [start, next]; used.add(key(start, next));
    let prev = start, cur = next;
    while (!isNode(cur)) {
      let nx = -1;
      for (const o of nb) { const j = cur + o; if (b[j] && j !== prev && !used.has(key(cur, j))) { nx = j; break; } }
      if (nx < 0) break;
      used.add(key(cur, nx)); path.push(nx); prev = cur; cur = nx;
      if (cur === start) break;
    }
    return path;
  };
  for (let i = 0; i < w * h; i++) if (b[i] && isNode(i) && deg[i] > 0)
    for (const o of nb) { const j = i + o; if (b[j] && !used.has(key(i, j))) pieces.push(walk(i, j)); }
  for (let i = 0; i < w * h; i++) if (b[i] && deg[i] === 2) // closed loops (circles)
    for (const o of nb) { const j = i + o; if (b[j] && !used.has(key(i, j))) pieces.push(walk(i, j)); }

  // junction clusters: neighbouring node pixels form one junction
  const P = pieces.map((p) => p.map((i) => [i % w, (i / w) | 0]));
  const ends = [];
  P.forEach((p, k) => { if (p.length < 2) return; ends.push({ k, at: 0 }, { k, at: 1 }); });
  const endPt = (e) => (e.at ? P[e.k][P[e.k].length - 1] : P[e.k][0]);
  const dirOut = (e) => { // direction pointing from the junction into the piece
    const p = P[e.k], n = Math.min(10, p.length - 1);
    const a = e.at ? p[p.length - 1] : p[0], c = e.at ? p[p.length - 1 - n] : p[n];
    const dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l];
  };
  // group ends that sit within 4 px of each other
  const groups = [];
  for (const e of ends) {
    const q = endPt(e);
    let g = groups.find((g) => Math.hypot(g.x - q[0], g.y - q[1]) < 4.5);
    if (!g) { g = { x: q[0], y: q[1], list: [] }; groups.push(g); }
    g.list.push(e);
  }
  const link = new Map(); // "k:at" -> {k, at}
  for (const g of groups) {
    if (g.list.length < 2) continue;
    const L = g.list.map((e) => ({ e, d: dirOut(e) }));
    const pairs = [];
    for (let a = 0; a < L.length; a++) for (let c = a + 1; c < L.length; c++) {
      if (L[a].e.k === L[c].e.k) continue;
      pairs.push([L[a].d[0] * L[c].d[0] + L[a].d[1] * L[c].d[1], a, c]);
    }
    pairs.sort((x, y) => x[0] - y[0]);
    const taken = new Set();
    for (const [dot, a, c] of pairs) {
      if (dot > -0.55 || taken.has(a) || taken.has(c)) continue;
      taken.add(a); taken.add(c);
      link.set(`${L[a].e.k}:${L[a].e.at}`, L[c].e); link.set(`${L[c].e.k}:${L[c].e.at}`, L[a].e);
    }
  }
  // chain pieces through the links
  const done = new Set(), out = [];
  const chainFrom = (k, at) => { // start at piece k, entering at end `at`
    let pts = [];
    let cur = { k, at };
    while (cur && !done.has(cur.k)) {
      done.add(cur.k);
      const p = cur.at ? [...P[cur.k]].reverse() : P[cur.k];
      pts = pts.concat(pts.length ? p.slice(1) : p);
      const exit = { k: cur.k, at: cur.at ? 0 : 1 };
      cur = link.get(`${exit.k}:${exit.at}`);
    }
    return pts;
  };
  P.forEach((p, k) => { // start from free ends first
    if (done.has(k) || p.length < 2) return;
    if (!link.has(`${k}:0`)) out.push(chainFrom(k, 0));
    else if (!link.has(`${k}:1`)) out.push(chainFrom(k, 1));
  });
  P.forEach((p, k) => { if (!done.has(k) && p.length >= 2) out.push(chainFrom(k, 0)); });
  return out.filter((p) => len(p) > 14);
}
const len = (p) => { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; };

/* ── simplify + smooth ── */
function rdp(p, eps) {
  if (p.length < 3) return p;
  const [a, b] = [p[0], p[p.length - 1]];
  let dmax = 0, idx = 0;
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < p.length - 1; i++) {
    const d = Math.abs(dy * p[i][0] - dx * p[i][1] + b[0] * a[1] - b[1] * a[0]) / l;
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax < eps) return [a, b];
  return rdp(p.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(p.slice(idx), eps));
}
const r = (n) => Math.round(n);
const toPath = (p) => { const q = rdp(p, 1.2); return 'M' + q.map(([x, y]) => `${r(x)} ${r(y)}`).join('L'); };

/* ── classify: band and circles are in both drawings (allow a few px of difference) ── */
const near = (img, [x, y], R = 3) => {
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    const X = x + dx, Y = y + dy;
    if (X >= 0 && Y >= 0 && X < img.w && Y < img.h && img.data[(Y * img.w + X) * 4 + 3] > 50) return true;
  }
  return false;
};
const share = (img, p) => { let n = 0, c = 0; for (let i = 0; i < p.length; i += 3) { n++; if (near(img, p[i])) c++; } return c / n; };
const orange = (img, p) => { let n = 0, o = 0; for (let i = 0; i < p.length; i += 3) { const j = (p[i][1] * img.w + p[i][0]) * 4; n++; if (img.data[j] > img.data[j + 2] + 40) o++; } return o / n > 0.5; };

/* ── timing: one pen per drawing, each stroke starting near where the last one ended ── */
function sequence(list, start, window) {
  const left = [...list];
  left.sort((a, b) => b.len - a.len);
  const order = [left.shift()];
  while (left.length) {
    const e = order[order.length - 1].p.at(-1);
    let best = 0, bd = Infinity, flip = false;
    left.forEach((s, i) => {
      const d0 = Math.hypot(s.p[0][0] - e[0], s.p[0][1] - e[1]), d1 = Math.hypot(s.p.at(-1)[0] - e[0], s.p.at(-1)[1] - e[1]);
      if (d0 < bd) { bd = d0; best = i; flip = false; }
      if (d1 < bd) { bd = d1; best = i; flip = true; }
    });
    const s = left.splice(best, 1)[0];
    if (flip) s.p = [...s.p].reverse();
    order.push(s);
  }
  // raw times at a constant pen speed (with a short lift between strokes), then fitted into the window
  let t = 0;
  const raw = order.map((s) => { const d = { s, t0: t, dur: s.len }; t += s.len * 0.8 + 6; return d; });
  const total = raw.at(-1).t0 + raw.at(-1).dur, k = window / total;
  return raw.map(({ s, t0, dur }) => ({ ...s, delay: +(start + t0 * k).toFixed(2), dur: +Math.max(0.15, dur * k).toFixed(2) }));
}

const A = await load('15'), B = await load('16');
const W = A.w, H = A.h;


const sFace = strokes(skeleton(B), W, H);

const mk = (p, img) => ({ p, len: len(p), o: orange(img, p) ? 1 : 0, x: Math.min(...p.map((q) => q[0])) });
const bandS = [], face = [];
for (const p of sFace) (share(A, p) > 0.75 ? bandS : face).push(mk(p, B));
const keep = (l) => l.filter((s) => s.len >= 24);

/* split voucher 16 by pen: pixels within a few px of a face stroke are the face layer, the rest the band layer */
const near8 = (list, R) => {
  const m = new Uint8Array(W * H);
  for (const s of list) for (const [x, y] of s.p)
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < W && Y < H && dx * dx + dy * dy <= R * R) m[Y * W + X] = 1;
    }
  return m;
};
const faceKeep = keep(face);
const lineM = near8(faceKeep.filter((s) => !s.o), 8), ringM = near8(faceKeep.filter((s) => s.o), 18);
const isFace = (i) => lineM[i] || ringM[i];
const part = (keepPx) => { const d = Buffer.from(B.data); for (let i = 0; i < W * H; i++) if (!keepPx(i)) d[i * 4 + 3] = 0; return d; };
const save = (d, name) => sharp(d, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 95, alphaQuality: 100, smartSubsample: true }).toFile(`${OUT_IMG}/${name}.webp`);
await save(part((i) => !isFace(i)), 'hero-band');
await save(part(isFace), 'hero-face');

const fin = (s) => ({ d: toPath(s.p), o: s.o, delay: s.delay, dur: s.dur });
const out = {
  w: W, h: H,
  band: bandS.map((s) => fin({ ...s, delay: +(0.1 + (s.x / W) * 1.1).toFixed(2), dur: +Math.min(2.4, Math.max(0.3, s.len / 700)).toFixed(2) })),
  face: sequence(faceKeep, 0.6, 5.4).map(fin),
};
fs.writeFileSync(OUT_JSON, JSON.stringify(out));
console.log('band', out.band.length, 'face', out.face.length, 'bytes', fs.statSync(OUT_JSON).size);
