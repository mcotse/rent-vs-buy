import { useState, useCallback, useRef } from 'react';
import { formatCurrency } from '@/lib/format';

interface CurrencyInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export function CurrencyInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: CurrencyInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rawValue, setRawValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => {
    setIsEditing(true);
    setRawValue(String(value));
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    const parsed = parseFloat(rawValue);
    if (!isNaN(parsed)) {
      // Clamp to range and snap to step
      const clamped = Math.min(max, Math.max(min, parsed));
      const snapped = Math.round(clamped / step) * step;
      onChange(snapped);
    }
  }, [rawValue, min, max, step, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRawValue(e.target.value);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        inputRef.current?.blur();
      } else if (e.key === 'Escape') {
        setRawValue(String(value));
        setIsEditing(false);
      }
    },
    [value],
  );

  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>
      <input
        ref={inputRef}
        type={isEditing ? 'number' : 'text'}
        value={isEditing ? rawValue : formatCurrency(value)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs tabular-nums text-gray-100 outline-none transition-all placeholder:text-gray-500 focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/30"
      />
    </div>
  );
}
