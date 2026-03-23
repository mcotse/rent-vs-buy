import { useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: 'currency' | 'percent' | 'number' | 'year';
  onChange: (value: number) => void;
}

function formatValue(value: number, format: SliderInputProps['format']): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percent':
      return formatPercent(value, value < 0.01 ? 2 : 1);
    case 'number':
      return formatNumber(value);
    case 'year':
      return `Year ${value}`;
    default:
      return String(value);
  }
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: SliderInputProps) {
  const handleChange = useCallback(
    (newValue: number | number[]) => {
      const v = Array.isArray(newValue) ? newValue[0] : newValue;
      onChange(v);
    },
    [onChange],
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-medium tabular-nums text-gray-100">
          {formatValue(value, format)}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleChange}
        className="[&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-white/[0.08] [&_[data-slot=slider-range]]:bg-amber-500/70 [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-amber-500/60 [&_[data-slot=slider-thumb]]:bg-amber-500 [&_[data-slot=slider-thumb]]:hover:ring-amber-500/30"
      />
    </div>
  );
}
