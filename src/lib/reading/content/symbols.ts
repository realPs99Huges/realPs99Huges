import type { DayPartId, MoonPhaseId } from '../../astro/sky';
import type { ElementId, ModalityId } from '../../astro/zodiac';
import type { GlyphId } from '../types';

export const ELEMENT_CONTENT: Record<
  ElementId,
  {
    temperament: [string, string];
    adjective: string;
    landscapes: string;
    motifs: string;
    recharge: string;
    direction: string;
  }
> = {
  fire: {
    temperament: [
      'As a fire sign, your symbolic temperament is warm, kinetic and expressive — energy that seeks movement and meaning.',
      'Fire signs are traditionally linked to spirit and will. In your profile this element may show up as enthusiasm, an instinct to act and a deep need for inspiration.',
    ],
    adjective: 'fiery, expressive',
    landscapes: 'sunlit plateaus, volcanic islands and wide desert horizons',
    motifs: 'the hearth, festival fires and midsummer celebrations',
    recharge: 'movement, adventure, play and time in strong daylight',
    direction: 'south',
  },
  earth: {
    temperament: [
      'As an earth sign, your symbolic temperament is grounded, patient and practical — energy that seeks form and lasting value.',
      'Earth signs are traditionally linked to substance and the senses. In your profile this element may show up as steadiness, craft and a deep trust in what is real.',
    ],
    adjective: 'grounded, patient',
    landscapes: 'old forests, mountain valleys and terraced fields',
    motifs: 'harvest festivals, craft traditions and village markets',
    recharge: 'nature, routine, good food and work with your hands',
    direction: 'north',
  },
  air: {
    temperament: [
      'As an air sign, your symbolic temperament is curious, social and articulate — energy that seeks ideas and connection.',
      'Air signs are traditionally linked to the mind and to exchange. In your profile this element may show up as curiosity, perspective and a love of conversation.',
    ],
    adjective: 'curious, connective',
    landscapes: 'open plains, windswept coasts and crossroads cities',
    motifs: 'trade routes, libraries and travelling messengers',
    recharge: 'conversation, learning, open space and fresh perspectives',
    direction: 'east',
  },
  water: {
    temperament: [
      'As a water sign, your symbolic temperament is feeling, intuitive and receptive — energy that seeks depth and belonging.',
      'Water signs are traditionally linked to emotion and memory. In your profile this element may show up as empathy, imagination and a strong inner tide.',
    ],
    adjective: 'deep, intuitive',
    landscapes: 'river deltas, harbours, lake shores and misty coastlines',
    motifs: 'seafaring songs, sacred springs and stories of the tide',
    recharge: 'solitude, music, water and trusted company',
    direction: 'west',
  },
};

export const MODALITY_CONTENT: Record<ModalityId, { text: string; phrase: string }> = {
  cardinal: {
    text: 'Your sign is cardinal — in astrological tradition, cardinal signs open each season. This suggests a talent for initiating, for setting things in motion.',
    phrase: 'loves to set things in motion',
  },
  fixed: {
    text: 'Your sign is fixed — fixed signs hold the heart of each season, when it is at its fullest. This suggests a talent for sustaining: depth, persistence and loyalty.',
    phrase: 'holds steady and goes deep',
  },
  mutable: {
    text: 'Your sign is mutable — mutable signs close each season and prepare the next. This suggests a talent for adapting: bridging, learning and transforming.',
    phrase: 'adapts, bridges and transforms',
  },
};

export const DAY_PART_CONTENT: Record<
  DayPartId,
  {
    label: string;
    phrase: string;
    adjectives: [string, string, string];
    text: string;
    latin: string;
    latinMeaning: string;
  }
> = {
  'deep-night': {
    label: 'Deep night',
    phrase: 'in the deep of the night',
    adjectives: ['Midnight', 'Moonlit', 'Velvet'],
    text: 'You arrived in the deepest part of the night, when the world is quiet and the sky is at its fullest. Symbolically, a night birth is associated with an inner, reflective light — insight that grows in stillness.',
    latin: 'Noctis',
    latinMeaning: 'of the Night',
  },
  'before-dawn': {
    label: 'Before dawn',
    phrase: 'in the hours before dawn',
    adjectives: ['Starlit', 'Silent', 'Veiled'],
    text: 'You were born in the hours before dawn, when the last stars fade into blue. Symbolically, this is the hour of thresholds — of patience, anticipation and quiet beginnings.',
    latin: 'Silentii',
    latinMeaning: 'of Silence',
  },
  dawn: {
    label: 'Dawn',
    phrase: 'at dawn',
    adjectives: ['Dawn', 'Daybreak', 'Aurora'],
    text: 'You arrived around dawn, as the Sun crossed the eastern horizon. In astrological symbolism, a sunrise birth places the Sun near the Ascendant — the point of self and emergence.',
    latin: 'Aurorae',
    latinMeaning: 'of the Dawn',
  },
  morning: {
    label: 'Morning',
    phrase: 'in the morning light',
    adjectives: ['Bright', 'Morning', 'Rising'],
    text: 'You were born in the morning, as the Sun climbed toward its height. Symbolically, morning births carry the energy of growth, purpose and outward momentum.',
    latin: 'Diei',
    latinMeaning: 'of the Day',
  },
  zenith: {
    label: 'Midday',
    phrase: 'near midday',
    adjectives: ['Zenith', 'Solar', 'Meridian'],
    text: 'You arrived near midday, when the Sun stands close to its highest point. Symbolically, the zenith is associated with visibility, vocation and the public self.',
    latin: 'Meridiei',
    latinMeaning: 'of Noon',
  },
  afternoon: {
    label: 'Afternoon',
    phrase: 'in the long afternoon light',
    adjectives: ['Golden', 'Amber', 'Sunlit'],
    text: 'You were born in the afternoon, in the long, slanting light. Symbolically, this is the hour of relationship and exchange — of what we build together.',
    latin: 'Solis',
    latinMeaning: 'of the Sun',
  },
  dusk: {
    label: 'Dusk',
    phrase: 'at dusk',
    adjectives: ['Twilight', 'Dusk', 'Vesper'],
    text: 'You arrived around dusk, as the Sun sank toward the western horizon. In astrological symbolism, a sunset birth places the Sun near the Descendant — the point of encounter and partnership.',
    latin: 'Crepusculi',
    latinMeaning: 'of Twilight',
  },
  evening: {
    label: 'Evening',
    phrase: 'in the evening',
    adjectives: ['Indigo', 'Nightfall', 'Evening'],
    text: 'You were born in the evening, as the first stars appeared. Symbolically, evening births are linked to the inner life — to imagination, intimacy and the stories we tell in the dark.',
    latin: 'Vesperis',
    latinMeaning: 'of the Evening',
  },
  unknown: {
    label: 'Unknown hour',
    phrase: 'at an unrecorded hour',
    adjectives: ['Uncharted', 'Unwritten', 'Hidden'],
    text: 'Your exact hour is unknown — and that, too, is part of your story. Without a birth time, this reading focuses on your Sun and the Moon’s phase, leaving the symbolism of the hour open, like an unmapped region of the sky.',
    latin: 'Ignoti',
    latinMeaning: 'of the Unknown',
  },
};

export const MOON_CONTENT: Record<MoonPhaseId, { adjectives: [string, string]; text: string; short: string }> = {
  new: {
    adjectives: ['Hidden', 'Unseen'],
    text: 'Born under a New Moon, when the Moon is dark and hidden: in lunar symbolism, a time of seeds and intentions — of instinct and fresh starts.',
    short: 'seeds and intentions',
  },
  'waxing-crescent': {
    adjectives: ['Crescent', 'Silver'],
    text: 'Born under a waxing crescent, as the first sliver of light returns: a phase associated with hope, emerging courage and the will to grow.',
    short: 'hope and emerging courage',
  },
  'first-quarter': {
    adjectives: ['Kindled', 'Rising'],
    text: 'Born under a First Quarter Moon, half in light and half in shadow: a phase associated with decision, action and building through challenge.',
    short: 'decision and action',
  },
  'waxing-gibbous': {
    adjectives: ['Gathering', 'Lucent'],
    text: 'Born under a waxing gibbous Moon, almost full: a phase associated with refinement, devotion and the patience to perfect.',
    short: 'refinement and devotion',
  },
  full: {
    adjectives: ['Luminous', 'Lunar'],
    text: 'Born under a Full Moon, when the Moon stands opposite the Sun: a phase associated with illumination, relationship and the meeting of opposites.',
    short: 'illumination and relationship',
  },
  'waning-gibbous': {
    adjectives: ['Gilded', 'Generous'],
    text: 'Born under a waning gibbous Moon, as the light begins to recede: a phase associated with sharing, teaching and passing wisdom on.',
    short: 'sharing and teaching',
  },
  'last-quarter': {
    adjectives: ['Turning', 'Crossroads'],
    text: 'Born under a Last Quarter Moon, half lit and half dark: a phase associated with re-evaluation, release and turning points.',
    short: 're-evaluation and release',
  },
  'waning-crescent': {
    adjectives: ['Dreaming', 'Quiet'],
    text: 'Born under a waning crescent, the Moon’s final sliver: a phase associated with dreams, rest, intuition and endings that prepare beginnings.',
    short: 'dreams and quiet renewal',
  },
};

export const HOUSES: Array<{ name: string; theme: string }> = [
  { name: 'house of self', theme: 'identity, presence and new beginnings' },
  { name: 'house of resources', theme: 'values, security and self-worth' },
  { name: 'house of communication', theme: 'learning, siblings and the nearby world' },
  { name: 'house of roots', theme: 'home, family and inner foundations' },
  { name: 'house of creativity', theme: 'joy, play, romance and self-expression' },
  { name: 'house of craft', theme: 'daily rhythms, health and service' },
  { name: 'house of partnership', theme: 'close relationships and meeting the other' },
  { name: 'house of transformation', theme: 'intimacy, shared resources and renewal' },
  { name: 'house of horizons', theme: 'travel, philosophy and higher learning' },
  { name: 'house of vocation', theme: 'calling, public life and legacy' },
  { name: 'house of community', theme: 'friendship, networks and hopes for the future' },
  { name: 'house of the hidden', theme: 'solitude, dreams and the unconscious' },
];

export interface IntentionTheme {
  id: string;
  focus: string;
  keywords: string[];
  question: string;
  night: string;
}

/**
 * Keyword themes (English & German) used to echo the visitor's own question.
 * A trailing * marks a prefix; entries with spaces match as phrases.
 */
export const INTENTION_THEMES: IntentionTheme[] = [
  {
    id: 'connection',
    focus: 'love and connection',
    keywords: [
      'lov*',
      'relationship*',
      'partner*',
      'heart*',
      'dating',
      'romanc*',
      'marriage',
      'married',
      'friend*',
      'lonel*',
      'liebe',
      'verliebt',
      'beziehung*',
      'herz*',
      'freund*',
      'einsam*',
      'ehe',
    ],
    question: 'In your closest connections, what are you longing to give — and what are you longing to receive?',
    night: 'Write a short letter — not to be sent — to someone who shaped how you love.',
  },
  {
    id: 'vocation',
    focus: 'purpose and vocation',
    keywords: [
      'career*',
      'work*',
      'job*',
      'purpose*',
      'calling',
      'success*',
      'money',
      'business*',
      'stud*',
      'beruf*',
      'karriere*',
      'arbeit*',
      'erfolg*',
      'geld',
    ],
    question: 'If your work were a true expression of who you are, what would it look like a year from now?',
    night: 'List three moments when work felt meaningful. What did they have in common?',
  },
  {
    id: 'creativity',
    focus: 'creativity and expression',
    keywords: [
      'creat*',
      'art',
      'artist*',
      'writ*',
      'music*',
      'paint*',
      'design*',
      'express*',
      'kreativ*',
      'kunst*',
      'künstler*',
      'schreib*',
      'musik*',
      'malen',
      'zeichn*',
    ],
    question: 'Which creative impulse have you been waiting for permission to follow?',
    night: 'Make something small and imperfect in ten minutes — then write about how it felt.',
  },
  {
    id: 'roots',
    focus: 'roots and belonging',
    keywords: [
      'famil*',
      'home',
      'root',
      'roots',
      'parent*',
      'mother*',
      'father*',
      'origin*',
      'ancest*',
      'heritage',
      'cultur*',
      'childhood',
      'zuhause',
      'heimat*',
      'wurzel*',
      'eltern',
      'mutter',
      'vater',
      'herkunft',
      'vorfahr*',
      'kindheit*',
      'kultur*',
    ],
    question: 'Which story from your family would you like to understand better — and who could you ask about it?',
    night: 'Write down a family story you were told as a child. What did it teach you about belonging?',
  },
  {
    id: 'change',
    focus: 'change and direction',
    keywords: [
      'chang*',
      'transition*',
      'mov*',
      'decision*',
      'decid*',
      'choos*',
      'choice*',
      'futur*',
      'direction*',
      'lost',
      'veränder*',
      'wandel*',
      'umzug*',
      'entscheid*',
      'zukunft*',
      'richtung*',
      'neuanfang*',
      'neubeginn*',
    ],
    question: 'What small step would make the change you are considering feel real?',
    night: 'Describe your life one year from now as if it had already happened — in the present tense.',
  },
  {
    id: 'calm',
    focus: 'inner calm',
    keywords: [
      'fear*',
      'anxi*',
      'stress*',
      'calm*',
      'peace*',
      'worr*',
      'overwhelm*',
      'burnout',
      'rest',
      'angst*',
      'ängst*',
      'ruhe*',
      'frieden*',
      'sorge*',
      'überforder*',
      'erschöpf*',
      'gelassen*',
    ],
    question: 'What helps you remember, in your body, that you are safe right now?',
    night: 'Notice five quiet things around you before sleep. Write them down without judging.',
  },
  {
    id: 'self',
    focus: 'self-understanding',
    keywords: [
      'who am i',
      'wer bin ich',
      'myself',
      'identity',
      'confiden*',
      'personalit*',
      'strength*',
      'meaning*',
      'selbst*',
      'identität*',
      'persönlichkeit*',
      'stärke*',
      'sinn*',
    ],
    question: 'Which part of yourself are you only beginning to get to know?',
    night: 'Write the sentence “I am someone who…” ten times, finishing it differently each time.',
  },
];

export interface LifeCycle {
  id: string;
  age: number;
  glyph: GlyphId;
  title: string;
  cycle: string;
  theme: string;
  question: string;
}

/** Long astrological cycles, at their approximate ages. Symbolic — never predictive. */
export const LIFE_CYCLES: LifeCycle[] = [
  {
    id: 'birth',
    age: 0,
    glyph: 'sun',
    title: 'First Light',
    cycle: 'Birth',
    theme: 'The sky of your birth — the opening image of your story.',
    question: 'What do you know about the day you were born, and who could tell you more?',
  },
  {
    id: 'saturn-square',
    age: 7.4,
    glyph: 'saturn',
    title: 'The First Structure',
    cycle: 'Saturn’s first square',
    theme: 'Traditionally linked with first encounters with rules, responsibility and the wider world.',
    question: 'What did you learn early about what was expected of you?',
  },
  {
    id: 'jupiter-return-1',
    age: 11.9,
    glyph: 'jupiter',
    title: 'The First Horizon',
    cycle: 'First Jupiter return',
    theme: 'Associated with expansion — the moment the world grows larger than home.',
    question: 'What first made you feel that the world was bigger than you had imagined?',
  },
  {
    id: 'nodal-return-1',
    age: 18.6,
    glyph: 'node',
    title: 'The Calling Voice',
    cycle: 'First lunar nodal return',
    theme: 'Associated in astrology with direction and a first sense of a personal path.',
    question: 'What were you searching for at eighteen or nineteen — and is it still calling?',
  },
  {
    id: 'saturn-return-1',
    age: 29.5,
    glyph: 'saturn',
    title: 'The Threshold',
    cycle: 'First Saturn return',
    theme:
      'Perhaps the most discussed cycle in astrology, associated with maturity and choosing what truly belongs to you.',
    question: 'Which of your commitments are truly yours, and which did you inherit?',
  },
  {
    id: 'nodal-return-2',
    age: 37.2,
    glyph: 'node',
    title: 'The Second Compass',
    cycle: 'Second lunar nodal return',
    theme: 'Associated with re-examining direction in the light of experience.',
    question: 'If your path were a river, where has it been carving its course?',
  },
  {
    id: 'uranus-opposition',
    age: 42,
    glyph: 'uranus',
    title: 'The Awakening',
    cycle: 'Uranus opposition',
    theme: 'Associated with mid-life reinvention — a call toward authenticity and freedom.',
    question: 'Which part of you is asking for more freedom to exist?',
  },
  {
    id: 'chiron-return',
    age: 50.7,
    glyph: 'chiron',
    title: 'The Healer’s Return',
    cycle: 'Chiron return',
    theme: 'Associated with turning old wounds into wisdom and mentorship.',
    question: 'What has your life taught you that you could now pass on?',
  },
  {
    id: 'saturn-return-2',
    age: 58.9,
    glyph: 'saturn',
    title: 'The Harvest',
    cycle: 'Second Saturn return',
    theme: 'Associated with legacy, mastery and choosing what deserves your energy.',
    question: 'What would you like your work and presence to leave behind?',
  },
  {
    id: 'jupiter-return-6',
    age: 71.2,
    glyph: 'jupiter',
    title: 'The Elder Horizon',
    cycle: 'Sixth Jupiter return',
    theme: 'Associated with wisdom, generosity and a widened perspective.',
    question: 'Which piece of wisdom would you most like to share with someone younger?',
  },
  {
    id: 'uranus-return',
    age: 84,
    glyph: 'uranus',
    title: 'The Full Circle',
    cycle: 'Uranus return',
    theme: 'Uranus completes one orbit of the Sun — a symbolic full circle of a lifetime.',
    question: 'Looking at the whole arc, what has been the golden thread?',
  },
];

export const BIRTHSTONES = [
  'Garnet',
  'Amethyst',
  'Aquamarine',
  'Diamond',
  'Emerald',
  'Pearl',
  'Ruby',
  'Peridot',
  'Sapphire',
  'Opal',
  'Topaz',
  'Turquoise',
];

export const BIRTH_FLOWERS = [
  'Carnation',
  'Violet',
  'Daffodil',
  'Daisy',
  'Lily of the valley',
  'Rose',
  'Larkspur',
  'Gladiolus',
  'Aster',
  'Marigold',
  'Chrysanthemum',
  'Narcissus',
];

export const ASTERISM_NOUNS: Array<[string, string]> = [
  ['Corona', 'Crown'],
  ['Arcus', 'Arc'],
  ['Lumen', 'Light'],
  ['Velum', 'Veil'],
  ['Porta', 'Gate'],
  ['Ala', 'Wing'],
  ['Rosa', 'Rose'],
  ['Navis', 'Ship'],
  ['Lyra', 'Lyre'],
  ['Clavis', 'Key'],
  ['Fons', 'Spring'],
  ['Scala', 'Stair'],
];

/**
 * Constellation actually behind the Sun (IAU boundaries, current epoch) by calendar date.
 * Differs from the astrological sign because of the precession of Earth's axis.
 */
export const SUN_CONSTELLATIONS: Array<{ name: string; from: [number, number] }> = [
  { name: 'Sagittarius', from: [1, 1] },
  { name: 'Capricornus', from: [1, 20] },
  { name: 'Aquarius', from: [2, 16] },
  { name: 'Pisces', from: [3, 12] },
  { name: 'Aries', from: [4, 19] },
  { name: 'Taurus', from: [5, 14] },
  { name: 'Gemini', from: [6, 21] },
  { name: 'Cancer', from: [7, 20] },
  { name: 'Leo', from: [8, 10] },
  { name: 'Virgo', from: [9, 16] },
  { name: 'Libra', from: [10, 31] },
  { name: 'Scorpius', from: [11, 23] },
  { name: 'Ophiuchus', from: [11, 29] },
  { name: 'Sagittarius', from: [12, 18] },
];
