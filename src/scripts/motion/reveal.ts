/**
 * Section entry and exit.
 *
 * Entry (triggered, not scrubbed: the group plays on its own clock when it comes into view):
 *   <div data-reveal="up|blur|zoom|curtain">  … children marked [data-mark] play in order …
 *   Scrolling back above the group plays it backwards, so coming down again replays it.
 * Exit (scrubbed with the scroll, optional): <section data-exit> — its content lifts and fades
 *   as the section leaves the top of the screen, and comes back when scrolling up.
 *
 * No JS / reduced motion: nothing is hidden, because the from-states are set here, by GSAP.
 */
import { gsap, ScrollTrigger, T, EASE_OUT, SCRUB } from './core';

type From = gsap.TweenVars;
export const STYLES: Record<string, From> = {
  up: { y: '2.6rem', opacity: 0 },
  blur: { opacity: 0, filter: 'blur(14px)', y: '0.8rem' },
  zoom: { opacity: 0, scale: 0.92 },
  curtain: { opacity: 0, clipPath: 'inset(0 0 100% 0 round 1.6rem)', y: '1.2rem' },
};

const made: (gsap.core.Timeline | ScrollTrigger)[] = [];

export function buildReveals(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((group) => {
    const style = STYLES[group.dataset.reveal || 'up'] ?? STYLES.up;
    const marks = group.querySelectorAll<HTMLElement>('[data-mark]');
    const targets = marks.length ? [...marks] : [group];
    const to: gsap.TweenVars = { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0 0 0% 0 round 1.6rem)' };
    const keys = Object.keys(style);
    const toVars = Object.fromEntries(Object.entries(to).filter(([k]) => keys.includes(k)));
    const tl = gsap.timeline({ paused: true })
      .fromTo(targets, style, { ...toVars, duration: T.enter, ease: EASE_OUT, stagger: T.stagger, clearProps: 'filter' });
    made.push(tl);
    made.push(ScrollTrigger.create({
      trigger: group, start: 'top 82%',
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.timeScale(1.6).reverse(),
      onEnterBack: () => tl.timeScale(1).play(),
    }));
  });

  root.querySelectorAll<HTMLElement>('[data-exit]').forEach((sec) => {
    const inner = sec.querySelector<HTMLElement>('.section-inner') ?? sec;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: sec, start: 'bottom 75%', end: 'bottom 15%', scrub: SCRUB },
    }).to(inner, { y: '-3rem', opacity: 0, scale: 0.97, ease: 'none' });
    made.push(tl);
  });
}

export function killReveals() {
  made.splice(0).forEach((m) => ('revert' in m ? m.revert() : m.kill(true)));   // kill(true) reverts a ScrollTrigger
}
