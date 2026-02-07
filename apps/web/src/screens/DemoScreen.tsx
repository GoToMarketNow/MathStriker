import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function DemoScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-game-lg bg-white p-8 shadow-lg">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="font-display text-2xl font-bold text-pitch-700 mb-2">Game Demo</h2>
          <p className="text-gray-500 mb-6">
            The full gameplay flow will be built in Sprint 5. This screen will feature the
            assessment, game loop, soccer shots, and rewards.
          </p>
          <div className="rounded-game bg-pitch-50 border-2 border-dashed border-pitch-200 p-6 text-sm text-pitch-600">
            Coming soon: Question → Answer → Soccer Shot → Reward → Repeat
          </div>
        </div>
        <Link
          to="/"
          className="mt-6 inline-block text-electric-500 font-semibold active:scale-95 transition-transform"
        >
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
