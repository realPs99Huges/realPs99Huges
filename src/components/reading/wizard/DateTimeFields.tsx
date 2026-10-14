import { useEffect, useMemo, useRef, useState } from 'react';
import { parseDate, parseTime } from '../../../lib/astro/sky';
import { todayIso } from '../../../lib/reading/validation';
import { Icon } from '../../ui/Icon';

const pad = (n: number | string) => String(n).padStart(2, '0');
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Splits free typing into fixed segments ("14101994" → "14.10.1994", "6:5" stays as typed). */
function maskSegments(raw: string, limits: number[], separator: string, accepted: RegExp): string {
  const segments = limits.map(() => '');
  let index = 0;
  for (const char of raw) {
    if (/\d/.test(char)) {
      if (segments[index].length >= limits[index]) {
        if (index === limits.length - 1) continue;
        index++;
      }
      segments[index] += char;
    } else if (accepted.test(char) && segments[index].length > 0 && index < limits.length - 1) {
      index++;
    }
  }
  let out = segments[0];
  for (let i = 1; i <= index; i++) out += separator + segments[i];
  return out;
}

export function isoToGerman(value: string): string {
  const match = ISO.exec(value);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
}

function germanToIso(text: string): string | null {
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text);
  if (!match) return null;
  const iso = `${match[3]}-${pad(match[2])}-${pad(match[1])}`;
  return parseDate(iso) ? iso : null;
}

interface DateFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
  invalid?: boolean;
  describedBy?: string;
}

const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];
const WEEKDAY_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function DateField({ id, value, onChange, onComplete, invalid, describedBy }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const display = isoToGerman(value);

  const handleText = (raw: string) => {
    if (ISO.test(raw.trim())) {
      onChange(raw.trim());
      onComplete?.();
      return;
    }
    const masked = maskSegments(raw, [2, 2, 4], '.', /[.,/\- ]/);
    const iso = germanToIso(masked);
    onChange(iso ?? masked);
    if (iso && !ISO.test(value)) onComplete?.();
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  return (
    <div className="datefield" ref={wrapRef}>
      <input
        id={id}
        className="input input--mono"
        type="text"
        inputMode="numeric"
        autoComplete="bday"
        placeholder="TT.MM.JJJJ"
        maxLength={10}
        value={display}
        onChange={(event) => handleText(event.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        required
      />
      <button
        ref={toggleRef}
        type="button"
        className="datefield__toggle"
        aria-label={open ? 'Kalender schließen' : 'Kalender öffnen'}
        aria-expanded={open}
        aria-controls={`${id}-calendar`}
        onClick={() => setOpen((state) => !state)}
      >
        <Icon name="calendar" size={18} />
      </button>
      {open && (
        <Calendar
          id={`${id}-calendar`}
          value={ISO.test(value) ? value : null}
          onSelect={(iso) => {
            onChange(iso);
            setOpen(false);
            onComplete?.();
          }}
          onClose={() => {
            setOpen(false);
            toggleRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}

interface CalendarProps {
  id: string;
  value: string | null;
  onSelect: (iso: string) => void;
  onClose: () => void;
}

function Calendar({ id, value, onSelect, onClose }: CalendarProps) {
  const today = todayIso();
  const thisYear = Number(today.slice(0, 4));
  const initial = value ? parseDate(value) : null;
  const [year, setYear] = useState(initial?.year ?? thisYear - 30);
  const [month, setMonth] = useState(initial?.month ?? 1);
  const gridRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const first = new Date(Date.UTC(year, month - 1, 1));
    const offset = (first.getUTCDay() + 6) % 7; // Monday first
    const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return { offset, count };
  }, [year, month]);

  useEffect(() => {
    const target =
      gridRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]') ??
      gridRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
    target?.focus({ preventScroll: true });
    // Only when the calendar opens.
  }, []);

  const shift = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y--;
    } else if (m > 12) {
      m = 1;
      y++;
    }
    if (y < 1900 || y > thisYear) return;
    setMonth(m);
    setYear(y);
  };

  const years = useMemo(() => Array.from({ length: thisYear - 1899 }, (_, i) => thisYear - i), [thisYear]);

  return (
    <div
      id={id}
      className="calendar"
      role="dialog"
      aria-label="Geburtsdatum wählen"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="calendar__head">
        <button type="button" className="calendar__nav" onClick={() => shift(-1)} aria-label="Vorheriger Monat">
          <Icon name="arrowLeft" size={16} />
        </button>
        <select aria-label="Monat" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
          {MONTHS.map((name, index) => (
            <option key={name} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
        <select aria-label="Jahr" value={year} onChange={(event) => setYear(Number(event.target.value))}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button type="button" className="calendar__nav" onClick={() => shift(1)} aria-label="Nächster Monat">
          <Icon name="arrowRight" size={16} />
        </button>
      </div>
      <div className="calendar__weekdays" aria-hidden="true">
        {WEEKDAY_SHORT.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="calendar__grid" ref={gridRef}>
        {Array.from({ length: days.offset }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: days.count }, (_, i) => {
          const day = i + 1;
          const iso = `${year}-${pad(month)}-${pad(day)}`;
          return (
            <button
              key={iso}
              type="button"
              className={`calendar__day ${iso === today ? 'is-today' : ''}`}
              aria-pressed={iso === value}
              aria-label={`${day}. ${MONTHS[month - 1]} ${year}`}
              disabled={iso > today}
              onClick={() => onSelect(iso)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TimeFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

export function TimeField({ id, value, onChange, onComplete, disabled, invalid, describedBy }: TimeFieldProps) {
  const handleText = (raw: string) => {
    const masked = maskSegments(raw, [2, 2], ':', /[:.,h ]/);
    const match = /^(\d{1,2}):(\d{2})$/.exec(masked);
    const normalized = match ? `${pad(match[1])}:${match[2]}` : masked;
    const complete = !!match && !!parseTime(normalized);
    onChange(complete ? normalized : masked);
    if (complete && !parseTime(value)) onComplete?.();
  };

  return (
    <input
      id={id}
      className="input input--mono"
      type="text"
      inputMode="numeric"
      placeholder="HH:MM"
      maxLength={5}
      value={value}
      disabled={disabled}
      onChange={(event) => handleText(event.target.value)}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
    />
  );
}
