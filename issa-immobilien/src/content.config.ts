import { defineCollection } from 'astro:content';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/**
 * Objekte werden in src/content/objekte.json gepflegt (siehe docs/OBJEKTE.md).
 * Solange die Liste leer ist, zeigt die Objekte-Seite einen Anfragebereich
 * statt Platzhaltern. Es werden ausschließlich echte, freigegebene Objekte
 * eingetragen.
 */
const objekteLoader: Loader = {
  name: 'objekte-json',
  load: async ({ store, parseData, config, logger }) => {
    const file = 'src/content/objekte.json';
    const absolute = fileURLToPath(new URL(file, config.root));
    const raw = JSON.parse(await readFile(absolute, 'utf-8'));
    if (!Array.isArray(raw)) {
      logger.error(`${file} muss eine Liste (Array) enthalten.`);
      return;
    }
    store.clear();
    for (const item of raw) {
      // Bildpfade werden relativ zu objekte.json aufgelöst.
      const data = await parseData({ id: String(item.id), data: item, filePath: absolute });
      store.set({ id: String(item.id), data, filePath: file });
    }
  },
};

const objekte = defineCollection({
  loader: objekteLoader,
  schema: ({ image }) =>
    z.object({
      id: z.string().regex(/^[a-z0-9-]+$/, 'Nur Kleinbuchstaben, Ziffern und Bindestriche'),
      veroeffentlicht: z.boolean().default(true),
      titel: z.string(),
      art: z.string(),
      vermarktung: z.enum(['Kauf', 'Miete']),
      ort: z.string(),
      kurzbeschreibung: z.string(),
      beschreibung: z.array(z.string()).min(1),
      preis: z.string().optional(),
      kennzahlen: z.array(z.object({ label: z.string(), wert: z.string() })).default([]),
      energie: z.string().optional(),
      bilder: z.array(z.object({ src: image(), alt: z.string() })).min(1),
    }),
});

export const collections = { objekte };
