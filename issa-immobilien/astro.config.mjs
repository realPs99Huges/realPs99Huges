// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// Alle Seiten werden statisch vorgerendert. Nur der Formularendpunkt
// (src/pages/api/contact.ts) läuft serverseitig über den Node-Adapter.
export default defineConfig({
  site: 'https://www.issa-immobilien.de',
  trailingSlash: 'always',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    sitemap({
      filter: (page) => !/\/kontakt\/(gesendet|fehler)\/$/.test(page),
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  security: {
    // Produktivdomain hinter einem Reverse Proxy (X-Forwarded-Host) zulassen,
    // damit die Herkunftsprüfung für Formular-POSTs die echte Domain kennt.
    allowedDomains: [
      { hostname: 'www.issa-immobilien.de', protocol: 'https' },
      { hostname: 'issa-immobilien.de', protocol: 'https' },
    ],
  },
  devToolbar: { enabled: false },
});
