// ─── Math Striker Design Tokens ─────────────────────
// Centralized constants for the entire UI.
// Tailwind handles most styling, but these are useful
// for JS-driven animations and programmatic access.

export const colors = {
  pitch: {
    50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
    400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
    800: '#166534', 900: '#14532d',
  },
  electric: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
    400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
    800: '#1e40af', 900: '#1e3a8a',
  },
  gold: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
    400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
    800: '#92400e', 900: '#78350f',
  },
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  bg: '#f0fdf4',
  surface: '#ffffff',
  surface2: '#f8fafc',
} as const;

export const leagues = {
  U8:      { label: 'U8',      color: '#86efac', ring: '#22c55e', emoji: '🌱' },
  U10:     { label: 'U10',     color: '#60a5fa', ring: '#3b82f6', emoji: '⭐' },
  U12:     { label: 'U12',     color: '#fbbf24', ring: '#d97706', emoji: '🔥' },
  U14:     { label: 'U14',     color: '#f472b6', ring: '#db2777', emoji: '💪' },
  HS:      { label: 'High School', color: '#a78bfa', ring: '#7c3aed', emoji: '🏆' },
  College: { label: 'College', color: '#fb923c', ring: '#ea580c', emoji: '👑' },
} as const;

export const motion = {
  tapDuration: 0.15,
  transitionDuration: 0.3,
  springSnappy: { type: 'spring' as const, stiffness: 400, damping: 25 },
  springBouncy: { type: 'spring' as const, stiffness: 300, damping: 15 },
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
} as const;

export const sizing = {
  tapMin: 48,
  radiusSm: 12,
  radiusDefault: 16,
  radiusLg: 24,
  maxContentWidth: 560,
} as const;
