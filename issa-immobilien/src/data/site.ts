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
  slogan: 'Der Immobilien-Profi',
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

/**
 * Leistungsbereiche laut Briefing. Die Detailpunkte stammen aus den
 * bestätigten Leistungen (Vermarktung bis Übergabe, Standortanalyse,
 * Exposé, Interessenten, Besichtigungen, Verhandlungen, Expansion,
 * Flächenoptimierung, Projektentwicklung).
 */
export const services = [
  {
    id: 'einzelhandelsimmobilien',
    no: '01',
    title: 'Einzelhandelsimmobilien',
    text: 'Vermarktung und Vermittlung geeigneter Immobilien für den stationären Einzelhandel.',
    items: [
      'Vermarktung von der Konzeption bis zur Übergabe',
      'Standortanalyse mit Mikro- und Makrolage',
      'Individuelle Exposés',
    ],
  },
  {
    id: 'fachmarktzentren',
    no: '02',
    title: 'Fachmarktzentren und Handelsflächen',
    text: 'Professionelle Präsentation und Vermarktung von Fachmarktstandorten und großflächigen Handelsflächen.',
    items: ['Präsentation von Flächen und Standort', 'Gezielte Auswahl und Ansprache von Interessenten'],
  },
  {
    id: 'filialstandorte',
    no: '03',
    title: 'Filialstandorte und Expansion',
    text: 'Unterstützung bei der Betrachtung geeigneter Standorte und gewerblicher Flächen für Filialkonzepte.',
    items: ['Beratung bei Unternehmensexpansion', 'Flächenoptimierung und Projektentwicklung'],
  },
  {
    id: 'standortvermittlung',
    no: '04',
    title: 'Gewerbliche Standortvermittlung',
    text: 'Strukturierte Begleitung bei der Vermarktung und Vermittlung gewerblicher Immobilien und Handelsstandorte.',
    items: ['Organisation und Durchführung von Besichtigungen', 'Begleitung bei Miet- und Kaufvertragsverhandlungen'],
  },
] as const;

/** Objektarten – ausdrücklich Beispiele, keine abschließende Liste. */
export const examples = [
  'Lebensmittelmärkte',
  'Fachmärkte',
  'Fachmarktzentren',
  'Shopping-Center',
  'Filialstandorte',
  'Gewerbestandorte',
  'Fitness- und Sportstandorte',
] as const;

/** Allgemeine Darstellung der Arbeitsweise – keine Erfolgsgarantie. */
export const process = [
  { title: 'Anforderungen und Ziele verstehen', text: 'Worum geht es, und was soll erreicht werden?' },
  { title: 'Immobilie und Standort einordnen', text: 'Objekt, Flächen, Mikro- und Makrolage.' },
  { title: 'Vermarktungsstrategie abstimmen', text: 'Präsentation, Exposé und Vorgehen.' },
  { title: 'Geeignete Interessenten ansprechen', text: 'Gezielt statt breit gestreut.' },
  { title: 'Vermittlungsprozess begleiten', text: 'Besichtigungen und Verhandlungen bis zur Übergabe.' },
] as const;

/** Auswahl im Kontaktformular (Wert = übermittelter Schlüssel). */
export const inquiryTopics = [
  { value: 'vermarktung', label: 'Immobilie vermarkten' },
  { value: 'vermietung', label: 'Fläche vermieten' },
  { value: 'expansion', label: 'Standort oder Fläche gesucht' },
  { value: 'beratung', label: 'Beratung' },
  { value: 'sonstiges', label: 'Sonstiges' },
] as const;

export type InquiryTopic = (typeof inquiryTopics)[number]['value'];
