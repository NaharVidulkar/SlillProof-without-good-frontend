/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { adminAuth, adminDb, FieldValue, DecodedIdToken, firebaseConfig } from './lib/server/firebase-admin.ts';
import {
  getAllPublicProblems,
  getPublicProblemById,
  getProblemByIdWithHidden,
} from './lib/server/problems.ts';
import { store, DEMO_USER_ID } from './lib/server/store.ts';
import { runCode } from './lib/runner/onlinecompiler.ts';
import { getCompilerIdForLanguage } from './lib/server/languages.ts';
import { determineVerdict } from './lib/domain/verdict.ts';
import { reviewSubmission } from './lib/ai/gemini.ts';
import { combineSubmissionScores } from './lib/domain/combiner.ts';
import { evaluateSkill } from './lib/domain/scoring.ts';
import { calculateCareerReadiness } from './lib/server/roles.ts';
import { QUIZ_QUESTION_BANK } from './lib/server/quizBank.ts';
import { analyzeJobMatch } from './lib/ai/jobMatcher.ts';
import {
  parseResumeWithGemini,
  parseTextProfileWithGemini,
  generateSkillAssessmentWithGemini,
  GeneratedAssessment,
} from './lib/ai/onboarding-gemini.ts';
import {
  DEMO_CANDIDATES,
  rankCandidates,
  buildPassportProfile,
} from './lib/server/passport.ts';
import {
  DeterministicResult,
  EvidenceItem,
  HiddenTestResult,
  QuizAttempt,
  RunTestItemResult,
  Submission,
  SupportedLanguage,
  VisibleTestResult,
} from './lib/types.ts';
import {
  getAssessmentById,
  getPublicAssessmentSummaries,
  getPublicAssessmentDetail,
  calculateAssessmentResult,
} from './lib/server/assessments/index.ts';
import {
  AssessmentAttempt,
  AssessmentResult,
  CodeQuestion,
  McqQuestion,
} from './lib/server/assessments/types.ts';
import { checkLiteralHardcoding } from './lib/domain/combiner.ts';

// Load both .env.local (preferred for local secrets) and standard .env with override enabled
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Enable trust proxy so secure cookies work behind reverse proxies
  app.set('trust proxy', 1);

  // AUTH_GATE: enabled by default, disabled only when set explicitly to "false"
  const AUTH_GATE = process.env.AUTH_GATE !== 'false';

  const SESSION_SECRET =
    process.env.SESSION_SECRET || 'skillproof-session-secret-key-391840294829';

  interface CustomSessionPayload {
    uid: string;
    email: string | null;
    name: string | null;
    picture: string | null;
    exp: number; // in seconds
  }

  function signSessionPayload(payload: CustomSessionPayload, secret: string): string {
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    return `${data}.${signature}`;
  }

  function verifySessionPayload(token: string, secret: string): CustomSessionPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) return null;
      const [data, signature] = parts;
      const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
        return null;
      }
      const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8')) as CustomSessionPayload;
      if (typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser(SESSION_SECRET));

  // Auth Middleware
  const verifySession = async (req: express.Request): Promise<DecodedIdToken | null> => {
    // Development / smoke test bypass with x-user-id header
    const testHeader = req.headers['x-user-id'];
    if (testHeader && testHeader === DEMO_USER_ID && process.env.NODE_ENV !== 'production') {
      return {
        uid: DEMO_USER_ID,
        email: 'demo@skillproof.dev',
        name: 'Demo Candidate',
        picture: '',
        aud: firebaseConfig.projectId,
        auth_time: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        iss: `https://securetoken.google.com/${firebaseConfig.projectId}`,
        sub: DEMO_USER_ID,
        firebase: { identities: {}, sign_in_provider: 'custom' },
      };
    }

    const sessionCookie = req.cookies?.__session;
    if (!sessionCookie || typeof sessionCookie !== 'string') return null;

    // Check custom signed session cookie if contains dot separator
    if (sessionCookie.includes('.')) {
      const customPayload = verifySessionPayload(sessionCookie, SESSION_SECRET);
      if (customPayload) {
        return {
          uid: customPayload.uid,
          email: customPayload.email || undefined,
          name: customPayload.name || undefined,
          picture: customPayload.picture || undefined,
          aud: firebaseConfig.projectId,
          auth_time: Math.floor(Date.now() / 1000),
          exp: customPayload.exp,
          iat: Math.floor(Date.now() / 1000),
          iss: `https://securetoken.google.com/${firebaseConfig.projectId}`,
          sub: customPayload.uid,
          firebase: { identities: {}, sign_in_provider: 'google.com' },
        };
      }
    }

    // Attempt Firebase Admin session cookie verification (relax checkRevoked to avoid clock-skew failures)
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, false);
      return decodedClaims;
    } catch {
      return null;
    }
  };

  const requireAuth: express.RequestHandler = async (req, res, next) => {
    if (!AUTH_GATE) {
      return next();
    }
    const sessionUser = await verifySession(req);
    if (!sessionUser) {
      const isApi =
        req.baseUrl.startsWith('/api') ||
        req.path.startsWith('/api') ||
        req.originalUrl.startsWith('/api');
      if (isApi) {
        return res.status(401).json({ error: 'Unauthorized: Session missing or invalid' });
      }
      return res.redirect('/login');
    }
    (req as express.Request & { user?: DecodedIdToken }).user = sessionUser;
    next();
  };

  // POST /api/auth/session: Exchange Firebase ID token for a secure session cookie
  app.post('/api/auth/session', async (req, res) => {
    const { idToken } = req.body || {};
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ error: 'Missing idToken parameter' });
    }

    let decodedToken: DecodedIdToken;
    try {
      // Step 1: Verify the ID token (relax auth_time freshness check to prevent clock-skew errors)
      decodedToken = await adminAuth.verifyIdToken(idToken, false);
      console.log(`[Auth] verifyIdToken successful for uid: ${decodedToken.uid}`);
      console.log(
        `[Auth] Admin Project ID: "${firebaseConfig.projectId}" | Decoded token 'aud' claim: "${decodedToken.aud}"`
      );
      if (decodedToken.aud !== firebaseConfig.projectId) {
        console.warn(
          `[Auth] Warning: Token aud ("${decodedToken.aud}") does not match admin projectId ("${firebaseConfig.projectId}")`
        );
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('[Auth] verifyIdToken failed. Code:', error.code, 'Message:', error.message);
      return res.status(401).json({
        error: 'Invalid authentication token',
        code: error.code || 'auth/invalid-id-token',
        message: error.message,
      });
    }

    // Step 2: Establish session cookie (5 days expiry)
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    let sessionCookieVal: string;

    try {
      sessionCookieVal = await adminAuth.createSessionCookie(idToken, { expiresIn });
      console.log('[Auth] Firebase admin createSessionCookie succeeded.');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error(
        '[Auth] createSessionCookie failed (credential/permission error). Code:',
        error.code,
        'Message:',
        error.message
      );
      console.log('[Auth] Issuing signed httpOnly session cookie fallback...');

      // Fallback: issue our own HMAC-signed session cookie containing uid, email, exp
      const expSec = Math.floor((Date.now() + expiresIn) / 1000);
      sessionCookieVal = signSessionPayload(
        {
          uid: decodedToken.uid,
          email: decodedToken.email || null,
          name: decodedToken.name || decodedToken.email?.split('@')[0] || null,
          picture: decodedToken.picture || null,
          exp: expSec,
        },
        SESSION_SECRET
      );
    }

    // Set cookie: secure: true, sameSite: 'none' for iframe preview compatibility, httpOnly: true
    res.cookie('__session', sessionCookieVal, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    // Step 3: Upsert Firestore users/{uid} document (failure must not fail session creation)
    try {
      const userDocRef = adminDb.collection('users').doc(decodedToken.uid);
      const userSnapshot = await userDocRef.get();

      if (!userSnapshot.exists) {
        await userDocRef.set({
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Candidate',
          photoURL: decodedToken.picture || '',
          role: 'student',
          provider: decodedToken.firebase?.sign_in_provider || 'password',
          createdAt: FieldValue.serverTimestamp(),
          lastLoginAt: FieldValue.serverTimestamp(),
          onboardingCompleted: false,
          onboardingSkipped: false,
          passportPublic: false,
        });
        console.log(`[Auth] Created Firestore users document for ${decodedToken.uid}`);
      } else {
        await userDocRef.update({
          lastLoginAt: FieldValue.serverTimestamp(),
        });
        console.log(`[Auth] Updated Firestore users lastLoginAt for ${decodedToken.uid}`);
      }
    } catch (fsErr) {
      console.error('[Auth] Firestore user document creation error (non-fatal):', fsErr);
    }

    return res.json({
      ok: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Candidate',
        photoURL: decodedToken.picture || null,
      },
    });
  });

  // POST /api/auth/logout: Clear session cookie
  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie('__session', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return res.json({ ok: true });
  });

  // GET /api/me: Return authenticated user info with onboarding status
  app.get('/api/me', async (req, res) => {
    if (!AUTH_GATE) {
      return res.json({
        uid: DEMO_USER_ID,
        email: 'demo@skillproof.dev',
        name: 'Demo Candidate',
        photoURL: null,
        onboardingCompleted: true,
        onboardingSkipped: false,
        profile: null,
        skills: [],
      });
    }

    const sessionUser = await verifySession(req);
    if (!sessionUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let onboardingCompleted = false;
    let onboardingSkipped = false;
    let profile = null;
    let skills: any[] = [];

    try {
      const userDoc = await adminDb.collection('users').doc(sessionUser.uid).get();
      if (userDoc.exists) {
        const udata = userDoc.data();
        onboardingCompleted = Boolean(udata?.onboardingCompleted);
        onboardingSkipped = Boolean(udata?.onboardingSkipped);
        profile = udata?.profile || null;
        skills = udata?.skills || [];
      }
    } catch (fsErr) {
      console.error('[Auth] Error fetching user doc in /api/me:', fsErr);
    }

    return res.json({
      uid: sessionUser.uid,
      email: sessionUser.email || null,
      name: sessionUser.name || sessionUser.email?.split('@')[0] || 'Candidate',
      photoURL: sessionUser.picture || null,
      onboardingCompleted,
      onboardingSkipped,
      profile,
      skills,
    });
  });

  // ==========================================
  // ONBOARDING & GEMINI SKILL ASSESSMENT ROUTES
  // ==========================================

  // In-memory cache for active generated assessments
  const activeAssessmentsMap = new Map<string, GeneratedAssessment>();

  // POST /api/onboarding/parse-resume: Extract candidate profile and skills via Gemini
  app.post('/api/onboarding/parse-resume', async (req, res) => {
    try {
      const { fileData, fileName, mimeType, textContent } = req.body || {};
      if (!fileData && !textContent) {
        return res.status(400).json({ error: 'No resume file data or text content provided' });
      }

      console.log(`[Onboarding] Parsing resume with Gemini (${fileName || 'text'})...`);
      const profile = await parseResumeWithGemini({
        fileData,
        fileName,
        mimeType: mimeType || 'application/pdf',
        textContent,
      });

      return res.json({ ok: true, profile });
    } catch (err: unknown) {
      console.error('[Onboarding] parse-resume failed:', err);
      return res.status(500).json({
        error: 'Failed to parse resume document',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // POST /api/onboarding/parse-text: Turn free-text background into structured skills via Gemini
  app.post('/api/onboarding/parse-text', async (req, res) => {
    try {
      const { text } = req.body || {};
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Please enter a description of yourself and your skills.' });
      }

      console.log('[Onboarding] Parsing user text with Gemini...');
      const profile = await parseTextProfileWithGemini(text.trim());

      return res.json({ ok: true, profile });
    } catch (err: unknown) {
      console.error('[Onboarding] parse-text failed:', err);
      return res.status(500).json({
        error: 'Failed to process background text',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // POST /api/onboarding/complete: Save confirmed profile and top skills to Firestore
  app.post('/api/onboarding/complete', async (req, res) => {
    try {
      const sessionUser = await verifySession(req);
      const uid = sessionUser?.uid || DEMO_USER_ID;

      const { role, fieldOfStudy, yearsOfExperience, skills } = req.body || {};
      const confirmedSkills = Array.isArray(skills)
        ? skills.slice(0, 5).map((s: any) => ({
            name: typeof s === 'string' ? s.trim() : String(s.name || '').trim(),
            level: s.level || 'Intermediate',
            verified: false,
          }))
        : [];

      const profileData = {
        role: typeof role === 'string' && role.trim() ? role.trim() : 'Software Developer',
        fieldOfStudy: typeof fieldOfStudy === 'string' && fieldOfStudy.trim() ? fieldOfStudy.trim() : 'Computer Science',
        yearsOfExperience: typeof yearsOfExperience === 'number' ? yearsOfExperience : 1,
      };

      // Persist to Firestore
      try {
        await adminDb.collection('users').doc(uid).set(
          {
            onboardingCompleted: true,
            onboardingSkipped: false,
            profile: profileData,
            skills: confirmedSkills,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        console.log(`[Onboarding] Completed for user ${uid} with ${confirmedSkills.length} skills`);
      } catch (fsErr) {
        console.error('[Onboarding] Firestore write error (non-fatal):', fsErr);
      }

      return res.json({
        ok: true,
        message: 'Onboarding completed',
        profile: profileData,
        skills: confirmedSkills,
      });
    } catch (err: unknown) {
      console.error('[Onboarding] complete failed:', err);
      return res.status(500).json({ error: 'Failed to save onboarding profile' });
    }
  });

  // POST /api/onboarding/skip: Skip onboarding for now
  app.post('/api/onboarding/skip', async (req, res) => {
    try {
      const sessionUser = await verifySession(req);
      const uid = sessionUser?.uid || DEMO_USER_ID;

      try {
        await adminDb.collection('users').doc(uid).set(
          {
            onboardingSkipped: true,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (fsErr) {
        console.error('[Onboarding] Firestore skip write error:', fsErr);
      }

      return res.json({ ok: true, skipped: true });
    } catch (err: unknown) {
      console.error('[Onboarding] skip failed:', err);
      return res.status(500).json({ error: 'Failed to record skip preference' });
    }
  });

  // POST /api/skills/assess/generate: Generate tailored questions using Gemini for any skill
  app.post('/api/skills/assess/generate', async (req, res) => {
    try {
      const { skillName, level } = req.body || {};
      if (!skillName || typeof skillName !== 'string') {
        return res.status(400).json({ error: 'Missing required skillName parameter' });
      }

      console.log(`[Assessment] Generating questions for ${skillName} (${level || 'Intermediate'})...`);
      const assessment = await generateSkillAssessmentWithGemini(skillName.trim(), level || 'Intermediate');
      activeAssessmentsMap.set(assessment.id, assessment);

      // Return questions with correctOptionId and explanation stripped for integrity
      const publicQuestions = assessment.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        codeSnippet: q.codeSnippet,
        options: q.options,
        difficulty: q.difficulty,
      }));

      return res.json({
        id: assessment.id,
        skillName: assessment.skillName,
        level: assessment.level,
        questions: publicQuestions,
      });
    } catch (err: unknown) {
      console.error('[Assessment] generate failed:', err);
      return res.status(500).json({
        error: 'Failed to generate skill assessment',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // POST /api/skills/assess/submit: Grade candidate answers and award verified skill badge
  app.post('/api/skills/assess/submit', async (req, res) => {
    try {
      const sessionUser = await verifySession(req);
      const uid = sessionUser?.uid || DEMO_USER_ID;

      const { assessmentId, skillName, level, answers } = req.body || {};
      if (!assessmentId || !answers) {
        return res.status(400).json({ error: 'Missing assessmentId or answers' });
      }

      const assessment = activeAssessmentsMap.get(assessmentId);
      if (!assessment) {
        return res.status(404).json({ error: 'Assessment session expired or not found. Please restart the assessment.' });
      }

      let correctCount = 0;
      const totalCount = assessment.questions.length;
      const questionReviews = assessment.questions.map((q) => {
        const candidateAnswer = answers[q.id];
        const isCorrect = candidateAnswer === q.correctOptionId;
        if (isCorrect) correctCount++;

        return {
          id: q.id,
          prompt: q.prompt,
          userChoice: candidateAnswer,
          correctChoice: q.correctOptionId,
          isCorrect,
          explanation: q.explanation,
        };
      });

      const score = Math.round((correctCount / Math.max(1, totalCount)) * 100);
      const tier = score >= 85 ? 'Advanced' : score >= 60 ? 'Intermediate' : score >= 40 ? 'Beginner' : 'Novice';
      const passed = score >= 60;

      const skillSlug = (skillName || assessment.skillName).toLowerCase().replace(/\s+/g, '-');

      // Add to evidence store
      const evidenceItem: EvidenceItem = {
        id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId: uid,
        skillId: skillSlug,
        type: 'knowledge',
        score: score / 100,
        difficulty: 2,
        sourceRef: assessmentId,
        integrity: 0.85,
        createdAt: new Date().toISOString(),
        details: {
          problemTitle: `Verified diagnostic for ${assessment.skillName}`,
          correctnessPercent: score,
          verdictSummary: `${correctCount}/${totalCount} questions correct (${tier})`,
        },
      };

      await store.put('skill_evidence', evidenceItem.id, evidenceItem);

      // Record quiz attempt for dashboard display
      const quizAttempt: QuizAttempt = {
        id: `quiz_${Date.now()}`,
        userId: uid,
        startedAt: assessment.createdAt,
        deadlineAt: new Date(Date.now() + 3600000).toISOString(),
        completedAt: new Date().toISOString(),
        status: 'completed',
        questionIds: assessment.questions.map((q) => q.id),
        answers: answers as Record<string, string>,
        passedCount: correctCount,
        totalCount,
        score,
      };
      await store.put('quiz_attempts', quizAttempt.id, quizAttempt);

      // Persist verified skill to Firestore user document
      try {
        const userRef = adminDb.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const udata = userDoc.data();
          const existingSkills = Array.isArray(udata?.skills) ? udata.skills : [];
          const updatedSkills = existingSkills.map((s: any) => {
            if (s.name.toLowerCase() === assessment.skillName.toLowerCase()) {
              return { ...s, verified: true, score, tier, verifiedAt: new Date().toISOString() };
            }
            return s;
          });
          // If skill was not in list, add it
          if (!updatedSkills.some((s: any) => s.name.toLowerCase() === assessment.skillName.toLowerCase())) {
            updatedSkills.push({
              name: assessment.skillName,
              level: tier,
              verified: true,
              score,
              tier,
              verifiedAt: new Date().toISOString(),
            });
          }
          await userRef.update({ skills: updatedSkills });
        }
      } catch (fsErr) {
        console.error('[Assessment] Firestore update error (non-fatal):', fsErr);
      }

      return res.json({
        ok: true,
        assessmentId,
        skillName: assessment.skillName,
        score,
        correctCount,
        totalCount,
        tier,
        passed,
        questionReviews,
        evidenceId: evidenceItem.id,
      });
    } catch (err: unknown) {
      console.error('[Assessment] submit failed:', err);
      return res.status(500).json({ error: 'Failed to grade assessment' });
    }
  });

  // Redirect legacy /challenges paths to /assessments
  app.get('/challenges*', (req, res) => {
    res.redirect(301, '/assessments');
  });

  // Helper to get evaluated skills for the current user
  async function getUserEvaluatedSkills(userId: string) {
    const evidenceList = await store.list<EvidenceItem>('skill_evidence');
    const userEvidence = evidenceList.filter((e) => e.userId === userId);

    const skillsMap: Record<string, EvidenceItem[]> = {
      python: [],
      'data-structures': [],
      'rest-semantics': [],
      validation: [],
      'state-management': [],
      'string-parsing': [],
      aggregation: [],
      sorting: [],
      'hash-maps': [],
      'sliding-window': [],
      algorithms: [],
      'system-design': [],
      sql: [],
      git: [],
      testing: [],
      oop: [],
    };

    for (const item of userEvidence) {
      if (!skillsMap[item.skillId]) {
        skillsMap[item.skillId] = [];
      }
      skillsMap[item.skillId].push(item);
    }

    const evaluated = Object.entries(skillsMap).map(([id, ev]) => {
      const name = id
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return evaluateSkill({
        skillId: id,
        skillName: name,
        evidence: ev,
      });
    });

    return evaluated;
  }

  // Protect all remaining /api/* routes with requireAuth (auth routes are already defined above)
  app.use('/api', requireAuth);

  // Stage 0: Diagnostic env check endpoint (never leaks values)
  app.get('/api/health/env', (_req, res) => {
    res.json({
      ONLINECOMPILER_API_KEY_CONFIGURED: Boolean(
        process.env.ONLINECOMPILER_API_KEY &&
          process.env.ONLINECOMPILER_API_KEY !== 'MY_ONLINECOMPILER_API_KEY'
      ),
      GEMINI_API_KEY_CONFIGURED: Boolean(
        process.env.GEMINI_API_KEY &&
          process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
      ),
      APP_URL_CONFIGURED: Boolean(process.env.APP_URL),
      _warning: 'Temporary diagnostic endpoint. Remove before production deployment.',
    });
  });

  // Stage 1: Problems catalog (hidden tests are stripped)
  app.get('/api/problems', (_req, res) => {
    const problems = getAllPublicProblems();
    res.json(problems);
  });

  app.get('/api/problems/:id', (req, res) => {
    const problem = getPublicProblemById(req.params.id);
    if (!problem) {
      res.status(404).json({ error: `Problem with ID '${req.params.id}' not found` });
      return;
    }
    res.json(problem);
  });

  // Stage 2: Run Code against visible tests or custom input
  app.post('/api/run', async (req, res) => {
    const { problemId, language, code, customInput } = req.body as {
      problemId: string;
      language: SupportedLanguage;
      code: string;
      customInput?: string;
    };

    if (!problemId || !language || code === undefined) {
      res.status(400).json({ error: 'Missing required parameters (problemId, language, code)' });
      return;
    }

    if (code.length > 100 * 1024) {
      res.status(400).json({ error: 'Code size exceeds 100 KB limit' });
      return;
    }

    const problem = getProblemByIdWithHidden(problemId);
    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const compilerId = await getCompilerIdForLanguage(language);
    const results: RunTestItemResult[] = [];

    if (customInput !== undefined) {
      const runnerRes = await runCode(compilerId, code, customInput);
      const verdict = determineVerdict({
        exitCode: runnerRes.exitCode,
        output: runnerRes.output,
        expected: undefined,
        error: runnerRes.error,
        signal: runnerRes.signal,
        timeSec: runnerRes.timeSec,
        memoryKb: runnerRes.memoryKb,
        timeLimitMs: problem.timeLimitMs,
        memoryLimitKb: problem.memoryLimitKb,
      });

      results.push({
        index: 1,
        input: customInput,
        output: runnerRes.output,
        error: runnerRes.error,
        exitCode: runnerRes.exitCode,
        timeSec: runnerRes.timeSec,
        memoryKb: runnerRes.memoryKb,
        verdict,
      });

      res.json({ results, custom: true });
      return;
    }

    // Run visible tests strictly one at a time
    for (let i = 0; i < problem.visibleTests.length; i++) {
      const test = problem.visibleTests[i];
      const runnerRes = await runCode(compilerId, code, test.input);

      const verdict = determineVerdict({
        exitCode: runnerRes.exitCode,
        output: runnerRes.output,
        expected: test.expected,
        error: runnerRes.error,
        signal: runnerRes.signal,
        timeSec: runnerRes.timeSec,
        memoryKb: runnerRes.memoryKb,
        timeLimitMs: problem.timeLimitMs,
        memoryLimitKb: problem.memoryLimitKb,
      });

      results.push({
        index: i + 1,
        input: test.input,
        expected: test.expected,
        output: runnerRes.output,
        error: runnerRes.error,
        exitCode: runnerRes.exitCode,
        timeSec: runnerRes.timeSec,
        memoryKb: runnerRes.memoryKb,
        verdict,
      });

      // If compile error on first test, skip remaining
      if (verdict === 'Compile Error') {
        break;
      }
    }

    res.json({ results, custom: false });
  });

  // Stage 3 & 4: Submit solution against ALL tests (visible + hidden) and trigger AI review
  app.post('/api/submit', async (req, res) => {
    const { problemId, language, code } = req.body as {
      problemId: string;
      language: SupportedLanguage;
      code: string;
    };

    if (!problemId || !language || !code) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const problem = getProblemByIdWithHidden(problemId);
    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const submission: Submission = {
      id: submissionId,
      userId: DEMO_USER_ID,
      problemId,
      language,
      code,
      status: 'running',
      createdAt: new Date().toISOString(),
    };

    await store.put('submissions', submissionId, submission);

    // Run evaluation asynchronously so client receives submissionId immediately
    (async () => {
      try {
        const compilerId = await getCompilerIdForLanguage(language);
        const visibleResults: VisibleTestResult[] = [];
        const hiddenResults: HiddenTestResult[] = [];

        let visiblePassed = 0;
        let hiddenPassed = 0;
        let maxTimeSec = 0;
        let maxMemoryKb = 0;
        let isCompiled = true;
        let hasSimulated = false;

        // 1. Run visible tests
        for (let i = 0; i < problem.visibleTests.length; i++) {
          const test = problem.visibleTests[i];
          const runnerRes = await runCode(compilerId, code, test.input);
          if (runnerRes.isSimulated) hasSimulated = true;

          maxTimeSec = Math.max(maxTimeSec, runnerRes.timeSec);
          maxMemoryKb = Math.max(maxMemoryKb, runnerRes.memoryKb);

          const verdict = determineVerdict({
            exitCode: runnerRes.exitCode,
            output: runnerRes.output,
            expected: test.expected,
            error: runnerRes.error,
            signal: runnerRes.signal,
            timeSec: runnerRes.timeSec,
            memoryKb: runnerRes.memoryKb,
            timeLimitMs: problem.timeLimitMs,
            memoryLimitKb: problem.memoryLimitKb,
          });

          if (verdict === 'Passed') visiblePassed++;
          if (verdict === 'Compile Error') isCompiled = false;

          visibleResults.push({
            index: i + 1,
            input: test.input,
            expected: test.expected,
            actual: runnerRes.output,
            verdict,
            timeSec: runnerRes.timeSec,
            memoryKb: runnerRes.memoryKb,
          });

          if (!isCompiled) break;
        }

        // 2. Run hidden tests
        const hiddenTests = problem.hiddenTests || [];
        if (isCompiled) {
          for (let i = 0; i < hiddenTests.length; i++) {
            const test = hiddenTests[i];
            const runnerRes = await runCode(compilerId, code, test.input);
            if (runnerRes.isSimulated) hasSimulated = true;

            maxTimeSec = Math.max(maxTimeSec, runnerRes.timeSec);
            maxMemoryKb = Math.max(maxMemoryKb, runnerRes.memoryKb);

            const verdict = determineVerdict({
              exitCode: runnerRes.exitCode,
              output: runnerRes.output,
              expected: test.expected,
              error: runnerRes.error,
              signal: runnerRes.signal,
              timeSec: runnerRes.timeSec,
              memoryKb: runnerRes.memoryKb,
              timeLimitMs: problem.timeLimitMs,
              memoryLimitKb: problem.memoryLimitKb,
            });

            if (verdict === 'Passed') hiddenPassed++;

            // Notice: Hidden test results omit input/expected/actual to preserve test integrity!
            hiddenResults.push({
              index: i + 1,
              verdict,
              category: test.category,
            });
          }
        }

        const visibleTotal = problem.visibleTests.length;
        const hiddenTotal = hiddenTests.length;
        const visiblePassRate = visibleTotal > 0 ? visiblePassed / visibleTotal : 0;
        const hiddenPassRate = hiddenTotal > 0 ? hiddenPassed / hiddenTotal : 0;
        const correctness = Math.round(70 * hiddenPassRate + 30 * visiblePassRate);

        const deterministic = {
          compiled: isCompiled,
          visiblePassed,
          visibleTotal,
          hiddenPassed,
          hiddenTotal,
          maxTimeMs: Math.round(maxTimeSec * 1000),
          maxMemoryKb,
          correctness,
        };

        // 3. Stage 4 Gemini Qualitative Review
        const aiReview = await reviewSubmission({
          problem,
          language,
          code,
          deterministic,
        });

        // 4. Combine scores
        const hiddenExpectedOutputs = hiddenTests.map((h) => h.expected);
        const combined = combineSubmissionScores({
          deterministic,
          aiReview,
          code,
          hiddenExpectedOutputs,
        });

        // 5. Stage 5 Write Skill Evidence (ONLY if real non-simulated execution)
        if (!hasSimulated) {
          const difficultyRating =
            problem.difficulty === 'Hard' ? 3 : problem.difficulty === 'Medium' ? 2 : 1;

          for (const skillId of problem.skills) {
            const evidenceId = `ev_${submissionId}_${skillId}`;
            const evidenceRow: EvidenceItem = {
              id: evidenceId,
              userId: DEMO_USER_ID,
              skillId,
              type: 'coding',
              score: Math.round((correctness / 100) * 100) / 100,
              difficulty: difficultyRating as 1 | 2 | 3,
              sourceRef: submissionId,
              integrity: combined.integrityFactor,
              createdAt: new Date().toISOString(),
              details: {
                problemTitle: problem.title,
                correctnessPercent: correctness,
                verdictSummary: `${hiddenPassed}/${hiddenTotal} hidden tests passed`,
              },
            };
            await store.put('skill_evidence', evidenceId, evidenceRow);
          }
        }

        // Save completed submission
        const completedSubmission: Submission = {
          ...submission,
          status: 'completed',
          completedAt: new Date().toISOString(),
          deterministic,
          visibleTestResults: visibleResults,
          hiddenTestResults: hiddenResults,
          aiReview,
          overallScore: combined.overallScore,
          needsReview: combined.needsReview,
        };

        await store.put('submissions', submissionId, completedSubmission);
      } catch (err: unknown) {
        console.error('Submission evaluation failed:', err);
        const failedSub: Submission = {
          ...submission,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Evaluation runtime error',
        };
        await store.put('submissions', submissionId, failedSub);
      }
    })();

    res.json({ submissionId });
  });

  // Get submission results
  app.get('/api/submissions/:id', async (req, res) => {
    const sub = await store.get<Submission>('submissions', req.params.id);
    if (!sub) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }
    res.json(sub);
  });

  // Stage 5: Candidate Skills and Dashboard
  app.get('/api/me/skills', async (req, res) => {
    const sessionUser = await verifySession(req);
    const userId = sessionUser?.uid || DEMO_USER_ID;
    const evaluated = await getUserEvaluatedSkills(userId);
    res.json(evaluated);
  });

  app.get('/api/me/dashboard', async (req, res) => {
    const sessionUser = await verifySession(req);
    const userId = sessionUser?.uid || DEMO_USER_ID;
    const evaluated = await getUserEvaluatedSkills(userId);
    const skillsMap = new Map(evaluated.map((s) => [s.skillId, s]));
    const readiness = calculateCareerReadiness('backend-developer', skillsMap);

    const submissions = await store.list<Submission>('submissions');
    const userSubmissions = submissions
      .filter((s) => s.userId === userId && s.status === 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        type: 'submission' as const,
        title: `Challenge: ${s.problemId}`,
        score: s.deterministic?.correctness || 0,
        date: s.completedAt || s.createdAt,
        status: `${s.deterministic?.correctness}% deterministic`,
      }));

    const quizAttempts = await store.list<QuizAttempt>('quiz_attempts');
    const userQuizzes = quizAttempts
      .filter((q) => q.userId === userId && q.status === 'completed')
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 3)
      .map((q) => ({
        id: q.id,
        type: 'assessment' as const,
        title: 'Diagnostic Quiz Attempt',
        score: q.score || 0,
        date: q.completedAt || q.startedAt,
        status: `${q.passedCount}/${q.totalCount} correct`,
      }));

    const assessmentAttempts = await store.list<AssessmentAttempt>('assessment_attempts');
    const userAssessmentAttempts = assessmentAttempts
      .filter((a) => a.userId === userId && a.status === 'completed' && a.result)
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
      .slice(0, 3)
      .map((a) => ({
        id: a.id,
        type: 'assessment' as const,
        title: `Python: ${a.result?.badgeLabel} Badge (${a.result?.overallPercent}%)`,
        score: a.result?.overallPercent || 0,
        date: a.completedAt || a.startedAt,
        status: `${a.result?.badgeLabel} · ${a.result?.level}`,
      }));

    const recentActivity = [...userAssessmentAttempts, ...userSubmissions, ...userQuizzes].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json({
      userId: DEMO_USER_ID,
      careerReadiness: readiness,
      skills: evaluated,
      recentActivity,
    });
  });

  // Stage 6: Diagnostic Quiz Assessment
  app.post('/api/assessment/start', async (_req, res) => {
    const attemptId = `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Pick 12 random questions from bank
    const shuffled = [...QUIZ_QUESTION_BANK].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 12);
    const questionIds = selected.map((q) => q.id);

    const attempt: QuizAttempt = {
      id: attemptId,
      userId: DEMO_USER_ID,
      startedAt: new Date().toISOString(),
      deadlineAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 mins
      status: 'in_progress',
      questionIds,
      answers: {},
    };

    await store.put('quiz_attempts', attemptId, attempt);

    // Return questions WITHOUT correctOptionId and explanation!
    const publicQuestions = selected.map((q) => {
      // Shuffled options for fairness
      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
      return {
        id: q.id,
        topic: q.topic,
        prompt: q.prompt,
        codeSnippet: q.codeSnippet,
        options: shuffledOptions,
        skills: q.skills,
      };
    });

    res.json({
      attemptId,
      deadlineAt: attempt.deadlineAt,
      questions: publicQuestions,
    });
  });

  app.post('/api/assessment/submit', async (req, res) => {
    const { attemptId, answers } = req.body as {
      attemptId: string;
      answers: Record<string, string>;
    };

    const attempt = await store.get<QuizAttempt>('quiz_attempts', attemptId);
    if (!attempt) {
      res.status(404).json({ error: 'Assessment attempt not found' });
      return;
    }

    if (attempt.status === 'completed') {
      res.status(400).json({ error: 'This assessment attempt has already been submitted' });
      return;
    }

    let passedCount = 0;
    const graded = attempt.questionIds.map((qid) => {
      const q = QUIZ_QUESTION_BANK.find((x) => x.id === qid);
      const userChoice = answers[qid] || '';
      const isCorrect = Boolean(q && userChoice === q.correctOptionId);
      if (isCorrect) passedCount++;

      return {
        questionId: qid,
        selectedOptionId: userChoice,
        correctOptionId: q?.correctOptionId || '',
        isCorrect,
        explanation: q?.explanation || '',
      };
    });

    const totalCount = attempt.questionIds.length;
    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

    // Write knowledge evidence for each assessed skill
    // NOTE: Type is 'knowledge', which scoring.ts strictly caps at Beginner!
    for (const item of graded) {
      const q = QUIZ_QUESTION_BANK.find((x) => x.id === item.questionId);
      if (q) {
        for (const skillId of q.skills) {
          const evId = `ev_quiz_${attemptId}_${item.questionId}_${skillId}`;
          const evidenceRow: EvidenceItem = {
            id: evId,
            userId: DEMO_USER_ID,
            skillId,
            type: 'knowledge',
            score: item.isCorrect ? 1.0 : 0.0,
            difficulty: 1,
            sourceRef: attemptId,
            integrity: 0.85,
            createdAt: new Date().toISOString(),
            details: {
              problemTitle: `Quiz: ${q.topic}`,
              correctnessPercent: item.isCorrect ? 100 : 0,
              verdictSummary: item.isCorrect ? 'Correct Answer' : 'Incorrect Answer',
            },
          };
          await store.put('skill_evidence', evId, evidenceRow);
        }
      }
    }

    const completedAttempt: QuizAttempt = {
      ...attempt,
      status: 'completed',
      completedAt: new Date().toISOString(),
      answers,
      score,
      passedCount,
      totalCount,
      gradedQuestions: graded,
    };

    await store.put('quiz_attempts', attemptId, completedAttempt);

    res.json({
      attemptId,
      score,
      passedCount,
      totalCount,
      gradedQuestions: graded,
    });
  });

  // Assessments Endpoints (25-Question Verified Architecture)
  app.get('/api/assessments', async (_req, res) => {
    try {
      const attempts = await store.list<AssessmentAttempt>('assessment_attempts');
      const userAttempts = attempts.filter((a) => a.userId === DEMO_USER_ID && a.status === 'completed' && a.result);

      const lastResultsMap = new Map<string, { overallPercent: number; badgeLabel: string; completedAt: string; recordId: string }>();
      for (const a of userAttempts) {
        if (a.result) {
          lastResultsMap.set(a.assessmentId, {
            overallPercent: a.result.overallPercent,
            badgeLabel: a.result.badgeLabel,
            completedAt: a.completedAt || a.result.issuedAt,
            recordId: a.result.recordId,
          });
        }
      }

      const summaries = getPublicAssessmentSummaries(lastResultsMap);
      res.json(summaries);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch assessments' });
    }
  });

  app.get('/api/assessments/:id', async (req, res) => {
    try {
      const detail = getPublicAssessmentDetail(req.params.id);
      if (!detail) {
        res.status(404).json({ error: `Assessment '${req.params.id}' not found` });
        return;
      }

      // Check for in_progress attempt
      const attempts = await store.list<AssessmentAttempt>('assessment_attempts');
      const inProgress = attempts.find(
        (a) => a.userId === DEMO_USER_ID && a.assessmentId === req.params.id && a.status === 'in_progress'
      );

      let inProgressAttemptId: string | undefined = undefined;
      let remainingSeconds: number | undefined = undefined;

      if (inProgress) {
        const remaining = Math.max(0, Math.round((new Date(inProgress.deadlineAt).getTime() - Date.now()) / 1000));
        if (remaining > 0) {
          inProgressAttemptId = inProgress.id;
          remainingSeconds = remaining;
        }
      }

      // Check last result
      const lastCompleted = attempts
        .filter((a) => a.userId === DEMO_USER_ID && a.assessmentId === req.params.id && a.status === 'completed' && a.result)
        .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];

      if (lastCompleted?.result) {
        detail.lastResult = {
          overallPercent: lastCompleted.result.overallPercent,
          badgeLabel: lastCompleted.result.badgeLabel,
          completedAt: lastCompleted.completedAt || lastCompleted.result.issuedAt,
          recordId: lastCompleted.result.recordId,
        };
      }

      res.json({
        ...detail,
        inProgressAttemptId,
        remainingSeconds,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch assessment detail' });
    }
  });

  app.post('/api/assessments/:id/start', async (req, res) => {
    try {
      const assessment = getAssessmentById(req.params.id);
      if (!assessment) {
        res.status(404).json({ error: `Assessment '${req.params.id}' not found` });
        return;
      }

      const userId = (req.headers['x-user-id'] as string) || DEMO_USER_ID;
      const attempts = await store.list<AssessmentAttempt>('assessment_attempts');
      const userAttempts = attempts.filter((a) => a.userId === userId && a.assessmentId === assessment.id);

      const existing = userAttempts.find((a) => a.status === 'in_progress');

      if (existing) {
        const remaining = Math.max(0, Math.round((new Date(existing.deadlineAt).getTime() - Date.now()) / 1000));
        if (remaining > 0) {
          res.json({
            attemptId: existing.id,
            startedAt: existing.startedAt,
            deadlineAt: existing.deadlineAt,
            remainingSeconds: remaining,
            inProgress: true,
          });
          return;
        } else {
          // Expired attempt must not be returned as in progress
          existing.status = 'expired';
          await store.put('assessment_attempts', existing.id, existing);
        }
      }

      // Check cooldown logic (must never block user's first attempt)
      const cooldownMinutes = parseInt(process.env.ASSESSMENT_COOLDOWN_MINUTES || '0', 10);
      if (cooldownMinutes > 0) {
        const completedAttempts = userAttempts
          .filter((a) => a.status === 'completed' && a.completedAt)
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

        if (completedAttempts.length > 0) {
          const lastCompleted = completedAttempts[0];
          const elapsedMinutes = (Date.now() - new Date(lastCompleted.completedAt!).getTime()) / (1000 * 60);
          if (elapsedMinutes < cooldownMinutes) {
            const waitMinutes = Math.ceil(cooldownMinutes - elapsedMinutes);
            res.status(429).json({
              error: `Retake cooldown in effect. Please wait ${waitMinutes} minute(s) before starting a new attempt.`,
              cooldownRemainingMinutes: waitMinutes,
            });
            return;
          }
        }
      }

      const attemptId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const now = new Date();
      const deadlineAt = new Date(now.getTime() + assessment.timeLimitMinutes * 60 * 1000).toISOString();

      // Seed answers with starter code for coding questions
      const initialAnswers: Record<string, { choiceId?: string; code?: string; flagged?: boolean; updatedAt?: string }> = {};
      for (const sec of assessment.sections) {
        for (const q of sec.questions) {
          if (q.type === 'code') {
            const codeQ = q as CodeQuestion;
            initialAnswers[codeQ.id] = {
              code: codeQ.starterCode.python,
              flagged: false,
              updatedAt: now.toISOString(),
            };
          }
        }
      }

      const newAttempt: AssessmentAttempt = {
        id: attemptId,
        userId,
        assessmentId: assessment.id,
        status: 'in_progress',
        startedAt: now.toISOString(),
        deadlineAt,
        answers: initialAnswers,
        submissionsCountByQid: {},
        integrity: {
          tabSwitches: 0,
          largePastes: 0,
          flagged: false,
        },
      };

      await store.put('assessment_attempts', attemptId, newAttempt);

      res.json({
        attemptId,
        startedAt: newAttempt.startedAt,
        deadlineAt: newAttempt.deadlineAt,
        remainingSeconds: assessment.timeLimitMinutes * 60,
        inProgress: false,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to start assessment' });
    }
  });

  app.get('/api/attempts/:attemptId', async (req, res) => {
    try {
      const attempt = await store.get<AssessmentAttempt>('assessment_attempts', req.params.attemptId);
      if (!attempt) {
        res.status(404).json({ error: 'Assessment attempt not found' });
        return;
      }

      const requesterId = (req.headers['x-user-id'] as string) || DEMO_USER_ID;
      if (attempt.userId && requesterId && attempt.userId !== requesterId) {
        res.status(403).json({ error: "Forbidden: You cannot access another user's assessment attempt" });
        return;
      }

      const remaining = Math.max(0, Math.round((new Date(attempt.deadlineAt).getTime() - Date.now()) / 1000));
      if (remaining === 0 && attempt.status === 'in_progress') {
        attempt.status = 'expired';
        await store.put('assessment_attempts', attempt.id, attempt);
      }

      const assessment = getAssessmentById(attempt.assessmentId);
      const publicDetail = getPublicAssessmentDetail(attempt.assessmentId);

      // Build 25 sanitized questions in order (5 easy, 10 medium, 10 hard) without answers or hidden tests
      const questions: any[] = [];
      if (publicDetail) {
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
      }

      res.json({
        ...attempt,
        assessmentTitle: assessment?.title || 'Python',
        timeLimitMinutes: assessment?.timeLimitMinutes || 180,
        remainingSeconds: remaining,
        sectionsDetailed: publicDetail ? publicDetail.sectionsDetailed : [],
        questions,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get attempt' });
    }
  });

  app.put('/api/attempts/:attemptId/answer', async (req, res) => {
    try {
      const { qid, choiceId, code, flagged } = req.body as {
        qid: string;
        choiceId?: string;
        code?: string;
        flagged?: boolean;
      };

      const attempt = await store.get<AssessmentAttempt>('assessment_attempts', req.params.attemptId);
      if (!attempt) {
        res.status(404).json({ error: 'Attempt not found' });
        return;
      }

      const requesterId = (req.headers['x-user-id'] as string) || DEMO_USER_ID;
      if (attempt.userId && requesterId && attempt.userId !== requesterId) {
        res.status(403).json({ error: "Forbidden: You cannot modify another user's assessment attempt" });
        return;
      }

      if (attempt.status !== 'in_progress') {
        res.status(400).json({ error: 'Cannot update answers for completed or expired attempt' });
        return;
      }

      const existingAnswer = attempt.answers[qid] || {};
      attempt.answers[qid] = {
        ...existingAnswer,
        choiceId: choiceId !== undefined ? choiceId : existingAnswer.choiceId,
        code: code !== undefined ? code : existingAnswer.code,
        flagged: flagged !== undefined ? flagged : existingAnswer.flagged,
        updatedAt: new Date().toISOString(),
      };

      await store.put('assessment_attempts', attempt.id, attempt);
      res.json({ saved: true });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to save answer' });
    }
  });

  app.post('/api/attempts/:attemptId/events', async (req, res) => {
    try {
      const { type } = req.body as { type: 'tab_switch' | 'large_paste' };
      const attempt = await store.get<AssessmentAttempt>('assessment_attempts', req.params.attemptId);
      if (!attempt) {
        res.status(404).json({ error: 'Attempt not found' });
        return;
      }

      if (type === 'tab_switch') {
        attempt.integrity.tabSwitches = (attempt.integrity.tabSwitches || 0) + 1;
      } else if (type === 'large_paste') {
        attempt.integrity.largePastes = (attempt.integrity.largePastes || 0) + 1;
      }

      if (attempt.integrity.tabSwitches > 5 || attempt.integrity.largePastes > 3) {
        attempt.integrity.flagged = true;
      }

      await store.put('assessment_attempts', attempt.id, attempt);
      res.json({ recorded: true, flagged: attempt.integrity.flagged });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to record event' });
    }
  });

  app.post('/api/attempts/:attemptId/questions/:qid/run', async (req, res) => {
    try {
      const { code, customInput } = req.body as { code: string; customInput?: string };
      const attempt = await store.get<AssessmentAttempt>('assessment_attempts', req.params.attemptId);
      if (!attempt) {
        res.status(404).json({ error: 'Attempt not found' });
        return;
      }

      const assessment = getAssessmentById(attempt.assessmentId);
      if (!assessment) {
        res.status(404).json({ error: 'Assessment not found' });
        return;
      }

      let codeQ: CodeQuestion | undefined;
      for (const sec of assessment.sections) {
        for (const q of sec.questions) {
          if (q.id === req.params.qid && q.type === 'code') {
            codeQ = q as CodeQuestion;
            break;
          }
        }
      }

      if (!codeQ) {
        res.status(404).json({ error: 'Coding question not found' });
        return;
      }

      const compilerId = await getCompilerIdForLanguage('python');
      const results: RunTestItemResult[] = [];

      if (customInput !== undefined) {
        const runnerRes = await runCode(compilerId, code, customInput);
        const verdict = determineVerdict({
          exitCode: runnerRes.exitCode,
          output: runnerRes.output,
          expected: undefined,
          error: runnerRes.error,
          signal: runnerRes.signal,
          timeSec: runnerRes.timeSec,
          memoryKb: runnerRes.memoryKb,
          timeLimitMs: codeQ.timeLimitMs,
          memoryLimitKb: codeQ.memoryLimitKb,
        });

        results.push({
          index: 1,
          input: customInput,
          output: runnerRes.output,
          error: runnerRes.error,
          exitCode: runnerRes.exitCode,
          timeSec: runnerRes.timeSec,
          memoryKb: runnerRes.memoryKb,
          verdict,
        });

        res.json({ results, custom: true });
        return;
      }

      for (let i = 0; i < codeQ.visibleTests.length; i++) {
        const test = codeQ.visibleTests[i];
        const runnerRes = await runCode(compilerId, code, test.input);

        const verdict = determineVerdict({
          exitCode: runnerRes.exitCode,
          output: runnerRes.output,
          expected: test.expected,
          error: runnerRes.error,
          signal: runnerRes.signal,
          timeSec: runnerRes.timeSec,
          memoryKb: runnerRes.memoryKb,
          timeLimitMs: codeQ.timeLimitMs,
          memoryLimitKb: codeQ.memoryLimitKb,
        });

        results.push({
          index: i + 1,
          input: test.input,
          expected: test.expected,
          output: runnerRes.output,
          error: runnerRes.error,
          exitCode: runnerRes.exitCode,
          timeSec: runnerRes.timeSec,
          memoryKb: runnerRes.memoryKb,
          verdict,
        });

        if (verdict === 'Compile Error') break;
      }

      res.json({ results, custom: false });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Run failed' });
    }
  });

  app.post('/api/attempts/:attemptId/questions/:qid/submit', async (req, res) => {
    try {
      const { code } = req.body as { code: string };
      const attempt = await store.get<AssessmentAttempt>('assessment_attempts', req.params.attemptId);
      if (!attempt) {
        res.status(404).json({ error: 'Attempt not found' });
        return;
      }

      const qid = req.params.qid;
      const count = attempt.submissionsCountByQid[qid] || 0;
      if (count >= 3) {
        res.status(400).json({ error: 'Maximum 3 submissions reached for this problem' });
        return;
      }

      const assessment = getAssessmentById(attempt.assessmentId);
      if (!assessment) {
        res.status(404).json({ error: 'Assessment not found' });
        return;
      }

      let codeQ: CodeQuestion | undefined;
      for (const sec of assessment.sections) {
        for (const q of sec.questions) {
          if (q.id === qid && q.type === 'code') {
            codeQ = q as CodeQuestion;
            break;
          }
        }
      }

      if (!codeQ) {
        res.status(404).json({ error: 'Coding question not found' });
        return;
      }

      const compilerId = await getCompilerIdForLanguage('python');
      const visibleResults: VisibleTestResult[] = [];
      let compiled = true;
      let compileError: string | undefined = undefined;
      let maxTimeMs = 0;
      let maxMemoryKb = 0;

      // 1. Run visible tests
      for (let i = 0; i < codeQ.visibleTests.length; i++) {
        const test = codeQ.visibleTests[i];
        const runnerRes = await runCode(compilerId, code, test.input);

        const verdict = determineVerdict({
          exitCode: runnerRes.exitCode,
          output: runnerRes.output,
          expected: test.expected,
          error: runnerRes.error,
          signal: runnerRes.signal,
          timeSec: runnerRes.timeSec,
          memoryKb: runnerRes.memoryKb,
          timeLimitMs: codeQ.timeLimitMs,
          memoryLimitKb: codeQ.memoryLimitKb,
        });

        maxTimeMs = Math.max(maxTimeMs, (runnerRes.timeSec || 0) * 1000);
        maxMemoryKb = Math.max(maxMemoryKb, runnerRes.memoryKb || 0);

        visibleResults.push({
          index: i + 1,
          input: test.input,
          expected: test.expected,
          actual: runnerRes.output,
          verdict,
          timeSec: runnerRes.timeSec,
          memoryKb: runnerRes.memoryKb,
        });

        if (verdict === 'Compile Error') {
          compiled = false;
          compileError = runnerRes.error || runnerRes.output;
          break;
        }
      }

      // 2. Run hidden tests
      const hiddenResults: HiddenTestResult[] = [];
      if (compiled) {
        for (let i = 0; i < codeQ.hiddenTests.length; i++) {
          const test = codeQ.hiddenTests[i];
          const runnerRes = await runCode(compilerId, code, test.input);

          const verdict = determineVerdict({
            exitCode: runnerRes.exitCode,
            output: runnerRes.output,
            expected: test.expected,
            error: runnerRes.error,
            signal: runnerRes.signal,
            timeSec: runnerRes.timeSec,
            memoryKb: runnerRes.memoryKb,
            timeLimitMs: codeQ.timeLimitMs,
            memoryLimitKb: codeQ.memoryLimitKb,
          });

          maxTimeMs = Math.max(maxTimeMs, (runnerRes.timeSec || 0) * 1000);
          maxMemoryKb = Math.max(maxMemoryKb, runnerRes.memoryKb || 0);

          hiddenResults.push({
            index: i + 1,
            verdict,
            category: test.category,
          });
        }
      }

      const visiblePassed = visibleResults.filter((r) => r.verdict === 'Passed').length;
      const visibleTotal = codeQ.visibleTests.length;
      const hiddenPassed = hiddenResults.filter((r) => r.verdict === 'Passed').length;
      const hiddenTotal = codeQ.hiddenTests.length;

      const visiblePassRate = visibleTotal > 0 ? visiblePassed / visibleTotal : 1;
      const hiddenPassRate = hiddenTotal > 0 ? hiddenPassed / hiddenTotal : 1;
      const correctness = Math.round(70 * hiddenPassRate + 30 * visiblePassRate);

      const deterministic: DeterministicResult = {
        compiled,
        visiblePassed,
        visibleTotal,
        hiddenPassed,
        hiddenTotal,
        maxTimeMs,
        maxMemoryKb,
        correctness,
        compileError,
      };

      const aiReview = await reviewSubmission({
        problemTitle: codeQ.title,
        problemDescription: codeQ.statement,
        code,
        language: 'python',
        deterministicResult: deterministic,
      });

      const combined = combineSubmissionScores({
        deterministic,
        aiReview,
        code,
        hiddenExpectedOutputs: codeQ.hiddenTests.map((t) => t.expected),
      });

      const submissionId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const submission: Submission = {
        id: submissionId,
        userId: DEMO_USER_ID,
        problemId: qid,
        language: 'python',
        code,
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        deterministic,
        visibleTestResults: visibleResults,
        hiddenTestResults: hiddenResults,
        aiReview,
        overallScore: combined.overallScore,
        needsReview: combined.needsReview,
      };

      await store.put('submissions', submissionId, submission);

      attempt.submissionsCountByQid[qid] = count + 1;
      attempt.answers[qid] = {
        ...attempt.answers[qid],
        code,
        updatedAt: new Date().toISOString(),
      };
      await store.put('assessment_attempts', attempt.id, attempt);

      res.json({
        submissionId,
        deterministic,
        aiReview,
        overallScore: combined.overallScore,
        remainingSubmissions: 3 - (count + 1),
      });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Submission failed' });
    }
  });

  app.post('/api/attempts/:attemptId/finish', async (req, res) => {
    try {
      const attempt = await store.get<AssessmentAttempt>('assessment_attempts', req.params.attemptId);
      if (!attempt) {
        res.status(404).json({ error: 'Attempt not found' });
        return;
      }

      const assessment = getAssessmentById(attempt.assessmentId);
      if (!assessment) {
        res.status(404).json({ error: 'Assessment not found' });
        return;
      }

      const submissions = await store.list<Submission>('submissions');
      const userSubmissions = submissions.filter((s) => s.userId === DEMO_USER_ID && s.status === 'completed');

      const result = calculateAssessmentResult({
        attempt,
        assessment,
        submissions: userSubmissions,
      });

      attempt.status = 'completed';
      attempt.completedAt = new Date().toISOString();
      attempt.result = result;
      await store.put('assessment_attempts', attempt.id, attempt);

      // Write skill evidence rows
      for (const item of result.questionsReview) {
        for (const skillId of item.skills) {
          const evId = `ev_${attempt.id}_${item.qid}_${skillId}`;
          const isMcq = item.type === 'mcq';
          const difficulty = item.sectionId === 'A' ? 1 : item.sectionId === 'B' ? 2 : 3;

          const evidenceRow: EvidenceItem = {
            id: evId,
            userId: DEMO_USER_ID,
            skillId,
            type: isMcq ? 'knowledge' : 'coding',
            score: item.score,
            difficulty: difficulty as 1 | 2 | 3,
            sourceRef: attempt.id,
            integrity: attempt.integrity.flagged ? 0.5 : 0.85,
            createdAt: new Date().toISOString(),
            details: {
              problemTitle: item.titleOrPrompt.slice(0, 50),
              correctnessPercent: Math.round(item.score * 100),
              verdictSummary: item.correct ? 'Passed' : 'Failed',
            },
          };
          await store.put('skill_evidence', evId, evidenceRow);
        }
      }

      // Store badge record
      await store.put('badges', result.recordId, {
        userId: DEMO_USER_ID,
        assessmentId: attempt.assessmentId,
        attemptId: attempt.id,
        recordId: result.recordId,
        overallPercent: result.overallPercent,
        label: result.badgeLabel,
        capReason: result.capReason,
        level: result.level,
        confidence: result.confidence,
        tier: result.tier,
        status: result.badgeStatus,
        sectionBreakdown: result.sectionBreakdown,
        summary: result.summary,
        issuedAt: result.issuedAt,
        expiresAt: result.expiresAt,
      });

      res.json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to finish attempt' });
    }
  });

  app.get('/api/attempts/:attemptId/result', async (req, res) => {
    try {
      const attempt = await store.get<AssessmentAttempt>('assessment_attempts', req.params.attemptId);
      if (!attempt || !attempt.result) {
        res.status(404).json({ error: 'Assessment attempt result not found' });
        return;
      }
      res.json(attempt.result);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get result' });
    }
  });

  // Stage 7: Job Match and Gap Plan
  app.post('/api/job-match', async (req, res) => {
    const { jobDescription } = req.body as { jobDescription: string };
    if (!jobDescription || jobDescription.trim().length < 10) {
      res.status(400).json({ error: 'Please provide a valid job description text' });
      return;
    }

    const evaluated = await getUserEvaluatedSkills(DEMO_USER_ID);
    const result = await analyzeJobMatch(jobDescription, evaluated);
    res.json(result);
  });

  // Stage 8: Passport Profile & Employer Views
  app.get('/api/passport/:slug', async (req, res) => {
    const evaluated = await getUserEvaluatedSkills(DEMO_USER_ID);
    const submissions = await store.list<Submission>('submissions');
    const validSubs = submissions
      .filter((s) => s.userId === DEMO_USER_ID && s.status === 'completed')
      .map((s) => ({
        id: s.id,
        problemId: s.problemId,
        problemTitle: s.problemId.replace('-', ' ').toUpperCase(),
        language: s.language,
        correctness: s.deterministic?.correctness || 0,
        overallScore: s.overallScore,
        date: s.completedAt || s.createdAt,
        integrityFactor: 0.85,
      }));

    const quizzes = await store.list<QuizAttempt>('quiz_attempts');
    const validQuizzes = quizzes
      .filter((q) => q.userId === DEMO_USER_ID && q.status === 'completed')
      .map((q) => ({
        id: q.id,
        score: q.score || 0,
        date: q.completedAt || q.startedAt,
      }));

    const passport = buildPassportProfile(DEMO_USER_ID, evaluated, validSubs, validQuizzes);
    res.json(passport);
  });

  app.get('/api/candidates', (_req, res) => {
    res.json({
      candidates: DEMO_CANDIDATES,
      isDemoData: true,
    });
  });

  app.post('/api/candidates/rank', (req, res) => {
    const { weights } = req.body as {
      weights: {
        requirementCoverage: number;
        evidenceConfidence: number;
        recency: number;
        projectRelevance: number;
        practicalEvidence: number;
      };
    };
    const ranked = rankCandidates(DEMO_CANDIDATES, weights);
    res.json({ candidates: ranked });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const landingRoutes = [
    '/',
    '/landing',
    '/landing.html',
    '/privacy',
    '/sample-passport',
    '/login',
    '/signup',
    '/forgot-password',
  ];

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    // Public before-login landing routes
    app.get(landingRoutes, async (req, res, next) => {
      try {
        if (AUTH_GATE) {
          const sessionUser = await verifySession(req);
          if (sessionUser) {
            // If already signed in and visiting /login or /signup, redirect to root
            if (req.path === '/login' || req.path === '/signup') {
              return res.redirect('/');
            }
            // If already signed in and visiting root '/', serve private app index.html
            if (req.path === '/' || req.path === '/landing' || req.path === '/landing.html') {
              const indexHtmlPath = path.resolve(__dirname, 'index.html');
              let html = await fs.promises.readFile(indexHtmlPath, 'utf-8');
              html = await vite.transformIndexHtml(req.originalUrl, html);
              return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
            }
          }
        }

        const landingHtmlPath = path.resolve(__dirname, 'landing.html');
        let html = await fs.promises.readFile(landingHtmlPath, 'utf-8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });

    // Vite internal middleware (assets, HMR, modules)
    app.use(vite.middlewares);

    // After-login application SPA fallback (dashboard, assessments, etc.)
    // Gated by requireAuth
    app.get('*', requireAuth, async (req, res, next) => {
      try {
        const indexHtmlPath = path.resolve(__dirname, 'index.html');
        let html = await fs.promises.readFile(indexHtmlPath, 'utf-8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get(landingRoutes, async (req, res) => {
      if (AUTH_GATE) {
        const sessionUser = await verifySession(req);
        if (sessionUser) {
          if (req.path === '/login' || req.path === '/signup') {
            return res.redirect('/');
          }
          if (req.path === '/' || req.path === '/landing' || req.path === '/landing.html') {
            return res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
          }
        }
      }
      res.sendFile(path.resolve(__dirname, 'dist', 'landing.html'));
    });
    app.get('*', requireAuth, (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
