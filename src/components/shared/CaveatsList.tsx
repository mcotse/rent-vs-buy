'use client';

import { COLORS } from '@/lib/colors';

const CAVEATS = [
  'Uses constant annual rates (reality varies year-to-year)',
  'Tax brackets are 2025 estimates, may change',
  'Does not model unemployment, disability, or other income disruption',
  'Selling costs (6%) include SF transfer tax estimate',
  'Ignores emotional factors beyond the intangible premiums',
  'S&P return assumes reinvested dividends, pre-tax',
  'Renter portfolio assumes full investment of savings difference',
  'Does not model property tax reassessment (Prop 13)',
  'HOA growth rate may vary significantly by building',
  'Monte Carlo assumes log-normal returns, which may underestimate tail risk',
];

export default function CaveatsList() {
  return (
    <div
      className="rounded-xl border p-6"
      style={{
        backgroundColor: 'rgba(26, 34, 54, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderColor: COLORS.borderSubtle,
      }}
    >
      <h3
        className="mb-4 text-sm font-semibold uppercase tracking-wider"
        style={{ color: COLORS.textSecondary }}
      >
        Model Caveats &amp; Limitations
      </h3>
      <ul className="space-y-2">
        {CAVEATS.map((caveat, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS.textMuted }}
            />
            <span style={{ color: COLORS.textSecondary }}>{caveat}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
