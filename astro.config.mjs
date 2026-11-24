// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE_URL } from './src/consts.ts';

// Fully static: every route is prerendered HTML. Deploy = upload dist/ to public_html on the
// clinic's cPanel (Apache), so redirects and cache headers live in public/.htaccess.
export default defineConfig({
  site: SITE_URL,

  // /servicii/ → dist/servicii/index.html, the URL shape the old WordPress site used
  // (trailing slashes), so old URLs that keep their path keep their equity.
  trailingSlash: 'always',
  build: { format: 'directory' },

  integrations: [
    sitemap({
      // noindex pages must not be in the sitemap (filled in with the SEO task)
      filter: (page) => !page.includes('/404'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  // 4321 and 4400 are taken by other local projects
  server: { port: 4410 },
});
