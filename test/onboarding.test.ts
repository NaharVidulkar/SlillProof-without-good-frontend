import { describe, it, expect } from 'vitest';
import { formatAuthError } from '../src/before-login/lib/auth-errors.tsx';
import {
  parseResumeWithGemini,
  parseTextProfileWithGemini,
  generateSkillAssessmentWithGemini,
} from '../lib/ai/onboarding-gemini.ts';
import {
  normalizeSkill,
  normalizeSkillList,
  BLACKLISTED_VAGUE_TRAITS,
} from '../lib/domain/skills-taxonomy.ts';

describe('Auth Error Formatting', () => {
  it('formats invalid-credential into user-friendly message', () => {
    const res = formatAuthError({ code: 'auth/invalid-credential' });
    expect(res.message).toContain('Incorrect email or password');
    expect(res.code).toBe('auth/invalid-credential');
  });

  it('formats email-already-in-use', () => {
    const res = formatAuthError({ code: 'auth/email-already-in-use' });
    expect(res.message).toContain('already exists');
  });

  it('formats weak-password', () => {
    const res = formatAuthError({ code: 'auth/weak-password' });
    expect(res.message).toContain('at least 8 characters');
  });

  it('formats operation-not-allowed explaining console enable requirement', () => {
    const res = formatAuthError({ code: 'auth/operation-not-allowed' });
    expect(res.message).toBe('Email/Password sign-in is turned off for this project. The site owner needs to enable it in Firebase Console.');
    expect(res.code).toBe('auth/operation-not-allowed');
  });

  it('formats unauthorized-domain showing instruction to add to authorized domains', () => {
    const res = formatAuthError({ code: 'auth/unauthorized-domain' });
    expect(res.message).toContain('Authorized domains');
    expect(res.code).toBe('auth/unauthorized-domain');
  });

  it('formats popup-blocked and popup-closed-by-user', () => {
    const blocked = formatAuthError({ code: 'auth/popup-blocked' });
    expect(blocked.message).toContain('popup was blocked');

    const closed = formatAuthError({ code: 'auth/popup-closed-by-user' });
    expect(closed.message).toContain('popup window was closed');
  });
});

describe('Skills Taxonomy and Normalization', () => {
  it('normalizes skill aliases correctly', () => {
    expect(normalizeSkill('py')?.name).toBe('Python');
    expect(normalizeSkill('python3')?.name).toBe('Python');
    expect(normalizeSkill('js')?.name).toBe('JavaScript');
    expect(normalizeSkill('reactjs')?.name).toBe('React');
    expect(normalizeSkill('postgres')?.name).toBe('PostgreSQL');
    expect(normalizeSkill('docker')?.category).toBe('tool');
  });

  it('filters out blacklisted vague non-skills', () => {
    expect(normalizeSkill('hardworking')).toBeNull();
    expect(normalizeSkill('team player')).toBeNull();
    expect(normalizeSkill('punctual')).toBeNull();
  });

  it('caps active skills at 6 and places remainder in laterSkills', () => {
    const raw = [
      { name: 'Python' },
      { name: 'JavaScript' },
      { name: 'React' },
      { name: 'SQL' },
      { name: 'Docker' },
      { name: 'Git' },
      { name: 'Java' },
      { name: 'Go' },
    ];
    const { activeSkills, laterSkills } = normalizeSkillList(raw, 6);
    expect(activeSkills.length).toBe(6);
    expect(laterSkills.length).toBe(2);
    expect(laterSkills.map((s) => s.name)).toEqual(['Java', 'Go']);
  });
});

describe('Onboarding and Gemini Parsing Resilience', () => {
  it('extracts skills from text profile input or gracefully falls back without crashing', async () => {
    const profile = await parseTextProfileWithGemini("I am a software engineering student. I know Java, Python, and SQL.");
    expect(profile.role).toBeDefined();
    expect(profile.skills.length).toBeGreaterThan(0);
    const skillNames = profile.skills.map((s) => s.name.toLowerCase());
    expect(skillNames.some((n) => n.includes('python') || n.includes('java') || n.includes('sql'))).toBe(true);
  }, 25000);

  it('extracts skills from resume text or falls back cleanly', async () => {
    const profile = await parseResumeWithGemini({
      textContent: `Jane Doe - Senior Full Stack Engineer\nExperience: 5 years\nSkills: React, TypeScript, Node.js, PostgreSQL, Docker`,
    });
    expect(profile.role).toBeDefined();
    expect(profile.skills.length).toBeGreaterThan(0);
  }, 25000);

  it('generates an assessment for a given skill with calibrated questions or fallback questions', async () => {
    const assessment = await generateSkillAssessmentWithGemini('Python', 'Intermediate');
    expect(assessment.skillName).toBe('Python');
    expect(assessment.questions.length).toBeGreaterThanOrEqual(3);
    for (const q of assessment.questions) {
      expect(q.prompt).toBeDefined();
      expect(q.options.length).toBe(4);
      expect(['A', 'B', 'C', 'D']).toContain(q.correctOptionId);
      expect(q.explanation).toBeDefined();
    }
  }, 25000);
});
