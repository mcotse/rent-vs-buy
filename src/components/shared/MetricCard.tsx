'use client';

import { motion } from 'framer-motion';
import { COLORS } from '@/lib/colors';

interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

const trendColors: Record<string, string> = {
  positive: COLORS.gain,
  negative: COLORS.loss,
  neutral: COLORS.textPrimary,
};

export default function MetricCard({
  label,
  value,
  sublabel,
  trend = 'neutral',
  className = '',
}: MetricCardProps) {
  const valueColor = trendColors[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`rounded-xl border p-6 ${className}`}
      style={{
        backgroundColor: 'rgba(26, 34, 54, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderColor: COLORS.borderSubtle,
      }}
    >
      <p
        className="text-[11px] font-medium uppercase tracking-widest"
        style={{ color: COLORS.textSecondary }}
      >
        {label}
      </p>
      <p
        className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl"
        style={{ color: valueColor }}
      >
        {value}
      </p>
      {sublabel && (
        <p className="mt-1 text-xs" style={{ color: COLORS.textMuted }}>
          {sublabel}
        </p>
      )}
    </motion.div>
  );
}
