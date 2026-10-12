/**
 * Zentrale, verifizierte Unternehmensangaben.
 * Nur Angaben, die vom Auftraggeber bereitgestellt wurden – bitte hier
 * ändern, nicht in einzelnen Seiten.
 */
export const company = {
  name: 'Issa Immobilien',
  owner: 'Sami Issa',
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
  { href: '/', label: 'Home' },
  { href: '/leistungen/', label: 'Leistungen' },
  { href: '/objekte/', label: 'Objekte' },
  { href: '/ueber-uns/', label: 'Über uns' },
  { href: '/kontakt/', label: 'Kontakt' },
] as const;

export const legalNav = [
  { href: '/impressum/', label: 'Impressum' },
  { href: '/datenschutz/', label: 'Datenschutz' },
] as const;

/** Leistungsbereiche – inhaltlich aus den bestätigten Leistungen abgeleitet. */
export const services = [
  {
    id: 'analyse',
    no: '01',
    title: 'Analyse & Konzeption',
    short:
      'Standort, Objekt und Nutzungsmöglichkeiten verstehen – und daraus eine Vermarktungsstrategie entwickeln, die zur Immobilie passt.',
    intro:
      'Bevor eine Immobilie angeboten wird, steht die Frage, was sie ausmacht und für wen sie interessant ist. Wir betrachten das Objekt, seine Lage und seine Möglichkeiten im Zusammenhang.',
    items: [
      'Standortanalyse mit Betrachtung von Mikro- und Makrolage',
      'Einordnung von Objekt, Zustand und Nutzungsmöglichkeiten',
      'Entwicklung eines Vermarktungskonzepts – von der Konzeption bis zur Übergabe',
    ],
  },
  {
    id: 'vermarktung',
    no: '02',
    title: 'Präsentation & Vermarktung',
    short:
      'Ein aussagekräftiges Exposé erstellen und geeignete Interessenten gezielt auswählen und ansprechen.',
    intro:
      'Eine gute Präsentation zeigt, was eine Immobilie tatsächlich bietet – sachlich, vollständig und ansprechend. Sie ist die Grundlage für die richtigen Gespräche.',
    items: [
      'Erstellung individueller Immobilienexposés',
      'Gezielte Auswahl potenzieller Interessenten',
      'Ansprache von Interessenten, die zum Objekt passen',
    ],
  },
  {
    id: 'begleitung',
    no: '03',
    title: 'Besichtigungen & Verhandlungen',
    short:
      'Besichtigungen organisieren und durchführen, Interessenten begleiten und die Vertragsverhandlungen unterstützen.',
    intro:
      'Zwischen dem ersten Interesse und einer Einigung liegen viele Schritte. Wir koordinieren sie und bleiben Ihr Ansprechpartner.',
    items: [
      'Organisation und Durchführung von Besichtigungen',
      'Begleitung von Interessenten im Vermittlungsprozess',
      'Begleitung bei Miet- und Kaufvertragsverhandlungen',
    ],
  },
  {
    id: 'gewerbe',
    no: '04',
    title: 'Gewerbe & Standortentwicklung',
    short:
      'Gewerbliche Flächen, Unternehmensexpansion und Projektentwicklung: Standortfaktoren, Flächen und Nutzungsmöglichkeiten im Blick.',
    intro:
      'Gewerbliche Vorhaben folgen eigenen Anforderungen. Wir beraten zu Flächen und Standorten und entwickeln Konzepte, die den Bedarf des Unternehmens berücksichtigen.',
    items: [
      'Beratung bei gewerblichen Immobilienflächen',
      'Begleitung bei der Unternehmensexpansion',
      'Konzepte für Flächenoptimierung und Projektentwicklung',
    ],
  },
] as const;

/** Allgemeine Darstellung der Arbeitsweise – keine vertragliche Zusage. */
export const process = [
  {
    title: 'Kennenlernen',
    text: 'Wir sprechen über Ihre Immobilie, Ihre Ziele und Ihren Zeitrahmen und klären, worauf es Ihnen ankommt.',
  },
  {
    title: 'Analyse von Immobilie und Standort',
    text: 'Wir betrachten das Objekt sowie Mikro- und Makrolage und schätzen ein, für welche Zielgruppen es interessant ist.',
  },
  {
    title: 'Vermarktungskonzept abstimmen',
    text: 'Präsentation, Exposé und Ansprache der Interessenten werden gemeinsam mit Ihnen festgelegt.',
  },
  {
    title: 'Interessenten & Besichtigungen',
    text: 'Wir wählen geeignete Interessenten aus, sprechen sie an und organisieren die Besichtigungen.',
  },
  {
    title: 'Verhandlungen & nächste Schritte',
    text: 'Wir begleiten die Miet- oder Kaufvertragsverhandlungen und die weiteren Schritte bis zur Übergabe.',
  },
] as const;

/** Auswahl im Kontaktformular (Wert = übermittelter Schlüssel). */
export const inquiryTopics = [
  { value: 'verkauf', label: 'Immobilie verkaufen' },
  { value: 'vermietung', label: 'Immobilie vermieten' },
  { value: 'gewerbe', label: 'Gewerbefläche oder Unternehmensexpansion' },
  { value: 'projekt', label: 'Flächenoptimierung oder Projektentwicklung' },
  { value: 'suche', label: 'Immobilie gesucht' },
  { value: 'sonstiges', label: 'Sonstiges Anliegen' },
] as const;

export type InquiryTopic = (typeof inquiryTopics)[number]['value'];
