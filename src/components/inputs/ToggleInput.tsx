import { Switch } from '@/components/ui/switch';

interface ToggleInputProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function ToggleInput({
  label,
  checked,
  onChange,
  description,
}: ToggleInputProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <div className="flex flex-col">
        <span className="text-xs text-gray-400">{label}</span>
        {description && (
          <span className="text-[10px] text-gray-500">{description}</span>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-checked:bg-amber-500 data-unchecked:bg-white/[0.12]"
        size="sm"
      />
    </div>
  );
}
