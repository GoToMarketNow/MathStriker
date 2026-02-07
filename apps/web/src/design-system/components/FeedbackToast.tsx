import { motion, AnimatePresence } from 'framer-motion';

export type FeedbackType = 'correct' | 'incorrect' | 'hint';

interface FeedbackToastProps {
  type: FeedbackType;
  message?: string;
  visible: boolean;
}

const config: Record<FeedbackType, { bg: string; emoji: string; defaultMsg: string }> = {
  correct: { bg: 'bg-pitch-500', emoji: '⚽', defaultMsg: 'GOAL! Nice work!' },
  incorrect: { bg: 'bg-red-500', emoji: '😅', defaultMsg: 'Close — try again!' },
  hint: { bg: 'bg-electric-500', emoji: '💡', defaultMsg: 'Look for the pattern…' },
};

export function FeedbackToast({ type, message, visible }: FeedbackToastProps) {
  const c = config[type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`
            fixed top-4 left-4 right-4 z-[100] mx-auto max-w-md
            ${c.bg} text-white rounded-game px-4 py-3
            flex items-center gap-3 shadow-lg
          `}
          role="alert"
        >
          <span className="text-xl">{c.emoji}</span>
          <span className="font-bold text-sm">{message || c.defaultMsg}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
