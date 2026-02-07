// Starter catalog: seeded into catalog_items table
// 40+ items across cosmetics and skill perks

export const CATALOG_SEED = [
  // ─── STARTER ITEMS (given to all players) ─────────
  { id: 'cleats_basic', category: 'cleats', name: 'Training Cleats', rarity: 'common', unlockRule: null, assetKey: 'cleats/basic_01', statMods: null, isStarter: true },
  { id: 'shinguards_basic', category: 'shinguards', name: 'Training Shin Guards', rarity: 'common', unlockRule: null, assetKey: 'shinguards/basic_01', statMods: null, isStarter: true },
  { id: 'socks_basic', category: 'socks', name: 'Classic Socks', rarity: 'common', unlockRule: null, assetKey: 'socks/basic_01', statMods: null, isStarter: true },
  { id: 'ball_basic', category: 'balls', name: 'Match Ball', rarity: 'common', unlockRule: null, assetKey: 'balls/basic_01', statMods: null, isStarter: true },

  // ─── CLEATS (unlockable) ──────────────────────────
  { id: 'cleats_speed', category: 'cleats', name: 'Speed Cleats', rarity: 'rare', unlockRule: { type: 'league', league: 'U10' }, assetKey: 'cleats/speed_01', statMods: { accuracy: 3 }, isStarter: false },
  { id: 'cleats_lightning', category: 'cleats', name: 'Lightning Cleats', rarity: 'epic', unlockRule: { type: 'league', league: 'U14' }, assetKey: 'cleats/lightning_01', statMods: { power: 5 }, isStarter: false },
  { id: 'cleats_golden', category: 'cleats', name: 'Golden Boots', rarity: 'legendary', unlockRule: { type: 'league', league: 'College' }, assetKey: 'cleats/golden_01', statMods: { power: 5, accuracy: 5 }, isStarter: false },

  // ─── SHINGUARDS ───────────────────────────────────
  { id: 'shinguards_carbon', category: 'shinguards', name: 'Carbon Fiber Guards', rarity: 'rare', unlockRule: { type: 'badge', badgeId: 'multiplication_master' }, assetKey: 'shinguards/carbon_01', statMods: null, isStarter: false },
  { id: 'shinguards_dragon', category: 'shinguards', name: 'Dragon Guards', rarity: 'epic', unlockRule: { type: 'streak', threshold: 10 }, assetKey: 'shinguards/dragon_01', statMods: null, isStarter: false },

  // ─── HEADBANDS ────────────────────────────────────
  { id: 'headband_classic', category: 'headbands', name: 'Classic Headband', rarity: 'common', unlockRule: { type: 'league', league: 'U10' }, assetKey: 'headbands/classic_01', statMods: null, isStarter: false },
  { id: 'headband_star', category: 'headbands', name: 'Star Headband', rarity: 'rare', unlockRule: { type: 'badge', badgeId: 'pattern_genius' }, assetKey: 'headbands/star_01', statMods: null, isStarter: false },
  { id: 'headband_flame', category: 'headbands', name: 'Flame Headband', rarity: 'epic', unlockRule: { type: 'streak', threshold: 15 }, assetKey: 'headbands/flame_01', statMods: null, isStarter: false },

  // ─── GLOVES ───────────────────────────────────────
  { id: 'gloves_keeper', category: 'gloves', name: 'Keeper Gloves', rarity: 'rare', unlockRule: { type: 'league', league: 'U12' }, assetKey: 'gloves/keeper_01', statMods: null, isStarter: false },
  { id: 'gloves_frost', category: 'gloves', name: 'Frost Gloves', rarity: 'epic', unlockRule: { type: 'mastery', skill: 'fractions', threshold: 0.9 }, assetKey: 'gloves/frost_01', statMods: null, isStarter: false },

  // ─── JERSEYS (special) ────────────────────────────
  { id: 'jersey_galaxy', category: 'jerseys', name: 'Galaxy Kit', rarity: 'epic', unlockRule: { type: 'league', league: 'HS' }, assetKey: 'jerseys/galaxy_01', statMods: null, isStarter: false },
  { id: 'jersey_champion', category: 'jerseys', name: 'Champion Kit', rarity: 'legendary', unlockRule: { type: 'league', league: 'College' }, assetKey: 'jerseys/champion_01', statMods: null, isStarter: false },
  { id: 'jersey_retro', category: 'jerseys', name: 'Retro Kit', rarity: 'rare', unlockRule: { type: 'badge', badgeId: 'division_champ' }, assetKey: 'jerseys/retro_01', statMods: null, isStarter: false },

  // ─── BALLS ────────────────────────────────────────
  { id: 'ball_golden', category: 'balls', name: 'Golden Ball', rarity: 'legendary', unlockRule: { type: 'league', league: 'College' }, assetKey: 'balls/golden_01', statMods: null, isStarter: false },
  { id: 'ball_neon', category: 'balls', name: 'Neon Ball', rarity: 'rare', unlockRule: { type: 'league', league: 'U12' }, assetKey: 'balls/neon_01', statMods: null, isStarter: false },
  { id: 'ball_fire', category: 'balls', name: 'Fire Ball', rarity: 'epic', unlockRule: { type: 'streak', threshold: 20 }, assetKey: 'balls/fire_01', statMods: null, isStarter: false },

  // ─── CELEBRATIONS ─────────────────────────────────
  { id: 'cele_backflip', category: 'celebrations', name: 'Backflip', rarity: 'rare', unlockRule: { type: 'league', league: 'U12' }, assetKey: 'celebrations/backflip', statMods: null, isStarter: false },
  { id: 'cele_slide', category: 'celebrations', name: 'Knee Slide', rarity: 'common', unlockRule: { type: 'league', league: 'U10' }, assetKey: 'celebrations/slide', statMods: null, isStarter: false },
  { id: 'cele_dance', category: 'celebrations', name: 'Victory Dance', rarity: 'epic', unlockRule: { type: 'streak', threshold: 10 }, assetKey: 'celebrations/dance', statMods: null, isStarter: false },

  // ─── STADIUM THEMES ───────────────────────────────
  { id: 'stadium_night', category: 'stadiums', name: 'Night Game', rarity: 'rare', unlockRule: { type: 'league', league: 'U14' }, assetKey: 'stadiums/night_01', statMods: null, isStarter: false },
  { id: 'stadium_tropical', category: 'stadiums', name: 'Tropical Pitch', rarity: 'epic', unlockRule: { type: 'badge', badgeId: 'word_problem_wizard' }, assetKey: 'stadiums/tropical_01', statMods: null, isStarter: false },

  // ─── STICKERS / PROFILE COSMETICS ─────────────────
  { id: 'sticker_star', category: 'stickers', name: 'Star Badge', rarity: 'common', unlockRule: { type: 'league', league: 'U10' }, assetKey: 'stickers/star', statMods: null, isStarter: false },
  { id: 'sticker_crown', category: 'stickers', name: 'Crown Badge', rarity: 'legendary', unlockRule: { type: 'league', league: 'College' }, assetKey: 'stickers/crown', statMods: null, isStarter: false },

  // ─── SKILL PERKS ──────────────────────────────────
  { id: 'skill_power_boost', category: 'skills', name: 'Power Boost', rarity: 'rare', unlockRule: { type: 'badge', badgeId: 'multiplication_master' }, assetKey: 'skills/power_boost', statMods: { power: 5 }, isStarter: false },
  { id: 'skill_accuracy_boost', category: 'skills', name: 'Precision', rarity: 'rare', unlockRule: { type: 'badge', badgeId: 'fraction_pro' }, assetKey: 'skills/accuracy_boost', statMods: { accuracy: 5 }, isStarter: false },
  { id: 'skill_curve_shot', category: 'skills', name: 'Curve Shot', rarity: 'epic', unlockRule: { type: 'league', league: 'U14' }, assetKey: 'skills/curve_shot', statMods: { curve: 1 }, isStarter: false },
  { id: 'skill_volley', category: 'skills', name: 'Volley Shot', rarity: 'epic', unlockRule: { type: 'mastery', skill: 'multiplication', threshold: 0.9 }, assetKey: 'skills/volley', statMods: { power: 8 }, isStarter: false },
  { id: 'skill_focus', category: 'skills', name: 'Focus', rarity: 'rare', unlockRule: { type: 'badge', badgeId: 'pattern_genius' }, assetKey: 'skills/focus', statMods: { timeBonus: 3000 }, isStarter: false },
  { id: 'skill_streak_shield', category: 'skills', name: 'Streak Shield', rarity: 'epic', unlockRule: { type: 'streak', threshold: 15 }, assetKey: 'skills/streak_shield', statMods: { streakShield: 1 }, isStarter: false },
  { id: 'skill_lucky_bounce', category: 'skills', name: 'Lucky Bounce', rarity: 'legendary', unlockRule: { type: 'league', league: 'HS' }, assetKey: 'skills/lucky_bounce', statMods: { luckyBounce: 0.1 }, isStarter: false },
];
