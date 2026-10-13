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
  /** Symbolic image of the sign, e.g. "The Ram". */
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
    name: 'Aries',
    image: 'The Ram',
    index: 0,
    element: 'fire',
    modality: 'cardinal',
    ruler: 'mars',
    start: [3, 21],
    end: [4, 19],
    archetype: 'The Pathfinder',
    keywords: ['Initiative', 'Courage', 'Directness'],
    essence: 'The first spark of the zodiac — the instinct to begin.',
  },
  {
    id: 'taurus',
    name: 'Taurus',
    image: 'The Bull',
    index: 1,
    element: 'earth',
    modality: 'fixed',
    ruler: 'venus',
    start: [4, 20],
    end: [5, 20],
    archetype: 'The Keeper',
    keywords: ['Patience', 'Sensuality', 'Steadiness'],
    essence: 'The slow, certain force that turns seeds into gardens.',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    image: 'The Twins',
    index: 2,
    element: 'air',
    modality: 'mutable',
    ruler: 'mercury',
    start: [5, 21],
    end: [6, 20],
    archetype: 'The Messenger',
    keywords: ['Curiosity', 'Wit', 'Adaptability'],
    essence: 'A mind with two windows, always open to the wind.',
  },
  {
    id: 'cancer',
    name: 'Cancer',
    image: 'The Crab',
    index: 3,
    element: 'water',
    modality: 'cardinal',
    ruler: 'moon',
    start: [6, 21],
    end: [7, 22],
    archetype: 'The Guardian',
    keywords: ['Devotion', 'Intuition', 'Memory'],
    essence: 'The tide that carries everything home.',
  },
  {
    id: 'leo',
    name: 'Leo',
    image: 'The Lion',
    index: 4,
    element: 'fire',
    modality: 'fixed',
    ruler: 'sun',
    start: [7, 23],
    end: [8, 22],
    archetype: 'The Sovereign',
    keywords: ['Warmth', 'Generosity', 'Expression'],
    essence: 'A heart that insists on being seen — and lets others shine.',
  },
  {
    id: 'virgo',
    name: 'Virgo',
    image: 'The Maiden',
    index: 5,
    element: 'earth',
    modality: 'mutable',
    ruler: 'mercury',
    start: [8, 23],
    end: [9, 22],
    archetype: 'The Artisan',
    keywords: ['Discernment', 'Care', 'Craft'],
    essence: 'Precision as a quiet form of devotion.',
  },
  {
    id: 'libra',
    name: 'Libra',
    image: 'The Scales',
    index: 6,
    element: 'air',
    modality: 'cardinal',
    ruler: 'venus',
    start: [9, 23],
    end: [10, 22],
    archetype: 'The Harmonist',
    keywords: ['Balance', 'Grace', 'Fairness'],
    essence: 'The quiet art of holding two truths at once.',
  },
  {
    id: 'scorpio',
    name: 'Scorpio',
    image: 'The Scorpion',
    index: 7,
    element: 'water',
    modality: 'fixed',
    ruler: 'pluto',
    traditionalRuler: 'mars',
    start: [10, 23],
    end: [11, 21],
    archetype: 'The Alchemist',
    keywords: ['Depth', 'Intensity', 'Transformation'],
    essence: 'What is hidden becomes the source of power.',
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    image: 'The Archer',
    index: 8,
    element: 'fire',
    modality: 'mutable',
    ruler: 'jupiter',
    start: [11, 22],
    end: [12, 21],
    archetype: 'The Voyager',
    keywords: ['Freedom', 'Faith', 'Horizon'],
    essence: 'An arrow loosed toward the far edge of meaning.',
  },
  {
    id: 'capricorn',
    name: 'Capricorn',
    image: 'The Sea-Goat',
    index: 9,
    element: 'earth',
    modality: 'cardinal',
    ruler: 'saturn',
    start: [12, 22],
    end: [1, 19],
    archetype: 'The Architect',
    keywords: ['Ambition', 'Discipline', 'Endurance'],
    essence: 'The long climb, taken one deliberate step at a time.',
  },
  {
    id: 'aquarius',
    name: 'Aquarius',
    image: 'The Water-Bearer',
    index: 10,
    element: 'air',
    modality: 'fixed',
    ruler: 'uranus',
    traditionalRuler: 'saturn',
    start: [1, 20],
    end: [2, 18],
    archetype: 'The Visionary',
    keywords: ['Originality', 'Independence', 'Ideals'],
    essence: 'Pouring the future into the present.',
  },
  {
    id: 'pisces',
    name: 'Pisces',
    image: 'The Fishes',
    index: 11,
    element: 'water',
    modality: 'mutable',
    ruler: 'neptune',
    traditionalRuler: 'jupiter',
    start: [2, 19],
    end: [3, 20],
    archetype: 'The Dreamer',
    keywords: ['Empathy', 'Imagination', 'Transcendence'],
    essence: 'Two currents, one ocean — the widest tide of the zodiac.',
  },
];

export const ELEMENTS: Record<ElementId, { name: string; quality: string; polarity: string }> = {
  fire: { name: 'Fire', quality: 'spirit & will', polarity: 'Active' },
  earth: { name: 'Earth', quality: 'form & substance', polarity: 'Receptive' },
  air: { name: 'Air', quality: 'mind & connection', polarity: 'Active' },
  water: { name: 'Water', quality: 'feeling & memory', polarity: 'Receptive' },
};

export const MODALITIES: Record<ModalityId, { name: string; quality: string }> = {
  cardinal: { name: 'Cardinal', quality: 'initiates' },
  fixed: { name: 'Fixed', quality: 'sustains' },
  mutable: { name: 'Mutable', quality: 'adapts' },
};

export const PLANETS: Record<PlanetId, { name: string; theme: string }> = {
  sun: { name: 'Sun', theme: 'vitality and self-expression' },
  moon: { name: 'Moon', theme: 'feeling, memory and belonging' },
  mercury: { name: 'Mercury', theme: 'thought, language and exchange' },
  venus: { name: 'Venus', theme: 'beauty, value and connection' },
  mars: { name: 'Mars', theme: 'drive, courage and desire' },
  jupiter: { name: 'Jupiter', theme: 'growth, meaning and generosity' },
  saturn: { name: 'Saturn', theme: 'structure, time and mastery' },
  uranus: { name: 'Uranus', theme: 'awakening, freedom and invention' },
  neptune: { name: 'Neptune', theme: 'dreams, intuition and the boundless' },
  pluto: { name: 'Pluto', theme: 'depth, power and renewal' },
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatSignRange(sign: ZodiacSign): string {
  const [sm, sd] = sign.start;
  const [em, ed] = sign.end;
  return `${MONTHS[sm - 1]} ${sd} — ${MONTHS[em - 1]} ${ed}`;
}
