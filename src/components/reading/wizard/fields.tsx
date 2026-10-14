import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { Icon } from '../../ui/Icon';

interface FieldShellProps {
  id: string;
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  aside?: ReactNode;
}

export function FieldShell({ id, label, optional, hint, error, children, aside }: FieldShellProps) {
  return (
    <div className="field" data-invalid={error ? 'true' : undefined}>
      <div className="field__head">
        <label className="field__label" htmlFor={id}>
          {label}
          {optional && <span className="field__optional">Optional</span>}
        </label>
        {aside}
      </div>
      <div className="field__control">{children}</div>
      {error ? (
        <p className="field__error" id={`${id}-error`}>
          <Icon name="info" size={14} />
          {error}
        </p>
      ) : (
        hint && (
          <p className="field__hint" id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: ReactNode) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function TextInput({ invalid, className = '', ...rest }: InputProps) {
  return <input className={`input ${className}`} aria-invalid={invalid || undefined} {...rest} />;
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function TextArea({ invalid, className = '', ...rest }: TextareaProps) {
  return <textarea className={`input input--area ${className}`} aria-invalid={invalid || undefined} {...rest} />;
}

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}

export function Checkbox({ id, checked, onChange, children }: CheckboxProps) {
  return (
    <label className="checkbox" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="checkbox__input"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="checkbox__box" aria-hidden="true">
        <Icon name="check" size={13} strokeWidth={2} />
      </span>
      <span className="checkbox__label">{children}</span>
    </label>
  );
}
