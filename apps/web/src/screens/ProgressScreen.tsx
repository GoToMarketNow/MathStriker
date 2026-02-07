import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PrimaryButton, ProgressTimeline, LeagueBadge, ScreenContainer } from '../design-system';

const BADGE_CATALOG = [
  { id: 'multiplication_master', name: 'Multiplication Master', emoji: '✖️', skill: 'multiplication', threshold: 0.85 },
  { id: 'division_champ', name: 'Division Champion', emoji: '➗', skill: 'division', threshold: 0.8 },
  { id: 'fraction_pro', name: 'Fraction Pro', emoji: '📐', skill: 'fractions', threshold: 0.8 },
  { id: 'pattern_genius', name: 'Pattern Genius', emoji: '🔢', skill: 'patterns', threshold: 0.8 },
  { id: 'word_problem_wizard', name: 'Word Problem Wizard', emoji: '📝', skill: 'word_problems', threshold: 0.8 },
  { id: 'streak_5', name: 'On Fire', emoji: '🔥', skill: null, threshold: 5 },
  { id: 'streak_10', name: 'Unstoppable', emoji: '⚡', skill: null, threshold: 10 },
  { id: 'first_goal', name: 'First Goal', emoji: '⚽', skill: null, threshold: 1 },
  { id: 'century', name: 'Century', emoji: '💯', skill: null, threshold: 100 },
];

export function ProgressScreen() {
  const { player, setPhase } = useGameStore();

  // Compute which badges are earned locally
  const earnedBadges = BADGE_CATALOG.filter((b) => {
    if (b.skill) {
      const mastery = player.skillModel[b.skill] ?? 0;
      return mastery >= b.threshold;
    }
    if (b.id === 'streak_5') return player.streakBest >= 5;
    if (b.id === 'streak_10') return player.streakBest >= 10;
    if (b.id === 'century') return player.xp >= 100;
    return false;
  });

  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  return (
    <ScreenContainer>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-bold text-gray-800">Progress</h1>
        <PrimaryButton variant="ghost" onClick={() => setPhase('playing')}>
          ← Back
        </PrimaryButton>
      </div>

      {/* Player summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-game-lg shadow-sm p-4 mb-4 flex items-center gap-4"
      >
        <LeagueBadge league={player.league} size="md" />
        <div>
          <p className="font-bold text-gray-800">{player.displayName}</p>
          <p className="text-sm text-gray-500">
            {player.xp} XP · {player.coins} 🪙 · Best streak: {player.streakBest}
          </p>
        </div>
      </motion.div>

      {/* Skill mastery */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-game-lg shadow-sm p-4 mb-4"
      >
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Skill Mastery</p>
        <div className="space-y-2">
          {['multiplication', 'division', 'fractions', 'patterns', 'word_problems'].map((skill) => {
            const mastery = Math.round((player.skillModel[skill] ?? 0) * 100);
            return (
              <div key={skill} className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-700 capitalize w-28 truncate">
                  {skill.replace(/_/g, ' ')}
                </p>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-pitch-400 transition-all duration-500"
                    style={{ width: `${mastery}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-500 w-8 text-right">{mastery}%</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-game-lg shadow-sm p-4 mb-4"
      >
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">
          Badges ({earnedBadges.length}/{BADGE_CATALOG.length})
        </p>
        <div className="grid grid-cols-3 gap-3">
          {BADGE_CATALOG.map((badge) => {
            const earned = earnedIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center p-3 rounded-game ${
                  earned ? 'bg-gold-50 border border-gold-200' : 'bg-gray-50 opacity-50'
                }`}
              >
                <span className="text-2xl mb-1">{badge.emoji}</span>
                <span className="text-[10px] font-bold text-center text-gray-600 leading-tight">
                  {badge.name}
                </span>
                {earned && <span className="text-[9px] text-gold-600 mt-0.5">✓ Earned</span>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* League timeline */}
      <div className="bg-white rounded-game-lg shadow-sm">
        <ProgressTimeline
          currentLeague={player.league}
          progressPercent={Math.min(100, Math.round((player.xp % 500) / 5))}
          recentBadges={earnedBadges.map((b) => ({ id: b.id, emoji: b.emoji, name: b.name }))}
        />
      </div>
    </ScreenContainer>
  );
}
