/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { store } from '../store.ts';
import { adminDb } from '../firebase-admin.ts';
import { FieldValue } from 'firebase-admin/firestore';
import {
  AssessmentSectionRecord,
  DynamicQuestion,
  getOrGenerateQuestionsForSkill,
  getPythonQuestionsBank,
} from './dynamic-generator.ts';
import {
  NormalizedSkill,
  normalizeSkillList,
} from '../../domain/skills-taxonomy.ts';

export interface UserRateLimitRecord {
  id: string; // userId
  userId: string;
  resumeParsesToday: number;
  lastResumeParseDate: string; // YYYY-MM-DD
  sectionGenerationsToday: number;
  lastSectionGenDate: string; // YYYY-MM-DD
  compilerRunsThisHour: number;
  lastCompilerRunHour: string; // YYYY-MM-DD-HH
  lastCompletedSkillAt: Record<string, string>; // skillSlug -> ISO
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentHourString(): string {
  const d = new Date();
  return `${d.toISOString().slice(0, 10)}-${String(d.getUTCHours()).padStart(2, '0')}`;
}

export async function getUserRateLimits(userId: string): Promise<UserRateLimitRecord> {
  const today = getTodayString();
  const currentHour = getCurrentHourString();

  const record = (await store.get<UserRateLimitRecord>('user_rate_limits', userId)) || {
    id: userId,
    userId,
    resumeParsesToday: 0,
    lastResumeParseDate: today,
    sectionGenerationsToday: 0,
    lastSectionGenDate: today,
    compilerRunsThisHour: 0,
    lastCompilerRunHour: currentHour,
    lastCompletedSkillAt: {},
  };

  if (record.lastResumeParseDate !== today) {
    record.resumeParsesToday = 0;
    record.lastResumeParseDate = today;
  }

  if (record.lastSectionGenDate !== today) {
    record.sectionGenerationsToday = 0;
    record.lastSectionGenDate = today;
  }

  if (record.lastCompilerRunHour !== currentHour) {
    record.compilerRunsThisHour = 0;
    record.lastCompilerRunHour = currentHour;
  }

  return record;
}

export async function checkAndIncrementResumeParse(userId: string): Promise<{ ok: boolean; reason?: string }> {
  const limits = await getUserRateLimits(userId);
  if (limits.resumeParsesToday >= 3) {
    return { ok: false, reason: 'Daily resume parse limit (3 per day) reached. Please type your skills or try again tomorrow.' };
  }
  limits.resumeParsesToday++;
  await store.put('user_rate_limits', userId, limits);
  return { ok: true };
}

export async function checkAndIncrementSectionGeneration(userId: string): Promise<{ ok: boolean; reason?: string }> {
  const limits = await getUserRateLimits(userId);
  if (limits.sectionGenerationsToday >= 8) {
    return { ok: false, reason: 'Daily section generation limit (8 per day) reached. Please continue with your existing sections.' };
  }
  limits.sectionGenerationsToday++;
  await store.put('user_rate_limits', userId, limits);
  return { ok: true };
}

export async function checkAndIncrementCompilerRun(userId: string): Promise<{ ok: boolean; reason?: string }> {
  const limits = await getUserRateLimits(userId);
  if (limits.compilerRunsThisHour >= 30) {
    return { ok: false, reason: 'Code runner limit reached (30 runs per hour). Please test your logic locally and retry shortly.' };
  }
  limits.compilerRunsThisHour++;
  await store.put('user_rate_limits', userId, limits);
  return { ok: true };
}

export async function checkSkillCooldown(userId: string, skillSlug: string): Promise<{ ok: boolean; waitHoursRemaining?: number }> {
  const limits = await getUserRateLimits(userId);
  const lastCompleted = limits.lastCompletedSkillAt[skillSlug];
  if (!lastCompleted) return { ok: true };

  const elapsedMs = Date.now() - new Date(lastCompleted).getTime();
  const cooldownMs = 24 * 60 * 60 * 1000;
  if (elapsedMs < cooldownMs) {
    const waitHours = Math.ceil((cooldownMs - elapsedMs) / (1000 * 60 * 60));
    return { ok: false, waitHoursRemaining: waitHours };
  }
  return { ok: true };
}

/**
 * Initializes sections for the user's confirmed skills after onboarding.
 */
export async function initializeUserSections(
  userId: string,
  skills: Array<{ name: string; category?: string; claimedLevel?: string; level?: string; evidence?: string }>
): Promise<{ activeSections: AssessmentSectionRecord[]; laterSkills: NormalizedSkill[] }> {
  const { activeSkills, laterSkills } = normalizeSkillList(skills, 6);
  const activeSections: AssessmentSectionRecord[] = [];

  for (const s of activeSkills) {
    const sectionKey = `${userId}_${s.slug}`;
    const existing = await store.get<AssessmentSectionRecord>('user_sections', sectionKey);

    if (existing) {
      activeSections.push(existing);
      continue;
    }

    const isPython = s.slug === 'python';
    const initialStatus = isPython ? 'ready' : 'not_started';

    const record: AssessmentSectionRecord = {
      id: s.slug,
      userId,
      skillName: s.name,
      skillSlug: s.slug,
      category: s.category,
      claimedLevel: s.claimedLevel,
      status: initialStatus,
      questionIds: isPython
        ? (await getOrGenerateQuestionsForSkill(s)).map((q) => q.id)
        : [],
      totalQuestions: 25,
      mcqCount: isPython ? 11 : s.isRunnable ? 15 : 25,
      codeCount: isPython ? 14 : s.isRunnable ? 10 : 0,
      score: null,
      badgeLabel: null,
      attempts: 0,
      currentQuestionIndex: 0,
      answers: {},
      codeDrafts: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await store.put('user_sections', sectionKey, record);

    // Also persist into Firestore subcollection users/{uid}/assessmentSections/{skillSlug}
    try {
      await adminDb
        .collection('users')
        .doc(userId)
        .collection('assessmentSections')
        .doc(s.slug)
        .set(
          {
            name: s.name,
            category: s.category,
            claimedLevel: s.claimedLevel,
            status: record.status,
            questionIds: record.questionIds,
            totalQuestions: 25,
            score: null,
            badgeLabel: null,
            attempts: 0,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
    } catch (fsErr) {
      // Non-blocking catch
      console.warn('[Firestore] assessmentSection write warning (non-fatal):', fsErr);
    }

    activeSections.push(record);
  }

  // Save later skills to user profile for dashboard "Assess later"
  try {
    await adminDb.collection('users').doc(userId).set(
      {
        laterSkills: laterSkills.map((ls) => ({
          name: ls.name,
          slug: ls.slug,
          category: ls.category,
          claimedLevel: ls.claimedLevel,
        })),
      },
      { merge: true }
    );
  } catch {}

  return { activeSections, laterSkills };
}

/**
 * Returns all assessment sections for a given user.
 */
export async function getUserSections(userId: string): Promise<AssessmentSectionRecord[]> {
  const all = await store.list<AssessmentSectionRecord>('user_sections');
  const userSections = all.filter((s) => s.userId === userId);

  // Check for stuck generating status (> 2 minutes)
  const now = Date.now();
  for (const s of userSections) {
    if (s.status === 'generating' && s.generatingStartedAt && now - s.generatingStartedAt > 120000) {
      console.warn(`[Sections] Section ${s.skillSlug} for ${userId} was stuck in generating > 2 min. Resetting to failed.`);
      s.status = 'failed';
      s.failureReason = 'Generation timed out. Please click Retry.';
      s.updatedAt = new Date().toISOString();
      await store.put('user_sections', `${userId}_${s.skillSlug}`, s);
    }
  }

  return userSections;
}

/**
 * Opens or triggers question generation for a section.
 */
export async function openUserSection(
  userId: string,
  skillSlug: string
): Promise<{ section: AssessmentSectionRecord; questions?: DynamicQuestion[] }> {
  const sectionKey = `${userId}_${skillSlug}`;
  let section = await store.get<AssessmentSectionRecord>('user_sections', sectionKey);

  if (!section) {
    throw new Error(`Section for '${skillSlug}' not found`);
  }

  // If already ready or in_progress, return
  if (section.status === 'ready' || section.status === 'in_progress' || section.status === 'completed') {
    const questions = await getQuestionsForSection(section);
    return { section, questions };
  }

  // If generating, check timeout
  if (section.status === 'generating') {
    if (section.generatingStartedAt && Date.now() - section.generatingStartedAt > 120000) {
      section.status = 'failed';
      section.failureReason = 'Generation timed out. Click Retry.';
      await store.put('user_sections', sectionKey, section);
    } else {
      return { section };
    }
  }

  // Rate limit check for new generation
  const rateCheck = await checkAndIncrementSectionGeneration(userId);
  if (!rateCheck.ok) {
    throw new Error(rateCheck.reason);
  }

  // Set status = "generating"
  section.status = 'generating';
  section.generatingStartedAt = Date.now();
  section.updatedAt = new Date().toISOString();
  await store.put('user_sections', sectionKey, section);

  // Update Firestore
  try {
    await adminDb.collection('users').doc(userId).collection('assessmentSections').doc(skillSlug).update({
      status: 'generating',
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch {}

  try {
    const normalizedSkill: NormalizedSkill = {
      name: section.skillName,
      slug: section.skillSlug,
      category: section.category as any,
      claimedLevel: section.claimedLevel,
      isRunnable: section.codeCount > 0,
    };

    const questions = await getOrGenerateQuestionsForSkill(normalizedSkill);

    // Save individual questions in store
    for (const q of questions) {
      await store.put('dynamic_questions', q.id, q);
    }

    section.questionIds = questions.map((q) => q.id);
    section.status = 'ready';
    section.totalQuestions = questions.length;
    section.mcqCount = questions.filter((q) => q.type === 'mcq').length;
    section.codeCount = questions.filter((q) => q.type === 'code').length;
    section.updatedAt = new Date().toISOString();
    delete section.generatingStartedAt;
    delete section.failureReason;

    await store.put('user_sections', sectionKey, section);

    try {
      await adminDb.collection('users').doc(userId).collection('assessmentSections').doc(skillSlug).update({
        status: 'ready',
        questionIds: section.questionIds,
        totalQuestions: section.totalQuestions,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch {}

    return { section, questions };
  } catch (err: any) {
    console.error(`[Sections] Failed to generate section questions for ${skillSlug}:`, err);
    section.status = 'failed';
    section.failureReason = err?.message || 'Failed to generate questions. Please retry.';
    section.updatedAt = new Date().toISOString();
    delete section.generatingStartedAt;
    await store.put('user_sections', sectionKey, section);

    try {
      await adminDb.collection('users').doc(userId).collection('assessmentSections').doc(skillSlug).update({
        status: 'failed',
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch {}

    return { section };
  }
}

/**
 * Retrieves question objects for a section (server-side only, includes correctOptionId and hiddenTests).
 */
export async function getQuestionsForSection(section: AssessmentSectionRecord): Promise<DynamicQuestion[]> {
  const questions: DynamicQuestion[] = [];

  for (const qid of section.questionIds) {
    let q = await store.get<DynamicQuestion>('dynamic_questions', qid);
    if (!q) {
      // Check Python bank
      if (section.skillSlug === 'python') {
        const pyBank = getPythonQuestionsBank();
        q = pyBank.find((pq: DynamicQuestion) => pq.id === qid) || null;
      }
    }
    if (q) {
      questions.push(q);
    }
  }

  return questions;
}

/**
 * Sanitizes questions for the client by stripping correctOptionId, explanation, and hiddenTests.
 */
export function sanitizeQuestionsForClient(questions: DynamicQuestion[]): any[] {
  return questions.map((q) => {
    if (q.type === 'mcq') {
      return {
        id: q.id,
        type: 'mcq',
        prompt: q.prompt,
        codeSnippet: q.codeSnippet,
        options: q.options,
        difficulty: q.difficulty,
      };
    } else {
      return {
        id: q.id,
        type: 'code',
        title: q.title,
        statement: q.statement,
        inputFormat: q.inputFormat,
        outputFormat: q.outputFormat,
        starterCode: q.starterCode,
        language: q.language,
        visibleTests: q.visibleTests,
        timeLimitMs: q.timeLimitMs,
        memoryLimitKb: q.memoryLimitKb,
        difficulty: q.difficulty,
      };
    }
  });
}
