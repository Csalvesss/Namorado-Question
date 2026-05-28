import type { InputHTMLAttributes, ReactNode } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  readonlyValue?: ReactNode;
}

export default function Field({
  label,
  hint,
  readonlyValue,
  id,
  className = '',
  ...inputProps
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block font-display text-[11px] uppercase tracking-[0.22em] text-mute"
      >
        {label}
      </label>
      {readonlyValue !== undefined ? (
        <div className="font-body text-base text-txt">{readonlyValue}</div>
      ) : (
        <input id={id} className={`input-elegant ${className}`} {...inputProps} />
      )}
      {hint && <p className="font-body text-[12px] italic text-mute">{hint}</p>}
    </div>
  );
}
