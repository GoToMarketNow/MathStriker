import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { QuestionCard, AnswerTile, FeedbackToast, ScreenContainer } from '../design-system';
import { api } from '../lib/api';
import type { Question } from '@math-striker/shared';

// Local question generator fallback (for offline / demo mode)
function localQuestion(index: number): Question {
  const skills = ['multiplication', 'division', 'fractions', 'patterns', 'word_problems'] as const;
  const skill = skills[index % 5];
  const a = 3 + (index % 7);
  const b = 2 + (index % 5);
  const correct = a * b;
  return {
    id: `local_${index}`,
    skillTag: skill,
    difficulty: 2,
    prompt: skill === 'multiplication' ? `What is ${a} × ${b}?` :
            skill === 'division' ? `What is ${correct} ÷ ${a}?` :
            skill === 'fractions' ? `What fraction is ${a - 1} out of ${a}?` :
            skill === 'patterns' ? `What comes next? ${a}, ${a + b}, ${a + b * 2}, ?` :
            `${a} teams with ${b} players each. How many total?`,
    choices: [correct, correct + 2, correct - 1, correct + 5],
    correctAnswer: skill === 'division' ? b :
                   skill === 'fractions' ? `${a - 1}/${a}` :
                   skill === 'patterns' ? a + b * 3 :
                   correct,
    questionType: skill === 'fractions' ? 'visual_fraction' : 'mcq',
  };
}

export function AssessmentScreen() {
  const { player, setPhase, setPlayer, setAssessmentResults } = useGameStore();
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionNum, setQuestionNum] = useState(0);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [tileStates, setTileStates] = useState<Record<number, 'correct' | 'incorrect' | 'default'>>({});
  const [startTime, setStartTime] = useState(Date.now());
  const [scores, setScores] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const loadQuestion = useCallback((idx: number) => {
    const q = localQuestion(idx);
    setQuestion(q);
    setSelected(null);
    setFeedback(null);
    setTileStates({});
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    loadQuestion(0);
  }, [loadQuestion]);

  const handleSelect = (value: string | number) => {
    if (feedback) return;
    setSelected(value);
  };

  const handleSubmit = () => {
    if (selected === null || !question) return;

    const correct = String(selected) === String(question.correctAnswer);
    setFeedback(correct ? 'correct' : 'incorrect');

    // Update tile states
    const newStates: Record<number, 'correct' | 'incorrect' | 'default'> = {};
    question.choices.forEach((c, i) => {
      if (String(c) === String(question.correctAnswer)) newStates[i] = 'correct';
      else if (String(c) === String(selected) && !correct) newStates[i] = 'incorrect';
      else newStates[i] = 'default';
    });
    setTileStates(newStates);

    const newScores = {
      correct: scores.correct + (correct ? 1 : 0),
      total: scores.total + 1,
    };
    setScores(newScores);

    // Auto-advance after feedback
    setTimeout(() => {
      const nextNum = questionNum + 1;
      if (nextNum >= 15) {
        // Assessment complete
        const overallScore = Math.round((newScores.correct / 15) * 100);
        const startingLeague =
          overallScore >= 90 ? 'HS' as const :
          overallScore >= 75 ? 'U14' as const :
          overallScore >= 60 ? 'U12' as const :
          overallScore >= 40 ? 'U10' as const : 'U8' as const;

        setAssessmentResults({
          overallScore,
          perSkillScores: {
            multiplication: overallScore,
            division: overallScore,
            fractions: overallScore,
            patterns: overallScore,
            word_problems: overallScore,
          },
          startingLeague,
        });
        setPlayer({ league: startingLeague, currentDifficulty: Math.max(1, Math.ceil(overallScore / 20)) });
        setPhase('assessment-results');
      } else {
        setQuestionNum(nextNum);
        loadQuestion(nextNum);
      }
    }, 1000);
  };

  if (!question) return null;

  return (
    <ScreenContainer>
      <FeedbackToast type={feedback || 'correct'} visible={!!feedback} />

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1">
          <span>Assessment</span>
          <span>{questionNum + 1} / 15</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-pitch-400 rounded-full"
            animate={{ width: `${((questionNum + 1) / 15) * 100}%` }}
          />
        </div>
      </div>

      <QuestionCard
        skillTag={question.skillTag}
        difficulty={question.difficulty}
        prompt={question.prompt}
      />

      <div className="mt-4 space-y-2">
        {question.choices.map((choice, i) => (
          <AnswerTile
            key={`${question.id}-${i}`}
            label={String(choice)}
            value={choice}
            index={i}
            state={
              feedback
                ? tileStates[i] || 'default'
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
            Submit Answer
          </button>
        </motion.div>
      )}
    </ScreenContainer>
  );
}
