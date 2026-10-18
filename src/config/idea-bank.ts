// Curated editorial prompts ("PostPilot-Ideenbank"). Used for the daily impulse on the dashboard
// and for topic suggestions. These are hand-written suggestions, not AI output.

export type Impulse = { topic: string; format: string; objective: string; why: string };

const GENERIC: Impulse[] = [
  { topic: "Ein ganz normaler Morgen bei uns", format: "story", objective: "community", why: "Alltag schafft Nähe – und kostet nur fünf Minuten." },
  { topic: "Die häufigste Kundenfrage – ehrlich beantwortet", format: "carousel", objective: "engagement", why: "Antworten auf echte Fragen werden gespeichert und geteilt." },
  { topic: "Wer steckt dahinter? Ein Teammitglied stellt sich vor", format: "reel", objective: "awareness", why: "Gesichter bauen Vertrauen schneller auf als Produkte." },
  { topic: "Vorher und nachher", format: "reel", objective: "reach", why: "Verwandlungen gehören zu den meistgesehenen Formaten." },
  { topic: "Unser Lieblingsprodukt im Detail", format: "feed_post", objective: "sales", why: "Ein klarer Fokus verkauft besser als das ganze Sortiment." },
  { topic: "Umfrage: Was sollen wir als Nächstes ausprobieren?", format: "story", objective: "engagement", why: "Mitreden lassen bindet – und liefert dir gleich neue Ideen." },
  { topic: "Drei Dinge, die ihr über uns noch nicht wusstet", format: "carousel", objective: "awareness", why: "Kleine Geschichten machen dein Unternehmen unverwechselbar." },
  { topic: "Danke an unsere Stammkundschaft", format: "feed_post", objective: "community", why: "Wertschätzung wird geteilt und erinnert an den nächsten Besuch." },
];

const BY_INDUSTRY: Record<string, Impulse[]> = {
  restaurant: [
    { topic: "Das Mittagsgericht dieser Woche entsteht", format: "reel", objective: "sales", why: "Kurz vor Mittag wird nach Ideen gesucht – zeig deine." },
    { topic: "Eine Zutat, ein Lieferant, eine Geschichte", format: "carousel", objective: "awareness", why: "Herkunft ist ein starkes Argument, das selten erzählt wird." },
    { topic: "Ein Blick in die Küche während des Service", format: "story", objective: "community", why: "Echte Hektik ist spannender als ein perfektes Foto." },
    { topic: "Welches Gericht soll zurück auf die Karte?", format: "story", objective: "engagement", why: "Abstimmungen sorgen für Gesprächsstoff am Tisch." },
  ],
  cafe: [
    { topic: "So entsteht unser Cappuccino – in 15 Sekunden", format: "reel", objective: "reach", why: "Kaffeezubereitung ist hypnotisch und funktioniert fast immer." },
    { topic: "Der Kuchen des Tages", format: "story", objective: "sales", why: "Ein Bild am Morgen entscheidet über den Nachmittagsbesuch." },
    { topic: "Unser ruhigster Platz zum Arbeiten oder Lesen", format: "feed_post", objective: "awareness", why: "Zeig, wofür man zu dir kommt – nicht nur, was man trinkt." },
    { topic: "Hafer, Kuh oder Mandel? Eure Wahl", format: "story", objective: "engagement", why: "Kleine Glaubensfragen erzeugen viele Reaktionen." },
  ],
  bakery: [
    { topic: "4 Uhr morgens: Der Teig wird geformt", format: "reel", objective: "reach", why: "Die frühen Stunden sieht sonst niemand." },
    { topic: "Das Brot der Woche und was es besonders macht", format: "carousel", objective: "sales", why: "Ein Produkt mit Geschichte verkauft sich leichter." },
  ],
  bar: [
    { topic: "Signature Drink: so wird er gemixt", format: "reel", objective: "reach", why: "Bewegung, Eis und Farbe – perfekt für kurze Videos." },
    { topic: "Was läuft heute Abend?", format: "story", objective: "sales", why: "Spontane Pläne entstehen am frühen Abend." },
  ],
  barbershop: [
    { topic: "Fade in 30 Sekunden – Zeitraffer", format: "reel", objective: "reach", why: "Transformationen sind das stärkste Format für Barbershops." },
    { topic: "Welcher Schnitt passt zu welcher Kopfform?", format: "carousel", objective: "engagement", why: "Hilfreiche Tipps werden gespeichert und weitergeleitet." },
    { topic: "Freie Termine diese Woche", format: "story", objective: "sales", why: "Kurzfristige Lücken füllen sich am besten über Stories." },
  ],
  salon: [
    { topic: "Farbverlauf: von der Beratung bis zum Ergebnis", format: "reel", objective: "reach", why: "Prozess plus Ergebnis zeigt Können und Sorgfalt." },
    { topic: "Pflege-Tipp, den wir täglich geben", format: "carousel", objective: "engagement", why: "Expertise zum Mitnehmen stärkt das Vertrauen." },
  ],
  gym: [
    { topic: "Eine Übung, drei häufige Fehler", format: "reel", objective: "reach", why: "Korrekturen sind nützlich und werden oft geteilt." },
    { topic: "Mitglied des Monats und der Weg dorthin", format: "carousel", objective: "community", why: "Echte Fortschritte motivieren mehr als jedes Angebot." },
    { topic: "So voll ist es zu welcher Uhrzeit", format: "story", objective: "engagement", why: "Praktische Infos senken die Hemmschwelle für Neue." },
  ],
  yoga: [
    { topic: "Eine Minute Atemübung für zwischendurch", format: "reel", objective: "reach", why: "Kleine Übungen zum Mitmachen werden gespeichert." },
    { topic: "Kurs für Einsteiger: was euch erwartet", format: "carousel", objective: "sales", why: "Unsicherheit ist der häufigste Grund, nicht zu kommen." },
  ],
  retail: [
    { topic: "Neu eingetroffen", format: "carousel", objective: "sales", why: "Neuheiten sind ein Grund, wieder vorbeizuschauen." },
    { topic: "Unsere Empfehlung für [Anlass]", format: "feed_post", objective: "sales", why: "Kuratierte Tipps helfen beim Entscheiden." },
  ],
  fashion: [
    { topic: "Ein Teil, drei Looks", format: "reel", objective: "reach", why: "Styling-Ideen zeigen den Wert eines Produkts." },
    { topic: "Neue Kollektion hinter den Kulissen", format: "story", objective: "awareness", why: "Vorfreude entsteht vor dem Launch." },
  ],
};

export function impulsesFor(industry: string): Impulse[] {
  return [...(BY_INDUSTRY[industry] ?? []), ...GENERIC];
}

/** Deterministic pick for a given day so the impulse stays stable throughout the day. */
export function dailyImpulse(industry: string, isoDate: string, recentTopics: string[] = []): Impulse {
  const pool = impulsesFor(industry);
  const dayNumber = Math.floor(new Date(`${isoDate}T00:00:00Z`).getTime() / 86_400_000);
  for (let offset = 0; offset < pool.length; offset++) {
    const candidate = pool[(dayNumber + offset) % pool.length];
    if (!recentTopics.some((t) => t.toLowerCase() === candidate.topic.toLowerCase())) return candidate;
  }
  return pool[dayNumber % pool.length];
}
