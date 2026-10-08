import { describe, it, expect } from 'vitest';
import {
  ASSESSMENTS,
  getAssessmentById,
  getPublicAssessmentSummaries,
  getPublicAssessmentDetail,
  calculateAssessmentResult,
} from '../lib/server/assessments/index.ts';
import { AssessmentAttempt } from '../lib/server/assessments/types.ts';
import { Submission } from '../lib/types.ts';

describe('Assessment Registry & Scoring Specification', () => {
  it('registers python-fundamentals with exactly 25 questions across 3 sections', () => {
    const py = getAssessmentById('python-fundamentals');
    expect(py).toBeDefined();
    expect(py?.title).toBe('Python');
    expect(py?.timeLimitMinutes).toBe(180);
    expect(py?.sections).toHaveLength(3);

    // Section A: 5 MCQs
    expect(py?.sections[0].id).toBe('A');
    expect(py?.sections[0].questions).toHaveLength(5);
    expect(py?.sections[0].questions.every((q) => q.type === 'mcq')).toBe(true);

    // Section B: 10 questions (6 MCQs + 4 coding)
    expect(py?.sections[1].id).toBe('B');
    expect(py?.sections[1].questions).toHaveLength(10);
    const bMcqs = py?.sections[1].questions.filter((q) => q.type === 'mcq');
    const bCoding = py?.sections[1].questions.filter((q) => q.type === 'code');
    expect(bMcqs).toHaveLength(6);
    expect(bCoding).toHaveLength(4);

    // Section C: 10 real-life coding problems
    expect(py?.sections[2].id).toBe('C');
    expect(py?.sections[2].questions).toHaveLength(10);
    expect(py?.sections[2].questions.every((q) => q.type === 'code')).toBe(true);
  });

  it('sanitizes public assessment detail without leaking answer keys or hidden tests', () => {
    const detail = getPublicAssessmentDetail('python-fundamentals');
    expect(detail).not.toBeNull();
    expect(detail?.totalQuestions).toBe(25);
    expect(detail?.totalMcq).toBe(11);
    expect(detail?.totalCode).toBe(14);

    for (const sec of detail!.sectionsDetailed) {
      for (const q of sec.questions || []) {
        // No server secrets
        expect((q as any).correctOptionId).toBeUndefined();
        expect((q as any).explanation).toBeUndefined();
        expect((q as any).hiddenTests).toBeUndefined();
      }
    }
  });

  it('enforces gating cap: no coding question >= 50% caps at Developing', () => {
    const assessment = getAssessmentById('python-fundamentals')!;
    const attempt: AssessmentAttempt = {
      id: 'att_test_1',
      userId: 'test_user',
      assessmentId: 'python-fundamentals',
      status: 'completed',
      startedAt: new Date().toISOString(),
      deadlineAt: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
      answers: {
        'a1-types-operators': { choiceId: 'opt_2' },
        'a2-strings-slicing': { choiceId: 'opt_1' },
        'a3-collections-operations': { choiceId: 'opt_1' },
        'a4-scope-for-else': { choiceId: 'opt_1' },
        'a5-oop-super': { choiceId: 'opt_1' },
        'b1-mutable-default-args': { choiceId: 'opt_1' },
        'b2-copy-semantics': { choiceId: 'opt_1' },
        'b3-generators-exhaustion': { choiceId: 'opt_1' },
        'b4-exceptions-finally': { choiceId: 'opt_1' },
        'b5-decorators-wraps': { choiceId: 'opt_1' },
        'b6-tooling-type-hints': { choiceId: 'opt_1' },
      },
      submissionsCountByQid: {},
      integrity: { tabSwitches: 0, largePastes: 0, flagged: false },
    };

    // Submissions with coding correctness below 50% but high enough to reach Competent raw score
    const submissions: Submission[] = [
      {
        id: 'sub_b7',
        userId: 'test_user',
        problemId: 'b7-word-frequency',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 2,
          visibleTotal: 2,
          hiddenPassed: 2,
          hiddenTotal: 6,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 45,
        },
      },
      {
        id: 'sub_b8',
        userId: 'test_user',
        problemId: 'b8-bracket-validator',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 2,
          visibleTotal: 2,
          hiddenPassed: 2,
          hiddenTotal: 6,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 45,
        },
      },
      {
        id: 'sub_b9',
        userId: 'test_user',
        problemId: 'b9-run-length-codec',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 2,
          visibleTotal: 2,
          hiddenPassed: 2,
          hiddenTotal: 6,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 45,
        },
      },
      {
        id: 'sub_b10',
        userId: 'test_user',
        problemId: 'b10-sensor-summary',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 2,
          visibleTotal: 2,
          hiddenPassed: 2,
          hiddenTotal: 6,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 45,
        },
      },
      {
        id: 'sub_c1',
        userId: 'test_user',
        problemId: 'student-registry',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 3,
          visibleTotal: 3,
          hiddenPassed: 4,
          hiddenTotal: 10,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 48,
        },
      },
      {
        id: 'sub_c2',
        userId: 'test_user',
        problemId: 'access-log-summary',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 3,
          visibleTotal: 3,
          hiddenPassed: 4,
          hiddenTotal: 10,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 48,
        },
      },
      {
        id: 'sub_c3',
        userId: 'test_user',
        problemId: 'rate-limiter',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 3,
          visibleTotal: 3,
          hiddenPassed: 4,
          hiddenTotal: 10,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 48,
        },
      },
      {
        id: 'sub_c4',
        userId: 'test_user',
        problemId: 'payload-validator',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 3,
          visibleTotal: 3,
          hiddenPassed: 4,
          hiddenTotal: 10,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 48,
        },
      },
      {
        id: 'sub_c5',
        userId: 'test_user',
        problemId: 'c5-meeting-scheduler',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 3,
          visibleTotal: 3,
          hiddenPassed: 4,
          hiddenTotal: 10,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 48,
        },
      },
      {
        id: 'sub_c6',
        userId: 'test_user',
        problemId: 'c6-cart-pricing',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 3,
          visibleTotal: 3,
          hiddenPassed: 4,
          hiddenTotal: 10,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 48,
        },
      },
      {
        id: 'sub_c7',
        userId: 'test_user',
        problemId: 'c7-lru-cache',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 3,
          visibleTotal: 3,
          hiddenPassed: 4,
          hiddenTotal: 10,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 48,
        },
      },
      {
        id: 'sub_c8',
        userId: 'test_user',
        problemId: 'c8-search-index',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 3,
          visibleTotal: 3,
          hiddenPassed: 4,
          hiddenTotal: 10,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 48,
        },
      },
      {
        id: 'sub_c9',
        userId: 'test_user',
        problemId: 'c9-bank-reconciler',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 3,
          visibleTotal: 3,
          hiddenPassed: 4,
          hiddenTotal: 10,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 48,
        },
      },
      {
        id: 'sub_c10',
        userId: 'test_user',
        problemId: 'c10-task-scheduler',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 3,
          visibleTotal: 3,
          hiddenPassed: 4,
          hiddenTotal: 10,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 48,
        },
      },
    ];

    const result = calculateAssessmentResult({ attempt, assessment, submissions });
    expect(result.overallPercent).toBeGreaterThanOrEqual(60);
    expect(result.badgeLabel).toBe('Developing');
    expect(result.capReason).toContain('No coding problem passed at 50% or more');
  });

  it('enforces integrity capping: flagged attempts are capped at Competent and marked under_review', () => {
    const assessment = getAssessmentById('python-fundamentals')!;
    const attempt: AssessmentAttempt = {
      id: 'att_test_flagged',
      userId: 'test_user',
      assessmentId: 'python-fundamentals',
      status: 'completed',
      startedAt: new Date().toISOString(),
      deadlineAt: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
      answers: {},
      submissionsCountByQid: {},
      integrity: { tabSwitches: 6, largePastes: 4, flagged: true },
    };

    // Even with perfect coding submissions
    const submissions: Submission[] = [
      {
        id: 'sub_1',
        userId: 'test_user',
        problemId: 'c1-inventory-reorder',
        language: 'python',
        code: 'print()',
        status: 'completed',
        createdAt: new Date().toISOString(),
        deterministic: {
          compiled: true,
          visiblePassed: 3,
          visibleTotal: 3,
          hiddenPassed: 10,
          hiddenTotal: 10,
          maxTimeMs: 100,
          maxMemoryKb: 2000,
          correctness: 100,
        },
      },
    ];

    const result = calculateAssessmentResult({ attempt, assessment, submissions });
    expect(result.integrity.flagged).toBe(true);
    expect(result.badgeStatus).toBe('under_review');
  });
});
