'use client';

import { COLORS } from '@/lib/colors';

interface ComparisonRowProps {
  label: string;
  buyerValue: string;
  renterValue: string;
  winner?: 'buyer' | 'renter' | 'tie';
}

export default function ComparisonRow({
  label,
  buyerValue,
  renterValue,
  winner,
}: ComparisonRowProps) {
  const buyerWeight = winner === 'buyer' ? 'font-semibold' : 'font-normal';
  const renterWeight = winner === 'renter' ? 'font-semibold' : 'font-normal';

  const buyerOpacity = winner === 'renter' ? 0.6 : 1;
  const renterOpacity = winner === 'buyer' ? 0.6 : 1;

  return (
    <div className="grid grid-cols-3 items-center gap-4 py-2">
      <span
        className="text-sm"
        style={{ color: COLORS.textSecondary }}
      >
        {label}
      </span>
      <span
        className={`text-right text-sm ${buyerWeight}`}
        style={{ color: COLORS.buyer, opacity: buyerOpacity }}
      >
        {buyerValue}
      </span>
      <span
        className={`text-right text-sm ${renterWeight}`}
        style={{ color: COLORS.renter, opacity: renterOpacity }}
      >
        {renterValue}
      </span>
    </div>
  );
}
