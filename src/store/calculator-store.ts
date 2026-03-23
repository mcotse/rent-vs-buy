import { create } from 'zustand';
import type {
  CalculatorParams,
  SimulationResult,
  MonteCarloResult,
  SensitivityVariable,
} from '@/engine/types';
import { DEFAULT_PARAMS } from '@/engine/defaults';

export interface CalculatorStore {
  // All calculator parameters
  params: CalculatorParams;
  setParam: <K extends keyof CalculatorParams>(key: K, value: CalculatorParams[K]) => void;
  resetParams: () => void;

  // Computed results (updated via hooks)
  simulationResult: SimulationResult | null;
  setSimulationResult: (result: SimulationResult | null) => void;

  monteCarloResult: MonteCarloResult | null;
  setMonteCarloResult: (result: MonteCarloResult | null) => void;
  monteCarloProgress: number;
  setMonteCarloProgress: (progress: number) => void;

  // UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedMonteCarloYear: number;
  setSelectedMonteCarloYear: (year: number) => void;
  sensitivityRowVar: SensitivityVariable;
  sensitivityColVar: SensitivityVariable;
  setSensitivityVars: (row: SensitivityVariable, col: SensitivityVariable) => void;
}

export const useCalculatorStore = create<CalculatorStore>((set) => ({
  // Parameters
  params: { ...DEFAULT_PARAMS },
  setParam: (key, value) =>
    set((state) => ({
      params: { ...state.params, [key]: value },
    })),
  resetParams: () => set({ params: { ...DEFAULT_PARAMS } }),

  // Simulation results
  simulationResult: null,
  setSimulationResult: (result) => set({ simulationResult: result }),

  // Monte Carlo results
  monteCarloResult: null,
  setMonteCarloResult: (result) => set({ monteCarloResult: result }),
  monteCarloProgress: 0,
  setMonteCarloProgress: (progress) => set({ monteCarloProgress: progress }),

  // UI state
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedMonteCarloYear: 10,
  setSelectedMonteCarloYear: (year) => set({ selectedMonteCarloYear: year }),
  sensitivityRowVar: 'homeAppreciation',
  sensitivityColVar: 'spReturn',
  setSensitivityVars: (row, col) =>
    set({ sensitivityRowVar: row, sensitivityColVar: col }),
}));
