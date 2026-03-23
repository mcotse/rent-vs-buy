import { useEffect } from 'react';
import { useCalculatorStore } from '@/store/calculator-store';
import { useDebounce } from './useDebounce';
import { FIXED_CONSTANTS } from '@/engine/defaults';

/**
 * Runs the deterministic simulation whenever params change (debounced 150ms).
 * Updates the store with SimulationResult.
 */
export function useSimulation() {
  const params = useCalculatorStore((s) => s.params);
  const setSimulationResult = useCalculatorStore((s) => s.setSimulationResult);

  const debouncedParams = useDebounce(params, 150);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const { runSimulation } = await import('@/engine/simulation');
        const result = runSimulation(debouncedParams, FIXED_CONSTANTS);
        if (!cancelled) {
          setSimulationResult(result);
        }
      } catch (err) {
        // Engine not yet available — silently ignore
        console.debug('[useSimulation] Engine not ready:', err);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [debouncedParams, setSimulationResult]);
}
