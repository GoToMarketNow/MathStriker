import type {
  HealthResponse,
  UserProfile,
  CreateUserRequest,
  Question,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  AssessmentResult,
} from '@math-striker/shared';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export const api = {
  // Health
  health: () => apiFetch<HealthResponse>('/health'),

  // Identity
  createUser: (data: CreateUserRequest) => post<UserProfile>('/users', data),
  updateProfile: (userId: string, data: { displayName?: string; avatarKey?: string }) =>
    post<{ ok: boolean }>('/profile', { userId, ...data }),
  getProgress: (userId: string) => apiFetch<UserProfile & { skillModel: Record<string, number> }>(`/progress/${userId}`),

  // Session
  startSession: (userId: string) => post<{ sessionId: string; seed: number }>('/session/start', { userId }),
  endSession: (sessionId: string) => post<{ ok: boolean; finalScore: number }>('/session/end', { sessionId }),

  // Assessment
  startAssessment: (userId: string) => post<{ assessmentId: string }>('/assessment/start', { userId }),
  submitAssessmentAnswer: (data: { assessmentId: string; questionId: string; answer: string | number; responseTimeMs: number }) =>
    post<{ correct: boolean; explanation?: string; questionsRemaining: number }>('/assessment/answer', data),
  getAssessmentResults: (assessmentId: string) => apiFetch<AssessmentResult>(`/assessment/${assessmentId}/results`),

  // Game
  nextQuestion: (userId: string, sessionId: string) =>
    post<Question>('/game/next-question', { userId, sessionId }),
  submitAnswer: (data: SubmitAnswerRequest & { sessionId: string }) =>
    post<SubmitAnswerResponse>('/game/submit-answer', data),

  // Rewards
  getBadges: () => apiFetch<{ id: string; name: string; description: string; iconKey: string }[]>('/badges'),
};
