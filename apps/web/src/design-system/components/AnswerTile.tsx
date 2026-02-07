import { motion } from 'framer-motion';

export type AnswerTileState = 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled';

interface AnswerTileProps {
  label: string;
  value: string | number;
  state?: AnswerTileState;
  index?: number;
  onSelect?: (value: string | number) => void;
}

const stateStyles: Record<AnswerTileState, string> = {
  default: 'bg-white border-2 border-gray-200 text-gray-800 hover:border-pitch-300 hover:bg-pitch-50',
  selected: 'bg-electric-50 border-2 border-electric-500 text-electric-700 ring-2 ring-electric-200',
  correct: 'bg-pitch-50 border-2 border-pitch-500 text-pitch-700 ring-2 ring-pitch-200',
  incorrect: 'bg-red-50 border-2 border-red-400 text-red-700 ring-2 ring-red-200',
  disabled: 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed',
};

const indexLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

export function AnswerTile({
  label,
  value,
  state = 'default',
  index,
  onSelect,
}: AnswerTileProps) {
  const isInteractive = state === 'default' || state === 'selected';

  return (
    <motion.button
      whileTap={isInteractive ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.12 }}
      onClick={isInteractive ? () => onSelect?.(value) : undefined}
      disabled={!isInteractive}
      aria-label={`Answer ${index !== undefined ? indexLabels[index] + ': ' : ''}${label}`}
      aria-pressed={state === 'selected'}
      className={`
        relative flex items-center gap-3 w-full min-h-[64px] px-4 py-3
        rounded-[20px] font-semibold text-left transition-all duration-150
        select-none ${stateStyles[state]}
      `}
    >
      {index !== undefined && (
        <span className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${state === 'correct' ? 'bg-pitch-500 text-white' :
            state === 'incorrect' ? 'bg-red-400 text-white' :
            state === 'selected' ? 'bg-electric-500 text-white' :
            'bg-gray-100 text-gray-500'}
        `}>
          {state === 'correct' ? '✓' : state === 'incorrect' ? '✗' : indexLabels[index]}
        </span>
      )}
      <span className="flex-1 text-base">{label}</span>
      {state === 'correct' && <span className="text-lg">🎉</span>}
    </motion.button>
  );
}
