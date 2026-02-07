import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PrimaryButton,
  AnswerTile,
  QuestionCard,
  LeagueBadge,
  StreakMeter,
  AppBarHUD,
  FeedbackToast,
  RewardModal,
  ProgressTimeline,
  VisualMathRenderer,
  ScreenContainer,
} from '../design-system';
import type { AnswerTileState, FeedbackType } from '../design-system';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

export function DesignScreen() {
  const [toastType, setToastType] = useState<FeedbackType | null>(null);
  const [showReward, setShowReward] = useState(false);

  return (
    <ScreenContainer>
      <FeedbackToast type={toastType || 'correct'} visible={!!toastType} />
      <RewardModal
        visible={showReward}
        title="Badge Unlocked!"
        subtitle="Multiplication Master"
        rewardType="badge"
        rewardPayload={{ emoji: '🛡️' }}
        onNext={() => setShowReward(false)}
      />

      <h1 className="font-display text-2xl font-extrabold text-pitch-700 mb-1">
        Design System Gallery
      </h1>
      <p className="text-sm text-gray-400 mb-8">All Math Striker components & states</p>

      <Section title="AppBarHUD">
        <div className="bg-gray-50 rounded-game-lg overflow-hidden -mx-4">
          <AppBarHUD league="U10" score={1250} coins={85} streakCount={4} streakProgress={0.7} onSettings={() => {}} />
        </div>
      </Section>

      <Section title="PrimaryButton">
        <div className="flex flex-wrap gap-3">
          <PrimaryButton variant="primary">Primary</PrimaryButton>
          <PrimaryButton variant="secondary">Secondary</PrimaryButton>
          <PrimaryButton variant="ghost">Ghost</PrimaryButton>
          <PrimaryButton variant="destructive">Destructive</PrimaryButton>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <PrimaryButton loading>Loading</PrimaryButton>
          <PrimaryButton disabled>Disabled</PrimaryButton>
          <PrimaryButton icon="⚽" size="lg">With Icon</PrimaryButton>
        </div>
      </Section>

      <Section title="AnswerTile States">
        <div className="space-y-2">
          {(['default', 'selected', 'correct', 'incorrect', 'disabled'] as AnswerTileState[]).map((state, i) => (
            <AnswerTile key={state} label={`${state.charAt(0).toUpperCase() + state.slice(1)} — 42`} value={42} state={state} index={i} />
          ))}
        </div>
      </Section>

      <Section title="QuestionCard">
        <div className="space-y-4">
          <QuestionCard skillTag="multiplication" difficulty={3} prompt="What is 6 × 7?" hintAvailable onHint={() => { setToastType('hint'); setTimeout(() => setToastType(null), 1200); }} />
          <QuestionCard skillTag="fractions" difficulty={5} prompt="What fraction is shaded?" visual={<VisualMathRenderer type="fractionBars" data={{ numerator: 3, denominator: 8, label: 'Shade count' }} />} />
          <QuestionCard skillTag="patterns" difficulty={2} prompt="What comes next?" visual={<VisualMathRenderer type="patternGrid" data={{ grid: [['🔴','🔵','🔴'],['🔵','🔴','🔵'],['🔴','🔵',null]], missingIndex: [2,2] }} />} />
        </div>
      </Section>

      <Section title="LeagueBadge Variants">
        <div className="flex gap-4 flex-wrap items-end">
          <LeagueBadge league="U8" size="lg" />
          <LeagueBadge league="U10" size="lg" />
          <LeagueBadge league="U12" size="lg" />
          <LeagueBadge league="U14" size="lg" />
          <LeagueBadge league="HS" size="lg" />
          <LeagueBadge league="College" size="lg" isNew />
        </div>
      </Section>

      <Section title="StreakMeter">
        <div className="space-y-3">
          <StreakMeter streakCount={3} progressToBonus={0.4} variant="expanded" />
          <StreakMeter streakCount={5} progressToBonus={1.0} bonusReady variant="expanded" />
        </div>
      </Section>

      <Section title="VisualMathRenderer">
        <div className="flex gap-6 flex-wrap justify-center">
          <VisualMathRenderer type="fractionBars" data={{ numerator: 2, denominator: 5 }} />
          <VisualMathRenderer type="arraysMultiplication" data={{ rows: 3, cols: 4 }} />
        </div>
      </Section>

      <Section title="ProgressTimeline">
        <div className="bg-white rounded-game-lg shadow-sm">
          <ProgressTimeline currentLeague="U12" progressPercent={62} recentBadges={[{ id: '1', emoji: '✖️', name: 'Multiplication Master' }, { id: '2', emoji: '📐', name: 'Fraction Pro' }]} />
        </div>
      </Section>

      <Section title="Interactive Demos">
        <div className="flex flex-wrap gap-3">
          <PrimaryButton variant="primary" onClick={() => { setToastType('correct'); setTimeout(() => setToastType(null), 1200); }}>Correct Toast</PrimaryButton>
          <PrimaryButton variant="destructive" onClick={() => { setToastType('incorrect'); setTimeout(() => setToastType(null), 1200); }}>Incorrect Toast</PrimaryButton>
          <PrimaryButton variant="secondary" onClick={() => setShowReward(true)}>Reward Modal</PrimaryButton>
        </div>
      </Section>

      <Link to="/" className="inline-block text-electric-500 font-semibold mb-8 active:scale-95 transition-transform">← Back to Home</Link>
    </ScreenContainer>
  );
}
