import { useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { formatPercent } from '@/lib/format';

interface PercentInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export function PercentInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: PercentInputProps) {
  const handleChange = useCallback(
    (newValue: number | readonly number[]) => {
      const v = Array.isArray(newValue) ? newValue[0] : newValue;
      onChange(v);
    },
    [onChange],
  );

  // Show 2 decimal places for small percentages (e.g., rates < 1%)
  const decimals = step < 0.001 ? 2 : value < 0.01 ? 2 : 1;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-medium tabular-nums text-gray-100">
          {formatPercent(value, decimals)}
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
