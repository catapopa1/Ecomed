/**
 * Section glows (Section.astro) float by themselves with CSS. This only pauses the animation
 * for sections that are off screen, so the browser animates a handful of layers, not the page.
 * (Scroll-linked drift was removed on 24 Nov 2026: Cata found it laggy.)
 */
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle('is-live', e.isIntersecting);
  }, { rootMargin: '10% 0px' });
  document.querySelectorAll('[data-ground]').forEach((el) => io.observe(el));
}
