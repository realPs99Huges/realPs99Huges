/**
 * Zentrale, verifizierte Unternehmensangaben und Inhalte.
 * Positionierung laut Auftraggeber: Spezialist für Einzelhandelsimmobilien
 * und Handelsstandorte, deutschlandweit tätig, Sitz in Lippstadt.
 * Keine Kunden, Referenzen, Zahlen oder Geschäftsbeziehungen ergänzen,
 * solange sie nicht belegt sind.
 */
export const company = {
  name: 'Issa Immobilien',
  owner: 'Sami Issa',
  positioning: 'Spezialist für Einzelhandelsimmobilien und Handelsstandorte',
  area: 'Deutschlandweit',
  street: 'Arendsstr. 21',
  zip: '59557',
  city: 'Lippstadt',
  country: 'Deutschland',
  phone: '+49 175 811 85 80',
  phoneHref: 'tel:+491758118580',
  email: 'info@issa-immobilien.de',
  url: 'https://www.issa-immobilien.de',
  license: {
    basis: 'Gewerbeerlaubnis nach § 34c GewO',
    authority: 'Kreis Soest',
    authorityAddress: 'Hoher Weg 1–3, 59494 Soest',
  },
  chamber: 'IHK Arnsberg',
  taxNumber: '330/5065/2787',
} as const;

export const mapsUrl =
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Arendsstr. 21, 59557 Lippstadt');

export const nav = [
  { href: '/', label: 'Startseite' },
  { href: '/leistungen/', label: 'Leistungen' },
  { href: '/handelsimmobilien/', label: 'Handelsimmobilien' },
  { href: '/ueber-uns/', label: 'Über Issa Immobilien' },
  { href: '/kontakt/', label: 'Kontakt' },
] as const;

export const legalNav = [
  { href: '/impressum/', label: 'Impressum' },
  { href: '/datenschutz/', label: 'Datenschutz' },
] as const;

/** Arten von Handelsimmobilien, auf die sich Issa Immobilien konzentriert. */
export const assetClasses = [
  {
    id: 'lebensmittel',
    title: 'Lebensmitteleinzelhandel',
    text: 'Standorte für Lebensmittelmärkte und großflächige Lebensmittelmärkte – mit Blick auf Fläche, Erreichbarkeit, Stellplätze und Einzugsgebiet.',
  },
  {
    id: 'fachmaerkte',
    title: 'Fachmärkte',
    text: 'Einzelne Fachmarktflächen und Fachmarktstandorte für unterschiedliche Sortimente und Betreiberkonzepte.',
  },
  {
    id: 'fachmarktzentren',
    title: 'Fachmarktzentren',
    text: 'Zusammenhängende Handelsstandorte mit mehreren Nutzern, gemeinsamer Erschließung und sich ergänzendem Angebot.',
  },
  {
    id: 'shopping-center',
    title: 'Shopping-Center',
    text: 'Einkaufszentren und Galerien mit mehreren Ebenen, Mieterstruktur und eigener Frequenz.',
  },
  {
    id: 'filialstandorte',
    title: 'Filialstandorte',
    text: 'Handelsimmobilien und Flächen für Filialunternehmen und Handelsketten, die neue Standorte suchen.',
  },
  {
    id: 'fitness',
    title: 'Fitness- und Sportstandorte',
    text: 'Großzügige Flächen für Fitness- und Sportanbieter, etwa in Handels- oder Gewerbelagen.',
  },
  {
    id: 'gewerbe',
    title: 'Weitere Gewerbestandorte',
    text: 'Weitere großflächige gewerbliche Einzelhandelsimmobilien und geeignete Handelsflächen.',
  },
] as const;

/**
 * Leistungsbereiche. Die Detailpunkte stammen aus den bestätigten
 * Leistungen (Vermarktung, Standortanalyse, Exposé, Interessenten,
 * Besichtigungen, Verhandlungen, Expansion, Flächenoptimierung,
 * Projektentwicklung), bezogen auf Handelsimmobilien.
 */
export const services = [
  {
    id: 'einzelhandelsimmobilien',
    no: '01',
    title: 'Einzelhandelsimmobilien',
    short: 'Vermarktung und Vermittlung geeigneter Immobilien für den stationären Einzelhandel.',
    intro:
      'Für Einzelhandelsimmobilien zählen andere Kriterien als für Wohn- oder Büroflächen. Die Vermarktung beginnt deshalb mit einer genauen Einordnung von Objekt, Fläche und Lage.',
    items: [
      'Einordnung von Objekt, Flächen und Nutzungsmöglichkeiten',
      'Standortanalyse mit Betrachtung von Mikro- und Makrolage',
      'Vermarktungskonzept von der Konzeption bis zur Übergabe',
    ],
  },
  {
    id: 'fachmarktzentren',
    no: '02',
    title: 'Fachmarktzentren und Handelsflächen',
    short: 'Professionelle Präsentation und Vermarktung von Fachmarktstandorten und großflächigen Handelsflächen.',
    intro:
      'Großflächige Handelsstandorte brauchen eine Präsentation, die Flächen, Lage und Rahmenbedingungen klar und vollständig darstellt.',
    items: [
      'Erstellung individueller Exposés für Handelsflächen',
      'Gezielte Auswahl potenzieller Interessenten',
      'Ansprache von Interessenten, deren Anforderungen zum Standort passen',
    ],
  },
  {
    id: 'filialstandorte',
    no: '03',
    title: 'Filialstandorte und Expansion',
    short: 'Unterstützung bei der Betrachtung geeigneter Standorte und gewerblicher Flächen für Filialkonzepte.',
    intro:
      'Filialunternehmen suchen Standorte, die zu ihrem Konzept passen. Wir betrachten Flächen und Standortfaktoren im Hinblick auf diese Anforderungen.',
    items: [
      'Beratung bei gewerblichen Immobilienflächen und Unternehmensexpansion',
      'Betrachtung von Standortfaktoren und Flächenanforderungen',
      'Konzepte für Flächenoptimierung und Projektentwicklung',
    ],
  },
  {
    id: 'standortvermittlung',
    no: '04',
    title: 'Gewerbliche Standortvermittlung',
    short: 'Strukturierte Begleitung bei der Vermarktung und Vermittlung gewerblicher Immobilien und Handelsstandorte.',
    intro:
      'Zwischen dem ersten Kontakt und einer Einigung liegen viele Schritte. Wir koordinieren sie und bleiben durchgehend Ihr Ansprechpartner.',
    items: [
      'Organisation und Durchführung von Besichtigungen',
      'Begleitung bei Miet- und Kaufvertragsverhandlungen',
      'Begleitung des Vermittlungsprozesses bis zur Übergabe',
    ],
  },
] as const;

/** Allgemeine Darstellung der Arbeitsweise – keine Erfolgsgarantie. */
export const process = [
  {
    title: 'Anforderungen und Ziele verstehen',
    text: 'Wir klären, um welche Immobilie oder welchen Flächenbedarf es geht und welches Ziel Sie verfolgen.',
  },
  {
    title: 'Immobilie und Standort einordnen',
    text: 'Objekt, Flächen, Mikro- und Makrolage sowie die Nutzungsmöglichkeiten werden betrachtet.',
  },
  {
    title: 'Vermarktungsstrategie abstimmen',
    text: 'Präsentation, Exposé und Vorgehen werden gemeinsam mit Ihnen festgelegt.',
  },
  {
    title: 'Geeignete Interessenten ansprechen',
    text: 'Wir wählen Interessenten aus, deren Anforderungen zum Standort passen, und sprechen sie gezielt an.',
  },
  {
    title: 'Vermittlungsprozess begleiten',
    text: 'Besichtigungen, Gespräche sowie Miet- oder Kaufvertragsverhandlungen begleiten wir bis zur Übergabe.',
  },
] as const;

/** Auswahl im Kontaktformular (Wert = übermittelter Schlüssel). */
export const inquiryTopics = [
  { value: 'vermarktung', label: 'Einzelhandelsimmobilie vermarkten' },
  { value: 'fachmarkt', label: 'Fachmarkt oder Fachmarktzentrum' },
  { value: 'shopping-center', label: 'Shopping-Center' },
  { value: 'expansion', label: 'Filialstandort oder Expansion' },
  { value: 'gewerbe', label: 'Gewerbliche Fläche' },
  { value: 'sonstiges', label: 'Sonstiges Anliegen' },
] as const;

export type InquiryTopic = (typeof inquiryTopics)[number]['value'];
