/**
 * Motion engine boot (S11). Idempotent build/teardown so a client router could rebuild it.
 * Failsafe: global.css never hides anything; all from-states are set by GSAP at build time,
 * so a failed bundle leaves the complete, readable page.
 */
import { ScrollTrigger, motionOK, isPhone } from './core';
import { initSmooth, stopSmooth } from './smooth';
import { buildReveals, killReveals } from './reveal';
import { buildDeck, killDeck } from './deck';
import { buildDraws, killDraws } from './draw';

export function teardown() {
  killReveals(); killDeck(); killDraws();
}

export function build() {
  teardown();
  if (!motionOK()) { stopSmooth(); return; }
  const q = new URLSearchParams(location.search);       // A5 lab switches: ?smooth=0, ?exit=0
  const smooth = q.get('smooth') !== '0';
  if (q.get('exit') === '0') document.querySelectorAll('[data-exit]').forEach((el) => el.removeAttribute('data-exit'));
  if (smooth) initSmooth(); else stopSmooth();
  if (!isPhone()) buildDeck();
  buildReveals();
  buildDraws();
  ScrollTrigger.refresh();
  document.documentElement.classList.add('motion-ready');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
else build();

let w = innerWidth;
addEventListener('resize', () => { if ((w > 820) !== (innerWidth > 820)) { w = innerWidth; build(); } });
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', build);
