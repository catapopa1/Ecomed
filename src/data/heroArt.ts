/**
 * Home hero drawing, in the voucher style (M/desene), v2.
 * Subject: a stethoscope whose two ear tubes draw a heart and join at its tip; the tube runs down to a
 * detailed chest piece resting on the wave. A single pen line runs along the wave and beats once (ECG).
 * Around it: the voucher band of fine lines with its orange line, sound ripples, corner circles, small plus signs.
 *
 * Quality rules (Cata: v1 looked low quality):
 * - every curve is emitted as real cubic Béziers (Catmull-Rom through dense samples), never short straight segments;
 * - straight things (the ECG) are true straight lines with crisp corners;
 * - tubes are drawn as two parallel outlines plus a thin highlight, like a drawn object, not one fat stroke.
 * viewBox 0 0 640 640. Computed at build time; the page only gets path strings.
 */
type Pt = [number, number];
type Seg = [Pt, Pt, Pt]; // c1, c2, end
export const W = 640, H = 640;

const f = (n: number) => +n.toFixed(1);

/** the wave's centre line */
const wy = (x: number) => 538 - 34 * Math.sin(((x - 40) * 2 * Math.PI) / 720);

/* ── geometry helpers ── */
const bez = (a: Pt, [c1, c2, b]: Seg, t: number): Pt => {
  const u = 1 - t;
  return [u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0],
    u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1]];
};
/** dense, evenly spaced samples along a chain of cubics */
function sample(start: Pt, segs: Seg[], step = 3): Pt[] {
  const fine: Pt[] = [start];
  let a = start;
  for (const s of segs) { for (let i = 1; i <= 80; i++) fine.push(bez(a, s, i / 80)); a = s[2]; }
  const out: Pt[] = [fine[0]];
  let acc = 0;
  for (let i = 1; i < fine.length; i++) {
    acc += Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1]);
    if (acc >= step) { out.push(fine[i]); acc = 0; }
  }
  const last = fine[fine.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}
/** parallel line at distance d (positive = left of the direction of travel) */
function offset(p: Pt[], d: number): Pt[] {
  return p.map((q, i) => {
    const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return [q[0] + (dy / l) * d, q[1] - (dx / l) * d];
  });
}
/** smooth path through points: Catmull-Rom converted to cubic Béziers */
function smooth(p: Pt[], move = true): string {
  let s = move ? `M${f(p[0][0])} ${f(p[0][1])}` : '';
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    s += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return s;
}
const wavePts = (x0: number, x1: number, lift: number, step = 12): Pt[] => {
  const p: Pt[] = [];
  for (let x = x0; x < x1; x += step) p.push([x, wy(x) + lift]);
  p.push([x1, wy(x1) + lift]);
  return p;
};
const circlePath = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0`;
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const rad = (a: number) => (a * Math.PI) / 180;
  return `M${f(cx + r * Math.cos(rad(a0)))} ${f(cy + r * Math.sin(rad(a0)))}A${r} ${r} 0 0 1 ${f(cx + r * Math.cos(rad(a1)))} ${f(cy + r * Math.sin(rad(a1)))}`;
};

/* ── the band: fine lines fanning out to the right, like on the vouchers ── */
const bandLine = (k: number) => {
  const p: Pt[] = [];
  for (let x = -160; x <= 800; x += 16) p.push([x, wy(x) + k * (2.2 + (3.6 * (x + 160)) / 960)]);
  return smooth(p);
};
export const band = [-7, -6, -5, -4, -3, -2, -1, 0, 2, 3, 4, 5, 6, 7, 8].map(bandLine);
export const bandOrange = bandLine(1.1);

/* ── the pen line on the wave, with one crisp heartbeat ── */
const beatX = 96;
const beat: Pt[] = [[0, 0], [8, -9], [16, -13], [24, -9], [32, 0], [44, 0], [49, 9], [60, -92], [72, 34], [80, 0], [94, 0], [104, -12], [118, -19], [132, -12], [142, 0]]
  .map(([dx, o]) => [beatX + dx, wy(beatX + dx) - 12 + o] as Pt);
export const pulse = smooth(wavePts(-160, beatX, -12)) + beat.slice(1).map(([x, y]) => `L${f(x)} ${f(y)}`).join('')
  + smooth([beat[beat.length - 1], ...wavePts(beatX + 154, 800, -12)], false);

/* ── stethoscope: the two ear tubes draw the heart and meet at its tip ── */
/** the metal connector (yoke) where the ear tubes meet: they arrive side by side, the tube leaves below */
const YOKE = { x: 320.5, y: 440, w: 19, h: 20 };
const left: [Pt, Seg[]] = [[311, 250], [
  [[300, 206], [262, 184], [232, 190]],
  [[196, 197], [178, 240], [188, 284]],
  [[198, 336], [318, 392], [326, YOKE.y + 2]],
]];
const mirror = ([x, y]: Pt): Pt => [660 - x, y];
const right: [Pt, Seg[]] = [mirror(left[0]), left[1].map((s) => s.map(mirror) as Seg)];
const main: [Pt, Seg[]] = [[330, YOKE.y + YOKE.h - 2], [
  [[332, 512], [384, 544], [438, 536]],
  [[468, 532], [488, 516], [500, 496]],
]];
const TUBE = 3.6;
const tube = ([s, segs]: [Pt, Seg[]]) => {
  const c = sample(s, segs);
  return { a: smooth(offset(c, TUBE)), b: smooth(offset(c, -TUBE)), hi: smooth(offset(c, TUBE * 0.35)) };
};
export const tubes = { left: tube(left), right: tube(right), main: tube(main) };
export const yoke = YOKE;

/** ear tips: small olives just past each tube's start, pointing in towards the heart's dip */
export const ears = [circlePath(318, 262, 7.5), circlePath(342, 262, 7.5)];

/** chest piece: stem, outer rim, diaphragm, centre */
export const chest = {
  stem: [
    smooth(offset(sample([500, 496], [[[504, 490], [508, 484], [512, 478]]], 2), 4.2)),
    smooth(offset(sample([500, 496], [[[504, 490], [508, 484], [512, 478]]], 2), -4.2)),
  ],
  rings: [circlePath(534, 450, 38), circlePath(534, 450, 30), circlePath(534, 450, 12)],
  center: { cx: 534, cy: 450 },
};

/* ── accents ── */
export const ripples = [arc(534, 450, 54, -78, 8), arc(534, 450, 68, -74, 4), arc(534, 450, 82, -70, 0)];
export const glow = { cx: 330, cy: 316, r: 96 };
export const pluses = [[118, 268, 8], [590, 300, 7], [178, 128, 6], [470, 150, 7]]
  .map(([x, y, r]) => `M${x - r} ${y}h${2 * r}M${x} ${y - r}v${2 * r}`);
/** corner circles: [cx, cy, r, colour]; orange ones get the light-blue halo, as on the vouchers */
export const circles: [number, number, number, 'o' | 's'][] = [
  [26, 44, 116, 'o'], [34, 50, 130, 's'], [132, 150, 32, 's'],
  [608, 70, 44, 'o'], [578, 112, 24, 's'],
  [92, 600, 26, 's'], [114, 592, 14, 'o'],
];
