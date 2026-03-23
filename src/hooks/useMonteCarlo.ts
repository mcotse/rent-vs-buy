import { useEffect, useRef } from 'react';
import { useCalculatorStore } from '@/store/calculator-store';
import { useDebounce } from './useDebounce';
import { FIXED_CONSTANTS } from '@/engine/defaults';
import type { MonteCarloWorkerRequest, MonteCarloWorkerResponse } from '@/engine/types';

const NUM_SIMULATIONS = 2000;

/**
 * Manages Web Worker lifecycle for Monte Carlo simulations.
 * - Creates worker on mount, terminates on unmount
 * - Triggers new simulation when params change (debounced 500ms)
 * - Reports progress to store
 * - Updates store with MonteCarloResult on completion
 */
export function useMonteCarlo() {
  const params = useCalculatorStore((s) => s.params);
  const setMonteCarloResult = useCalculatorStore((s) => s.setMonteCarloResult);
  const setMonteCarloProgress = useCalculatorStore((s) => s.setMonteCarloProgress);

  const debouncedParams = useDebounce(params, 500);
  const workerRef = useRef<Worker | null>(null);

  // Create and manage worker
  useEffect(() => {
    let worker: Worker;
    try {
      worker = new Worker(
        new URL('@/engine/monte-carlo.worker.ts', import.meta.url),
        { type: 'module' },
      );
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent<MonteCarloWorkerResponse>) => {
        const data = event.data;
        if (data.type === 'progress') {
          const pct = Math.round((data.completed / data.total) * 100);
          setMonteCarloProgress(pct);
        } else if (data.type === 'complete') {
          setMonteCarloResult(data.result);
          setMonteCarloProgress(100);
        }
      };

      worker.onerror = (err) => {
        console.debug('[useMonteCarlo] Worker error:', err);
      };
    } catch (err) {
      // Worker file not yet available
      console.debug('[useMonteCarlo] Worker not ready:', err);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [setMonteCarloResult, setMonteCarloProgress]);

  // Trigger simulation when params change
  useEffect(() => {
    if (!workerRef.current) return;

    setMonteCarloProgress(0);
    setMonteCarloResult(null);

    const request: MonteCarloWorkerRequest = {
      params: debouncedParams,
      constants: FIXED_CONSTANTS,
      numSimulations: NUM_SIMULATIONS,
    };

    workerRef.current.postMessage(request);
  }, [debouncedParams, setMonteCarloProgress, setMonteCarloResult]);
}
