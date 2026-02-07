import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PrimaryButton, ScreenContainer } from '../design-system';

export function AssessmentIntroScreen() {
  const { setPhase, player } = useGameStore();

  return (
    <ScreenContainer className="flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="text-5xl mb-4">📋</div>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">
          Hey {player.displayName}! 👋
        </h2>
        <p className="text-gray-500 mb-2">Let's find out where you should start.</p>
        <p className="text-sm text-gray-400 mb-8">
          Answer 15 quick questions. No pressure — this helps us pick the right level for you.
        </p>
        <PrimaryButton size="lg" className="w-full" onClick={() => setPhase('assessment')}>
          Start Assessment
        </PrimaryButton>
      </motion.div>
    </ScreenContainer>
  );
}
