import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { ScreenContainer, PrimaryButton, LockerGrid } from '../design-system';
import type { LockerItem } from '../design-system';

// Static catalog for demo (in production, fetched from API)
const FULL_CATALOG: (LockerItem & { unlockHint: string })[] = [
  { id: 'cleats_basic', name: 'Training Cleats', category: 'cleats', rarity: 'common', assetKey: 'cleats/basic_01', owned: true, equipped: true, unlockHint: 'Starter' },
  { id: 'cleats_speed', name: 'Speed Cleats', category: 'cleats', rarity: 'rare', assetKey: 'cleats/speed_01', owned: false, unlockHint: 'Reach U10' },
  { id: 'cleats_lightning', name: 'Lightning Cleats', category: 'cleats', rarity: 'epic', assetKey: 'cleats/lightning_01', owned: false, unlockHint: 'Reach U14' },
  { id: 'shinguards_basic', name: 'Training Guards', category: 'shinguards', rarity: 'common', assetKey: 'sg/basic', owned: true, equipped: true, unlockHint: 'Starter' },
  { id: 'shinguards_carbon', name: 'Carbon Guards', category: 'shinguards', rarity: 'rare', assetKey: 'sg/carbon', owned: false, unlockHint: 'Multiplication Master badge' },
  { id: 'ball_basic', name: 'Match Ball', category: 'balls', rarity: 'common', assetKey: 'balls/basic', owned: true, equipped: true, unlockHint: 'Starter' },
  { id: 'ball_neon', name: 'Neon Ball', category: 'balls', rarity: 'rare', assetKey: 'balls/neon', owned: false, unlockHint: 'Reach U12' },
  { id: 'ball_fire', name: 'Fire Ball', category: 'balls', rarity: 'epic', assetKey: 'balls/fire', owned: false, unlockHint: '20 streak' },
  { id: 'headband_classic', name: 'Classic Headband', category: 'headbands', rarity: 'common', assetKey: 'hb/classic', owned: false, unlockHint: 'Reach U10' },
  { id: 'headband_star', name: 'Star Headband', category: 'headbands', rarity: 'rare', assetKey: 'hb/star', owned: false, unlockHint: 'Pattern Genius badge' },
  { id: 'jersey_galaxy', name: 'Galaxy Kit', category: 'jerseys', rarity: 'epic', assetKey: 'jerseys/galaxy', owned: false, unlockHint: 'Reach High School' },
  { id: 'jersey_champion', name: 'Champion Kit', category: 'jerseys', rarity: 'legendary', assetKey: 'jerseys/champ', owned: false, unlockHint: 'Reach College' },
  { id: 'cele_slide', name: 'Knee Slide', category: 'celebrations', rarity: 'common', assetKey: 'cele/slide', owned: false, unlockHint: 'Reach U10' },
  { id: 'cele_backflip', name: 'Backflip', category: 'celebrations', rarity: 'rare', assetKey: 'cele/flip', owned: false, unlockHint: 'Reach U12' },
  { id: 'skill_power_boost', name: 'Power Boost', category: 'skills', rarity: 'rare', assetKey: 'skills/power', owned: false, unlockHint: 'Multiplication Master badge' },
  { id: 'skill_accuracy_boost', name: 'Precision', category: 'skills', rarity: 'rare', assetKey: 'skills/accuracy', owned: false, unlockHint: 'Fraction Pro badge' },
  { id: 'skill_curve_shot', name: 'Curve Shot', category: 'skills', rarity: 'epic', assetKey: 'skills/curve', owned: false, unlockHint: 'Reach U14' },
  { id: 'skill_streak_shield', name: 'Streak Shield', category: 'skills', rarity: 'epic', assetKey: 'skills/shield', owned: false, unlockHint: '15 streak' },
];

const CATEGORIES = ['all', 'cleats', 'shinguards', 'balls', 'headbands', 'jerseys', 'celebrations', 'skills'] as const;

export function LockerScreen() {
  const { setPhase } = useGameStore();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? FULL_CATALOG : FULL_CATALOG.filter((i) => i.category === filter);
  const ownedCount = FULL_CATALOG.filter((i) => i.owned).length;

  return (
    <ScreenContainer>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-800">Locker</h1>
          <p className="text-xs text-gray-400">{ownedCount}/{FULL_CATALOG.length} items unlocked</p>
        </div>
        <PrimaryButton variant="ghost" onClick={() => setPhase('playing')}>
          ← Back
        </PrimaryButton>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all capitalize
              ${filter === cat ? 'bg-pitch-500 text-white' : 'bg-gray-100 text-gray-600'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <LockerGrid
        items={filtered}
        onEquip={(itemId) => {
          // In production, call POST /equip/:userId
          console.log('Equip:', itemId);
        }}
      />

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Rarity</p>
        <div className="flex gap-3">
          {['common', 'rare', 'epic', 'legendary'].map((r) => (
            <span key={r} className="text-[10px] capitalize text-gray-500">
              {r === 'common' ? '⚪' : r === 'rare' ? '🔵' : r === 'epic' ? '🟣' : '🟡'} {r}
            </span>
          ))}
        </div>
      </div>
    </ScreenContainer>
  );
}
