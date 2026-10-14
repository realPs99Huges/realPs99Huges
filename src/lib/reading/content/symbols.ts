import type { DayPartId, MoonPhaseId } from '../../astro/sky';
import type { ElementId, ModalityId } from '../../astro/zodiac';
import type { GlyphId } from '../types';

export const ELEMENT_CONTENT: Record<
  ElementId,
  { temperament: string; adjective: string; landscapes: string; motifs: string; recharge: string; direction: string }
> = {
  fire: {
    temperament: 'Als Feuerzeichen ist dein symbolisches Temperament warm, bewegt und ausdrucksstark.',
    adjective: 'feurige, ausdrucksstarke',
    landscapes: 'sonnige Hochebenen, Vulkaninseln und weite Wüstenhorizonte',
    motifs: 'Herdfeuer, Festfeuer und Mittsommerfeste',
    recharge: 'Bewegung, Abenteuer, Spiel und viel Tageslicht',
    direction: 'Süden',
  },
  earth: {
    temperament: 'Als Erdzeichen ist dein symbolisches Temperament geerdet, geduldig und praktisch.',
    adjective: 'geerdete, geduldige',
    landscapes: 'alte Wälder, Bergtäler und Terrassenfelder',
    motifs: 'Erntefeste, Handwerkstraditionen und Dorfmärkte',
    recharge: 'Natur, Routine, gutes Essen und Arbeit mit den Händen',
    direction: 'Norden',
  },
  air: {
    temperament: 'Als Luftzeichen ist dein symbolisches Temperament neugierig, gesellig und wortgewandt.',
    adjective: 'neugierige, verbindende',
    landscapes: 'offene Ebenen, windige Küsten und Städte an alten Kreuzungen',
    motifs: 'Handelswege, Bibliotheken und reisende Boten',
    recharge: 'Gespräche, Lernen, Weite und neue Perspektiven',
    direction: 'Osten',
  },
  water: {
    temperament: 'Als Wasserzeichen ist dein symbolisches Temperament fühlend, intuitiv und empfänglich.',
    adjective: 'tiefe, intuitive',
    landscapes: 'Flussdeltas, Häfen, Seeufer und neblige Küsten',
    motifs: 'Seefahrerlieder, heilige Quellen und Geschichten der Gezeiten',
    recharge: 'Rückzug, Musik, Wasser und vertraute Menschen',
    direction: 'Westen',
  },
};

export const MODALITY_CONTENT: Record<ModalityId, { text: string; phrase: string }> = {
  cardinal: {
    text: 'Kardinale Zeichen eröffnen eine Jahreszeit – sie stehen für das Talent, Dinge in Gang zu setzen.',
    phrase: 'gern Dinge in Gang setzt',
  },
  fixed: {
    text: 'Fixe Zeichen halten die Mitte einer Jahreszeit – sie stehen für Tiefe, Ausdauer und Treue.',
    phrase: 'Halt gibt und in die Tiefe geht',
  },
  mutable: {
    text: 'Veränderliche Zeichen schließen eine Jahreszeit ab – sie stehen für Anpassung und Verwandlung.',
    phrase: 'sich anpasst, verbindet und verwandelt',
  },
};

export const DAY_PART_CONTENT: Record<
  DayPartId,
  { label: string; phrase: string; genitives: [string, string]; text: string; latin: string; latinMeaning: string }
> = {
  'deep-night': {
    label: 'Tiefe Nacht',
    phrase: 'tief in der Nacht',
    genitives: ['der Mitternacht', 'der Sternennacht'],
    text: 'Du kamst in der tiefsten Stunde der Nacht zur Welt – symbolisch ein inneres, nachdenkliches Licht.',
    latin: 'Noctis',
    latinMeaning: 'der Nacht',
  },
  'before-dawn': {
    label: 'Vor Sonnenaufgang',
    phrase: 'vor Sonnenaufgang',
    genitives: ['der stillen Stunde', 'des letzten Sterns'],
    text: 'Du wurdest vor Sonnenaufgang geboren, als die letzten Sterne verblassten – symbolisch die Stunde der Schwellen.',
    latin: 'Silentii',
    latinMeaning: 'der Stille',
  },
  dawn: {
    label: 'Morgendämmerung',
    phrase: 'in der Morgendämmerung',
    genitives: ['der Morgendämmerung', 'des ersten Lichts'],
    text: 'Du kamst um Sonnenaufgang zur Welt. Astrologisch steht die Sonne dann nahe dem Aszendenten – dem Punkt des Aufbruchs.',
    latin: 'Aurorae',
    latinMeaning: 'der Morgenröte',
  },
  morning: {
    label: 'Vormittag',
    phrase: 'am Vormittag',
    genitives: ['des Morgens', 'des steigenden Lichts'],
    text: 'Du wurdest am Vormittag geboren, als die Sonne stieg – symbolisch eine Energie von Wachstum und Aufbruch.',
    latin: 'Diei',
    latinMeaning: 'des Tages',
  },
  zenith: {
    label: 'Mittag',
    phrase: 'um die Mittagszeit',
    genitives: ['des Zenits', 'der Mittagssonne'],
    text: 'Du kamst um die Mittagszeit zur Welt, als die Sonne fast am höchsten stand – symbolisch Sichtbarkeit und Berufung.',
    latin: 'Meridiei',
    latinMeaning: 'des Mittags',
  },
  afternoon: {
    label: 'Nachmittag',
    phrase: 'am Nachmittag',
    genitives: ['des goldenen Lichts', 'des Nachmittags'],
    text: 'Du wurdest am Nachmittag im langen, schrägen Licht geboren – symbolisch die Stunde von Beziehung und Austausch.',
    latin: 'Solis',
    latinMeaning: 'der Sonne',
  },
  dusk: {
    label: 'Abenddämmerung',
    phrase: 'in der Abenddämmerung',
    genitives: ['der Abenddämmerung', 'des Zwielichts'],
    text: 'Du kamst um Sonnenuntergang zur Welt. Astrologisch steht die Sonne dann nahe dem Deszendenten – dem Punkt der Begegnung.',
    latin: 'Crepusculi',
    latinMeaning: 'der Dämmerung',
  },
  evening: {
    label: 'Abend',
    phrase: 'am Abend',
    genitives: ['des Abends', 'der blauen Stunde'],
    text: 'Du wurdest am Abend geboren, als die ersten Sterne erschienen – symbolisch verbunden mit Fantasie und Nähe.',
    latin: 'Vesperis',
    latinMeaning: 'des Abends',
  },
  unknown: {
    label: 'Unbekannt',
    phrase: 'zu unbekannter Stunde',
    genitives: ['der ungeschriebenen Stunde', 'des Unbekannten'],
    text: 'Deine genaue Geburtszeit ist unbekannt – die Deutung stützt sich deshalb auf Sonnenstand und Mondphase.',
    latin: 'Ignoti',
    latinMeaning: 'des Unbekannten',
  },
};

export const MOON_CONTENT: Record<MoonPhaseId, { genitive: string; at: string; text: string }> = {
  new: {
    genitive: 'des Neumonds',
    at: 'bei Neumond',
    text: 'Geboren bei Neumond: in der Mondsymbolik eine Zeit der Samen und Absichten.',
  },
  'waxing-crescent': {
    genitive: 'der silbernen Sichel',
    at: 'bei zunehmender Mondsichel',
    text: 'Geboren bei zunehmender Sichel: eine Phase von Hoffnung und wachsendem Mut.',
  },
  'first-quarter': {
    genitive: 'des wachsenden Mondes',
    at: 'im ersten Mondviertel',
    text: 'Geboren im ersten Viertel, halb Licht, halb Schatten: eine Phase von Entscheidung und Tatkraft.',
  },
  'waxing-gibbous': {
    genitive: 'des fast vollen Mondes',
    at: 'bei zunehmendem Mond',
    text: 'Geboren bei fast vollem Mond: eine Phase von Verfeinerung und Hingabe.',
  },
  full: {
    genitive: 'des Vollmonds',
    at: 'bei Vollmond',
    text: 'Geboren bei Vollmond, wenn der Mond der Sonne gegenübersteht: eine Phase von Klarheit und Begegnung.',
  },
  'waning-gibbous': {
    genitive: 'des schwindenden Lichts',
    at: 'bei abnehmendem Mond',
    text: 'Geboren bei abnehmendem Mond: eine Phase des Teilens und Weitergebens.',
  },
  'last-quarter': {
    genitive: 'des letzten Viertels',
    at: 'im letzten Mondviertel',
    text: 'Geboren im letzten Viertel: eine Phase von Neubewertung und Loslassen.',
  },
  'waning-crescent': {
    genitive: 'der letzten Sichel',
    at: 'bei abnehmender Mondsichel',
    text: 'Geboren bei abnehmender Sichel, dem letzten Mondlicht: eine Phase von Träumen, Ruhe und Intuition.',
  },
};

export const HOUSES: Array<{ name: string; theme: string }> = [
  { name: 'Haus des Selbst', theme: 'Identität, Auftreten und Neubeginn' },
  { name: 'Haus der Ressourcen', theme: 'Werte, Sicherheit und Selbstwert' },
  { name: 'Haus der Kommunikation', theme: 'Lernen, Geschwister und die nahe Umgebung' },
  { name: 'Haus der Wurzeln', theme: 'Zuhause, Familie und innere Fundamente' },
  { name: 'Haus der Kreativität', theme: 'Freude, Spiel, Romantik und Selbstausdruck' },
  { name: 'Haus des Alltags', theme: 'Tagesrhythmus, Gesundheit und Dienst' },
  { name: 'Haus der Partnerschaft', theme: 'enge Beziehungen und Begegnung' },
  { name: 'Haus der Verwandlung', theme: 'Nähe, geteilte Ressourcen und Erneuerung' },
  { name: 'Haus der Horizonte', theme: 'Reisen, Philosophie und höhere Bildung' },
  { name: 'Haus der Berufung', theme: 'Beruf, Öffentlichkeit und Vermächtnis' },
  { name: 'Haus der Gemeinschaft', theme: 'Freundschaft, Netzwerke und Zukunftswünsche' },
  { name: 'Haus des Verborgenen', theme: 'Rückzug, Träume und das Unbewusste' },
];

export interface IntentionTheme {
  id: string;
  focus: string;
  keywords: string[];
  question: string;
  night: string;
}

/**
 * Keyword themes (German & English) used to echo the visitor's own question.
 * A trailing * marks a prefix; entries with spaces match as phrases.
 */
export const INTENTION_THEMES: IntentionTheme[] = [
  {
    id: 'connection',
    focus: 'Liebe und Verbindung',
    keywords: [
      'liebe',
      'verliebt',
      'beziehung*',
      'partner*',
      'herz*',
      'freund*',
      'einsam*',
      'ehe',
      'lov*',
      'relationship*',
      'heart*',
      'dating',
      'friend*',
      'lonel*',
    ],
    question: 'Was möchtest du in deinen engsten Verbindungen geben – und was möchtest du empfangen?',
    night: 'Schreibe einen Brief, den du nicht abschickst – an einen Menschen, der deine Art zu lieben geprägt hat.',
  },
  {
    id: 'vocation',
    focus: 'Beruf und Berufung',
    keywords: [
      'beruf*',
      'karriere*',
      'arbeit*',
      'job*',
      'erfolg*',
      'geld',
      'stud*',
      'firma',
      'selbstständig*',
      'career*',
      'work*',
      'purpose*',
      'success*',
      'money',
      'business*',
    ],
    question: 'Wenn deine Arbeit ein echter Ausdruck von dir wäre – wie sähe sie in einem Jahr aus?',
    night: 'Notiere drei Momente, in denen sich Arbeit sinnvoll anfühlte. Was hatten sie gemeinsam?',
  },
  {
    id: 'creativity',
    focus: 'Kreativität und Ausdruck',
    keywords: [
      'kreativ*',
      'kunst*',
      'künstler*',
      'schreib*',
      'musik*',
      'malen',
      'zeichn*',
      'design*',
      'creat*',
      'art',
      'artist*',
      'writ*',
      'music*',
      'paint*',
    ],
    question: 'Welchem kreativen Impuls wartest du noch auf Erlaubnis zu folgen?',
    night: 'Erschaffe in zehn Minuten etwas Kleines und Unperfektes – und schreib auf, wie es sich anfühlte.',
  },
  {
    id: 'roots',
    focus: 'Wurzeln und Zugehörigkeit',
    keywords: [
      'familie*',
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
      'famil*',
      'home',
      'root*',
      'parent*',
      'origin*',
      'ancest*',
      'heritage',
      'cultur*',
    ],
    question: 'Welche Geschichte aus deiner Familie möchtest du besser verstehen – und wen könntest du danach fragen?',
    night:
      'Schreib eine Familiengeschichte auf, die dir als Kind erzählt wurde. Was lehrte sie dich über Zugehörigkeit?',
  },
  {
    id: 'change',
    focus: 'Wandel und Richtung',
    keywords: [
      'veränder*',
      'wandel*',
      'umzug*',
      'entscheid*',
      'zukunft*',
      'richtung*',
      'neuanfang*',
      'neubeginn*',
      'weg',
      'chang*',
      'transition*',
      'mov*',
      'decision*',
      'decid*',
      'future*',
      'direction*',
    ],
    question: 'Welcher kleine Schritt würde den Wandel, über den du nachdenkst, real machen?',
    night: 'Beschreibe dein Leben in einem Jahr, als wäre es schon so – im Präsens.',
  },
  {
    id: 'calm',
    focus: 'innere Ruhe',
    keywords: [
      'angst*',
      'ängst*',
      'stress*',
      'ruhe*',
      'frieden*',
      'sorge*',
      'überforder*',
      'erschöpf*',
      'gelassen*',
      'burnout',
      'fear*',
      'anxi*',
      'calm*',
      'peace*',
      'worr*',
    ],
    question: 'Was hilft dir, im Körper zu spüren, dass du gerade sicher bist?',
    night: 'Bemerke vor dem Schlafen fünf stille Dinge um dich herum. Schreib sie auf, ohne zu bewerten.',
  },
  {
    id: 'self',
    focus: 'Selbsterkenntnis',
    keywords: [
      'wer bin ich',
      'selbst*',
      'identität*',
      'persönlichkeit*',
      'stärke*',
      'sinn*',
      'mich',
      'who am i',
      'myself',
      'identity',
      'confiden*',
      'personalit*',
      'meaning*',
    ],
    question: 'Welchen Teil von dir lernst du gerade erst kennen?',
    night: 'Schreib zehnmal den Satz „Ich bin jemand, der …“ und beende ihn jedes Mal anders.',
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
    title: 'Erstes Licht',
    cycle: 'Geburt',
    theme: 'Der Himmel deiner Geburt – das erste Bild deiner Geschichte.',
    question: 'Was weißt du über den Tag deiner Geburt – und wer könnte dir mehr erzählen?',
  },
  {
    id: 'saturn-square',
    age: 7.4,
    glyph: 'saturn',
    title: 'Die erste Struktur',
    cycle: 'Erstes Saturn-Quadrat',
    theme: 'Traditionell verbunden mit ersten Erfahrungen von Regeln und Verantwortung.',
    question: 'Was hast du früh darüber gelernt, was von dir erwartet wird?',
  },
  {
    id: 'jupiter-return-1',
    age: 11.9,
    glyph: 'jupiter',
    title: 'Der erste Horizont',
    cycle: 'Erste Jupiter-Wiederkehr',
    theme: 'Verbunden mit Wachstum – die Welt wird größer als das Zuhause.',
    question: 'Wann hast du zum ersten Mal gespürt, dass die Welt größer ist als gedacht?',
  },
  {
    id: 'nodal-return-1',
    age: 18.6,
    glyph: 'node',
    title: 'Die rufende Stimme',
    cycle: 'Erste Mondknoten-Wiederkehr',
    theme: 'In der Astrologie verbunden mit Richtung und einem ersten Gefühl für den eigenen Weg.',
    question: 'Wonach hast du mit 18 oder 19 gesucht – und ruft es noch?',
  },
  {
    id: 'saturn-return-1',
    age: 29.5,
    glyph: 'saturn',
    title: 'Die Schwelle',
    cycle: 'Erste Saturn-Wiederkehr',
    theme: 'Der bekannteste Zyklus der Astrologie – verbunden mit Reife und der Frage, was wirklich zu dir gehört.',
    question: 'Welche deiner Verpflichtungen sind wirklich deine – und welche hast du übernommen?',
  },
  {
    id: 'nodal-return-2',
    age: 37.2,
    glyph: 'node',
    title: 'Der zweite Kompass',
    cycle: 'Zweite Mondknoten-Wiederkehr',
    theme: 'Verbunden mit einer neuen Prüfung der eigenen Richtung.',
    question: 'Wenn dein Weg ein Fluss wäre – wo hat er sich sein Bett gegraben?',
  },
  {
    id: 'uranus-opposition',
    age: 42,
    glyph: 'uranus',
    title: 'Das Erwachen',
    cycle: 'Uranus-Opposition',
    theme: 'Verbunden mit Neuerfindung in der Lebensmitte – ein Ruf nach Echtheit und Freiheit.',
    question: 'Welcher Teil von dir wünscht sich mehr Freiheit?',
  },
  {
    id: 'chiron-return',
    age: 50.7,
    glyph: 'chiron',
    title: 'Die Rückkehr des Heilers',
    cycle: 'Chiron-Wiederkehr',
    theme: 'Verbunden damit, alte Wunden in Weisheit zu verwandeln.',
    question: 'Was hat dich das Leben gelehrt, das du jetzt weitergeben kannst?',
  },
  {
    id: 'saturn-return-2',
    age: 58.9,
    glyph: 'saturn',
    title: 'Die Ernte',
    cycle: 'Zweite Saturn-Wiederkehr',
    theme: 'Verbunden mit Vermächtnis und Meisterschaft.',
    question: 'Was sollen deine Arbeit und deine Präsenz hinterlassen?',
  },
  {
    id: 'jupiter-return-6',
    age: 71.2,
    glyph: 'jupiter',
    title: 'Der weite Horizont',
    cycle: 'Sechste Jupiter-Wiederkehr',
    theme: 'Verbunden mit Weisheit, Großzügigkeit und Weitblick.',
    question: 'Welche Weisheit möchtest du einem jüngeren Menschen schenken?',
  },
  {
    id: 'uranus-return',
    age: 84,
    glyph: 'uranus',
    title: 'Der volle Kreis',
    cycle: 'Uranus-Wiederkehr',
    theme: 'Uranus vollendet eine Umrundung der Sonne – ein symbolischer Kreis eines Lebens.',
    question: 'Was war, aufs Ganze geschaut, der goldene Faden?',
  },
];

export const BIRTHSTONES = [
  'Granat',
  'Amethyst',
  'Aquamarin',
  'Diamant',
  'Smaragd',
  'Perle',
  'Rubin',
  'Peridot',
  'Saphir',
  'Opal',
  'Topas',
  'Türkis',
];

export const BIRTH_FLOWERS = [
  'Nelke',
  'Veilchen',
  'Osterglocke',
  'Gänseblümchen',
  'Maiglöckchen',
  'Rose',
  'Rittersporn',
  'Gladiole',
  'Aster',
  'Ringelblume',
  'Chrysantheme',
  'Narzisse',
];

/** Chinese zodiac animals, starting with the Rat (year 4 CE). */
export const CHINESE_ANIMALS = [
  'Ratte',
  'Büffel',
  'Tiger',
  'Hase',
  'Drache',
  'Schlange',
  'Pferd',
  'Ziege',
  'Affe',
  'Hahn',
  'Hund',
  'Schwein',
];

export const ASTERISM_NOUNS: Array<[string, string]> = [
  ['Corona', 'Krone'],
  ['Arcus', 'Bogen'],
  ['Lumen', 'Licht'],
  ['Velum', 'Schleier'],
  ['Porta', 'Tor'],
  ['Ala', 'Flügel'],
  ['Rosa', 'Rose'],
  ['Navis', 'Schiff'],
  ['Lyra', 'Leier'],
  ['Clavis', 'Schlüssel'],
  ['Fons', 'Quelle'],
  ['Scala', 'Treppe'],
];

/**
 * Constellation actually behind the Sun (IAU boundaries, current epoch) by calendar date.
 * Differs from the astrological sign because of the precession of Earth's axis.
 */
export const SUN_CONSTELLATIONS: Array<{ name: string; from: [number, number] }> = [
  { name: 'Schütze', from: [1, 1] },
  { name: 'Steinbock', from: [1, 20] },
  { name: 'Wassermann', from: [2, 16] },
  { name: 'Fische', from: [3, 12] },
  { name: 'Widder', from: [4, 19] },
  { name: 'Stier', from: [5, 14] },
  { name: 'Zwillinge', from: [6, 21] },
  { name: 'Krebs', from: [7, 20] },
  { name: 'Löwe', from: [8, 10] },
  { name: 'Jungfrau', from: [9, 16] },
  { name: 'Waage', from: [10, 31] },
  { name: 'Skorpion', from: [11, 23] },
  { name: 'Schlangenträger', from: [11, 29] },
  { name: 'Schütze', from: [12, 18] },
];
