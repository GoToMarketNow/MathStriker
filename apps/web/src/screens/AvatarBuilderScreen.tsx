import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import {
  ScreenContainer,
  PrimaryButton,
  AvatarCanvas,
  AttributePicker,
  ColorSwatchPicker,
} from '../design-system';
import {
  SKIN_TONES, HAIR_STYLES, HAIR_COLORS, EYE_SHAPES,
  EYE_COLORS, FACE_SHAPES, BROW_STYLES, GLASSES_STYLES, TEAM_COLORS,
} from '@math-striker/shared';

const SKIN_HEX: Record<string, string> = {
  tone_01: '#FDDCB5', tone_02: '#F5C8A0', tone_03: '#E8B48A',
  tone_04: '#D4976A', tone_05: '#C0845A', tone_06: '#A06B42',
  tone_07: '#8B5E3C', tone_08: '#6B4226', tone_09: '#553318', tone_10: '#3D2410',
};
const HAIR_HEX: Record<string, string> = {
  color_black: '#1a1a2e', color_brown: '#6b4226', color_dark_brown: '#3d2410',
  color_blonde: '#e8c76a', color_red: '#c0392b', color_auburn: '#8b3a2a',
  color_gray: '#95a5a6', color_platinum: '#ecf0f1',
  color_blue: '#3498db', color_pink: '#e84393', color_green: '#27ae60', color_purple: '#8e44ad',
};
const TEAM_HEX: Record<string, string> = {
  green: '#22c55e', blue: '#3b82f6', red: '#ef4444', yellow: '#eab308',
  purple: '#8b5cf6', orange: '#f97316', white: '#f1f5f9', black: '#1e293b',
  teal: '#14b8a6', pink: '#ec4899', navy: '#1e3a8a', maroon: '#881337',
};

const ADJECTIVES = ['Mighty', 'Swift', 'Golden', 'Thunder', 'Royal', 'Brave', 'Blazing', 'Storm', 'Steel', 'Rising'];
const ANIMALS = ['Lions', 'Eagles', 'Wolves', 'Panthers', 'Falcons', 'Sharks', 'Dragons', 'Hawks', 'Tigers', 'Vipers'];

type Tab = 'look' | 'gear' | 'team' | 'preview';

export function AvatarBuilderScreen() {
  const { player, setPhase } = useGameStore();
  const [tab, setTab] = useState<Tab>('look');

  // Avatar state
  const [skinTone, setSkinTone] = useState('tone_04');
  const [hairStyle, setHairStyle] = useState('hair_short_01');
  const [hairColor, setHairColor] = useState('color_brown');
  const [eyeColor, setEyeColor] = useState('eye_brown');
  const [freckles, setFreckles] = useState(false);
  const [glasses, setGlasses] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('Strikers FC');
  const [jerseyNum, setJerseyNum] = useState(10);
  const [primaryColor, setPrimaryColor] = useState('green');
  const [secondaryColor, setSecondaryColor] = useState('white');

  const generateName = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    setTeamName(`${adj} ${animal}`);
  };

  const handleSave = () => {
    // In full version, save via API. For now, proceed to game.
    setPhase('assessment-intro');
  };

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'look', label: 'Look', emoji: '👤' },
    { key: 'gear', label: 'Gear', emoji: '👕' },
    { key: 'team', label: 'Team', emoji: '🏆' },
    { key: 'preview', label: 'Preview', emoji: '✨' },
  ];

  const hairLabel = (key: string) =>
    key.replace('hair_', '').replace(/_\d+/, '').replace(/_/g, ' ');

  return (
    <ScreenContainer>
      <h1 className="font-display text-xl font-bold text-gray-800 mb-2 text-center">
        Create Your Soccer Star
      </h1>

      {/* Live preview */}
      <div className="flex justify-center mb-4">
        <motion.div layout className="bg-pitch-50 rounded-game-lg p-3 inline-block">
          <AvatarCanvas
            skinToneKey={skinTone}
            hairStyleKey={hairStyle}
            hairColorKey={hairColor}
            eyeColorKey={eyeColor}
            teamPrimaryColorKey={primaryColor}
            teamSecondaryColorKey={secondaryColor}
            jerseyNumber={jerseyNum}
            freckles={freckles}
            glassesKey={glasses}
            size={100}
          />
        </motion.div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-game p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`
              flex-1 py-2 px-2 rounded-[12px] text-xs font-bold transition-all
              ${tab === t.key ? 'bg-white shadow-sm text-pitch-700' : 'text-gray-500'}
            `}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[300px]"
        >
          {tab === 'look' && (
            <div>
              <ColorSwatchPicker label="Skin Tone" colors={SKIN_TONES} selected={skinTone} onSelect={setSkinTone} colorMap={SKIN_HEX} />
              <AttributePicker
                label="Hair Style"
                options={HAIR_STYLES}
                selected={hairStyle}
                onSelect={(v) => v && setHairStyle(v)}
                renderOption={(v) => (
                  <span className="text-[10px] px-1 capitalize">{v ? hairLabel(v) : ''}</span>
                )}
              />
              <ColorSwatchPicker label="Hair Color" colors={HAIR_COLORS} selected={hairColor} onSelect={setHairColor} colorMap={HAIR_HEX} />
              <AttributePicker
                label="Eye Color"
                options={EYE_COLORS}
                selected={eyeColor}
                onSelect={(v) => v && setEyeColor(v)}
                renderOption={(v) => <span className="text-[10px] px-1 capitalize">{v?.replace('eye_', '').replace(/_/g, ' ') ?? ''}</span>}
              />
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={freckles} onChange={() => setFreckles(!freckles)} className="rounded" />
                  <span>Freckles</span>
                </label>
              </div>
              <AttributePicker
                label="Glasses"
                options={GLASSES_STYLES}
                selected={glasses}
                onSelect={setGlasses}
                renderOption={(v) => <span className="text-[10px] px-1">{v ? v.replace('glasses_', '') : 'None'}</span>}
              />
            </div>
          )}

          {tab === 'gear' && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👕</div>
              <p className="text-gray-500">Jersey and gear customization will expand as you unlock items in the Locker!</p>
              <p className="text-sm text-gray-400 mt-2">You start with training gear — earn upgrades through gameplay.</p>
            </div>
          )}

          {tab === 'team' && (
            <div>
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Team Name</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    maxLength={25}
                    className="flex-1 h-12 px-3 rounded-game border-2 border-gray-200 font-semibold focus:border-pitch-500 focus:outline-none"
                  />
                  <button
                    onClick={generateName}
                    className="h-12 px-3 rounded-game bg-electric-50 text-electric-600 font-bold text-sm border-2 border-electric-200 active:scale-95"
                  >
                    🎲
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Jersey Number</p>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={jerseyNum}
                  onChange={(e) => setJerseyNum(Math.min(99, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-20 h-12 px-3 rounded-game border-2 border-gray-200 font-bold text-xl text-center focus:border-pitch-500 focus:outline-none"
                />
              </div>

              <ColorSwatchPicker label="Primary Color" colors={TEAM_COLORS} selected={primaryColor} onSelect={setPrimaryColor} colorMap={TEAM_HEX} />
              <ColorSwatchPicker label="Secondary Color" colors={TEAM_COLORS} selected={secondaryColor} onSelect={setSecondaryColor} colorMap={TEAM_HEX} />
            </div>
          )}

          {tab === 'preview' && (
            <div className="text-center">
              <div className="inline-block bg-gradient-to-b from-pitch-50 to-white rounded-game-lg p-6 shadow-sm mb-4">
                <AvatarCanvas
                  skinToneKey={skinTone}
                  hairStyleKey={hairStyle}
                  hairColorKey={hairColor}
                  eyeColorKey={eyeColor}
                  teamPrimaryColorKey={primaryColor}
                  teamSecondaryColorKey={secondaryColor}
                  jerseyNumber={jerseyNum}
                  freckles={freckles}
                  glassesKey={glasses}
                  size={160}
                />
              </div>
              <h3 className="font-display text-lg font-bold text-gray-800">{player.displayName}</h3>
              <p className="text-sm text-gray-500 mb-1">{teamName} · #{jerseyNum}</p>
              <PrimaryButton size="lg" className="w-full mt-4" onClick={handleSave}>
                Save & Start ⚽
              </PrimaryButton>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </ScreenContainer>
  );
}
