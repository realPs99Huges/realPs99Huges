import type { PlanetId, ZodiacId } from '../astro/zodiac';

/** Every symbol the UI can draw (see components/cosmos/Glyph.tsx). */
export type GlyphId = ZodiacId | PlanetId | 'node' | 'chiron' | 'star';

/** Everything the visitor entered in the wizard. Optional fields are empty strings. */
export interface ReadingInput {
  /** ISO date, YYYY-MM-DD. */
  birthDate: string;
  /** HH:MM, or '' when the time is unknown. */
  birthTime: string;
  birthTimeUnknown: boolean;
  birthplace: string;
  residence: string;
  /** The sign the visitor confirmed (pre-filled from the birth date). */
  sign: ZodiacId;
  intention: string;
}

export interface ReadingEngine {
  /** 'demo-rules' = local rule-based demo engine; 'remote-model' = a server-side AI model. */
  kind: 'demo-rules' | 'remote-model';
  label: string;
}

export interface Facet {
  label: string;
  value: string;
  note?: string;
}

/** A tile: category label, short value, one explaining sentence. */
export interface Fact {
  label: string;
  value: string;
  note?: string;
}

export interface Insight {
  title: string;
  body: string;
  /** Optional small label, e.g. "Creative interpretation". */
  tag?: string;
}

export interface TimelineNode {
  id: string;
  age: number;
  year: number;
  glyph: GlyphId;
  title: string;
  cycle: string;
  theme: string;
  question: string;
  status: 'past' | 'now' | 'future';
}

export interface MapPoint {
  label: string;
  role: 'birth' | 'home';
  lat: number;
  lon: number;
  precision: 'city' | 'country';
  coordinates: string;
}

export interface Asterism {
  name: string;
  translation: string;
  /** Points in a unit square (0–1). */
  stars: Array<{ x: number; y: number; magnitude: number }>;
  lines: Array<[number, number]>;
}

export interface CosmicReading {
  id: string;
  engine: ReadingEngine;
  createdAt: string;
  sign: ZodiacId;
  title: string;
  subtitle: string;
  asterism: Asterism;
  summary: string;
  /** "Das bist du": personality traits, one short answer + one sentence each. */
  selfProfile: Fact[];
  facts: Fact[];
  profile: {
    birthDateLabel: string;
    birthTimeLabel: string;
    birthplace: string;
    residence: string;
    facets: Facet[];
  };
  identity: {
    lead: string;
    paragraphs: string[];
    facets: Facet[];
    note?: string;
  };
  innerUniverse: {
    intro: string;
    strengths: Insight[];
    tensions: Insight[];
    growth: Insight;
  };
  origins: {
    birth: MapPoint | null;
    home: MapPoint | null;
    statement: string;
    boundary: string;
    symbolic: Insight;
  };
  timeline: {
    intro: string;
    nodes: TimelineNode[];
  };
  reflection: {
    intro: string;
    intention: string;
    questions: string[];
  };
  premium: {
    extendedProfile: { intro: string; sections: Insight[] };
    originReading: {
      intro: string;
      sky: Insight[];
      lore: Insight;
      landscapes: Insight;
      journey: Insight | null;
      familyPrompts: string[];
    };
    extendedReflection: {
      intro: string;
      nights: Array<{ day: string; planet: string; prompt: string }>;
    };
    fullTimeline: { intro: string; nodes: TimelineNode[] };
    signature: { paragraphs: string[]; symbols: Facet[]; mantra: string };
  };
}

export interface GenerateOptions {
  signal?: AbortSignal;
  /** Reference "today", injectable for tests. */
  now?: Date;
}

/**
 * A reading provider turns wizard input into a structured reading. The local demo
 * provider runs in the browser; a remote provider would call your own backend,
 * which holds any model API keys — never the frontend.
 */
export interface ReadingProvider {
  readonly engine: ReadingEngine;
  generate(input: ReadingInput, options?: GenerateOptions): Promise<CosmicReading>;
}
