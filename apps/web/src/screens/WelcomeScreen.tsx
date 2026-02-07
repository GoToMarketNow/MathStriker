import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PrimaryButton, ScreenContainer } from '../design-system';

export function WelcomeScreen() {
  const setPhase = useGameStore((s) => s.setPhase);

  return (
    <ScreenContainer className="flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-7xl mb-6"
        >
          ⚽
        </motion.div>
        <h1 className="font-display text-4xl font-extrabold text-pitch-700 mb-2">
          Math Striker
        </h1>
        <p className="text-lg text-pitch-600 font-semibold mb-8">
          Score goals with math skills!
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-xs"
      >
        <PrimaryButton size="lg" className="w-full" onClick={() => setPhase('setup')}>
          Let's Play!
        </PrimaryButton>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-sm text-gray-400"
      >
        Grades 2–4 · Adaptive Learning · Mobile-First
      </motion.p>
    </ScreenContainer>
  );
}
