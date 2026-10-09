import { describe, it, expect } from 'vitest';
import { formatAuthError } from '../src/before-login/lib/auth-errors.ts';
import {
  parseResumeWithGemini,
  parseTextProfileWithGemini,
  generateSkillAssessmentWithGemini,
} from '../lib/ai/onboarding-gemini.ts';

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
    expect(res.message).toContain('Firebase Console');
    expect(res.message).toContain('Sign-in method');
  });
});

describe('Onboarding and Gemini Parsing', () => {
  it('extracts skills from text profile input', async () => {
    const profile = await parseTextProfileWithGemini("I'm a computer science student. I know Java, Python, and SQL.");
    expect(profile.role).toBeDefined();
    expect(profile.skills.length).toBeGreaterThan(0);
    const skillNames = profile.skills.map((s) => s.name.toLowerCase());
    expect(skillNames.some((n) => n.includes('python') || n.includes('java'))).toBe(true);
  }, 20000);

  it('extracts skills from resume text', async () => {
    const profile = await parseResumeWithGemini({
      textContent: `Jane Doe - Senior Full Stack Engineer\nExperience: 5 years\nSkills: React, TypeScript, Node.js, PostgreSQL, Docker`,
    });
    expect(profile.role).toBeDefined();
    expect(profile.skills.length).toBeGreaterThan(0);
  }, 20000);

  it('generates an assessment for a given skill with 5 calibrated questions', async () => {
    const assessment = await generateSkillAssessmentWithGemini('Python', 'Intermediate');
    expect(assessment.skillName).toBe('Python');
    expect(assessment.questions.length).toBe(5);
    for (const q of assessment.questions) {
      expect(q.prompt).toBeDefined();
      expect(q.options.length).toBe(4);
      expect(['A', 'B', 'C', 'D']).toContain(q.correctOptionId);
      expect(q.explanation).toBeDefined();
    }
  }, 20000);
});
