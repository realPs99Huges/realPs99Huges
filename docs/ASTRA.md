# ASTRA — AI Origin & Cosmic Profile (prototype)

A design prototype for a premium astrology experience: landing page → three-step birth wizard →
immersive generation sequence → personal cosmic report → simulated premium preview.

Everything runs in the browser. There is no backend, no payment integration, no API key and no
data storage.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

Stack: Vite, React 19, TypeScript (strict), plain CSS with design tokens. Fonts (Instrument Serif,
Geist, Geist Mono) are bundled via `@fontsource`, so the site makes no third-party requests.

## Project map

```
src/
  App.tsx                     views (home / reading), history, view transitions
  app/useReadingSession.ts    in-memory reading state (form, step, stage, premium)
  lib/
    astro/                    zodiac data, Sun longitude, Moon phase, day parts (no ephemeris)
    geo/                      small offline atlas + low-res land mask for the dotted map
    reading/
      index.ts                generateCosmicReading(userData) — public entry point
      types.ts                ReadingInput, CosmicReading, ReadingProvider
      localDemoProvider.ts    rule-based demo engine (default)
      httpProvider.ts         adapter for a future backend / AI model (off by default)
      validation.ts           shared form validation
      content/                hand-written interpretation corpus
  components/
    cosmos/                   starfield canvas, cosmic sphere, glyphs, background
    home/                     hero, zodiac atlas, landing sections
    reading/                  wizard, generation sequence, report, paywall, demo modal
    layout/ ui/ brand/        header, footer, notices, modal, toast, icons, logo
```

## How readings are made

`generateCosmicReading(userData)` validates the input and hands it to the active provider.

- **Default — local demo engine.** Computes the Sun's ecliptic longitude (sign, degree, decan,
  cusp), the Moon's phase and the weekday of birth with small astronomical formulas, then composes
  the reading from the corpus in `lib/reading/content`. A seeded random generator keyed on the
  birth data keeps results stable for the same input and varied across people. Every reading is
  labelled “Demo reading · generated locally by a rule-based engine”.
- **Later — a real AI model.** Deploy your own backend that accepts `POST { input: ReadingInput }`
  and returns a `CosmicReading` JSON object, then set `VITE_ASTRA_READING_ENDPOINT` to its URL.
  Model API keys stay on that backend. The UI labels the result from `reading.engine`, so a demo
  reading is never presented as AI output.

## Honesty & safety rules built into the prototype

- Birth data is never presented as revealing genetic ancestry, ethnicity or cultural origin. The
  origins chapter shows the place the visitor entered, states this boundary explicitly and marks
  every symbolic geography as “Creative interpretation”.
- Inner-universe themes are written as reflection prompts, not as a diagnosis; timeline cycles
  are framed as questions, never as predictions.
- The generation sequence is labelled as a visual sequence; no analysis of DNA is claimed.
- Premium is a simulation: “Unlock Full Reading” opens a “Demo Experience” dialog
  (“This is a prototype. No payment will be processed.”) and “Preview Premium” unlocks the
  extended reading in local React state only. No card or bank details are ever requested.
- Nothing is persisted (no cookies, localStorage or analytics). Reloading clears all entries.

## Accessibility & motion

Keyboard-operable throughout (skip link, focus management between wizard steps, native `<dialog>`
modals, arrow-key zodiac atlas), visible focus styles, sufficient contrast, and
`prefers-reduced-motion` support (static starfield, no rotations, instant transitions).
