import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function HomeScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-8"
      >
        <div className="text-6xl mb-4">⚽</div>
        <h1 className="font-display text-4xl font-extrabold text-pitch-700">
          Math Striker
        </h1>
        <p className="mt-2 text-lg text-pitch-600 font-semibold">
          Score goals with math skills!
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <Link
          to="/play"
          className="block w-full rounded-game bg-pitch-500 px-8 py-4 text-center text-lg font-bold text-white shadow-md active:scale-95 transition-transform min-h-tap-min"
        >
          Play Now
        </Link>
        <Link
          to="/design"
          className="block w-full rounded-game bg-electric-500 px-8 py-4 text-center text-lg font-bold text-white shadow-md active:scale-95 transition-transform min-h-tap-min"
        >
          Design Gallery
        </Link>
      </motion.div>

      <p className="mt-12 text-sm text-gray-400">Grades 2–4 · Adaptive · Mobile-First</p>
    </div>
  );
}
