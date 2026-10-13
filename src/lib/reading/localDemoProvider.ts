/**
 * Local, rule-based demo engine.
 *
 * It composes a reading from a hand-written corpus, using real (approximate)
 * astronomy for the Sun's position and the Moon's phase, and a seeded random
 * generator so the same birth data always produces the same reading. Nothing
 * here is an AI model, and nothing leaves the browser.
 */
import {
  ageInYears,
  approximateSunHouse,
  dayPart,
  formatDegree,
  moonPhase,
  momentFromDate,
  parseDate,
  parseTime,
  sunPosition,
  weekdayOf,
  WEEKDAYS,
  type BirthMoment,
  type MoonPhase,
} from '../astro/sky';
import {
  ELEMENTS,
  formatSignRange,
  getSign,
  MODALITIES,
  oppositeSign,
  PLANETS,
  triplicity,
  type ZodiacSign,
} from '../astro/zodiac';
import { compassDirection, distanceKm, findPlace, formatCoordinates, type Place } from '../geo/places';
import { SIGN_CONTENT } from './content/signs';
import {
  ASTERISM_NOUNS,
  BIRTH_FLOWERS,
  BIRTHSTONES,
  DAY_PART_CONTENT,
  ELEMENT_CONTENT,
  HOUSES,
  INTENTION_THEMES,
  LIFE_CYCLES,
  MODALITY_CONTENT,
  MOON_CONTENT,
  SUN_CONSTELLATIONS,
  type IntentionTheme,
} from './content/symbols';
import { createRng, hashString, type Rng } from './random';
import type {
  Asterism,
  CosmicReading,
  Insight,
  MapPoint,
  ReadingEngine,
  ReadingInput,
  ReadingProvider,
  TimelineNode,
} from './types';

export const DEMO_ENGINE: ReadingEngine = {
  kind: 'demo-rules',
  label: 'Demo reading · generated locally by a rule-based engine',
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const ORDINALS = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
  'eleventh',
  'twelfth',
];
const ROMAN = ['I', 'II', 'III'];

const CONSTELLATION_NAMES: Record<string, string> = {
  scorpio: 'Scorpius',
  capricorn: 'Capricornus',
};

const MOON_QUESTIONS: Record<MoonPhase['id'], string> = {
  new: 'What intention would you like to plant — quietly, without announcing it?',
  'waxing-crescent': 'Which fragile beginning in your life deserves protection right now?',
  'first-quarter': 'Which decision have you been circling that is ready to be made?',
  'waxing-gibbous': 'What are you refining that is, in truth, already good enough to share?',
  full: 'What has recently become clear that you could not see before?',
  'waning-gibbous': 'What have you learned that someone else might need to hear?',
  'last-quarter': 'What are you ready to set down so your hands are free again?',
  'waning-crescent': 'Where in your life are you being asked to rest before you begin again?',
};

const DIRECTION_MEANING: Record<string, string> = {
  north: 'the north, which many traditions link with endurance, ancestry and quiet wisdom',
  south: 'the south, which many traditions link with warmth, growth and expression',
  east: 'the east, which many traditions link with sunrise, beginnings and new light',
  west: 'the west, which many traditions link with sunset, reflection and completion',
};

const RECHARGE_BY_MODALITY = {
  cardinal: 'Begin each day with one small act that is entirely your own.',
  fixed: 'Protect one unchanging ritual, even in your busiest weeks.',
  mutable: 'Allow variety — a new route, a new sound, a new conversation.',
};

const INTENTION_NIGHT_PLANET: Record<string, string> = {
  connection: 'Venus',
  vocation: 'Mars',
  creativity: 'Sun',
  roots: 'Saturn',
  change: 'Jupiter',
  calm: 'Moon',
  self: 'Mercury',
};

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function moonPhrase(moon: MoonPhase): string {
  const name = moon.name.toLowerCase();
  return name.endsWith('moon') ? name : `${name} moon`;
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function formatDate(year: number, month: number, day: number): string {
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

function formatKm(km: number): string {
  const rounded = km < 100 ? Math.round(km / 5) * 5 : Math.round(km / 10) * 10;
  return rounded.toLocaleString('en-US');
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** Picks the intention theme with the most keyword hits, if any. */
export function detectIntentionTheme(text: string): IntentionTheme | null {
  const lower = text.toLowerCase();
  if (!lower.trim()) return null;
  const tokens = lower.split(/[^\p{L}]+/u).filter(Boolean);
  let best: IntentionTheme | null = null;
  let bestScore = 0;
  for (const theme of INTENTION_THEMES) {
    let score = 0;
    for (const keyword of theme.keywords) {
      if (keyword.includes(' ')) {
        if (lower.includes(keyword)) score += 2;
      } else if (keyword.endsWith('*')) {
        const stem = keyword.slice(0, -1);
        if (tokens.some((token) => token.startsWith(stem))) score += 1;
      } else if (tokens.includes(keyword)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      best = theme;
      bestScore = score;
    }
  }
  return best;
}

function sunConstellation(month: number, day: number): string {
  let current = SUN_CONSTELLATIONS[0].name;
  for (const entry of SUN_CONSTELLATIONS) {
    const [m, d] = entry.from;
    if (month > m || (month === m && day >= d)) current = entry.name;
  }
  return current;
}

function season(longitude: number, lat: number): { season: string; hemisphere: string } {
  const northern = ['spring', 'summer', 'autumn', 'winter'];
  const southern = ['autumn', 'winter', 'spring', 'summer'];
  const quarter = Math.floor(longitude / 90) % 4;
  return lat >= 0
    ? { season: northern[quarter], hemisphere: 'northern' }
    : { season: southern[quarter], hemisphere: 'southern' };
}

function buildAsterism(rng: Rng, dayPartLatin: string, dayPartMeaning: string): Asterism {
  const count = 5 + Math.floor(rng.next() * 3);
  const stars: Asterism['stars'] = [];
  let attempts = 0;
  while (stars.length < count && attempts < 400) {
    attempts++;
    const x = rng.between(0.14, 0.86);
    const y = rng.between(0.14, 0.86);
    if (stars.every((s) => Math.hypot(s.x - x, s.y - y) > 0.2)) {
      stars.push({ x, y, magnitude: rng.between(0.45, 0.85) });
    }
  }
  stars[Math.floor(rng.next() * stars.length)].magnitude = 1;

  const cx = stars.reduce((sum, s) => sum + s.x, 0) / stars.length;
  const cy = stars.reduce((sum, s) => sum + s.y, 0) / stars.length;
  const order = stars
    .map((s, i) => ({ i, angle: Math.atan2(s.y - cy, s.x - cx) }))
    .sort((a, b) => a.angle - b.angle)
    .map((entry) => entry.i);
  const lines: Asterism['lines'] = [];
  for (let k = 0; k < order.length - 1; k++) lines.push([order[k], order[k + 1]]);
  if (order.length > 4) lines.push([order[0], order[Math.floor(order.length / 2)]]);

  const [noun, nounMeaning] = rng.pick(ASTERISM_NOUNS);
  return {
    name: `${noun} ${dayPartLatin}`,
    translation: `The ${nounMeaning} ${dayPartMeaning}`,
    stars,
    lines,
  };
}

function toMapPoint(place: Place | null, label: string, role: MapPoint['role']): MapPoint | null {
  if (!place) return null;
  return {
    label,
    role,
    lat: place.lat,
    lon: place.lon,
    precision: place.precision,
    coordinates: formatCoordinates(place),
  };
}

function buildTimeline(
  birth: BirthMoment,
  now: Date,
  presentTheme: string,
  presentQuestion: string,
): { free: TimelineNode[]; full: TimelineNode[] } {
  const age = ageInYears(birth, now);
  const birthYearFraction = birth.year + (birth.month - 1) / 12 + (birth.day - 1) / 365;
  const cycles: TimelineNode[] = LIFE_CYCLES.map((cycle) => ({
    id: cycle.id,
    age: cycle.age,
    year: Math.floor(birthYearFraction + cycle.age),
    glyph: cycle.glyph,
    title: cycle.title,
    cycle: cycle.cycle,
    theme: cycle.theme,
    question: cycle.question,
    status: cycle.age === 0 || cycle.age < age - 0.4 ? 'past' : 'future',
  }));
  const present: TimelineNode = {
    id: 'now',
    age,
    year: now.getFullYear(),
    glyph: 'moon',
    title: 'Your Present Sky',
    cycle: `Now · age ${Math.floor(age)}`,
    theme: presentTheme,
    question: presentQuestion,
    status: 'now',
  };

  const full = [...cycles.filter((c) => c.status === 'past'), present, ...cycles.filter((c) => c.status === 'future')];
  const past = cycles.filter((c) => c.status === 'past' && c.id !== 'birth');
  const future = cycles.filter((c) => c.status === 'future');
  const free: TimelineNode[] = [cycles[0]];
  if (past.length) free.push(past[past.length - 1]);
  free.push(present);
  free.push(...future.slice(0, past.length ? 1 : 2));
  return { free, full };
}

export function buildDemoReading(input: ReadingInput, now: Date = new Date()): CosmicReading {
  const date = parseDate(input.birthDate);
  if (!date) throw new Error('Invalid birth date');
  const time = input.birthTimeUnknown ? null : parseTime(input.birthTime);
  const birth: BirthMoment = { ...date, hour: time?.hour ?? 12, minute: time?.minute ?? 0 };

  const sign: ZodiacSign = getSign(input.sign);
  const content = SIGN_CONTENT[sign.id];
  const element = ELEMENTS[sign.element];
  const elementContent = ELEMENT_CONTENT[sign.element];
  const modality = MODALITIES[sign.modality];
  const modalityContent = MODALITY_CONTENT[sign.modality];
  const ruler = PLANETS[sign.ruler];
  const traditional = sign.traditionalRuler ? PLANETS[sign.traditionalRuler] : null;
  const sun = sunPosition(birth);
  const moon = moonPhase(birth);
  const moonContent = MOON_CONTENT[moon.id];
  const part = DAY_PART_CONTENT[dayPart(time?.hour ?? null, time?.minute ?? 0)];
  const weekday = weekdayOf(date.year, date.month, date.day);

  const birthplaceLabel = cleanText(input.birthplace);
  const residenceLabel = cleanText(input.residence);
  const intention = cleanText(input.intention);
  const theme = detectIntentionTheme(intention);

  const seed = hashString(
    [input.birthDate, time ? input.birthTime : 'unknown', birthplaceLabel.toLowerCase(), sign.id].join('|'),
  );
  const rng = createRng(seed);

  // — Title —
  const noun = rng.pick(content.nouns);
  const stem = noun.slice(0, 4).toLowerCase();
  const adjectives = (rng.next() < 0.68 ? part.adjectives : moonContent.adjectives).filter(
    (candidate) => !candidate.toLowerCase().startsWith(stem),
  );
  const adjective = rng.pick(adjectives.length ? adjectives : part.adjectives);
  const title = `The ${adjective} ${noun}`;
  const subtitle = `${article(sign.name).replace(/^a/, 'A')} ${sign.name} Sun born ${part.phrase}, beneath a ${moonPhrase(moon)}.`;

  // — Inner universe selections (shared by free + premium) —
  const strengths = rng.shuffle(content.strengths);
  const tensions = rng.shuffle(content.tensions);
  const growth = rng.pick(content.growth);

  // — Summary —
  const summaryTemplates = [
    () =>
      `${title} — ${article(sign.name)} ${sign.name} Sun born ${part.phrase} in ${birthplaceLabel}, beneath a ${moonPhrase(moon)}. ${sign.essence} Your reading suggests a ${elementContent.adjective} nature that ${modalityContent.phrase}, with a growth theme of ${lowerFirst(growth.title)}.`,
    () =>
      `Born ${part.phrase} in ${birthplaceLabel}, beneath a ${moonPhrase(moon)}, you carry the symbolism of ${lowerFirst(sign.image)} — ${lowerFirst(sign.archetype)} of the zodiac. Your profile points to a ${elementContent.adjective} spirit that ${modalityContent.phrase}; its invitation for now is ${lowerFirst(growth.title)}.`,
  ];
  const summary = rng.pick(summaryTemplates)();

  // — Places —
  const birthPlace = findPlace(birthplaceLabel);
  const homePlace = residenceLabel ? findPlace(residenceLabel) : null;
  const birthPoint = toMapPoint(birthPlace, birthplaceLabel, 'birth');
  const homePoint = toMapPoint(homePlace, residenceLabel, 'home');
  const distance = birthPlace && homePlace ? distanceKm(birthPlace, homePlace) : null;

  // — 01 Identity —
  const rulerLine = traditional
    ? `Your ruling planet is ${ruler.name}, associated with ${ruler.theme}; in older traditions, ${traditional.name} — ${traditional.theme} — rules your sign.`
    : `Your ruling planet is ${ruler.name}, associated with ${ruler.theme}.`;
  let identityNote: string | undefined;
  if (sun.sign.id !== sign.id) {
    identityNote = `The calculated Sun position for your birth moment is ${formatDegree(sun.degree)} ${sun.sign.name}. You chose ${sign.name}, and this reading follows your choice.`;
  } else if (sun.cuspWith) {
    identityNote = `Your Sun sat at ${formatDegree(sun.degree)} ${sun.sign.name}, close to the border with ${sun.cuspWith.name}. Without a time zone the exact switch can shift by a few hours — you may recognise yourself in both.`;
  }

  // — 03 Origins —
  const statementParts: string[] = [];
  if (birthPlace?.precision === 'city') {
    statementParts.push(`You were born in ${birthplaceLabel} — ${formatCoordinates(birthPlace)}.`);
  } else if (birthPlace) {
    statementParts.push(
      `You named ${birthplaceLabel} as your birthplace. ASTRA’s offline atlas marks it at the country’s approximate centre.`,
    );
  } else {
    statementParts.push(
      `You were born in ${birthplaceLabel}. This place is not in ASTRA’s small offline atlas, so it appears by name only — no location service was contacted.`,
    );
  }
  if (residenceLabel) {
    if (distance !== null && distance < 30)
      statementParts.push(`You still live close to where you were born, in ${residenceLabel}.`);
    else if (distance !== null && birthPlace && homePlace)
      statementParts.push(
        `Today you live in ${residenceLabel}, roughly ${formatKm(distance)} km ${compassDirection(birthPlace, homePlace)} of your birthplace.`,
      );
    else statementParts.push(`Today you live in ${residenceLabel}.`);
  }

  // — 04 Timeline —
  const today = momentFromDate(now);
  const todaySun = sunPosition(today);
  const todayMoon = moonPhase(today);
  const presentTheme = `Today the Sun moves through ${todaySun.sign.name} beneath a ${moonPhrase(todayMoon)}. For you, this chapter may be coloured by ${lowerFirst(growth.title)}.`;
  const presentQuestion = theme ? theme.question : MOON_QUESTIONS[todayMoon.id];
  const timeline = buildTimeline(birth, now, presentTheme, presentQuestion);

  // — 05 Reflection —
  const questions = [
    rng.pick(content.questions),
    theme ? theme.question : MOON_QUESTIONS[moon.id],
    `If “${lowerFirst(growth.title)}” were your theme for the coming season, what would you do differently this week?`,
  ];
  const quoted = intention.length > 160 ? `${intention.slice(0, 157).trimEnd()}…` : intention;
  let reflectionIntro = 'Three questions to carry with you. There are no right answers — only honest ones.';
  if (intention && theme) {
    reflectionIntro = `Your own question was the starting point. These prompts are shaped around ${theme.focus} and your ${sign.name} symbolism.`;
  } else if (intention) {
    reflectionIntro =
      'Your own question was the starting point. Let these prompts sit beside it — there are no right answers, only honest ones.';
  }

  // — Premium: extended profile —
  const decanSign = triplicity(sun.sign)[sun.decan - 1];
  const decanRange = `${(sun.decan - 1) * 10}°–${sun.decan * 10}°`;
  const house = time ? approximateSunHouse(time.hour, time.minute) : null;
  const extraStrengths = strengths.slice(3);
  const extraTensions = tensions.slice(2);
  const extendedSections: Insight[] = [
    {
      title: `Decan ${ROMAN[sun.decan - 1]} · ${decanSign.name}`,
      body: `Your Sun sits at about ${formatDegree(sun.degree)} ${sun.sign.name}, in the ${ORDINALS[sun.decan - 1]} decan (${decanRange}). In the triplicity system, this ten-degree band is coloured by ${decanSign.name}: ${lowerFirst(decanSign.essence)}`,
    },
    {
      title: `The ${sign.name}–${oppositeSign(sign).name} axis`,
      body: content.axis,
    },
    {
      title: `${ruler.name}, your ruling planet`,
      body: `${ruler.name} colours ${sign.name} with ${ruler.theme}. Notice where in your life these themes feel most alive — and where they ask for more room.${traditional ? ` Older traditions add ${traditional.name}, lending ${traditional.theme}.` : ''}`,
    },
    house
      ? {
          title: `Sun in the ${ORDINALS[house - 1]} house`,
          body: `With a birth time of ${input.birthTime}, your Sun most likely stood in or near the ${ORDINALS[house - 1]} house — the ${HOUSES[house - 1].name}, associated with ${HOUSES[house - 1].theme}.`,
          tag: 'Approximation · assumes sunrise near 06:00, no time zone',
        }
      : {
          title: 'The open house',
          body: 'Without a birth time, the house of your Sun stays open. If you ever find your exact time — on a birth certificate or in family records — this layer of the reading can be filled in.',
        },
    {
      title: `Your birth Moon · ${moon.name}`,
      body: `${moonContent.text} At your birth the Moon was about ${Math.round(moon.illumination * 100)}% illuminated, ${moon.age.toFixed(1)} days into its cycle.`,
      tag: 'Approximate',
    },
    {
      title: 'More of your light',
      body: extraStrengths.map((s) => `${s.title} — ${lowerFirst(s.body)}`).join(' '),
    },
    {
      title: 'Further edges to explore',
      body: extraTensions.map((t) => `${t.title}: ${t.body}`).join(' '),
    },
    {
      title: 'Your recharge ritual',
      body: `${element.name} signs often restore themselves through ${elementContent.recharge}. ${RECHARGE_BY_MODALITY[sign.modality]}`,
    },
  ];

  // — Premium: origin reading —
  const constellationBehindSun = sunConstellation(date.month, date.day);
  const signConstellation = CONSTELLATION_NAMES[sign.id] ?? sign.name;
  const sky: Insight[] = [
    {
      title: 'The constellation behind your Sun',
      body: `On ${date.day} ${MONTH_NAMES[date.month - 1]}, the Sun stood — astronomically — in front of the constellation ${constellationBehindSun}. Because Earth’s axis slowly wobbles (precession), the stars have drifted by almost a whole sign since the zodiac was defined${constellationBehindSun === signConstellation ? ', yet in your case sign and constellation still coincide.' : ', so your astrological sign and the visible constellation differ.'}`,
      tag: 'Astronomy',
    },
  ];
  if (birthPlace) {
    const { season: birthSeason, hemisphere } = season(sun.longitude, birthPlace.lat);
    const absLat = Math.abs(birthPlace.lat);
    const poleLine =
      absLat < 5
        ? 'Close to the equator, both celestial poles rest near the horizon, and almost the entire sky passes overhead over a year.'
        : birthPlace.lat > 0
          ? `From there, Polaris — the Pole Star — stands about ${Math.round(absLat)}° above the northern horizon, because the height of the celestial pole always equals your latitude.`
          : `From there, the south celestial pole stands about ${Math.round(absLat)}° above the southern horizon; there is no bright pole star, but the Southern Cross points the way.`;
    sky.push({
      title: 'The sky above your birthplace',
      body: `You were born in the ${birthSeason} of the ${hemisphere} hemisphere${birthPlace.precision === 'country' ? ' (based on an approximate national centre)' : ''}. ${poleLine}`,
      tag: 'Astronomy',
    });
  }
  sky.push({
    title: `Your guiding star · ${content.star}`,
    body: `The brightest star of ${signConstellation} is ${content.star}. On a clear night, finding it is a small, real way to connect with the symbol you were born under.`,
    tag: 'Astronomy',
  });

  const journey: Insight | null =
    birthPlace && homePlace && distance !== null
      ? distance < 30
        ? {
            title: 'One sky, one place',
            body: `You live close to where you were born. Symbolically, a life rooted under one sky is often read as continuity — a long conversation with a single landscape.`,
            tag: 'Creative interpretation',
          }
        : {
            title: 'The line between two places',
            body: `About ${formatKm(distance)} km separate ${birthplaceLabel} and ${residenceLabel}, a line pointing ${compassDirection(birthPlace, homePlace)}. Read poetically, your path leans toward ${DIRECTION_MEANING[compassDirection(birthPlace, homePlace).split('-').pop() ?? 'north']}.`,
            tag: 'Creative interpretation',
          }
      : null;

  // — Premium: extended reflection (seven nights, starting on your birth weekday) —
  const planetPrompts: Record<string, string> = {
    Sun: `The first keyword of ${sign.name} is ${sign.keywords[0].toLowerCase()}. Where did it show up in your week — and who noticed?`,
    Moon: `Born beneath a ${moonPhrase(moon)}: what is waxing in your life right now, and what is waning?`,
    Mars: `Mars asks about courage. ${tensions[0].body}`,
    Mercury: 'Write down a conversation you keep having in your head. What would you actually say?',
    Jupiter: 'What is one way your world could grow larger this month — a place, a book, a person?',
    Venus: 'List five beautiful things that cost nothing. Which of them did you nearly overlook?',
    Saturn: 'Saturn asks about structure: which commitment would you keep even if no one ever checked?',
  };
  if (theme) planetPrompts[INTENTION_NIGHT_PLANET[theme.id]] = theme.night;
  const startIndex = WEEKDAYS.findIndex((w) => w.day === weekday.day);
  const nights = Array.from({ length: 7 }, (_, i) => {
    const w = WEEKDAYS[(startIndex + i) % 7];
    return { day: w.day, planet: w.planet, prompt: planetPrompts[w.planet] };
  });

  // — Premium: signature —
  const asterism = buildAsterism(rng, part.latin, part.latinMeaning);
  const signatureParagraphs = [
    `${title} is a portrait in symbols: ${article(element.name)} ${element.name.toLowerCase()} sign of the ${modality.name.toLowerCase()} rhythm, ruled by ${ruler.name}, born ${part.phrase} beneath a ${moonPhrase(moon)} on a ${weekday.day}.`,
    `Its light is ${lowerFirst(strengths[0].title)} and ${lowerFirst(strengths[1].title)}; its edge is ${lowerFirst(tensions[0].title)}. Its invitation — for now — is ${lowerFirst(growth.title)}.`,
    'None of this is fixed. Like the sky itself, a profile is a moving picture: something to return to, question and rewrite.',
  ];

  return {
    id: seed.toString(36),
    engine: DEMO_ENGINE,
    createdAt: now.toISOString(),
    sign: sign.id,
    title,
    subtitle,
    asterism,
    summary,
    profile: {
      birthDateLabel: formatDate(date.year, date.month, date.day),
      birthTimeLabel: time ? input.birthTime : 'Unknown',
      birthplace: birthplaceLabel,
      residence: residenceLabel,
      facets: [
        { label: 'Sun', value: `${formatDegree(sun.degree)} ${sun.sign.name}`, note: 'approx.' },
        { label: 'Element', value: element.name },
        { label: 'Moon at birth', value: moon.name, note: `${Math.round(moon.illumination * 100)}% lit` },
        { label: 'Born on', value: weekday.day },
        { label: 'Hour', value: part.label },
      ],
    },
    identity: {
      lead: sign.essence,
      paragraphs: [
        rng.pick(content.identity),
        `${rng.pick(elementContent.temperament)} ${modalityContent.text} ${rulerLine}`,
        `${part.text} ${moonContent.text}`,
      ],
      facets: [
        { label: 'Sign', value: `${sign.name} · ${sign.image}` },
        { label: 'Season', value: formatSignRange(sign) },
        { label: 'Element', value: `${element.name} — ${element.quality}` },
        { label: 'Modality', value: `${modality.name} — ${modality.quality}` },
        { label: 'Polarity', value: element.polarity },
        { label: 'Ruler', value: traditional ? `${ruler.name} (trad. ${traditional.name})` : ruler.name },
        { label: 'Keywords', value: sign.keywords.join(' · ') },
      ],
      note: identityNote,
    },
    innerUniverse: {
      intro: `Your ${element.name.toLowerCase()} element and ${modality.name.toLowerCase()} rhythm colour the themes below. Read them as reflection prompts, not as a diagnosis — keep what resonates and leave the rest.`,
      strengths: strengths.slice(0, 3),
      tensions: tensions.slice(0, 2),
      growth,
    },
    origins: {
      birth: birthPoint,
      home: homePoint,
      statement: statementParts.join(' '),
      boundary:
        'Your birth date, birth time and sign cannot reveal genetic ancestry, ethnicity or cultural origin. Real geographical and cultural roots live in family history, records and personal stories — information ASTRA neither has nor asks for.',
      symbolic: {
        title: 'A symbolic landscape',
        tag: 'Creative interpretation',
        body: `In elemental symbolism, ${element.name.toLowerCase()} signs are often associated with ${elementContent.landscapes}, and with cultural motifs such as ${elementContent.motifs}. Read these as poetic places your sign’s imagery belongs to — not as places your family came from.`,
      },
    },
    timeline: {
      intro:
        'Astrology describes long cycles that return at similar ages for everyone. Here they appear as symbolic chapters with questions — not as predictions of what will happen.',
      nodes: timeline.free,
    },
    reflection: {
      intro: reflectionIntro,
      intention: quoted,
      questions,
    },
    premium: {
      extendedProfile: {
        intro: 'The extended profile moves beyond your Sun sign into the finer layers of your birth moment.',
        sections: extendedSections,
      },
      originReading: {
        intro: 'A deeper look at the real sky above your story — and, clearly marked, at its symbolic geography.',
        sky,
        lore: {
          title: `The cultural story of ${signConstellation}`,
          tag: 'Sky lore',
          body: `${content.lore} These stories belong to the symbol you were born under — not to your personal ancestry.`,
        },
        landscapes: {
          title: 'Symbolic landscapes',
          tag: 'Creative interpretation',
          body: `If your sign were a landscape, it might be ${elementContent.landscapes}. In Western ceremonial traditions each element is also given a direction — ${element.name.toLowerCase()} belongs to the ${elementContent.direction}. Treat this as poetry for the imagination, not as geography of descent.`,
        },
        journey,
        familyPrompts: [
          `Who in your family remembers ${birthplaceLabel} around the time you were born?`,
          'Are there letters, photos or documents that show where your grandparents were born?',
          'Which recipes, words or traditions were passed down to you — and where did they come from?',
          'If you want factual answers about ancestry, archives, genealogical records and conversations with relatives are the right tools — astrology is not.',
        ],
      },
      extendedReflection: {
        intro: `A seven-night practice, beginning on a ${weekday.day} — the weekday you were born. Each night is named for the planet that gave the day its name.`,
        nights,
      },
      fullTimeline: {
        intro:
          'Your complete symbolic arc: every major astrological cycle, placed at the age and year it returns for you. Each is a question to sit with, never a forecast.',
        nodes: timeline.full,
      },
      signature: {
        paragraphs: signatureParagraphs,
        symbols: [
          { label: 'Guiding star', value: content.star },
          { label: 'Birthstone', value: BIRTHSTONES[date.month - 1] },
          { label: 'Birth flower', value: BIRTH_FLOWERS[date.month - 1] },
          { label: 'Planetary day', value: `${weekday.day} · ${weekday.planet}`, note: weekday.origin },
          { label: 'Symbolic colour', value: content.color },
          { label: 'Personal asterism', value: asterism.name, note: asterism.translation },
        ],
        mantra: content.mantra,
      },
    },
  };
}

export const localDemoProvider: ReadingProvider = {
  engine: DEMO_ENGINE,
  async generate(input, options) {
    if (options?.signal?.aborted) throw new DOMException('Reading cancelled', 'AbortError');
    return buildDemoReading(input, options?.now ?? new Date());
  },
};
