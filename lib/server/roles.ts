/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoleDefinition, SkillMetric } from '../types.ts';

export const ROLES: RoleDefinition[] = [
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    description: 'Builds robust APIs, data services, algorithmic microservices, and distributed backend logic.',
    skills: [
      { skillId: 'python', importance: 5, requiredLevel: 0.7 },
      { skillId: 'data-structures', importance: 5, requiredLevel: 0.7 },
      { skillId: 'rest-semantics', importance: 5, requiredLevel: 0.65 },
      { skillId: 'validation', importance: 4, requiredLevel: 0.6 },
      { skillId: 'sql', importance: 4, requiredLevel: 0.65 },
      { skillId: 'algorithms', importance: 4, requiredLevel: 0.7 },
      { skillId: 'state-management', importance: 3, requiredLevel: 0.6 },
      { skillId: 'sliding-window', importance: 3, requiredLevel: 0.65 },
      { skillId: 'system-design', importance: 4, requiredLevel: 0.7 },
      { skillId: 'git', importance: 3, requiredLevel: 0.55 },
      { skillId: 'testing', importance: 4, requiredLevel: 0.6 },
      { skillId: 'oop', importance: 3, requiredLevel: 0.6 },
    ],
  },
  {
    id: 'junior-python-developer',
    title: 'Junior Python Developer',
    description: 'Foundational Python development covering core language features, collections, standard library, and basic algorithms.',
    skills: [
      { skillId: 'python', importance: 5, requiredLevel: 0.6 },
      { skillId: 'data-structures', importance: 4, requiredLevel: 0.55 },
      { skillId: 'oop', importance: 3, requiredLevel: 0.5 },
      { skillId: 'testing', importance: 3, requiredLevel: 0.5 },
      { skillId: 'git', importance: 3, requiredLevel: 0.5 },
    ],
  },
];

export function calculateCareerReadiness(
  roleId: string,
  evaluatedSkills: Map<string, SkillMetric>
): {
  roleId: string;
  roleTitle: string;
  scorePercent: number;
  assessableCoverage: string;
  skillsBreakdown: Array<{
    skillId: string;
    skillName: string;
    currentLevel: SkillMetric['level'];
    proficiency: number;
    confidence: SkillMetric['confidence'];
    tier: SkillMetric['tier'];
    met: boolean;
  }>;
} {
  const role = ROLES.find((r) => r.id === roleId) || ROLES[0];
  let totalImportance = 0;
  let weightedScore = 0;
  let assessableCount = 0;

  const skillsBreakdown = role.skills.map((req) => {
    totalImportance += req.importance;
    const metric = evaluatedSkills.get(req.skillId);

    if (metric && metric.evidenceCount > 0) {
      assessableCount++;
      const pRatio = Math.min(1, metric.proficiency / req.requiredLevel);
      const confFactor = 0.5 + 0.5 * metric.confidenceScore;
      weightedScore += req.importance * pRatio * confFactor;

      return {
        skillId: req.skillId,
        skillName: metric.skillName || req.skillId,
        currentLevel: metric.level,
        proficiency: metric.proficiency,
        confidence: metric.confidence,
        tier: metric.tier,
        met: metric.proficiency >= req.requiredLevel && metric.confidence !== 'Low',
      };
    } else {
      // Missing skill contributes 0
      return {
        skillId: req.skillId,
        skillName: req.skillId,
        currentLevel: 'Novice' as const,
        proficiency: 0,
        confidence: 'Low' as const,
        tier: 'Claimed' as const,
        met: false,
      };
    }
  });

  const rawPercent = totalImportance > 0 ? (weightedScore / totalImportance) * 100 : 0;
  const scorePercent = Math.round(rawPercent);

  return {
    roleId: role.id,
    roleTitle: role.title,
    scorePercent,
    assessableCoverage: `${assessableCount} of ${role.skills.length} skills assessed`,
    skillsBreakdown,
  };
}
