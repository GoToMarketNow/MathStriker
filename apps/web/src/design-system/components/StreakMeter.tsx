import { motion } from 'framer-motion';

interface StreakMeterProps {
  streakCount: number;
  progressToBonus: number; // 0-1
  bonusReady?: boolean;
  variant?: 'compact' | 'expanded';
}

export function StreakMeter({
  streakCount,
  progressToBonus,
  bonusReady = false,
  variant = 'compact',
}: StreakMeterProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5" aria-label={`Streak: ${streakCount}`}>
        <motion.span
          animate={bonusReady ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="text-base"
        >
          ⚡
        </motion.span>
        <span className="text-sm font-bold text-gray-700">{streakCount}</span>
        <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${bonusReady ? 'bg-gold-400' : 'bg-electric-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressToBonus * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-game p-4 shadow-sm" aria-label={`Streak: ${streakCount}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.span
            animate={bonusReady ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-2xl"
          >
            ⚡
          </motion.span>
          <span className="font-bold text-lg text-gray-800">{streakCount} Streak</span>
        </div>
        {bonusReady && (
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="text-xs font-bold text-gold-600 bg-gold-100 px-2 py-1 rounded-full"
          >
            🎯 Bonus Shot Ready!
          </motion.span>
        )}
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${bonusReady ? 'bg-gradient-to-r from-gold-400 to-gold-500' : 'bg-gradient-to-r from-electric-400 to-pitch-400'}`}
          animate={{ width: `${progressToBonus * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
