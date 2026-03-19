# Missing Financial Factors: Rent vs. Buy Calculator for ~$1.9M SF Condo

Research date: 2026-03-18

---

## 1. Tax Benefits NOT Modeled

### Mortgage Interest Deduction (MID)
- **$750K cap is now permanent** (OBBBA signed July 4, 2025 made TCJA limits permanent).
- On a $1.71M mortgage (10% down on $1.9M), only **43.86%** of interest is deductible ($750K / $1.71M).
- Year 1 at ~6.75%: ~$115,425 total interest, only ~$50,629 deductible.
- **Tax savings: ~$12,150-$18,730/yr** depending on bracket (24%-37%), vs. $27K-$43K without the cap.
- **Impact: HIGH.** The model should reduce any tax benefit by ~56% vs. naive calculations.

### SALT Deduction
- **2025:** $10,000 cap.
- **2026-2029:** $40,000 cap (OBBBA), with phase-out starting at $500K MAGI (30% reduction per dollar above threshold).
- Property tax on $1.9M at 1.183% = ~$22,477/yr. Plus CA state income tax.
- Under $10K cap (2025): property tax alone exceeds the cap, so zero incremental benefit from mortgage interest SALT interaction.
- Under $40K cap (2026+): property tax + state income tax likely approaches or exceeds $40K for high earners, but much more room than before.
- **Phase-out matters:** Buyers of $1.9M homes likely have MAGI > $500K, reducing the $40K cap.

### Capital Gains Exclusion ($500K MFJ)
- **Still $250K single / $500K MFJ** -- never indexed for inflation since 1997.
- If indexed to home prices, would be ~$1.44M MFJ today.
- Bipartisan "More Homes on the Market Act" (H.R. 1321) would double to $500K/$1M. Not yet law.
- **For a $1.9M condo:** If held 7-10 years with modest appreciation (2-3%/yr), gains of $280K-$640K are plausible. The $500K exclusion covers most scenarios for MFJ filers.
- **Impact: MEDIUM.** Model should include this as a significant buying advantage for long hold periods, but gains exceeding $500K on a $1.9M property are realistic over 10+ years.

### Itemizing vs. Standard Deduction
- 2026 standard deduction: $31,500 MFJ.
- With ~$50,629 deductible mortgage interest + $40,000 SALT cap = ~$90K+ in itemized deductions.
- **Itemizing clearly wins** for this price point. Net tax benefit = itemized deductions minus standard deduction.

---

## 2. PMI (Private Mortgage Insurance)

- At 10% down on a $1.9M jumbo ($1.71M loan), PMI **may or may not apply** depending on lender.
- **If PMI applies:** 0.25%-0.50% of loan amount = **$4,275-$8,550/yr** ($356-$713/mo).
- **Many jumbo lenders offer no-PMI programs**, especially with strong credit (700+) and reserves.
- **80-10-10 piggyback structure** is common: first mortgage at $1.52M (80%), second at $190K (10%), $190K down (10%). Avoids PMI entirely but second lien has higher rate.
- **PMI deduction returned in 2026** but phases out at $100K-$110K AGI -- irrelevant for buyers at this price point.
- **Impact: MEDIUM.** Model should include PMI as a toggle. If applicable, $4K-$9K/yr is material.

---

## 3. Transfer Taxes

### San Francisco Transfer Tax (Seller pays, but affects economics)
- $1.9M falls in the **$1M to <$5M tier: 0.75%** ($3.75 per $500).
- **Transfer tax = $14,250** on a $1.9M sale.
- Plus county transfer tax: $1.10 per $1,000 = **~$2,090**.
- **Total transfer tax: ~$16,340.**
- Traditionally paid by seller, but affects net proceeds at sale (should be in selling costs).
- **Impact: MEDIUM.** This is ~0.86% of sale price. If the spec's "selling costs" already includes this, it's covered. If not, add it.

---

## 4. Special Assessments & Mello-Roos

### Mission Bay CFDs
- **CFD No. 5 (Maintenance District):** Covers 41.5 acres of open space maintenance. Runs until 2044. FY 2025-26 total levy: $3.145M across ~69 developed lots.
- **CFD No. 6 (Public Improvements):** Infrastructure bonds for Mission Bay South. Runs until bonds retired.
- **Typical Mello-Roos range:** $360-$10,000+/yr per unit; generally 0.1%-1.5% of home value.
- For a $1.9M condo: rough estimate **$1,900-$28,500/yr** at the extremes, likely **$2,000-$6,000/yr** for Mission Bay.
- **These appear on the property tax bill as a separate line item**, so may already be captured in the 1.183% property tax rate if that rate was taken from an actual tax bill.
- **Impact: HIGH if not already in property tax rate.** Must verify whether the spec's 1.183% includes or excludes Mello-Roos/special assessments.

---

## 5. HOA Increases

- Bay Area HOAs increased a **median 30% from 2019-2024** (vs. 22% general inflation).
- San Francisco specifically: **26% increase** over same period, ~5-6%/yr average.
- Newer luxury buildings hit hardest: insurance premium spikes, SB 326 balcony inspections, post-COVID operating costs.
- **Real-world examples:**
  - The Avery (South Beach, newer): ~$2,000/mo for 2BR/2BA
  - One Hawthorne (2010 build): ~$1,500/mo for 2BR/2BA
  - Mission District 28-unit (bought 2017): $600/mo -> $960/mo (60% in ~7 years, ~7%/yr)
- **Key drivers:** Insurance market upheaval (carriers exiting CA), new mandated inspections, deferred maintenance reserves.
- Some new buildings offering "no HOA for X years" as sales incentive -- beware the cliff.
- **Impact: HIGH.** Model should escalate HOA at 5-7%/yr, not general inflation (2.5-3%). Over 10 years, $800/mo HOA at 6%/yr becomes $1,432/mo -- a 79% increase.

---

## 6. Inflation Adjustment / Real Returns

- **Robert Shiller data:** Real (inflation-adjusted) home appreciation averages only ~0.2%/yr historically.
- After maintenance, repairs, and property taxes, many homeowners merely break even in real terms.
- Most calculators use nominal values, which **systematically overstates** the buying case by conflating inflation with real appreciation.
- **Recommendation:** Model should show BOTH nominal and real (inflation-adjusted) results. Use a toggle for inflation rate (default 2.5-3%).
- Fixed-rate mortgage is an **inflation hedge** -- real payment declines over time. This is a genuine buying advantage not always captured.
- **Impact: HIGH.** Showing real returns often dramatically changes the rent vs. buy calculus.

---

## 7. Refinancing Optionality

- Homeowners with fixed-rate mortgages hold an **embedded asymmetric option:**
  - Rates drop -> refinance to lower payment (you win)
  - Rates stay/rise -> keep existing rate (you don't lose)
- This is a **free call option on interest rates** that has real economic value.
- No major calculator quantifies this.
- **Rough value estimation:** With current rates at ~6.5-7%, if rates drop to 5% within 5 years (plausible), refinancing a $1.71M mortgage saves ~$15,000-$25,000/yr in interest. Present value of this option depends on rate volatility.
- Fed Funds projected to end 2026 around 3%, potentially bringing mortgage rates to 5-5.5%.
- **Impact: MEDIUM-HIGH.** Difficult to model precisely, but a qualitative note or scenario analysis (current rate vs. refinanced rate) would be valuable.

---

## 8. Renter-Side Factors

### Security Deposit Opportunity Cost
- **California AB 12 (effective July 2024):** Security deposits capped at **1 month's rent** for most landlords.
- At ~$5,000/mo rent, that's $5,000 tied up. Opportunity cost at 5% = $250/yr. **Trivial.**
- San Francisco requires landlords pay **5.0% interest** on deposits (March 2025 - Feb 2026), so the renter actually gets compensated.
- **Impact: NEGLIGIBLE.** Not worth modeling.

### Renter's Insurance
- Typical cost: **~$15-$20/mo** ($180-$240/yr) in San Francisco.
- **Impact: NEGLIGIBLE.** Could include as a line item but won't move the needle.

### Rent Stabilization
- SF rent increase cap for 2025-2026: **1.4%**.
- This is a **significant renter advantage** in the SF model. Rent-controlled tenants see far below-market increases.
- However, new construction (built after 1979) is generally exempt from rent control.
- **Impact: VARIES.** If comparing to a rent-controlled unit, the renting case improves dramatically. For new construction rentals (likely comp for Mission Bay buyer), rent control doesn't apply. Model should allow user to set rent growth rate separately.

---

## 9. Condo Market Liquidity Risk

- **SF condos average ~58-59 days on market** (2025), vs. ~28 days for single-family homes.
- Condo supply: ~3 months (vs. 1.4 months for houses).
- Sale-to-list ratio: ~99%, with 35% selling above list.
- $1.5M-$2M range seeing improved demand from AI-sector liquidity events.
- **Pending condo sales up 37.9%** in late 2025 -- significant absorption signal.
- 45% of condos now selling over list price.
- **Risk factors:** Condos are inherently less liquid than SFH. In downturns, condo values drop more and take longer to recover. High HOA fees deter buyers.
- **Impact: MEDIUM.** Model could include a "liquidity discount" or longer assumed holding period. The ~2 month marketing period means carrying costs during sale (mortgage + HOA + taxes for 2-3 months beyond your planned exit).

---

## 10. Earthquake Insurance

- **NOT included in standard homeowner's insurance.** It is a separate, additional policy.
- Available through California Earthquake Authority (CEA) via participating insurers.
- **Estimated cost for SF condo:** $1,500-$4,000+/yr depending on:
  - Building age, construction type, foundation, proximity to faults, soil type
  - Coverage level and deductible chosen (5%-25% of dwelling coverage)
- **CEA rate increase of 6.8%** applied in 2025.
- **Deductibles are high:** Typically 5-25% of dwelling coverage. On $1.9M, a 15% deductible = $285,000 out-of-pocket before coverage kicks in.
- **Condo-specific:** HOA may have building-level earthquake policy, but unit owner needs separate contents/loss-assessment coverage. CEA condo policies include up to $100K loss assessment coverage.
- **Many SF owners skip earthquake insurance** due to high premiums and high deductibles.
- **Impact: MEDIUM-HIGH.** If included, adds $1,500-$4,000/yr to ownership costs. If excluded, represents uninsured tail risk. Model should include as an optional line item with a note about the risk tradeoff.

---

## Summary: Priority Ranking for Model Enhancement

| Factor | Annual Impact | Priority |
|--------|--------------|----------|
| Tax benefits (MID, SALT, cap gains) | $12K-$19K/yr savings (buying advantage) | **P0 - Must model** |
| HOA escalation above inflation | $2K-$5K/yr incremental by year 10 | **P0 - Must model** |
| Mello-Roos / special assessments | $2K-$6K/yr (if not in property tax) | **P0 - Must verify** |
| Inflation-adjusted (real) returns | Changes entire conclusion | **P1 - Should model** |
| Earthquake insurance | $1.5K-$4K/yr | **P1 - Should model** |
| Transfer tax | ~$16K one-time | **P1 - Verify in selling costs** |
| PMI | $0-$8.5K/yr (lender dependent) | **P1 - Should toggle** |
| Refinancing optionality | $0-$25K/yr (scenario dependent) | **P2 - Scenario analysis** |
| Condo liquidity / carrying costs | ~$15K-$25K one-time at sale | **P2 - Nice to have** |
| Renter factors (deposit, insurance) | <$500/yr | **P3 - Negligible** |

---

## Sources

- [SF.gov Transfer Tax](https://www.sf.gov/transfer-tax)
- [SF Transfer Tax Calculator](https://thefrontsteps.com/san-francisco-transfer-tax-calculator/)
- [Jumbo Loan Down Payment 2026](https://themortgagereports.com/58660/jumbo-loans-with-low-down-payment-and-no-mortgage-insurance)
- [PMI on Jumbo Loans](https://jumbomortgagesource.com/how-much-is-pmi-on-jumbo-loans/)
- [OBBBA SALT Deduction Changes](https://www.hrblock.com/tax-center/irs/tax-law-and-policy/one-big-beautiful-bill-salt-deduction/)
- [MID Options for Reform - Yale Budget Lab](https://budgetlab.yale.edu/research/mortgage-interest-deduction-options-reform)
- [Schedule A 2025 SALT Cap](https://ourtaxpartner.com/schedule-a-2025-salt-cap-increase/)
- [2026 Tax Breaks for Homeowners](https://www.atlanticcityfocus.com/2026-tax-breaks-for-homeowners-salt-deduction-increase-pmi-write-off-returns-and-energy-credits-ending/)
- [SFOCII CFD 5 Admin Report 2025](https://sfocii.org/files/2025-12/CFD%205%20Admin%20Report%202025.pdf)
- [SFOCII CFD 6 Admin Report 2025](https://sfocii.org/files/2025-12/CFD%206%20Admin%20Report%202025.pdf)
- [HOA Fees Rising in Bay Area](https://www.theownteam.com/blog/the-hoa-fees-are-rising-fast-in-the-bay-area/)
- [SF Condo Delinquencies & HOA](https://www.unitedstatesrealestateinvestor.com/san-francisco-condo-delinquencies-soar-45-percent-hoa-fees-explode/)
- [HOA Dues Climbing in SF](https://insidesfre.com/hoa-dues-continue-to-climb-in-san-francisco/)
- [CEA Earthquake Insurance](https://www.earthquakeauthority.com/california-earthquake-insurance-policies/earthquake-insurance-premium-calculator)
- [CEA Condo Coverage](https://www.earthquakeauthority.com/california-earthquake-insurance-policies/condominium)
- [SF Real Estate 2025 Year-End](https://www.markdmchale.com/blog/san-francisco-real-estate-2025-recap)
- [SF Market Outlook 2026](https://colleencottersf.com/blog/2026-market-predictions-and-a-look-back-on-q4-of-2025)
- [Capital Gains Exclusion - NAR](https://www.nar.realtor/taxes/capital-gains/the-capital-gains-cliff-is-coming-how-reform-can-unlock-housing-supply)
- [IRS Pub 523 - Selling Your Home](https://www.irs.gov/publications/p523)
- [IRS Pub 936 - Mortgage Interest Deduction](https://www.irs.gov/publications/p936)
- [CA Security Deposit Law AB 12](https://alleastbayproperties.com/californias-new-security-deposit-law/)
- [SF Rent Board Security Deposits](https://sfrb.org/fact-sheet-3-security-deposits-interest-security-deposits-and-rent-board-fee)
- [Mission Bay Mello-Roos](https://colleencottersf.com/blog/mello-roos-in-san-francisco-what-buyers-need-to-know)
- [Costs of Selling Mission Bay Condo](https://jeffmarples.com/blog/what-are-the-costs-of-selling-a-condo-in-mission-bay)
