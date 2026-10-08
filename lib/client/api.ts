/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CandidateRanking,
  DashboardData,
  EnvHealthResponse,
  JobMatchResult,
  PassportProfile,
  PublicProblem,
  QuizAttempt,
  QuizQuestionPublic,
  RunResponse,
  SkillMetric,
  Submission,
  SupportedLanguage,
} from '../types.ts';
import {
  AssessmentAttempt,
  AssessmentResult,
  PublicAssessmentDetail,
  PublicAssessmentSummary,
} from '../server/assessments/types.ts';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const errorMsg =
      data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error)
        : `Request failed with status ${res.status}`;
    throw new ApiError(errorMsg, res.status, data);
  }

  return data as T;
}

export const clientApi = {
  getEnvHealth: async (): Promise<EnvHealthResponse> => {
    return fetchJson<EnvHealthResponse>('/api/health/env');
  },

  // Problems
  getProblems: async (): Promise<PublicProblem[]> => {
    return fetchJson<PublicProblem[]>('/api/problems');
  },
  getProblemById: async (id: string): Promise<PublicProblem> => {
    return fetchJson<PublicProblem>(`/api/problems/${id}`);
  },

  // Execution
  runCode: async (params: {
    problemId: string;
    language: SupportedLanguage;
    code: string;
    customInput?: string;
  }): Promise<RunResponse> => {
    return fetchJson<RunResponse>('/api/run', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  submitSolution: async (params: {
    problemId: string;
    language: SupportedLanguage;
    code: string;
  }): Promise<{ submissionId: string }> => {
    return fetchJson<{ submissionId: string }>('/api/submit', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  getSubmission: async (id: string): Promise<Submission> => {
    return fetchJson<Submission>(`/api/submissions/${id}`);
  },

  // Skills & Dashboard
  getSkills: async (): Promise<SkillMetric[]> => {
    return fetchJson<SkillMetric[]>('/api/me/skills');
  },
  getDashboard: async (): Promise<DashboardData> => {
    return fetchJson<DashboardData>('/api/me/dashboard');
  },

  // Diagnostic Quiz
  startAssessment: async (): Promise<{
    attemptId: string;
    deadlineAt: string;
    questions: QuizQuestionPublic[];
  }> => {
    return fetchJson<{
      attemptId: string;
      deadlineAt: string;
      questions: QuizQuestionPublic[];
    }>('/api/assessment/start', {
      method: 'POST',
    });
  },

  submitAssessment: async (params: {
    attemptId: string;
    answers: Record<string, string>;
  }): Promise<QuizAttempt> => {
    return fetchJson<QuizAttempt>('/api/assessment/submit', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Assessments (Comprehensive 25-Question verified platform)
  getAssessments: async (): Promise<PublicAssessmentSummary[]> => {
    return fetchJson<PublicAssessmentSummary[]>('/api/assessments');
  },

  getAssessmentDetail: async (id: string): Promise<PublicAssessmentDetail & { inProgressAttemptId?: string; remainingSeconds?: number }> => {
    return fetchJson<PublicAssessmentDetail & { inProgressAttemptId?: string; remainingSeconds?: number }>(`/api/assessments/${id}`);
  },

  startAssessmentAttempt: async (id: string): Promise<{
    attemptId: string;
    startedAt: string;
    deadlineAt: string;
    remainingSeconds: number;
    inProgress: boolean;
  }> => {
    return fetchJson<{
      attemptId: string;
      startedAt: string;
      deadlineAt: string;
      remainingSeconds: number;
      inProgress: boolean;
    }>(`/api/assessments/${id}/start`, {
      method: 'POST',
    });
  },

  getAttempt: async (attemptId: string): Promise<AssessmentAttempt> => {
    return fetchJson<AssessmentAttempt>(`/api/attempts/${attemptId}`);
  },

  saveAnswer: async (
    attemptId: string,
    payload: { qid: string; choiceId?: string; code?: string; flagged?: boolean }
  ): Promise<{ saved: boolean }> => {
    return fetchJson<{ saved: boolean }>(`/api/attempts/${attemptId}/answer`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  recordAttemptEvent: async (
    attemptId: string,
    event: { type: 'tab_switch' | 'large_paste' }
  ): Promise<{ recorded: boolean; flagged: boolean }> => {
    return fetchJson<{ recorded: boolean; flagged: boolean }>(`/api/attempts/${attemptId}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  runAssessmentCode: async (
    attemptId: string,
    qid: string,
    payload: { code: string; customInput?: string }
  ): Promise<RunResponse> => {
    return fetchJson<RunResponse>(`/api/attempts/${attemptId}/questions/${qid}/run`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  submitAssessmentCode: async (
    attemptId: string,
    qid: string,
    payload: { code: string }
  ): Promise<{
    submissionId: string;
    deterministic?: any;
    overallScore?: number;
    remainingSubmissions: number;
  }> => {
    return fetchJson<{
      submissionId: string;
      deterministic?: any;
      overallScore?: number;
      remainingSubmissions: number;
    }>(`/api/attempts/${attemptId}/questions/${qid}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  finishAssessmentAttempt: async (attemptId: string): Promise<AssessmentResult> => {
    return fetchJson<AssessmentResult>(`/api/attempts/${attemptId}/finish`, {
      method: 'POST',
    });
  },

  getAssessmentResult: async (attemptId: string): Promise<AssessmentResult> => {
    return fetchJson<AssessmentResult>(`/api/attempts/${attemptId}/result`);
  },

  // Job Match
  matchJob: async (jobDescription: string): Promise<JobMatchResult> => {
    return fetchJson<JobMatchResult>('/api/job-match', {
      method: 'POST',
      body: JSON.stringify({ jobDescription }),
    });
  },

  // Passport & Employers
  getPassport: async (slug: string): Promise<PassportProfile> => {
    return fetchJson<PassportProfile>(`/api/passport/${slug}`);
  },

  getCandidates: async (): Promise<{
    candidates: CandidateRanking[];
    isDemoData: boolean;
  }> => {
    return fetchJson<{
      candidates: CandidateRanking[];
      isDemoData: boolean;
    }>('/api/candidates');
  },

  rankCandidates: async (weights: {
    requirementCoverage: number;
    evidenceConfidence: number;
    recency: number;
    projectRelevance: number;
    practicalEvidence: number;
  }): Promise<{ candidates: CandidateRanking[] }> => {
    return fetchJson<{ candidates: CandidateRanking[] }>('/api/candidates/rank', {
      method: 'POST',
      body: JSON.stringify({ weights }),
    });
  },
};
