/** Clinic facts used across the site. Source: SEO.md §8 (NAP, exact strings) + FACTS_Ecomed.md */
export const site = {
  name: 'Clinica Ecomed - Dr. Alina Teușdea',
  brand: 'Dr. Alina Teușdea',             // text logo until the real logo arrives (T6); Cata: name on top
  brandSub: 'by Ecomed',
  phone: '0785 234 432',                  // programări
  phoneHref: 'tel:+40785234432',
  email: 'cmgenmed@yahoo.com',            // forms send here
  street: 'Str. Nicolae Jiga nr. 9, ap. 3',
  city: 'Oradea, jud. Bihor',
  postalCode: '410028',                   // Str. Nicolae Jiga odd 1–33 (bancibancomate.ro)
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=Str.+Nicolae+Jiga+9,+Oradea',
  hours: [
    { days: 'Luni, Miercuri, Vineri', time: '08:30–13:30' },
    { days: 'Marți, Joi', time: '14:00–19:00' },
  ],
  hoursNote: 'Consultații pe bază de programare',
  legal: 'SC General Medicine Practice SRL, contract cu CAS Bihor',
  socials: [
    { name: 'Facebook', href: 'https://www.facebook.com/medicinadefamilieoradea.ro/', handle: 'medicinadefamilieoradea.ro', icon: 'facebook' },
    { name: 'Instagram', href: 'https://www.instagram.com/dr.alina.teusdea/', handle: '@dr.alina.teusdea', icon: 'instagram' },
    { name: 'TikTok', href: 'https://www.tiktok.com/@dr.alina.teusdea', handle: '@dr.alina.teusdea', icon: 'tiktok' },
  ],
} as const;
