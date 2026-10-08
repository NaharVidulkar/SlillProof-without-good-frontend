/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Assessment,
  AssessmentAttempt,
  AssessmentResult,
  CodeQuestion,
  McqQuestion,
  PublicAssessmentDetail,
  PublicAssessmentQuestion,
  PublicAssessmentSummary,
  PublicSection,
  QuestionReviewItem,
  SectionScoreBreakdown,
  SkillScoreBreakdown,
} from './types.ts';
import { PYTHON_FUNDAMENTALS_ASSESSMENT } from './python-fundamentals.ts';
import { Submission } from '../../types.ts';

// Registry of all supported assessments
export const ASSESSMENTS: Assessment[] = [PYTHON_FUNDAMENTALS_ASSESSMENT];

export function getAllAssessments(): Assessment[] {
  return ASSESSMENTS;
}

export function getAssessmentById(id: string): Assessment | undefined {
  return ASSESSMENTS.find((a) => a.id === id);
}

export function getPublicAssessmentSummaries(
  lastResultsMap?: Map<string, { overallPercent: number; badgeLabel: string; completedAt: string; recordId: string }>
): PublicAssessmentSummary[] {
  return ASSESSMENTS.map((assessment) => {
    let totalQuestions = 0;
    let totalMcq = 0;
    let totalCode = 0;

    const sections = assessment.sections.map((sec) => {
      let mcq = 0;
      let code = 0;
      sec.questions.forEach((q) => {
        if (q.type === 'mcq') mcq++;
        else code++;
      });
      totalQuestions += sec.questions.length;
      totalMcq += mcq;
      totalCode += code;

      return {
        id: sec.id,
        title: sec.title,
        difficultyLabel: sec.difficultyLabel,
        questionCount: sec.questions.length,
        description: sec.id === 'A' ? '5 MCQs' : sec.id === 'B' ? '6 MCQs + 4 coding' : '10 real-life coding problems',
      };
    });

    const lastResult = lastResultsMap?.get(assessment.id);

    return {
      id: assessment.id,
      title: assessment.title,
      domain: assessment.domain,
      description: assessment.description,
      timeLimitMinutes: assessment.timeLimitMinutes,
      totalQuestions,
      totalMcq,
      totalCode,
      sections,
      lastResult,
    };
  });
}

export function getPublicAssessmentDetail(id: string): PublicAssessmentDetail | null {
  const assessment = getAssessmentById(id);
  if (!assessment) return null;

  let totalQuestions = 0;
  let totalMcq = 0;
  let totalCode = 0;

  const sectionsDetailed: PublicSection[] = assessment.sections.map((sec) => {
    let mcqCount = 0;
    let codeCount = 0;

    const publicQuestions: PublicAssessmentQuestion[] = sec.questions.map((q) => {
      if (q.type === 'mcq') {
        mcqCount++;
        // Exclude correctOptionId and explanation
        const publicMcq: PublicAssessmentQuestion = {
          id: q.id,
          type: 'mcq',
          prompt: q.prompt,
          codeSnippet: q.codeSnippet,
          options: q.options,
          skills: q.skills,
        };
        return publicMcq;
      } else {
        codeCount++;
        // Exclude hiddenTests
        const publicCode: PublicAssessmentQuestion = {
          id: q.id,
          type: 'code',
          title: q.title,
          statement: q.statement,
          inputFormat: q.inputFormat,
          outputFormat: q.outputFormat,
          rules: q.rules,
          constraints: q.constraints,
          examples: q.examples,
          starterCode: q.starterCode,
          visibleTests: q.visibleTests,
          timeLimitMs: q.timeLimitMs,
          memoryLimitKb: q.memoryLimitKb,
          skills: q.skills,
        };
        return publicCode;
      }
    });

    totalQuestions += sec.questions.length;
    totalMcq += mcqCount;
    totalCode += codeCount;

    return {
      id: sec.id,
      title: sec.title,
      difficulty: sec.difficulty,
      difficultyLabel: sec.difficultyLabel,
      weight: sec.weight,
      questionCount: sec.questions.length,
      mcqCount,
      codeCount,
      questions: publicQuestions,
    };
  });

  return {
    id: assessment.id,
    title: assessment.title,
    domain: assessment.domain,
    description: assessment.description,
    timeLimitMinutes: assessment.timeLimitMinutes,
    totalQuestions,
    totalMcq,
    totalCode,
    sections: sectionsDetailed.map((s) => ({
      id: s.id,
      title: s.title,
      difficultyLabel: s.difficultyLabel,
      questionCount: s.questionCount,
      description: s.id === 'A' ? '5 MCQs' : s.id === 'B' ? '6 MCQs + 4 coding' : '10 real-life coding problems',
    })),
    sectionsDetailed,
  };
}

/**
 * Deterministic scoring engine for an assessment attempt (Section 13A of docs/ASSESSMENT.md)
 */
export function calculateAssessmentResult(params: {
  attempt: AssessmentAttempt;
  assessment: Assessment;
  submissions: Submission[];
}): AssessmentResult {
  const { attempt, assessment, submissions } = params;

  let totalWeightedScore = 0;
  let totalWeights = 0;

  const sectionBreakdown: SectionScoreBreakdown[] = [];
  const questionsReview: QuestionReviewItem[] = [];

  // Track coding problem results for gating
  const hardProblemsResults: number[] = [];
  let highestCodingCorrectness = 0;

  // Track per-skill scores
  const skillScoresMap: Record<string, { totalScore: number; count: number; types: Set<string> }> = {};

  for (const section of assessment.sections) {
    let sectionEarnedScore = 0;
    let sectionMaxScore = 0;

    for (const question of section.questions) {
      const qWeight = section.weight;
      totalWeights += qWeight;
      sectionMaxScore += 1;

      if (question.type === 'mcq') {
        const mcq = question as McqQuestion;
        const answer = attempt.answers[mcq.id];
        const userChoiceId = answer?.choiceId;
        const isCorrect = Boolean(userChoiceId && userChoiceId === mcq.correctOptionId);
        const qScore = isCorrect ? 1.0 : 0.0;

        sectionEarnedScore += qScore;
        totalWeightedScore += qScore * qWeight;

        // Skill map
        for (const skill of mcq.skills) {
          if (!skillScoresMap[skill]) {
            skillScoresMap[skill] = { totalScore: 0, count: 0, types: new Set() };
          }
          skillScoresMap[skill].totalScore += qScore;
          skillScoresMap[skill].count += 1;
          skillScoresMap[skill].types.add('knowledge');
        }

        questionsReview.push({
          qid: mcq.id,
          type: 'mcq',
          sectionId: section.id,
          titleOrPrompt: mcq.prompt,
          score: qScore,
          correct: isCorrect,
          userChoiceId,
          correctOptionId: mcq.correctOptionId,
          explanation: mcq.explanation,
          codeSnippet: mcq.codeSnippet,
          skills: mcq.skills,
        });
      } else {
        const codeQ = question as CodeQuestion;
        // Find best submission for this question in this attempt
        const qSubmissions = submissions.filter(
          (s) => s.problemId === codeQ.id && s.status === 'completed'
        );

        let bestCorrectness = 0;
        let bestSub: Submission | undefined;

        for (const sub of qSubmissions) {
          const c = sub.deterministic?.correctness ?? 0;
          if (c >= bestCorrectness) {
            bestCorrectness = c;
            bestSub = sub;
          }
        }

        if (bestCorrectness > highestCodingCorrectness) {
          highestCodingCorrectness = bestCorrectness;
        }

        if (section.id === 'C') {
          hardProblemsResults.push(bestCorrectness);
        }

        const qScore = bestCorrectness / 100;
        sectionEarnedScore += qScore;
        totalWeightedScore += qScore * qWeight;

        // Skill map
        for (const skill of codeQ.skills) {
          if (!skillScoresMap[skill]) {
            skillScoresMap[skill] = { totalScore: 0, count: 0, types: new Set() };
          }
          skillScoresMap[skill].totalScore += qScore;
          skillScoresMap[skill].count += 1;
          skillScoresMap[skill].types.add('coding');
        }

        questionsReview.push({
          qid: codeQ.id,
          type: 'code',
          sectionId: section.id,
          titleOrPrompt: codeQ.title,
          score: qScore,
          correct: bestCorrectness >= 70,
          submittedCode: bestSub?.code || attempt.answers[codeQ.id]?.code,
          bestSubmissionId: bestSub?.id,
          visiblePassed: bestSub?.deterministic?.visiblePassed ?? 0,
          visibleTotal: bestSub?.deterministic?.visibleTotal ?? codeQ.visibleTests.length,
          hiddenPassed: bestSub?.deterministic?.hiddenPassed ?? 0,
          hiddenTotal: bestSub?.deterministic?.hiddenTotal ?? codeQ.hiddenTests.length,
          aiOpinion: bestSub?.aiReview?.opinion?.verdict,
          aiQuality: bestSub?.overallScore,
          skills: codeQ.skills,
        });
      }
    }

    const percent = sectionMaxScore > 0 ? Math.round((sectionEarnedScore / sectionMaxScore) * 100) : 0;
    sectionBreakdown.push({
      id: section.id,
      title: section.title,
      difficultyLabel: section.difficultyLabel,
      weight: section.weight,
      questionCount: section.questions.length,
      earnedScore: Math.round(sectionEarnedScore * 10) / 10,
      maxScore: sectionMaxScore,
      percent,
    });
  }

  // Calculate overall percent
  const overallPercent = totalWeights > 0 ? Math.round((totalWeightedScore / totalWeights) * 100) : 0;

  // Determine raw label
  type Label = 'Emerging' | 'Developing' | 'Competent' | 'Strong' | 'Expert';
  let label: Label = 'Emerging';
  if (overallPercent >= 90) label = 'Expert';
  else if (overallPercent >= 75) label = 'Strong';
  else if (overallPercent >= 60) label = 'Competent';
  else if (overallPercent >= 40) label = 'Developing';
  else label = 'Emerging';

  const labelOrder: Record<Label, number> = {
    Emerging: 1,
    Developing: 2,
    Competent: 3,
    Strong: 4,
    Expert: 5,
  };

  const capReasons: string[] = [];
  let cappedLabel = label;

  // Gate 1: No coding question with correctness >= 50 => max Developing
  if (highestCodingCorrectness < 50) {
    if (labelOrder[cappedLabel] > labelOrder['Developing']) {
      cappedLabel = 'Developing';
      capReasons.push('No coding problem passed at 50% or more (maximum Developing)');
    }
  }

  // Gate 2: Strong needs at least 4 of 10 hard problems with correctness >= 70
  const hard70Count = hardProblemsResults.filter((c) => c >= 70).length;
  if (labelOrder[cappedLabel] >= labelOrder['Strong'] && hard70Count < 4) {
    cappedLabel = 'Competent';
    capReasons.push(`Requires at least 4 hard problems solved at 70%+ (current: ${hard70Count}/10 solved at 70%+)`);
  }

  // Gate 3: Expert needs at least 8 of 10 hard problems with correctness >= 90
  const hard90Count = hardProblemsResults.filter((c) => c >= 90).length;
  if (labelOrder[cappedLabel] >= labelOrder['Expert'] && hard90Count < 8) {
    cappedLabel = 'Strong';
    capReasons.push(`Requires at least 8 hard problems solved at 90%+ (current: ${hard90Count}/10 solved at 90%+)`);
  }

  // Gate 4: Integrity flagged => max Competent, badge under_review
  let badgeStatus: 'active' | 'provisional' | 'under_review' = 'active';
  if (attempt.integrity.flagged) {
    if (labelOrder[cappedLabel] > labelOrder['Competent']) {
      cappedLabel = 'Competent';
      capReasons.push('Integrity verification trigger active (capped at Competent)');
    }
    badgeStatus = 'under_review';
  }

  // Gate 5: Confidence low => provisional
  const overallConfidence = highestCodingCorrectness >= 70 && hard70Count >= 2 ? 'High' : highestCodingCorrectness >= 40 ? 'Medium' : 'Low';
  if (overallConfidence === 'Low' && badgeStatus === 'active') {
    badgeStatus = 'provisional';
  }

  // Overall engine level & tier
  const engineLevel = cappedLabel === 'Expert' ? 'Advanced' : cappedLabel === 'Strong' ? 'Intermediate' : cappedLabel === 'Competent' ? 'Intermediate' : cappedLabel === 'Developing' ? 'Beginner' : 'Novice';
  const engineTier = highestCodingCorrectness > 0 ? 'Demonstrated' : 'Assessed';

  // Per-skill breakdown
  const skillsBreakdown: SkillScoreBreakdown[] = Object.entries(skillScoresMap).map(([sId, stats]) => {
    const avgScore = stats.count > 0 ? Math.round((stats.totalScore / stats.count) * 100) : 0;
    const hasCoding = stats.types.has('coding');
    const skillLevel = avgScore >= 80 && hasCoding ? 'Advanced' : avgScore >= 60 ? (hasCoding ? 'Intermediate' : 'Beginner') : avgScore >= 35 ? 'Beginner' : 'Novice';
    const conf = stats.count >= 3 && hasCoding ? 'High' : stats.count >= 2 ? 'Medium' : 'Low';
    const tier = hasCoding ? 'Demonstrated' : 'Assessed';

    const skillNameMap: Record<string, string> = {
      'py.core': 'Python Core & Types',
      'py.strings': 'Strings & Text Processing',
      'py.collections': 'Data Structures & Collections',
      'py.functions': 'Functions & Scope',
      'py.oop': 'Object-Oriented Design',
      'py.errors': 'Exception Handling & Safety',
      'py.iterators': 'Iterators & Generators',
      'py.stdlib': 'Standard Library & Modules',
      'py.algorithms': 'Algorithms & Graph Scheduling',
      'py.tooling': 'Tooling, Typing & Virtual Environments',
    };

    return {
      skillId: sId,
      skillName: skillNameMap[sId] || sId,
      score: avgScore,
      level: skillLevel,
      confidence: conf,
      tier,
      coverageNote: !hasCoding ? 'Assessed by knowledge questions only (capped at Beginner)' : undefined,
    };
  });

  const recordId = `sp_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

  // Summary blurb
  const summary = {
    headline: `${cappedLabel} proficiency in Python verified across 25 assessments.`,
    summary: `Demonstrated solid problem solving with ${overallPercent}% overall verification score. Section A Easy: ${sectionBreakdown[0]?.percent}%, Section B Medium: ${sectionBreakdown[1]?.percent}%, Section C Hard: ${sectionBreakdown[2]?.percent}%.`,
    strengths: [
      sectionBreakdown[0]?.percent >= 80 ? 'Mastery of Python language fundamentals and control structures' : 'Consistent execution on core concepts',
      hard70Count >= 2 ? `Solved ${hard70Count} real-life algorithmic coding problems under test constraints` : 'Clear understanding of data structures and exceptions',
      'Clean handling of boundary conditions in stdin/stdout execution',
    ],
    focusAreas: [
      hard90Count < 5 ? 'High-scale algorithmic optimization under tight runtime limits' : 'Refining concurrency and custom iterator pipelines',
      'Edge-case handling for malformed input and encoding boundaries',
    ],
    nextSteps: [
      'Take on distributed systems and database concurrency assessments',
      'Contribute verified solutions to open-source code repositories',
    ],
    badgeBlurb: `${cappedLabel} Python certification verified through deterministic test execution.`,
  };

  return {
    attemptId: attempt.id,
    assessmentId: assessment.id,
    overallPercent,
    badgeLabel: cappedLabel,
    capReason: capReasons.length > 0 ? capReasons.join('; ') : undefined,
    badgeStatus,
    level: engineLevel,
    confidence: overallConfidence,
    tier: engineTier,
    recordId,
    issuedAt: now.toISOString(),
    expiresAt,
    sectionBreakdown,
    skillsBreakdown,
    questionsReview,
    summary,
    integrity: {
      tabSwitches: attempt.integrity.tabSwitches,
      largePastes: attempt.integrity.largePastes,
      flagged: attempt.integrity.flagged,
      reason: attempt.integrity.flagged
        ? `Integrity trigger: ${attempt.integrity.tabSwitches} tab switches, ${attempt.integrity.largePastes} large pastes`
        : undefined,
    },
  };
}
