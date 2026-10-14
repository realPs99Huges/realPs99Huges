/**
 * Adapter for a future server-side AI reading service.
 *
 * It is NOT active by default. It is only used when the developer sets
 * VITE_ASTRA_READING_ENDPOINT to the URL of their own backend. That backend is
 * where model API keys live and where the model output is validated; the
 * frontend never holds a secret and never calls a model provider directly.
 *
 * Expected contract: POST { input: ReadingInput } → 200 CosmicReading (JSON).
 */
import type { CosmicReading, ReadingProvider } from './types';

export class ReadingServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReadingServiceError';
  }
}

function looksLikeReading(value: unknown): value is CosmicReading {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CosmicReading>;
  return (
    typeof candidate.title === 'string' &&
    typeof candidate.summary === 'string' &&
    typeof candidate.sign === 'string' &&
    !!candidate.identity &&
    !!candidate.innerUniverse &&
    !!candidate.origins &&
    !!candidate.timeline &&
    !!candidate.reflection &&
    !!candidate.premium
  );
}

export function createHttpReadingProvider(endpoint: string): ReadingProvider {
  const engine = { kind: 'remote-model', label: 'KI-gestützte Deutung' } as const;
  return {
    engine,
    async generate(input, options) {
      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input }),
          signal: options?.signal,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') throw error;
        throw new ReadingServiceError('Der Deutungsdienst ist nicht erreichbar.');
      }
      if (!response.ok) throw new ReadingServiceError(`Der Deutungsdienst antwortete mit Status ${response.status}.`);
      const data: unknown = await response.json().catch(() => null);
      if (!looksLikeReading(data)) throw new ReadingServiceError('Der Deutungsdienst lieferte ein unerwartetes Format.');
      // The label always reflects the engine that actually produced the reading.
      return { ...data, engine };
    },
  };
}
