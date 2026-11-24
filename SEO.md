# SEO.md · medicinadefamilieoradea.ro

**Status:** DRAFT for Cata's review (24 Nov 2026). Nothing in here is built yet. Once approved, this file is the source for every title, meta, H1, slug and redirect. Pages read these values from one data file and never retype them.

Public text below is Romanian, with comma-below ș/ț and the *dumneavoastră* tone. Character counts were checked by script: titles ≤ 60, metas ≤ 160.

---

## 1. Decisions

**Settled by Cata (24 Nov 2026):**
- **4 main pages:**
  - Medicină de familie;
  - Kinetoterapie (one page, includes recuperare medicală);
  - Terapii beauty (one page, body and face);
  - Vouchere (personal use or gifts).
- **The Servicii page** lists everything in order of importance.
- **Individual service pages** („servicii auxiliare”) come later, once the owner's current services list arrives. Their slugs below are provisional.
- **Menu:** see §6.
- **Short slugs** (`/medicina-de-familie/`, `/kinetoterapie/`, `/terapii-beauty/`, `/vouchere/`, `/servicii/`). The domain already says „medicinadefamilieoradea”. Words in the URL weigh very little; „Oradea” stays in every title and H1, where it counts.
- **No separate Înscriere page.**
  - `/inscrieri/` → 301 to `/contact/`.
  - Contact gets an **interactive request form**: one question at a time, first „De ce aveți nevoie?” (Medicină de familie · Kinetoterapie · Terapii beauty · Informații · Vouchere), then name, email, phone.
  - The înscriere/transfer steps and documents move to a section on Medicină de familie, which owns those keywords.

**Still open, but I go with the default unless Cata says otherwise:**

| # | Question | Default |
|---|---|---|
| D4 | Home H1 | „Medic de familie și recuperare medicală în Oradea” (offer mock). Final in step B. |
| D5 | Seasonal 301 date | 1 Mar 2027 |
| D6 | Blog at launch | the 9 articles in §5 |

---

## 2. Strategy in one screen

**Priority:**
1. Medicină de familie
2. Kinetoterapie / recuperare medicală
3. Terapii beauty
4. Vouchere, for personal use or as gifts

The three services are the SEO pillars, and each has **one strong main page**.

- **Home** takes the head term „medic de familie Oradea” (the domain already matches) and leads to the 4 main pages.
- **`/servicii/`** is the full list, in order of importance:
  1. the 3 main pages;
  2. Vouchere;
  3. all auxiliary services.
- **Auxiliary service pages** are added after the owner's list. Each one links up to its main page.

**Ownership rule (no cannibalisation): one primary keyword = one page.**
- **Main pages** own the broad treatment keywords. Kinetoterapie holds kinetoterapie + recuperare medicală. Terapii beauty holds anticelulitic, facial, lifting, cuperoză, cearcăne.
- **Voucher group pages** own the gift/package keywords.
- **The picioare, durere and recuperare group pages** also own their condition keywords (pinten calcanean, picioare grele, recuperare după operație…). They are written as full treatment pages that sell the vouchers.
- **When an auxiliary page appears later**, it takes over its specific keywords from the main page. The main page keeps the broad term and links down.

**Other rules:**
- **„Oradea”** goes in the title and H1 of every money page.
- **Local signals:** identical NAP (§8), `MedicalClinic` schema, Maps on Contact, the new Google Business Profile (§11).
- **Nothing invented.** Prices render from `src/data/vouchers.ts`. No reviews or ratings anywhere.

---

## 3. URL architecture

```
/                                              Acasă                                (kept)
├─ /servicii/                                  Servicii: everything, by importance  ← 301 from /servicii-medicale/
│
├─ MAIN PAGES
│  ├─ /medicina-de-familie/                    1 · Medicină de familie
│  ├─ /kinetoterapie/                          2 · Kinetoterapie și recuperare medicală
│  ├─ /terapii-beauty/                         3 · Terapii beauty (corp și față)
│  └─ /vouchere/                               4 · Vouchere · 7 drawings, one per group
│     ├─ /vouchere/pachete-corp/
│     ├─ /vouchere/ingrijire-fata/
│     ├─ /vouchere/piele-plagi-cicatrici/
│     ├─ /vouchere/picioare-grele-umflate/
│     ├─ /vouchere/durere-calcai-articulatii-coloana/
│     ├─ /vouchere/recuperare-leziune-operatie/
│     └─ /vouchere/fiziokinetoterapie-domiciliu/
│
├─ /cadouri-de-sarbatori/                      seasonal → 301 to /vouchere/ in 2027
│
├─ SERVICII AUXILIARE · PROVISIONAL (after the owner's services list)
│  ├─ /ecografie/
│  ├─ /investigatii-medicale/                  EKG · Holter TA · osteodensitometrie
│  ├─ /kinetoterapie-la-domiciliu/
│  ├─ /terapie-laser/
│  ├─ /terapii-corp/
│  ├─ /terapii-fata/
│  └─ /neurofeedback/                          only if the owner confirms it
│
├─ /despre-noi/                                (kept)
├─ /blog/  +  /blog/<slug>/                    (kept; launch set in §5)
├─ /contact/                                   (kept) · interactive request form · ← 301 from /inscrieri/
├─ /politica-de-confidentialitate/             (kept, rewritten for GDPR)
├─ /politica-cookies/                          (new)
└─ /404                                        noindex
```

**Count at launch:**
- 19 pages + 9 articles = **28 URLs**, without any auxiliary page.
- Each auxiliary page added later raises the count.
- The offer promised „peste 20 de pagini”.

**Slug rules:**
- Lowercase ASCII, no diacritics, hyphens.
- Trailing slash always (matches `astro.config.mjs`).
- No dates in blog slugs.

---

## 4. Keyword map per page

Bold keyword = the page's primary target. The others are secondary and go in H2s, body text, FAQ and image alts.

### Core

#### 1. `/`

*Home · „medic de familie Oradea” head term + entry to the 3 main services and vouchers*

- **Keywords:** **medic de familie Oradea** · clinică medicală Oradea · Clinica Ecomed · Dr. Alina Teușdea
- **Title (60):** Medic de familie Oradea | Clinica Ecomed - Dr. Alina Teușdea
- **Meta (151):** Clinica Ecomed - Dr. Alina Teușdea, Oradea: medic de familie pentru adulți și copii, kinetoterapie, recuperare medicală și terapii beauty. 0785 234 432
- **H1:** Medic de familie și recuperare medicală în Oradea
- **Links out:** the 4 main pages, Servicii, Despre noi, Contact
- **Schema:** WebSite + MedicalClinic (full NAP) + WebPage
- **Note:** H1 is the one on the offer mock the owner saw; final wording in step B (hero).

#### 2. `/servicii/`

*Full services page: everything, in order of importance (301 from /servicii/)*

- **Keywords:** **servicii medicale Oradea** · clinică Oradea
- **Title (41):** Servicii medicale Oradea | Clinica Ecomed
- **Meta (158):** Serviciile Clinicii Ecomed din Oradea: medicină de familie, ecografie, EKG, Holter TA, osteodensitometrie, kinetoterapie, recuperare medicală, terapii beauty.
- **H1:** Servicii medicale în Oradea
- **Links out:** the 3 main pages first, then Vouchere, then every auxiliary service
- **Schema:** CollectionPage + ItemList of the service pages + BreadcrumbList


### Main pages

#### 3. `/medicina-de-familie/`

*Main page 1 · medicină de familie*

- **Keywords:** **medicină de familie Oradea** · consultații medic de familie Oradea · medic de familie copii Oradea · înscriere medic de familie Oradea · transfer medic de familie Oradea · medic de familie CAS Oradea · adeverință medicală Oradea · test rapid gripă Oradea
- **Title (60):** Medicină de familie Oradea, adulți și copii | Clinica Ecomed
- **Meta (150):** Medic de familie în Oradea pentru adulți și copii: consultații, control periodic, prevenție, boli cronice, rețete și trimiteri. Contract cu CAS Bihor.
- **H1:** Medicină de familie în Oradea, pentru adulți și copii
- **Links out:** Contact (form), Servicii, related auxiliary pages (when built), Despre noi (Dr. Teușdea), 2–3 blog articles (răceli, gripă, diabet), Contact
- **Schema:** MedicalWebPage + Service (provider = clinic) + FAQPage + BreadcrumbList
- **Note:** Owns the înscriere/transfer keywords: the steps and documents from the old /inscrieri/ page become a section here; the request goes through the Contact form.

#### 4. `/kinetoterapie/`

*Main page 2 · kinetoterapie + recuperare medicală (one page)*

- **Keywords:** **kinetoterapie Oradea** · recuperare medicală Oradea · fiziokinetoterapie Oradea · kinetoterapeut Oradea · fizioterapie Oradea · medic recuperare medicală Oradea · infiltrații Oradea
- **Title (60):** Kinetoterapie și recuperare medicală Oradea | Clinica Ecomed
- **Meta (152):** Kinetoterapie și recuperare medicală în Oradea, la clinică sau la domiciliu, cu kinetoterapeut și medic specialist în medicină fizică și de reabilitare.
- **H1:** Kinetoterapie și recuperare medicală în Oradea
- **Links out:** Servicii, voucher groups Durere / Recuperare / Picioare / La domiciliu, related auxiliary pages (when built), blog durere de spate, Contact
- **Schema:** MedicalWebPage + Service + FAQPage + BreadcrumbList
- **Note:** Holds both kinetoterapie and recuperare medicală (one page, Cata 24 Nov). Condition keywords stay on the voucher group pages.

#### 5. `/terapii-beauty/`

*Main page 3 · beauty for body and face (one page)*

- **Keywords:** **terapii beauty Oradea** · tratament anticelulitic Oradea · tratament facial Oradea · lifting facial fără bisturiu Oradea · remodelare abdominală Oradea · tratament cuperoză Oradea · tratament cearcăne Oradea
- **Title (58):** Terapii beauty pentru corp și față Oradea | Clinica Ecomed
- **Meta (153):** Terapii beauty în Oradea, fără ace și fără bisturiu: tratament anticelulitic, remodelare abdominală, lifting facial, cuperoză, cearcăne și terapie laser.
- **H1:** Terapii beauty pentru corp și față, în Oradea
- **Links out:** Servicii, voucher groups Corp / Față / Piele, Vouchere hub, Cadouri (in season)
- **Schema:** WebPage + Service + Offer per package (from vouchers.ts) + FAQPage + BreadcrumbList
- **Note:** Owns the body and face treatment keywords until individual pages exist.

#### 6. `/vouchere/`

*Main page 4 · vouchers for personal use or as gifts (7 drawings, one per group)*

- **Keywords:** **voucher cadou Oradea** · vouchere cadou Oradea · cadou de sănătate Oradea
- **Title (41):** Vouchere cadou în Oradea | Clinica Ecomed
- **Meta (146):** Vouchere Clinica Ecomed din Oradea, pentru dumneavoastră sau cadou: corp, față, piele, recuperare și kinetoterapie la domiciliu. Valabile 12 luni.
- **H1:** Vouchere pentru dumneavoastră sau cadou, în Oradea
- **Links out:** the 7 group pages, Cadouri de Sărbători (in season), the 3 main pages
- **Schema:** CollectionPage + OfferCatalog (7 groups) + BreadcrumbList


### Voucher groups and seasonal

#### 7. `/vouchere/pachete-corp/`

*Group 1 · gift/package intent*

- **Keywords:** **voucher cadou anticelulitic Oradea** · pachet anticelulitic Oradea
- **Title (51):** Voucher cadou anticelulitic Oradea | Clinica Ecomed
- **Meta (146):** Vouchere cadou pentru corp, în Oradea: pachete anticelulitice pentru abdomen, fese și coapse și pachet de remodelare abdominală. Valabile 12 luni.
- **H1:** Vouchere pentru corp: pachete anticelulitice și remodelare
- **Links out:** Terapii beauty (owns the treatment keywords), hub, prev/next group
- **Schema:** WebPage + OfferCatalog → Offer per voucher (price RON, promo with priceValidUntil) + BreadcrumbList

#### 8. `/vouchere/ingrijire-fata/`

*Group 2 · gift/package intent*

- **Keywords:** **voucher cadou tratament facial Oradea** · pachet lifting facial Oradea
- **Title (54):** Voucher cadou tratament facial Oradea | Clinica Ecomed
- **Meta (142):** Vouchere cadou pentru față, în Oradea: tratament facial de regenerare, lifting față și decolteu, cuperoză și rozacee, terapie pentru cearcăne.
- **H1:** Vouchere pentru față: îngrijire fără ace și fără bisturiu
- **Links out:** Terapii beauty (owns the treatment keywords), hub, prev/next group
- **Schema:** WebPage + OfferCatalog → Offer per voucher + BreadcrumbList

#### 9. `/vouchere/piele-plagi-cicatrici/`

*Group 3 · gift + plăgi/cicatrici intent*

- **Keywords:** **tratament plăgi și cicatrici Oradea** · voucher terapie laser Oradea
- **Title (57):** Voucher laser, plăgi și cicatrici Oradea | Clinica Ecomed
- **Meta (158):** Vouchere pentru terapie laser dermatologică și pentru plăgi și cicatrici post-operatorii sau post-traumatice, la Clinica Ecomed din Oradea. Preț după consult.
- **H1:** Piele, plăgi și cicatrici: terapie laser în Oradea
- **Links out:** Terapii beauty, Kinetoterapie, Terapie laser (when built), hub, prev/next group
- **Schema:** WebPage + OfferCatalog (no price: „preț după consult”) + BreadcrumbList

#### 10. `/vouchere/picioare-grele-umflate/`

*Group 4 · owns the treatment keywords (no service page)*

- **Keywords:** **tratament picioare grele Oradea** · picioare umflate tratament Oradea · circulație venoasă Oradea
- **Title (59):** Tratament picioare grele și umflate Oradea | Clinica Ecomed
- **Meta (149):** Terapii în Oradea pentru picioare grele sau umflate și circulație venoasă slabă: Deep Oscillation, drenaj limfatic, curent galvanic. Preț pe ședință.
- **H1:** Picioare grele sau umflate: terapii în Oradea
- **Links out:** Kinetoterapie, hub vouchere, prev/next group, blog (none yet)
- **Schema:** MedicalWebPage + Service + OfferCatalog → Offer per voucher + FAQPage + BreadcrumbList

#### 11. `/vouchere/durere-calcai-articulatii-coloana/`

*Group 5 · owns the treatment keywords (no service page)*

- **Keywords:** **durere de călcâi Oradea** · pinten calcanean tratament Oradea · fasciită plantară Oradea · dureri de coloană Oradea · dureri articulare Oradea
- **Title (45):** Durere de călcâi, articulații, coloană Oradea
- **Meta (150):** Terapii în Oradea pentru durere de călcâi (pinten calcanean, fasciită plantară), luxații și traumatisme, dureri articulare și de coloană. 0785 234 432
- **H1:** Durere de călcâi, articulații sau coloană: terapii în Oradea
- **Links out:** Kinetoterapie, Terapie laser, blog durere de spate + căzături iarna, prev/next group
- **Schema:** MedicalWebPage + Service + OfferCatalog + FAQPage + BreadcrumbList
- **Note:** Title without the brand suffix (would pass 60 chars).

#### 12. `/vouchere/recuperare-leziune-operatie/`

*Group 6 · owns the treatment keywords (no service page)*

- **Keywords:** **recuperare după operație Oradea** · recuperare ruptură tendon Oradea · pareză facială tratament Oradea · nevralgie facială Oradea
- **Title (60):** Recuperare după operație sau leziune Oradea | Clinica Ecomed
- **Meta (147):** Recuperare în Oradea după operație, după ruptură de tendon sau de fibră musculară și pentru nevralgie sau pareză facială, după evaluarea medicului.
- **H1:** Recuperare după leziune sau operație, în Oradea
- **Links out:** Kinetoterapie, La domiciliu, prev/next group
- **Schema:** MedicalWebPage + Service + OfferCatalog + FAQPage + BreadcrumbList

#### 13. `/vouchere/fiziokinetoterapie-domiciliu/`

*Group 7 · gift/package intent (VIP)*

- **Keywords:** **voucher kinetoterapie la domiciliu Oradea** · cadou pentru părinți recuperare
- **Title (58):** Voucher kinetoterapie la domiciliu Oradea | Clinica Ecomed
- **Meta (147):** Vouchere VIP de fiziokinetoterapie la domiciliu în Oradea: pachet de 15 zile sau de 10 zile. Un cadou pentru cei dragi care nu se pot deplasa ușor.
- **H1:** Vouchere VIP: fiziokinetoterapie la domiciliu
- **Links out:** Kinetoterapie (owns the treatment keywords), hub, prev group
- **Schema:** WebPage + OfferCatalog → 2 Offers + BreadcrumbList

#### 14. `/cadouri-de-sarbatori/`

*Seasonal landing · live until Feb 2027, then 301 → /vouchere/*

- **Keywords:** **cadouri de Crăciun Oradea** · cadouri de Sărbători Oradea · idei cadouri Crăciun · voucher cadou Crăciun Oradea
- **Title (55):** Cadouri de Crăciun în Oradea: vouchere | Clinica Ecomed
- **Meta (140):** Idei de cadouri de Crăciun în Oradea: vouchere pentru corp, față și recuperare, cu o ședință cadou sau 20% reducere până pe 7 ianuarie 2027.
- **H1:** Cadouri de Crăciun și de Sărbători, în Oradea
- **Links out:** Vouchere hub + the 7 groups, Terapii beauty, Kinetoterapie, Contact
- **Schema:** WebPage + OfferCatalog (promo offers with priceValidUntil 2027-01-07) + BreadcrumbList
- **Note:** Meta and copy switch to normal-price wording on 8 Jan 2027 (driven by the promo config).


### Clinic and other pages

#### 15. `/despre-noi/`

*About (old URL kept)*

- **Keywords:** **Clinica Ecomed Oradea** · Dr. Alina Teușdea · Dr. Baiduca Alexandru
- **Title (56):** Despre noi: Dr. Alina Teușdea și echipa | Clinica Ecomed
- **Meta (141):** Clinica Ecomed - Dr. Alina Teușdea, din 2017 în Oradea: medici și terapeuți pentru medicină de familie, recuperare medicală și kinetoterapie.
- **H1:** Despre Clinica Ecomed
- **Links out:** the 3 main pages, Vouchere, Contact
- **Schema:** AboutPage + MedicalClinic + Person per staff member (name, jobTitle, worksFor) + BreadcrumbList

#### 16. `/contact/`

*Contact + interactive request form (replaces /inscrieri/)*

- **Keywords:** **Clinica Ecomed Oradea contact** · programare medic de familie Oradea · program medic de familie Oradea
- **Title (44):** Contact și programări, Clinica Ecomed Oradea
- **Meta (143):** Clinica Ecomed - Dr. Alina Teușdea, Str. Nicolae Jiga nr. 9, ap. 3, Oradea. Programări: 0785 234 432. L, Mi, V 08:30–13:30 · Ma, J 14:00–19:00.
- **H1:** Contact și programări
- **Links out:** Vouchere, the 3 main pages
- **Schema:** ContactPage + MedicalClinic (NAP, hours, geo) + BreadcrumbList
- **Note:** The form is a step-by-step conversation, not a normal form: first „De ce aveți nevoie?” (Medicină de familie · Kinetoterapie · Terapii beauty · Informații · Vouchere), then name, email and phone, one question at a time.

#### 17. `/blog/`

*Blog index (old URL kept)*

- **Keywords:** **sfaturi medic de familie** · blog sănătate Oradea
- **Title (55):** Blog: sfaturi de la medicul de familie | Clinica Ecomed
- **Meta (149):** Sfaturi de la medicul de familie: prevenție, răceli și gripă, durerea de spate, osteoporoză, diabet, vaccinare și recuperare. Clinica Ecomed, Oradea.
- **H1:** Sfaturi de sănătate de la medicul de familie
- **Links out:** every article; each article links to ≥ 2 service pages
- **Schema:** Blog + ItemList + BreadcrumbList

#### 18. `/politica-de-confidentialitate/`

*Legal (old URL kept)*

- **Title (46):** Politica de confidențialitate | Clinica Ecomed
- **Meta (154):** Cum prelucrează Clinica Ecomed datele dumneavoastră personale, conform Regulamentului (UE) 2016/679 (GDPR): ce date, de ce, cât timp și ce drepturi aveți.
- **H1:** Politica de confidențialitate
- **Links out:** Politica de cookie-uri, Contact
- **Schema:** WebPage + BreadcrumbList

#### 19. `/politica-cookies/`

*Legal (new)*

- **Title (39):** Politica de cookie-uri | Clinica Ecomed
- **Meta (108):** Ce cookie-uri folosește site-ul Clinicii Ecomed, de ce le folosim și cum vă puteți schimba oricând alegerea.
- **H1:** Politica de cookie-uri
- **Links out:** Politica de confidențialitate
- **Schema:** WebPage + BreadcrumbList


### Servicii auxiliare · PROVISIONAL (built only after the owner's services list)

#### 20. `/ecografie/`

*Auxiliary service · provisional*

- **Keywords:** **ecografie Oradea** · ecografie generală Oradea · medic ecografie Oradea
- **Title (53):** Ecografie Oradea · Dr. Alina Teușdea | Clinica Ecomed
- **Meta (153):** Ecografie generală în Oradea, făcută de Dr. Alina Teușdea: investigație cu ultrasunete, nedureroasă și fără radiații. Rezultatul îl discutați cu medicul.
- **H1:** Ecografie în Oradea
- **Links out:** Medicină de familie, Investigații, blog „Ce este ecografia”, Contact
- **Schema:** MedicalWebPage + Service + FAQPage + BreadcrumbList
- **Note:** Which ecografii exactly (abdominală, tiroidă…) is not in FACTS: TODO (ask Cata). Until then, only „ecografie generală”.

#### 21. `/investigatii-medicale/`

*Auxiliary service · provisional*

- **Keywords:** **EKG Oradea** · Holter TA Oradea · osteodensitometrie Oradea
- **Title (60):** EKG, Holter TA și osteodensitometrie Oradea | Clinica Ecomed
- **Meta (141):** EKG, Holter TA (monitorizarea tensiunii arteriale 24 de ore) și osteodensitometrie, la Clinica Ecomed din Oradea. Programări la 0785 234 432.
- **H1:** EKG, Holter TA și osteodensitometrie în Oradea
- **Links out:** Medicină de familie, Ecografie, blog osteoporoză, Contact
- **Schema:** MedicalWebPage + Service (one per investigation) + FAQPage + BreadcrumbList

#### 22. `/kinetoterapie-la-domiciliu/`

*Auxiliary service · provisional*

- **Keywords:** **kinetoterapie la domiciliu Oradea** · fiziokinetoterapie la domiciliu Oradea · recuperare la domiciliu Oradea · recuperare după AVC la domiciliu
- **Title (50):** Kinetoterapie la domiciliu Oradea | Clinica Ecomed
- **Meta (159):** Fiziokinetoterapie la domiciliu în Oradea, pentru pacienții care nu se pot deplasa: după AVC, după operație sau cu mobilitate redusă. Pachete de 10 și 15 zile.
- **H1:** Fiziokinetoterapie la domiciliu în Oradea
- **Links out:** Voucher group La domiciliu, Kinetoterapie (main page), Despre noi (Dr. Baiduca, Bodogai Anca), blog AVC
- **Schema:** MedicalWebPage + Service (areaServed Oradea) + FAQPage + BreadcrumbList

#### 23. `/terapie-laser/`

*Auxiliary service · provisional*

- **Keywords:** **terapie laser Oradea** · laser acnee Oradea · tratament cicatrici acneice Oradea · laser herpes zona zoster
- **Title (57):** Terapie laser Oradea, acnee și cicatrici | Clinica Ecomed
- **Meta (147):** Terapie laser în Oradea pentru acnee și cicatrici acneice, cuperoză, herpes, zona zoster, cheloide și plăgi, plus laser în pachetele pentru durere.
- **H1:** Terapie laser în Oradea
- **Links out:** Voucher groups Piele / Durere, Terapii beauty, Kinetoterapie
- **Schema:** MedicalWebPage + Service + FAQPage + BreadcrumbList
- **Note:** Laser HPL (old site) only if the owner's services list confirms it: TODO.

#### 24. `/neurofeedback/`

*Auxiliary service · provisional*

- **Keywords:** **neurofeedback Oradea**
- **Title (37):** Neurofeedback Oradea | Clinica Ecomed
- **Meta (67):** TODO (ask Cata): only if the owner confirms the service is offered.
- **H1:** Neurofeedback în Oradea
- **Links out:** TODO
- **Schema:** MedicalWebPage + Service
- **Note:** Listed in the approved offer, but unclear in FACTS §7. Built only after the owner's services list.

#### 25. `/terapii-corp/`

*Auxiliary service · provisional*

- **Keywords:** **tratament anticelulitic Oradea** · remodelare abdominală Oradea · drenaj limfatic Oradea · masaj anticelulitic Oradea · tratament celulită Oradea
- **Title (59):** Tratament anticelulitic, remodelare Oradea | Clinica Ecomed
- **Meta (154):** Pachete anticelulitice pentru abdomen, fese și coapse și remodelare abdominală în Oradea: drenaj limfatic, Deep Oscillation, Shock Wave, electrostimulare.
- **H1:** Tratament anticelulitic și remodelare abdominală în Oradea
- **Links out:** Voucher group Corp, Terapii beauty (hub), Terapii față
- **Schema:** WebPage + Service + Offer per package (from vouchers.ts) + FAQPage + BreadcrumbList

#### 26. `/terapii-fata/`

*Auxiliary service · provisional*

- **Keywords:** **tratament facial Oradea** · lifting facial fără bisturiu Oradea · tratament cuperoză Oradea · rozacee tratament Oradea · tratament cearcăne Oradea
- **Title (59):** Tratament facial, lifting, cuperoză Oradea | Clinica Ecomed
- **Meta (146):** Terapii pentru față în Oradea, fără ace și fără bisturiu: tratament facial de regenerare, lifting față și decolteu, cuperoză și rozacee, cearcăne.
- **H1:** Terapii pentru față în Oradea, fără ace și fără bisturiu
- **Links out:** Voucher group Față, Terapii beauty (hub), Terapie laser
- **Schema:** WebPage + Service + Offer per package + FAQPage + BreadcrumbList

---

## 5. Blog: launch set

Each article starts from one of our approved social captions (`blog_surse/`). It is expanded only with general, well-established medical information and ends with the soft line („Pentru un diagnostic corect, consultați medicul.”). Dr. Teușdea reviews each one before it goes live. Who signs as author/reviewer: TODO (ask Cata).

| Slug | Source caption | Primary keyword | Must link to |
|---|---|---|---|
| `/blog/durere-de-spate/` | 02_coloana | durere de spate | Kinetoterapie, group Durere |
| `/blog/osteoporoza/` | 04_osteoporoza | osteoporoză | Medicină de familie (+ Investigații when built) |
| `/blog/raceli-la-copii/` | 06_raceli_copii | răceli la copii | Medicină de familie |
| `/blog/semnele-avc/` | 09_avc | semnele AVC | Medicină de familie, Kinetoterapie |
| `/blog/gripa-sau-raceala/` | 12_gripa + 17_test_rapid | gripă sau răceală | Medicină de familie |
| `/blog/vaccinarea-adultilor/` | 13_vaccinare | vaccinare adulți | Medicină de familie |
| `/blog/diabet-glicemie/` | 19_diabet | glicemie, diabet | Medicină de familie |
| `/blog/ce-este-ecografia/` | 23_ecografie | ce este ecografia | Medicină de familie (+ Ecografie when built) |
| `/blog/cazaturi-iarna/` | 24_iarna_cazaturi | căzături iarna | Kinetoterapie, group Durere |

Article titles and metas are written with the articles, under the same limits.

The voucher captions (picioare grele, călcâi, laser, lifting…) are **not** articles. Their content belongs on the service and group pages.

---

## 6. Internal linking rules

**Header menu** (decided by Cata, same pattern as nestos `Header.tsx`):
- **Top level:** Acasă (logo) · Despre noi · **Servicii** · **Vouchere** · Blog · Contact · phone CTA.
- **„Servicii” is split in two:**
  - the label is a link to `/servicii/`;
  - an arrow next to it opens the panel.
- **The panel shows, in order:**
  1. Medicină de familie
  2. Kinetoterapie și recuperare medicală
  3. Terapii beauty
  4. a link to Vouchere (also reachable from Servicii)
  5. **„Servicii auxiliare”** with its own arrow, which expands the list of auxiliary pages
  6. „Toate serviciile” → `/servicii/`
- **The current page is marked inside the panel.** The Servicii label is active only on the Servicii page itself.
- **Vouchere** is also its own top-level link.
- **Esc and outside-click close the panel.** On phone, the same tree sits inside the menu.
- **Visual design** is step C.

**Footer.** The 4 main pages, every auxiliary page, the vouchers hub, NAP, hours, socials, legal. It is generated from the same page list, so nothing goes missing.

**Breadcrumbs** on every inner page, visible and in schema. Two patterns:
- Acasă › Servicii › Kinetoterapie › Kinetoterapie la domiciliu
- Acasă › Vouchere cadou › Pachete pentru corp

Auxiliary pages sit under their main page in the breadcrumb, even though their URLs are top-level.

**Main and auxiliary page links:**
- an auxiliary page links up to its main page; a main page links down to its auxiliaries;
- across to 2–3 sibling services;
- down to its voucher group(s);
- Contact (form) CTA;
- 1–2 blog articles.

**Voucher group page links:**
- to the hub;
- to the main page that owns the treatment keywords;
- to the previous/next group;
- to the seasonal page while it is live;
- to the tel: CTA.

**Blog article:** at least 2 contextual links to service pages, plus an author/reviewer box linking to Despre noi.

**Anchor text** is descriptive and varied („kinetoterapie la domiciliu”, „pachetele pentru picioare grele”), never „click aici”.

**Every page** has the call CTA (`tel:+40785234432`) within one screen on phone.

All links are plain `<a href>` (crawlable), also with page transitions on.

---

## 7. Schema (JSON-LD)

One `Seo` component renders a single `@graph` per page. Entities with fixed `@id`s are defined once and referenced everywhere.

| `@id` | Type | Holds |
|---|---|---|
| `/#website` | WebSite | name, url, inLanguage `ro-RO`, publisher → `#clinic` |
| `/#clinic` | MedicalClinic | name, legalName, NAP, geo, hours, sameAs, medicalSpecialty, employees, hasOfferCatalog |
| `/despre-noi/#alina-teusdea` | Person | name, jobTitle (titles from FACTS §3 only), worksFor → `#clinic`, image |
| `/despre-noi/#alexandru-baiduca` | Person | same |
| `/despre-noi/#anca-bodogai`, `#corina-gelnic` | Person | same |

**Per page type:**

| Page type | Types in the graph |
|---|---|
| Home | WebSite, MedicalClinic (full), WebPage |
| Main or auxiliary service page | MedicalWebPage (beauty: WebPage), Service (provider → `#clinic`, areaServed Oradea), FAQPage, BreadcrumbList |
| Servicii page | CollectionPage, ItemList of all services in order, BreadcrumbList |
| Voucher group | WebPage, OfferCatalog → one Offer per voucher (price, priceCurrency RON, validFor 12 months), BreadcrumbList |
| Seasonal | WebPage, OfferCatalog with promo prices + `priceValidUntil: 2027-01-07`, BreadcrumbList |
| Despre noi | AboutPage, MedicalClinic, Person × 4 |
| Contact | ContactPage, MedicalClinic |
| Blog article | BlogPosting (author/reviewer TODO), BreadcrumbList |
| Blog index | Blog, ItemList |

**Rules:**
- **Never** `Review` or `AggregateRating`: there are none, and we don't invent them.
- Prices in schema come from `vouchers.ts` through the promo helper, so the schema always matches the visible price.
  - „Preț după consult” vouchers get no `price`.
  - Promo offers carry `priceValidUntil` 2027-01-07. After the promo is switched off, only normal prices remain.
- FAQPage is valid markup. Since 2023, Google shows FAQ rich results only for a few authoritative sites, so the FAQs are there for people and AI answers, not for a rich result.
- Validate every page type with the Rich Results Test and validator.schema.org (task Q1 in PLAN.md).

**Clinic entity (draft):**

```json
{
  "@type": "MedicalClinic",
  "@id": "https://medicinadefamilieoradea.ro/#clinic",
  "name": "Clinica Ecomed - Dr. Alina Teușdea",
  "legalName": "General Medicine Practice SRL",
  "url": "https://medicinadefamilieoradea.ro/",
  "telephone": "+40785234432",
  "email": "cmgenmed@yahoo.com",
  "foundingDate": "2017",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Str. Nicolae Jiga nr. 9, ap. 3",
    "addressLocality": "Oradea",
    "addressRegion": "Bihor",
    "postalCode": "TODO (ask Cata)",
    "addressCountry": "RO"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": "TODO", "longitude": "TODO" },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Wednesday", "Friday"], "opens": "08:30", "closes": "13:30" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Tuesday", "Thursday"], "opens": "14:00", "closes": "19:00" }
  ],
  "medicalSpecialty": ["PrimaryCare", "Physiotherapy"],
  "sameAs": [
    "https://www.facebook.com/medicinadefamilieoradea.ro/",
    "https://www.instagram.com/dr.alina.teusdea/",
    "https://www.tiktok.com/@dr.alina.teusdea"
  ]
}
```

---

## 8. NAP: the exact strings (single source: `src/consts.ts`)

| Field | Value |
|---|---|
| Name | Clinica Ecomed - Dr. Alina Teușdea |
| Street | Str. Nicolae Jiga nr. 9, ap. 3 |
| City | Oradea, jud. Bihor |
| Postal code | TODO (ask Cata) |
| Phone (display) | 0785 234 432 |
| Phone (link / schema) | +40785234432 |
| Email | cmgenmed@yahoo.com |
| Hours | Luni, Miercuri, Vineri: 08:30–13:30 · Marți, Joi: 14:00–19:00 · consultații pe bază de programare |
| Legal | SC General Medicine Practice SRL, contract cu CAS Bihor · CUI / Reg. Com.: TODO (ask Cata) |

The same strings go on the Google Business Profile, Facebook, Instagram, TikTok and any directory listing, character for character.

---

## 9. Old → new redirects (301)

Every URL of the old site was checked (all 10 returned 200, see `_legacy/README.md`). URLs that keep their address need nothing.

| Old URL | New URL | Code |
|---|---|---|
| `/` · `/despre-noi/` · `/blog/` · `/contact/` · `/politica-de-confidentialitate/` | same | 200 (kept) |
| `/servicii-medicale/` | `/servicii/` | 301 |
| `/inscrieri/` | `/contact/` | 301 |
| `/hello-world/` | `/blog/` | 301 |
| `/category/…` (incl. `/category/uncategorized/`) | `/blog/` | 301 |
| `/author/…` (incl. `/author/admin/`) | `/blog/` | 301 |
| `/feed/`, `/comments/feed/`, `…/feed/` | `/blog/` | 301 |
| `/sitemap.xml`, `/wp-sitemap.xml`, `/wp-sitemap-*.xml` | `/sitemap-index.xml` | 301 |
| `/?p=1` (WordPress id of the demo post) | `/blog/` | 301 |
| `/wp-admin/…`, `/wp-login.php`, `/xmlrpc.php`, `/wp-content/…`, `/wp-includes/…`, `/wp-json/…` | — | 410 Gone |
| `http://…` and `www.…` | `https://medicinadefamilieoradea.ro/…` | 301 |
| any path without trailing slash | same path + `/` | 301 (Apache `DirectorySlash`) |
| `/cadouri-de-sarbatori/` (from the D5 date) | `/vouchere/` | 301 |

`.htaccess` sketch (final version and curl tests in PLAN.md task Q3):

```apache
RewriteEngine On
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\. [NC]
RewriteRule ^ https://medicinadefamilieoradea.ro%{REQUEST_URI} [R=301,L]

RewriteRule ^inscrieri/?$ /contact/ [R=301,L]
RewriteRule ^servicii-medicale/?$ /servicii/ [R=301,L]
RewriteRule ^hello-world/?$ /blog/ [R=301,L]
RewriteRule ^(category|author)/ /blog/ [R=301,L]
RewriteRule ^(.+/)?feed/?$ /blog/ [R=301,L]
RewriteRule ^(sitemap|wp-sitemap.*)\.xml$ /sitemap-index.xml [R=301,L]
RewriteCond %{QUERY_STRING} ^p=1$
RewriteRule ^$ /blog/ [R=301,L,QSD]
RewriteRule ^(wp-admin|wp-content|wp-includes|wp-json)(/|$) - [G,L]
RewriteRule ^(wp-login|xmlrpc)\.php$ - [G,L]
```

---

## 10. Technical SEO checklist

- **Canonical:** absolute, `https://medicinadefamilieoradea.ro/...`, trailing slash, self-referencing on every page.
- **Head:**
  - one `<title>` and meta description from this file;
  - `<html lang="ro">`;
  - `og:locale` `ro_RO`;
  - OG + Twitter tags, with one 1200×630 OG image per page type, made in the site's style.
- **Robots:**
  - `index, follow, max-image-preview:large` everywhere, except `/404` (noindex);
  - dev pages (`/_ds/`, `_lab/`) are never deployed;
  - `robots.txt` allows all and lists `Sitemap: https://medicinadefamilieoradea.ro/sitemap-index.xml`.
- **Sitemap:** `@astrojs/sitemap`, 404 excluded, `lastmod` for blog articles.
- **Headings:** one H1 per page and a clean H2/H3 order. Centred design doesn't change the outline.
- **Content is in the static HTML.**
  - Animation start states (hidden, offset) apply only after JS boots (an `html.js` class), so crawlers and no-JS visitors see everything.
  - Tap-to-reveal voucher details are in the HTML, collapsed, not fetched.
- **Images:**
  - Romanian alt text;
  - descriptive file names (e.g. `dr-alina-teusdea-medic-de-familie-oradea`);
  - width/height set, AVIF + WebP, lazy below the fold;
  - the LCP image (if any) gets `fetchpriority="high"`.
- **Video:** muted decorative clips, with the same message in page text. Burned-in clip text is repeated in HTML. No `VideoObject` until there is a real clinic video page.
- **Speed (mobile):** LCP < 2.5 s, INP < 200 ms, CLS < 0.1. Lighthouse mobile: Performance ≥ 90, SEO 100, Accessibility ≥ 95, Best Practices 100.
- **Links:** `tel:+40785234432` and `mailto:` on every NAP mention. Maps embed is click-to-load (privacy + speed), with a plain „Deschide în Google Maps” link.
- **Language:** no hreflang (Romanian only).

---

## 11. Google Business Profile and off-site

**Name, categories, contact**
- **Name:** „Clinica Ecomed - Dr. Alina Teușdea”, exactly, with no service words (Google guidelines, FACTS §1).
- **Categories:**
  - primary: family doctor;
  - secondary: physiotherapy/recovery and aesthetics. The exact Romanian labels are picked from GBP's list when the profile is created.
- **Address, phone, hours:** identical to §8.
- **Website link:** `https://medicinadefamilieoradea.ro/?utm_source=google&utm_medium=organic&utm_campaign=gbp`, so GBP visits show separately in GA4.
- **Appointment link:** `/contact/`.

**Profile content**
- **Services:** mirror the Servicii page, one entry per service.
- **Products:** the 7 voucher groups, each linking to its group page.
- **Description** (≤ 750 characters): drafted from the home copy, no promo text.
- **Photos:** only **real** clinic photos (exterior with the „Centrul Medical Ecomed” sign, waiting room, rooms, team). The AI stills approved for the TV video don't go on GBP.
- **Posts:** vouchers, the seasonal offer, new blog articles.
- **Reviews:** ask real patients (a QR card at reception) and reply to every review. No incentives tied to ratings, never fake reviews.

**Other**
- **The old „Ecomed” Maps listing** (owner unknown): don't edit it. If it turns out to be this practice, claim or report it as a duplicate. TODO (ask Cata).
- **Facebook / Instagram / TikTok:** same name and NAP, and links to the matching site pages.
- **Directories:** list chosen with Cata. Same NAP everywhere, and fix old listings that use other spellings.

---

## 12. Measurement

- **Search Console** (domain property): track clicks/positions per page group: the 3 main pages, `/vouchere/`, `/blog/`. Check the primary keywords from §4 monthly.
- **GA4** (only after cookie consent):
  - events `tel_click`, `form_submit` (with the chosen need as a parameter), `voucher_open` (card details opened), `cta_click`;
  - key events: `tel_click`, `form_submit`.
- **GBP insights:** calls, direction requests, website clicks, compared month to month.
