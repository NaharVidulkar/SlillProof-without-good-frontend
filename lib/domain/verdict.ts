/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestVerdict } from '../types.ts';

export interface VerdictInput {
  exitCode: number;
  output: string;
  expected?: string;
  error?: string;
  signal?: number | string;
  timeSec: number;
  memoryKb: number;
  timeLimitMs: number;
  memoryLimitKb: number;
}

export function normalizeLines(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

export function determineVerdict(params: VerdictInput): TestVerdict {
  const {
    exitCode,
    output,
    expected,
    error,
    signal,
    timeSec,
    memoryKb,
    timeLimitMs,
    memoryLimitKb,
  } = params;

  // Check compile / syntax error from error field
  if (
    error &&
    (error.toLowerCase().includes('syntaxerror') ||
      error.toLowerCase().includes('compile error') ||
      error.toLowerCase().includes('compilation error') ||
      error.toLowerCase().includes('error: class') ||
      error.toLowerCase().includes('fatal error:'))
  ) {
    return 'Compile Error';
  }

  // Check Time Limit
  const timeMs = timeSec * 1000;
  if (
    timeMs > timeLimitMs ||
    exitCode === 124 ||
    signal === 9 ||
    signal === 'SIGKILL' ||
    (error && error.toLowerCase().includes('timeout'))
  ) {
    return 'Time Limit';
  }

  // Check Memory Limit
  if (
    memoryKb > memoryLimitKb ||
    exitCode === 137 ||
    (error && error.toLowerCase().includes('out of memory'))
  ) {
    return 'Memory Limit';
  }

  // Check Runtime Error
  if (exitCode !== 0) {
    return 'Runtime Error';
  }

  // Exit code 0: compare output against expected
  if (expected === undefined) {
    return 'Passed';
  }

  const normalizedOutput = normalizeLines(output);
  const normalizedExpected = normalizeLines(expected);

  if (normalizedOutput === normalizedExpected) {
    return 'Passed';
  }

  return 'Wrong Answer';
}
