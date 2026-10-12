import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { parseContact, topicLabel, type FieldErrors } from '../../lib/contact';

/**
 * Formularendpunkt – läuft serverseitig (Node-Adapter), alle anderen Seiten
 * sind statisch. Zugangsdaten kommen ausschließlich aus Umgebungsvariablen
 * (siehe .env.example und docs/BETRIEB.md).
 *
 * Datenschutz: Formularinhalte werden weder geloggt noch gespeichert, sondern
 * nur per E-Mail an CONTACT_TO übermittelt.
 */
export const prerender = false;

const MAX_BODY = 32 * 1024;
const MIN_FILL_MS = 2500;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;

// Einfaches Rate-Limit pro IP im Speicher (ausreichend für eine Instanz).
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
  }
  return recent.length > RATE_MAX;
}

type ErrorCode = 'invalid' | 'spam' | 'too_fast' | 'rate_limited' | 'not_configured' | 'send_failed' | 'bad_request';

function smtpConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, CONTACT_FROM, CONTACT_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_FROM) return null;
  return {
    transport: {
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    },
    from: CONTACT_FROM,
    to: CONTACT_TO || 'info@issa-immobilien.de',
  };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');

  const respond = (status: number, body: { ok: boolean; code?: ErrorCode; errors?: FieldErrors }) => {
    if (wantsJson) {
      return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      });
    }
    // Fallback ohne JavaScript: Weiterleitung ohne Formulardaten in der URL.
    const target = body.ok ? '/kontakt/gesendet/' : `/kontakt/fehler/?grund=${body.code ?? 'bad_request'}`;
    return new Response(null, { status: 303, headers: { location: target, 'cache-control': 'no-store' } });
  };

  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BODY) return respond(413, { ok: false, code: 'bad_request' });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return respond(400, { ok: false, code: 'bad_request' });
  }

  // Honeypot: Dieses Feld ist für Menschen unsichtbar.
  if (String(form.get('company_url') ?? '').trim() !== '') return respond(400, { ok: false, code: 'spam' });

  // Zu schnell ausgefüllt (nur prüfbar, wenn das Skript den Zeitstempel gesetzt hat).
  const started = Number(form.get('started') ?? 0);
  if (started > 0 && Date.now() - started < MIN_FILL_MS) return respond(400, { ok: false, code: 'too_fast' });

  let ip = 'unbekannt';
  try {
    ip = clientAddress;
  } catch {
    /* Adresse nicht verfügbar */
  }
  if (rateLimited(ip)) return respond(429, { ok: false, code: 'rate_limited' });

  const parsed = parseContact(form);
  if (!parsed.ok) return respond(422, { ok: false, code: 'invalid', errors: parsed.errors });

  const config = smtpConfig();
  if (!config) {
    console.warn('[kontakt] SMTP ist nicht konfiguriert – Anfrage wurde nicht versendet.');
    return respond(503, { ok: false, code: 'not_configured' });
  }

  const d = parsed.data;
  const name = `${d.firstName} ${d.lastName}`;
  const text = [
    'Neue Anfrage über das Kontaktformular auf issa-immobilien.de',
    '',
    `Anliegen:  ${topicLabel(d.topic)}`,
    `Name:      ${name}`,
    `E-Mail:    ${d.email}`,
    `Telefon:   ${d.phone || '–'}`,
    '',
    'Nachricht:',
    d.message,
    '',
    '—',
    'Der Absender hat bestätigt, die Datenschutzhinweise zur Kenntnis genommen zu haben.',
  ].join('\n');

  try {
    const transporter = nodemailer.createTransport(config.transport);
    await transporter.sendMail({
      from: { name: 'Website Issa Immobilien', address: config.from },
      to: config.to,
      replyTo: { name, address: d.email },
      subject: `Website-Anfrage: ${topicLabel(d.topic)} – ${name}`.slice(0, 180),
      text,
    });
  } catch (error) {
    // Nur technische Fehlerkennung loggen, keine Inhalte oder Adressen.
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unbekannt';
    console.error(`[kontakt] Versand fehlgeschlagen (Code: ${code}).`);
    return respond(502, { ok: false, code: 'send_failed' });
  }

  return respond(200, { ok: true });
};

export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });
