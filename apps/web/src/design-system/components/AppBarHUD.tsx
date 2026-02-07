import type { League } from '@math-striker/shared';
import { LeagueBadge } from './LeagueBadge';
import { ScoreCounter } from './ScoreCounter';
import { StreakMeter } from './StreakMeter';

interface AppBarHUDProps {
  league: League;
  score: number;
  coins: number;
  streakCount: number;
  streakProgress: number;
  bonusReady?: boolean;
  scoreDelta?: number;
  onSettings?: () => void;
}

export function AppBarHUD({
  league,
  score,
  coins,
  streakCount,
  streakProgress,
  bonusReady,
  scoreDelta,
  onSettings,
}: AppBarHUDProps) {
  return (
    <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-2">
      <div className="flex items-center justify-between max-w-[560px] mx-auto">
        <LeagueBadge league={league} size="sm" />
        <ScoreCounter score={score} coins={coins} delta={scoreDelta} />
        <div className="flex items-center gap-2">
          <StreakMeter
            streakCount={streakCount}
            progressToBonus={streakProgress}
            bonusReady={bonusReady}
            variant="compact"
          />
          {onSettings && (
            <button
              onClick={onSettings}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
              aria-label="Settings"
            >
              ⚙️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
