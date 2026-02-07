import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { assessments, attempts, progress, rewards } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { createRng } from '../question-engine/rng.js';
import { generateQuestion } from '../question-engine/generator.js';
import {
  scoreAssessment,
  computeRollingAccuracy,
  shouldAdjustDifficulty,
  adjustDifficulty,
  updateSkillModel,
  checkLeaguePromotion,
  type AssessmentAttempt,
} from './engine.js';
import { getSession, updateSession } from '../session/routes.js';
import type { SkillTag } from '@math-striker/shared';

// In-memory assessment state for MVP
const assessmentState = new Map<
  string,
  { userId: string; attempts: AssessmentAttempt[]; questionIndex: number }
>();

export async function skillEngineRoutes(app: FastifyInstance) {
  // ─── Start Assessment ─────────────────────────────
  app.post('/assessment/start', async (req, reply) => {
    const { userId } = req.body as { userId: string };

    const [assessment] = await db
      .insert(assessments)
      .values({ userId })
      .returning();

    assessmentState.set(assessment.id, { userId, attempts: [], questionIndex: 0 });

    // Generate first question
    const rng = createRng(Date.now());
    const question = generateQuestion({ difficulty: 2, index: 0, rng });

    return reply.code(201).send({
      assessmentId: assessment.id,
      question,
      questionsRemaining: 14,
    });
  });

  // ─── Submit Assessment Answer ─────────────────────
  app.post('/assessment/answer', async (req, reply) => {
    const { assessmentId, questionId, answer, responseTimeMs } = req.body as {
      assessmentId: string;
      questionId: string;
      answer: string | number;
      responseTimeMs: number;
    };

    const state = assessmentState.get(assessmentId);
    if (!state) return reply.code(404).send({ error: 'Assessment not found' });

    // Determine correctness from questionId pattern
    const rng = createRng(Date.now() + state.questionIndex);
    const skillTag = questionId.split('_')[0] as string;
    const skillMap: Record<string, SkillTag> = {
      mult: 'multiplication', div: 'division', frac: 'fractions',
      pat: 'patterns', word: 'word_problems',
    };
    const skill = skillMap[skillTag] || 'multiplication';

    // Regenerate question to check correctness
    const question = generateQuestion({ difficulty: 2, index: state.questionIndex, rng });
    const correct = String(answer) === String(question.correctAnswer);

    state.attempts.push({ skillTag: skill, correct, responseTimeMs });
    state.questionIndex++;

    const totalQuestions = 15;
    const remaining = totalQuestions - state.questionIndex;

    if (remaining <= 0) {
      // Assessment complete
      const result = scoreAssessment(state.attempts);

      await db
        .update(assessments)
        .set({ completedAt: new Date(), resultsJson: result })
        .where(eq(assessments.id, assessmentId));

      // Update user progress
      const skillModel: Record<string, number> = {};
      for (const [skill, score] of Object.entries(result.perSkillScores)) {
        skillModel[skill] = score / 100;
      }

      await db
        .update(progress)
        .set({
          currentLeague: result.startingLeague,
          currentDifficulty: result.startingDifficulty,
          skillModel,
          updatedAt: new Date(),
        })
        .where(eq(progress.userId, state.userId));

      assessmentState.delete(assessmentId);

      return reply.send({
        correct,
        explanation: question.explanation,
        questionsRemaining: 0,
        assessmentComplete: true,
        results: result,
      });
    }

    // Generate next question
    const nextRng = createRng(Date.now() + state.questionIndex);
    const nextDifficulty = state.questionIndex > 7 ? 3 : 2; // Slightly harder midway
    const nextQuestion = generateQuestion({ difficulty: nextDifficulty, index: state.questionIndex, rng: nextRng });

    return reply.send({
      correct,
      explanation: correct ? undefined : question.explanation,
      questionsRemaining: remaining,
      nextQuestion,
    });
  });

  // ─── Submit Game Answer (adaptive) ────────────────
  app.post('/game/submit-answer', async (req, reply) => {
    const { userId, sessionId, questionId, answer, responseTimeMs } = req.body as {
      userId: string;
      sessionId: string;
      questionId: string;
      answer: string | number;
      responseTimeMs: number;
    };

    const session = getSession(sessionId);
    if (!session) return reply.code(404).send({ error: 'Session not found' });

    // Get current progress
    const [prog] = await db.select().from(progress).where(eq(progress.userId, userId));
    if (!prog) return reply.code(404).send({ error: 'User not found' });

    // Regenerate question to verify answer
    const rng = createRng(session.seed + (session.questionIndex - 1));
    const weakSkills = Object.entries(prog.skillModel as Record<string, number> || {})
      .filter(([, v]) => v < 0.6)
      .map(([k]) => k as SkillTag);

    const question = generateQuestion({
      difficulty: prog.currentDifficulty,
      index: session.questionIndex - 1,
      rng,
      weakSkills,
    });

    const correct = String(answer) === String(question.correctAnswer);
    const skillTag = question.skillTag;

    // Record attempt
    await db.insert(attempts).values({
      userId,
      questionId,
      correct,
      responseTimeMs,
      skillTag,
      difficulty: prog.currentDifficulty,
    });

    // Update skill model
    const newSkillModel = updateSkillModel(
      (prog.skillModel as Record<string, number>) || {},
      skillTag,
      correct,
    );

    // Compute streak
    const newStreak = correct ? session.streak + 1 : 0;
    const newStreakBest = Math.max(prog.streakBest, newStreak);

    // XP & coins
    const xpGain = correct ? 10 + prog.currentDifficulty * 2 : 2;
    const coinGain = correct ? 5 + (newStreak >= 3 ? 3 : 0) : 0;
    const newXp = prog.xp + xpGain;
    const newCoins = prog.coins + coinGain;

    // Rolling accuracy for difficulty adjustment
    const recentAttempts = await db
      .select()
      .from(attempts)
      .where(eq(attempts.userId, userId))
      .orderBy(desc(attempts.createdAt))
      .limit(20);

    const rollingAccuracy = computeRollingAccuracy({
      attempts: recentAttempts.map((a) => ({ correct: a.correct, skillTag: a.skillTag })),
    });

    // Adjust difficulty every 5 questions
    let newDifficulty = prog.currentDifficulty;
    if (shouldAdjustDifficulty(session.questionIndex % 5 === 0 ? 5 : session.questionIndex % 5)) {
      if (session.questionIndex % 5 === 0) {
        newDifficulty = adjustDifficulty(prog.currentDifficulty, rollingAccuracy);
      }
    }

    // Check league promotion
    const promotion = checkLeaguePromotion(
      prog.currentLeague as any,
      newXp,
      newSkillModel,
    );
    const newLeague = promotion || prog.currentLeague;

    // Build reward events
    const rewardEvents: { type: string; amount?: number; badgeId?: string; league?: string }[] = [];
    if (correct) {
      rewardEvents.push({ type: 'coins', amount: coinGain });
      rewardEvents.push({ type: 'xp', amount: xpGain });
    }
    if (promotion) {
      rewardEvents.push({ type: 'league', league: promotion });
      await db.insert(rewards).values({
        userId,
        type: 'league',
        payloadJson: { league: promotion },
      });
    }

    // Check badge unlocks
    const badgeChecks = [
      { id: 'multiplication_master', skill: 'multiplication', threshold: 0.85 },
      { id: 'fraction_pro', skill: 'fractions', threshold: 0.8 },
      { id: 'pattern_genius', skill: 'patterns', threshold: 0.8 },
      { id: 'word_problem_wizard', skill: 'word_problems', threshold: 0.8 },
      { id: 'division_champ', skill: 'division', threshold: 0.8 },
    ];

    for (const badge of badgeChecks) {
      const mastery = newSkillModel[badge.skill];
      if (mastery && mastery >= badge.threshold) {
        // Check if already awarded
        const existing = await db
          .select()
          .from(rewards)
          .where(eq(rewards.userId, userId));
        const alreadyHas = existing.some(
          (r) => r.type === 'badge' && (r.payloadJson as any)?.badgeId === badge.id,
        );
        if (!alreadyHas) {
          rewardEvents.push({ type: 'badge', badgeId: badge.id });
          await db.insert(rewards).values({
            userId,
            type: 'badge',
            payloadJson: { badgeId: badge.id, skill: badge.skill },
          });
        }
      }
    }

    // Update progress
    await db
      .update(progress)
      .set({
        xp: newXp,
        coins: newCoins,
        streakCurrent: newStreak,
        streakBest: newStreakBest,
        currentDifficulty: newDifficulty,
        currentLeague: newLeague,
        skillModel: newSkillModel,
        updatedAt: new Date(),
      })
      .where(eq(progress.userId, userId));

    // Update session
    updateSession(sessionId, { streak: newStreak, score: session.score + xpGain, coins: session.coins + coinGain });

    // Soccer shot trigger: every correct answer
    const triggerSoccerShot = correct;
    const shotParams = correct
      ? {
          power: Math.min(100, 50 + prog.currentDifficulty * 5 + (newStreak >= 3 ? 15 : 0)),
          accuracy: Math.min(100, 60 + (responseTimeMs < 5000 ? 20 : 10) + newStreak * 3),
          keeperLevel: Math.max(1, Math.ceil(prog.currentDifficulty * 0.8)),
        }
      : undefined;

    return reply.send({
      correct,
      explanation: correct ? undefined : question.explanation,
      progress: {
        score: newXp,
        coins: newCoins,
        streak: newStreak,
        league: newLeague,
      },
      rewardEvents,
      triggerSoccerShot,
      shotParams,
      coachMessage: correct
        ? { title: 'Nice!', body: `${newStreak >= 3 ? `${newStreak} in a row! ` : ''}Keep it up!` }
        : { title: 'Almost!', body: question.explanation || 'Try a different approach next time.' },
    });
  });
}
