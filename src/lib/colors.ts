// Financial Observatory color palette

export const COLORS = {
  // Base
  bgDeep: '#0a0f1e',
  bgElevated: '#111827',
  bgCard: '#1a2236',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',

  // Buyer path (warm)
  buyer: '#f59e0b',
  buyerLight: '#fbbf24',
  buyerDim: 'rgba(245, 158, 11, 0.2)',
  buyerGlow: 'rgba(245, 158, 11, 0.4)',

  // Renter path (cool)
  renter: '#06b6d4',
  renterLight: '#22d3ee',
  renterDim: 'rgba(6, 182, 212, 0.2)',
  renterGlow: 'rgba(6, 182, 212, 0.4)',

  // Gains / Losses
  gain: '#10b981',
  gainDim: 'rgba(16, 185, 129, 0.2)',
  loss: '#ef4444',
  lossDim: 'rgba(239, 68, 68, 0.2)',

  // Heatmap thermal scale (green → yellow → red)
  heatmapGood: '#10b981',
  heatmapMid: '#f59e0b',
  heatmapBad: '#ef4444',
  heatmapNever: '#6b7280',

  // Text
  textPrimary: '#f3f4f6',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',

  // Monte Carlo percentile bands
  mc90: 'rgba(245, 158, 11, 0.1)',
  mc75: 'rgba(245, 158, 11, 0.2)',
  mc50: '#f59e0b',
  mc25: 'rgba(6, 182, 212, 0.2)',
  mc10: 'rgba(6, 182, 212, 0.1)',
} as const;

// Recharts-compatible color arrays
export const WEALTH_CHART_COLORS = [COLORS.buyer, COLORS.renter];

export const HEATMAP_SCALE = [
  COLORS.heatmapGood,
  '#22c55e',
  '#84cc16',
  COLORS.heatmapMid,
  '#f97316',
  COLORS.heatmapBad,
  COLORS.heatmapNever,
];
