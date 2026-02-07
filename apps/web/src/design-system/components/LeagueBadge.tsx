import { motion } from 'framer-motion';
import type { League } from '@math-striker/shared';
import { leagues } from '../tokens';

interface LeagueBadgeProps {
  league: League;
  isNew?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-20 h-20 text-4xl',
};

export function LeagueBadge({ league, isNew = false, size = 'md' }: LeagueBadgeProps) {
  const info = leagues[league];

  return (
    <motion.div
      animate={isNew ? { rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.6 }}
      className="relative flex flex-col items-center gap-1"
    >
      <div
        className={`
          ${sizeMap[size]} rounded-full flex items-center justify-center
          shadow-md border-[3px] relative
        `}
        style={{
          backgroundColor: info.color,
          borderColor: info.ring,
        }}
        aria-label={`League: ${info.label}`}
      >
        <span>{info.emoji}</span>
        {isNew && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: info.ring }}
          />
        )}
      </div>
      {size !== 'sm' && (
        <span className="text-xs font-bold text-gray-600">{info.label}</span>
      )}
    </motion.div>
  );
}
