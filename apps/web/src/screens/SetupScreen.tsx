import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PrimaryButton, ScreenContainer } from '../design-system';
import { api } from '../lib/api';

const AVATARS = ['⚽', '🦁', '🐯', '🦅', '🐺', '🐉', '🦈', '🦊'];

export function SetupScreen() {
  const { setPhase, setPlayer } = useGameStore();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('⚽');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const user = await api.createUser({ displayName: name.trim(), avatarKey: avatar });
      setPlayer({
        userId: user.id,
        displayName: user.displayName,
        avatarKey: avatar,
        league: user.currentLeague,
        xp: user.xp,
        coins: user.coins,
      });
      setPhase('avatar-builder');
    } catch {
      // Offline fallback: generate local ID
      setPlayer({
        userId: `local_${Date.now()}`,
        displayName: name.trim(),
        avatarKey: avatar,
      });
      setPhase('avatar-builder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h2 className="font-display text-2xl font-bold text-gray-800 text-center mb-6">
          Who's playing?
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full h-14 px-4 rounded-game border-2 border-gray-200 text-lg font-semibold
                       focus:border-pitch-500 focus:outline-none transition-colors"
            autoFocus
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Pick Your Mascot</label>
          <div className="grid grid-cols-4 gap-2">
            {AVATARS.map((a) => (
              <motion.button
                key={a}
                whileTap={{ scale: 0.9 }}
                onClick={() => setAvatar(a)}
                className={`
                  h-14 rounded-game text-2xl flex items-center justify-center
                  ${avatar === a
                    ? 'bg-pitch-100 border-2 border-pitch-500 shadow-sm'
                    : 'bg-gray-50 border-2 border-gray-200'}
                `}
                aria-label={`Select mascot ${a}`}
                aria-pressed={avatar === a}
              >
                {a}
              </motion.button>
            ))}
          </div>
        </div>

        <PrimaryButton
          size="lg"
          className="w-full"
          onClick={handleStart}
          loading={loading}
          disabled={!name.trim()}
        >
          Continue
        </PrimaryButton>
      </motion.div>
    </ScreenContainer>
  );
}
