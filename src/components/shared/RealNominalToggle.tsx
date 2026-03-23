import { useCalculatorStore } from '@/store/calculator-store';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export function RealNominalToggle() {
  const showRealValues = useCalculatorStore((s) => s.params.showRealValues);
  const setParam = useCalculatorStore((s) => s.setParam);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-md border border-white/[0.08] bg-white/[0.03] p-0.5 text-[11px]">
        <button
          onClick={() => setParam('showRealValues', false)}
          className={`rounded px-2.5 py-1 font-medium transition-all ${
            !showRealValues
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Nominal
        </button>
        <button
          onClick={() => setParam('showRealValues', true)}
          className={`rounded px-2.5 py-1 font-medium transition-all ${
            showRealValues
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Real
        </button>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300" />
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="max-w-[200px]">
              <strong>Nominal</strong> shows future dollar amounts as-is.{' '}
              <strong>Real</strong> adjusts for inflation, showing values in
              today&apos;s purchasing power.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
