/**
 * The deck (idea from popa-insolventa scenes.ts): sections are sticky cards; each next card
 * arrives over the previous one, from its data-from side (right, left, tl, tr, bl, br, or bottom),
 * while the card underneath sinks back, tilts and dims. Everything is scrubbed with the scroll,
 * so scrolling up plays it backwards.
 *
 *   <div data-deck> <section class="deck-card">…</section> <section class="deck-card" data-from="right">… </div>
 *
 * CSS (motion.css) makes the cards sticky. Desktop only; on phones and with reduced motion the
 * cards are ordinary stacked sections.
 */
import { gsap, SCRUB } from './core';

const DIRS: Record<string, [number, number, number]> = {
  right: [1, 0, 4], left: [-1, 0, -4], tl: [-1, -0.6, -8], tr: [1, -0.6, 7], bl: [-1, 0.6, -7], br: [1, 0.6, 8],
};
const made: gsap.core.Timeline[] = [];

export function buildDeck(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-deck]').forEach((deck) => {
    deck.classList.add('deck-on');
    const cards = [...deck.querySelectorAll<HTMLElement>(':scope > .deck-card')];
    cards.forEach((card, i) => {
      if (i === 0) return;
      const prev = cards[i - 1];
      const dim = prev.querySelector<HTMLElement>(':scope > .deck-dim') ?? prev.appendChild(Object.assign(document.createElement('i'), { className: 'deck-dim' }));
      const d = DIRS[card.dataset.from ?? ''];
      const tl = gsap.timeline({
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'top top', scrub: SCRUB },
        defaults: { ease: 'none' },
      });
      if (d) tl.fromTo(card, { xPercent: d[0] * 70, yPercent: d[1] * 40, rotate: d[2] }, { xPercent: 0, yPercent: 0, rotate: 0 }, 0);
      tl.to(prev, { scale: 0.9, rotateX: 6, yPercent: -3, transformOrigin: '50% 0%', ease: 'power1.in' }, 0)
        .fromTo(dim, { opacity: 0 }, { opacity: 0.55, ease: 'power1.in' }, 0);
      made.push(tl);
    });
  });
}

export function killDeck() {
  made.splice(0).forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  document.querySelectorAll('[data-deck]').forEach((d) => d.classList.remove('deck-on'));
}
