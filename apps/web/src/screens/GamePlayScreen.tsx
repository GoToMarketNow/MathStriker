import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import {
  AppBarHUD,
  QuestionCard,
  AnswerTile,
  FeedbackToast,
  RewardModal,
  ScreenContainer,
} from '../design-system';
import type { Question } from '@math-striker/shared';

// Local question generator for demo/offline
function generateLocalQuestion(index: number, difficulty: number): Question {
  const skills = ['multiplication', 'division', 'fractions', 'patterns', 'word_problems'] as const;
  const skill = skills[index % 5];
  const base = difficulty + 1;
  const a = base + (index % 8);
  const b = base + ((index * 3) % 6);
  const correct = a * b;

  const prompts: Record<string, string> = {
    multiplication: `What is ${a} × ${b}?`,
    division: `What is ${correct} ÷ ${a}?`,
    fractions: `What is ${a - 1}/${a + 1} as a fraction?`,
    patterns: `Next in: ${a}, ${a + b}, ${a + b * 2}, ?`,
    word_problems: `${a} teams × ${b} players = how many?`,
  };

  const answers: Record<string, number> = {
    multiplication: correct,
    division: b,
    fractions: correct,
    patterns: a + b * 3,
    word_problems: correct,
  };

  const ans = answers[skill];
  return {
    id: `game_${index}`,
    skillTag: skill,
    difficulty,
    prompt: prompts[skill],
    choices: [ans, ans + 2, ans - 3, ans + 7].sort(() => Math.random() - 0.5),
    correctAnswer: ans,
    questionType: 'mcq',
    explanation: `The answer is ${ans}.`,
  };
}

export function GamePlayScreen() {
  const store = useGameStore();
  const { player, setPlayer, setPhase } = store;

  const [question, setQuestion] = useState<Question | null>(null);
  const [questionNum, setQuestionNum] = useState(0);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [tileStates, setTileStates] = useState<Record<number, string>>({});
  const [showReward, setShowReward] = useState(false);
  const [rewardTitle, setRewardTitle] = useState('');
  const [streak, setStreak] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const loadNext = useCallback((idx: number) => {
    const q = generateLocalQuestion(idx, player.currentDifficulty);
    setQuestion(q);
    setSelected(null);
    setFeedback(null);
    setTileStates({});
    setStartTime(Date.now());
  }, [player.currentDifficulty]);

  useEffect(() => {
    loadNext(0);
  }, [loadNext]);

  const handleSelect = (value: string | number) => {
    if (feedback) return;
    setSelected(value);
  };

  const handleSubmit = () => {
    if (selected === null || !question) return;
    const correct = String(selected) === String(question.correctAnswer);

    setFeedback(correct ? 'correct' : 'incorrect');

    const newStates: Record<number, string> = {};
    question.choices.forEach((c, i) => {
      if (String(c) === String(question.correctAnswer)) newStates[i] = 'correct';
      else if (String(c) === String(selected) && !correct) newStates[i] = 'incorrect';
      else newStates[i] = 'default';
    });
    setTileStates(newStates);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const xpGain = 10 + player.currentDifficulty * 2;
      const coinGain = 5 + (newStreak >= 3 ? 3 : 0);
      setPlayer({
        xp: player.xp + xpGain,
        coins: player.coins + coinGain,
        streakCurrent: newStreak,
        streakBest: Math.max(player.streakBest, newStreak),
      });

      // Show reward for milestones
      if (newStreak > 0 && newStreak % 5 === 0) {
        setTimeout(() => {
          setRewardTitle(`${newStreak} Streak! 🔥`);
          setShowReward(true);
        }, 1000);
      } else {
        // Go to soccer shot on correct answers
        setTimeout(() => {
          setPhase('soccer-shot');
        }, 1000);
      }
    } else {
      setStreak(0);
      setPlayer({ streakCurrent: 0 });
      setTimeout(() => {
        const next = questionNum + 1;
        setQuestionNum(next);
        loadNext(next);
      }, 1500);
    }
  };

  const handleContinueFromReward = () => {
    setShowReward(false);
    setPhase('soccer-shot');
  };

  const handleContinueFromFeedback = () => {
    if (feedback === 'correct') {
      setPhase('soccer-shot');
    }
  };

  // After returning from soccer shot, load next question
  useEffect(() => {
    if (store.phase === 'playing' && feedback === 'correct') {
      const next = questionNum + 1;
      setQuestionNum(next);
      loadNext(next);
    }
  }, [store.phase]);

  if (!question) return null;

  const streakProgress = Math.min(1, (streak % 5) / 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pitch-50 to-white">
      <AppBarHUD
        league={player.league}
        score={player.xp}
        coins={player.coins}
        streakCount={streak}
        streakProgress={streakProgress}
        bonusReady={streakProgress >= 1}
        onSettings={() => setPhase('progress')}
      />

      <FeedbackToast type={feedback || 'correct'} visible={!!feedback} />

      <RewardModal
        visible={showReward}
        title={rewardTitle}
        subtitle="Keep going!"
        rewardType="coins"
        rewardPayload={{ emoji: '🔥', amount: 10 }}
        onNext={handleContinueFromReward}
      />

      <ScreenContainer>
        <div className="pt-2">
          <QuestionCard
            skillTag={question.skillTag}
            difficulty={question.difficulty}
            prompt={question.prompt}
          />
        </div>

        <div className="mt-4 space-y-2">
          {question.choices.map((choice, i) => (
            <AnswerTile
              key={`${question.id}-${i}`}
              label={String(choice)}
              value={choice}
              index={i}
              state={
                feedback
                  ? (tileStates[i] as any) || 'default'
                  : String(choice) === String(selected)
                  ? 'selected'
                  : 'default'
              }
              onSelect={handleSelect}
            />
          ))}
        </div>

        {!feedback && selected !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <button
              onClick={handleSubmit}
              className="w-full h-14 rounded-game bg-pitch-500 text-white font-bold text-lg shadow-md active:scale-95 transition-transform"
            >
              Submit ⚽
            </button>
          </motion.div>
        )}
      </ScreenContainer>
    </div>
  );
}
