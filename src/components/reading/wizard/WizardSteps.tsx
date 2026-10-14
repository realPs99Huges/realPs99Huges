import { useMemo, useState } from 'react';
import type { SunPosition } from '../../../lib/astro/sky';
import { ELEMENTS, formatSignRange, getSign, ZODIAC } from '../../../lib/astro/zodiac';
import { findPlace, formatCoordinates } from '../../../lib/geo/places';
import type { ReadingInput } from '../../../lib/reading/types';
import { LIMITS, type ReadingField, type ValidationErrors } from '../../../lib/reading/validation';
import { Glyph } from '../../cosmos/Glyph';
import { Icon } from '../../ui/Icon';
import { DateField, TimeField } from './DateTimeFields';
import { Checkbox, describedBy, FieldShell, TextArea, TextInput } from './fields';
import { formatLongDate } from './format';

type SetField = <K extends keyof ReadingInput>(field: K, value: ReadingInput[K]) => void;

interface StepProps {
  input: ReadingInput;
  errors: ValidationErrors;
  setField: SetField;
}

const focus = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus());

function PlaceHint({ value }: { value: string }) {
  const place = useMemo(() => findPlace(value), [value]);
  if (value.trim().length < 2) return <>Stadt und Land, z. B. „Hamburg, Deutschland“.</>;
  if (!place) return <>Nicht im Offline-Atlas – kein Problem, der Ort erscheint dann mit Namen.</>;
  return (
    <span className="field__found">
      <Icon name="pin" size={13} />
      {place.precision === 'city' ? 'Gefunden' : 'Landesmitte'} · {formatCoordinates(place)}
    </span>
  );
}

export function StepBirth({ input, errors, setField }: StepProps) {
  return (
    <div className="fields">
      <div className="fields__row">
        <FieldShell
          id="field-birthDate"
          label="Geburtsdatum"
          error={errors.birthDate}
          hint="Eintippen (z. B. 14101994) oder Kalender öffnen."
        >
          <DateField
            id="field-birthDate"
            value={input.birthDate}
            onChange={(value) => setField('birthDate', value)}
            onComplete={() => !input.birthTimeUnknown && focus('field-birthTime')}
            invalid={!!errors.birthDate}
            describedBy={describedBy('field-birthDate', errors.birthDate, true)}
          />
        </FieldShell>

        <FieldShell
          id="field-birthTime"
          label="Uhrzeit"
          error={errors.birthTime}
          hint={
            input.birthTimeUnknown ? 'Kein Problem – die Deutung passt sich an.' : 'So genau du sie weißt, z. B. 0642.'
          }
        >
          <TimeField
            id="field-birthTime"
            value={input.birthTime}
            onChange={(value) => setField('birthTime', value)}
            onComplete={() => focus('field-birthplace')}
            disabled={input.birthTimeUnknown}
            invalid={!!errors.birthTime}
            describedBy={describedBy('field-birthTime', errors.birthTime, true)}
          />
        </FieldShell>
      </div>

      <Checkbox
        id="field-birthTimeUnknown"
        checked={input.birthTimeUnknown}
        onChange={(checked) => setField('birthTimeUnknown', checked)}
      >
        Uhrzeit unbekannt
      </Checkbox>

      <FieldShell
        id="field-birthplace"
        label="Geburtsort"
        error={errors.birthplace}
        hint={<PlaceHint value={input.birthplace} />}
      >
        <TextInput
          id="field-birthplace"
          type="text"
          list="astra-places"
          placeholder="Stadt, Land"
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
          <p className="label label--gold">{isSuggested ? 'Aus deinem Geburtsdatum berechnet' : 'Von dir gewählt'}</p>
          <p className="sign-card__name">
            {sign.name} <em>{sign.image}</em>
          </p>
          <p className="sign-card__meta">
            {formatSignRange(sign)} · {ELEMENTS[sign.element].name}
            {suggestion && isSuggested && <> · Sonne bei {Math.floor(suggestion.degree)}°</>}
          </p>
          {suggestion?.cuspWith && isSuggested && (
            <p className="sign-card__note">
              Du bist an der Grenze zu {suggestion.cuspWith.name} geboren. Wähle das Zeichen, das besser passt.
            </p>
          )}
          {suggestion && !isSuggested && (
            <button type="button" className="btn btn--text sign-card__reset" onClick={onAcceptSuggestion}>
              Berechnetes Zeichen nehmen – {suggestion.sign.name}
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
          {chooserOpen ? 'Ausblenden' : 'Anderes wählen'}
        </button>
      </div>

      <fieldset id="sign-chooser" className="sign-grid" hidden={!chooserOpen}>
        <legend className="sr-only">Dein Sternzeichen</legend>
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
        label="Wo lebst du heute?"
        optional
        error={errors.residence}
        hint="Ergänzt deine Karte um einen zweiten Punkt."
      >
        <TextInput
          id="field-residence"
          type="text"
          list="astra-places"
          placeholder="Stadt, Land"
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
        label="Was möchtest du über dich verstehen?"
        optional
        error={errors.intention}
        hint="Ein Satz genügt. Er formt deine Reflexionsfragen."
        aside={
          <span className="field__count" aria-hidden="true">
            {input.intention.length}/{LIMITS.intentionMax}
          </span>
        }
      >
        <TextArea
          id="field-intention"
          rows={3}
          placeholder="z. B. Was treibt mich wirklich an – und wohin will ich als Nächstes?"
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
    { label: 'Geboren', value: formatLongDate(input.birthDate), step: 0, field: 'birthDate' },
    {
      label: 'Uhrzeit',
      value: input.birthTimeUnknown ? 'Unbekannt' : `${input.birthTime} Uhr`,
      detail: input.birthTimeUnknown ? 'Die Deutung passt sich an' : undefined,
      step: 0,
      field: input.birthTimeUnknown ? 'birthTimeUnknown' : 'birthTime',
    },
    {
      label: 'Geburtsort',
      value: input.birthplace.trim(),
      detail: place ? formatCoordinates(place) : 'Erscheint mit Namen',
      step: 0,
      field: 'birthplace',
    },
    {
      label: 'Sternzeichen',
      value: sign.name,
      detail: suggestion?.sign.id === sign.id ? 'Berechnet' : 'Von dir gewählt',
      step: 1,
      field: 'sign',
    },
    { label: 'Wohnort', value: input.residence.trim() || '—', step: 1, field: 'residence' },
    {
      label: 'Deine Frage',
      value: input.intention.trim() ? `„${input.intention.trim()}“` : '—',
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
              <span className="sr-only">{row.label} bearbeiten</span>
            </button>
          </div>
        ))}
      </dl>
      <p className="reveal-card__note">
        <Icon name="shield" size={15} />
        Deine Deutung ist eine symbolische Interpretation, erstellt in deinem Browser. Sie analysiert weder DNA noch
        Abstammung oder Zukunft – und nichts wird gespeichert.
      </p>
    </div>
  );
}
