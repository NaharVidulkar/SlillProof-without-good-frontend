import { describe, it, expect } from 'vitest';
import {
  PROBLEMS,
  getAllPublicProblems,
  getPublicProblemById,
  getProblemByIdWithHidden,
} from '../lib/server/problems.ts';

describe('Problems Catalog (Stage 1)', () => {
  it('contains exactly the 4 required problems', () => {
    const ids = PROBLEMS.map((p) => p.id);
    expect(ids).toEqual([
      'student-registry',
      'access-log-summary',
      'rate-limiter',
      'payload-validator',
    ]);
  });

  it('validates each problem conforms to specification', () => {
    for (const problem of PROBLEMS) {
      expect(problem.id).toBeTruthy();
      expect(problem.title).toBeTruthy();
      expect(['Easy', 'Medium', 'Hard']).toContain(problem.difficulty);
      expect(problem.points).toBeGreaterThan(0);
      expect(problem.skills.length).toBeGreaterThan(0);
      expect(problem.timeEstimateMin).toBeGreaterThan(0);
      expect(problem.description.length).toBeGreaterThan(20);
      expect(problem.constraints.length).toBeGreaterThan(0);
      expect(problem.examples.length).toBeGreaterThanOrEqual(2);

      // Starter code for all 3 languages
      expect(problem.starterCode.python).toContain('def main():');
      expect(problem.starterCode.java).toContain('public class Main');
      expect(problem.starterCode.cpp).toContain('int main()');

      // Tests requirements
      expect(problem.visibleTests.length).toBe(3);
      expect(problem.hiddenTests).toBeDefined();
      expect(problem.hiddenTests!.length).toBeGreaterThanOrEqual(6);

      // Check all outputs are strictly under 900 chars (runner limit is 999 chars)
      for (const vt of problem.visibleTests) {
        expect(vt.input.length).toBeGreaterThan(0);
        expect(vt.expected.length).toBeLessThan(900);
      }

      for (const ht of problem.hiddenTests!) {
        expect(ht.input.length).toBeGreaterThan(0);
        expect(ht.expected.length).toBeLessThan(900);
        expect(['basic', 'edge case', 'performance']).toContain(ht.category);
      }
    }
  });

  it('ensures public endpoints NEVER expose hidden tests', () => {
    const publicList = getAllPublicProblems();
    expect(publicList.length).toBe(4);
    for (const p of publicList) {
      expect((p as unknown as { hiddenTests?: unknown }).hiddenTests).toBeUndefined();
    }

    const singlePublic = getPublicProblemById('student-registry');
    expect(singlePublic).not.toBeNull();
    expect((singlePublic as unknown as { hiddenTests?: unknown }).hiddenTests).toBeUndefined();
  });

  it('retrieves server-only problems with hidden tests intact', () => {
    const full = getProblemByIdWithHidden('student-registry');
    expect(full).not.toBeNull();
    expect(full?.hiddenTests?.length).toBeGreaterThanOrEqual(6);
  });
});
