/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../lib/server/store.ts';
import {
  saveAnalysisRecord,
  getLatestAnalysisRecord,
} from '../lib/server/user-repo.ts';
import {
  initializeUserSections,
  getUserSections,
  openUserSection,
} from '../lib/server/assessments/sections-manager.ts';
import { normalizeAndFilterSkills, safeParseJson } from '../lib/server/cv-analyser.ts';

describe('CV Analysis Data Trace & End-to-End Verification (Steps 1-3)', () => {
  const TEST_UID = 'verify-user-123';

  beforeEach(async () => {
    // Clear test user data
    await store.delete('user_analysis', `${TEST_UID}_latest`);
    const all = await store.list<any>('user_sections');
    for (const s of all) {
      if (s.userId === TEST_UID) {
        await store.delete('user_sections', `${TEST_UID}_${s.skillSlug}`);
      }
    }
  });

  it('Verification 1: A resume with 3 or more different skills creates 3 or more cards and normalizes properly', async () => {
    // Stage 1 & 2: Raw response shape and normalization
    const rawSkills = [
      { name: 'React', category: 'framework', claimedLevel: 'Advanced', evidence: 'Built modern web UI' },
      { name: 'TypeScript', category: 'programming', claimedLevel: 'Advanced', evidence: 'Strict typing across frontend' },
      { name: 'Docker', category: 'tool', claimedLevel: 'Intermediate', evidence: 'Containerized microservices' },
      { name: 'Communication', category: 'soft-or-other', claimedLevel: 'Intermediate' }, // Should be dropped
    ];

    const normalized = normalizeAndFilterSkills(rawSkills);
    expect(normalized.length).toBe(3);
    expect(normalized.map((s) => s.name)).toEqual(['React', 'TypeScript', 'Docker']);

    // Stage 4: Saving
    const analysisPayload = {
      fieldOrRole: 'Senior Full Stack Engineer',
      summary: 'Experienced developer in React, TypeScript, and Docker.',
      skills: normalized,
      analyzedAt: new Date().toISOString(),
      source: 'gemini_fallback',
    };
    await saveAnalysisRecord(TEST_UID, analysisPayload);

    const { activeSections } = await initializeUserSections(TEST_UID, normalized, true);
    expect(activeSections.length).toBe(3);
    expect(activeSections.map((s) => s.skillName)).toEqual(['React', 'TypeScript', 'Docker']);
  });

  it('Verification 2: After a refresh, the same cards still appear (data persisted in store and retrieval)', async () => {
    const skills = [
      { name: 'React', slug: 'react', category: 'framework' as const, claimedLevel: 'Advanced' as const, evidence: '5 years' },
      { name: 'Node.js', slug: 'node-js', category: 'programming' as const, claimedLevel: 'Advanced' as const, evidence: 'APIs' },
      { name: 'PostgreSQL', slug: 'postgresql', category: 'database' as const, claimedLevel: 'Intermediate' as const, evidence: 'DB schemas' },
    ];
    await saveAnalysisRecord(TEST_UID, {
      fieldOrRole: 'Backend Engineer',
      summary: 'Data and API specialist',
      skills,
      analyzedAt: new Date().toISOString(),
      source: 'cv_analyser',
    });
    await initializeUserSections(TEST_UID, skills, true);

    // Simulate page refresh: read from store fresh
    const loadedAnalysis = await getLatestAnalysisRecord(TEST_UID);
    expect(loadedAnalysis).not.toBeNull();
    expect(loadedAnalysis.skills.length).toBe(3);
    expect(loadedAnalysis.skills.map((s: any) => s.name)).toEqual(['React', 'Node.js', 'PostgreSQL']);

    const loadedSections = await getUserSections(TEST_UID);
    expect(loadedSections.length).toBe(3);
    expect(loadedSections.map((s) => s.skillSlug)).toEqual(['react', 'node-js', 'postgresql']);
  });

  it('Verification 3: A resume containing only one skill creates exactly one card', async () => {
    const singleSkill = [
      { name: 'Go', slug: 'go', category: 'programming' as const, claimedLevel: 'Intermediate' as const, evidence: 'Go microservices' },
    ];
    await saveAnalysisRecord(TEST_UID, {
      fieldOrRole: 'Go Developer',
      summary: 'Go specialist',
      skills: singleSkill,
      analyzedAt: new Date().toISOString(),
      source: 'gemini_fallback',
    });
    const { activeSections } = await initializeUserSections(TEST_UID, singleSkill, true);

    expect(activeSections.length).toBe(1);
    expect(activeSections[0].skillName).toBe('Go');
    expect(activeSections[0].totalQuestions).toBe(25);
  });

  it('Verification 4: Clicking a non-Python card starts a test for that skill, not the Python bank', async () => {
    const skills = [
      { name: 'Rust', slug: 'rust', category: 'programming' as const, claimedLevel: 'Intermediate' as const, evidence: 'Systems' },
    ];
    await initializeUserSections(TEST_UID, skills, true);

    const { section, questions } = await openUserSection(TEST_UID, 'rust');
    expect(section.skillSlug).toBe('rust');
    expect(section.skillName).toBe('Rust');
    expect(questions).toBeDefined();
    expect(questions!.length).toBe(25);
    // Ensure questions are for Rust, not Python
    expect(questions![0].id).toContain('rust');
    expect(questions![0].prompt || (questions![0] as any).title).toMatch(/Rust|rust/i);
  });

  it('Verification 5 & 6: Empty analysis state vs Visitor state', async () => {
    // Brand new user with no analysis record
    const emptyAnalysis = await getLatestAnalysisRecord('brand-new-visitor');
    expect(emptyAnalysis).toBeNull();

    // Verify sections for user with no analysis is empty
    const noSections = await getUserSections('brand-new-visitor');
    expect(noSections.length).toBe(0);
  });

  it('Verification 7: A new analysis replaces the previous cards instead of adding duplicates', async () => {
    // Initial analysis with 3 skills: React, TypeScript, Docker
    const firstSkills = [
      { name: 'React', slug: 'react', category: 'framework' as const, claimedLevel: 'Advanced' as const },
      { name: 'TypeScript', slug: 'typescript', category: 'programming' as const, claimedLevel: 'Advanced' as const },
      { name: 'Docker', slug: 'docker', category: 'tool' as const, claimedLevel: 'Intermediate' as const },
    ];
    await initializeUserSections(TEST_UID, firstSkills, true);
    const sectionsRun1 = await getUserSections(TEST_UID);
    expect(sectionsRun1.length).toBe(3);

    // New analysis with completely different skills: Python, SQL
    const secondSkills = [
      { name: 'Python', slug: 'python', category: 'programming' as const, claimedLevel: 'Advanced' as const },
      { name: 'SQL', slug: 'sql', category: 'database' as const, claimedLevel: 'Advanced' as const },
    ];
    await initializeUserSections(TEST_UID, secondSkills, true);
    const sectionsRun2 = await getUserSections(TEST_UID);

    // Must be replaced, NOT merged (length must be 2, not 5!)
    expect(sectionsRun2.length).toBe(2);
    expect(sectionsRun2.map((s) => s.skillSlug).sort()).toEqual(['python', 'sql']);
    expect(sectionsRun2.some((s) => s.skillSlug === 'react')).toBe(false);
  });

  it('JSON handling: safeParseJson handles markdown fences, whitespace, and validates schemas', () => {
    const fencedJson = '```json\n{\n  "skills": [{"name": "React"}]\n}\n```';
    const parsed = safeParseJson<any>(fencedJson);
    expect(parsed).toEqual({ skills: [{ name: 'React' }] });

    const plainJson = '{"skills": [{"name": "Python"}]}';
    const parsedPlain = safeParseJson<any>(plainJson);
    expect(parsedPlain).toEqual({ skills: [{ name: 'Python' }] });
  });
});
