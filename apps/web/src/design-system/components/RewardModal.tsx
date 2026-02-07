import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { PrimaryButton } from './PrimaryButton';

export type RewardType = 'coins' | 'badge' | 'league' | 'skin';

interface RewardModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  rewardType: RewardType;
  rewardPayload?: { emoji?: string; amount?: number };
  onNext: () => void;
  children?: ReactNode;
}

const typeEmoji: Record<RewardType, string> = {
  coins: '🪙',
  badge: '🛡️',
  league: '🏆',
  skin: '⚽',
};

export function RewardModal({
  visible,
  title,
  subtitle,
  rewardType,
  rewardPayload,
  onNext,
  children,
}: RewardModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[90]"
          />
          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[95] bg-white rounded-t-[28px] shadow-2xl px-6 pt-8 pb-10 max-w-lg mx-auto"
          >
            {/* Confetti dots */}
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className={`w-2 h-2 rounded-full ${
                    ['bg-pitch-400', 'bg-gold-400', 'bg-electric-400', 'bg-pink-400', 'bg-purple-400'][i]
                  }`}
                />
              ))}
            </div>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-6xl mb-3"
              >
                {rewardPayload?.emoji || typeEmoji[rewardType]}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-2xl font-extrabold text-gray-800 font-display"
              >
                {title}
              </motion.h2>

              {subtitle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-gray-500 mt-1"
                >
                  {subtitle}
                </motion.p>
              )}

              {rewardPayload?.amount && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3 text-3xl font-bold text-gold-600 font-score"
                >
                  +{rewardPayload.amount}
                </motion.div>
              )}

              {children}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <PrimaryButton onClick={onNext} size="lg" className="w-full">
                  Continue ⚽
                </PrimaryButton>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
