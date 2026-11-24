/**
 * Line drawings drawn by the scroll, and undrawn when scrolling back up (brief §6).
 *   <div data-draw data-draw-span="1.6"> <svg>…paths…</svg> </div>
 * Each path gets a share of the scroll proportional to its length, in document order, so the
 * pen moves at one steady speed. data-draw-span = how many screen heights the whole drawing
 * takes (bigger = slower; the drawings memory asks for slower and smoother than the SVG test).
 * Reduced motion / no JS: the drawing is shown complete.
 */
import { gsap, ScrollTrigger, SCRUB } from './core';

const made: gsap.core.Timeline[] = [];

export function buildDraws(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-draw]').forEach((box) => {
    const paths = [...box.querySelectorAll<SVGGeometryElement>('path, line, polyline, circle, ellipse')];
    if (!paths.length) return;
    const lens = paths.map((p) => p.getTotalLength());
    const total = lens.reduce((a, b) => a + b, 0) || 1;
    const span = Number(box.dataset.drawSpan) || 1.6;
    paths.forEach((p, i) => gsap.set(p, { strokeDasharray: lens[i] + 1, strokeDashoffset: lens[i] + 1 }));
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: box, start: 'top 85%', 
        // never longer than the page has left, so the drawing always finishes (never "ciung")
        end: (self: ScrollTrigger) => Math.min(self.start + innerHeight * span, ScrollTrigger.maxScroll(window) - 4), scrub: SCRUB * 2 },
    });
    let at = 0;
    paths.forEach((p, i) => {
      const d = lens[i] / total;
      tl.to(p, { strokeDashoffset: 0, duration: d }, at);
      at += d;
    });
    made.push(tl);
  });
}

export function killDraws() {
  made.splice(0).forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
}
