import { getMessages } from "@/i18n";
import { FORMATS, isVideoFormat, LOW_HASHTAG_PLATFORMS, OBJECTIVES, type Platform } from "@/config/options";
import { weekdayIndex } from "@/lib/dates";
import type {
  AIProvider,
  BrandContext,
  ContentPackage,
  ContentRequest,
  DayRequest,
  PlanRequest,
  PlanSuggestion,
  Section,
  SectionPatch,
} from "../types";

/**
 * Demo provider: template-based sample content used when no AI provider is configured.
 * Everything it produces is stored with source "demo" and labelled as such in the UI.
 */

const t = getMessages("de");

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, values: readonly T[]): T {
  return values[Math.floor(rand() * values.length)];
}

function you(formality: string) {
  const sie = formality === "sie";
  return {
    du: sie ? "Sie" : "du",
    dich: sie ? "Sie" : "dich",
    dir: sie ? "Ihnen" : "dir",
    dein: sie ? "Ihr" : "dein",
    deine: sie ? "Ihre" : "deine",
    komm: sie ? "Kommen Sie" : "Komm",
    schau: sie ? "Schauen Sie" : "Schau",
    sag: sie ? "Sagen Sie" : "Sag",
    speicher: sie ? "Speichern Sie" : "Speicher",
    schreib: sie ? "Schreiben Sie" : "Schreib",
    markier: sie ? "Markieren Sie" : "Markier",
    sichere: sie ? "Sichern Sie sich" : "Sichere dir",
  };
}

const HOOKS: Record<string, ((topic: string, name: string, y: ReturnType<typeof you>) => string)[]> = {
  reach: [
    (topic) => `Das hier fragt uns fast jeder: ${topic}.`,
    (topic) => `3 Dinge über ${topic}, die kaum jemand weiß.`,
    (topic, name) => `Warum bei ${name} gerade alle über ${topic} reden.`,
  ],
  engagement: [
    (topic, _n, y) => `Ehrliche Frage: Wie stehst ${y.du} zu ${topic}?`,
    (topic) => `Team A oder Team B? Bei ${topic} scheiden sich die Geister.`,
    (topic, _n, y) => `${y.sag} uns in einem Wort, was ${y.du} bei ${topic} denkst.`,
  ],
  sales: [
    (topic, _n, y) => `${topic} – und so ${y.du === "Sie" ? "bekommen Sie" : "bekommst du"} es, bevor es weg ist.`,
    (topic, _n, y) => `Wenn ${y.du} ${topic} noch nicht kennst, ist jetzt der Moment.`,
    (topic) => `Nur für kurze Zeit: ${topic}.`,
  ],
  awareness: [
    (topic, name) => `Was ${name} ausmacht? Zum Beispiel ${topic}.`,
    (topic) => `So sieht ${topic} bei uns hinter den Kulissen aus.`,
    (topic, name, y) => `Neu hier? Dann ${y.du === "Sie" ? "lernen Sie" : "lern"} ${name} in 20 Sekunden kennen – mit ${topic}.`,
  ],
  community: [
    (topic) => `Ohne euch gäbe es ${topic} nicht.`,
    (topic, name) => `Ein kleines Danke an alle, die ${name} zu dem machen, was es ist – heute: ${topic}.`,
    (topic, _n, y) => `Wir wollen ${y.deine} Geschichte zu ${topic} hören.`,
  ],
};

const CTAS: Record<string, ((y: ReturnType<typeof you>) => string)[]> = {
  reach: [(y) => `${y.speicher} den Post für später und ${y.du === "Sie" ? "teilen Sie" : "teil"} ihn mit jemandem, der das wissen sollte.`],
  engagement: [(y) => `${y.schreib} uns ${y.deine} Meinung in die Kommentare.`, (y) => `${y.markier} jemanden, mit dem ${y.du} das teilen willst.`],
  sales: [(y) => `${y.sichere} jetzt ${y.dein} Exemplar – Link in der Bio oder direkt vor Ort.`, (y) => `${y.komm} vorbei, solange der Vorrat reicht.`],
  awareness: [(y) => `${y.du === "Sie" ? "Folgen Sie" : "Folg"} uns, um nichts zu verpassen.`, (y) => `${y.schau} mal vorbei – wir zeigen es ${y.dir} gern vor Ort.`],
  community: [(y) => `${y.markier} uns in ${y.deine}r Story, wir teilen die schönsten Momente.`, (y) => `${y.schreib} uns ${y.deine} Geschichte als Kommentar.`],
};

const VISUALS: Record<string, string[]> = {
  restaurant: ["Teller von oben auf dunklem Holz, Tageslicht vom Fenster, Hände des Kochs im Anschnitt", "Pass-Situation in der Küche, Dampf, Bewegungsunschärfe"],
  cafe: ["Nahaufnahme der Crema beim Einschenken, warmes Morgenlicht, Tasse mit Logo", "Theke mit Kuchenauslage, leichte Tiefenunschärfe, Gäste im Hintergrund"],
  bakery: ["Brotlaibe frisch aus dem Ofen, Mehlstaub im Gegenlicht", "Hände beim Formen des Teigs, Arbeitsfläche aus Holz"],
  barbershop: ["Vorher/Nachher im gleichen Licht und Winkel, ruhiger Hintergrund", "Detailaufnahme: Klinge, Fade-Übergang, Spiegelreflexion"],
  gym: ["Trainer zeigt eine Übung, seitlicher Winkel, natürliches Licht", "Kraftbereich am frühen Morgen, leerer Raum, Fokus auf Hantel"],
  default: ["Produkt im echten Einsatz, natürliches Licht, ruhiger Hintergrund in Markenfarben", "Team bei der Arbeit, authentisch, ohne Pose"],
};

const POSTING_TIMES: Record<string, [string, string]> = {
  restaurant: ["Donnerstag, 11:00–11:45", "Kurz vor der Mittagszeit wird oft nach Essensideen gesucht."],
  cafe: ["Samstag, 08:00–09:30", "Am Wochenende planen viele ihren Frühstücks- oder Café-Besuch am Morgen."],
  bakery: ["Freitag, 07:00–08:00", "Viele Menschen schauen auf dem Weg zur Arbeit aufs Handy."],
  bar: ["Freitag, 17:00–18:30", "Feierabendpläne entstehen typischerweise am frühen Abend."],
  barbershop: ["Dienstag, 18:00–19:30", "Nach Feierabend werden häufig Termine für die Woche geplant."],
  salon: ["Mittwoch, 19:00–20:30", "Abends ist erfahrungsgemäß mehr Zeit zum Stöbern."],
  gym: ["Montag, 06:30–07:30", "Wochenstart und Morgenroutine sind typische Motivationsmomente."],
  yoga: ["Sonntag, 18:00–19:30", "Viele planen am Sonntagabend ihre Woche."],
  retail: ["Samstag, 10:00–11:30", "Samstagvormittag ist klassische Einkaufszeit."],
};

function hashtags(ctx: BrandContext, req: ContentRequest, rand: () => number): string[] {
  if (LOW_HASHTAG_PLATFORMS.includes(req.platform as Platform)) return [];
  const clean = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, "");
  const industry = clean(t.options.industries[req.industry as keyof typeof t.options.industries] ?? "");
  const city = clean(ctx.profile.location.split(/[-,\s]/)[0] ?? "");
  const words = req.topic
    .split(/\s+/)
    .map(clean)
    .filter((w) => w.length > 3)
    .slice(0, 3);
  const base = [
    clean(ctx.profile.name),
    industry,
    city && `${city}${industry}`,
    city,
    ...words,
    pick(rand, ["supportyourlocal", "localbusiness", "lokalkaufen", "kleinunternehmen"]),
    pick(rand, ["behindthescenes", "handgemacht", "mitliebegemacht", "community"]),
  ].filter(Boolean);
  return [...new Set(base.map((w) => `#${w.toLowerCase()}`))].slice(0, 10);
}

function shotList(req: ContentRequest): ContentPackage["shotList"] {
  if (!isVideoFormat(req.format)) return [];
  return [
    { shot: "Einstieg (0–2 s)", detail: `Direkt ins Geschehen: Nahaufnahme zu „${req.topic}“, Hook als Text eingeblendet.` },
    { shot: "Kontext (2–5 s)", detail: "Halbtotale vom Ort, Kamera leicht in Bewegung, Tageslicht nutzen." },
    { shot: "Detail (5–9 s)", detail: "Hände bei der Arbeit oder Produkt im Einsatz, 2–3 schnelle Schnitte." },
    { shot: "Mensch (9–13 s)", detail: "Teammitglied oder Gast mit einer echten Reaktion, kein gestellter Blick in die Kamera." },
    { shot: "Abschluss (13–16 s)", detail: "Totale mit Logo oder Schaufenster, Call to Action als Text." },
  ];
}

function buildPackage(ctx: BrandContext, req: ContentRequest, seed: string): ContentPackage {
  const rand = rng(seed);
  const y = you(ctx.profile.formality);
  const name = ctx.profile.name;
  const objective = (OBJECTIVES as readonly string[]).includes(req.objective) ? req.objective : "awareness";
  const quoted = `„${req.topic}“`;
  const hook = pick(rand, HOOKS[objective])(quoted, name, y);
  const cta = pick(rand, CTAS[objective])(y);
  const detail = req.details ? `\n\n${req.details}` : "";
  const location = ctx.profile.location ? ` in ${ctx.profile.location}` : "";
  const short = req.format === "story" || req.platform === "tiktok";
  const caption = short
    ? `${hook}\n\n${quoted} – jetzt bei ${name}${location}.${detail}\n\n${cta}`
    : `${hook}\n\nBei ${name}${location} dreht sich diese Woche alles um ${quoted}. ${pick(rand, [
        `Wir zeigen ${y.dir}, wie es entsteht und warum wir es genau so machen.`,
        "Hinter jedem Detail steckt eine Entscheidung – hier sind unsere.",
        "Kein Hochglanz, sondern so, wie es bei uns wirklich aussieht.",
      ])}${detail}\n\n${cta}`;
  const visualPool = VISUALS[req.industry] ?? VISUALS.default;
  const colors = ctx.profile.brandColors.length ? ` Akzente in ${ctx.profile.brandColors.join(", ")}.` : "";
  const [postingTime, postingTimeReason] = POSTING_TIMES[req.industry] ?? ["Mittwoch, 18:00–19:30", "Am frühen Abend sind viele Menschen aktiv am Handy."];
  return {
    title: `${t.options.formats[req.format as keyof typeof t.options.formats] ?? "Post"}: ${req.topic}`.slice(0, 80),
    hook,
    caption,
    cta,
    hashtags: hashtags(ctx, req, rand),
    visualConcept: `${pick(rand, visualPool)}.${colors}`,
    shotList: shotList(req),
    onScreenText: isVideoFormat(req.format) || req.format === "carousel" ? [hook, req.topic, cta.split(/[.–]/)[0]] : [],
    postingTime,
    postingTimeReason: `${postingTimeReason} Das ist eine Schätzung, keine Garantie.`,
  };
}

const PLAN_TOPICS = [
  "Blick hinter die Kulissen",
  "Team vorstellen",
  "Beliebtestes Angebot im Detail",
  "Häufige Kundenfrage beantworten",
  "Vorher/Nachher oder Entstehungsprozess",
  "Stammgast oder Kundenstimme (mit Einverständnis)",
  "Saisonales Thema der Woche",
  "Tipp aus eurem Fachwissen",
  "Umfrage: Was wünscht ihr euch?",
];

export class DemoProvider implements AIProvider {
  readonly mode = "demo" as const;
  readonly name = "demo";

  async generateContent(ctx: BrandContext, req: ContentRequest) {
    return buildPackage(ctx, req, `${req.topic}-${Date.now()}`);
  }

  async regenerateSection(ctx: BrandContext, req: ContentRequest, _current: ContentPackage, section: Section, hint: string): Promise<SectionPatch> {
    const fresh = buildPackage(ctx, req, `${section}-${hint}-${Date.now()}`);
    if (section === "postingTime") return { postingTime: fresh.postingTime, postingTimeReason: fresh.postingTimeReason };
    return { [section]: fresh[section] } as SectionPatch;
  }

  async generatePlan(ctx: BrandContext, req: PlanRequest): Promise<PlanSuggestion[]> {
    const rand = rng(`${req.weekStart}-${Date.now()}`);
    const formats = [...FORMATS].sort(() => rand() - 0.5);
    const goals = [...OBJECTIVES].sort(() => rand() - 0.5);
    const topics = [...PLAN_TOPICS].sort(() => rand() - 0.5);
    return req.postingDates.map((date, i) => this.day(ctx, date, formats[i % formats.length], goals[i % goals.length], topics[i % topics.length], req, rand));
  }

  async regenerateDay(ctx: BrandContext, req: DayRequest): Promise<PlanSuggestion> {
    const rand = rng(`${req.date}-${Date.now()}`);
    const used = new Set(req.otherDays.map((d) => d.topic));
    const topic = PLAN_TOPICS.filter((p) => !used.has(p) && p !== req.previous?.topic)[0] ?? pick(rand, PLAN_TOPICS);
    return this.day(ctx, req.date, pick(rand, FORMATS), pick(rand, OBJECTIVES), topic, req, rand);
  }

  private day(
    ctx: BrandContext,
    date: string,
    format: string,
    goal: string,
    topic: string,
    req: { focus: string; platforms: string[] },
    rand: () => number,
  ): PlanSuggestion {
    const y = you(ctx.profile.formality);
    const fullTopic = req.focus ? `${topic} – ${req.focus}` : topic;
    const weekend = weekdayIndex(date) >= 5;
    return {
      date,
      topic: fullTopic,
      format,
      platform: req.platforms[Math.floor(rand() * req.platforms.length)] ?? "instagram",
      goal,
      hook: pick(rand, HOOKS[goal])(`„${topic}“`, ctx.profile.name, y),
      idea: `${t.options.formats[format as keyof typeof t.options.formats]} zum Thema „${fullTopic}“. ${weekend ? "Ideal fürs Wochenende: entspannt und persönlich." : "Kurz, konkret und mit einem echten Moment aus dem Alltag."}`,
      cta: pick(rand, CTAS[goal])(y),
    };
  }
}
