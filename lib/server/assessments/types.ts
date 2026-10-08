/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface McqQuestion {
  id: string;
  type: 'mcq';
  prompt: string;
  codeSnippet?: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string; // server-only
  explanation: string; // server-only
  skills: string[];
}

export interface CodeQuestion {
  id: string;
  type: 'code';
  title: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  rules: string[];
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  starterCode: {
    python: string;
    java?: string;
    cpp?: string;
  };
  visibleTests: Array<{ input: string; expected: string }>;
  hiddenTests: Array<{
    input: string;
    expected: string;
    category: 'basic' | 'edge case' | 'performance';
  }>; // server-only
  timeLimitMs: number;
  memoryLimitKb: number;
  skills: string[];
}

export type AssessmentQuestion = McqQuestion | CodeQuestion;

export interface Section {
  id: 'A' | 'B' | 'C';
  title: string;
  difficulty: 1 | 2 | 3;
  difficultyLabel: 'Easy' | 'Medium' | 'Hard';
  weight: number;
  questions: AssessmentQuestion[];
}

export interface Assessment {
  id: string;
  title: string;
  domain: string;
  description: string;
  timeLimitMinutes: number;
  sections: Section[];
}

// Client sanitized representations
export type PublicMcqQuestion = Omit<McqQuestion, 'correctOptionId' | 'explanation'>;
export type PublicCodeQuestion = Omit<CodeQuestion, 'hiddenTests'>;
export type PublicAssessmentQuestion = PublicMcqQuestion | PublicCodeQuestion;

export interface PublicSection {
  id: 'A' | 'B' | 'C';
  title: string;
  difficulty: 1 | 2 | 3;
  difficultyLabel: 'Easy' | 'Medium' | 'Hard';
  weight: number;
  questionCount: number;
  mcqCount: number;
  codeCount: number;
  questions?: PublicAssessmentQuestion[];
}

export interface PublicAssessmentSummary {
  id: string;
  title: string;
  domain: string;
  description: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  totalMcq: number;
  totalCode: number;
  sections: Array<{
    id: 'A' | 'B' | 'C';
    title: string;
    difficultyLabel: 'Easy' | 'Medium' | 'Hard';
    questionCount: number;
    description: string;
  }>;
  lastResult?: {
    overallPercent: number;
    badgeLabel: string;
    completedAt: string;
    recordId: string;
  };
}

export interface PublicAssessmentDetail extends PublicAssessmentSummary {
  sectionsDetailed: PublicSection[];
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  assessmentId: string;
  status: 'in_progress' | 'completed' | 'expired';
  startedAt: string;
  deadlineAt: string;
  completedAt?: string;
  answers: Record<string, { choiceId?: string; code?: string; flagged?: boolean; updatedAt?: string }>;
  submissionsCountByQid: Record<string, number>;
  integrity: {
    tabSwitches: number;
    largePastes: number;
    flagged: boolean;
  };
  result?: AssessmentResult;
}

export interface SectionScoreBreakdown {
  id: 'A' | 'B' | 'C';
  title: string;
  difficultyLabel: 'Easy' | 'Medium' | 'Hard';
  weight: number;
  questionCount: number;
  earnedScore: number;
  maxScore: number;
  percent: number;
}

export interface SkillScoreBreakdown {
  skillId: string;
  skillName: string;
  score: number;
  level: string;
  confidence: string;
  tier: string;
  coverageNote?: string;
}

export interface QuestionReviewItem {
  qid: string;
  type: 'mcq' | 'code';
  sectionId: 'A' | 'B' | 'C';
  titleOrPrompt: string;
  score: number; // 0..1
  correct: boolean;
  userChoiceId?: string;
  correctOptionId?: string;
  explanation?: string;
  codeSnippet?: string;
  submittedCode?: string;
  bestSubmissionId?: string;
  visiblePassed?: number;
  visibleTotal?: number;
  hiddenPassed?: number;
  hiddenTotal?: number;
  aiOpinion?: string;
  aiQuality?: number;
  skills: string[];
}

export interface AssessmentResult {
  attemptId: string;
  assessmentId: string;
  overallPercent: number;
  badgeLabel: 'Emerging' | 'Developing' | 'Competent' | 'Strong' | 'Expert';
  capReason?: string;
  badgeStatus: 'active' | 'provisional' | 'under_review';
  level: string;
  confidence: string;
  tier: string;
  recordId: string;
  issuedAt: string;
  expiresAt: string;
  sectionBreakdown: SectionScoreBreakdown[];
  skillsBreakdown: SkillScoreBreakdown[];
  questionsReview: QuestionReviewItem[];
  summary: {
    headline: string;
    summary: string;
    strengths: string[];
    focusAreas: string[];
    nextSteps: string[];
    badgeBlurb: string;
  };
  integrity: {
    tabSwitches: number;
    largePastes: number;
    flagged: boolean;
    reason?: string;
  };
}
