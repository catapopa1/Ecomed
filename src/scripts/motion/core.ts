/**
 * The one place GSAP is set up (pattern from dataexpert/src/scripts/motion/core.ts).
 * Every other motion module imports from here, so ScrollTrigger is registered exactly once.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
/* phones show/hide the URL bar while scrolling; without this every trigger re-measures mid-gesture */
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };

/** Scroll-scrubbed timelines trail the scrollbar by this much (expo-out), so wheel steps never show. */
export const SCRUB = 0.6;

/** Motion timing tokens (A5). Seconds, for GSAP. CSS has the same values in tokens.css. */
const q = new URLSearchParams(location.search);   // A5 lab only: ?enter=0.7 to compare speeds
export const T = {
  enter: Number(q.get('enter')) || 1.0,  // a section's content arriving
  stagger: 0.09,     // between marks inside one group
  exit: 0.6,
};
export const EASE_OUT = 'expo.out';

export const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isPhone = () => window.matchMedia('(max-width: 820px)').matches;
