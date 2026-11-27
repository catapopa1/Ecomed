/**
 * JSON-LD entities shared across pages (SEO.md §7). One @graph per page; fixed @ids.
 * Only facts from site.ts / FACTS. Not filled yet: postal code and geo (TODO (ask Cata) · T5);
 * they are left out of the markup until they are known, never guessed.
 */
import { site } from './site';

export const SITE_URL = 'https://medicinadefamilieoradea.ro/';
const id = (frag: string) => `${SITE_URL}#${frag}`;

export const website = {
  '@type': 'WebSite',
  '@id': id('website'),
  name: site.name,
  url: SITE_URL,
  inLanguage: 'ro-RO',
  publisher: { '@id': id('clinic') },
};

const dayMap: Record<string, string> = { Luni: 'Monday', Marți: 'Tuesday', Miercuri: 'Wednesday', Joi: 'Thursday', Vineri: 'Friday' };

export const clinic = {
  '@type': 'MedicalClinic',
  '@id': id('clinic'),
  name: site.name,
  legalName: 'General Medicine Practice SRL',
  url: SITE_URL,
  telephone: '+40785234432',
  email: site.email,
  foundingDate: '2017',
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.street,
    addressLocality: 'Oradea',
    addressRegion: 'Bihor',
    ...(site.postalCode ? { postalCode: site.postalCode } : {}),
    addressCountry: 'RO',
  },
  openingHoursSpecification: site.hours.map((h) => {
    const [opens, closes] = h.time.split('–');
    return { '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.split(', ').map((d) => dayMap[d]), opens, closes };
  }),
  medicalSpecialty: ['PrimaryCare', 'Physiotherapy'],
  sameAs: site.socials.map((s) => s.href),
};

export const webPage = (path: string, name: string, description: string) => ({
  '@type': 'WebPage',
  '@id': `${new URL(path, SITE_URL).href}#webpage`,
  url: new URL(path, SITE_URL).href,
  name,
  description,
  inLanguage: 'ro-RO',
  isPartOf: { '@id': id('website') },
  about: { '@id': id('clinic') },
});
