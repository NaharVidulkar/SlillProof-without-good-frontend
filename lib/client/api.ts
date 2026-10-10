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
    credentials: 'include',
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

  getAttempt: async (attemptId: string): Promise<AssessmentAttempt & {
    remainingSeconds?: number;
    questions?: any[];
    sectionsDetailed?: any[];
    assessmentTitle?: string;
    timeLimitMinutes?: number;
  }> => {
    return fetchJson<AssessmentAttempt & {
      remainingSeconds?: number;
      questions?: any[];
      sectionsDetailed?: any[];
      assessmentTitle?: string;
      timeLimitMinutes?: number;
    }>(`/api/attempts/${attemptId}`);
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

  // CV Analysis API
  analyseCv: async (payload: {
    fileData?: string;
    fileName?: string;
    mimeType?: string;
    textContent?: string;
  }): Promise<{ ok: boolean; analysis: any; sections?: any[]; profile?: any }> => {
    return fetchJson<{ ok: boolean; analysis: any; sections?: any[]; profile?: any }>('/api/cv/analyse', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getLatestAnalysis: async (): Promise<{ ok: boolean; analysis: any | null }> => {
    return fetchJson<{ ok: boolean; analysis: any | null }>('/api/cv/analysis/latest');
  },

  // Dynamic Personalized Assessment Sections
  getUserSections: async (): Promise<{ sections: any[]; laterSkills?: any[] }> => {
    return fetchJson<{ sections: any[]; laterSkills?: any[] }>('/api/sections');
  },

  openUserSection: async (skillSlug: string): Promise<{ section: any; questions?: any[] }> => {
    return fetchJson<{ section: any; questions?: any[] }>(`/api/sections/${skillSlug}/open`, {
      method: 'POST',
    });
  },

  saveSectionProgress: async (
    skillSlug: string,
    payload: { currentQuestionIndex: number; answers: Record<string, string>; codeDrafts?: Record<string, string> }
  ): Promise<{ ok: boolean }> => {
    return fetchJson<{ ok: boolean }>(`/api/sections/${skillSlug}/save-progress`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  submitSection: async (
    skillSlug: string,
    payload: { answers: Record<string, string>; codeDrafts?: Record<string, string> }
  ): Promise<any> => {
    return fetchJson<any>(`/api/sections/${skillSlug}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  runDynamicCode: async (payload: {
    skillSlug: string;
    questionId?: string;
    code: string;
    customInput?: string;
    language?: string;
  }): Promise<any> => {
    return fetchJson<any>('/api/code/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteUserData: async (): Promise<{ ok: boolean; message: string }> => {
    return fetchJson<{ ok: boolean; message: string }>('/api/user/data', {
      method: 'DELETE',
    });
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
