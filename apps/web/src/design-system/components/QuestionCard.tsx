import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface QuestionCardProps {
  skillTag: string;
  difficulty: number;
  prompt: string;
  visual?: ReactNode;
  hintAvailable?: boolean;
  onHint?: () => void;
}

const skillColors: Record<string, string> = {
  multiplication: 'bg-electric-100 text-electric-700',
  division: 'bg-purple-100 text-purple-700',
  fractions: 'bg-gold-100 text-gold-700',
  patterns: 'bg-pink-100 text-pink-700',
  word_problems: 'bg-teal-100 text-teal-700',
};

export function QuestionCard({
  skillTag,
  difficulty,
  prompt,
  visual,
  hintAvailable,
  onHint,
}: QuestionCardProps) {
  const tagStyle = skillColors[skillTag] || 'bg-gray-100 text-gray-700';
  const skillLabel = skillTag.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-game-lg shadow-lg p-5 w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${tagStyle}`}>
          {skillLabel}
        </span>
        <div className="flex gap-1" aria-label={`Difficulty ${difficulty} of 6`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < difficulty ? 'bg-gold-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Prompt */}
      <p className="text-xl font-bold text-gray-800 leading-snug mb-3 font-display">
        {prompt}
      </p>

      {/* Visual slot */}
      {visual && (
        <div className="flex justify-center py-3">
          {visual}
        </div>
      )}

      {/* Hint */}
      {hintAvailable && (
        <button
          onClick={onHint}
          className="text-sm text-electric-500 font-semibold mt-2 active:scale-95 transition-transform"
          aria-label="Get a hint"
        >
          💡 Need a hint?
        </button>
      )}
    </motion.div>
  );
}
