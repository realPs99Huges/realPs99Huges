import shoppingCenter from '../assets/images/shopping-center-galerie.jpg';
import einkaufsstrasse from '../assets/images/einkaufsstrasse-innenstadt.jpg';
import einzelhandel from '../assets/images/einzelhandel-einkauf.jpg';

/**
 * Bildflächen der Website. Jede Fläche hat einen festen Namen; das Bild
 * wird nur hier zugeordnet. Zum Austausch: Datei in src/assets/images
 * ablegen, unten importieren und der Fläche zuweisen. Flächen ohne Bild
 * (src: null) zeigen eine neutrale Fläche bzw. werden ausgeblendet.
 * Übersicht und empfohlene Größen: docs/BILDER.md
 */
export const imageSlots = {
  /** Startseite, Hero – Handelsimmobilie / Shopping-Center */
  hero: {
    src: shoppingCenter,
    alt: 'Mehrgeschossige Ladenpassage eines Einkaufszentrums mit Rolltreppen und Geschäften',
  },
  /** Startseite, Abschnitt „Deutschlandweit“ – Innenstadt / Handelslage */
  deutschland: {
    src: einkaufsstrasse,
    alt: 'Einkaufsstraße in einer Innenstadt mit Geschäften und Passanten',
  },
  /** Startseite + Seite Handelsimmobilien – Einzelhandel / Kundschaft */
  einzelhandel: {
    src: einzelhandel,
    alt: 'Person mit mehreren Einkaufstüten in einer Einkaufsstraße',
  },
  /** Über Issa Immobilien – Porträt oder Büro (noch nicht geliefert) */
  ueberUns: { src: null, alt: '' },
} as const;

export type ImageSlotName = keyof typeof imageSlots;
