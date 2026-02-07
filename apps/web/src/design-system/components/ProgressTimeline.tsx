import { motion } from 'framer-motion';
import type { League } from '@math-striker/shared';
import { LEAGUE_ORDER } from '@math-striker/shared';
import { leagues } from '../tokens';

interface ProgressTimelineProps {
  currentLeague: League;
  progressPercent: number; // 0-100, progress within current league
  recentBadges?: { id: string; emoji: string; name: string }[];
}

export function ProgressTimeline({
  currentLeague,
  progressPercent,
  recentBadges = [],
}: ProgressTimelineProps) {
  const currentIdx = LEAGUE_ORDER.indexOf(currentLeague);

  return (
    <div className="w-full px-4 py-6">
      <h3 className="font-display font-bold text-lg text-gray-800 mb-4">Your Journey</h3>

      <div className="relative flex flex-col gap-0">
        {LEAGUE_ORDER.map((league, i) => {
          const info = leagues[league];
          const isPast = i < currentIdx;
          const isCurrent = i === currentIdx;
          const isFuture = i > currentIdx;

          return (
            <div key={league} className="flex items-start gap-3 relative">
              {/* Vertical line */}
              {i < LEAGUE_ORDER.length - 1 && (
                <div
                  className={`absolute left-[19px] top-10 w-0.5 h-10 ${
                    isPast ? 'bg-pitch-400' : isCurrent ? 'bg-gray-200' : 'bg-gray-100'
                  }`}
                />
              )}

              {/* Node */}
              <motion.div
                initial={isCurrent ? { scale: 0.8 } : {}}
                animate={isCurrent ? { scale: 1 } : {}}
                className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  text-lg border-2 z-10
                  ${isPast ? 'border-pitch-400 bg-pitch-50' : ''}
                  ${isCurrent ? 'border-pitch-500 bg-pitch-100 shadow-md' : ''}
                  ${isFuture ? 'border-gray-200 bg-gray-50 opacity-50' : ''}
                `}
                style={isCurrent ? { borderColor: info.ring } : {}}
              >
                {isPast ? '✓' : info.emoji}
              </motion.div>

              {/* Label */}
              <div className="flex-1 pb-8">
                <p className={`font-bold text-sm ${isFuture ? 'text-gray-400' : 'text-gray-800'}`}>
                  {info.label}
                  {isCurrent && (
                    <span className="ml-2 text-xs bg-pitch-100 text-pitch-700 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </p>
                {isCurrent && (
                  <div className="mt-1.5 w-full max-w-[160px]">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-pitch-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{progressPercent}% to next league</p>
                  </div>
                )}
                {isFuture && (
                  <p className="text-xs text-gray-400 mt-0.5">🔒 Locked</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent badges */}
      {recentBadges.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Recent Badges</p>
          <div className="flex gap-2 flex-wrap">
            {recentBadges.map((b) => (
              <span
                key={b.id}
                className="bg-gold-50 border border-gold-200 rounded-full px-3 py-1 text-sm"
                title={b.name}
              >
                {b.emoji} {b.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
