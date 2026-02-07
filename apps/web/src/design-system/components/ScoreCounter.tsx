import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ScoreCounterProps {
  score: number;
  coins: number;
  delta?: number;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const motionVal = useMotionValue(display);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.4,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, motionVal]);

  return <span>{display.toLocaleString()}</span>;
}

export function ScoreCounter({ score, coins, delta }: ScoreCounterProps) {
  return (
    <div className="flex items-center gap-3 font-score">
      <div className="flex items-center gap-1 relative">
        <span className="text-sm">⚽</span>
        <span className="text-lg font-bold text-gray-800">
          <AnimatedNumber value={score} />
        </span>
        {delta && delta > 0 && (
          <motion.span
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="absolute -top-4 right-0 text-sm font-bold text-pitch-500"
          >
            +{delta}
          </motion.span>
        )}
      </div>
      <div className="w-px h-5 bg-gray-200" />
      <div className="flex items-center gap-1">
        <span className="text-sm">🪙</span>
        <span className="text-lg font-bold text-gold-600">
          <AnimatedNumber value={coins} />
        </span>
      </div>
    </div>
  );
}
