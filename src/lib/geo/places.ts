/**
 * A deliberately small offline atlas. ASTRA never sends place names to a
 * geocoding service — if a place is not listed here it is shown by name only.
 *
 * Format: "Name|Country|lat|lon|alias;alias"
 */
const CITY_DATA = [
  // Germany
  'Berlin|Germany|52.52|13.40',
  'Hamburg|Germany|53.55|9.99',
  'Munich|Germany|48.14|11.58|München',
  'Cologne|Germany|50.94|6.96|Köln',
  'Frankfurt|Germany|50.11|8.68|Frankfurt am Main',
  'Stuttgart|Germany|48.78|9.18',
  'Düsseldorf|Germany|51.23|6.78',
  'Dortmund|Germany|51.51|7.47',
  'Essen|Germany|51.46|7.01',
  'Leipzig|Germany|51.34|12.37',
  'Bremen|Germany|53.08|8.80',
  'Dresden|Germany|51.05|13.74',
  'Hanover|Germany|52.37|9.73|Hannover',
  'Nuremberg|Germany|49.45|11.08|Nürnberg',
  'Duisburg|Germany|51.43|6.76',
  'Bochum|Germany|51.48|7.22',
  'Wuppertal|Germany|51.26|7.15',
  'Bielefeld|Germany|52.02|8.53',
  'Bonn|Germany|50.73|7.10',
  'Münster|Germany|51.96|7.63',
  'Mannheim|Germany|49.49|8.47',
  'Karlsruhe|Germany|49.01|8.40',
  'Augsburg|Germany|48.37|10.90',
  'Wiesbaden|Germany|50.08|8.24',
  'Mainz|Germany|50.00|8.27',
  'Kiel|Germany|54.32|10.12',
  'Rostock|Germany|54.09|12.10',
  'Freiburg|Germany|47.99|7.84|Freiburg im Breisgau',
  'Heidelberg|Germany|49.40|8.67',
  'Regensburg|Germany|49.01|12.10',
  'Würzburg|Germany|49.79|9.95',
  'Erfurt|Germany|50.98|11.03',
  'Magdeburg|Germany|52.12|11.63',
  'Potsdam|Germany|52.39|13.06',
  'Saarbrücken|Germany|49.24|6.99',
  'Aachen|Germany|50.78|6.08',
  'Braunschweig|Germany|52.27|10.52|Brunswick',
  'Kassel|Germany|51.31|9.48',
  'Lübeck|Germany|53.87|10.69',
  'Ulm|Germany|48.40|9.99',
  'Chemnitz|Germany|50.83|12.92',
  'Halle|Germany|51.48|11.97|Halle (Saale)',
  'Osnabrück|Germany|52.28|8.05',
  'Oldenburg|Germany|53.14|8.21',
  'Trier|Germany|49.75|6.64',
  'Göttingen|Germany|51.54|9.93',
  'Jena|Germany|50.93|11.59',
  'Konstanz|Germany|47.66|9.18',
  'Passau|Germany|48.57|13.43',
  // Austria & Switzerland
  'Vienna|Austria|48.21|16.37|Wien',
  'Graz|Austria|47.07|15.44',
  'Linz|Austria|48.31|14.29',
  'Salzburg|Austria|47.81|13.06',
  'Innsbruck|Austria|47.27|11.40',
  'Klagenfurt|Austria|46.62|14.31',
  'Zurich|Switzerland|47.38|8.54|Zürich',
  'Geneva|Switzerland|46.20|6.14|Genf;Genève',
  'Basel|Switzerland|47.56|7.59',
  'Bern|Switzerland|46.95|7.45|Berne',
  'Lausanne|Switzerland|46.52|6.63',
  'Lucerne|Switzerland|47.05|8.31|Luzern',
  // Europe
  'London|United Kingdom|51.51|-0.13',
  'Manchester|United Kingdom|53.48|-2.24',
  'Edinburgh|United Kingdom|55.95|-3.19',
  'Dublin|Ireland|53.35|-6.26',
  'Paris|France|48.86|2.35',
  'Lyon|France|45.76|4.84',
  'Marseille|France|43.30|5.37',
  'Nice|France|43.70|7.27|Nizza',
  'Brussels|Belgium|50.85|4.35|Brüssel;Bruxelles',
  'Amsterdam|Netherlands|52.37|4.90',
  'Rotterdam|Netherlands|51.92|4.48',
  'Luxembourg|Luxembourg|49.61|6.13|Luxemburg',
  'Copenhagen|Denmark|55.68|12.57|Kopenhagen;København',
  'Stockholm|Sweden|59.33|18.07',
  'Oslo|Norway|59.91|10.75',
  'Helsinki|Finland|60.17|24.94',
  'Reykjavík|Iceland|64.15|-21.94|Reykjavik',
  'Madrid|Spain|40.42|-3.70',
  'Barcelona|Spain|41.39|2.17',
  'Valencia|Spain|39.47|-0.38',
  'Seville|Spain|37.39|-5.98|Sevilla',
  'Lisbon|Portugal|38.72|-9.14|Lissabon;Lisboa',
  'Porto|Portugal|41.15|-8.61',
  'Rome|Italy|41.90|12.50|Rom;Roma',
  'Milan|Italy|45.46|9.19|Mailand;Milano',
  'Naples|Italy|40.85|14.27|Neapel;Napoli',
  'Florence|Italy|43.77|11.26|Florenz;Firenze',
  'Venice|Italy|45.44|12.32|Venedig;Venezia',
  'Turin|Italy|45.07|7.69|Torino',
  'Palermo|Italy|38.12|13.36',
  'Athens|Greece|37.98|23.73|Athen;Athina',
  'Thessaloniki|Greece|40.64|22.94',
  'Istanbul|Türkiye|41.01|28.98',
  'Ankara|Türkiye|39.93|32.86',
  'Izmir|Türkiye|38.42|27.14',
  'Warsaw|Poland|52.23|21.01|Warschau;Warszawa',
  'Kraków|Poland|50.06|19.94|Krakow;Krakau',
  'Prague|Czechia|50.08|14.44|Prag;Praha',
  'Budapest|Hungary|47.50|19.04',
  'Bratislava|Slovakia|48.15|17.11',
  'Ljubljana|Slovenia|46.06|14.51',
  'Zagreb|Croatia|45.81|15.98',
  'Split|Croatia|43.51|16.44',
  'Belgrade|Serbia|44.79|20.45|Belgrad;Beograd',
  'Sarajevo|Bosnia and Herzegovina|43.86|18.41',
  'Sofia|Bulgaria|42.70|23.32',
  'Bucharest|Romania|44.43|26.10|Bukarest;București',
  'Kyiv|Ukraine|50.45|30.52|Kiew;Kiev',
  'Lviv|Ukraine|49.84|24.03|Lemberg',
  'Odesa|Ukraine|46.48|30.72|Odessa',
  'Minsk|Belarus|53.90|27.56',
  'Vilnius|Lithuania|54.69|25.28',
  'Riga|Latvia|56.95|24.11',
  'Tallinn|Estonia|59.44|24.75',
  'Moscow|Russia|55.76|37.62|Moskau;Moskva',
  'Saint Petersburg|Russia|59.93|30.34|St. Petersburg;Sankt Petersburg;St Petersburg',
  'Chișinău|Moldova|47.01|28.86|Chisinau',
  'Tirana|Albania|41.33|19.82',
  'Skopje|North Macedonia|42.00|21.43',
  'Pristina|Kosovo|42.66|21.17|Prishtina',
  'Valletta|Malta|35.90|14.51',
  'Nicosia|Cyprus|35.17|33.36',
  // Middle East & Africa
  'Tel Aviv|Israel|32.09|34.78',
  'Jerusalem||31.77|35.21',
  'Beirut|Lebanon|33.89|35.50',
  'Damascus|Syria|33.51|36.29|Damaskus',
  'Aleppo|Syria|36.20|37.16',
  'Amman|Jordan|31.95|35.93',
  'Baghdad|Iraq|33.31|44.36|Bagdad',
  'Erbil|Iraq|36.19|44.01',
  'Tehran|Iran|35.69|51.39|Teheran',
  'Riyadh|Saudi Arabia|24.71|46.68|Riad',
  'Dubai|United Arab Emirates|25.20|55.27',
  'Abu Dhabi|United Arab Emirates|24.45|54.38',
  'Doha|Qatar|25.29|51.53',
  'Kuwait City|Kuwait|29.38|47.99',
  'Cairo|Egypt|30.04|31.24|Kairo',
  'Alexandria|Egypt|31.20|29.92',
  'Casablanca|Morocco|33.57|-7.59',
  'Marrakesh|Morocco|31.63|-8.01|Marrakech;Marrakesch',
  'Rabat|Morocco|34.02|-6.84',
  'Tunis|Tunisia|36.81|10.18',
  'Algiers|Algeria|36.75|3.06|Algier',
  'Tripoli|Libya|32.89|13.19',
  'Khartoum|Sudan|15.50|32.56',
  'Lagos|Nigeria|6.52|3.38',
  'Abuja|Nigeria|9.08|7.40',
  'Accra|Ghana|5.60|-0.19',
  'Dakar|Senegal|14.72|-17.47',
  'Addis Ababa|Ethiopia|9.03|38.74|Addis Abeba',
  'Asmara|Eritrea|15.32|38.93',
  'Mogadishu|Somalia|2.05|45.32',
  'Nairobi|Kenya|-1.29|36.82',
  'Kampala|Uganda|0.35|32.58',
  'Kigali|Rwanda|-1.95|30.06',
  'Dar es Salaam|Tanzania|-6.79|39.21',
  'Kinshasa|DR Congo|-4.44|15.27',
  'Luanda|Angola|-8.84|13.23',
  'Johannesburg|South Africa|-26.20|28.05',
  'Cape Town|South Africa|-33.92|18.42|Kapstadt',
  'Durban|South Africa|-29.86|31.02',
  'Harare|Zimbabwe|-17.83|31.05',
  'Antananarivo|Madagascar|-18.88|47.51',
  // Asia
  'Mumbai|India|19.08|72.88|Bombay',
  'Delhi|India|28.61|77.21|New Delhi;Neu-Delhi',
  'Bengaluru|India|12.97|77.59|Bangalore',
  'Kolkata|India|22.57|88.36|Calcutta;Kalkutta',
  'Chennai|India|13.08|80.27|Madras',
  'Hyderabad|India|17.39|78.49',
  'Karachi|Pakistan|24.86|67.01',
  'Lahore|Pakistan|31.55|74.34',
  'Islamabad|Pakistan|33.68|73.05',
  'Dhaka|Bangladesh|23.81|90.41',
  'Kathmandu|Nepal|27.72|85.32',
  'Colombo|Sri Lanka|6.93|79.86',
  'Kabul|Afghanistan|34.56|69.21',
  'Tashkent|Uzbekistan|41.30|69.24|Taschkent',
  'Almaty|Kazakhstan|43.24|76.89',
  'Astana|Kazakhstan|51.17|71.43',
  'Baku|Azerbaijan|40.41|49.87',
  'Tbilisi|Georgia|41.72|44.79|Tiflis',
  'Yerevan|Armenia|40.18|44.51|Eriwan',
  'Beijing|China|39.90|116.41|Peking',
  'Shanghai|China|31.23|121.47',
  'Hong Kong|China|22.32|114.17|Hongkong',
  'Guangzhou|China|23.13|113.26',
  'Shenzhen|China|22.54|114.06',
  'Chengdu|China|30.57|104.07',
  'Taipei|Taiwan|25.03|121.57',
  'Seoul|South Korea|37.57|126.98',
  'Busan|South Korea|35.18|129.08',
  'Tokyo|Japan|35.68|139.69|Tokio',
  'Osaka|Japan|34.69|135.50',
  'Kyoto|Japan|35.01|135.77',
  'Sapporo|Japan|43.06|141.35',
  'Bangkok|Thailand|13.76|100.50',
  'Hanoi|Vietnam|21.03|105.85',
  'Ho Chi Minh City|Vietnam|10.82|106.63|Saigon',
  'Manila|Philippines|14.60|120.98',
  'Jakarta|Indonesia|-6.21|106.85',
  'Denpasar|Indonesia|-8.65|115.22|Bali',
  'Kuala Lumpur|Malaysia|3.14|101.69',
  'Singapore|Singapore|1.35|103.82|Singapur',
  'Ulaanbaatar|Mongolia|47.89|106.91|Ulan Bator',
  'Yangon|Myanmar|16.84|96.17|Rangoon',
  'Phnom Penh|Cambodia|11.56|104.93',
  // Oceania
  'Sydney|Australia|-33.87|151.21',
  'Melbourne|Australia|-37.81|144.96',
  'Brisbane|Australia|-27.47|153.03',
  'Perth|Australia|-31.95|115.86',
  'Adelaide|Australia|-34.93|138.60',
  'Auckland|New Zealand|-36.85|174.76',
  'Wellington|New Zealand|-41.29|174.78',
  'Honolulu|United States|21.31|-157.86',
  // Americas
  'New York|United States|40.71|-74.01|New York City;NYC',
  'Los Angeles|United States|34.05|-118.24|LA',
  'Chicago|United States|41.88|-87.63',
  'San Francisco|United States|37.77|-122.42',
  'Seattle|United States|47.61|-122.33',
  'Boston|United States|42.36|-71.06',
  'Washington, D.C.|United States|38.91|-77.04|Washington DC;Washington',
  'Miami|United States|25.76|-80.19',
  'Houston|United States|29.76|-95.37',
  'Dallas|United States|32.78|-96.80',
  'Austin|United States|30.27|-97.74',
  'Denver|United States|39.74|-104.99',
  'Phoenix|United States|33.45|-112.07',
  'Atlanta|United States|33.75|-84.39',
  'New Orleans|United States|29.95|-90.07',
  'Philadelphia|United States|39.95|-75.17',
  'Las Vegas|United States|36.17|-115.14',
  'Detroit|United States|42.33|-83.05',
  'Minneapolis|United States|44.98|-93.27',
  'Anchorage|United States|61.22|-149.90',
  'Toronto|Canada|43.65|-79.38',
  'Montreal|Canada|45.50|-73.57|Montréal',
  'Vancouver|Canada|49.28|-123.12',
  'Calgary|Canada|51.05|-114.07',
  'Ottawa|Canada|45.42|-75.70',
  'Mexico City|Mexico|19.43|-99.13|Ciudad de México;Mexiko-Stadt;CDMX',
  'Guadalajara|Mexico|20.66|-103.35',
  'Monterrey|Mexico|25.69|-100.32',
  'Havana|Cuba|23.11|-82.37|Havanna;La Habana',
  'Kingston|Jamaica|17.97|-76.79',
  'San Juan|Puerto Rico|18.47|-66.11',
  'Santo Domingo|Dominican Republic|18.49|-69.93',
  'Guatemala City|Guatemala|14.63|-90.51',
  'San José|Costa Rica|9.93|-84.08|San Jose',
  'Panama City|Panama|8.98|-79.52',
  'Bogotá|Colombia|4.71|-74.07|Bogota',
  'Medellín|Colombia|6.24|-75.58|Medellin',
  'Caracas|Venezuela|10.48|-66.90',
  'Quito|Ecuador|-0.18|-78.47',
  'Lima|Peru|-12.05|-77.04',
  'La Paz|Bolivia|-16.50|-68.15',
  'Santiago|Chile|-33.45|-70.67|Santiago de Chile',
  'Buenos Aires|Argentina|-34.60|-58.38',
  'Montevideo|Uruguay|-34.90|-56.16',
  'Asunción|Paraguay|-25.26|-57.58|Asuncion',
  'São Paulo|Brazil|-23.55|-46.63|Sao Paulo',
  'Rio de Janeiro|Brazil|-22.91|-43.17|Rio',
  'Brasília|Brazil|-15.79|-47.88|Brasilia',
  'Salvador|Brazil|-12.97|-38.50',
  'Recife|Brazil|-8.05|-34.88',
];

/** Approximate geographic centres, used when only a country is given. */
const COUNTRY_DATA = [
  'Germany|Germany|51.2|10.4|Deutschland;DE;BRD',
  'Austria|Austria|47.6|14.1|Österreich;AT',
  'Switzerland|Switzerland|46.8|8.2|Schweiz;Suisse;Svizzera;CH',
  'France|France|46.6|2.4|Frankreich',
  'Italy|Italy|42.8|12.6|Italien;Italia',
  'Spain|Spain|40.2|-3.6|Spanien;España;Espana',
  'Portugal|Portugal|39.6|-8.0',
  'United Kingdom|United Kingdom|53.0|-1.5|UK;Great Britain;Britain;Großbritannien;Grossbritannien;England',
  'Scotland|United Kingdom|56.8|-4.2|Schottland',
  'Wales|United Kingdom|52.3|-3.7',
  'Ireland|Ireland|53.2|-8.1|Irland;Éire',
  'Netherlands|Netherlands|52.2|5.5|Niederlande;Holland;Nederland',
  'Belgium|Belgium|50.6|4.6|Belgien;Belgique',
  'Denmark|Denmark|56.0|10.0|Dänemark;Danmark',
  'Sweden|Sweden|62.0|15.0|Schweden;Sverige',
  'Norway|Norway|61.0|9.0|Norwegen;Norge',
  'Finland|Finland|64.0|26.0|Finnland;Suomi',
  'Iceland|Iceland|64.9|-18.6|Island',
  'Poland|Poland|52.1|19.4|Polen;Polska',
  'Czechia|Czechia|49.8|15.5|Czech Republic;Tschechien',
  'Slovakia|Slovakia|48.7|19.7|Slowakei',
  'Hungary|Hungary|47.2|19.4|Ungarn;Magyarország',
  'Romania|Romania|45.9|25.0|Rumänien;România',
  'Bulgaria|Bulgaria|42.7|25.3|Bulgarien',
  'Greece|Greece|39.1|22.0|Griechenland;Hellas',
  'Türkiye|Türkiye|39.0|35.2|Turkey;Türkei;Turkiye',
  'Croatia|Croatia|45.1|15.6|Kroatien;Hrvatska',
  'Serbia|Serbia|44.0|20.8|Serbien;Srbija',
  'Bosnia and Herzegovina|Bosnia and Herzegovina|44.2|17.8|Bosnia;Bosnien',
  'Slovenia|Slovenia|46.1|14.8|Slowenien',
  'Albania|Albania|41.1|20.0|Albanien',
  'Kosovo|Kosovo|42.6|20.9',
  'North Macedonia|North Macedonia|41.6|21.7|Macedonia;Nordmazedonien',
  'Montenegro|Montenegro|42.8|19.3',
  'Ukraine|Ukraine|49.0|31.4',
  'Belarus|Belarus|53.7|28.0|Weißrussland',
  'Lithuania|Lithuania|55.2|23.9|Litauen',
  'Latvia|Latvia|56.9|24.6|Lettland',
  'Estonia|Estonia|58.6|25.0|Estland',
  'Moldova|Moldova|47.2|28.5|Moldau',
  'Russia|Russia|61.5|99.0|Russland;Russian Federation',
  'Cyprus|Cyprus|35.0|33.2|Zypern',
  'Malta|Malta|35.9|14.4',
  'United States|United States|39.8|-98.6|USA;US;America;Amerika;Vereinigte Staaten;United States of America',
  'Canada|Canada|56.1|-106.3|Kanada',
  'Mexico|Mexico|23.6|-102.6|Mexiko;México',
  'Brazil|Brazil|-10.3|-53.1|Brasilien;Brasil',
  'Argentina|Argentina|-38.4|-63.6|Argentinien',
  'Chile|Chile|-35.7|-71.5',
  'Colombia|Colombia|4.6|-74.3|Kolumbien',
  'Peru|Peru|-9.2|-75.0',
  'Venezuela|Venezuela|7.1|-66.2',
  'Cuba|Cuba|21.5|-79.0|Kuba',
  'China|China|35.9|104.2',
  'Japan|Japan|36.2|138.3',
  'South Korea|South Korea|36.5|127.9|Korea;Südkorea',
  'India|India|22.0|79.0|Indien',
  'Pakistan|Pakistan|30.4|69.3',
  'Bangladesh|Bangladesh|23.7|90.3|Bangladesch',
  'Iran|Iran|32.4|53.7',
  'Iraq|Iraq|33.2|43.7|Irak',
  'Syria|Syria|35.0|38.5|Syrien',
  'Lebanon|Lebanon|33.9|35.9|Libanon',
  'Israel|Israel|31.4|35.0',
  'Palestine|Palestine|31.9|35.2|Palästina',
  'Jordan|Jordan|31.2|36.5|Jordanien',
  'Saudi Arabia|Saudi Arabia|23.9|45.1|Saudi-Arabien',
  'Egypt|Egypt|26.8|30.8|Ägypten',
  'Morocco|Morocco|31.8|-7.1|Marokko',
  'Algeria|Algeria|28.0|1.7|Algerien',
  'Tunisia|Tunisia|34.0|9.5|Tunesien',
  'Nigeria|Nigeria|9.1|8.7',
  'Ghana|Ghana|7.9|-1.0',
  'Kenya|Kenya|0.0|37.9|Kenia',
  'Ethiopia|Ethiopia|9.1|40.5|Äthiopien',
  'Eritrea|Eritrea|15.2|39.8',
  'Somalia|Somalia|5.2|46.2',
  'South Africa|South Africa|-30.6|22.9|Südafrika',
  'Australia|Australia|-25.3|133.8|Australien',
  'New Zealand|New Zealand|-41.0|174.0|Neuseeland',
  'Indonesia|Indonesia|-2.5|118.0|Indonesien',
  'Philippines|Philippines|12.9|121.8|Philippinen',
  'Vietnam|Vietnam|14.1|108.3',
  'Thailand|Thailand|15.9|100.9',
  'Afghanistan|Afghanistan|33.9|67.7',
  'Kazakhstan|Kazakhstan|48.0|66.9|Kasachstan',
  'Georgia|Georgia|42.3|43.4|Georgien',
  'Armenia|Armenia|40.1|45.0|Armenien',
  'Azerbaijan|Azerbaijan|40.1|47.6|Aserbaidschan',
  'Sri Lanka|Sri Lanka|7.9|80.8',
  'Nepal|Nepal|28.4|84.1',
];

export interface Place {
  name: string;
  country: string;
  lat: number;
  lon: number;
  /** "country" means only an approximate national centre is known. */
  precision: 'city' | 'country';
}

const UMLAUTS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };

export function normalizePlace(value: string): string {
  return value
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function transliterate(value: string): string {
  return value.toLowerCase().replace(/[äöüß]/g, (c) => UMLAUTS[c] ?? c);
}

function buildIndex(rows: string[], precision: Place['precision']): Map<string, Place> {
  const index = new Map<string, Place>();
  for (const row of rows) {
    const [name, country, lat, lon, aliases = ''] = row.split('|');
    const place: Place = { name, country, lat: Number(lat), lon: Number(lon), precision };
    const keys = [name, ...aliases.split(';').filter(Boolean)];
    for (const key of keys) {
      for (const variant of [key, transliterate(key)]) {
        const normalized = normalizePlace(variant);
        if (normalized && !index.has(normalized)) index.set(normalized, place);
      }
    }
  }
  return index;
}

let cityIndex: Map<string, Place> | null = null;
let countryIndex: Map<string, Place> | null = null;

function indexes() {
  cityIndex ??= buildIndex(CITY_DATA, 'city');
  countryIndex ??= buildIndex(COUNTRY_DATA, 'country');
  return { cities: cityIndex, countries: countryIndex };
}

/** Best-effort lookup of a free-text place in the offline atlas. */
export function findPlace(input: string): Place | null {
  const raw = input.trim();
  if (!raw) return null;
  const { cities, countries } = indexes();
  const parts = raw
    .split(/[,/|(]|\s-\s/)
    .map((part) => normalizePlace(part.replace(/\)/g, '')))
    .filter(Boolean);
  const whole = normalizePlace(raw);

  for (const candidate of [whole, ...parts]) {
    const city = cities.get(candidate);
    if (city) return city;
  }
  for (const candidate of [whole, ...parts]) {
    const country = countries.get(candidate);
    if (country) return country;
  }
  // "Berlin Germany" without a comma: try leading word groups.
  const words = whole.split(' ');
  for (let length = Math.min(4, words.length - 1); length >= 1; length--) {
    const city = cities.get(words.slice(0, length).join(' '));
    if (city) return city;
  }
  return null;
}

export function suggestedPlaceNames(): string[] {
  return CITY_DATA.map((row) => {
    const [name, country] = row.split('|');
    return country ? `${name}, ${country}` : name;
  });
}

const EARTH_RADIUS_KM = 6371;
const RAD = Math.PI / 180;

export function distanceKm(a: Place, b: Place): number {
  const dLat = (b.lat - a.lat) * RAD;
  const dLon = (b.lon - a.lon) * RAD;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

const COMPASS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];

export function compassDirection(from: Place, to: Place): string {
  const φ1 = from.lat * RAD;
  const φ2 = to.lat * RAD;
  const Δλ = (to.lon - from.lon) * RAD;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const bearing = (Math.atan2(y, x) / RAD + 360) % 360;
  return COMPASS[Math.round(bearing / 45) % 8];
}

export function formatCoordinates(place: Place): string {
  const lat = `${Math.abs(place.lat).toFixed(2)}° ${place.lat >= 0 ? 'N' : 'S'}`;
  const lon = `${Math.abs(place.lon).toFixed(2)}° ${place.lon >= 0 ? 'E' : 'W'}`;
  return `${lat} · ${lon}`;
}
