/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandidateRanking, PassportProfile, SkillMetric } from '../types.ts';

export const DEMO_CANDIDATES: CandidateRanking[] = [
  {
    id: 'cand-1',
    displayName: 'Alex Rivers',
    targetRole: 'Backend Developer',
    matchScore: 88,
    breakdown: {
      requirementCoverage: 0.9,
      evidenceConfidence: 0.85,
      recency: 0.95,
      projectRelevance: 0.8,
      practicalEvidence: 0.88,
    },
    missingMustHaves: [],
    skills: [
      { name: 'Python', level: 'Advanced', tier: 'Demonstrated', confidence: 'High' },
      { name: 'REST APIs', level: 'Intermediate', tier: 'Demonstrated', confidence: 'High' },
      { name: 'Data Structures', level: 'Advanced', tier: 'Demonstrated', confidence: 'Medium' },
      { name: 'SQL', level: 'Intermediate', tier: 'Assessed', confidence: 'Medium' },
    ],
    isDemoData: true,
  },
  {
    id: 'cand-2',
    displayName: 'Morgan Chen',
    targetRole: 'Backend Developer',
    matchScore: 74,
    breakdown: {
      requirementCoverage: 0.75,
      evidenceConfidence: 0.7,
      recency: 0.8,
      projectRelevance: 0.7,
      practicalEvidence: 0.75,
    },
    missingMustHaves: [],
    skills: [
      { name: 'Python', level: 'Intermediate', tier: 'Demonstrated', confidence: 'Medium' },
      { name: 'Algorithms', level: 'Intermediate', tier: 'Demonstrated', confidence: 'High' },
      { name: 'SQL', level: 'Beginner', tier: 'Assessed', confidence: 'Medium' },
      { name: 'Git', level: 'Beginner', tier: 'Assessed', confidence: 'Medium' },
    ],
    isDemoData: true,
  },
  {
    id: 'cand-3',
    displayName: 'Jordan Patel',
    targetRole: 'Backend Developer',
    matchScore: 56,
    breakdown: {
      requirementCoverage: 0.55,
      evidenceConfidence: 0.45,
      recency: 0.6,
      projectRelevance: 0.6,
      practicalEvidence: 0.5,
    },
    missingMustHaves: ['SQL (Relational persistence)'],
    skills: [
      { name: 'Python', level: 'Beginner', tier: 'Assessed', confidence: 'Low' },
      { name: 'REST APIs', level: 'Beginner', tier: 'Claimed', confidence: 'Low' },
    ],
    isDemoData: true,
  },
];

export function rankCandidates(
  candidates: CandidateRanking[],
  weights: {
    requirementCoverage: number;
    evidenceConfidence: number;
    recency: number;
    projectRelevance: number;
    practicalEvidence: number;
  } = {
    requirementCoverage: 0.5,
    evidenceConfidence: 0.2,
    recency: 0.1,
    projectRelevance: 0.1,
    practicalEvidence: 0.1,
  }
): CandidateRanking[] {
  const totalWeight =
    weights.requirementCoverage +
    weights.evidenceConfidence +
    weights.recency +
    weights.projectRelevance +
    weights.practicalEvidence;

  return [...candidates]
    .map((cand) => {
      const score =
        (cand.breakdown.requirementCoverage * weights.requirementCoverage +
          cand.breakdown.evidenceConfidence * weights.evidenceConfidence +
          cand.breakdown.recency * weights.recency +
          cand.breakdown.projectRelevance * weights.projectRelevance +
          cand.breakdown.practicalEvidence * weights.practicalEvidence) /
        totalWeight;

      return {
        ...cand,
        matchScore: Math.round(score * 100),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function buildPassportProfile(
  userId: string,
  skills: SkillMetric[],
  submissions: Array<{
    id: string;
    problemId: string;
    problemTitle: string;
    language: string;
    correctness: number;
    overallScore?: number;
    date: string;
    integrityFactor: number;
  }> = [],
  assessmentHistory: Array<{ id: string; score: number; date: string }> = []
): PassportProfile {
  return {
    userId,
    fullName: 'Demo Candidate',
    tagline: 'Verified Full-Stack & Backend Systems Engineer',
    slug: `${userId}-passport`,
    isPublic: true,
    recordId: `SP-AUDIT-${userId.toUpperCase()}-2026`,
    issuedAt: new Date().toISOString(),
    verifiedSkills: skills,
    submissionsHistory: submissions as any,
    assessmentHistory,
  };
}
