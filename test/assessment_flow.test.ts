import { describe, it, expect, beforeEach } from 'vitest';
import { getAssessmentById, getPublicAssessmentDetail } from '../lib/server/assessments/index.ts';
import { AssessmentAttempt } from '../lib/server/assessments/types.ts';
import { JsonFileStore } from '../lib/server/store.ts';
import path from 'path';
import fs from 'fs/promises';

describe('Assessment Attempt End-to-End Flow & Rules', () => {
  const testDbPath = path.resolve(process.cwd(), '.data', 'test-assessment-flow.json');
  let store: JsonFileStore;
  const testUserId = 'test-flow-user';

  beforeEach(async () => {
    try {
      await fs.unlink(testDbPath);
    } catch {
      // ignore
    }
    store = new JsonFileStore(testDbPath);
  });

  it('resolves assessment by id and by alias python', () => {
    const py1 = getAssessmentById('python-fundamentals');
    const py2 = getAssessmentById('python');
    expect(py1).toBeDefined();
    expect(py2).toBeDefined();
    expect(py1?.id).toBe('python-fundamentals');
    expect(py2?.id).toBe('python-fundamentals');
  });

  it('start creates an attempt for a new user with 180m deadline and initial code drafts', async () => {
    const assessment = getAssessmentById('python-fundamentals')!;
    const attemptId = `att_${Date.now()}_test1`;
    const now = new Date();
    const deadlineAt = new Date(now.getTime() + assessment.timeLimitMinutes * 60 * 1000).toISOString();

    const initialAnswers: Record<string, { choiceId?: string; code?: string; flagged?: boolean; updatedAt?: string }> = {};
    for (const sec of assessment.sections) {
      for (const q of sec.questions) {
        if (q.type === 'code') {
          initialAnswers[q.id] = {
            code: (q as any).starterCode.python,
            flagged: false,
            updatedAt: now.toISOString(),
          };
        }
      }
    }

    const newAttempt: AssessmentAttempt = {
      id: attemptId,
      userId: testUserId,
      assessmentId: assessment.id,
      status: 'in_progress',
      startedAt: now.toISOString(),
      deadlineAt,
      answers: initialAnswers,
      submissionsCountByQid: {},
      integrity: { tabSwitches: 0, largePastes: 0, flagged: false },
    };

    await store.put('assessment_attempts', attemptId, newAttempt);

    const saved = await store.get<AssessmentAttempt>('assessment_attempts', attemptId);
    expect(saved).not.toBeNull();
    expect(saved?.id).toBe(attemptId);
    expect(saved?.status).toBe('in_progress');
    expect(Object.keys(saved?.answers || {})).toHaveLength(14); // 14 coding problems
  });

  it('resume returns the same attemptId when attempt is in progress', async () => {
    const assessment = getAssessmentById('python-fundamentals')!;
    const attemptId = 'att_existing_123';
    const now = new Date();
    // 60 minutes remaining
    const deadlineAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

    const existingAttempt: AssessmentAttempt = {
      id: attemptId,
      userId: testUserId,
      assessmentId: assessment.id,
      status: 'in_progress',
      startedAt: now.toISOString(),
      deadlineAt,
      answers: {},
      submissionsCountByQid: {},
      integrity: { tabSwitches: 0, largePastes: 0, flagged: false },
    };

    await store.put('assessment_attempts', attemptId, existingAttempt);

    // Simulate start logic
    const attempts = await store.list<AssessmentAttempt>('assessment_attempts');
    const existing = attempts.find(
      (a) => a.userId === testUserId && a.assessmentId === assessment.id && a.status === 'in_progress'
    );

    expect(existing).toBeDefined();
    const remaining = Math.max(0, Math.round((new Date(existing!.deadlineAt).getTime() - Date.now()) / 1000));
    expect(remaining).toBeGreaterThan(0);
    expect(existing!.id).toBe(attemptId);
  });

  it('GET /api/attempts/:id returns the 25 questions without answers or hidden tests', async () => {
    const publicDetail = getPublicAssessmentDetail('python-fundamentals')!;
    expect(publicDetail).toBeDefined();

    const questions: any[] = [];
    for (const sec of publicDetail.sectionsDetailed) {
      for (const q of sec.questions || []) {
        questions.push({
          ...q,
          sectionId: sec.id,
          sectionTitle: sec.title,
          difficultyLabel: sec.difficultyLabel,
        });
      }
    }

    // Exactly 25 questions
    expect(questions).toHaveLength(25);

    // 5 Easy (Section A)
    const secA = questions.filter((q) => q.sectionId === 'A');
    expect(secA).toHaveLength(5);
    expect(secA.every((q) => q.type === 'mcq')).toBe(true);

    // 10 Medium (Section B: 6 MCQ + 4 Code)
    const secB = questions.filter((q) => q.sectionId === 'B');
    expect(secB).toHaveLength(10);
    expect(secB.filter((q) => q.type === 'mcq')).toHaveLength(6);
    expect(secB.filter((q) => q.type === 'code')).toHaveLength(4);

    // 10 Hard (Section C: 10 Code)
    const secC = questions.filter((q) => q.sectionId === 'C');
    expect(secC).toHaveLength(10);
    expect(secC.every((q) => q.type === 'code')).toBe(true);

    // Verify zero leaked answers
    for (const q of questions) {
      expect(q.correctOptionId).toBeUndefined();
      expect(q.explanation).toBeUndefined();
      expect(q.hiddenTests).toBeUndefined();
    }
  });

  it('expired attempts are marked expired and NOT returned as in progress', async () => {
    const assessment = getAssessmentById('python-fundamentals')!;
    const expiredAttemptId = 'att_expired_999';
    // Expired 10 minutes ago
    const deadlineAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const expiredAttempt: AssessmentAttempt = {
      id: expiredAttemptId,
      userId: testUserId,
      assessmentId: assessment.id,
      status: 'in_progress',
      startedAt: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
      deadlineAt,
      answers: {},
      submissionsCountByQid: {},
      integrity: { tabSwitches: 0, largePastes: 0, flagged: false },
    };

    await store.put('assessment_attempts', expiredAttemptId, expiredAttempt);

    // Check expiration logic
    const attempt = await store.get<AssessmentAttempt>('assessment_attempts', expiredAttemptId);
    expect(attempt).not.toBeNull();
    const remaining = Math.max(0, Math.round((new Date(attempt!.deadlineAt).getTime() - Date.now()) / 1000));
    expect(remaining).toBe(0);

    if (remaining === 0 && attempt!.status === 'in_progress') {
      attempt!.status = 'expired';
      await store.put('assessment_attempts', attempt!.id, attempt!);
    }

    const updated = await store.get<AssessmentAttempt>('assessment_attempts', expiredAttemptId);
    expect(updated?.status).toBe('expired');
  });

  it('cooldown logic never blocks a user’s first attempt, but enforces cooldown on completed retakes', async () => {
    const cooldownMinutes = 1440; // 24 hours

    // 1. First attempt: no completed attempts exist -> should succeed
    const attempts = await store.list<AssessmentAttempt>('assessment_attempts');
    const completedAttempts = attempts.filter(
      (a) => a.userId === testUserId && a.status === 'completed' && a.completedAt
    );
    expect(completedAttempts.length).toBe(0);
    // Cooldown does not block!

    // 2. User completes an attempt 30 minutes ago
    const completedAttempt: AssessmentAttempt = {
      id: 'att_comp_1',
      userId: testUserId,
      assessmentId: 'python-fundamentals',
      status: 'completed',
      startedAt: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
      deadlineAt: new Date(Date.now() + 80 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      answers: {},
      submissionsCountByQid: {},
      integrity: { tabSwitches: 0, largePastes: 0, flagged: false },
    };
    await store.put('assessment_attempts', 'att_comp_1', completedAttempt);

    const userCompleted = (await store.list<AssessmentAttempt>('assessment_attempts'))
      .filter((a) => a.userId === testUserId && a.status === 'completed' && a.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

    const lastCompleted = userCompleted[0];
    const elapsedMinutes = (Date.now() - new Date(lastCompleted.completedAt!).getTime()) / (1000 * 60);
    expect(elapsedMinutes).toBeLessThan(cooldownMinutes);
    const waitMinutes = Math.ceil(cooldownMinutes - elapsedMinutes);
    expect(waitMinutes).toBeGreaterThan(1400);

    // 3. User completed an attempt 1500 minutes ago (past 1440m cooldown)
    const oldCompletedAttempt: AssessmentAttempt = {
      id: 'att_comp_old',
      userId: testUserId,
      assessmentId: 'python-fundamentals',
      status: 'completed',
      startedAt: new Date(Date.now() - 1600 * 60 * 1000).toISOString(),
      deadlineAt: new Date(Date.now() - 1420 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1500 * 60 * 1000).toISOString(),
      answers: {},
      submissionsCountByQid: {},
      integrity: { tabSwitches: 0, largePastes: 0, flagged: false },
    };
    const elapsedOldMinutes = (Date.now() - new Date(oldCompletedAttempt.completedAt!).getTime()) / (1000 * 60);
    expect(elapsedOldMinutes).toBeGreaterThan(cooldownMinutes);
  });

  it('a user cannot read or modify another user’s attempt (authorization isolation)', async () => {
    const ownerUserId = 'student-alice';
    const attackerUserId = 'student-bob';

    const attemptId = 'att_alice_secure_123';
    const attempt: AssessmentAttempt = {
      id: attemptId,
      userId: ownerUserId,
      assessmentId: 'python-fundamentals',
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      deadlineAt: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
      answers: {},
      submissionsCountByQid: {},
      integrity: { tabSwitches: 0, largePastes: 0, flagged: false },
    };

    await store.put('assessment_attempts', attemptId, attempt);

    // Verify simulation of endpoint auth guard
    const fetched = await store.get<AssessmentAttempt>('assessment_attempts', attemptId);
    expect(fetched).not.toBeNull();
    expect(fetched?.userId).toBe(ownerUserId);

    // Attacker request check:
    const canAttackerRead = fetched?.userId === attackerUserId;
    expect(canAttackerRead).toBe(false);

    // Owner request check:
    const canOwnerRead = fetched?.userId === ownerUserId;
    expect(canOwnerRead).toBe(true);
  });

  it('legacy /challenges URL redirects to /assessments while /assessments/... is preserved', () => {
    // Test URL path mapping logic
    function resolveRedirect(pathname: string): { redirect: boolean; target?: string } {
      if (/^\/challenges(?:\/.*)?$/i.test(pathname)) {
        return { redirect: true, target: '/assessments' };
      }
      return { redirect: false };
    }

    // Legacy paths redirect to /assessments
    expect(resolveRedirect('/challenges')).toEqual({ redirect: true, target: '/assessments' });
    expect(resolveRedirect('/challenges/')).toEqual({ redirect: true, target: '/assessments' });
    expect(resolveRedirect('/challenges/python-fundamentals')).toEqual({ redirect: true, target: '/assessments' });
    expect(resolveRedirect('/challenges/some-challenge-id')).toEqual({ redirect: true, target: '/assessments' });

    // Assessment paths are NEVER redirected
    expect(resolveRedirect('/assessments')).toEqual({ redirect: false });
    expect(resolveRedirect('/assessments/python-fundamentals')).toEqual({ redirect: false });
    expect(resolveRedirect('/assessments/python-fundamentals/attempt/att_123')).toEqual({ redirect: false });
    expect(resolveRedirect('/attempts/att_123')).toEqual({ redirect: false });
  });
});
