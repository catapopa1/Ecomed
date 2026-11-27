/**
 * Builds the home hero's self-drawing art from the real voucher 16 drawing (M/desene, transparent PNG): the
 * face, mirrored so it looks left, towards the headline. The bitmap is soft and grainy (the band especially),
 * so it is turned into true vector lines, crisp at any size:
 *  - face, rings and corner circles: the line pixels (blue and orange apart) are thinned to a 1-px skeleton
 *    (Zhang-Suen), split at junctions, re-joined where a line runs straight on, smoothed into Bézier curves;
 *    each keeps the colour and width it has in the art;
 *  - the band (a ribbon of 12 fine lines and an orange one) is rebuilt: its outer edges are traced and the
 *    lines spread evenly between them, the orange one follows its own traced path.
 * Voucher 15 is only read to tell the band and corner circles (both drawings have them) from the face.
 * Timing: every line draws from its outer end inwards (lines that cross the middle are split there and
 * drawn from both ends), started by a front that closes in from the four corners; one pen speed throughout.
 *
 * Usage: node scripts/hero-strokes.mjs <folder with desen_voucher_15.png and desen_voucher_16.png>
 * Writes src/data/heroStrokes.json.
 */
import sharp from 'sharp';
import fs from 'node:fs';

const SRC = process.argv[2];
const OUT_JSON = 'src/data/heroStrokes.json';

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


/* ── band vs face (as before: pixels near a face stroke are the face, the rest band and corner circles) ── */
const A = await load('15'), B = await load('16');
const W = A.w, H = A.h, D = B.data;


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

/* ── vector lines ── */
// colour classes
const cls = new Uint8Array(W * H); // 0 none, 1 navy, 2 soft blue, 3 orange
for (let i = 0; i < W * H; i++) {
  const r = D[i*4], g = D[i*4+1], b = D[i*4+2], a = D[i*4+3];
  if (a < 90) continue;
  if (r > b + 30) cls[i] = 3;
  else { const L = (0.3*r + 0.59*g + 0.11*b) / 255; if (L < 0.66) cls[i] = 1; }
}
// chamfer distance inside a mask
const dist = (m) => {
  const d = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) d[i] = m[i] ? 1e9 : 0;
  for (let y = 1; y < H; y++) for (let x = 1; x < W - 1; x++) { const i = y*W+x; if (!d[i]) continue; d[i] = Math.min(d[i], d[i-1]+1, d[i-W]+1, d[i-W-1]+1.414, d[i-W+1]+1.414); }
  for (let y = H - 2; y >= 0; y--) for (let x = W - 2; x > 0; x--) { const i = y*W+x; if (!d[i]) continue; d[i] = Math.min(d[i], d[i+1]+1, d[i+W]+1, d[i+W+1]+1.414, d[i+W-1]+1.414); }
  return d;
};
const smooth = (p, k = 3) => p.map((q, i) => {
  if (i < 1 || i > p.length - 2) return q;
  let sx = 0, sy = 0, n = 0;
  for (let j = Math.max(0, i - k); j <= Math.min(p.length - 1, i + k); j++) { sx += p[j][0]; sy += p[j][1]; n++; }
  return [sx / n, sy / n];
});
const f2 = (n) => +n.toFixed(1);
const bez = (pts) => { // Catmull-Rom -> cubic
  const p = pts; let s = `M${f2(p[0][0])} ${f2(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    s += `C${f2(p1[0] + (p2[0] - p0[0]) / 6)} ${f2(p1[1] + (p2[1] - p0[1]) / 6)} ${f2(p2[0] - (p3[0] - p1[0]) / 6)} ${f2(p2[1] - (p3[1] - p1[1]) / 6)} ${f2(p2[0])} ${f2(p2[1])}`;
  }
  return s;
};
// ── band: rebuilt as a ribbon (its outer edges traced, 12 lines spread evenly between them) ──

const bm = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) bm[i] = D[i * 4 + 3] > 60 && !isFace(i) ? 1 : 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (y < 780 || y > 1212) bm[y * W + x] = 0; // band rows only (circles sit above and below)
const isOr = (i) => D[i * 4] > D[i * 4 + 2] + 30;
const topY = [], botY = [], orY = [];
for (let x = 0; x < W; x++) {
  let t = -1, b = -1; const os = [];
  for (let y = 780; y < 1213; y++) { const i = y * W + x; if (!bm[i]) continue; if (isOr(i)) os.push(y); if (t < 0) t = y; b = y; }
  topY.push(t); botY.push(b); orY.push(os.length ? os[(os.length / 2) | 0] : -1);
}
const fill = (a) => { const o = [...a]; const idx = o.map((v, i) => (v >= 0 ? i : -1)).filter((i) => i >= 0); for (let i = 0; i < o.length; i++) if (o[i] < 0) { const l = idx.filter((j) => j < i).at(-1), r = idx.find((j) => j > i); o[i] = l === undefined ? o[r] : r === undefined ? o[l] : o[l] + (o[r] - o[l]) * (i - l) / (r - l); } return o; };
const medF = (a, k) => a.map((_, i) => { const w = []; for (let j = i - k; j <= i + k; j++) if (a[j] >= 0) w.push(a[j]); w.sort((p, q) => p - q); return w.length ? w[(w.length / 2) | 0] : -1; });
const gauss = (a, sg) => { const R = Math.ceil(sg * 3); return a.map((_, i) => { let s = 0, n = 0; for (let j = i - R; j <= i + R; j++) { const v = a[Math.min(a.length - 1, Math.max(0, j))]; if (v < 0) continue; const wv = Math.exp(-((j - i) ** 2) / (2 * sg * sg)); s += v * wv; n += wv; } return n ? s / n : -1; }); };
const T = gauss(fill(medF(topY, 22)), 30), Bo = gauss(fill(medF(botY, 22)), 30), Or = gauss(fill(medF(orY, 20)), 30);
// console.log('band edges', [0, 200, 400, 600, 800, 1000, 1178].map((x) => `${x}:${T[x] | 0}-${Bo[x] | 0}/${Or[x] | 0}`).join(' '));
const NL = 12, band = [];
for (let k = 0; k < NL; k++) {
  const pts = []; for (let x = 0; x < W; x += 3) pts.push([x, T[x] + (Bo[x] - T[x]) * (k / (NL - 1))]);
  pts.push([W - 1, T[W - 1] + (Bo[W - 1] - T[W - 1]) * (k / (NL - 1))]);
  band.push({ o: 0, w: 1.9, col: 'rgb(38,58,140)', pts: rdp(pts, 0.3) });
}
{ const pts = []; for (let x = 0; x < W; x += 3) pts.push([x, Or[x]]); band.push({ o: 1, w: 4.6, col: 'rgb(236,128,72)', pts: rdp(pts, 0.3) }); }
// join chains whose ends nearly touch and continue in the same direction (small breaks in the source lines)
function join(list, gap = 10, dotMax = -0.85, endOk = () => true) {
  const L = list.map((p) => [...p]);
  const dir = (p, atEnd) => { const n = Math.min(12, p.length - 1); const a = atEnd ? p[p.length - 1] : p[0], b = atEnd ? p[p.length - 1 - n] : p[n]; const dx = a[0] - b[0], dy = a[1] - b[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  let merged = true;
  while (merged) {
    merged = false;
    let best = null;
    for (let i = 0; i < L.length; i++) for (const ai of [0, 1]) for (let j = i + 1; j < L.length; j++) for (const aj of [0, 1]) {
      const pa = ai ? L[i].at(-1) : L[i][0], pb = aj ? L[j].at(-1) : L[j][0];
      const d = Math.hypot(pa[0] - pb[0], pa[1] - pb[1]); if (d > gap || !endOk(pa) || !endOk(pb)) continue;
      const da = dir(L[i], ai), db = dir(L[j], aj);
      if (da[0] * db[0] + da[1] * db[1] > dotMax) continue;
      if (d > 1.5) { const gx = (pb[0] - pa[0]) / d, gy = (pb[1] - pa[1]) / d; if (gx * da[0] + gy * da[1] < 0.7) continue; }
      if (!best || d < best.d) best = { d, i, ai, j, aj };
    }
    if (best) {
      const { i, ai, j, aj } = best;
      const a = ai ? L[i] : [...L[i]].reverse(), b = aj ? [...L[j]].reverse() : L[j];
      L[i] = a.concat(b); L.splice(j, 1); merged = true;
    }
  }
  return L;
}
const out = [];
const onFace = (x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < W && Y < H && isFace(Y * W + X) && D[(Y * W + X) * 4 + 3] > 60) return true; } return false; };
const onBand = (p) => {
  let n = 0, c = 0, r = 0;
  for (let i = 0; i < p.length; i += 2) { n++; const [x, y] = p[i]; if (y >= T[x] - 10 && y <= Bo[x] + 10) { r++; if (!onFace(x, y)) c++; } }
  const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
  const steep = Math.max(...ys) - Math.min(...ys) > 1.2 * (Math.max(...xs) - Math.min(...xs));
  return c / n > 0.6 || (r / n > 0.6 && !steep); // band lines, or flat bits inside the band rows (neck lines are steep)
};
for (const c of [1, 3]) {
  const m = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) m[i] = cls[i] === c && !bm[i] ? 1 : 0; // band pixels left out: the band is rebuilt
  // close tiny gaps: dilate 1px for skeleton input
  const md = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y*W+x; if (m[i] || m[i-1] || m[i+1] || m[i-W] || m[i+W]) md[i] = 1; }
  const dt = dist(m);
  const img = { data: new Uint8Array(W * H * 4), w: W, h: H };
  for (let i = 0; i < W * H; i++) img.data[i*4+3] = md[i] ? 255 : 0;
  const sk = skeleton(img, 128);
  const kept = join(strokes(sk, W, H), c === 3 ? 30 : 12, c === 3 ? -0.7 : -0.85).filter((p) => len(p) > (c === 3 ? 30 : 18) && !onBand(p));
  for (const p of join(kept, 90, -0.9, ([x, y]) => y > T[Math.min(W - 1, Math.max(0, Math.round(x)))] - 40 && y < Bo[Math.min(W - 1, Math.max(0, Math.round(x)))] + 40)) { // second pass bridges the neck lines across the band
    const ds = p.map(([x, y]) => dt[y*W+x]).sort((a, b) => a - b);
    const wdt = Math.max(1.1, 2 * ds[(ds.length * 0.5) | 0] - 0.5);
    let rs = 0, gs = 0, bs = 0, n = 0;
    for (const [x, y] of p) { const i = (y*W+x); if (cls[i] !== c) continue; rs += D[i*4]; gs += D[i*4+1]; bs += D[i*4+2]; n++; }
    if (!n) continue;
    const col = `rgb(${(rs/n)|0},${(gs/n)|0},${(bs/n)|0})`;
    out.push({ o: c === 3 ? 1 : 0, w: +wdt.toFixed(2), col, raw: p, pts: rdp(smooth(smooth(p, 4), 4), 0.35) });
  }
}
/* circle fit (Kåsa least squares): centre, radius and rms distance of the points from that circle */
const fitCircle = (p) => {
  let sx = 0, sy = 0; for (const [x, y] of p) { sx += x; sy += y; } const mx = sx / p.length, my = sy / p.length;
  let suu = 0, svv = 0, suv = 0, suuu = 0, svvv = 0, suvv = 0, svuu = 0;
  for (const [x, y] of p) { const u = x - mx, v = y - my; suu += u * u; svv += v * v; suv += u * v; suuu += u * u * u; svvv += v * v * v; suvv += u * v * v; svuu += v * u * u; }
  const det = suu * svv - suv * suv; if (Math.abs(det) < 1e-6) return null;
  const bu = (suuu + suvv) / 2, bv = (svvv + svuu) / 2;
  const uc = (bu * svv - bv * suv) / det, vc = (bv * suu - bu * suv) / det;
  const cx = uc + mx, cy = vc + my, r = Math.sqrt(uc * uc + vc * vc + (suu + svv) / p.length);
  let e = 0; for (const [x, y] of p) e += (Math.hypot(x - cx, y - cy) - r) ** 2;
  return { cx, cy, r, rms: Math.sqrt(e / p.length) };
};
/* ── everything that is not the face, made geometric ──
   Rings: the face's three ring sets (cheek, ear, chin) share a centre; a traced line whose points all sit at
   the same distance from one of those centres is part of a ring there. Corner circles and arcs: lines that lie
   wholly in a corner. Both are replaced by exact circles (or arcs over the span the art covers). */
const RING_C = [[466, 613], [763, 613], [230, 841]], RING_R = [[43, 62, 80], [90, 115, 141, 164], [43, 62, 80]];
const inCorner = (p) => { const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]); return Math.max(...xs) < 150 || Math.min(...xs) > 920 || Math.min(...ys) > 1215; };
const rings = []; // { sys, cx, cy, r, members: [] }
const restOut = [];
for (const s of out) {
  let hit = null;
  for (let k = 0; k < RING_C.length && !hit; k++) {
    const ds = s.raw.map(([x, y]) => Math.hypot(x - RING_C[k][0], y - RING_C[k][1]));
    const m = ds.reduce((a, b) => a + b, 0) / ds.length, sd = Math.sqrt(ds.reduce((a, b) => a + (b - m) ** 2, 0) / ds.length);
    if (sd < 2.5 && RING_R[k].some((r) => Math.abs(r - m) < 6) && len(s.raw) > 10) hit = { sys: k, r: m };
  }
  if (!hit && inCorner(s.raw) && len(s.raw) > 10) { const f = fitCircle(s.raw); if (f && f.rms < 2.5 && f.r < 300) hit = { sys: -1, cx: f.cx, cy: f.cy, r: f.r }; }
  if (!hit) { restOut.push(s); continue; }
  const g = rings.find((g) => g.sys === hit.sys && g.o === s.o && Math.abs(g.r - hit.r) < 9 && (hit.sys >= 0 || Math.hypot(g.cx - hit.cx, g.cy - hit.cy) < 15));
  if (g) g.members.push(s); else rings.push({ ...hit, o: s.o, members: [s] });
}
// concentric systems: one centre fitted from all their rings together
for (let k = 0; k < RING_C.length; k++) {
  const gs = rings.filter((g) => g.sys === k); if (!gs.length) continue;
  let [cx, cy] = RING_C[k];
  for (let it = 0; it < 30; it++) { // refine the shared centre (gradient steps on the summed squared radial error)
    let gx = 0, gy = 0, n = 0;
    for (const g of gs) { const pts = g.members.flatMap((m) => m.raw); const r = pts.reduce((a, [x, y]) => a + Math.hypot(x - cx, y - cy), 0) / pts.length;
      for (const [x, y] of pts) { const d = Math.hypot(x - cx, y - cy) || 1; gx += (d - r) * (cx - x) / d; gy += (d - r) * (cy - y) / d; n++; } }
    cx -= (gx / n) * 0.8; cy -= (gy / n) * 0.8;
  }
  for (const g of gs) { const pts = g.members.flatMap((m) => m.raw); g.cx = cx; g.cy = cy; g.r = pts.reduce((a, [x, y]) => a + Math.hypot(x - cx, y - cy), 0) / pts.length; }
}
// corner pieces of one circle (broken where other lines cross it) become one; tiny bits go
for (let merged = true; merged; ) {
  merged = false;
  const cs = rings.filter((g) => g.sys < 0);
  for (let i = 0; i < cs.length && !merged; i++) for (let j = i + 1; j < cs.length && !merged; j++) {
    if (cs[i].o !== cs[j].o) continue;
    const f = fitCircle([...cs[i].members, ...cs[j].members].flatMap((m) => m.raw));
    if (f && f.rms < 2.5 && f.r < 300) { cs[i].members.push(...cs[j].members); Object.assign(cs[i], { cx: f.cx, cy: f.cy, r: f.r }); rings.splice(rings.indexOf(cs[j]), 1); merged = true; }
  }
}
for (let i = rings.length - 1; i >= 0; i--) if (rings[i].members.reduce((a, m) => a + len(m.raw), 0) < 40) rings.splice(i, 1);
for (const g of rings) if (g.sys < 0) { const f = fitCircle(g.members.flatMap((m) => m.raw)); Object.assign(g, { cx: f.cx, cy: f.cy, r: f.r }); }
// each circle is drawn over the span the art covers: breaks where another line crosses (< 25°) are closed,
// real gaps in the design are kept, so a circle may come out as a few arcs
const ringOut = rings.flatMap((g) => {
  const all = g.members.flatMap((m) => m.raw);
  const ang = all.map(([x, y]) => Math.atan2(y - g.cy, x - g.cx)).sort((a, b) => a - b);
  const GAP = (25 * Math.PI) / 180, gaps = [];
  for (let i = 0; i < ang.length; i++) { const a0 = ang[i], a1 = i + 1 < ang.length ? ang[i + 1] : ang[0] + 2 * Math.PI; if (a1 - a0 > GAP) gaps.push([a0, a1]); }
  const spans = gaps.length ? gaps.map((gp, i) => { const nx = gaps[(i + 1) % gaps.length]; let to = nx[0]; while (to < gp[1]) to += 2 * Math.PI; return [gp[1], to]; }) : [[0, 2 * Math.PI]];
  const main = g.members.reduce((a, b) => (len(b.raw) > len(a.raw) ? b : a));
  const w = +(g.members.reduce((a, m) => a + m.w * len(m.raw), 0) / g.members.reduce((a, m) => a + len(m.raw), 0)).toFixed(2);
  return spans.filter(([a0, a1]) => (a1 - a0) * g.r > 12).map(([a0, a1]) => {
    const span = a1 - a0, n = Math.max(8, Math.ceil((span * g.r) / 10)); // a point every ~10 px: the curve through them is a true circle
    const pts = Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (span * i) / n; return [g.cx + g.r * Math.cos(a), g.cy + g.r * Math.sin(a)]; });
    if (!gaps.length) pts[n] = [...pts[0]];
    return { o: g.o, w, col: main.col, pts };
  });
});
/* the neck lines (the long lines that run down across the band): smoothed much more, and the short
   doubles the tracing left beside them dropped */
const lower = (s) => s.raw.every(([, y]) => y > 780);
const isNeck = (s) => !s.o && Math.max(...s.raw.map((q) => q[1])) > 1000 && len(s.raw) > 60;
const necks = restOut.filter(isNeck);
const faceOut = restOut.filter((s) => {
  if (isNeck(s) || !lower(s)) return true;
  const near = s.raw.filter(([x, y]) => necks.some((n) => n !== s && n.raw.some(([a, b]) => Math.abs(a - x) < 7 && Math.abs(b - y) < 7))).length;
  return near / s.raw.length < 0.6;
});
// a neck line traced in pieces (broken where it crosses the band) is joined end to end first
for (let merged = true; merged; ) {
  merged = false;
  const ns = faceOut.filter(isNeck);
  for (let i = 0; i < ns.length && !merged; i++) for (let j = 0; j < ns.length && !merged; j++) {
    if (i === j) continue;
    const a = ns[i].raw, b = ns[j].raw, e = a.at(-1);
    const d0 = Math.hypot(b[0][0] - e[0], b[0][1] - e[1]), d1 = Math.hypot(b.at(-1)[0] - e[0], b.at(-1)[1] - e[1]);
    if (Math.min(d0, d1) > 30) continue;
    const bb = d0 <= d1 ? b : [...b].reverse();
    if (bb[bb.length - 1][1] < e[1]) continue; // only join downwards
    ns[i].raw = a.concat(bb); faceOut.splice(faceOut.indexOf(ns[j]), 1); merged = true;
  }
}
for (const s of faceOut) if (isNeck(s)) { let q = s.raw; for (let k = 0; k < 4; k++) q = smooth(q, 10); s.pts = rdp(q, 0.35); }
// a neck that is the double of a longer one goes too
const necksKept = faceOut.filter(isNeck).sort((a, b) => len(b.raw) - len(a.raw));
for (let i = 1; i < necksKept.length; i++) {
  const s = necksKept[i]; const near = s.raw.filter(([x, y]) => necksKept.slice(0, i).some((n) => n.raw.some(([a, b]) => Math.abs(a - x) < 7 && Math.abs(b - y) < 7))).length;
  if (near / s.raw.length > 0.6) faceOut.splice(faceOut.indexOf(s), 1);
}
out.length = 0; out.push(...faceOut, ...ringOut);
if (process.env.DEBUG) { console.log('rings', rings.map((g) => `${g.sys}${g.o ? 'O' : 'b'} c${g.cx | 0},${g.cy | 0} r${g.r.toFixed(1)} n${g.members.length}`).join(' | ')); console.log('necks', faceOut.filter(isNeck).length); }
out.push(...band);

/* ── timing: from the four corners into the middle ── */
const PEN = 750; // px of art per second: the pen speed the face had before
const FRONT = 320; // px per second: how fast the start front closes in from the corners
const C = [W / 2, H * 0.47], rC = (q) => Math.hypot(q[0] - C[0], q[1] - C[1]);
const R0 = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(rC));
const pieces = [];
for (const s of out) {
  let p = s.pts;
  const closed = p.length > 4 && Math.hypot(p[0][0] - p.at(-1)[0], p[0][1] - p.at(-1)[1]) < 6;
  if (closed) { // a ring: start at its outer point, both halves close at its inner point
    let f = 0; p.forEach((q, i) => { if (rC(q) > rC(p[f])) f = i; });
    p = p.slice(f).concat(p.slice(1, f + 1));
  }
  let n = 0; p.forEach((q, i) => { if (rC(q) < rC(p[n])) n = i; });
  const parts = n > 1 && n < p.length - 2 ? [p.slice(0, n + 1), p.slice(n).reverse()] : [rC(p[0]) >= rC(p.at(-1)) ? p : [...p].reverse()];
  for (const q of parts) if (q.length > 1 && len(q) > 4) pieces.push({ ...s, pts: q });
}
const paths = pieces.map((s) => ({
  d: bez(s.pts), o: s.o, w: s.w, col: s.col,
  delay: +(0.15 + Math.max(0, R0 - rC(s.pts[0])) / FRONT).toFixed(2),
  dur: +Math.max(0.12, len(s.pts) / PEN).toFixed(2),
}));
const lag = Math.min(...paths.map((p) => p.delay)) - 0.15; // the very corners are empty: start with the first line
for (const p of paths) p.delay = +(p.delay - lag).toFixed(2);
paths.sort((a, b) => a.o - b.o); // orange on top
const hex = (c) => '#' + c.match(/\d+/g).map((v) => (+v).toString(16).padStart(2, '0')).join('');
for (const p of paths) p.col = hex(p.col);
fs.writeFileSync(OUT_JSON, JSON.stringify({ w: W, h: H, paths }));
const end = Math.max(...paths.map((p) => p.delay + p.dur));
console.log('paths', paths.length, 'ends at', end.toFixed(2) + 's', 'bytes', fs.statSync(OUT_JSON).size);
