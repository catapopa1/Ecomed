/**
 * One page list for the header and the footer (SEO.md §6), so nothing goes missing.
 */
import { GROUPS } from './vouchers';

export interface NavLink { href: string; label: string; short?: string }

/** The 3 main services, in order of importance. */
export const MAIN_SERVICES: NavLink[] = [
  { href: '/medicina-de-familie/', label: 'Medicină de familie' },
  { href: '/kinetoterapie/', label: 'Kinetoterapie și recuperare medicală', short: 'Kinetoterapie' },
  { href: '/terapii-beauty/', label: 'Terapii beauty' },
];

/** Auxiliary service pages: empty until the owner's services list arrives (T1). */
export const AUX_SERVICES: NavLink[] = [];

export const VOUCHER_GROUPS: NavLink[] = GROUPS.map((g) => ({ href: g.slug, label: g.title }));

/** Top level, after the logo. 'servicii' is the split label + panel. */
export const TOP: (NavLink & { panel?: boolean; icon: 'home' | 'heart-pulse' | 'gift' | 'users' | 'mail' })[] = [
  { href: '/', label: 'Acasă', icon: 'home' },
  { href: '/servicii/', label: 'Servicii', panel: true, icon: 'heart-pulse' },
  { href: '/vouchere/', label: 'Vouchere', icon: 'gift' },
  { href: '/despre-noi/', label: 'Despre noi', icon: 'users' },
  { href: '/contact/', label: 'Contact', icon: 'mail' },
];

export const LEGAL: NavLink[] = [
  { href: '/politica-de-confidentialitate/', label: 'Politica de confidențialitate' },
  { href: '/politica-cookies/', label: 'Politica de cookie-uri' },
];

const strip = (p: string) => (p !== '/' && p.endsWith('/') ? p.slice(0, -1) : p);
/** Exact page match. */
export const isPage = (path: string, href: string) => strip(path) === strip(href);
/** The page or anything under it (Servicii label: only the hub itself, SEO.md §6). */
export const isUnder = (path: string, href: string) => isPage(path, href) || strip(path).startsWith(strip(href) + '/');
