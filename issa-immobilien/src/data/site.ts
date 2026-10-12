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
 * Was Issa Immobilien macht – kurz und ohne Zahlen oder Kundennamen.
 * Grundlage: die bestätigten Leistungen des Auftraggebers.
 */
export const services = [
  {
    id: 'vermarktung',
    title: 'Vermarktung und Vermittlung',
    text: 'Einzelhandels- und Gewerbeimmobilien – zur Miete oder zum Kauf, von der Konzeption bis zur Übergabe.',
  },
  {
    id: 'standortanalyse',
    title: 'Standortanalyse',
    text: 'Mikro- und Makrolage, Flächen und Nutzungsmöglichkeiten richtig einordnen.',
  },
  {
    id: 'exposes',
    title: 'Exposés und Interessenten',
    text: 'Aussagekräftige Exposés und die gezielte Ansprache passender Interessenten.',
  },
  {
    id: 'verhandlungen',
    title: 'Besichtigungen und Verhandlungen',
    text: 'Organisation von Besichtigungen und Begleitung bei Miet- und Kaufvertragsverhandlungen.',
  },
  {
    id: 'expansion',
    title: 'Standortsuche und Expansion',
    text: 'Beratung zu Gewerbeflächen und neuen Standorten für Unternehmen und Filialisten.',
  },
  {
    id: 'projektentwicklung',
    title: 'Flächenoptimierung und Projektentwicklung',
    text: 'Konzepte zur Optimierung von Flächen und für Projektentwicklungen.',
  },
] as const;

/** Beispiele – ausdrücklich keine abschließende Liste. */
export const examples = [
  'Lebensmittelmärkte',
  'Fachmärkte',
  'Fachmarktzentren',
  'Shopping-Center',
  'Filialstandorte',
  'Fitness- und Sportstandorte',
  'Gewerbeflächen',
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
