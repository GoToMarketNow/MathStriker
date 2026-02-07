import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PrimaryButton, ScreenContainer } from '../design-system';

type ShotOutcome = 'goal' | 'saved' | 'miss' | 'post';

function computeOutcome(power: number, accuracy: number, keeperLevel: number): ShotOutcome {
  // Deterministic-ish based on params
  const goalChance = Math.min(0.9, (power + accuracy) / 250 - keeperLevel * 0.05);
  const roll = Math.random();
  if (roll < goalChance) return 'goal';
  if (roll < goalChance + 0.08) return 'post';
  if (roll < goalChance + 0.20) return 'saved';
  return 'miss';
}

const outcomeConfig: Record<ShotOutcome, { emoji: string; text: string; color: string; sub: string }> = {
  goal:  { emoji: '⚽', text: 'GOAL!', color: 'text-pitch-500', sub: 'What a strike!' },
  saved: { emoji: '🧤', text: 'Saved!', color: 'text-electric-500', sub: 'Good effort — keeper made a play.' },
  miss:  { emoji: '💨', text: 'Wide!', color: 'text-gray-500', sub: 'Just missed — next time!' },
  post:  { emoji: '🥅', text: 'Off the Post!', color: 'text-gold-600', sub: 'So close! Hit the woodwork.' },
};

export function SoccerShotScreen() {
  const { player, setPlayer, setPhase } = useGameStore();
  const [phase, setLocalPhase] = useState<'ready' | 'shooting' | 'outcome'>('ready');
  const [outcome, setOutcome] = useState<ShotOutcome | null>(null);
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });

  // Shot params based on player state
  const power = Math.min(100, 50 + player.currentDifficulty * 5 + (player.streakCurrent >= 3 ? 15 : 0));
  const accuracy = Math.min(100, 60 + player.streakCurrent * 5);
  const keeperLevel = Math.max(1, Math.ceil(player.currentDifficulty * 0.8));

  const handleShoot = () => {
    setLocalPhase('shooting');

    // Random ball target
    const tx = (Math.random() - 0.5) * 120;
    const ty = -80 - Math.random() * 40;
    setBallPos({ x: tx, y: ty });

    setTimeout(() => {
      const result = computeOutcome(power, accuracy, keeperLevel);
      setOutcome(result);
      setLocalPhase('outcome');

      if (result === 'goal') {
        const bonus = 5;
        setPlayer({ coins: player.coins + bonus });
      }
    }, 800);
  };

  const handleContinue = () => {
    setPhase('playing');
  };

  const config = outcome ? outcomeConfig[outcome] : null;

  return (
    <ScreenContainer className="flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Goal frame */}
      <div className="relative w-full max-w-[320px] h-[200px] mb-8">
        {/* Goal posts */}
        <div className="absolute inset-0 border-2 border-gray-300 rounded-t-lg bg-gradient-to-b from-pitch-100 to-pitch-50">
          {/* Net pattern */}
          <div className="absolute inset-2 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 14px, #22c55e 14px, #22c55e 15px), repeating-linear-gradient(90deg, transparent, transparent 14px, #22c55e 14px, #22c55e 15px)',
            }}
          />

          {/* Keeper */}
          <AnimatePresence>
            {phase !== 'ready' && (
              <motion.div
                initial={{ x: 0 }}
                animate={{
                  x: outcome === 'saved' ? ballPos.x * 0.8 : (Math.random() - 0.5) * 60,
                }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 text-4xl"
              >
                🧤
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ball */}
          <motion.div
            animate={
              phase === 'shooting'
                ? { x: ballPos.x, y: ballPos.y, scale: 0.6 }
                : phase === 'outcome' && outcome === 'goal'
                ? { x: ballPos.x, y: ballPos.y - 10, scale: 0.5, opacity: 0.8 }
                : { x: 0, y: 0, scale: 1 }
            }
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 text-4xl z-10"
          >
            ⚽
          </motion.div>
        </div>
      </div>

      {/* Power/accuracy meters */}
      {phase === 'ready' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-[280px] mb-6"
        >
          <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
            <span>Power</span>
            <span>{power}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full bg-red-400" style={{ width: `${power}%` }} />
          </div>
          <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
            <span>Accuracy</span>
            <span>{accuracy}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-electric-400" style={{ width: `${accuracy}%` }} />
          </div>
        </motion.div>
      )}

      {/* Shoot button */}
      {phase === 'ready' && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <PrimaryButton size="lg" onClick={handleShoot} icon="⚽">
            Shoot!
          </PrimaryButton>
        </motion.div>
      )}

      {/* Outcome */}
      <AnimatePresence>
        {phase === 'outcome' && config && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            <div className="text-6xl mb-2">{config.emoji}</div>
            <h2 className={`font-display text-3xl font-extrabold ${config.color} mb-1`}>
              {config.text}
            </h2>
            <p className="text-gray-500 mb-6">{config.sub}</p>
            {outcome === 'goal' && (
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-gold-600 font-bold text-lg mb-4"
              >
                +5 🪙
              </motion.p>
            )}
            <PrimaryButton onClick={handleContinue} size="lg">
              Next Question →
            </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenContainer>
  );
}
