import { getSign } from '../../../lib/astro/zodiac';
import type { CosmicReading, Insight, TimelineNode } from '../../../lib/reading/types';

const RULE = '────────────────────────────────────────';

export function summaryText(reading: CosmicReading): string {
  const sign = getSign(reading.sign);
  return [
    `${reading.title} — ${sign.name}`,
    reading.subtitle,
    '',
    reading.summary,
    '',
    '— ASTRA demo reading. Symbolic interpretation; not an ancestry analysis or a prediction.',
  ].join('\n');
}

function insight(item: Insight) {
  return `${item.title}${item.tag ? ` [${item.tag}]` : ''}\n${item.body}`;
}

function node(item: TimelineNode) {
  const when = item.status === 'now' ? `Now (${item.year})` : `Age ≈ ${Math.round(item.age)} (${item.year})`;
  return `• ${when} — ${item.title} · ${item.cycle}\n  ${item.theme}\n  ? ${item.question}`;
}

function section(title: string, body: string[]) {
  return [RULE, title.toUpperCase(), RULE, ...body, ''].join('\n');
}

export function reportText(reading: CosmicReading, includePremium: boolean): string {
  const sign = getSign(reading.sign);
  const lines: string[] = [
    'ASTRA — YOUR COSMIC PROFILE',
    'DEMO REPORT · generated locally · symbolic interpretation',
    '',
    reading.title,
    reading.subtitle,
    '',
    `Sign: ${sign.name} (${sign.image})`,
    `Born: ${reading.profile.birthDateLabel} · ${reading.profile.birthTimeLabel}`,
    `Birthplace: ${reading.profile.birthplace}`,
    reading.profile.residence ? `Lives in: ${reading.profile.residence}` : '',
    ...reading.profile.facets.map((f) => `${f.label}: ${f.value}${f.note ? ` (${f.note})` : ''}`),
    '',
    section('Summary', [reading.summary]),
    section('01 — Your Cosmic Identity', [
      `“${reading.identity.lead}”`,
      '',
      ...reading.identity.paragraphs.flatMap((p) => [p, '']),
      ...reading.identity.facets.map((f) => `${f.label}: ${f.value}`),
      reading.identity.note ? `\nNote: ${reading.identity.note}` : '',
    ]),
    section('02 — Your Inner Universe', [
      reading.innerUniverse.intro,
      '',
      'Strengths',
      ...reading.innerUniverse.strengths.map((s) => `• ${s.title} — ${s.body}`),
      '',
      'Tensions',
      ...reading.innerUniverse.tensions.map((t) => `• ${t.title} — ${t.body}`),
      '',
      `Growth theme: ${reading.innerUniverse.growth.title} — ${reading.innerUniverse.growth.body}`,
    ]),
    section('03 — Origins & Cultural Connections', [
      reading.origins.statement,
      '',
      `Important: ${reading.origins.boundary}`,
      '',
      insight(reading.origins.symbolic),
    ]),
    section('04 — Your Cosmic Timeline', [reading.timeline.intro, '', ...reading.timeline.nodes.map(node)]),
    section('05 — Your Personal Reflection', [
      reading.reflection.intro,
      reading.reflection.intention ? `You asked: “${reading.reflection.intention}”` : '',
      '',
      ...reading.reflection.questions.map((q, i) => `${i + 1}. ${q}`),
    ]),
  ];

  if (includePremium) {
    const p = reading.premium;
    lines.push(
      section('Premium preview (demo — no payment processed)', [
        'The following extended reading was unlocked in demo mode.',
      ]),
      section('Extended Cosmic Profile', [
        p.extendedProfile.intro,
        '',
        ...p.extendedProfile.sections.flatMap((s) => [insight(s), '']),
      ]),
      section('Detailed Symbolic Origin Reading', [
        p.originReading.intro,
        '',
        ...p.originReading.sky.flatMap((s) => [insight(s), '']),
        insight(p.originReading.lore),
        '',
        insight(p.originReading.landscapes),
        p.originReading.journey ? `\n${insight(p.originReading.journey)}` : '',
        '',
        'Questions for your family history',
        ...p.originReading.familyPrompts.map((q) => `• ${q}`),
      ]),
      section('Extended Cosmic Timeline', [p.fullTimeline.intro, '', ...p.fullTimeline.nodes.map(node)]),
      section('Extended Personal Reflection', [
        p.extendedReflection.intro,
        '',
        ...p.extendedReflection.nights.map((n) => `${n.day} (${n.planet}) — ${n.prompt}`),
      ]),
      section('Complete Cosmic Report', [
        ...p.signature.paragraphs.flatMap((para) => [para, '']),
        ...p.signature.symbols.map((s) => `${s.label}: ${s.value}${s.note ? ` — ${s.note}` : ''}`),
        '',
        `Mantra: “${p.signature.mantra}”`,
      ]),
    );
  } else {
    lines.push(
      section('Extended reading', [
        'Locked in this demo. Use “Preview Premium” to include it — no payment is involved.',
      ]),
    );
  }

  lines.push(
    RULE,
    reading.engine.label,
    'ASTRA is a design prototype. Readings are symbolic and for reflection only. Birth data cannot reveal genetic',
    'ancestry, ethnicity or cultural origin, and nothing here predicts future events. No payment was processed,',
    'and none of your details were stored or transmitted.',
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
