/**
 * Smooth scrolling with Lenis, on GSAP's clock (config from dataexpert/nestos: duration 1.1,
 * expo-out, syncTouch on touch screens, a cap on how far a flick can run ahead).
 * Lenis drives the real scroll position, so sticky, anchors, find-in-page and the scrollbar all work.
 * Off with reduced motion.
 */
import Lenis from 'lenis';
import { gsap, ScrollTrigger, motionOK } from './core';

const WHEEL_CAP = 950;
const TOUCH_CAP = 160;

let lenis: Lenis | null = null;
let tick: ((time: number) => void) | null = null;

export const getLenis = () => lenis;

export function initSmooth() {
  if (lenis || !motionOK()) return;
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: window.matchMedia('(pointer: coarse)').matches,
    stopInertiaOnNavigate: true,
    virtualScroll: (e) => {
      if (lenis) {
        const cap = e.event.type.includes('touch') ? TOUCH_CAP : WHEEL_CAP;
        const pending = lenis.targetScroll - lenis.animatedScroll;
        e.deltaY = Math.max(-cap, Math.min(cap, pending + e.deltaY)) - pending;
      }
      return true;
    },
  });
  lenis.on('scroll', ScrollTrigger.update);
  tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}

export function stopSmooth() {
  if (tick) { gsap.ticker.remove(tick); tick = null; }
  if (lenis) { lenis.off('scroll', ScrollTrigger.update); lenis.destroy(); lenis = null; }
}
