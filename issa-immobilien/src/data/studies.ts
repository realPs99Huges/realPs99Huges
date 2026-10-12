import residence from '../assets/studies/residence.jpg';
import facade from '../assets/studies/facade.jpg';
import interior from '../assets/studies/interior.jpg';
import urban from '../assets/studies/urban.jpg';
import horizon from '../assets/studies/horizon.jpg';

/**
 * Architekturstudien (gerenderte Visualisierungen, siehe scripts/render).
 * Keine realen oder angebotenen Objekte. Zum Austausch gegen echte
 * Fotografie: Datei in src/assets ersetzen und Text hier anpassen.
 */
export const studies = {
  residence: {
    src: residence,
    no: '01',
    caption: 'Studie Wohnhaus, auskragender Baukörper',
    alt: 'Visualisierung eines modernen Wohnhauses mit hell verputztem, auskragendem Obergeschoss und Bandfenster im warmen Streiflicht',
  },
  facade: {
    src: facade,
    no: '02',
    caption: 'Studie Fassade, Lamellen und Laibung',
    alt: 'Visualisierung eines Fassadendetails: vertikale Lamellen werfen Schatten auf eine helle Putzfläche mit tief liegendem Fenster',
  },
  interior: {
    src: interior,
    no: '03',
    caption: 'Studie Innenraum, Lichteinfall',
    alt: 'Visualisierung eines ruhigen Innenraums, in den Sonnenlicht durch eine große Wandöffnung auf den Boden fällt',
  },
  urban: {
    src: urban,
    no: '04',
    caption: 'Studie Gewerbebau, Rasterfassade',
    alt: 'Visualisierung eines Gewerbegebäudes mit tiefer, regelmäßiger Rasterfassade aus Naturstein in Untersicht',
  },
  horizon: {
    src: horizon,
    no: '05',
    caption: 'Studie Wohnhaus, Mauer und Dach im Abendlicht',
    alt: 'Visualisierung eines flachen Wohnhauses mit weit auskragendem Dach und freistehender Mauer im warmen Abendlicht',
  },
} as const;

export type StudyKey = keyof typeof studies;
