import { create } from 'zustand';
import type { League, Question } from '@math-striker/shared';

export type GamePhase =
  | 'welcome'
  | 'setup'
  | 'avatar-builder'
  | 'assessment-intro'
  | 'assessment'
  | 'assessment-results'
  | 'playing'
  | 'soccer-shot'
  | 'reward'
  | 'progress'
  | 'locker';

interface PlayerState {
  userId: string | null;
  displayName: string;
  avatarKey: string;
  league: League;
  xp: number;
  coins: number;
  streakCurrent: number;
  streakBest: number;
  currentDifficulty: number;
  skillModel: Record<string, number>;
}

interface SessionState {
  sessionId: string | null;
  seed: number;
  questionIndex: number;
}

interface GameState {
  phase: GamePhase;
  player: PlayerState;
  session: SessionState;
  currentQuestion: Question | null;
  assessmentId: string | null;
  assessmentQuestionsRemaining: number;
  assessmentResults: {
    overallScore: number;
    perSkillScores: Record<string, number>;
    startingLeague: League;
  } | null;

  // Last answer feedback
  lastAnswerCorrect: boolean | null;
  lastExplanation: string | null;
  lastRewardEvents: { type: string; amount?: number; badgeId?: string; league?: string }[];
  lastShotParams: { power: number; accuracy: number; keeperLevel: number } | null;
  lastCoachMessage: { title: string; body: string } | null;

  // Sound/motion prefs
  soundEnabled: boolean;
  reduceMotion: boolean;

  // Actions
  setPhase: (phase: GamePhase) => void;
  setPlayer: (updates: Partial<PlayerState>) => void;
  setSession: (updates: Partial<SessionState>) => void;
  setQuestion: (q: Question | null) => void;
  setAssessment: (id: string | null, remaining?: number) => void;
  setAssessmentResults: (results: GameState['assessmentResults']) => void;
  setLastAnswer: (data: {
    correct: boolean;
    explanation?: string;
    rewardEvents?: GameState['lastRewardEvents'];
    shotParams?: GameState['lastShotParams'];
    coachMessage?: GameState['lastCoachMessage'];
  }) => void;
  clearLastAnswer: () => void;
  toggleSound: () => void;
  toggleReduceMotion: () => void;
  reset: () => void;
}

const initialPlayer: PlayerState = {
  userId: null,
  displayName: '',
  avatarKey: '⚽',
  league: 'U8',
  xp: 0,
  coins: 0,
  streakCurrent: 0,
  streakBest: 0,
  currentDifficulty: 1,
  skillModel: {},
};

const initialSession: SessionState = {
  sessionId: null,
  seed: 0,
  questionIndex: 0,
};

export const useGameStore = create<GameState>((set) => ({
  phase: 'welcome',
  player: { ...initialPlayer },
  session: { ...initialSession },
  currentQuestion: null,
  assessmentId: null,
  assessmentQuestionsRemaining: 15,
  assessmentResults: null,
  lastAnswerCorrect: null,
  lastExplanation: null,
  lastRewardEvents: [],
  lastShotParams: null,
  lastCoachMessage: null,
  soundEnabled: true,
  reduceMotion: false,

  setPhase: (phase) => set({ phase }),
  setPlayer: (updates) => set((s) => ({ player: { ...s.player, ...updates } })),
  setSession: (updates) => set((s) => ({ session: { ...s.session, ...updates } })),
  setQuestion: (q) => set({ currentQuestion: q }),
  setAssessment: (id, remaining) =>
    set({ assessmentId: id, assessmentQuestionsRemaining: remaining ?? 15 }),
  setAssessmentResults: (results) => set({ assessmentResults: results }),
  setLastAnswer: (data) =>
    set({
      lastAnswerCorrect: data.correct,
      lastExplanation: data.explanation ?? null,
      lastRewardEvents: data.rewardEvents ?? [],
      lastShotParams: data.shotParams ?? null,
      lastCoachMessage: data.coachMessage ?? null,
    }),
  clearLastAnswer: () =>
    set({
      lastAnswerCorrect: null,
      lastExplanation: null,
      lastRewardEvents: [],
      lastShotParams: null,
      lastCoachMessage: null,
    }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleReduceMotion: () => set((s) => ({ reduceMotion: !s.reduceMotion })),
  reset: () =>
    set({
      phase: 'welcome',
      player: { ...initialPlayer },
      session: { ...initialSession },
      currentQuestion: null,
      assessmentId: null,
      assessmentResults: null,
      lastAnswerCorrect: null,
      lastRewardEvents: [],
      lastShotParams: null,
    }),
}));
