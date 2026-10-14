/**
 * Public entry point of the reading engine.
 *
 *   const reading = await generateCosmicReading(userData);
 *
 * By default the local rule-based demo provider runs entirely in the browser.
 * To connect a real AI model later, deploy a backend that implements the
 * contract in ./httpProvider.ts and set VITE_ASTRA_READING_ENDPOINT. The UI
 * reads `reading.engine` to label the result honestly either way.
 */
import { createHttpReadingProvider } from './httpProvider';
import { localDemoProvider } from './localDemoProvider';
import type { CosmicReading, GenerateOptions, ReadingInput, ReadingProvider } from './types';
import { validateReadingInput } from './validation';

const endpoint = import.meta.env.VITE_ASTRA_READING_ENDPOINT?.trim();

export const readingProvider: ReadingProvider = endpoint ? createHttpReadingProvider(endpoint) : localDemoProvider;

export class InvalidReadingInputError extends Error {
  constructor(readonly fields: string[]) {
    super(`Invalid reading input: ${fields.join(', ')}`);
    this.name = 'InvalidReadingInputError';
  }
}

export async function generateCosmicReading(userData: ReadingInput, options?: GenerateOptions): Promise<CosmicReading> {
  const errors = validateReadingInput(userData, options?.now);
  const fields = Object.keys(errors);
  if (fields.length) throw new InvalidReadingInputError(fields);
  return readingProvider.generate(userData, options);
}

export type { CosmicReading, ReadingInput } from './types';
