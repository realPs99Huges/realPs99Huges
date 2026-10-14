import { getSign } from '../../../lib/astro/zodiac';
import type { CosmicReading, Insight, TimelineNode } from '../../../lib/reading/types';

const RULE = '────────────────────────────────────────';

export function summaryText(reading: CosmicReading): string {
  const sign = getSign(reading.sign);
  return [
    `${reading.title} – ${sign.name}`,
    reading.subtitle,
    '',
    reading.summary,
    '',
    '— ASTRA Demo-Deutung. Symbolische Interpretation, keine Abstammungsanalyse und keine Vorhersage.',
  ].join('\n');
}

function insight(item: Insight) {
  return `${item.title}${item.tag ? ` [${item.tag}]` : ''}\n${item.body}`;
}

function node(item: TimelineNode) {
  const when = item.status === 'now' ? `Jetzt (${item.year})` : `Mit ≈ ${Math.round(item.age)} (${item.year})`;
  return `• ${when} – ${item.title} · ${item.cycle}\n  ${item.theme}\n  ? ${item.question}`;
}

function section(title: string, body: string[]) {
  return [RULE, title.toUpperCase(), RULE, ...body, ''].join('\n');
}

export function reportText(reading: CosmicReading, includePremium: boolean): string {
  const sign = getSign(reading.sign);
  const lines: string[] = [
    'ASTRA – DEIN KOSMISCHES PROFIL',
    'DEMO-BERICHT · lokal erstellt · symbolische Interpretation',
    '',
    reading.title,
    reading.subtitle,
    '',
    `Sternzeichen: ${sign.name} (${sign.image})`,
    `Geboren: ${reading.profile.birthDateLabel} · ${reading.profile.birthTimeLabel}`,
    `Geburtsort: ${reading.profile.birthplace}`,
    reading.profile.residence ? `Wohnort: ${reading.profile.residence}` : '',
    '',
    section('Kurz gesagt', [reading.summary]),
    section(
      'Das bist du – auf einen Blick',
      reading.selfProfile.map((f) => `• ${f.label}: ${f.value}${f.note ? ` – ${f.note}` : ''}`),
    ),
    section(
      'Fakten zu deiner Geburt',
      reading.facts.map((f) => `• ${f.label}: ${f.value}${f.note ? ` – ${f.note}` : ''}`),
    ),
    section('01 – Deine kosmische Identität', [
      `„${reading.identity.lead}“`,
      '',
      ...reading.identity.paragraphs.flatMap((p) => [p, '']),
      ...reading.identity.facets.map((f) => `${f.label}: ${f.value}`),
      reading.identity.note ? `\nHinweis: ${reading.identity.note}` : '',
    ]),
    section('02 – Dein inneres Universum', [
      reading.innerUniverse.intro,
      '',
      'Stärken',
      ...reading.innerUniverse.strengths.map((s) => `• ${s.title} – ${s.body}`),
      '',
      'Spannungsfelder',
      ...reading.innerUniverse.tensions.map((t) => `• ${t.title} – ${t.body}`),
      '',
      `Wachstumsthema: ${reading.innerUniverse.growth.title} – ${reading.innerUniverse.growth.body}`,
    ]),
    section('03 – Herkunft & Kultur', [
      reading.origins.statement,
      '',
      `Wichtig: ${reading.origins.boundary}`,
      '',
      insight(reading.origins.symbolic),
    ]),
    section('04 – Dein Zeitstrahl', [reading.timeline.intro, '', ...reading.timeline.nodes.map(node)]),
    section('05 – Deine Reflexion', [
      reading.reflection.intro,
      reading.reflection.intention ? `Deine Frage: „${reading.reflection.intention}“` : '',
      '',
      ...reading.reflection.questions.map((q, i) => `${i + 1}. ${q}`),
    ]),
  ];

  if (includePremium) {
    const p = reading.premium;
    lines.push(
      section('Premium-Vorschau (Demo – keine Zahlung verarbeitet)', [
        'Die folgende erweiterte Deutung wurde im Demo-Modus freigeschaltet.',
      ]),
      section('Erweitertes kosmisches Profil', [
        p.extendedProfile.intro,
        '',
        ...p.extendedProfile.sections.flatMap((s) => [insight(s), '']),
      ]),
      section('Ausführliche Herkunftsdeutung', [
        p.originReading.intro,
        '',
        ...p.originReading.sky.flatMap((s) => [insight(s), '']),
        insight(p.originReading.lore),
        '',
        insight(p.originReading.landscapes),
        p.originReading.journey ? `\n${insight(p.originReading.journey)}` : '',
        '',
        'Fragen zur Familiengeschichte',
        ...p.originReading.familyPrompts.map((q) => `• ${q}`),
      ]),
      section('Erweiterter Zeitstrahl', [p.fullTimeline.intro, '', ...p.fullTimeline.nodes.map(node)]),
      section('Erweiterte Reflexion', [
        p.extendedReflection.intro,
        '',
        ...p.extendedReflection.nights.map((n) => `${n.day} (${n.planet}) – ${n.prompt}`),
      ]),
      section('Vollständiger kosmischer Bericht', [
        ...p.signature.paragraphs.flatMap((para) => [para, '']),
        ...p.signature.symbols.map((s) => `${s.label}: ${s.value}${s.note ? ` – ${s.note}` : ''}`),
        '',
        `Mantra: „${p.signature.mantra}“`,
      ]),
    );
  } else {
    lines.push(
      section('Erweiterte Deutung', [
        'In dieser Demo gesperrt. Mit „Premium ansehen“ wird sie ergänzt – ohne Zahlung.',
      ]),
    );
  }

  lines.push(
    RULE,
    reading.engine.label,
    'ASTRA ist ein Design-Prototyp. Deutungen sind symbolisch und dienen der Reflexion. Geburtsdaten können keine',
    'genetische Abstammung, Ethnie oder kulturelle Herkunft zeigen, und nichts hier sagt die Zukunft voraus.',
    'Es wurde keine Zahlung verarbeitet, und keine deiner Angaben wurde gespeichert oder übertragen.',
  );

  return `${lines.filter((line, i, all) => !(line === '' && all[i - 1] === '')).join('\n')}\n`;
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
