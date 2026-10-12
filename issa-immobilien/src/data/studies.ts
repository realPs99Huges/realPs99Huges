import residence from '../assets/studies/residence.jpg';
import facade from '../assets/studies/facade.jpg';
import interior from '../assets/studies/interior.jpg';
import urban from '../assets/studies/urban.jpg';
import horizon from '../assets/studies/horizon.jpg';

/**
 * Architekturzeichnungen (gerendert, siehe scripts/render). Sie zeigen
 * keine realen oder angebotenen Objekte. Zum Austausch gegen echte
 * Fotografie: Datei in src/assets ersetzen und Text hier anpassen.
 */
export const studies = {
  residence: {
    src: residence,
    no: '01',
    caption: 'Perspektive Wohnhaus',
    alt: 'Architekturzeichnung eines modernen Wohnhauses mit auskragendem Obergeschoss und Bandfenster, in feinen Linien und hellen Flächentönen',
  },
  facade: {
    src: facade,
    no: '02',
    caption: 'Detail Fassade',
    alt: 'Architekturzeichnung eines Fassadendetails mit vertikalen Lamellen und tief liegendem Fenster',
  },
  interior: {
    src: interior,
    no: '03',
    caption: 'Innenraum mit Lichteinfall',
    alt: 'Architekturzeichnung eines ruhigen Innenraums, in den Licht durch eine große Wandöffnung auf den Boden fällt',
  },
  urban: {
    src: urban,
    no: '04',
    caption: 'Gewerbebau, Rasterfassade',
    alt: 'Architekturzeichnung eines Gewerbegebäudes mit tiefer, regelmäßiger Rasterfassade in Untersicht',
  },
  horizon: {
    src: horizon,
    no: '05',
    caption: 'Wohnhaus mit Mauer',
    alt: 'Architekturzeichnung eines flachen Wohnhauses mit auskragendem Dach und freistehender Mauer',
  },
} as const;

export type StudyKey = keyof typeof studies;
