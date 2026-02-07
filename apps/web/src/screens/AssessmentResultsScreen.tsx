import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PrimaryButton, LeagueBadge, ScreenContainer } from '../design-system';

export function AssessmentResultsScreen() {
  const { assessmentResults, player, setPhase } = useGameStore();

  if (!assessmentResults) return null;

  return (
    <ScreenContainer className="flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LeagueBadge league={assessmentResults.startingLeague} size="lg" isNew />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-display text-2xl font-bold text-gray-800 mt-4 mb-1"
        >
          Welcome to {assessmentResults.startingLeague}!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 mb-6"
        >
          You scored {assessmentResults.overallScore}% — nice work, {player.displayName}!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-game-lg shadow-sm p-4 mb-6 text-left"
        >
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Your Strengths</p>
          <div className="space-y-2">
            {Object.entries(assessmentResults.perSkillScores)
              .sort(([, a], [, b]) => b - a)
              .map(([skill, score]) => (
                <div key={skill} className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 capitalize">
                      {skill.replace(/_/g, ' ')}
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-0.5">
                      <div
                        className="h-full rounded-full bg-pitch-400"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-500 w-8 text-right">{score}%</span>
                </div>
              ))}
          </div>
        </motion.div>

        <PrimaryButton size="lg" className="w-full" onClick={() => setPhase('playing')}>
          Start Season ⚽
        </PrimaryButton>
      </motion.div>
    </ScreenContainer>
  );
}
