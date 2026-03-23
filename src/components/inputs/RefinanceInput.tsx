import { motion, AnimatePresence } from 'framer-motion';
import { ToggleInput } from './ToggleInput';
import { SliderInput } from './SliderInput';
import { PARAM_RANGES } from '@/engine/defaults';
import { useCalculatorStore } from '@/store/calculator-store';

export function RefinanceInput() {
  const params = useCalculatorStore((s) => s.params);
  const setParam = useCalculatorStore((s) => s.setParam);

  const refinanceYearRange = PARAM_RANGES.refinanceYear;
  const refinanceRateRange = PARAM_RANGES.refinanceRate;

  return (
    <div className="space-y-2">
      <ToggleInput
        label="Enable Refinance"
        checked={params.refinanceEnabled}
        onChange={(checked) => setParam('refinanceEnabled', checked)}
      />
      <AnimatePresence initial={false}>
        {params.refinanceEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              <SliderInput
                label={refinanceYearRange.label}
                value={params.refinanceYear}
                min={refinanceYearRange.min}
                max={refinanceYearRange.max}
                step={refinanceYearRange.step}
                format={refinanceYearRange.format}
                onChange={(v) => setParam('refinanceYear', v)}
              />
              <SliderInput
                label={refinanceRateRange.label}
                value={params.refinanceRate}
                min={refinanceRateRange.min}
                max={refinanceRateRange.max}
                step={refinanceRateRange.step}
                format={refinanceRateRange.format}
                onChange={(v) => setParam('refinanceRate', v)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
