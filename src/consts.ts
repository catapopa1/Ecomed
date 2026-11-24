/**
 * Single source of truth for site-wide constants (same pattern as dataexpertfiscal.ro).
 *
 * The NAP block (name, address, phone) feeds the visible footer, the contact page and the
 * schema.org markup. It must match the new Google Business Profile character for character.
 * Source: materiale_site/docs/FACTS_Ecomed.md §1–2 (verified 23–24 Nov 2026).
 */

/** Production domain. Canonicals, OpenGraph URLs, the sitemap and robots.txt all derive from this. */
export const SITE_URL = 'https://medicinadefamilieoradea.ro';

/** Business name, identical on the site, the Google Business Profile and Facebook (Cata approved 24 Nov 2026). */
export const SITE_NAME = 'Clinica Ecomed - Dr. Alina Teușdea';

export const BUSINESS = {
  name: SITE_NAME,
  /** Legal entity with the CAS Bihor contract. */
  legalName: 'General Medicine Practice SRL',
  /** TODO (ask Cata): CUI and Nr. Reg. Com. for the footer legal bar and the privacy policy (Legea 31/1990 art. 74). */
  cui: '',
  regCom: '',
  foundingYear: 2017,
  street: 'Str. Nicolae Jiga nr. 9, ap. 3',
  city: 'Oradea',
  county: 'Bihor',
  /** TODO (ask Cata): postal code as Google Maps / the Business Profile shows it. */
  postalCode: '',
  country: 'RO',
  /** E.164 for schema and tel: links; display format as a Romanian caller dials it. */
  phone: '+40785234432',
  phoneDisplay: '0785 234 432',
  email: 'cmgenmed@yahoo.com',
  /** TODO (ask Cata): take the pin from the new Business Profile once it exists. */
  geo: null as { lat: number; lng: number } | null,
  /** Owner-confirmed 19 Oct 2026. Consultations by appointment (min. 24 h ahead, clinic poster). */
  openingHours: [
    { days: ['Monday', 'Wednesday', 'Friday'], opens: '08:30', closes: '13:30' },
    { days: ['Tuesday', 'Thursday'], opens: '14:00', closes: '19:00' },
  ],
  social: {
    facebook: 'https://www.facebook.com/medicinadefamilieoradea.ro/',
    instagram: 'https://www.instagram.com/dr.alina.teusdea/',
    tiktok: 'https://www.tiktok.com/@dr.alina.teusdea',
  },
} as const;

/** Where the forms send to (Cata confirmed 24 Nov 2026). */
export const FORM_RECIPIENT = BUSINESS.email;

/**
 * Christmas promo switch. `active: false` hides the banner and shows normal prices everywhere.
 * Prices themselves live in src/data/vouchers.ts. The site also stops showing the promo
 * automatically after `until`, so a forgotten switch cannot show stale prices.
 */
export const PROMO = {
  active: true,
  until: '2027-01-07',
  label: 'Promoții de Sărbători',
} as const;

const DAYS_RO: Record<string, string> = {
  Monday: 'Luni',
  Tuesday: 'Marți',
  Wednesday: 'Miercuri',
  Thursday: 'Joi',
  Friday: 'Vineri',
  Saturday: 'Sâmbătă',
  Sunday: 'Duminică',
};

/** Opening hours as a Romanian visitor reads them, from the same array the schema uses. */
export const HOURS_RO: string[] = BUSINESS.openingHours.map(
  (h) => `${h.days.map((d) => DAYS_RO[d]).join(', ')}: ${h.opens}–${h.closes}`,
);
