# Ecomed

Static Astro rebuild of **medicinadefamilieoradea.ro**, the site of **Clinica Ecomed - Dr. Alina Teușdea** (Oradea).
Plan: `PLAN.md` · keyword map and 301 table: `SEO.md` · old site snapshot: `_legacy/`.

## Commands
Requires Node ≥ 22.12 (Astro is pinned to 7.3.x, same as popa-insolventa; Astro 7.4 needs Node ≥ 22.23.4).

```sh
npm install
npm run dev      # http://localhost:4410
npm run build    # static output in dist/ (upload to public_html on cPanel)
npm run preview
npm run check
```

## Structure
```
src/
  consts.ts            site URL, NAP, hours, social, promo switch. Single source of truth (must match the Google Business Profile)
  data/vouchers.ts     22 vouchers in 7 groups, read off the voucher backs
  layouts/BaseLayout   <html lang="ro">, head, SEO
  components/Seo.astro title/description/canonical/OG (+ JSON-LD, task S5)
  styles/global.css    Tailwind v4 + tokens (step A) + reduced-motion switch
  scripts/motion/      GSAP + ScrollTrigger + Lenis engine (task S9)
  assets/drawings/     line drawings as SVG paths (task S4)
_legacy/               scrape of the old WordPress site (reference only)
```
Raw media (videos, original photos) stays in `~/Documents/Promovare_Ecomed/`; only optimised web versions go in the repo.
