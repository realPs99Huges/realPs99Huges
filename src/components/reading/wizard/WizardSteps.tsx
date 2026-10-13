import { useMemo, useState } from 'react';
import type { SunPosition } from '../../../lib/astro/sky';
import { ELEMENTS, formatSignRange, getSign, ZODIAC } from '../../../lib/astro/zodiac';
import { findPlace, formatCoordinates } from '../../../lib/geo/places';
import type { ReadingInput } from '../../../lib/reading/types';
import { LIMITS, todayIso, type ReadingField, type ValidationErrors } from '../../../lib/reading/validation';
import { Glyph } from '../../cosmos/Glyph';
import { Icon } from '../../ui/Icon';
import { Checkbox, describedBy, FieldShell, TextArea, TextInput } from './fields';
import { formatLongDate } from './format';

type SetField = <K extends keyof ReadingInput>(field: K, value: ReadingInput[K]) => void;

interface StepProps {
  input: ReadingInput;
  errors: ValidationErrors;
  setField: SetField;
}

function PlaceHint({ value }: { value: string }) {
  const place = useMemo(() => findPlace(value), [value]);
  if (value.trim().length < 2) return <>City and country, e.g. “Lisbon, Portugal”. Typed freely — no lookup service.</>;
  if (!place) return <>Not in ASTRA’s small offline atlas — that’s fine, it will appear by name.</>;
  return (
    <span className="field__found">
      <Icon name="pin" size={13} />
      {place.precision === 'city' ? 'Found in offline atlas' : 'Country centre'} · {formatCoordinates(place)}
    </span>
  );
}

export function StepBirth({ input, errors, setField }: StepProps) {
  const timeHint = input.birthTimeUnknown
    ? 'No problem — the reading will leave the symbolism of the hour open.'
    : 'As exact as you know it. Local time at the place of birth.';
  return (
    <div className="fields">
      <div className="fields__row">
        <FieldShell
          id="field-birthDate"
          label="Date of Birth"
          error={errors.birthDate}
          hint="Pick it from the calendar or type it in."
        >
          <TextInput
            id="field-birthDate"
            type="date"
            min="1900-01-01"
            max={todayIso()}
            value={input.birthDate}
            onChange={(event) => setField('birthDate', event.target.value)}
            invalid={!!errors.birthDate}
            aria-describedby={describedBy('field-birthDate', errors.birthDate, true)}
            required
            autoComplete="bday"
          />
        </FieldShell>

        <FieldShell id="field-birthTime" label="Time of Birth" error={errors.birthTime} hint={timeHint}>
          <TextInput
            id="field-birthTime"
            type="time"
            value={input.birthTime}
            onChange={(event) => setField('birthTime', event.target.value)}
            disabled={input.birthTimeUnknown}
            invalid={!!errors.birthTime}
            aria-describedby={describedBy('field-birthTime', errors.birthTime, true)}
            required={!input.birthTimeUnknown}
          />
        </FieldShell>
      </div>

      <Checkbox
        id="field-birthTimeUnknown"
        checked={input.birthTimeUnknown}
        onChange={(checked) => setField('birthTimeUnknown', checked)}
      >
        I don’t know my exact birth time
      </Checkbox>

      <FieldShell
        id="field-birthplace"
        label="Birthplace"
        error={errors.birthplace}
        hint={<PlaceHint value={input.birthplace} />}
      >
        <TextInput
          id="field-birthplace"
          type="text"
          list="astra-places"
          placeholder="City, country"
          value={input.birthplace}
          maxLength={LIMITS.placeMax}
          onChange={(event) => setField('birthplace', event.target.value)}
          invalid={!!errors.birthplace}
          aria-describedby={describedBy('field-birthplace', errors.birthplace, true)}
          autoComplete="off"
          spellCheck={false}
          required
        />
      </FieldShell>
    </div>
  );
}

interface IdentityProps extends StepProps {
  suggestion: SunPosition | null;
  onAcceptSuggestion: () => void;
}

export function StepIdentity({ input, errors, setField, suggestion, onAcceptSuggestion }: IdentityProps) {
  const sign = getSign(input.sign);
  const isSuggested = suggestion?.sign.id === sign.id;
  const [chooserOpen, setChooserOpen] = useState(!isSuggested);

  return (
    <div className="fields">
      <div className="sign-card">
        <div className="sign-card__glyph" aria-hidden="true">
          <Glyph id={sign.id} size={52} strokeWidth={1} key={sign.id} />
        </div>
        <div className="sign-card__body">
          <p className="label label--gold">{isSuggested ? 'Suggested from your birth date' : 'Chosen by you'}</p>
          <p className="sign-card__name">
            {sign.name} <em>{sign.image}</em>
          </p>
          <p className="sign-card__meta">
            {formatSignRange(sign)} · {ELEMENTS[sign.element].name}
            {suggestion && isSuggested && <> · Sun at {Math.floor(suggestion.degree)}°</>}
          </p>
          {suggestion?.cuspWith && isSuggested && (
            <p className="sign-card__note">
              You were born on the cusp of {suggestion.cuspWith.name}. Choose the sign that resonates most.
            </p>
          )}
          {suggestion && !isSuggested && (
            <button type="button" className="btn btn--text sign-card__reset" onClick={onAcceptSuggestion}>
              Use the suggested sign — {suggestion.sign.name}
            </button>
          )}
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--sm sign-card__toggle"
          aria-expanded={chooserOpen}
          aria-controls="sign-chooser"
          onClick={() => setChooserOpen((open) => !open)}
        >
          {chooserOpen ? 'Hide signs' : 'Choose another'}
        </button>
      </div>

      <fieldset id="sign-chooser" className="sign-grid" hidden={!chooserOpen}>
        <legend className="sr-only">Your sign</legend>
        {ZODIAC.map((s) => (
          <label key={s.id} className="sign-grid__option">
            <input
              type="radio"
              name="sign"
              value={s.id}
              checked={input.sign === s.id}
              onChange={() => setField('sign', s.id)}
            />
            <span className="sign-grid__tile">
              <Glyph id={s.id} size={22} strokeWidth={1.3} />
              <span>{s.name}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <FieldShell
        id="field-residence"
        label="Where do you live now?"
        optional
        error={errors.residence}
        hint="Adds a second point to your origins map."
      >
        <TextInput
          id="field-residence"
          type="text"
          list="astra-places"
          placeholder="City, country"
          value={input.residence}
          maxLength={LIMITS.placeMax}
          onChange={(event) => setField('residence', event.target.value)}
          invalid={!!errors.residence}
          aria-describedby={describedBy('field-residence', errors.residence, true)}
          autoComplete="off"
          spellCheck={false}
        />
      </FieldShell>

      <FieldShell
        id="field-intention"
        label="What would you like to understand about yourself?"
        optional
        error={errors.intention}
        hint="A sentence is enough. It shapes your reflection questions."
        aside={
          <span className="field__count" aria-hidden="true">
            {input.intention.length}/{LIMITS.intentionMax}
          </span>
        }
      >
        <TextArea
          id="field-intention"
          rows={3}
          placeholder="e.g. What really motivates me — and where do I want to go next?"
          value={input.intention}
          maxLength={LIMITS.intentionMax}
          onChange={(event) => setField('intention', event.target.value)}
          invalid={!!errors.intention}
          aria-describedby={describedBy('field-intention', errors.intention, true)}
        />
      </FieldShell>
    </div>
  );
}

interface RevealProps {
  input: ReadingInput;
  suggestion: SunPosition | null;
  onEdit: (step: number, field: ReadingField) => void;
}

export function StepReveal({ input, suggestion, onEdit }: RevealProps) {
  const sign = getSign(input.sign);
  const place = findPlace(input.birthplace);
  const rows: Array<{ label: string; value: string; detail?: string; step: number; field: ReadingField }> = [
    { label: 'Born', value: formatLongDate(input.birthDate), step: 0, field: 'birthDate' },
    {
      label: 'Hour',
      value: input.birthTimeUnknown ? 'Unknown' : input.birthTime,
      detail: input.birthTimeUnknown ? 'The reading adapts' : undefined,
      step: 0,
      field: input.birthTimeUnknown ? 'birthTimeUnknown' : 'birthTime',
    },
    {
      label: 'Birthplace',
      value: input.birthplace.trim(),
      detail: place ? formatCoordinates(place) : 'Shown by name',
      step: 0,
      field: 'birthplace',
    },
    {
      label: 'Sign',
      value: `${sign.name} · ${sign.image}`,
      detail: suggestion?.sign.id === sign.id ? 'Suggested' : 'Chosen by you',
      step: 1,
      field: 'sign',
    },
    { label: 'Lives in', value: input.residence.trim() || '—', step: 1, field: 'residence' },
    {
      label: 'Your question',
      value: input.intention.trim() ? `“${input.intention.trim()}”` : '—',
      step: 1,
      field: 'intention',
    },
  ];

  return (
    <div className="reveal-card">
      <div className="reveal-card__seal" aria-hidden="true">
        <Glyph id={sign.id} size={30} strokeWidth={1.1} />
      </div>
      <dl className="reveal-card__list">
        {rows.map((row) => (
          <div className="reveal-card__row" key={row.label}>
            <dt className="label">{row.label}</dt>
            <dd>
              <span className="reveal-card__value">{row.value}</span>
              {row.detail && <span className="reveal-card__detail">{row.detail}</span>}
            </dd>
            <button type="button" className="reveal-card__edit" onClick={() => onEdit(row.step, row.field)}>
              <Icon name="edit" size={15} />
              <span className="sr-only">Edit {row.label.toLowerCase()}</span>
            </button>
          </div>
        ))}
      </dl>
      <p className="reveal-card__note">
        <Icon name="shield" size={15} />
        Your reading is a symbolic interpretation created locally in your browser. It does not analyse DNA, ancestry or
        the future — and nothing you entered is stored.
      </p>
    </div>
  );
}
