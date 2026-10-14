import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { ReadingSession } from '../../../app/useReadingSession';
import { suggestedPlaceNames } from '../../../lib/geo/places';
import type { ReadingInput } from '../../../lib/reading/types';
import {
  validateBirthStep,
  validateIdentityStep,
  type ReadingField,
  type ValidationErrors,
} from '../../../lib/reading/validation';
import type { NoticeKind } from '../../layout/NoticeModal';
import { Icon } from '../../ui/Icon';
import { BirthInstrument } from './BirthInstrument';
import { StepBirth, StepIdentity, StepReveal } from './WizardSteps';
import './Wizard.css';

const STEPS = [
  {
    numeral: 'I',
    name: 'Deine Geburt',
    title: (
      <>
        Deine <em>Geburt</em>
      </>
    ),
    intro: 'Datum, Uhrzeit und Ort – mehr braucht deine Deutung nicht.',
  },
  {
    numeral: 'II',
    name: 'Dein Zeichen',
    title: (
      <>
        Dein <em>Zeichen</em>
      </>
    ),
    intro: 'Dein Sternzeichen ist berechnet. Ergänze bei Lust deinen Wohnort und eine Frage – beides ist optional.',
  },
  {
    numeral: 'III',
    name: 'Deutung',
    title: (
      <>
        Alles <em>bereit</em>
      </>
    ),
    intro: 'Prüfe kurz deine Angaben – dann erstellen wir deine Deutung.',
  },
];

const FIELD_STEP: Partial<Record<ReadingField, number>> = {
  birthDate: 0,
  birthTime: 0,
  birthTimeUnknown: 0,
  birthplace: 0,
  sign: 1,
  residence: 1,
  intention: 1,
};

function focusField(field: ReadingField) {
  requestAnimationFrame(() => {
    const target =
      field === 'sign'
        ? document.querySelector<HTMLElement>('input[name="sign"]:checked, .sign-card__toggle')
        : document.getElementById(`field-${field}`);
    target?.focus();
  });
}

interface ReadingWizardProps {
  session: ReadingSession;
  onOpenNotice: (notice: NoticeKind) => void;
}

export function ReadingWizard({ session, onOpenNotice }: ReadingWizardProps) {
  const { input, update, suggestion, acceptSuggestion, step, setStep, error, stage } = session;
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [direction, setDirection] = useState<1 | -1>(1);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const places = useMemo(() => suggestedPlaceNames(), []);
  const current = STEPS[step];

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      // On desktop, put the cursor straight into the first field.
      if (step === 0 && window.matchMedia('(pointer: fine)').matches) {
        document.getElementById('field-birthDate')?.focus({ preventScroll: true });
      }
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    const top = topRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) topRef.current?.scrollIntoView({ block: 'start' });
  }, [step]);

  const setField = <K extends keyof ReadingInput>(field: K, value: ReadingInput[K]) => {
    update(field, value);
    if (errors[field] || (field === 'birthTimeUnknown' && errors.birthTime)) {
      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
        ...(field === 'birthTimeUnknown' ? { birthTime: undefined } : {}),
      }));
    }
  };

  const goTo = (next: number, focus?: ReadingField) => {
    setDirection(next >= step ? 1 : -1);
    setErrors({});
    setStep(next);
    if (focus) focusField(focus);
  };

  const fail = (found: ValidationErrors) => {
    setErrors(found);
    const first = Object.keys(found)[0] as ReadingField | undefined;
    if (first) focusField(first);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (stage === 'generating') return;
    if (step === 0) {
      const found = validateBirthStep(input);
      if (Object.keys(found).length) return fail(found);
      return goTo(1);
    }
    if (step === 1) {
      const found = validateIdentityStep(input);
      if (Object.keys(found).length) return fail(found);
      return goTo(2);
    }
    const found = { ...validateBirthStep(input), ...validateIdentityStep(input) };
    const first = Object.keys(found)[0] as ReadingField | undefined;
    if (first) {
      goTo(FIELD_STEP[first] ?? 0);
      setErrors(found);
      focusField(first);
      return;
    }
    session.startGeneration();
  };

  return (
    <section className="wizard container" aria-labelledby="wizard-title">
      <div ref={topRef} className="wizard__anchor" />
      <aside className="wizard__aside">
        <div className="wizard__aside-head">
          <p className="label label--gold">Deine Deutung</p>
          <span className="chip">
            <span className="chip__dot" aria-hidden="true" />
            Demo
          </span>
        </div>
        <ol className="wizard__rail" aria-label="Schritte">
          {STEPS.map((s, index) => {
            const state = index < step ? 'done' : index === step ? 'current' : 'upcoming';
            return (
              <li key={s.name} className={`wizard__rail-item is-${state}`}>
                <button
                  type="button"
                  className="wizard__rail-button"
                  disabled={index >= step}
                  aria-current={index === step ? 'step' : undefined}
                  onClick={() => goTo(index)}
                >
                  <span className="wizard__rail-numeral">{s.numeral}</span>
                  <span className="wizard__rail-name">{s.name}</span>
                  {state === 'done' && <Icon name="check" size={14} className="wizard__rail-check" />}
                </button>
              </li>
            );
          })}
        </ol>
        <BirthInstrument input={input} suggestion={suggestion} />
      </aside>

      <div className="wizard__main">
        <div className="wizard__progress">
          <div className="wizard__progress-meta">
            <span className="label">
              Schritt {current.numeral} <span className="muted">von III</span>
            </span>
            <span className="label">{current.name}</span>
          </div>
          <div
            className="wizard__progress-track"
            role="progressbar"
            aria-label="Fortschritt"
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={step + 1}
            aria-valuetext={`Schritt ${step + 1} von 3: ${current.name}`}
          >
            <span className="wizard__progress-fill" style={{ transform: `scaleX(${(step + 1) / 3})` }} />
          </div>
        </div>

        <form className="wizard__form" noValidate onSubmit={onSubmit}>
          <div key={step} className={`wizard__step ${direction > 0 ? 'is-forward' : 'is-back'}`}>
            <h1 id="wizard-title" ref={headingRef} tabIndex={-1} className="wizard__title">
              {current.title}
            </h1>
            <p className="wizard__intro lead">{current.intro}</p>

            {step === 0 && <StepBirth input={input} errors={errors} setField={setField} />}
            {step === 1 && (
              <StepIdentity
                input={input}
                errors={errors}
                setField={setField}
                suggestion={suggestion}
                onAcceptSuggestion={acceptSuggestion}
              />
            )}
            {step === 2 && <StepReveal input={input} suggestion={suggestion} onEdit={goTo} />}
          </div>

          {error && step === 2 && (
            <div className="wizard__alert" role="alert">
              <Icon name="info" size={18} />
              <div>
                <strong>Die Deutung konnte nicht erstellt werden.</strong> {error} Deine Angaben sind noch da – bitte
                versuche es erneut.
              </div>
            </div>
          )}

          <div className="wizard__nav">
            {step > 0 ? (
              <button type="button" className="btn btn--text wizard__back" onClick={() => goTo(step - 1)}>
                <Icon name="arrowLeft" className="btn__icon" />
                Zurück
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className={`btn ${step === 2 ? 'btn--primary wizard__generate' : 'btn--primary'}`}>
              {step === 2 ? 'Deutung erstellen' : 'Weiter'}
              <Icon name={step === 2 ? 'sparkle' : 'arrowRight'} className="btn__icon btn__icon--arrow" />
            </button>
          </div>
        </form>

        <p className="wizard__privacy">
          <Icon name="shield" size={14} />
          <span>Wird nur in deinem Browser verarbeitet. Nichts wird gespeichert oder gesendet.</span>
          <button type="button" className="wizard__privacy-link" onClick={() => onOpenNotice('privacy')}>
            Datenschutz
          </button>
        </p>
      </div>

      <datalist id="astra-places">
        {places.map((place) => (
          <option key={place} value={place} />
        ))}
      </datalist>
    </section>
  );
}
