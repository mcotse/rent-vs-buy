# Rent vs. Buy Break-Even Calculator — Build Plan

## Design Direction: "Financial Observatory"

Dark, data-rich interface. Bloomberg Terminal precision meets editorial financial typography.

- **Base**: Deep navy (#0a0f1e) — not pure black
- **Buyer path**: Warm amber/gold (#f59e0b)
- **Renter path**: Cool cyan (#06b6d4)
- **Accent**: Coral for alerts/losses (#ef4444), emerald for gains (#10b981)
- **Display font**: Fraunces (serif, for headlines and hero metrics)
- **Body font**: DM Sans (geometric sans, for data and UI)
- **Cards**: Subtle glassmorphism, fine borders, dark elevated surfaces
- **Charts**: Luminous lines on dark backgrounds, glow effects on hover
- **Heatmap**: Thermal-image style — the visual centerpiece

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18+ with Vite |
| Styling | Tailwind CSS + shadcn/ui (dark theme) |
| Charts | Recharts (line, area, bar, heatmap via custom cells) |
| State | Zustand (lightweight, no boilerplate) |
| Monte Carlo | Web Worker (dedicated thread for 1000+ sims) |
| Fonts | Google Fonts: Fraunces + DM Sans |
| Animation | Framer Motion (page transitions, chart reveals) |
| Build | Vite + TypeScript |

---

## Architecture

```
src/
├── engine/                    # Pure TypeScript — zero React dependencies
│   ├── types.ts               # All interfaces and parameter types
│   ├── defaults.ts            # Default parameter values and ranges
│   ├── amortization.ts        # Mortgage amortization schedule
│   ├── tax.ts                 # Federal + CA tax bracket computation
│   ├── simulation.ts          # Month-by-month buyer/renter simulation
│   ├── monte-carlo.ts         # Correlated variable generation + runner
│   └── monte-carlo.worker.ts  # Web Worker entry point
│
├── store/
│   └── calculator-store.ts    # Zustand store: parameters → computed results
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx       # Overall layout: sidebar + main
│   │   ├── Sidebar.tsx        # Sticky sidebar with parameter groups
│   │   └── TabNav.tsx         # Tab navigation for output sections
│   │
│   ├── inputs/
│   │   ├── ParameterGroup.tsx # Collapsible group of related inputs
│   │   ├── SliderInput.tsx    # Labeled slider with value display
│   │   ├── CurrencyInput.tsx  # Dollar-formatted number input
│   │   ├── PercentInput.tsx   # Percentage input with slider
│   │   ├── ToggleInput.tsx    # Boolean toggle (refi, real/nominal, etc.)
│   │   └── RefinanceInput.tsx # Year + rate compound input
│   │
│   ├── tabs/
│   │   ├── OverviewTab.tsx    # Break-even result + wealth chart + buying advantage
│   │   ├── MonteCarloTab.tsx  # Fan chart + histogram + probability headline
│   │   ├── SensitivityTab.tsx # 2D heatmap grid
│   │   ├── EarlyExitTab.tsx   # Forced exit analysis + multi-year table
│   │   ├── CostDetailTab.tsx  # Monthly breakdown + intangibles
│   │   └── TaxSalaryTab.tsx   # Tax benefits detail + salary reference
│   │
│   ├── charts/
│   │   ├── WealthChart.tsx    # Buyer vs. renter wealth over 30 years
│   │   ├── AdvantageChart.tsx # (Buyer - Renter) with zero-crossing
│   │   ├── FanChart.tsx       # Monte Carlo percentile bands
│   │   ├── HistogramChart.tsx # Distribution at user-selected year
│   │   ├── HeatmapChart.tsx   # 2D sensitivity grid
│   │   └── EarlyExitChart.tsx # Bar comparison across exit years
│   │
│   └── shared/
│       ├── MetricCard.tsx     # Hero metric display (break-even year, etc.)
│       ├── ComparisonRow.tsx  # Side-by-side buyer vs. renter stat
│       ├── CaveatsList.tsx    # Model caveats and explanations
│       └── RealNominalToggle.tsx # Global toggle for inflation adjustment
│
├── hooks/
│   ├── useSimulation.ts       # Runs simulation when params change
│   ├── useMonteCarlo.ts       # Manages Web Worker lifecycle
│   └── useDebounce.ts         # Debounce slider changes
│
├── lib/
│   ├── format.ts              # Currency, percent, year formatters
│   └── colors.ts              # Chart color constants
│
├── App.tsx
├── main.tsx
└── index.css                  # Tailwind + custom properties + font imports
```

---

## Parameter Groups (Sidebar)

### Group 1: Property
- Home Price ($1.5M–$2.5M, step $25K, default $1.9M)
- Down Payment (10–40%, step 1%, default 20%)
- Mortgage Rate (5.0–8.0%, step 0.05%, default 6.45%)

### Group 2: Monthly Costs
- HOA / Month ($0–$2,500, step $50, default $1,500)
- HOA Growth Rate (0–10%/yr, step 0.5%, default 5%)
- Mello-Roos / Special Assessments ($0–$12,000/yr, step $500, default $4,000)

### Group 3: Renting
- Monthly Rent ($4,000–$15,000, step $100, default $8,500)
- Rent Growth (0–8%/yr, step 0.5%, default 2%)
- Rent Ceiling ($8,500–$20,000, step $500, default $12,000)
- Rent Floor ($2,000–$8,500, step $500, default $6,000)

### Group 4: Growth & Returns
- Home Appreciation (0–8%/yr, step 0.5%, default 3%)
- S&P Investment Return (4–12%/yr, step 0.5%, default 8%)
- Inflation Rate (0–6%/yr, step 0.5%, default 2.5%) — used for real/nominal toggle

### Group 5: Ownership Costs
- Maintenance (0–2%/yr of home value, step 0.1%, default 0.5%)
- Annual Improvement Budget ($0–$50K, step $1K, default $12K)
- Improvement Recoup Rate (30–100%, step 5%, default 65%)

### Group 6: Intangibles
- Ownership Freedom Premium ($0–$1,500/mo, step $50, default $400)
- Renter Flexibility Premium ($0–$1,500/mo, step $50, default $300)

### Group 7: Tax & Income
- Gross Household Income ($100K–$1M, step $10K, default $400K)
- Filing Status (MFJ / Single toggle, default MFJ)

### Group 8: Refinance (toggle to expand)
- Refinance Enabled (toggle, default off)
- Refinance Year (1–25, step 1, default 5)
- New Rate (3.0–7.0%, step 0.05%, default 5.0%)

### Group 9: Early Exit
- Forced Exit Year (1–10, step 1, default 3)

### Fixed Constants (shown in collapsible notes)
- Property Tax Rate: 1.183%
- Home Insurance: 0.12%/yr
- Closing Costs: 2.5%
- Selling Costs: 6% (includes SF transfer tax)
- Loan Term: 30 years
- PMI: Auto-triggers at <20% down (0.35% of loan/yr)
- MID Cap: $750K loan value
- Capital Gains Exclusion: $500K MFJ / $250K Single

---

## Tab Outputs

### Tab 1: Overview
- **Hero metrics**: Break-even year (with intangibles), pure financial break-even, or "Never within 30 years"
- **Wealth chart**: Buyer vs. renter wealth over 30 years (dual line chart, dark bg, luminous lines)
- **Advantage chart**: (Buyer − Renter) area chart crossing zero, shaded green above / red below
- **Snapshot cards**: Year 5 and Year 10 — buyer wealth, renter wealth, who wins, by how much, home value, rent at that point
- **Net intangible value**: (Ownership premium − Renter flexibility), direction, annual impact

### Tab 2: Monte Carlo
- **Headline**: "X% chance buying wins after Y years" (at 10-year mark)
- **Fan chart**: Median (buyer − renter) with 10th/25th/75th/90th percentile bands as shaded regions
- **Year selector**: Slider to pick a year (1–30)
- **Histogram**: At selected year, distribution of (buyer wealth − renter wealth). Color-coded: green bars where buying wins, red where renting wins.
- **Stats table**: Mean, median, std dev, P10, P90 at selected year

### Tab 3: Sensitivity
- **Heatmap**: Rows = home appreciation (0%–8%), Cols = S&P return (4%–12%), Cells = break-even year, color scale from green (early break-even) to red (never). User can swap axes to other variable pairs.
- **Current position marker**: Highlight the cell matching current parameter values

### Tab 4: Early Exit
- **Detail view** at the selected forced exit year:
  - Home value, selling costs (6%), remaining mortgage, walk-away equity
  - Net gain/loss vs. initial cash outlay (down payment + closing costs)
  - Renter portfolio value at same point
  - Winner and margin
- **Quick-view table**: Years 1, 2, 3, 5, 7, 10 — all metrics in a compact table
- **Bar chart**: Net gain/loss across exit years

### Tab 5: Cost Details
- **Monthly breakdown**: Itemized P&I, Property Tax, Insurance, HOA, Mello-Roos, Maintenance, Improvements. Each shows amount + % of total.
- **Total monthly cost** and **premium over rent**
- **Year selector**: Show how costs evolve (HOA escalation, rent growth) at different years
- **Tax benefit offset**: Monthly tax savings from MID + property tax deduction, reducing effective cost

### Tab 6: Tax & Salary
- **Tax benefits summary**: Annual MID savings, property tax deduction savings, projected capital gains exclusion at sale
- **Salary reference table**: 28% / 33% / 38% of gross thresholds — gross salary needed, and % of take-home at that salary
- **Income breakdown**: At current income input — federal tax, CA tax, FICA, take-home, housing % of take-home
- **Model explanation**: Brief descriptions of buyer path, renter path, intangibles, early exit
- **Caveats list**: All model limitations

---

## Financial Engine Specification

### simulation.ts — Core Month-by-Month Loop

```
For month = 1 to 360:

  BUYER:
    if month == 1:
      upfront = downPayment + closingCosts(2.5%)

    mortgagePayment = amortize(loanAmount, rate, 360) // or new rate if refi
    if refiEnabled && month == refiYear * 12:
      recalculate P&I with new rate on remaining balance

    propertyTax = homeValue * taxRate / 12
    insurance = homeValue * insuranceRate / 12
    hoa = baseHOA * (1 + hoaGrowthRate)^(year-1)  // escalates annually
    melloRoos = annualMelloRoos / 12
    maintenance = homeValue * maintenanceRate / 12
    improvements = annualImprovements / 12
    pmi = (downPaymentPct < 0.20 && loanBalance/homeValue > 0.80) ? loan * 0.0035 / 12 : 0

    totalBuyerCost = P&I + propertyTax + insurance + hoa + melloRoos + maintenance + improvements + pmi

    // Tax benefit (monthly estimate)
    deductibleInterest = min(interestPortion, interestPortion * (750000 / loanAmount))
    deductiblePropertyTax = min(propertyTax * 12, saltCap) / 12  // SALT cap
    taxSavings = (deductibleInterest + deductiblePropertyTax) * marginalRate / 12
    effectiveBuyerCost = totalBuyerCost - taxSavings

    // Home value appreciation (annual, applied monthly)
    homeValue *= (1 + appreciationRate)^(1/12)
    if month % 12 == 0:
      homeValue += annualImprovements * recoupRate  // improvement value add

    buyerWealth = homeValue - remainingBalance - (homeValue * sellingCostRate)
    // Capital gains exclusion at point of sale:
    gain = homeValue - purchasePrice
    taxableGain = max(0, gain - capGainsExclusion)
    capGainsTax = taxableGain * longTermCapGainsRate
    buyerWealthAfterTax = buyerWealth - capGainsTax

  RENTER:
    if month == 1:
      portfolio = upfront  // invest what buyer spent upfront

    rent = baseRent * (1 + rentGrowthRate)^(year-1)
    rent = clamp(rent, rentFloor, rentCeiling)  // apply cap and floor

    monthlyDiff = effectiveBuyerCost - rent
    portfolio += monthlyDiff  // invest savings (or withdraw if negative)
    portfolio *= (1 + spReturn)^(1/12)  // monthly market return

    // Intangibles
    portfolio += renterFlexibilityPremium
    portfolio -= ownershipFreedomPremium

    renterWealth = portfolio

  breakEven = first year where buyerWealthAfterTax > renterWealth
```

### monte-carlo.ts — Correlated Variable Simulation

Use Cholesky decomposition to generate correlated random returns:

```
Variables: homeReturn, stockReturn, rentGrowth
Correlation matrix (approximate):
  home-stock: 0.15 (low correlation)
  home-rent: 0.70 (high correlation — housing and rents move together)
  stock-rent: 0.10 (low correlation)

Volatilities (annual std dev):
  homeReturn: 12% (SF housing is volatile)
  stockReturn: 16% (S&P historical)
  rentGrowth: 8% (less volatile than sale prices)

For each simulation (1000+):
  For each year:
    Generate 3 correlated normal random variables via Cholesky
    homeReturn[year] = meanAppreciation + vol_home * z1
    stockReturn[year] = meanSPReturn + vol_stock * z2
    rentGrowth[year] = meanRentGrowth + vol_rent * z3

    Clamp to reasonable bounds (e.g., home can't drop >40% in one year)

  Run full 30-year simulation with these variable returns
  Record buyerWealth and renterWealth at each year

Aggregate across all simulations:
  At each year: compute P10, P25, P50, P75, P90 of (buyerWealth - renterWealth)
  At each year: compute % of simulations where buying wins
```

### tax.ts — Federal + CA Tax Computation

```
Input: grossIncome, filingStatus (MFJ or Single)

Federal (2025 brackets, MFJ):
  Standard deduction: $30,000
  Taxable = gross - standardDeduction
  Apply brackets: 10%, 12%, 22%, 24%, 32%, 35%, 37%

California (2025 brackets):
  No standard deduction used (itemize for state)
  Apply brackets: 1%, 2%, 4%, 6%, 8%, 9.3%, 10.3%, 11.3%, 12.3%
  Mental health surcharge: +1% above $1M

FICA:
  Social Security: 6.2% up to $168,600
  Medicare: 1.45% + 0.9% surtax above $250K (MFJ)

takeHome = gross - federal - state - fica
marginalRate = federal marginal + state marginal (used for MID calculation)
```

---

## Implementation Phases

### Phase 1: Foundation (scaffold + engine)
1. Scaffold Vite + React + TypeScript project
2. Install dependencies: shadcn/ui, tailwind, recharts, zustand, framer-motion
3. Configure shadcn/ui with dark theme, custom colors, Fraunces + DM Sans fonts
4. Implement `engine/types.ts` — all parameter interfaces and result types
5. Implement `engine/defaults.ts` — default values, ranges, steps
6. Implement `engine/amortization.ts` — mortgage amortization
7. Implement `engine/tax.ts` — federal + CA + FICA computation
8. Implement `engine/simulation.ts` — full month-by-month loop
9. Write unit tests for engine (edge cases: 0% down, max values, refi scenarios)

### Phase 2: Monte Carlo Engine
1. Implement `engine/monte-carlo.ts` — Cholesky decomposition, correlated variable generation
2. Implement `engine/monte-carlo.worker.ts` — Web Worker wrapper
3. Implement `hooks/useMonteCarlo.ts` — Worker lifecycle, progress callback
4. Write tests for correlation matrix, distribution properties

### Phase 3: State & Core UI
1. Implement Zustand store with all parameters and computed results
2. Build `AppShell` layout — sidebar + tabbed main area
3. Build all input components (SliderInput, CurrencyInput, PercentInput, etc.)
4. Build Sidebar with all 9 parameter groups (collapsible)
5. Wire inputs → store → simulation engine (with debounce)
6. Build `RealNominalToggle` — global inflation adjustment

### Phase 4: Overview Tab
1. Build MetricCard — hero break-even display
2. Build WealthChart — dual line, dark theme, luminous lines
3. Build AdvantageChart — area chart with zero-crossing
4. Build Year 5 / Year 10 snapshot cards
5. Build intangibles summary

### Phase 5: Monte Carlo Tab
1. Build FanChart — percentile bands as shaded regions
2. Build year selector slider
3. Build HistogramChart — green/red color coding
4. Build stats table (mean, median, P10, P90)
5. Build headline probability metric

### Phase 6: Sensitivity & Early Exit Tabs
1. Build HeatmapChart — custom Recharts cells, thermal color scale
2. Build axis variable selectors
3. Build current-position marker
4. Build early exit detail view
5. Build quick-view comparison table (years 1, 2, 3, 5, 7, 10)
6. Build EarlyExitChart bar comparison

### Phase 7: Cost Details & Tax/Salary Tabs
1. Build monthly cost breakdown table with percentages
2. Build year selector for cost evolution
3. Build tax benefit offset display
4. Build salary reference table (28%, 33%, 38% thresholds)
5. Build income breakdown visualization
6. Build model explanation and caveats

### Phase 8: Polish & Animation
1. Page load animation — staggered card reveals via Framer Motion
2. Tab transition animations
3. Chart entrance animations
4. Hover effects on chart data points
5. Responsive design (tablet + mobile sidebar collapse)
6. Loading states for Monte Carlo computation
7. Final typography and spacing refinements

---

## Agent Team Assignments

When building, dispatch these agents in parallel:

| Agent | Scope | Dependencies |
|-------|-------|-------------|
| **Engine Agent** | Phase 1 + Phase 2: All files in `engine/`, pure TypeScript, unit tests | None |
| **Store + Layout Agent** | Phase 3: Zustand store, AppShell, Sidebar, input components, wiring | Needs `engine/types.ts` and `engine/defaults.ts` |
| **Charts Agent** | Phase 4-6 charts only: All files in `components/charts/` | Needs result types from engine |
| **Tabs Agent** | Phase 4-7 tab compositions: All files in `components/tabs/` | Needs charts + store |
| **Polish Agent** | Phase 8: Animations, responsive, loading states | Needs all components |

**Parallelization strategy**: Engine Agent and Store+Layout Agent can run simultaneously. Charts Agent starts once types are defined. Tabs Agent integrates. Polish Agent finishes.

---

## Key Design Decisions (from Q&A)

1. ✅ Kitchen sink V1 — all factors included
2. ✅ Rent growth: capped with floor ($12K cap, $6K floor, adjustable)
3. ✅ Monte Carlo: V1, all 3 vars correlated, fan chart + histogram
4. ✅ Tax: full income input, auto-compute marginal rates
5. ✅ HOA escalation: adjustable rate, default 5%/yr
6. ✅ Mello-Roos: separate line item, default $4K/yr
7. ✅ Selling costs: 6% default (includes transfer tax)
8. ✅ PMI: auto-triggers at <20% down
9. ✅ Capital gains exclusion: modeled ($500K MFJ / $250K single)
10. ✅ Filing status: MFJ default, toggleable
11. ✅ Refinance: toggle with year + new rate
12. ✅ Real/nominal toggle: with inflation parameter (default 2.5%)
13. ✅ Sensitivity: 2D heatmap grid
14. ✅ No scenario presets — sliders sufficient
15. ✅ Layout: tabbed sections, sidebar inputs
16. ✅ Tech: React + shadcn/ui + Tailwind + Recharts + Zustand + Framer Motion
17. ✅ Design: "Financial Observatory" — dark, editorial, Bloomberg-meets-magazine
