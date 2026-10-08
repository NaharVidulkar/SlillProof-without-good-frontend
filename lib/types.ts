/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// SkillProof Domain Types

export type SkillLevel = 'Novice' | 'Beginner' | 'Intermediate' | 'Advanced';

export type Confidence = 'Low' | 'Medium' | 'High';

export type Tier = 'Claimed' | 'Assessed' | 'Demonstrated';

export type EvidenceType =
  | 'claim'
  | 'certificate'
  | 'knowledge'
  | 'coding'
  | 'project'
  | 'practical';

export interface EvidenceItem {
  id: string;
  userId: string;
  skillId: string;
  type: EvidenceType;
  score: number; // 0.0 to 1.0 (e.g., correctness / 100)
  difficulty: 1 | 2 | 3;
  sourceRef: string; // e.g. problemId, submissionId, or assessmentId
  integrity: number; // 1.0 (proctored), 0.85 (unproctored default), 0.5 (flagged)
  createdAt: string;
  details?: {
    problemTitle?: string;
    correctnessPercent?: number;
    verdictSummary?: string;
  };
}

export type SupportedLanguage = 'python' | 'java' | 'cpp';

export interface TestCase {
  input: string;
  expected: string;
}

export interface HiddenTestCase extends TestCase {
  category: 'basic' | 'edge case' | 'performance';
}

export interface ProblemExample {
  input: string;
  output: string;
  note?: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  skills: string[];
  timeEstimateMin: number;
  description: string;
  constraints: string[];
  examples: ProblemExample[];
  starterCode: {
    python: string;
    java: string;
    cpp: string;
  };
  visibleTests: TestCase[];
  hiddenTests?: HiddenTestCase[]; // Server-only, omitted from client-facing API
  timeLimitMs: number;
  memoryLimitKb: number;
}

// Client-safe Problem (hiddenTests omitted)
export type PublicProblem = Omit<Problem, 'hiddenTests'>;

export type TestVerdict =
  | 'Passed'
  | 'Wrong Answer'
  | 'Time Limit'
  | 'Memory Limit'
  | 'Runtime Error'
  | 'Compile Error'
  | 'Skipped';

export interface VisibleTestResult {
  index: number;
  input: string;
  expected: string;
  actual: string;
  verdict: TestVerdict;
  timeSec?: number;
  memoryKb?: number;
}

export interface HiddenTestResult {
  index: number;
  verdict: TestVerdict;
  category: 'basic' | 'edge case' | 'performance';
}

export interface DeterministicResult {
  compiled: boolean;
  visiblePassed: number;
  visibleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
  maxTimeMs: number;
  maxMemoryKb: number;
  correctness: number; // round(70 * hiddenPassRate + 30 * visiblePassRate)
  compileError?: string;
}

export interface AIReviewCitation {
  text: string;
  lines: number[];
}

export interface AIReview {
  codeQuality: number; // 0 - 100
  problemSolving: number; // 0 - 100
  testing: number; // 0 - 100
  security: number; // 0 - 100
  strengths: AIReviewCitation[];
  weaknesses: AIReviewCitation[];
  recommendations: string[];
  detectedSkills: string[];
  opinion?: {
    verdict: 'likely_correct' | 'likely_incorrect' | 'uncertain';
    confidence: number;
    reasoning: string;
  };
  integrity?: {
    hardcodingSuspected: boolean;
    evidenceLines?: string;
    note?: string;
  };
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  language: SupportedLanguage;
  code: string;
  status: 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  deterministic?: DeterministicResult;
  visibleTestResults?: VisibleTestResult[];
  hiddenTestResults?: HiddenTestResult[];
  aiReview?: AIReview;
  overallScore?: number; // 0 - 100 combined score
  needsReview?: boolean;
  error?: string;
}

// Response from /api/run
export interface RunTestItemResult {
  index: number;
  input: string;
  expected?: string;
  output: string;
  error?: string;
  exitCode: number;
  timeSec: number;
  memoryKb: number;
  verdict: TestVerdict;
}

export interface RunResponse {
  results: RunTestItemResult[];
  custom?: boolean;
}

// Single-store interface for pluggable storage (JSON file now, Firestore in Stage 9)
export interface Store {
  get<T>(collection: string, id: string): Promise<T | null>;
  put<T>(collection: string, id: string, data: T): Promise<T>;
  list<T>(collection: string): Promise<T[]>;
  delete(collection: string, id: string): Promise<boolean>;
}

// Health check response for /api/health/env
export interface EnvHealthResponse {
  ONLINECOMPILER_API_KEY_CONFIGURED: boolean;
  GEMINI_API_KEY_CONFIGURED: boolean;
  APP_URL_CONFIGURED: boolean;
  _warning: string;
}

// Skill evaluation metrics
export interface SkillMetric {
  skillId: string;
  skillName: string;
  proficiency: number; // 0 to 1
  level: SkillLevel;
  confidence: Confidence;
  confidenceScore: number; // 0 to 1
  tier: Tier;
  evidenceCount: number;
  recentEvidenceDate?: string;
  evidence: EvidenceItem[];
}

export interface RoleSkillRequirement {
  skillId: string;
  importance: number; // 1 to 5
  requiredLevel: number; // 0.35, 0.6, 0.8
}

export interface RoleDefinition {
  id: string;
  title: string;
  description: string;
  skills: RoleSkillRequirement[];
}

export interface DashboardData {
  userId: string;
  careerReadiness: {
    roleId: string;
    roleTitle: string;
    scorePercent: number;
    assessableCoverage: string;
    skillsBreakdown: Array<{
      skillId: string;
      skillName: string;
      currentLevel: SkillLevel;
      proficiency: number;
      confidence: Confidence;
      tier: Tier;
      met: boolean;
    }>;
  };
  skills: SkillMetric[];
  recentActivity: Array<{
    id: string;
    type: 'submission' | 'assessment';
    title: string;
    score: number;
    date: string;
    status: string;
  }>;
}

// Diagnostic Quiz types (Stage 6)
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestionPublic {
  id: string;
  topic: string;
  prompt: string;
  codeSnippet?: string;
  options: QuizOption[];
  skills: string[];
}

export interface QuizQuestionServer extends QuizQuestionPublic {
  correctOptionId: string;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  startedAt: string;
  deadlineAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'expired';
  questionIds: string[];
  answers: Record<string, string>; // questionId -> selectedOptionId
  score?: number; // 0 - 100
  passedCount?: number;
  totalCount?: number;
  gradedQuestions?: Array<{
    questionId: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

// Job Match & Gap Plan types (Stage 7)
export interface JobRequirement {
  name: string;
  matchedSkillId?: string;
  category: string;
  importance: number; // 1 to 5
  mustHave: boolean;
  expectedLevel: SkillLevel;
  status: 'Strong' | 'Needs improvement' | 'Unverified' | 'Missing';
  candidateProficiency?: number;
  candidateConfidence?: Confidence;
}

export interface WeeklyGapPlanItem {
  week: number;
  focusSkill: string;
  challengeIds: string[];
  recommendedAction: string;
  targetMilestone: string;
}

export interface JobMatchResult {
  jobTitle: string;
  company?: string;
  overallMatchPercent: number;
  requirements: JobRequirement[];
  explanation: string;
  gapPlan: WeeklyGapPlanItem[];
}

// Passport & Employer types (Stage 8)
export interface PassportProfile {
  userId: string;
  fullName: string;
  tagline: string;
  slug: string;
  isPublic: boolean;
  recordId: string;
  issuedAt: string;
  verifiedSkills: SkillMetric[];
  submissionsHistory: Array<{
    id: string;
    problemId: string;
    problemTitle: string;
    language: SupportedLanguage;
    correctness: number;
    overallScore?: number;
    date: string;
    integrityFactor: number;
  }>;
  assessmentHistory: Array<{
    id: string;
    score: number;
    date: string;
  }>;
}

export interface CandidateRanking {
  id: string;
  displayName: string;
  targetRole: string;
  matchScore: number;
  breakdown: {
    requirementCoverage: number;
    evidenceConfidence: number;
    recency: number;
    projectRelevance: number;
    practicalEvidence: number;
  };
  missingMustHaves: string[];
  skills: Array<{ name: string; level: SkillLevel; tier: Tier; confidence: Confidence }>;
  isDemoData: boolean;
}
