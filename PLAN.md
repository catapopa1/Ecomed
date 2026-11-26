# PLAN.md · medicinadefamilieoradea.ro

**Status:** DRAFT for Cata's review (24 Nov 2026). This is the plan we tick off together, step by step.

**Order:** Setup (S) → A Design system → B Hero → C Header/footer → D Home → E Other pages, one at a time → Q SEO & QA → L Deploy.

**Responsive rule (Cata, 24 Nov 2026): EVERYTHING scales to the screen.**
- Cata tests on a 27" monitor, a 13" and a 16" MacBook, an iPhone 15 Pro Max, and the browser's phone sizes.
- **Desktop must look identical on every desktop size**, and **phone identical on every phone size**: the same composition, proportions and line breaks, only scaled.
- So the layout uses fluid units (a design scale based on the viewport, `clamp()`/`vw`/`dvh`), not fixed px blocks that leave empty space on 27" or crowd 13".
- Every step is checked on all of these sizes before „Show Cata”.

**Rules for every task:**
- Every design step ends with **Show Cata, wait for OK**.
- Nothing is built ahead of the step Cata has started.
- Subagents only for independent sub-tasks inside the current step, marked **Subagent: yes**.
- SEO values (slugs, titles, metas, H1s, schema, redirects) come from `SEO.md`.

**Task fields:** Goal · Files · Inputs · Done when · Depends on · Subagent.

Materials path, written as `M/` below: `~/Documents/Promovare_Ecomed/06_Website/materiale_site/`.

---

## 1. Decisions for Cata

**Settled by Cata (24 Nov 2026):**
- **4 main pages:** Medicină de familie, Kinetoterapie (includes recuperare), Terapii beauty, Vouchere.
- **Servicii page:** everything, in order of importance.
- **Auxiliary service pages:** built later, once the owner's services list arrives.
- **Menu:** split Servicii link + arrow panel, like nestos (details in SEO.md §6).

The SEO-side defaults (home H1, seasonal date, blog set) are in `SEO.md` §1. Plan-side questions:

| # | Question | My recommendation |
|---|---|---|
| P1 | "Page transitions like popa-insolventa": popa has **no** page router. Its card effect is the in-page deck. Do we want (a) the card effect **inside** pages only, like popa, or (b) **also between pages**, using Astro's ClientRouter like dataexpert/nestos? | Build (a) first (S11). Decide (b) in C5, after you've seen the lab. The engine supports both. |
| P2 | Forms: PHPMailer over SMTP on the clinic's cPanel (nestos pattern), or a form service? | **PHPMailer**: no third party gets patient messages (GDPR), and it's free. |
| P3 | Analytics: GA4 + Consent Mode v2 + cookie banner (as in the brief)? | Yes, as briefed. GA loads only after consent. |
| P4 | Drawings: how we make clean single-stroke SVGs (see S10). | Decided in S10(b) on 2 test drawings. |

---

## 2. Open TODOs and what they block

| # | TODO (ask Cata / owner) | Blocks |
|---|---|---|
| T1 | **Owner's current services list** (incl. Neurofeedback, Laser HPL, Soundsory, Forbrain) | E13 (all auxiliary pages), the auxiliary part of E2 and of the menu (C1) |
| T2 | Home video: which one | B1/B2 video slot, D1, home clip in S9 |
| T3 | Clean group clips without burned-in text | S9 (else we crop or mask, decided with Cata) |
| T4 | The 9 voucher review points (wording #9, promo prices of #11/#13 options, missing durations, VIP +1 meaning, crioterapie price, 22 vs 23 packages, …) | S2 → S5, E5, E14–E18 |
| T5 | Postal code, geo coordinates, CUI / Reg. Com. | S3 → schema, footer, Contact, privacy page |
| T6 | Logo (text logo until then) | C1 (not blocking) |
| T7 | SMTP mailbox on the clinic's domain (cPanel) | S12 → E19, E20 |
| T8 | GA4 property + Search Console access | Q9, L5, L6 |
| T9 | Înscriere/transfer request form file (the old site's download link was broken) | E19 (section on Medicină de familie) |
| T10 | Rest of Bodogai Anca's description; staff consent for the website | E17 |
| T11 | Which ecografii exactly (only „ecografie generală” is confirmed) | E4 |
| T12 | Current CNAS packages and free certificates list (old site text is from 2023) | E3 |
| T13 | Prices for services without vouchers (consultation, ecografie, investigations, kineto sessions), or confirm "no prices shown" | E3, E4, E13 (default: no price, call CTA) |
| T14 | Blog byline: author / medical reviewer | E21, E22 |
| T15 | Xcode licence (`sudo xcodebuild -license accept`), needed for `brew install ffmpeg` | S7 → S9 |
| T16 | Old "Ecomed" Maps listing: who owns it | L7 |
| T17 | Reference sites for scroll and entry/exit animations | A5 |
| T18 | Directory list for citations | after launch |

---

## 3. Phase S · Setup

### Done

- [x] **S0 · Astro init.** Commit `0f06688`.
  - Astro 7.3.x (7.4 needs Node ≥ 22.23.4), Tailwind v4, sitemap, GSAP, Lenis, sharp, `astro check`.
  - `trailingSlash: 'always'`, dev port 4410.
- [x] **S1 · Old site snapshot** in `_legacy/`: 10 URLs, texts, headings, images.
- [x] **S2a · Voucher dataset draft:** `src/data/vouchers.ts`, 22 vouchers in 7 groups, 9 review points open (T4).
- [x] **S10a · SVG tracing test** (`_lab/svg-test/`, uncommitted). Result: traced strokes come out "ciungi". New direction is saved: not 1:1 copies, 7 drawings on the hub, simpler ones per group page, smoother and slower.

### To do

- [ ] **S2 · Final voucher dataset**
  - **Goal:** resolve T4, remove the `todo` fields, use the final group slugs from SEO.md.
  - **Files:** `src/data/vouchers.ts`
  - **Inputs:**
    - voucher backs `M/vouchere/*/…_spate_fizic.jpg`;
    - FACTS §4–5;
    - promo slides `21_promo_sarbatori_16nov`, `22_vouchere_17nov`, `zz_vouchere_pret_normal_dupa_7ian`.
  - **Done when:**
    - no `todo`/`TODO` left;
    - every price, session count and duration matches a back image;
    - `astro check` passes.
  - **Depends on:** T4 · **Subagent:** no

- [ ] **S3 · Site constants**
  - **Goal:** one source for NAP, hours, socials, legal data and promo dates.
  - **Files:** `src/consts.ts`
  - **Inputs:** FACTS §1–2, SEO.md §8.
  - **Done when:**
    - strings are identical to SEO.md §8;
    - a grep finds no phone, address or hours hard-coded anywhere else in `src/`.
  - **Depends on:** SEO.md approved, T5 (can start with TODO values) · **Subagent:** no

- [ ] **S4 · SEO data, Seo component, bare base layout**
  - **Goal:** every page reads title, meta, H1, breadcrumb and schema from one data file.
  - **Files:**
    - `src/data/pages.ts` (the SEO.md §4 data);
    - `src/components/Seo.astro`;
    - `src/lib/schema.ts` (`@graph` builder);
    - `src/layouts/BaseLayout.astro` (html `lang="ro"`, head, slot, **no visual design**);
    - `tools/check-seo.mjs`.
  - **Inputs:** SEO.md §4, §7; dataexpert `Seo.astro` pattern.
  - **Done when:**
    - a test page outputs correct title, meta, canonical, OG and JSON-LD;
    - validator.schema.org shows 0 errors;
    - `npm run check:seo` fails the build on a title > 60, a meta > 160, a duplicate title or a cedilla ş/ţ.
  - **Depends on:** S3 · **Subagent:** no

- [ ] **S5 · Promo switch**
  - **Goal:** the Christmas promo turns on or off from one value, and stays correct after 7 Jan even without a rebuild.
  - **Files:** `src/config/promo.ts`, `src/lib/price.ts`, a small inline guard script.
  - **Inputs:** FACTS §5, promo fields in `vouchers.ts`.
  - **Done when:**
    - `enabled: false` → no banner, promo price or promo schema anywhere in `dist/`;
    - `enabled: true` → promo shown with `priceValidUntil 2027-01-07`;
    - with the clock past 2027-01-07 23:59 (Europe/Bucharest), the guard hides the banner and promo prices without a rebuild (both prices are in the HTML).
  - **Depends on:** S2 · **Subagent:** no

- [ ] **S6 · Content model**
  - **Goal:** services as typed data, blog as a content collection.
  - **Files:**
    - `src/data/services.ts`: per page, the intro, sections, FAQ, related vouchers and drawing id;
    - `src/content.config.ts`: blog fields title, description, date, updated, image, reviewer, relatedPages;
    - `src/content/blog/`.
  - **Done when:**
    - `astro check` passes;
    - a sample article builds;
    - a missing required field fails the build.
  - **Depends on:** S4 · **Subagent:** no

- [ ] **S7 · Media toolchain**
  - **Goal:** `ffmpeg` works locally.
  - **Inputs:** Cata runs `sudo xcodebuild -license accept`, then `brew install ffmpeg`.
  - **Done when:** `ffmpeg -version` runs.
  - **Depends on:** T15 · **Subagent:** no

- [ ] **S8 · Image pipeline**
  - **Goal:** optimised web masters in the repo. Astro makes the AVIF/WebP sizes.
  - **Files:** `src/assets/{staff,clinica,vouchere}/`, `tools/images/resize.py`.
  - **Inputs:**
    - `M/staff/`: colour and sharpening only, **no face retouching**;
    - `M/clinica/`;
    - `M/vouchere/` fronts and backs.
  - **Done when:**
    - masters are ≤ 2400 px on the long edge and ≤ 600 KB each;
    - originals stay outside the repo;
    - file names are descriptive in Romanian ASCII;
    - a test `<Picture>` outputs AVIF + WebP with width and height set (no layout shift).
  - **Depends on:** — · **Subagent:** yes

- [ ] **S9 · Video pipeline**
  - **Goal:** the 7 group clips and the ecografie clip as light web loops.
  - **Files:**
    - `public/video/<group>.{mp4,webm}` + posters;
    - `tools/video/encode.sh`;
    - `src/components/LoopVideo.astro` (the styling comes after A).
  - **Inputs:**
    - `M/video/openers_all_v8g.mp4`: 7 × ~5 s, group order as in FACTS §4; burned-in text at the bottom (clean area above y≈660, see T3);
    - `M/clinica/clip_ecografie.mp4`.
  - **Done when:**
    - each clip is muted and ≤ 6 s;
    - each comes as 720p MP4 (H.264, `+faststart`) + WebM (VP9), ≤ 1 MB per file;
    - poster frame in AVIF + JPG;
    - `playsinline muted loop` works on iOS;
    - `preload="none"`, loaded only near the viewport and paused off-screen;
    - with `prefers-reduced-motion`, only the poster shows.
  - **Depends on:** S7, T3 · **Subagent:** yes (encoding)

- [ ] **S10 · Line drawings** (direction saved after the SVG test)
  - **Goal:** clean, whole, continuous single-stroke SVG drawings: elements throughout the pages, inspired by the voucher art, not 1:1 copies.
  - **Steps:**
    - (a) **Inventory:** which drawing goes where:
      - **7 new group designs** (one per group page), drawn to match the voucher designs;
      - the real voucher designs themselves are shown as images (fronts), not redrawn;
      - big background drawings on service pages;
      - home;
      - small scattered elements.
    - (b) **Style test** on 2 drawings, using the approach that gives whole strokes (hand-built paths, traced only as reference) → **Show Cata, wait for OK.**
    - (c) **Produce the set.**
  - **Files:** `src/drawings/*.svg` (inlined via a `Drawing.astro` component). The `_lab/svg-test/` and `tools/drawings/centerline.py` experiment is deleted after (b).
  - **Inputs:** `M/desene/*.png` (reference only), stroke colour and width from A.
  - **Done when:**
    - no stubby or broken strokes;
    - every path is continuous;
    - normalised viewBox;
    - colours via CSS variables;
    - ≤ 25 KB per file;
    - Cata approves the slower, smoother draw/undraw in the S11 lab.
  - **Depends on:** A3 (stroke style), S11 (draw primitive) · **Subagent:** yes for (c), once (b) is approved

- [ ] **S11 · Motion engine** (primitives only; the feel is tuned in A5/B)
  - **Goal:** reusable scroll and animation primitives.
  - **Files:** `src/scripts/motion/{core,smooth,reveal,deck,draw,index}.ts`, a dev-only lab page.
  - **Inputs:**
    - dataexpert `motion/`: Lenis duration 1.1, expo-out, syncTouch on coarse pointers, GSAP ticker;
    - popa `scenes.ts` + `pager.ts`: sticky deck, cards arriving from any side or diagonal, the card underneath tilts back and dims, phone pager;
    - the drawings memory: slower, smoother.
  - **Contents:**
    - smooth scroll;
    - section entry/exit reveals;
    - the deck;
    - scroll-scrubbed stroke draw/undraw, each path's span proportional to its length;
    - reduced-motion fallback;
    - safe re-init if C5 adds ClientRouter.
  - **Done when:**
    - the lab page shows each primitive on desktop and phone;
    - `prefers-reduced-motion: reduce` → no smooth scroll, no scrubbing, drawings shown complete, all content visible;
    - with no JS, all content is visible;
    - no long tasks > 50 ms while scrolling at 4× CPU throttle;
    - no duplicate ScrollTriggers after 10 page navigations (if C5 uses the router).
  - **Depends on:** — (P1 only affects C5) · **Subagent:** no

- [ ] **S12 · Forms backend**
  - **Goal:** the interactive Contact form sends to **cmgenmed@yahoo.com** from the clinic's cPanel.
  - **Files:**
    - `public/contact.php`;
    - `public/lib/PHPMailer/`;
    - `public/contact.config.example.php`;
    - `public/contact.config.php` (**git-ignored**, server only).
  - **Inputs:** nestos `contact.php` pattern, T7 mailbox.
  - **Done when:**
    - mail goes over SMTP **from the domain mailbox**, with Reply-To set to the patient (Yahoo's DMARC rejects mail that claims to be "from yahoo.com" but comes from another server);
    - honeypot, a time check and a simple rate limit are in place;
    - responses are JSON, with Romanian validation messages;
    - a GDPR consent checkbox is required;
    - the form asks no health details;
    - the config file is denied by `.htaccess`;
    - a test message reaches the inbox, not spam.
  - **Depends on:** P2, T7 · **Subagent:** yes

---

## 4. Phase A · Design system

Load `ui-ux-pro-max` for desktop and `mobile-native` for phone. Options only: Cata decides.

- [ ] **A1 · Theme directions**
  - **Goal:** 2–3 options inside the brief:
    - light-blue base;
    - **a lot of orange**;
    - dark navy;
    - as little #2953E8 as possible;
    - some mauve;
    - mauve + light-blue gradients;
    - backgrounds and accents.
  - **Files:** `_lab/design/` (static boards, desktop + phone).
  - **Inputs:** brief §6, FACTS §10, reference sites.
  - **Done when:** **Show Cata, wait for OK.**
  - **Depends on:** — · **Subagent:** no

- [ ] **A2 · Fonts**
  - **Goal:** 3–4 pairings; Cata chooses.
  - **Done when:**
    - the chosen fonts have comma-below ș ț + ă â î in every weight used;
    - self-hosted woff2 (Fontsource), latin-ext subset, ≤ 2 families, critical files preloaded.
    - **Show Cata, wait for OK.**
  - **Depends on:** A1 · **Subagent:** no

- [ ] **A3 · Tokens**
  - **Goal:** colours, gradients, a **fluid** type and spacing scale (desktop scales with the viewport so 13", 16" and 27" look identical; same for phones), radii and shadows as Tailwind v4 `@theme` tokens.
  - **Files:** `src/styles/global.css`, `src/styles/tokens.css`.
  - **Done when:**
    - body text contrast ≥ 4.5:1, large text ≥ 3:1;
    - **prices are always orange**, but #FD9E01 on white is about 2:1. A3 shows the options (a darker orange for text on light backgrounds, orange on navy, an orange pill) and Cata picks;
    - **Show Cata, wait for OK.**
  - **Depends on:** A1, A2 · **Subagent:** no

- [ ] **A4 · Components: glass, buttons, icons, text styles**
  - **Goal:**
    - liquid glass and opaque glass surfaces;
    - buttons: call CTA, primary, secondary;
    - icon style matched to the drawings;
    - centred text styles;
    - price style.
  - **Files:** `src/components/ui/*`.
  - **Done when:**
    - glass has a solid fallback (no `backdrop-filter`, or `prefers-reduced-transparency`);
    - ≤ 3 blurred layers per phone screen;
    - touch targets ≥ 44 px;
    - visible focus;
    - **Show Cata, wait for OK.**
  - **Depends on:** A3 · **Subagent:** no

- [ ] **A5 · Motion language**
  - **Goal:** durations, easings, entry/exit styles, deck directions and drawing speed (slower and smoother than the SVG test).
  - **Inputs:** S11 lab, T17 references.
  - **Done when:** **Show Cata, wait for OK.**
  - **Depends on:** S11 · **Subagent:** no

- [ ] **A6 · Design system page**
  - **Goal:** one dev-only page with every token and component, desktop + phone. It is not emitted in the production build.
  - **Done when:** Cata approves it on desktop and on his own phone. **Show Cata, wait for OK.**
  - **Depends on:** A1–A5 · **Subagent:** no

---

## 5. Phase B · Hero

- [ ] **B1 · Hero options**
  - **Goal:** 2–3 variants (desktop + phone) in the spirit of dataexpertfiscal.ro and popa-insolventa.ro, with:
    - the H1 from SEO.md (D4);
    - the call CTA + a second CTA;
    - a promo pill slot;
    - drawings;
    - a video slot (T2).
  - **Done when:** **Show Cata, wait for OK.**
  - **Depends on:** A · **Subagent:** no

- [ ] **B2 · Build the chosen hero**
  - **Files:** `src/components/home/Hero.astro`.
  - **Done when:**
    - the LCP element is text or a preloaded optimised image;
    - readable without JS;
    - reduced-motion fallback works;
    - Lighthouse mobile LCP < 2.5 s, CLS < 0.05;
    - **Show Cata, wait for OK.**
  - **Depends on:** B1, S4 · **Subagent:** no

---

## 6. Phase C · Header and footer

- [ ] **C1 · Header** (desktop + phone options)
  - **Goal:**
    - nav per SEO.md §6 (Cata's pattern, like nestos):
      - the Servicii label links to the hub, and an arrow opens the panel;
      - the panel lists the 3 main services, a Vouchere link, an expandable „Servicii auxiliare” list and „Toate serviciile”;
      - Vouchere is also a top-level link;
    - phone CTA always visible;
    - text logo (T6);
    - promo banner slot;
    - phone menu: safe areas, no scroll bleed, focus trap, Esc closes.
  - **Done when:** **Show Cata, wait for OK.**
  - **Depends on:** A · **Subagent:** no

- [ ] **C2 · Footer**
  - **Goal:**
    - NAP from `consts.ts`, hours, map link, socials;
    - every service link, generated from the page list;
    - legal links;
    - automatic year.
  - **Done when:** **Show Cata, wait for OK.**
  - **Depends on:** A, S3 · **Subagent:** no

- [ ] **C3 · Promo banner**
  - **Goal:** the S5 switch made visible; dismissible for the session.
  - **Done when:** **Show Cata, wait for OK.**
  - **Depends on:** S5, C1 · **Subagent:** no

- [ ] **C4 · Phone call/book path**
  - **Goal:** options: a sticky bottom bar vs the header button only. The call CTA is always within one screen.
  - **Done when:** **Show Cata, wait for OK.**
  - **Depends on:** C1 · **Subagent:** no

- [ ] **C5 · Page-to-page transition** (P1)
  - **Goal:** keep in-page only, or add the card transition between pages (ClientRouter).
  - **Done when:**
    - no broken scripts after navigation;
    - Back/Forward work;
    - focus moves to the new page;
    - **Show Cata, wait for OK.**
  - **Depends on:** S11, P1 · **Subagent:** no

---

## 7. Phase D · Home

- [ ] **D1 · Structure**
  - **Order (Cata, 25 Nov 2026):** Hero → Servicii (3 main + extra strip) → Vouchere → Video → Echipa → Recomandările noastre → Program și locație → footer.
  - **Scroll:** a pinned stage (`src/scripts/motion/stage.ts`) with a different transition at each boundary; test board `/dev/d/`.
  - **Goal:** decide together:
    - the sections and their order;
    - which card enters from which side or corner;
    - the drawings;
    - the video slot (T2);
    - how the phone version scrolls (popa pager or normal scroll).
  - **Done when:** **Show Cata, wait for OK.**
  - **Depends on:** B, C · **Subagent:** no

- [ ] **D2 · Build desktop**
  - **Files:** `src/pages/index.astro`, `src/components/home/*`.
  - **Done when:** **Show Cata, wait for OK.**
  - **Depends on:** D1 · **Subagent:** no

- [ ] **D3 · Build phone**
  - **Done when:** checked on a real phone. **Show Cata, wait for OK.**
  - **Depends on:** D2 · **Subagent:** no

- [ ] **D4 · Copy + SEO**
  - **Goal:** texts from:
    - FACTS: the 2017 story, the 3 main services, the §8 prevention messages;
    - links to the 4 main pages, Servicii, Contact;
    - home schema.
  - **Done when:** Page DoD (§8). **Show Cata, wait for OK.**
  - **Depends on:** D3 · **Subagent:** no

---

## 8. Phase E · Other pages, one at a time

Order from the brief: Servicii + the 3 main pages → Vouchere + 7 groups → Despre noi → Cadouri → Contact (+ the înscriere section) → Blog → Confidențialitate.

**Page Definition of Done (DoD), applies to D4 and every E task:**
1. **Copy sources:**
   - only FACTS, the voucher backs, our approved captions or legacy text (rewritten);
   - missing facts become `TODO (ask Cata)`, and 0 are left at launch.
2. **Language:** Romanian, comma-below ș ț (script: no ş ţ), *dumneavoastră*.
3. **Claims:** the banned-claims script finds 0 hits for „permanent”, „definitiv”, „revoluționar”, „garant”, „vindecă”.
4. **SEO:** title, meta, H1, links and schema match SEO.md §4, and the schema validates.
5. **Prices:** only through `vouchers.ts` + the promo helper, always orange.
6. **Call CTA:** within one screen on phone.
7. **Checks:** identical look at 13" / 16" / 27" desktop and on iPhone 15 Pro Max + browser phone sizes (responsive rule), reduced motion, readable with no JS.
8. **Lighthouse mobile:** Performance ≥ 90, SEO 100, Accessibility ≥ 95, Best Practices 100.
9. **Show Cata, wait for OK.**

### Services

- [ ] **E1 · Service page template** (shared by the 3 main pages and, later, the auxiliary pages)
  - **Goal:**
    - a big background drawing that draws and undraws on scroll;
    - sections arriving with pictures, texts and icons, each with its drawing;
    - FAQ, related vouchers, CTA.
  - **Done when:** options shown. **Show Cata, wait for OK.**
  - **Depends on:** A–C, S6, S10, S11 · **Subagent:** no

- [ ] **E2 · `/servicii/`**
  - **Goal:** every service, in order of importance:
    1. the 3 main pages;
    2. Vouchere;
    3. the auxiliary services.
  - **Inputs:** SEO.md §3. Before T1 arrives, the auxiliary part lists only what FACTS confirms (ecografie, EKG, Holter TA, osteodensitometrie, la domiciliu, laser), with no links until their pages exist.
  - **Depends on:** E1 · **Subagent:** no

- [ ] **E3 · `/medicina-de-familie/`** (main page 1)
  - **Inputs:**
    - FACTS §6–8 (incl. ecografie, EKG, Holter TA, osteodensitometrie as sections until they get their own pages);
    - legacy `/servicii/` and `/despre-noi/` (CNAS packages, certificates: T12);
    - captions `17_test_rapid`, `23_ecografie`.
  - **Depends on:** E1, T12, T13 · **Subagent:** no

- [ ] **E4 · `/kinetoterapie/`** (main page 2: kinetoterapie + recuperare medicală)
  - **Inputs:**
    - FACTS §3 (Dr. Baiduca, Bodogai Anca, Gelnic Corina);
    - the devices named on the voucher backs;
    - home physio (caption `17b_domiciliu`, VIP vouchers);
    - vouchers in the durere, recuperare and picioare groups.
  - **Depends on:** E1 · **Subagent:** no

- [ ] **E5 · `/terapii-beauty/`** (main page 3: corp and față)
  - **Inputs:**
    - vouchers #1–#8 and #4.1, #9;
    - captions `03_abdomen`, `11_fese_coapse`, `07_ten`, `16_lifting`, `15_laser`.
  - **Depends on:** E1, S2 · **Subagent:** no

- [ ] **E13 · Auxiliary service pages** (later)
  - **BLOCKED** by T1.
  - **Goal:** once the owner's list arrives:
    1. update SEO.md (slugs, keywords; the provisional slugs are a starting point);
    2. build each page from the E1 template, one at a time, each shown to Cata;
    3. add it to the menu's „Servicii auxiliare” list, the Servicii page, the footer and the sitemap;
    4. link it from its main page.

### Vouchers

- [ ] **E14 · `/vouchere/` hub**
  - **Goal:**
    - the **real voucher designs** (fronts from `M/vouchere/`);
    - group cards;
    - promo;
    - how to buy (reception or phone);
    - valid 12 months, for yourself or as a gift.
  - **Done when:** DoD.
  - **Depends on:** S2, S5, S10 · **Subagent:** no

- [ ] **E15 · Voucher group template**
  - **Goal:**
    - the group's video clip;
    - the group's **new design** (one of the 7, matching the voucher style);
    - the **real voucher fronts** of the group (images);
    - separately, per voucher: **price and details**, with each included service listed as a **FAQ-style dropdown** explaining it (`button` + `aria-expanded`, details already in the HTML, slow dropdown tokens);
    - previous/next group.
  - **Done when:** **Show Cata, wait for OK.**
  - **Depends on:** E14, S9 · **Subagent:** no

- [ ] **E16 · The 7 group pages**
  - **Goal:** pages generated from the template, each with its own copy. Groups that own treatment keywords (picioare, durere, recuperare) also get treatment sections and a FAQ.
  - **Done when:** DoD, with each group shown to Cata separately.
  - **Depends on:** E15 · **Subagent:** copy drafts only

### Clinic and other pages

- [ ] **E17 · `/despre-noi/`**
  - **Inputs:**
    - `M/staff/`: no face retouching;
    - titles exactly as in FACTS §3;
    - team photo `echipa.jpg`;
    - 2017 story and the TV video texts.
  - **Depends on:** S8, T10 · **Subagent:** no

- [ ] **E18 · `/cadouri-de-sarbatori/`**
  - **Goal:** gift-focused copy and promo, with a normal-price version after 7 Jan.
  - **Depends on:** E14, S5 · **Subagent:** no

- [ ] **E19 · Înscriere section on `/medicina-de-familie/`**
  - **Goal:** the steps and documents from the legacy `/inscrieri/` page (rewritten) as a section of main page 1, with a CTA that opens the Contact form with „Medicină de familie” preselected. The transfer request file depends on T9.
  - **Depends on:** E3, T9 · **Subagent:** no

- [ ] **E20 · `/contact/` + interactive request form**
  - **Goal:**
    - a step-by-step conversation, **not a normal form**, one question per screen/card:
      1. „De ce aveți nevoie?”: Medicină de familie · Kinetoterapie · Terapii beauty · Informații · Vouchere;
      2. name;
      3. email;
      4. phone;
      5. GDPR consent, then send;
    - back/edit on every step, progress indicator, keyboard (Enter = next) and screen-reader friendly;
    - works without JS as a plain fallback form;
    - deep links preselect the need (e.g. `/contact/?nevoie=vouchere` from the voucher pages);
    - plus click-to-load map with a plain Maps link, hours, phone, the „Programarea dumneavoastră contează” message (FACTS §8).
  - **Done when:** DoD; a real submission reaches cmgenmed@yahoo.com with the chosen need in the subject line. **Show Cata, wait for OK.**
  - **Depends on:** S12, A · **Subagent:** no

- [ ] **E21 · Blog index + article template**
  - **Goal:** author/reviewer box, related services, date.
  - **Depends on:** S6, T14 · **Subagent:** no

- [ ] **E22 · The 9 launch articles** (SEO.md §5)
  - **Done when:** each article is reviewed by Dr. Teușdea before it goes live.
  - **Depends on:** E21 · **Subagent:** yes (one per article, drafting only)

- [ ] **E23 · Privacy, cookies, consent banner**
  - **Goal:**
    - the texts reflect what is actually processed: forms, GA4, Maps;
    - operator SC General Medicine Practice SRL (CUI: T5);
    - banner declines by default, with Consent Mode v2.
  - **Done when:** no GA request before consent. Owner/legal review recommended.
  - **Depends on:** P3, T5 · **Subagent:** no

- [ ] **E24 · 404 page**
  - **Goal:** links to the main pages + call CTA, served via `ErrorDocument` with a real 404 status.
  - **Depends on:** C · **Subagent:** no

---

## 9. Phase Q · SEO & QA

- [ ] **Q1 · Schema**
  - **Goal:** every page type passes the Rich Results Test + validator.schema.org with 0 errors.
  - **Subagent:** yes

- [ ] **Q2 · Sitemap + robots**
  - **Goal:** `sitemap-index.xml` lists every indexable URL and no 404 or dev pages; `robots.txt` has the Sitemap line.
  - **Subagent:** yes

- [ ] **Q3 · `public/.htaccess`**
  - **Goal:**
    - https + apex;
    - the 301 table and 410s from SEO.md §9;
    - `ErrorDocument 404`;
    - `Options -Indexes`;
    - `contact.config.php` and dotfiles denied;
    - caching: 1 year immutable for `/_astro/*` and fonts, 30 days for images/video, no-cache for html/xml/txt;
    - deflate (brotli if the host has it);
    - security headers: nosniff, Referrer-Policy, Permissions-Policy, and HSTS after https is verified.
  - **Done when:** `tools/check-redirects.sh` passes against a local Apache (Docker `httpd`) and later against production.
  - **Subagent:** partly

- [ ] **Q4 · Performance**
  - **Goal:**
    - every template scores Lighthouse mobile ≥ 90;
    - motion JS ≤ ~70 KB gzip;
    - ≤ 2 preloaded font files;
    - no render-blocking third parties;
    - videos lazy.
  - **Subagent:** yes

- [ ] **Q5 · Accessibility**
  - **Goal:**
    - keyboard use, visible focus, skip link, landmarks;
    - Romanian alt text;
    - contrast, prices included;
    - form labels and errors;
    - aria on cards and menu;
    - reduced motion;
    - 200% zoom.
  - **Subagent:** yes

- [ ] **Q6 · Real phones** (iPhone Safari + Android Chrome)
  - **Goal:** the `mobile-native` checklist:
    - `100dvh`, safe areas;
    - inputs ≥ 16 px (no zoom on focus);
    - no sticky hover or tap flash;
    - `tel:` links work;
    - scroll locking in menus.
  - **Subagent:** no

- [ ] **Q7 · Content QA scripts**
  - **Goal:**
    - no cedilla characters;
    - 0 banned claims;
    - 0 `TODO`s;
    - NAP consistent;
    - every price rendered from data;
    - „Teușdea” spelled with ș.
  - **Subagent:** yes

- [ ] **Q8 · Browsers**
  - **Goal:** Safari macOS/iOS (`-webkit-backdrop-filter`), Chrome, Firefox, Samsung Internet.
  - **Subagent:** yes

- [ ] **Q9 · Analytics + consent**
  - **Goal:** no GA request before consent; the `tel_click`, `form_submit` and `voucher_open` events fire.
  - **Depends on:** T8 · **Subagent:** no

---

## 10. Phase L · Deploy

- [ ] **L1 · Backup the old site first**
  - **Goal:** Cata downloads a full cPanel backup (files + WordPress database) and keeps it offline. The `_legacy/` snapshot is already in the repo.
  - **Done when:** the archive exists and the restore steps are written down.

- [ ] **L2 · Release build**
  - **Goal:** `npm run check && npm run build`.
  - **Done when:** the Q checklist is green and the TODO count is 0.

- [ ] **L3 · Upload**
  - **Goal:**
    - move the WordPress files out of `public_html` into a dated folder outside the web root (moved, not deleted);
    - upload the contents of `dist/`;
    - upload `contact.config.php` separately.
  - **Done when:** the new site is served, `/wp-admin/` returns 410, and the config file is unreachable.

- [ ] **L4 · Production checks**
  - **Goal:**
    - the redirect script;
    - a real form test to cmgenmed@yahoo.com;
    - HTTPS;
    - 404;
    - sitemap;
    - Lighthouse.

- [ ] **L5 · Search Console**
  - **Goal:**
    - domain property (DNS TXT);
    - submit `sitemap-index.xml`;
    - request indexing for home, the 4 main pages and the seasonal page;
    - watch the Pages report for a week.

- [ ] **L6 · GA4 live**
  - **Goal:** consent verified on production.

- [ ] **L7 · Google Business Profile**
  - **Goal:** create and verify the new listing per SEO.md §11. Cata/the owner do the verification steps.
  - **Depends on:** T16

- [ ] **L8 · Handover**
  - **Goal:** the README covers:
    - deploying;
    - switching the promo;
    - adding an article;
    - removing the seasonal page.

---

## 11. After launch (calendar)

- **8 Jan 2027:**
  - set the promo to `enabled: false`, rebuild, upload;
  - the guard script has already hidden the promo on the date.
- **D5 date (Feb or Mar 2027):**
  - remove `/cadouri-de-sarbatori/`;
  - add the 301 → `/vouchere/`;
  - rebuild, upload.
- **Monthly:** Search Console + GBP review (SEO.md §12); new blog articles from new captions.
