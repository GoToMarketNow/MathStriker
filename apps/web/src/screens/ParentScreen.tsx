import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PrimaryButton, ScreenContainer } from '../design-system';

function ParentGate({ onUnlock }: { onUnlock: () => void }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  const startHold = () => {
    setHolding(true);
    setProgress(0);
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(1, elapsed / 2000);
      setProgress(p);
      if (p >= 1) {
        onUnlock();
      } else {
        timerRef.current = requestAnimationFrame(tick);
      }
    };
    timerRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    setHolding(false);
    setProgress(0);
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
  };

  return (
    <ScreenContainer className="flex flex-col items-center justify-center text-center">
      <div className="text-5xl mb-4">👨‍👧</div>
      <h2 className="font-display text-xl font-bold text-gray-800 mb-2">Parent Area</h2>
      <p className="text-sm text-gray-500 mb-8">Hold the button for 2 seconds to enter.</p>
      <div className="relative w-48 h-48">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={holding ? '#22c55e' : '#e5e7eb'}
            strokeWidth="6"
            strokeDasharray={`${progress * 283} 283`}
            strokeLinecap="round"
          />
        </svg>
        <button
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          className="absolute inset-4 rounded-full bg-pitch-500 text-white font-bold text-lg flex items-center justify-center active:bg-pitch-600"
          aria-label="Hold for 2 seconds to unlock parent area"
        >
          {holding ? 'Hold...' : 'Press & Hold'}
        </button>
      </div>
    </ScreenContainer>
  );
}

function ParentDashboard() {
  const { player, setPhase, toggleSound, toggleReduceMotion, soundEnabled, reduceMotion, reset } = useGameStore();

  return (
    <ScreenContainer>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-bold text-gray-800">Parent Dashboard</h1>
        <PrimaryButton variant="ghost" onClick={() => setPhase('playing')}>
          ← Back
        </PrimaryButton>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-game-lg shadow-sm p-4 mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Player Stats</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-pitch-50 rounded-game p-3">
            <p className="text-xs text-gray-500">League</p>
            <p className="text-lg font-bold text-pitch-700">{player.league}</p>
          </div>
          <div className="bg-electric-50 rounded-game p-3">
            <p className="text-xs text-gray-500">Total XP</p>
            <p className="text-lg font-bold text-electric-700">{player.xp}</p>
          </div>
          <div className="bg-gold-50 rounded-game p-3">
            <p className="text-xs text-gray-500">Best Streak</p>
            <p className="text-lg font-bold text-gold-700">{player.streakBest}</p>
          </div>
          <div className="bg-purple-50 rounded-game p-3">
            <p className="text-xs text-gray-500">Difficulty</p>
            <p className="text-lg font-bold text-purple-700">{player.currentDifficulty}/6</p>
          </div>
        </div>
      </div>

      {/* Skill accuracy */}
      <div className="bg-white rounded-game-lg shadow-sm p-4 mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Accuracy by Skill</p>
        {['multiplication', 'division', 'fractions', 'patterns', 'word_problems'].map((skill) => {
          const mastery = Math.round((player.skillModel[skill] ?? 0) * 100);
          return (
            <div key={skill} className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-700 capitalize w-28">{skill.replace(/_/g, ' ')}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-pitch-400" style={{ width: `${mastery}%` }} />
              </div>
              <span className="text-xs text-gray-500 w-8 text-right">{mastery}%</span>
            </div>
          );
        })}
      </div>

      {/* Settings */}
      <div className="bg-white rounded-game-lg shadow-sm p-4 mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Settings</p>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Sound Effects</span>
            <button
              onClick={toggleSound}
              className={`w-12 h-7 rounded-full transition-colors ${soundEnabled ? 'bg-pitch-500' : 'bg-gray-300'}`}
              role="switch"
              aria-checked={soundEnabled}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: soundEnabled ? 22 : 2 }}
              />
            </button>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Reduce Motion</span>
            <button
              onClick={toggleReduceMotion}
              className={`w-12 h-7 rounded-full transition-colors ${reduceMotion ? 'bg-pitch-500' : 'bg-gray-300'}`}
              role="switch"
              aria-checked={reduceMotion}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: reduceMotion ? 22 : 2 }}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-game-lg shadow-sm p-4">
        <PrimaryButton
          variant="destructive"
          className="w-full"
          onClick={() => {
            if (confirm('Reset assessment? This will restart from the beginning.')) {
              reset();
            }
          }}
        >
          Reset Assessment
        </PrimaryButton>
      </div>
    </ScreenContainer>
  );
}

export function ParentScreen() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <ParentGate onUnlock={() => setUnlocked(true)} />;
  }

  return <ParentDashboard />;
}
