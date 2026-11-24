"""Centerline vectoriser for the Ecomed voucher line drawings.

PNG (RGBA line art) -> layered SVG of single-stroke paths that can be drawn with stroke-dashoffset.
Layers: 'line' (navy/blue figure + decorative circles), 'thin' (the multi-line ribbons), 'accent' (orange).
Also writes potrace-style outline shapes per layer (for the hybrid 'outline revealed by centerline mask').

usage: centerline.py in.png out_prefix
"""
import sys, math, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.morphology import skeletonize, remove_small_objects, closing, disk
import warnings; warnings.filterwarnings('ignore')
from skimage.color import rgb2hsv
import potrace

src, out = sys.argv[1], sys.argv[2]
im = np.array(Image.open(src).convert('RGBA')).astype(np.float32) / 255
H, W = im.shape[:2]
rgb, a = im[..., :3], im[..., 3]
hsv = rgb2hsv(rgb)
hue, sat, val = hsv[..., 0] * 360, hsv[..., 1], hsv[..., 2]

ink = a > 0.35
orange = ink & (((hue <= 50) | (hue >= 345)) & (sat > 0.16) & (val > 0.55))
blue = ink & (hue >= 190) & (hue <= 265) & (sat > 0.22) & ~orange


def clean(m, min_size=40):
    m = closing(m, disk(1)).astype(bool)
    return remove_small_objects(m, min_size=min_size)


masks = {'line': clean(blue), 'accent': clean(orange)}

N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def trace(skel):
    """Skeleton pixels -> list of (polyline[(y,x)...], closed) with junction-aware merging."""
    pts = set(zip(*np.nonzero(skel)))
    nb = {p: [(p[0] + dy, p[1] + dx) for dy, dx in N8 if (p[0] + dy, p[1] + dx) in pts] for p in pts}
    deg = {p: len(v) for p, v in nb.items()}
    junction = {p for p, d in deg.items() if d >= 3}
    # cluster adjacent junction pixels into one node
    node_of, nodes = {}, []
    for j in junction:
        if j in node_of:
            continue
        stack, comp = [j], []
        node_of[j] = len(nodes)
        while stack:
            q = stack.pop(); comp.append(q)
            for r in nb[q]:
                if r in junction and r not in node_of:
                    node_of[r] = len(nodes); stack.append(r)
        nodes.append(comp)
    visited_edge = set()
    edges = []  # dict(path, a, b) a/b node ids or None (endpoint)

    def walk(start, nxt):
        path = [start, nxt]
        visited_edge.add((start, nxt)); visited_edge.add((nxt, start))
        prev, cur = start, nxt
        while cur not in junction and deg[cur] == 2:
            cand = [r for r in nb[cur] if r != prev and (cur, r) not in visited_edge]
            if not cand:
                break
            # prefer 4-neighbours to avoid corner shortcuts
            cand.sort(key=lambda r: abs(r[0] - cur[0]) + abs(r[1] - cur[1]))
            r = cand[0]
            visited_edge.add((cur, r)); visited_edge.add((r, cur))
            path.append(r); prev, cur = cur, r
            if cur == start:
                break
        return path

    starts = [p for p, d in deg.items() if d == 1] + list(junction)
    for s in starts:
        for n in nb[s]:
            if (s, n) in visited_edge:
                continue
            if s in junction and n in junction and node_of[s] == node_of[n]:
                continue
            path = walk(s, n)
            a_ = node_of.get(path[0]); b_ = node_of.get(path[-1])
            edges.append({'path': path, 'a': a_, 'b': b_, 'closed': False})
    # pure cycles (circles) left over
    for p in pts:
        if deg[p] == 2 and not any((p, r) in visited_edge for r in nb[p]):
            path = walk(p, nb[p][0])
            edges.append({'path': path, 'a': None, 'b': None, 'closed': path[0] == path[-1] or len(path) > 20})
    # prune short spurs (endpoint <-> junction)
    edges = [e for e in edges if not (len(e['path']) < 12 and ((e['a'] is None) != (e['b'] is None)))]
    # merge through junctions: pair the most opposite directions
    def direction(e, at_start):
        pth = e['path'] if at_start else e['path'][::-1]
        k = min(len(pth) - 1, 12)
        return np.array(pth[k], float) - np.array(pth[0], float)
    inc = {}
    for i, e in enumerate(edges):
        if e['a'] is not None: inc.setdefault(e['a'], []).append((i, True))
        if e['b'] is not None: inc.setdefault(e['b'], []).append((i, False))
    link = {}
    for nid, lst in inc.items():
        cands = []
        for x in range(len(lst)):
            for y in range(x + 1, len(lst)):
                (i, si), (j, sj) = lst[x], lst[y]
                if i == j: continue
                u, v = direction(edges[i], si), direction(edges[j], sj)
                nu, nv = np.linalg.norm(u), np.linalg.norm(v)
                if nu == 0 or nv == 0: continue
                cands.append((float(u @ v) / nu / nv, lst[x], lst[y]))
        cands.sort()
        used = set()
        for c, p1, p2 in cands:
            if c > -0.55 or p1 in used or p2 in used: continue
            used.add(p1); used.add(p2)
            link[p1] = p2; link[p2] = p1
    done, strokes = set(), []
    for i, e in enumerate(edges):
        if i in done: continue
        # walk backwards to the start of the chain
        cur, at_start = i, True
        seen = {i}
        while (cur, at_start) in link:
            j, sj = link[(cur, at_start)]
            if j in seen: break
            seen.add(j); cur, at_start = j, not sj
        chain, ci, forward = [], cur, at_start
        while True:
            done.add(ci)
            pth = edges[ci]['path'] if forward else edges[ci]['path'][::-1]
            chain.extend(pth if not chain else pth[1:])
            end_key = (ci, not forward)
            if end_key not in link: break
            j, sj = link[end_key]
            if j in done: break
            ci, forward = j, sj
        closed = len(chain) > 20 and math.dist(chain[0], chain[-1]) < 3
        strokes.append((chain, closed or e['closed']))
    return strokes


def rdp(P, eps):
    if len(P) < 3: return P
    a, b = P[0], P[-1]
    ab = b - a; n = np.linalg.norm(ab)
    d = np.abs(ab[0] * (P[:, 1] - a[1]) - ab[1] * (P[:, 0] - a[0])) / n if n else np.linalg.norm(P - a, axis=1)
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(P[:i + 1], eps)[:-1], rdp(P[i:], eps)])
    return np.vstack([a, b])


def to_path(poly, closed):
    P = np.array([(x, y) for y, x in poly], float)
    if len(P) < 4: return None
    sig = 2.2
    mode = 'wrap' if closed else 'nearest'
    P = np.stack([ndi.gaussian_filter1d(P[:, 0], sig, mode=mode), ndi.gaussian_filter1d(P[:, 1], sig, mode=mode)], 1)
    if not closed:  # keep true endpoints
        P[0], P[-1] = np.array([(x, y) for y, x in (poly[0], poly[-1])], float)
    P = rdp(P, 0.7)
    if closed and len(P) > 3:
        P = P[:-1]
    n = len(P)
    if n < 2: return None
    d = f'M{P[0][0]:.1f} {P[0][1]:.1f}'
    rng = range(n) if closed else range(n - 1)
    for i in rng:  # centripetal-ish Catmull-Rom -> cubic Bezier (tension 1/6)
        p0 = P[(i - 1) % n] if (closed or i > 0) else P[i]
        p1, p2 = P[i], P[(i + 1) % n]
        p3 = P[(i + 2) % n] if (closed or i + 2 < n) else P[(i + 1) % n]
        c1 = p1 + (p2 - p0) / 6; c2 = p2 - (p3 - p1) / 6
        d += f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}'
    if closed: d += 'Z'
    return d, len(poly)


COL = {'line': '#233D63', 'thin': '#5b6fc0', 'accent': '#FD9E01'}
layers = {'line': [], 'thin': [], 'accent': []}
stats = {}
for name, m in masks.items():
    dt = ndi.distance_transform_edt(m)
    sk = skeletonize(m)
    strokes = trace(sk)
    for poly, closed in strokes:
        if len(poly) < 14: continue
        w = 2 * float(np.median([dt[p] for p in poly]))
        r = to_path(poly, closed)
        if not r: continue
        lay = 'thin' if (name == 'line' and w < 3.2) else name
        if (lay == 'thin' and len(poly) < 45) or len(poly) < 22:
            continue  # crossing debris
        layers[lay].append((r[0], max(1.2, round(w, 1)), r[1]))
    stats[name] = len(strokes)

def svg_center(anim=False):
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    for lay, items in layers.items():
        s.append(f'<g data-layer="{lay}" stroke="{COL[lay]}">')
        for d, w, ln in sorted(items, key=lambda t: -t[2]):
            s.append(f'<path d="{d}" stroke-width="{w}" pathLength="1"/>')
        s.append('</g>')
    s.append('</svg>')
    return '\n'.join(s)

open(out + '_centerline.svg', 'w').write(svg_center())

# potrace outlines per layer (filled shapes, exact line weights)
def outline_paths(m):
    bm = potrace.Bitmap(~m)
    pl = bm.trace(turdsize=6, alphamax=1.0, opticurve=True, opttolerance=0.2)
    parts = []
    for c in pl:
        st = c.start_point
        d = f'M{st.x:.1f} {st.y:.1f}'
        for seg in c.segments:
            if seg.is_corner:
                d += f'L{seg.c.x:.1f} {seg.c.y:.1f}L{seg.end_point.x:.1f} {seg.end_point.y:.1f}'
            else:
                d += f'C{seg.c1.x:.1f} {seg.c1.y:.1f} {seg.c2.x:.1f} {seg.c2.y:.1f} {seg.end_point.x:.1f} {seg.end_point.y:.1f}'
        parts.append(d + 'Z')
    return ''.join(parts)

outl = {k: outline_paths(v) for k, v in masks.items()}
s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">']
s.append(f'<path data-layer="line" fill="{COL["line"]}" fill-rule="evenodd" d="{outl["line"]}"/>')
s.append(f'<path data-layer="accent" fill="{COL["accent"]}" fill-rule="evenodd" d="{outl["accent"]}"/>')
s.append('</svg>')
open(out + '_potrace.svg', 'w').write('\n'.join(s))
json.dump({'W': W, 'H': H, 'outline': outl,
           'center': {k: [(d, w) for d, w, _ in sorted(v, key=lambda t: -t[2])] for k, v in layers.items()}},
          open(out + '_data.json', 'w'))
print(src.split('/')[-1], {k: len(v) for k, v in layers.items()}, 'raw strokes', stats)
