export type ElementId = 'fire' | 'earth' | 'air' | 'water';
export type ModalityId = 'cardinal' | 'fixed' | 'mutable';
export type PlanetId =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto';

export type ZodiacId =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export interface ZodiacSign {
  id: ZodiacId;
  name: string;
  /** Latin name of the constellation, e.g. "Aries". */
  image: string;
  index: number;
  element: ElementId;
  modality: ModalityId;
  ruler: PlanetId;
  /** Traditional (pre-modern) ruler where it differs from the modern one. */
  traditionalRuler?: PlanetId;
  /** Conventional calendar range, [month, day] — the exact switch varies by year. */
  start: [number, number];
  end: [number, number];
  archetype: string;
  keywords: [string, string, string];
  essence: string;
}

export const ZODIAC: readonly ZodiacSign[] = [
  {
    id: 'aries',
    name: 'Widder',
    image: 'Aries',
    index: 0,
    element: 'fire',
    modality: 'cardinal',
    ruler: 'mars',
    start: [3, 21],
    end: [4, 19],
    archetype: 'Pionierseele',
    keywords: ['Initiative', 'Mut', 'Direktheit'],
    essence: 'Der erste Funke des Tierkreises – der Impuls, anzufangen.',
  },
  {
    id: 'taurus',
    name: 'Stier',
    image: 'Taurus',
    index: 1,
    element: 'earth',
    modality: 'fixed',
    ruler: 'venus',
    start: [4, 20],
    end: [5, 20],
    archetype: 'Hüterseele',
    keywords: ['Geduld', 'Sinnlichkeit', 'Beständigkeit'],
    essence: 'Die ruhige, sichere Kraft, die aus Samen Gärten macht.',
  },
  {
    id: 'gemini',
    name: 'Zwillinge',
    image: 'Gemini',
    index: 2,
    element: 'air',
    modality: 'mutable',
    ruler: 'mercury',
    start: [5, 21],
    end: [6, 20],
    archetype: 'Botenseele',
    keywords: ['Neugier', 'Witz', 'Wandelbarkeit'],
    essence: 'Ein Geist mit zwei offenen Fenstern.',
  },
  {
    id: 'cancer',
    name: 'Krebs',
    image: 'Cancer',
    index: 3,
    element: 'water',
    modality: 'cardinal',
    ruler: 'moon',
    start: [6, 21],
    end: [7, 22],
    archetype: 'Gezeitenseele',
    keywords: ['Hingabe', 'Intuition', 'Erinnerung'],
    essence: 'Die Flut, die alles nach Hause trägt.',
  },
  {
    id: 'leo',
    name: 'Löwe',
    image: 'Leo',
    index: 4,
    element: 'fire',
    modality: 'fixed',
    ruler: 'sun',
    start: [7, 23],
    end: [8, 22],
    archetype: 'Sonnenseele',
    keywords: ['Wärme', 'Großzügigkeit', 'Ausdruck'],
    essence: 'Ein Herz, das gesehen werden will – und andere strahlen lässt.',
  },
  {
    id: 'virgo',
    name: 'Jungfrau',
    image: 'Virgo',
    index: 5,
    element: 'earth',
    modality: 'mutable',
    ruler: 'mercury',
    start: [8, 23],
    end: [9, 22],
    archetype: 'Handwerkerseele',
    keywords: ['Urteilskraft', 'Fürsorge', 'Können'],
    essence: 'Präzision als stille Form der Hingabe.',
  },
  {
    id: 'libra',
    name: 'Waage',
    image: 'Libra',
    index: 6,
    element: 'air',
    modality: 'cardinal',
    ruler: 'venus',
    start: [9, 23],
    end: [10, 22],
    archetype: 'Harmonieseele',
    keywords: ['Balance', 'Anmut', 'Fairness'],
    essence: 'Die leise Kunst, zwei Wahrheiten zugleich zu halten.',
  },
  {
    id: 'scorpio',
    name: 'Skorpion',
    image: 'Scorpius',
    index: 7,
    element: 'water',
    modality: 'fixed',
    ruler: 'pluto',
    traditionalRuler: 'mars',
    start: [10, 23],
    end: [11, 21],
    archetype: 'Alchemistenseele',
    keywords: ['Tiefe', 'Intensität', 'Wandlung'],
    essence: 'Was verborgen ist, wird zur Quelle der Kraft.',
  },
  {
    id: 'sagittarius',
    name: 'Schütze',
    image: 'Sagittarius',
    index: 8,
    element: 'fire',
    modality: 'mutable',
    ruler: 'jupiter',
    start: [11, 22],
    end: [12, 21],
    archetype: 'Entdeckerseele',
    keywords: ['Freiheit', 'Zuversicht', 'Horizont'],
    essence: 'Ein Pfeil, abgeschossen zum fernsten Rand der Bedeutung.',
  },
  {
    id: 'capricorn',
    name: 'Steinbock',
    image: 'Capricornus',
    index: 9,
    element: 'earth',
    modality: 'cardinal',
    ruler: 'saturn',
    start: [12, 22],
    end: [1, 19],
    archetype: 'Baumeisterseele',
    keywords: ['Ehrgeiz', 'Disziplin', 'Ausdauer'],
    essence: 'Der lange Aufstieg, Schritt für bewussten Schritt.',
  },
  {
    id: 'aquarius',
    name: 'Wassermann',
    image: 'Aquarius',
    index: 10,
    element: 'air',
    modality: 'fixed',
    ruler: 'uranus',
    traditionalRuler: 'saturn',
    start: [1, 20],
    end: [2, 18],
    archetype: 'Visionärsseele',
    keywords: ['Originalität', 'Unabhängigkeit', 'Ideale'],
    essence: 'Die Zukunft in die Gegenwart gießen.',
  },
  {
    id: 'pisces',
    name: 'Fische',
    image: 'Pisces',
    index: 11,
    element: 'water',
    modality: 'mutable',
    ruler: 'neptune',
    traditionalRuler: 'jupiter',
    start: [2, 19],
    end: [3, 20],
    archetype: 'Träumerseele',
    keywords: ['Empathie', 'Fantasie', 'Transzendenz'],
    essence: 'Zwei Strömungen, ein Ozean – die weiteste Flut des Tierkreises.',
  },
];

export const ELEMENTS: Record<ElementId, { name: string; quality: string; polarity: string }> = {
  fire: { name: 'Feuer', quality: 'Geist & Wille', polarity: 'Aktiv' },
  earth: { name: 'Erde', quality: 'Form & Substanz', polarity: 'Empfangend' },
  air: { name: 'Luft', quality: 'Verstand & Verbindung', polarity: 'Aktiv' },
  water: { name: 'Wasser', quality: 'Gefühl & Erinnerung', polarity: 'Empfangend' },
};

export const MODALITIES: Record<ModalityId, { name: string; quality: string }> = {
  cardinal: { name: 'Kardinal', quality: 'beginnt' },
  fixed: { name: 'Fix', quality: 'bewahrt' },
  mutable: { name: 'Veränderlich', quality: 'passt sich an' },
};

export const PLANETS: Record<PlanetId, { name: string; theme: string }> = {
  sun: { name: 'Sonne', theme: 'Lebenskraft und Selbstausdruck' },
  moon: { name: 'Mond', theme: 'Gefühl, Erinnerung und Zugehörigkeit' },
  mercury: { name: 'Merkur', theme: 'Denken, Sprache und Austausch' },
  venus: { name: 'Venus', theme: 'Schönheit, Werte und Verbindung' },
  mars: { name: 'Mars', theme: 'Antrieb, Mut und Begehren' },
  jupiter: { name: 'Jupiter', theme: 'Wachstum, Sinn und Großzügigkeit' },
  saturn: { name: 'Saturn', theme: 'Struktur, Zeit und Meisterschaft' },
  uranus: { name: 'Uranus', theme: 'Erwachen, Freiheit und Erfindung' },
  neptune: { name: 'Neptun', theme: 'Träume, Intuition und das Grenzenlose' },
  pluto: { name: 'Pluto', theme: 'Tiefe, Macht und Erneuerung' },
};

export function getSign(id: ZodiacId): ZodiacSign {
  const sign = ZODIAC.find((s) => s.id === id);
  if (!sign) throw new Error(`Unknown zodiac sign: ${id}`);
  return sign;
}

export function signByIndex(index: number): ZodiacSign {
  return ZODIAC[((index % 12) + 12) % 12];
}

export function oppositeSign(sign: ZodiacSign): ZodiacSign {
  return signByIndex(sign.index + 6);
}

/** Signs that share an element, starting with the given sign (used for decans). */
export function triplicity(sign: ZodiacSign): ZodiacSign[] {
  return [sign, signByIndex(sign.index + 4), signByIndex(sign.index + 8)];
}

const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];

export function formatSignRange(sign: ZodiacSign): string {
  const [sm, sd] = sign.start;
  const [em, ed] = sign.end;
  return `${sd}. ${MONTHS[sm - 1]} – ${ed}. ${MONTHS[em - 1]}`;
}
