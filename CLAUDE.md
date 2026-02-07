# Math Striker — Design System Rules

> For AI agents (Claude, Cursor, etc.) integrating Figma designs via MCP.
> This file documents all conventions, tokens, components, and patterns used in the codebase.

---

## 1. Project Overview

**Math Striker** is a mobile-first adaptive math/soccer learning game for grades 2–4. The web app is a React SPA with a soccer-themed design language.

| Aspect | Choice |
|--------|--------|
| Framework | React 18 (functional components, hooks only) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3.4 + CSS custom properties |
| Animation | Framer Motion 11 |
| State | Zustand 4 |
| Bundler | Vite 5 |
| Monorepo | pnpm workspaces |

---

## 2. Token Definitions

### 2.1 Where Tokens Live

Tokens are defined in **three synchronized locations**:

| Location | Purpose | Format |
|----------|---------|--------|
| `apps/web/tailwind.config.ts` | Tailwind utility classes | JS config |
| `apps/web/src/index.css` | CSS custom properties (`:root`) | CSS vars |
| `apps/web/src/design-system/tokens/tokens.ts` | JS/TS runtime access | TypeScript const objects |

**Rule:** When adding a new token, update ALL THREE locations to stay in sync.

### 2.2 Color Palette

Three primary color scales, each with 50–900 shades:

```
pitch    (green) — Primary brand, success, field theme
electric (blue)  — Secondary, interactive, selected states
gold     (amber) — Accent, rewards, coins, achievements
```

Tailwind class naming: `bg-pitch-500`, `text-electric-700`, `border-gold-400`

CSS var naming: `--c-primary-500`, `--c-secondary-500`, `--c-accent-500`

TS object: `colors.pitch[500]`, `colors.electric[500]`, `colors.gold[500]`

Semantic colors (not scaled):
- `success: #22c55e` (= pitch-500)
- `warning: #f59e0b` (= gold-500)
- `error:   #ef4444`
- `bg:      #f0fdf4` (= pitch-50, light green tint)
- `surface: #ffffff`
- `surface2: #f8fafc`

### 2.3 Typography

Two font families loaded from Google Fonts:

```css
font-display: 'Nunito', 'Poppins', sans-serif  /* Headings, labels, buttons */
font-score:   'Rajdhani', 'Nunito', sans-serif  /* Scores, counters, numbers */
```

Weights used: 400 (body), 600 (semibold labels), 700 (bold headings), 800 (extrabold hero)

Tailwind: `font-display`, `font-score`

### 2.4 Spacing & Sizing

```typescript
tapMin: 48           // Minimum touch target (px) — WCAG AA
radiusSm: 12         // Small radius (inputs, tags)
radiusDefault: 16    // Default radius (cards, buttons) → Tailwind: rounded-game
radiusLg: 24         // Large radius (modals, sheets) → Tailwind: rounded-game-lg
maxContentWidth: 560 // Max content width (px) — mobile-first
```

Tailwind custom: `rounded-game` (16px), `rounded-game-lg` (24px), `min-h-tap-min` (48px)

### 2.5 Motion

```typescript
tapDuration: 0.15       // Button press feedback
transitionDuration: 0.3 // Standard transitions
springSnappy: { type: 'spring', stiffness: 400, damping: 25 }  // UI elements
springBouncy: { type: 'spring', stiffness: 300, damping: 15 }  // Rewards, celebrations
easeOut: [0.16, 1, 0.3, 1] // Custom bezier for exits
```

**Rule:** Always use Framer Motion for animations, not CSS transitions. Exception: Tailwind `transition-*` utilities for hover/focus color changes.

---

## 3. Component Library

### 3.1 Location & Architecture

```
apps/web/src/design-system/
├── components/
│   ├── PrimaryButton.tsx      # Button with variants + Framer tap animation
│   ├── AnswerTile.tsx         # MCQ answer option with state feedback
│   ├── QuestionCard.tsx       # Question display with timer and visual support
│   ├── LeagueBadge.tsx        # League tier indicator
│   ├── ScoreCounter.tsx       # Animated score display
│   ├── StreakMeter.tsx        # Streak indicator with fire animation
│   ├── AppBarHUD.tsx          # Top bar: league + score + streak
│   ├── FeedbackToast.tsx      # Correct/incorrect toast notification
│   ├── RewardModal.tsx        # Modal for badge/league/coins rewards
│   ├── ProgressTimeline.tsx   # Vertical league progression
│   ├── VisualMathRenderer.tsx # Renders fraction bars, arrays, number lines
│   ├── ScreenContainer.tsx    # Layout wrapper (max-width: 560px, padding)
│   └── avatar/
│       ├── AvatarCanvas.tsx   # Layered SVG avatar renderer
│       ├── AttributePicker.tsx # Horizontal carousel picker
│       ├── LockerGrid.tsx     # 3-column cosmetics grid with ItemCard
│       └── index.ts           # Barrel export
├── tokens/
│   ├── tokens.ts              # JS token constants
│   └── index.ts               # Re-export
└── index.ts                   # Barrel export (all components + tokens + types)
```

### 3.2 Component Patterns

Every component follows this pattern:

```tsx
// 1. Imports: framer-motion first, then React types, then design system, then shared
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

// 2. Exported types for variants/states
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

// 3. Props interface (not exported — use component name + "Props")
interface PrimaryButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  // ... className is always last optional prop
  className?: string;
}

// 4. Style maps (const, outside component)
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-pitch-500 text-white shadow-md hover:bg-pitch-600',
  // ...
};

// 5. Named export (no default exports)
export function PrimaryButton({ children, variant = 'primary', className = '' }: PrimaryButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`... ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
```

**Rules:**
- Always use `motion.*` elements for interactive components (buttons, tiles, cards)
- Always export via named export, never default
- Always accept `className` as last optional prop for composition
- Always use `aria-*` attributes for accessibility
- All touch targets minimum 48px (`min-h-tap-min` or explicit `min-h-[48px]`)
- Barrel export everything through `design-system/index.ts`

### 3.3 Core Components — Figma Mapping

| Component | Figma Layer Name | Key Props | Notes |
|-----------|-----------------|-----------|-------|
| `PrimaryButton` | `CTA_Button`, `Button/Primary` | `variant`, `size`, `loading`, `icon` | 4 variants: primary/secondary/ghost/destructive |
| `AnswerTile` | `AnswerOption`, `MCQ_Tile` | `label`, `value`, `state`, `index` | 5 states: default/selected/correct/incorrect/disabled |
| `QuestionCard` | `QuestionCard`, `MathQuestion` | `question`, `timerMs`, `visual` | Contains prompt + optional VisualMathRenderer |
| `ScreenContainer` | `Screen`, `PageFrame` | `children`, `noPadding` | max-w-[560px], mx-auto, min-h-screen |
| `AppBarHUD` | `TopBar`, `HUD` | `league`, `xp`, `streak`, `coins` | Sticky top bar |
| `LeagueBadge` | `LeagueBadge`, `TierBadge` | `league`, `size` | Colored ring per league |
| `ScoreCounter` | `ScoreDisplay`, `XPCounter` | `value`, `label`, `icon` | Animated number with Rajdhani font |
| `StreakMeter` | `StreakBar`, `StreakIndicator` | `current`, `best`, `max` | Fire 🔥 emoji at 5+ |
| `FeedbackToast` | `Toast`, `FeedbackPopup` | `type`, `message`, `visible` | Slides in from bottom |
| `RewardModal` | `RewardPopup`, `UnlockModal` | `type`, `payload`, `onClose` | Full-screen overlay |
| `AvatarCanvas` | `Avatar`, `PlayerCharacter` | `skinToneKey`, `hairStyleKey`, `teamColors`... | SVG layers |

---

## 4. Screen Architecture

### 4.1 Screen Files

Screens live in `apps/web/src/screens/` — one file per screen.

```
screens/
├── WelcomeScreen.tsx         # Entry point, logo + "Play" button
├── SetupScreen.tsx           # Name input, age picker
├── AvatarBuilderScreen.tsx   # 4-tab character customizer
├── AssessmentIntroScreen.tsx  # Pre-assessment explanation
├── AssessmentScreen.tsx      # Diagnostic quiz (8–12 questions)
├── AssessmentResultsScreen.tsx # Skill radar + league placement
├── GamePlayScreen.tsx        # Core game loop: question → answer → feedback
├── SoccerShotScreen.tsx      # Soccer shot mini-game on correct answer
├── ProgressScreen.tsx        # League timeline + stats
├── LockerScreen.tsx          # Cosmetics inventory grid
├── ParentScreen.tsx          # Parent dashboard (analytics)
├── DemoScreen.tsx            # Component showcase
└── DesignScreen.tsx          # Design token showcase
```

### 4.2 Screen Pattern

```tsx
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PrimaryButton, ScreenContainer } from '../design-system';

export function WelcomeScreen() {
  const setPhase = useGameStore((s) => s.setPhase);

  return (
    <ScreenContainer className="flex flex-col items-center justify-center text-center">
      {/* Always wrap screens in ScreenContainer */}
      {/* Use Framer Motion for entrance animations */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Content */}
      </motion.div>
    </ScreenContainer>
  );
}
```

**Rules:**
- Every screen wraps content in `<ScreenContainer>`
- Screens read/write state via `useGameStore` (Zustand)
- Phase transitions via `setPhase('next-phase')`
- Entrance animations use Framer Motion `initial/animate`

---

## 5. State Management

### 5.1 Zustand Store

Single store at `apps/web/src/store/gameStore.ts`:

```typescript
type GamePhase =
  | 'welcome' | 'setup' | 'avatar-builder'
  | 'assessment-intro' | 'assessment' | 'assessment-results'
  | 'playing' | 'soccer-shot' | 'reward' | 'progress' | 'locker';
```

**Rule:** Navigation is state-driven (GamePhase), NOT route-driven. The `App.tsx` `GameRouter` switches on `phase`. Direct URL routes (`/avatar`, `/locker`, etc.) exist for standalone testing.

---

## 6. Styling Rules

### 6.1 Tailwind-First

Use Tailwind utility classes for ALL styling. Custom CSS is only for:
- Google Fonts import
- CSS custom properties (`:root`)
- `body` base styles

### 6.2 Color Usage

| Context | Class Pattern |
|---------|---------------|
| Primary actions | `bg-pitch-500 text-white` |
| Secondary actions | `bg-electric-500 text-white` |
| Selected/active states | `border-electric-500 bg-electric-50` |
| Correct feedback | `border-pitch-500 bg-pitch-50` |
| Incorrect feedback | `border-red-400 bg-red-50` |
| Rewards/gold | `text-gold-500`, `bg-gold-50` |
| Page background | `bg-pitch-50` (via body) |
| Card surfaces | `bg-white rounded-game shadow-sm` |
| Text primary | `text-gray-800` or `text-pitch-900` |
| Text secondary | `text-gray-500` or `text-pitch-600` |

### 6.3 Responsive Design

Mobile-first with max-width constraint:
- Base: 320px+ (phone)
- `md:` breakpoint for tablets (padding adjustments)
- Max content: 560px (`max-w-[560px]` via ScreenContainer)
- No desktop-specific layouts — the game is mobile-optimized

### 6.4 Shadows

- Cards/tiles: `shadow-sm`
- Buttons: `shadow-md`
- Modals: `shadow-xl`
- Elevated headers: `shadow-lg`

---

## 7. Asset Management

### 7.1 Icons

Emoji-based icon system (no icon library). Common mappings:

```
⚽ Soccer ball (brand)     🔥 Streak       ⭐ XP/Stars
🏆 Trophy (achievement)   💪 Power         👑 Top tier
🎉 Celebration            💰 Coins         🔒 Locked
✓  Correct (CSS/unicode)  ✗  Incorrect     🎲 Random/dice
```

**Rule:** Use emoji for game UI icons. If a Figma design uses custom SVG icons, implement them as inline SVG components in the design-system, NOT as image files.

### 7.2 Avatar System

Avatars are rendered as programmatic SVG (no image assets):
- `AvatarCanvas.tsx` renders layered SVG paths
- Color maps defined inline: `SKIN_HEX`, `HAIR_HEX`, `TEAM_HEX`
- Hair shapes generated by `getHairPath()` function
- 100×130 viewBox, scalable via `size` prop

### 7.3 Visual Math

`VisualMathRenderer.tsx` renders math visuals as SVG:
- Fraction bars (`fractionBars`)
- Fraction circles (`fractionCircle`)
- Number lines (`numberLine`)
- Arrays (`arraysMultiplication`)
- Pattern grids (`patternGrid`)

Each visual type is defined by a structured JSON payload from the question bank.

---

## 8. API Integration

### 8.1 API Client

Located at `apps/web/src/lib/api.ts`:

```typescript
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

Pattern: `api.methodName()` → calls `apiFetch<ResponseType>(path, options)`

### 8.2 Shared Types

All API types defined in `packages/shared/src/schemas.ts`:
- Zod schemas for validation
- TypeScript types exported for both API and web

---

## 9. Figma → Code Mapping Guide

When implementing a Figma design:

1. **Identify existing components** — check `design-system/index.ts` exports first
2. **Use ScreenContainer** — every full-screen frame maps to `<ScreenContainer>`
3. **Map colors** — Figma fills → Tailwind `bg-pitch-*`, `bg-electric-*`, `bg-gold-*`
4. **Map typography** — Figma text → `font-display` (headings) or `font-score` (numbers)
5. **Map spacing** — Figma auto-layout gaps → Tailwind `gap-*`, `p-*`, `m-*`
6. **Map radius** — 16px → `rounded-game`, 24px → `rounded-game-lg`, 12px → `rounded-xl`
7. **Map animations** — any transition → Framer Motion, not CSS
8. **Map states** — Figma variants → component props (e.g., `state="correct"`)

### 9.1 Figma Variable → Tailwind Class Mapping

| Figma Variable | Tailwind Class |
|----------------|----------------|
| `colors/primary/*` | `pitch-*` |
| `colors/secondary/*` | `electric-*` |
| `colors/accent/*` | `gold-*` |
| `colors/error` | `red-*` |
| `colors/background` | `pitch-50` |
| `colors/surface` | `white` |
| `spacing/xs` (4px) | `1` |
| `spacing/sm` (8px) | `2` |
| `spacing/md` (16px) | `4` |
| `spacing/lg` (24px) | `6` |
| `spacing/xl` (32px) | `8` |
| `radius/default` (16px) | `rounded-game` |
| `radius/large` (24px) | `rounded-game-lg` |
| `font/display` | `font-display` |
| `font/score` | `font-score` |

---

## 10. File Naming & Organization

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase `.tsx` | `PrimaryButton.tsx` |
| Screens | PascalCase + `Screen` suffix | `WelcomeScreen.tsx` |
| Store | camelCase + `Store` suffix | `gameStore.ts` |
| Tokens | camelCase `.ts` | `tokens.ts` |
| Utils/lib | camelCase `.ts` | `api.ts` |
| Barrel exports | `index.ts` | `design-system/index.ts` |

---

## 11. Accessibility Requirements

- All buttons: `aria-label` or visible text
- Answer tiles: `aria-pressed` for selected state
- Loading states: `aria-busy="true"`
- Disabled states: `aria-disabled="true"` (in addition to `disabled`)
- Touch targets: minimum 48×48px
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Motion: respect `prefers-reduced-motion` (Framer Motion handles this)

---

## 12. League Theme Colors

Used throughout for theming badges, progress bars, backgrounds:

| League | Color | Ring | Emoji |
|--------|-------|------|-------|
| U8 | `#86efac` (pitch-300) | `#22c55e` (pitch-500) | 🌱 |
| U10 | `#60a5fa` (electric-400) | `#3b82f6` (electric-500) | ⭐ |
| U12 | `#fbbf24` (gold-400) | `#d97706` (gold-600) | 🔥 |
| U14 | `#f472b6` (pink-400) | `#db2777` (pink-600) | 💪 |
| HS | `#a78bfa` (violet-400) | `#7c3aed` (violet-600) | 🏆 |
| College | `#fb923c` (orange-400) | `#ea580c` (orange-600) | 👑 |
