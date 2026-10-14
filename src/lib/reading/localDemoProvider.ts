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
import { ELEMENT_STYLE, LIFE_PATH, MODALITY_STYLE, PLANET_WEEKDAY, SIGN_PROFILE } from './content/profile';
import { SIGN_CONTENT } from './content/signs';
import {
  ASTERISM_NOUNS,
  BIRTH_FLOWERS,
  BIRTHSTONES,
  CHINESE_ANIMALS,
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
  Fact,
  Insight,
  MapPoint,
  ReadingEngine,
  ReadingInput,
  ReadingProvider,
  TimelineNode,
} from './types';

export const DEMO_ENGINE: ReadingEngine = {
  kind: 'demo-rules',
  label: 'Demo-Deutung · lokal erstellt von einer regelbasierten Engine',
};

const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

const ORDINALS = [
  'ersten',
  'zweiten',
  'dritten',
  'vierten',
  'fünften',
  'sechsten',
  'siebten',
  'achten',
  'neunten',
  'zehnten',
  'elften',
  'zwölften',
];
const ROMAN = ['I', 'II', 'III'];
const SYNODIC_MONTH = 29.530588853;
const DAY_MS = 86400000;

const MOON_QUESTIONS: Record<string, string> = {
  new: 'Welche Absicht möchtest du still säen, ohne sie anzukündigen?',
  'waxing-crescent': 'Welcher zarte Anfang in deinem Leben verdient gerade Schutz?',
  'first-quarter': 'Um welche Entscheidung kreist du, die jetzt reif ist?',
  'waxing-gibbous': 'Woran feilst du, das in Wahrheit schon gut genug zum Teilen ist?',
  full: 'Was ist dir zuletzt klar geworden, das du vorher nicht sehen konntest?',
  'waning-gibbous': 'Was hast du gelernt, das jemand anderes gerade hören müsste?',
  'last-quarter': 'Was bist du bereit abzulegen, damit deine Hände wieder frei sind?',
  'waning-crescent': 'Wo in deinem Leben darfst du ruhen, bevor du neu beginnst?',
};

const DIRECTION_MEANING: Record<string, string> = {
  Norden: 'den Norden, den viele Traditionen mit Ausdauer und stiller Weisheit verbinden',
  Süden: 'den Süden, den viele Traditionen mit Wärme, Wachstum und Ausdruck verbinden',
  Osten: 'den Osten, den viele Traditionen mit Sonnenaufgang und Neubeginn verbinden',
  Westen: 'den Westen, den viele Traditionen mit Sonnenuntergang, Rückschau und Vollendung verbinden',
};

/** "Nordosten" → "Osten", "Südwesten" → "Westen"; the four cardinal points pass through. */
function mainDirection(direction: string): string {
  if (direction.endsWith('osten')) return 'Osten';
  if (direction.endsWith('westen')) return 'Westen';
  return direction;
}

const PLANET_GENITIVE: Record<string, string> = {
  Sonne: 'der Sonne',
  Mond: 'des Mondes',
  Mars: 'des Mars',
  Merkur: 'des Merkur',
  Jupiter: 'des Jupiter',
  Venus: 'der Venus',
  Saturn: 'des Saturn',
};

const RECHARGE_BY_MODALITY = {
  cardinal: 'Beginne jeden Tag mit einer kleinen Handlung, die ganz dir gehört.',
  fixed: 'Schütze ein festes Ritual – auch in vollen Wochen.',
  mutable: 'Erlaube Abwechslung: einen neuen Weg, einen neuen Klang, ein neues Gespräch.',
};

const INTENTION_NIGHT_PLANET: Record<string, string> = {
  connection: 'Venus',
  vocation: 'Mars',
  creativity: 'Sonne',
  roots: 'Saturn',
  change: 'Jupiter',
  calm: 'Mond',
  self: 'Merkur',
};

const nf = new Intl.NumberFormat('de-DE');

function formatDate(year: number, month: number, day: number): string {
  return `${day}. ${MONTH_NAMES[month - 1]} ${year}`;
}

function formatKm(km: number): string {
  const rounded = km < 100 ? Math.round(km / 5) * 5 : Math.round(km / 10) * 10;
  return nf.format(rounded);
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

/** Chinese zodiac animal by solar year, which turns at Lichun (around 4 February). */
function chineseAnimal(year: number, month: number, day: number): string {
  const solarYear = month < 2 || (month === 2 && day < 4) ? year - 1 : year;
  return CHINESE_ANIMALS[(((solarYear - 4) % 12) + 12) % 12];
}

function season(longitude: number, lat: number): { season: string; hemisphere: string } {
  const northern = ['Frühling', 'Sommer', 'Herbst', 'Winter'];
  const southern = ['Herbst', 'Winter', 'Frühling', 'Sommer'];
  const quarter = Math.floor(longitude / 90) % 4;
  return lat >= 0
    ? { season: northern[quarter], hemisphere: 'Nordhalbkugel' }
    : { season: southern[quarter], hemisphere: 'Südhalbkugel' };
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
  return { name: `${noun} ${dayPartLatin}`, translation: `${nounMeaning} ${dayPartMeaning}`, stars, lines };
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
    title: 'Dein Himmel heute',
    cycle: `Jetzt · ${Math.floor(age)} Jahre`,
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

function buildFacts(params: {
  birth: BirthMoment;
  now: Date;
  sunLabel: string;
  moonName: string;
  moonPercent: number;
  weekday: (typeof WEEKDAYS)[number];
  animal: string;
  constellation: string;
  birthstone: string;
  flower: string;
  birthPlace: Place | null;
  homePlace: Place | null;
  ruler: string;
  rulerDay: string;
}): Fact[] {
  const { birth, now } = params;
  const bornAt = Date.UTC(birth.year, birth.month - 1, birth.day);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.max(0, Math.round((today - bornAt) / DAY_MS));
  const years = days / 365.2422;

  // Next round "day birthday" (multiples of 1,000 days).
  const nextMilestone = (Math.floor(days / 1000) + 1) * 1000;
  const milestoneDate = new Date(bornAt + nextMilestone * DAY_MS);

  // Next calendar birthday.
  let next = new Date(Date.UTC(now.getFullYear(), birth.month - 1, birth.day));
  if (next.getTime() < today) next = new Date(Date.UTC(now.getFullYear() + 1, birth.month - 1, birth.day));
  const daysToBirthday = Math.round((next.getTime() - today) / DAY_MS);
  const nextWeekday = WEEKDAYS[next.getUTCDay()].day;

  const facts: Fact[] = [
    {
      value: nf.format(days),
      label: 'Tage auf der Erde',
      note: `Dein ${nf.format(nextMilestone)}. Tag: ${formatDate(milestoneDate.getUTCFullYear(), milestoneDate.getUTCMonth() + 1, milestoneDate.getUTCDate())}`,
    },
    {
      value: `≈ ${nf.format(Math.floor(days / SYNODIC_MONTH))}`,
      label: 'Erlebte Vollmonde',
      note: 'Ein Mondzyklus dauert 29,5 Tage',
    },
    {
      value: `${(years * 0.94).toLocaleString('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} Mrd. km`,
      label: 'Deine Reise um die Sonne',
      note: 'Eine Erdumrundung ≈ 940 Mio. km',
    },
    {
      value:
        daysToBirthday === 0 ? 'Heute!' : `in ${nf.format(daysToBirthday)} ${daysToBirthday === 1 ? 'Tag' : 'Tagen'}`,
      label: 'Nächster Geburtstag',
      note: daysToBirthday === 0 ? 'Alles Gute zum Geburtstag' : `Er fällt auf einen ${nextWeekday}`,
    },
    {
      value: params.weekday.day,
      label: 'Geboren an einem',
      note: `Tag ${PLANET_GENITIVE[params.weekday.planet]} (${params.weekday.origin})`,
    },
    { value: params.sunLabel, label: 'Sonnenstand bei Geburt', note: 'Berechnet – genau auf etwa ±1°' },
    {
      value: `${params.moonPercent} %`,
      label: 'Mondlicht bei Geburt',
      note: params.moonName,
    },
    { value: params.animal, label: 'Chinesisches Tierzeichen', note: 'Nach dem Sonnenjahr (Beginn ca. 4. Februar)' },
    {
      value: params.constellation,
      label: 'Sternbild hinter der Sonne',
      note: 'Astronomisch – die Erdachse hat den Himmel verschoben',
    },
    { value: params.birthstone, label: 'Geburtsstein', note: `Geburtsblume: ${params.flower}` },
    { value: params.ruler, label: 'Dein Herrscherplanet', note: `Traditioneller Glückstag: ${params.rulerDay}` },
  ];

  if (params.birthPlace && params.homePlace) {
    const km = distanceKm(params.birthPlace, params.homePlace);
    if (km >= 30) {
      facts.push({
        value: `${formatKm(km)} km`,
        label: 'Geburtsort → Wohnort',
        note: `Luftlinie Richtung ${compassDirection(params.birthPlace, params.homePlace)}`,
      });
    }
  } else if (params.birthPlace && Math.abs(params.birthPlace.lat) >= 5 && params.birthPlace.lat > 0) {
    facts.push({
      value: `${Math.round(params.birthPlace.lat)}°`,
      label: 'Polarstern über deinem Geburtsort',
      note: 'Sie entspricht immer der geografischen Breite',
    });
  }
  return facts;
}

/** Numerology life path: digit sum of the full birth date, keeping master numbers 11, 22 and 33. */
function lifePathNumber(year: number, month: number, day: number): number {
  let n = `${day}${month}${year}`.split('').reduce((sum, digit) => sum + Number(digit), 0);
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return n;
}

function buildSelfProfile(
  sign: ZodiacSign,
  strength: { title: string; body: string },
  date: { year: number; month: number; day: number },
): Fact[] {
  const profile = SIGN_PROFILE[sign.id];
  const style = ELEMENT_STYLE[sign.element];
  const lifePath = lifePathNumber(date.year, date.month, date.day);
  const life = LIFE_PATH[lifePath];
  return [
    { label: 'Dein Kern', value: profile.core, note: sign.essence },
    { label: 'Was dich antreibt', value: profile.drive.value, note: profile.drive.text },
    { label: 'Deine Stärke', value: strength.title, note: strength.body },
    { label: 'Deine Herausforderung', value: profile.challenge.value, note: profile.challenge.text },
    { label: 'In der Liebe', value: profile.love.value, note: profile.love.text },
    { label: 'Im Beruf', value: profile.work.value, note: profile.work.text },
    { label: 'Unter Stress', value: profile.stress.value, note: profile.stress.text },
    { label: 'So tankst du auf', value: style.recharge.value, note: style.recharge.text },
    { label: 'Wie du kommunizierst', value: style.talk.value, note: style.talk.text },
    {
      label: 'Wie du entscheidest',
      value: MODALITY_STYLE[sign.modality].value,
      note: MODALITY_STYLE[sign.modality].text,
    },
    {
      label: 'Passt gut zu',
      value: profile.matches.map((id) => getSign(id).name).join(', '),
      note: 'Nach astrologischer Tradition: gleiches oder ergänzendes Element.',
    },
    { label: 'Deine Lebenszahl', value: `${lifePath} · ${life.value}`, note: `${life.text} (Numerologie)` },
  ];
}

export function buildDemoReading(input: ReadingInput, now: Date = new Date()): CosmicReading {
  const date = parseDate(input.birthDate);
  if (!date) throw new Error('Ungültiges Geburtsdatum');
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
  const moonPercent = Math.round(moon.illumination * 100);
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

  // — Title: "Die Entdeckerseele der Mitternacht" —
  const noun = rng.pick(content.nouns);
  const genitive = rng.next() < 0.68 ? rng.pick(part.genitives) : moonContent.genitive;
  const title = `Die ${noun} ${genitive}`;
  const subtitle = `${sign.name}-Sonne, geboren ${part.phrase} ${moonContent.at}.`;

  const strengths = rng.shuffle(content.strengths);
  const tensions = rng.shuffle(content.tensions);
  const growth = rng.pick(content.growth);

  const summary = rng.pick([
    `${sign.essence} Als ${sign.name}-Sonne, geboren ${part.phrase} in ${birthplaceLabel}, zeigt dein Profil eine ${elementContent.adjective} Natur, die ${modalityContent.phrase}. Dein Wachstumsthema: ${growth.title}.`,
    `Geboren ${part.phrase} in ${birthplaceLabel}, ${moonContent.at}: Deine ${sign.name}-Sonne steht für ${sign.keywords[0]}, ${sign.keywords[1]} und ${sign.keywords[2]}. Dein Profil zeigt eine ${elementContent.adjective} Natur, die ${modalityContent.phrase} – dein Wachstumsthema: ${growth.title}.`,
  ]);

  // — Places —
  const birthPlace = findPlace(birthplaceLabel);
  const homePlace = residenceLabel ? findPlace(residenceLabel) : null;
  const distance = birthPlace && homePlace ? distanceKm(birthPlace, homePlace) : null;

  // — 01 Identity —
  let identityNote: string | undefined;
  if (sun.sign.id !== sign.id) {
    identityNote = `Berechnet liegt deine Sonne bei ${formatDegree(sun.degree)} ${sun.sign.name}. Du hast ${sign.name} gewählt – die Deutung folgt deiner Wahl.`;
  } else if (sun.cuspWith) {
    identityNote = `Deine Sonne stand bei ${formatDegree(sun.degree)} ${sun.sign.name}, ganz nah an der Grenze zu ${sun.cuspWith.name}. Ohne Zeitzone kann sich der Wechsel um Stunden verschieben – vielleicht erkennst du dich in beiden.`;
  }

  // — 03 Origins —
  const statementParts: string[] = [];
  if (birthPlace?.precision === 'city') {
    statementParts.push(`Du wurdest in ${birthplaceLabel} geboren – ${formatCoordinates(birthPlace)}.`);
  } else if (birthPlace) {
    statementParts.push(`Du hast ${birthplaceLabel} angegeben. Die Karte zeigt den ungefähren Mittelpunkt des Landes.`);
  } else {
    statementParts.push(
      `Du wurdest in ${birthplaceLabel} geboren. Der Ort ist nicht in ASTRAs kleinem Offline-Atlas und erscheint daher nur mit Namen – es wurde kein Ortungsdienst abgefragt.`,
    );
  }
  if (residenceLabel) {
    if (distance !== null && distance < 30)
      statementParts.push(`Du lebst heute nah an deinem Geburtsort, in ${residenceLabel}.`);
    else if (distance !== null && birthPlace && homePlace)
      statementParts.push(
        `Heute lebst du in ${residenceLabel}, rund ${formatKm(distance)} km Richtung ${compassDirection(birthPlace, homePlace)}.`,
      );
    else statementParts.push(`Heute lebst du in ${residenceLabel}.`);
  }

  // — 04 Timeline —
  const today = momentFromDate(now);
  const todaySun = sunPosition(today);
  const todayMoon = moonPhase(today);
  const presentTheme = `Heute läuft die Sonne durch das Zeichen ${todaySun.sign.name}, der Mond steht ${MOON_CONTENT[todayMoon.id].at}. Für dich könnte dieses Kapitel von „${growth.title}“ geprägt sein.`;
  const presentQuestion = theme ? theme.question : MOON_QUESTIONS[todayMoon.id];
  const timeline = buildTimeline(birth, now, presentTheme, presentQuestion);

  // — 05 Reflection —
  const questions = [
    rng.pick(content.questions),
    theme ? theme.question : MOON_QUESTIONS[moon.id],
    `Wenn „${growth.title}“ dein Thema für die nächste Zeit wäre – was würdest du diese Woche anders machen?`,
  ];
  const quoted = intention.length > 160 ? `${intention.slice(0, 157).trimEnd()}…` : intention;
  let reflectionIntro = 'Drei Fragen zum Mitnehmen. Es gibt keine richtigen Antworten – nur ehrliche.';
  if (intention && theme)
    reflectionIntro = `Deine eigene Frage war der Ausgangspunkt. Die Impulse drehen sich um ${theme.focus}.`;
  else if (intention)
    reflectionIntro = 'Deine eigene Frage war der Ausgangspunkt. Lass diese Impulse neben ihr stehen.';

  // — Premium: extended profile —
  const decanSign = triplicity(sun.sign)[sun.decan - 1];
  const decanRange = `${(sun.decan - 1) * 10}°–${sun.decan * 10}°`;
  const house = time ? approximateSunHouse(time.hour, time.minute) : null;
  const extendedSections: Insight[] = [
    {
      title: `Dekade ${ROMAN[sun.decan - 1]} · ${decanSign.name}`,
      body: `Deine Sonne steht bei etwa ${formatDegree(sun.degree)} ${sun.sign.name}, in der ${ORDINALS[sun.decan - 1]} Dekade (${decanRange}). Dieses Zehn-Grad-Feld wird traditionell vom Zeichen ${decanSign.name} gefärbt: ${decanSign.essence}`,
    },
    { title: `Die Achse ${sign.name} – ${oppositeSign(sign).name}`, body: content.axis },
    {
      title: `${ruler.name}, dein Herrscherplanet`,
      body: `${ruler.name} färbt ${sign.name} mit ${ruler.theme}.${traditional ? ` Ältere Traditionen nennen zusätzlich ${traditional.name}.` : ''} Achte darauf, wo diese Themen in deinem Leben am lebendigsten sind.`,
    },
    house
      ? {
          title: `Sonne im ${house}. Haus`,
          body: `Bei einer Geburtszeit von ${input.birthTime} Uhr stand deine Sonne vermutlich im oder nahe dem ${house}. Haus – dem ${HOUSES[house - 1].name}: ${HOUSES[house - 1].theme}.`,
          tag: 'Näherung · Sonnenaufgang ~06:00, ohne Zeitzone',
        }
      : {
          title: 'Das offene Haus',
          body: 'Ohne Geburtszeit bleibt das Haus deiner Sonne offen. Steht sie auf deiner Geburtsurkunde, lässt sich diese Ebene ergänzen.',
        },
    {
      title: `Dein Geburtsmond · ${moon.name}`,
      body: `${moonContent.text} Er war zu etwa ${moonPercent} % beleuchtet, ${moon.age.toFixed(1).replace('.', ',')} Tage nach Neumond.`,
      tag: 'Berechnet',
    },
    {
      title: 'Dein Aufladeritual',
      body: `${element.name}-Zeichen tanken oft auf durch ${elementContent.recharge}. ${RECHARGE_BY_MODALITY[sign.modality]}`,
    },
  ];

  // — Premium: origin reading —
  const constellationBehindSun = sunConstellation(date.month, date.day);
  const sky: Insight[] = [
    {
      title: 'Das Sternbild hinter deiner Sonne',
      body: `Am ${date.day}. ${MONTH_NAMES[date.month - 1]} stand die Sonne astronomisch vor dem Sternbild ${constellationBehindSun}. Weil die Erdachse langsam taumelt (Präzession), hat sich der Himmel seit der Festlegung des Tierkreises um fast ein Zeichen verschoben${constellationBehindSun === sign.name ? ' – bei dir stimmen Zeichen und Sternbild trotzdem überein.' : '.'}`,
      tag: 'Astronomie',
    },
  ];
  if (birthPlace) {
    const { season: birthSeason, hemisphere } = season(sun.longitude, birthPlace.lat);
    const absLat = Math.abs(birthPlace.lat);
    const poleLine =
      absLat < 5
        ? 'Nahe dem Äquator liegen beide Himmelspole am Horizont – fast der ganze Himmel zieht im Lauf eines Jahres vorbei.'
        : birthPlace.lat > 0
          ? `Von dort steht der Polarstern etwa ${Math.round(absLat)}° über dem Nordhorizont – die Höhe des Himmelspols entspricht immer der geografischen Breite.`
          : `Von dort steht der südliche Himmelspol etwa ${Math.round(absLat)}° über dem Horizont; einen hellen Polarstern gibt es nicht, aber das Kreuz des Südens weist den Weg.`;
    sky.push({
      title: 'Der Himmel über deinem Geburtsort',
      body: `Du wurdest im ${birthSeason} der ${hemisphere} geboren. ${poleLine}`,
      tag: 'Astronomie',
    });
  }
  sky.push({
    title: `Dein Leitstern · ${content.star}`,
    body: `Der hellste Stern im Sternbild ${sign.name} (${sign.image}) ist ${content.star}. Ihn in einer klaren Nacht zu finden, ist eine kleine, echte Verbindung zu deinem Zeichen.`,
    tag: 'Astronomie',
  });

  const direction = birthPlace && homePlace ? compassDirection(birthPlace, homePlace) : null;
  const journey: Insight | null =
    birthPlace && homePlace && distance !== null
      ? distance < 30
        ? {
            title: 'Ein Himmel, ein Ort',
            body: 'Du lebst nah an deinem Geburtsort. Symbolisch wird ein Leben unter demselben Himmel oft als Kontinuität gelesen – ein langes Gespräch mit einer Landschaft.',
            tag: 'Kreative Deutung',
          }
        : {
            title: 'Die Linie zwischen zwei Orten',
            body: `Rund ${formatKm(distance)} km liegen zwischen ${birthplaceLabel} und ${residenceLabel}, Richtung ${direction}. Poetisch gelesen neigt sich dein Weg in ${DIRECTION_MEANING[mainDirection(direction ?? 'Norden')]}.`,
            tag: 'Kreative Deutung',
          }
      : null;

  // — Premium: seven nights, starting on the birth weekday —
  const planetPrompts: Record<string, string> = {
    Sonne: `Das erste Stichwort deines Zeichens ist ${sign.keywords[0]}. Wo hat es sich diese Woche gezeigt – und wer hat es bemerkt?`,
    Mond: `Du wurdest ${moonContent.at} geboren: Was wächst gerade in deinem Leben, was nimmt ab?`,
    Mars: `Mars fragt nach Mut. ${tensions[0].body}`,
    Merkur: 'Schreib ein Gespräch auf, das du immer wieder im Kopf führst. Was würdest du wirklich sagen?',
    Jupiter: 'Wie könnte deine Welt diesen Monat größer werden – durch einen Ort, ein Buch, einen Menschen?',
    Venus: 'Liste fünf schöne Dinge auf, die nichts kosten. Welches davon hättest du fast übersehen?',
    Saturn: 'Saturn fragt nach Struktur: Welche Verpflichtung würdest du halten, auch wenn niemand nachsieht?',
  };
  if (theme) planetPrompts[INTENTION_NIGHT_PLANET[theme.id]] = theme.night;
  const startIndex = WEEKDAYS.findIndex((w) => w.day === weekday.day);
  const nights = Array.from({ length: 7 }, (_, i) => {
    const w = WEEKDAYS[(startIndex + i) % 7];
    return { day: w.day, planet: w.planet, prompt: planetPrompts[w.planet] };
  });

  const asterism = buildAsterism(rng, part.latin, part.latinMeaning);
  const animal = chineseAnimal(date.year, date.month, date.day);

  return {
    id: seed.toString(36),
    engine: DEMO_ENGINE,
    createdAt: now.toISOString(),
    sign: sign.id,
    title,
    subtitle,
    asterism,
    summary,
    facts: buildFacts({
      birth,
      now,
      sunLabel: `${formatDegree(sun.degree)} ${sun.sign.name}`,
      moonName: moon.name,
      moonPercent,
      weekday,
      animal,
      constellation: constellationBehindSun,
      birthstone: BIRTHSTONES[date.month - 1],
      flower: BIRTH_FLOWERS[date.month - 1],
      birthPlace,
      homePlace,
      ruler: ruler.name,
      rulerDay: PLANET_WEEKDAY[sign.traditionalRuler ?? sign.ruler] ?? PLANET_WEEKDAY.sun,
    }),
    selfProfile: buildSelfProfile(sign, strengths[0], date),
    profile: {
      birthDateLabel: formatDate(date.year, date.month, date.day),
      birthTimeLabel: time ? `${input.birthTime} Uhr` : 'Unbekannt',
      birthplace: birthplaceLabel,
      residence: residenceLabel,
      facets: [
        { label: 'Sonne', value: `${formatDegree(sun.degree)} ${sun.sign.name}`, note: 'ca.' },
        { label: 'Element', value: element.name },
        { label: 'Mond bei Geburt', value: moon.name, note: `${moonPercent} % beleuchtet` },
        { label: 'Wochentag', value: weekday.day },
      ],
    },
    identity: {
      lead: sign.essence,
      paragraphs: [rng.pick(content.identity), `${elementContent.temperament} ${part.text}`],
      facets: [
        { label: 'Zeitraum', value: formatSignRange(sign) },
        { label: 'Element', value: `${element.name} · ${element.quality}` },
        { label: 'Qualität', value: `${modality.name} · ${modality.quality}` },
        { label: 'Herrscher', value: traditional ? `${ruler.name} (trad. ${traditional.name})` : ruler.name },
        { label: 'Stichworte', value: sign.keywords.join(' · ') },
        { label: 'Leitstern', value: content.star },
      ],
      note: identityNote,
    },
    innerUniverse: {
      intro: 'Impulse zum Nachdenken, keine Diagnose – nimm mit, was passt.',
      strengths: strengths.slice(0, 3),
      tensions: tensions.slice(0, 2),
      growth,
    },
    origins: {
      birth: toMapPoint(birthPlace, birthplaceLabel, 'birth'),
      home: toMapPoint(homePlace, residenceLabel, 'home'),
      statement: statementParts.join(' '),
      boundary:
        'Geburtsdatum, Uhrzeit und Sternzeichen können keine genetische Abstammung, Ethnie oder kulturelle Herkunft zeigen. Echte Wurzeln findest du in Familiengeschichte, Dokumenten und Erzählungen – Informationen, die ASTRA weder hat noch abfragt.',
      symbolic: {
        title: 'Eine symbolische Landschaft',
        tag: 'Kreative Deutung',
        body: `In der Elementsymbolik werden ${element.name}-Zeichen mit ${elementContent.landscapes} verbunden – und mit Motiven wie ${elementContent.motifs}. Lies das als poetische Orte deines Zeichens, nicht als Herkunft deiner Familie.`,
      },
    },
    timeline: {
      intro:
        'Die Astrologie beschreibt lange Zyklen, die für alle Menschen in ähnlichem Alter wiederkehren. Hier erscheinen sie als Kapitel mit Fragen – nicht als Vorhersagen.',
      nodes: timeline.free,
    },
    reflection: { intro: reflectionIntro, intention: quoted, questions },
    premium: {
      extendedProfile: {
        intro:
          'Das erweiterte Profil geht über dein Sonnenzeichen hinaus in die feineren Ebenen deines Geburtsmoments.',
        sections: extendedSections,
      },
      originReading: {
        intro:
          'Ein tieferer Blick auf den echten Himmel über deiner Geschichte – und, klar gekennzeichnet, auf ihre symbolische Geografie.',
        sky,
        lore: {
          title: `Die Kulturgeschichte von ${sign.name}`,
          tag: 'Himmelsgeschichte',
          body: `${content.lore} Diese Geschichten gehören zum Symbol, unter dem du geboren wurdest – nicht zu deiner persönlichen Abstammung.`,
        },
        landscapes: {
          title: 'Symbolische Landschaften',
          tag: 'Kreative Deutung',
          body: `Wäre dein Zeichen eine Landschaft, wären es vielleicht ${elementContent.landscapes}. In westlichen Traditionen erhält jedes Element auch eine Himmelsrichtung – ${element.name} gehört zum ${elementContent.direction}. Lies das als Poesie, nicht als Herkunft.`,
        },
        journey,
        familyPrompts: [
          `Wer in deiner Familie erinnert sich an ${birthplaceLabel} zur Zeit deiner Geburt?`,
          'Gibt es Briefe, Fotos oder Dokumente, die zeigen, wo deine Großeltern geboren wurden?',
          'Welche Rezepte, Wörter oder Traditionen wurden an dich weitergegeben – und woher kommen sie?',
          'Für echte Antworten zur Abstammung sind Archive, Stammbäume und Gespräche mit Verwandten die richtigen Werkzeuge – nicht die Astrologie.',
        ],
      },
      extendedReflection: {
        intro: `Eine Praxis für sieben Abende, beginnend an einem ${weekday.day} – dem Wochentag deiner Geburt. Jeder Abend ist nach dem Himmelskörper benannt, der dem Tag seinen lateinischen Namen gab.`,
        nights,
      },
      fullTimeline: {
        intro:
          'Dein vollständiger Lebensbogen: alle großen astrologischen Zyklen, platziert in dem Alter und Jahr, in dem sie für dich wiederkehren – jeder eine Frage, keine Vorhersage.',
        nodes: timeline.full,
      },
      signature: {
        paragraphs: [
          `${title} ist ein Porträt in Symbolen: ein ${element.name}-Zeichen, ${modality.name.toLowerCase()} in seiner Qualität, regiert von ${ruler.name}, geboren ${part.phrase} ${moonContent.at} an einem ${weekday.day}.`,
          `Dein Licht: ${strengths[0].title} und ${strengths[1].title}. Deine Kante: ${tensions[0].title}. Deine Einladung für jetzt: ${growth.title}.`,
          'Nichts davon ist festgeschrieben. Wie der Himmel selbst ist ein Profil ein bewegtes Bild – zum Wiederkommen, Hinterfragen und Neuschreiben.',
        ],
        symbols: [
          { label: 'Leitstern', value: content.star },
          { label: 'Geburtsstein', value: BIRTHSTONES[date.month - 1] },
          { label: 'Geburtsblume', value: BIRTH_FLOWERS[date.month - 1] },
          { label: 'Planetentag', value: `${weekday.day} · ${weekday.planet}`, note: weekday.origin },
          { label: 'Symbolfarbe', value: content.color },
          { label: 'Persönliches Sternbild', value: asterism.name, note: asterism.translation },
        ],
        mantra: content.mantra,
      },
    },
  };
}

export const localDemoProvider: ReadingProvider = {
  engine: DEMO_ENGINE,
  async generate(input, options) {
    if (options?.signal?.aborted) throw new DOMException('Deutung abgebrochen', 'AbortError');
    return buildDemoReading(input, options?.now ?? new Date());
  },
};
