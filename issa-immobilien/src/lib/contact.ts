import { inquiryTopics, type InquiryTopic } from '../data/site';

export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  topic: InquiryTopic;
  message: string;
}

export type FieldErrors = Partial<Record<keyof ContactInput | 'privacy', string>>;

export const limits = {
  name: 80,
  email: 200,
  phone: 40,
  message: 5000,
  messageMin: 10,
} as const;

const emailPattern = /^[^\s@"<>()[\]\\,;:]+@[^\s@"<>()[\]\\,;:]+\.[^\s@"<>()[\]\\,;:]{2,}$/;
const phonePattern = /^[+()\d\s/.-]{6,}$/;

/** Steuerzeichen entfernen und Leerraum normalisieren (Zeilenumbrüche nur im Nachrichtentext). */
function clean(value: FormDataEntryValue | null, multiline = false): string {
  if (typeof value !== 'string') return '';
  const v = value.replace(multiline ? /[^\P{Cc}\n\t]/gu : /\p{Cc}/gu, multiline ? '' : ' ');
  return multiline ? v.replace(/\r\n?/g, '\n').trim() : v.replace(/\s+/g, ' ').trim();
}

export function parseContact(form: FormData):
  | { ok: true; data: ContactInput }
  | { ok: false; errors: FieldErrors } {
  const data = {
    firstName: clean(form.get('firstName')),
    lastName: clean(form.get('lastName')),
    email: clean(form.get('email')).toLowerCase(),
    phone: clean(form.get('phone')),
    topic: clean(form.get('topic')),
    message: clean(form.get('message'), true),
  };
  const errors: FieldErrors = {};

  if (!data.firstName) errors.firstName = 'Bitte geben Sie Ihren Vornamen an.';
  else if (data.firstName.length > limits.name) errors.firstName = 'Der Vorname ist zu lang.';

  if (!data.lastName) errors.lastName = 'Bitte geben Sie Ihren Nachnamen an.';
  else if (data.lastName.length > limits.name) errors.lastName = 'Der Nachname ist zu lang.';

  if (!data.email) errors.email = 'Bitte geben Sie Ihre E-Mail-Adresse an.';
  else if (data.email.length > limits.email || !emailPattern.test(data.email))
    errors.email = 'Bitte prüfen Sie die E-Mail-Adresse, z. B. name@beispiel.de.';

  if (data.phone && (data.phone.length > limits.phone || !phonePattern.test(data.phone)))
    errors.phone = 'Bitte geben Sie eine gültige Telefonnummer an oder lassen Sie das Feld leer.';

  if (!inquiryTopics.some((t) => t.value === data.topic)) errors.topic = 'Bitte wählen Sie Ihr Anliegen aus.';

  if (data.message.length < limits.messageMin)
    errors.message = 'Bitte beschreiben Sie Ihr Anliegen in einigen Worten.';
  else if (data.message.length > limits.message)
    errors.message = `Die Nachricht darf höchstens ${limits.message} Zeichen lang sein.`;

  if (form.get('privacy') !== 'on') errors.privacy = 'Bitte bestätigen Sie, dass Sie die Datenschutzhinweise gelesen haben.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data: data as ContactInput };
}

export function topicLabel(value: InquiryTopic): string {
  return inquiryTopics.find((t) => t.value === value)?.label ?? value;
}
