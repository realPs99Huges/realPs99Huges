import { useCallback, useMemo, useRef, useState } from 'react';
import { parseDate, parseTime, sunPosition, type SunPosition } from '../lib/astro/sky';
import type { CosmicReading, ReadingInput } from '../lib/reading/types';

export type Stage = 'form' | 'generating' | 'report';
export type PremiumState = 'locked' | 'preparing' | 'unlocked';

export const EMPTY_INPUT: ReadingInput = {
  birthDate: '',
  birthTime: '',
  birthTimeUnknown: false,
  birthplace: '',
  residence: '',
  sign: 'aries',
  intention: '',
};

/** Sun position for the entered birth moment, or null while the date is incomplete. */
export function suggestSign(
  input: Pick<ReadingInput, 'birthDate' | 'birthTime' | 'birthTimeUnknown'>,
): SunPosition | null {
  const date = parseDate(input.birthDate);
  if (!date || date.year < 1900) return null;
  const time = input.birthTimeUnknown ? null : parseTime(input.birthTime);
  return sunPosition({ ...date, hour: time?.hour ?? 12, minute: time?.minute ?? 0 });
}

/**
 * All reading state lives here, in memory only. Nothing is persisted:
 * reloading the page or starting a new reading discards it.
 */
export function useReadingSession() {
  const [input, setInput] = useState<ReadingInput>(EMPTY_INPUT);
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<Stage>('form');
  const [reading, setReading] = useState<CosmicReading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [premium, setPremium] = useState<PremiumState>('locked');
  const signChosen = useRef(false);
  const premiumTimer = useRef(0);

  const suggestion = useMemo(() => suggestSign(input), [input]);

  const update = useCallback(<K extends keyof ReadingInput>(field: K, value: ReadingInput[K]) => {
    if (field === 'sign') signChosen.current = true;
    setInput((previous) => {
      const next = { ...previous, [field]: value };
      if (field === 'birthTimeUnknown' && value === true) next.birthTime = '';
      if (!signChosen.current && (field === 'birthDate' || field === 'birthTime' || field === 'birthTimeUnknown')) {
        const sun = suggestSign(next);
        if (sun) next.sign = sun.sign.id;
      }
      return next;
    });
  }, []);

  const acceptSuggestion = useCallback(() => {
    signChosen.current = false;
    setInput((previous) => {
      const sun = suggestSign(previous);
      return sun ? { ...previous, sign: sun.sign.id } : previous;
    });
  }, []);

  const startGeneration = useCallback(() => {
    setError(null);
    setStage('generating');
  }, []);

  const completeGeneration = useCallback((result: CosmicReading) => {
    setReading(result);
    setPremium('locked');
    setStage('report');
  }, []);

  const failGeneration = useCallback((message: string) => {
    setError(message);
    setStage('form');
    setStep(2);
  }, []);

  const unlockPremium = useCallback((delay: number) => {
    window.clearTimeout(premiumTimer.current);
    setPremium('preparing');
    premiumTimer.current = window.setTimeout(() => setPremium('unlocked'), delay);
  }, []);

  const reset = useCallback(() => {
    window.clearTimeout(premiumTimer.current);
    signChosen.current = false;
    setInput(EMPTY_INPUT);
    setStep(0);
    setReading(null);
    setError(null);
    setPremium('locked');
    setStage('form');
  }, []);

  return {
    input,
    update,
    suggestion,
    acceptSuggestion,
    step,
    setStep,
    stage,
    reading,
    error,
    premium,
    startGeneration,
    completeGeneration,
    failGeneration,
    unlockPremium,
    reset,
  };
}

export type ReadingSession = ReturnType<typeof useReadingSession>;
