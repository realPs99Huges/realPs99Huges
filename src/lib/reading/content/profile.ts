import type { ElementId, ModalityId, ZodiacId } from '../../astro/zodiac';

/** One short answer plus one plain sentence that explains it. */
export interface Trait {
  value: string;
  text: string;
}

export interface SignProfile {
  core: string;
  drive: Trait;
  challenge: Trait;
  love: Trait;
  work: Trait;
  stress: Trait;
  /** Traditionally harmonious signs: same element plus one complementary sign. */
  matches: [ZodiacId, ZodiacId, ZodiacId];
}

export const SIGN_PROFILE: Record<ZodiacId, SignProfile> = {
  aries: {
    core: 'Mutig & direkt',
    drive: { value: 'Neues anfangen', text: 'Du blühst auf, wenn etwas beginnt und du vorangehen kannst.' },
    challenge: { value: 'Geduld', text: 'Dinge zu Ende zu bringen, kostet dich mehr Kraft, als sie zu starten.' },
    love: { value: 'Leidenschaftlich', text: 'Du zeigst offen, was du fühlst, und magst es ehrlich und lebendig.' },
    work: { value: 'Pionierarbeit', text: 'Du bist stark, wo Tempo, Mut und Eigeninitiative gefragt sind.' },
    stress: { value: 'Wird ungeduldig', text: 'Unter Druck reagierst du schnell – manchmal schneller als nötig.' },
    matches: ['leo', 'sagittarius', 'gemini'],
  },
  taurus: {
    core: 'Ruhig & verlässlich',
    drive: { value: 'Sicherheit schaffen', text: 'Dich motiviert, etwas Bleibendes und Wertvolles aufzubauen.' },
    challenge: { value: 'Loslassen', text: 'Veränderungen fallen dir schwer, auch wenn sie dir guttun würden.' },
    love: { value: 'Treu & sinnlich', text: 'Du liebst beständig und zeigst Zuneigung durch Nähe und Fürsorge.' },
    work: { value: 'Ausdauer', text: 'Du bist stark, wo Geduld, Qualität und Verlässlichkeit zählen.' },
    stress: { value: 'Wird stur', text: 'Unter Druck hältst du an Gewohntem fest und ziehst dich zurück.' },
    matches: ['virgo', 'capricorn', 'cancer'],
  },
  gemini: {
    core: 'Neugierig & wendig',
    drive: { value: 'Neues lernen', text: 'Dich treiben Ideen, Gespräche und Abwechslung an.' },
    challenge: { value: 'Fokus halten', text: 'Bei so vielen Interessen ist es schwer, bei einer Sache zu bleiben.' },
    love: { value: 'Verspielt & offen', text: 'Du brauchst Gespräche, Humor und eine geistige Verbindung.' },
    work: { value: 'Kommunikation', text: 'Du bist stark, wo Sprache, Vernetzung und schnelles Denken gefragt sind.' },
    stress: { value: 'Wird unruhig', text: 'Unter Druck springst du zwischen Gedanken hin und her.' },
    matches: ['libra', 'aquarius', 'aries'],
  },
  cancer: {
    core: 'Fürsorglich & feinfühlig',
    drive: { value: 'Geborgenheit', text: 'Dich motiviert, ein sicheres Zuhause für dich und andere zu schaffen.' },
    challenge: { value: 'Abgrenzen', text: 'Du nimmst dir die Stimmungen anderer leicht zu Herzen.' },
    love: { value: 'Hingebungsvoll', text: 'Du liebst tief, beschützend und mit viel Gefühl.' },
    work: { value: 'Fürsorge', text: 'Du bist stark, wo Einfühlung, Gedächtnis und Teamgefühl zählen.' },
    stress: { value: 'Zieht sich zurück', text: 'Unter Druck gehst du in deinen Panzer und brauchst Ruhe.' },
    matches: ['scorpio', 'pisces', 'taurus'],
  },
  leo: {
    core: 'Warmherzig & selbstbewusst',
    drive: { value: 'Gesehen werden', text: 'Dich motiviert, etwas Eigenes zu zeigen und andere zu begeistern.' },
    challenge: { value: 'Kritik annehmen', text: 'Fehlende Anerkennung trifft dich mehr, als du zeigst.' },
    love: { value: 'Großzügig & loyal', text: 'Du liebst mit großem Herzen und zeigst es gern.' },
    work: { value: 'Führung', text: 'Du bist stark, wo Ausstrahlung, Kreativität und Mut gefragt sind.' },
    stress: { value: 'Will die Kontrolle', text: 'Unter Druck möchtest du das Steuer und die Bühne behalten.' },
    matches: ['aries', 'sagittarius', 'libra'],
  },
  virgo: {
    core: 'Genau & hilfsbereit',
    drive: { value: 'Dinge verbessern', text: 'Dich motiviert, Abläufe und Ergebnisse besser zu machen.' },
    challenge: { value: 'Perfektionismus', text: 'Dein hoher Anspruch macht dich manchmal zu streng mit dir selbst.' },
    love: { value: 'Aufmerksam', text: 'Du zeigst Liebe durch kleine Gesten und praktische Hilfe.' },
    work: { value: 'Präzision', text: 'Du bist stark, wo Sorgfalt, Analyse und Organisation zählen.' },
    stress: { value: 'Grübelt', text: 'Unter Druck machst du dir viele Gedanken und Sorgen.' },
    matches: ['taurus', 'capricorn', 'scorpio'],
  },
  libra: {
    core: 'Ausgleichend & fair',
    drive: { value: 'Harmonie', text: 'Dich motiviert, Schönheit und faire Lösungen zu schaffen.' },
    challenge: { value: 'Entscheiden', text: 'Du siehst alle Seiten – das macht klare Entscheidungen schwer.' },
    love: { value: 'Romantisch', text: 'Partnerschaft ist dir wichtig; du suchst Gleichgewicht und Stil.' },
    work: { value: 'Vermittlung', text: 'Du bist stark, wo Diplomatie, Ästhetik und Teamarbeit gefragt sind.' },
    stress: { value: 'Weicht aus', text: 'Unter Druck vermeidest du Konflikte, auch wenn sie nötig wären.' },
    matches: ['gemini', 'aquarius', 'leo'],
  },
  scorpio: {
    core: 'Intensiv & tiefgründig',
    drive: { value: 'Wahrheit', text: 'Dich motiviert, den Dingen auf den Grund zu gehen.' },
    challenge: { value: 'Vertrauen', text: 'Du öffnest dich erst, wenn du dir ganz sicher bist.' },
    love: { value: 'Leidenschaftlich & treu', text: 'Du liebst ganz oder gar nicht.' },
    work: { value: 'Tiefgang', text: 'Du bist stark, wo Ausdauer, Recherche und Veränderung gefragt sind.' },
    stress: { value: 'Will alles im Griff', text: 'Unter Druck versuchst du, jede Situation zu kontrollieren.' },
    matches: ['cancer', 'pisces', 'virgo'],
  },
  sagittarius: {
    core: 'Optimistisch & frei',
    drive: { value: 'Freiheit & Sinn', text: 'Dich motivieren neue Horizonte, Reisen und große Fragen.' },
    challenge: { value: 'Verbindlichkeit', text: 'Feste Verpflichtungen fühlen sich für dich schnell eng an.' },
    love: { value: 'Abenteuerlustig', text: 'Du brauchst Freiraum und gemeinsame Entdeckungen.' },
    work: { value: 'Visionen', text: 'Du bist stark, wo Begeisterung, Lehren und Weitblick zählen.' },
    stress: { value: 'Flüchtet nach vorn', text: 'Unter Druck suchst du Ablenkung oder den nächsten Aufbruch.' },
    matches: ['aries', 'leo', 'aquarius'],
  },
  capricorn: {
    core: 'Ehrgeizig & diszipliniert',
    drive: { value: 'Ziele erreichen', text: 'Dich motiviert, Schritt für Schritt etwas Großes aufzubauen.' },
    challenge: { value: 'Entspannen', text: 'Pausen fühlen sich für dich schnell wie verlorene Zeit an.' },
    love: { value: 'Beständig', text: 'Du liebst verlässlich und zeigst es eher durch Taten als durch Worte.' },
    work: { value: 'Verantwortung', text: 'Du bist stark, wo Planung, Ausdauer und Führung gefragt sind.' },
    stress: { value: 'Arbeitet mehr', text: 'Unter Druck ziehst du dich in Arbeit und Kontrolle zurück.' },
    matches: ['taurus', 'virgo', 'pisces'],
  },
  aquarius: {
    core: 'Originell & unabhängig',
    drive: { value: 'Etwas verändern', text: 'Dich motivieren neue Ideen und eine bessere Zukunft für alle.' },
    challenge: { value: 'Nähe zulassen', text: 'Gefühle zeigst du lieber mit etwas Abstand.' },
    love: { value: 'Auf Augenhöhe', text: 'Du brauchst Freiheit und eine Partnerschaft, die auch Freundschaft ist.' },
    work: { value: 'Innovation', text: 'Du bist stark, wo neue Wege, Technik und Teamgeist zählen.' },
    stress: { value: 'Wird distanziert', text: 'Unter Druck ziehst du dich in den Kopf zurück.' },
    matches: ['gemini', 'libra', 'sagittarius'],
  },
  pisces: {
    core: 'Einfühlsam & fantasievoll',
    drive: { value: 'Sinn & Verbundenheit', text: 'Dich motivieren Kreativität, Mitgefühl und das große Ganze.' },
    challenge: { value: 'Grenzen setzen', text: 'Du fühlst so stark mit, dass du dich leicht in anderen verlierst.' },
    love: { value: 'Romantisch', text: 'Du liebst tief, verträumt und mit viel Mitgefühl.' },
    work: { value: 'Kreativität', text: 'Du bist stark, wo Fantasie, Intuition und Hilfsbereitschaft gefragt sind.' },
    stress: { value: 'Taucht ab', text: 'Unter Druck ziehst du dich in deine Innenwelt zurück.' },
    matches: ['cancer', 'scorpio', 'capricorn'],
  },
};

export const ELEMENT_STYLE: Record<ElementId, { talk: Trait; recharge: Trait }> = {
  fire: {
    talk: { value: 'Direkt & begeistert', text: 'Du sagst, was du denkst – mit Energie und Leidenschaft.' },
    recharge: { value: 'Bewegung & Licht', text: 'Sport, Abenteuer und Sonne geben dir schnell Kraft zurück.' },
  },
  earth: {
    talk: { value: 'Klar & praktisch', text: 'Du redest nicht um den heißen Brei und bleibst bei den Fakten.' },
    recharge: { value: 'Natur & Ruhe', text: 'Draußen sein, gutes Essen und feste Routinen erden dich.' },
  },
  air: {
    talk: { value: 'Gesprächig & neugierig', text: 'Du denkst laut, stellst Fragen und verbindest Ideen.' },
    recharge: { value: 'Austausch & Neues', text: 'Gute Gespräche, Lernen und frische Eindrücke laden dich auf.' },
  },
  water: {
    talk: { value: 'Einfühlsam', text: 'Du hörst zwischen den Zeilen und sprichst aus dem Gefühl.' },
    recharge: { value: 'Rückzug & Musik', text: 'Zeit für dich, Musik, Wasser und vertraute Menschen tun dir gut.' },
  },
};

export const MODALITY_STYLE: Record<ModalityId, Trait> = {
  cardinal: { value: 'Schnell & entschlossen', text: 'Du entscheidest lieber zügig und legst dann los.' },
  fixed: { value: 'Gründlich & beständig', text: 'Du entscheidest überlegt – und bleibst dann dabei.' },
  mutable: { value: 'Flexibel & offen', text: 'Du wägst Möglichkeiten ab und passt dich an die Lage an.' },
};

/** Numerology "life path" meanings (digit sum of the birth date). */
export const LIFE_PATH: Record<number, Trait> = {
  1: { value: 'Eigenständig', text: 'Die 1 steht für Unabhängigkeit, Initiative und den eigenen Weg.' },
  2: { value: 'Verbindend', text: 'Die 2 steht für Feingefühl, Partnerschaft und Diplomatie.' },
  3: { value: 'Kreativ', text: 'Die 3 steht für Ausdruck, Kreativität und Lebensfreude.' },
  4: { value: 'Beständig', text: 'Die 4 steht für Struktur, Fleiß und Verlässlichkeit.' },
  5: { value: 'Freiheitsliebend', text: 'Die 5 steht für Wandel, Abenteuer und Neugier.' },
  6: { value: 'Fürsorglich', text: 'Die 6 steht für Verantwortung, Fürsorge und Harmonie.' },
  7: { value: 'Nachdenklich', text: 'Die 7 steht für Tiefgang, Analyse und Intuition.' },
  8: { value: 'Zielstrebig', text: 'Die 8 steht für Ehrgeiz, Erfolg und Durchsetzungskraft.' },
  9: { value: 'Mitfühlend', text: 'Die 9 steht für Idealismus, Großzügigkeit und Weitblick.' },
  11: { value: 'Inspirierend', text: 'Die Meisterzahl 11 steht für Intuition und Inspiration.' },
  22: { value: 'Visionär', text: 'Die Meisterzahl 22 steht für große Pläne, die Wirklichkeit werden.' },
  33: { value: 'Heilend', text: 'Die Meisterzahl 33 steht für Mitgefühl und Hingabe.' },
};

/** Traditional weekday of each ruling planet (modern rulers use their traditional co-ruler). */
export const PLANET_WEEKDAY: Record<string, string> = {
  sun: 'Sonntag',
  moon: 'Montag',
  mars: 'Dienstag',
  mercury: 'Mittwoch',
  jupiter: 'Donnerstag',
  venus: 'Freitag',
  saturn: 'Samstag',
};
