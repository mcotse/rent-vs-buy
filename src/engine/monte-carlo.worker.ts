/**
 * Web Worker entry point for Monte Carlo simulation.
 * Runs the simulation off the main thread with progress reporting.
 */

import type {
  MonteCarloWorkerRequest,
  MonteCarloWorkerResponse,
} from './types';
import { runMonteCarlo } from './monte-carlo';

// Web Worker global scope — use minimal interface to avoid needing the webworker lib
const workerSelf = self as unknown as {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: (message: unknown) => void;
};

workerSelf.onmessage = (event: MessageEvent<MonteCarloWorkerRequest>) => {
  const { params, constants, numSimulations } = event.data;

  const result = runMonteCarlo(
    params,
    constants,
    numSimulations,
    (completed: number, total: number) => {
      const progressMessage: MonteCarloWorkerResponse = {
        type: 'progress',
        completed,
        total,
      };
      workerSelf.postMessage(progressMessage);
    }
  );

  const completeMessage: MonteCarloWorkerResponse = {
    type: 'complete',
    result,
  };
  workerSelf.postMessage(completeMessage);
};
