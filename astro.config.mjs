// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://medicinadefamilieoradea.ro',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  // 4321 and 4400 are taken by other local projects
  server: { port: 4410 },
});
