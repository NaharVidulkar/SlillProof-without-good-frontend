/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Confidence,
  EvidenceItem,
  EvidenceType,
  SkillLevel,
  SkillMetric,
  Tier,
} from '../types.ts';

const TYPE_WEIGHTS: Record<EvidenceType, number> = {
  claim: 0,
  certificate: 0.15,
  knowledge: 0.3,
  coding: 0.6,
  project: 0.7,
  practical: 0.8,
};

export interface CalculateSkillParams {
  skillId: string;
  skillName: string;
  evidence: EvidenceItem[];
  now?: Date;
}

export function computeItemWeight(item: EvidenceItem, now: Date = new Date()): number {
  const wType = TYPE_WEIGHTS[item.type] ?? 0;
  if (wType === 0) return 0;

  const createdAt = new Date(item.createdAt);
  const ageDays = Math.max(0, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const recency = Math.pow(0.5, ageDays / 180);
  const integrity = item.integrity || 0.85;
  const difficulty = item.difficulty || 1;

  return wType * difficulty * recency * integrity;
}

export function computeWeightedStd(itemsWithWeights: Array<{ score: number; weight: number }>, meanScore: number): number {
  const totalWeight = itemsWithWeights.reduce((sum, i) => sum + i.weight, 0);
  if (totalWeight <= 0) return 0;

  const variance = itemsWithWeights.reduce((sum, i) => {
    return sum + i.weight * Math.pow(i.score - meanScore, 2);
  }, 0) / totalWeight;

  return Math.sqrt(variance);
}

export function evaluateSkill(params: CalculateSkillParams): SkillMetric {
  const { skillId, skillName, evidence, now = new Date() } = params;

  if (!evidence || evidence.length === 0) {
    return {
      skillId,
      skillName,
      proficiency: 0.3,
      level: 'Novice',
      confidence: 'Low',
      confidenceScore: 0,
      tier: 'Claimed',
      evidenceCount: 0,
      evidence: [],
    };
  }

  const items = evidence.map((e) => ({
    item: e,
    weight: computeItemWeight(e, now),
  }));

  const sumW = items.reduce((sum, i) => sum + i.weight, 0);
  const sumWs = items.reduce((sum, i) => sum + i.weight * i.item.score, 0);

  // Bayesian smoothing: P = (sum(W * s) + k * p0) / (sum(W) + k), p0 = 0.3, k = 0.5
  const p0 = 0.3;
  const k = 0.5;
  const proficiency = (sumWs + k * p0) / (sumW + k);

  // Determine raw level based on proficiency
  let level: SkillLevel = 'Novice';
  if (proficiency >= 0.8) {
    level = 'Advanced';
  } else if (proficiency >= 0.6) {
    level = 'Intermediate';
  } else if (proficiency >= 0.35) {
    level = 'Beginner';
  } else {
    level = 'Novice';
  }

  // Gating rules:
  // 1. No coding / practical / project evidence caps level at Beginner
  const hasHandsOn = evidence.some(
    (e) => e.type === 'coding' || e.type === 'project' || e.type === 'practical'
  );

  if (!hasHandsOn) {
    if (level === 'Intermediate' || level === 'Advanced') {
      level = 'Beginner';
    }
  }

  // 2. Advanced requires at least one coding/practical/project item with score >= 0.75
  if (level === 'Advanced') {
    const hasHighHandsOn = evidence.some(
      (e) =>
        (e.type === 'coding' || e.type === 'project' || e.type === 'practical') &&
        e.score >= 0.75
    );
    if (!hasHighHandsOn) {
      level = 'Intermediate';
    }
  }

  // Confidence C = coverage * (0.5 + 0.25 * diversity + 0.25 * consistency)
  const coverage = 1 - Math.exp(-sumW / 3);

  const distinctTypes = new Set(evidence.map((e) => e.type)).size;
  const diversity = Math.min(1, distinctTypes / 3);

  const meanScore = sumW > 0 ? sumWs / sumW : proficiency;
  const weightedStd = computeWeightedStd(items.map((i) => ({ score: i.item.score, weight: i.weight })), meanScore);
  const consistency = Math.max(0, 1 - weightedStd);

  const confidenceScore = Math.max(0, Math.min(1, coverage * (0.5 + 0.25 * diversity + 0.25 * consistency)));

  let confidence: Confidence = 'Low';
  if (confidenceScore >= 0.7) {
    confidence = 'High';
  } else if (confidenceScore >= 0.35) {
    confidence = 'Medium';
  } else {
    confidence = 'Low';
  }

  // Tier:
  // Claimed: no graded evidence
  // Assessed: only knowledge / certificate evidence
  // Demonstrated: at least one coding / practical / project item
  let tier: Tier = 'Claimed';
  const gradedItems = evidence.filter((e) => e.type !== 'claim');
  if (gradedItems.length > 0) {
    tier = hasHandsOn ? 'Demonstrated' : 'Assessed';
  }

  const sortedEvidence = [...evidence].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    skillId,
    skillName,
    proficiency: Math.round(proficiency * 100) / 100,
    level,
    confidence,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    tier,
    evidenceCount: evidence.length,
    recentEvidenceDate: sortedEvidence[0]?.createdAt,
    evidence: sortedEvidence,
  };
}
