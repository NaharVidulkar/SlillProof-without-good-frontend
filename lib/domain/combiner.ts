/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIReview, DeterministicResult } from '../types.ts';

export interface CombineInput {
  deterministic: DeterministicResult;
  aiReview: AIReview;
  code: string;
  hiddenExpectedOutputs?: string[];
}

export interface CombineOutput {
  correctness: number;
  boundedAiScores: {
    codeQuality: number;
    problemSolving: number;
    testing: number;
    security: number;
  };
  overallScore: number;
  needsReview: boolean;
  integrityFactor: number;
  disagreement?: {
    testVerdict: string;
    aiVerdict: string;
    reasoning: string;
  };
}

export function checkLiteralHardcoding(
  code: string,
  hiddenExpectedOutputs?: string[]
): boolean {
  if (!hiddenExpectedOutputs || hiddenExpectedOutputs.length < 3) {
    return false;
  }

  let matchCount = 0;
  for (const expected of hiddenExpectedOutputs) {
    const trimmed = expected.trim();
    const escaped = trimmed.replace(/\n/g, '\\n');
    // Only check non-trivial outputs (length > 4)
    if (trimmed.length >= 4 && (code.includes(trimmed) || code.includes(escaped))) {
      matchCount++;
    }
  }

  return matchCount >= 3;
}

export function combineSubmissionScores(input: CombineInput): CombineOutput {
  const { deterministic, aiReview, code, hiddenExpectedOutputs } = input;
  const correctness = deterministic.correctness;

  let { codeQuality, problemSolving, testing, security } = aiReview;

  // Rule: If correctness < 50, no AI dimension may exceed correctness + 20
  if (correctness < 50) {
    const maxAllowed = Math.min(100, correctness + 20);
    codeQuality = Math.min(codeQuality, maxAllowed);
    problemSolving = Math.min(problemSolving, maxAllowed);
    testing = Math.min(testing, maxAllowed);
    security = Math.min(security, maxAllowed);
  }

  const aiMean = (codeQuality + problemSolving + testing + security) / 4;
  let overall = Math.round(0.6 * correctness + 0.4 * aiMean);

  // Rule: Compile failure, timeout, or 0 tests passed gives overall <= 20
  const totalPassed = deterministic.visiblePassed + deterministic.hiddenPassed;
  if (!deterministic.compiled || totalPassed === 0) {
    overall = Math.min(overall, 20);
  }

  // Integrity checks:
  const literalMatch = checkLiteralHardcoding(code, hiddenExpectedOutputs);
  const geminiHardcoding = Boolean(aiReview.integrity?.hardcodingSuspected);

  const needsReview = literalMatch || geminiHardcoding;
  const integrityFactor = needsReview ? 0.5 : 0.85;

  // Disagreement detection
  let disagreement: CombineOutput['disagreement'] = undefined;
  if (aiReview.opinion) {
    const isPassing = correctness >= 70;
    const aiThinksPass = aiReview.opinion.verdict === 'likely_correct';
    const aiThinksFail = aiReview.opinion.verdict === 'likely_incorrect';

    if ((isPassing && aiThinksFail) || (!isPassing && aiThinksPass)) {
      disagreement = {
        testVerdict: isPassing ? 'Passed' : 'Failed',
        aiVerdict: aiReview.opinion.verdict,
        reasoning: aiReview.opinion.reasoning,
      };
    }
  }

  return {
    correctness,
    boundedAiScores: {
      codeQuality,
      problemSolving,
      testing,
      security,
    },
    overallScore: Math.max(0, Math.min(100, overall)),
    needsReview,
    integrityFactor,
    disagreement,
  };
}
