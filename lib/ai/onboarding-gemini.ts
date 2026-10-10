/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import {
  ClaimedLevel,
  normalizeSkill,
  SkillCategory,
} from '../domain/skills-taxonomy.ts';

export interface ExtractedSkill {
  name: string;
  slug?: string;
  category?: SkillCategory;
  claimedLevel: ClaimedLevel;
  level?: ClaimedLevel; // backwards compatibility
  evidence?: string;
  selected?: boolean;
}

export interface ExtractedProfile {
  fieldOfStudy: string;
  summary: string;
  role?: string;
  yearsOfExperience?: number;
  skills: ExtractedSkill[];
  fallbackUsed?: boolean;
}

export interface GeneratedAssessmentQuestion {
  id: string;
  prompt: string;
  codeSnippet?: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface GeneratedAssessment {
  id: string;
  skillName: string;
  level: string;
  createdAt: string;
  questions: GeneratedAssessmentQuestion[];
}

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Extracts candidate profile and skills from resume document with 1 retry and friendly fallback.
 */
export async function parseResumeWithGemini(params: {
  fileData?: string;
  mimeType?: string;
  textContent?: string;
  fileName?: string;
}): Promise<ExtractedProfile> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return generateFallbackProfile('Software Developer', 'Computer Science');
  }

  const systemInstruction = `You are an expert technical talent assessor on the SkillProof verification platform.
Analyze the provided resume document or text.
Extract:
1. "fieldOfStudy": Academic discipline or domain (e.g. "Computer Science", "Information Technology", "Self-Taught").
2. "summary": A concise 1-2 sentence executive summary of the candidate's core expertise.
3. "role": The candidate's primary current job title or target role.
4. "yearsOfExperience": Estimated non-negative integer number of years (0 if student/entry-level).
5. "skills": An array of prominent, verifiable technical skills.
For each skill:
- "name": Clean canonical title (e.g. "Python", "React", "TypeScript", "SQL", "Docker", "Algorithms").
- "category": EXACTLY one of: "programming" | "framework" | "database" | "tool" | "soft-or-other".
- "claimedLevel": EXACTLY one of: "Beginner" | "Intermediate" | "Advanced" (based on project depth).
- "evidence": A short phrase from the resume showing where/how the skill was demonstrated.

DO NOT extract vague personal traits (like "hardworking", "team player", "punctual").

Respond STRICTLY with valid JSON following this schema:
{
  "fieldOfStudy": string,
  "summary": string,
  "role": string,
  "yearsOfExperience": number,
  "skills": [
    {
      "name": string,
      "category": "programming" | "framework" | "database" | "tool" | "soft-or-other",
      "claimedLevel": "Beginner" | "Intermediate" | "Advanced",
      "evidence": string
    }
  ]
}`;

  let contents: any;
  if (params.fileData && (params.mimeType === 'application/pdf' || params.fileName?.toLowerCase().endsWith('.pdf'))) {
    contents = {
      parts: [
        {
          inlineData: {
            data: params.fileData,
            mimeType: 'application/pdf',
          },
        },
        {
          text: `Please analyze this resume (${params.fileName || 'resume.pdf'}) and extract structured profile and skills.`,
        },
      ],
    };
  } else {
    const rawText = params.textContent || (params.fileData ? Buffer.from(params.fileData, 'base64').toString('utf-8') : '');
    contents = `Candidate Resume Content:\n${rawText.slice(0, 30000)}\n\nPlease extract structured profile and skills.`;
  }

  // Attempt with 1 retry
  let attempts = 0;
  while (attempts < 2) {
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return sanitizeExtractedProfile(parsed);
    } catch (err) {
      attempts++;
      console.warn(`[Gemini] parseResume attempt ${attempts} failed:`, err);
      if (attempts >= 2) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.error('[Gemini] parseResume failed after 2 attempts; returning friendly fallback profile.');
  return generateFallbackProfile('Software Developer', 'Computer Science', true);
}

/**
 * Extracts candidate profile from typed background text with 1 retry and friendly fallback.
 */
export async function parseTextProfileWithGemini(userText: string): Promise<ExtractedProfile> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return generateFallbackProfileFromText(userText);
  }

  const systemInstruction = `You are an expert technical talent assessor on the SkillProof verification platform.
The candidate typed a self-introduction:
"${userText}"

Extract:
1. "fieldOfStudy": Academic discipline or technical domain (e.g. "Computer Science", "Information Technology").
2. "summary": A concise 1-sentence summary of the candidate's background.
3. "role": Target role (e.g. "Full Stack Developer", "Backend Engineer").
4. "yearsOfExperience": Estimated years as a number (0 if student or entry-level).
5. "skills": List of verifiable technical skills mentioned or implied.
Each skill must have:
- "name": Canonical capitalized title (e.g. "Java", "Python", "React", "SQL").
- "category": "programming" | "framework" | "database" | "tool" | "soft-or-other".
- "claimedLevel": "Beginner" | "Intermediate" | "Advanced".
- "evidence": Short quote or context from the candidate text.

DO NOT extract vague soft traits like "hardworking" or "quick learner".

Respond STRICTLY with valid JSON following this schema:
{
  "fieldOfStudy": string,
  "summary": string,
  "role": string,
  "yearsOfExperience": number,
  "skills": [
    {
      "name": string,
      "category": "programming" | "framework" | "database" | "tool" | "soft-or-other",
      "claimedLevel": "Beginner" | "Intermediate" | "Advanced",
      "evidence": string
    }
  ]
}`;

  let attempts = 0;
  while (attempts < 2) {
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Candidate description:\n${userText}`,
        config: {
          systemInstruction,
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return sanitizeExtractedProfile(parsed);
    } catch (err) {
      attempts++;
      console.warn(`[Gemini] parseTextProfile attempt ${attempts} failed:`, err);
      if (attempts >= 2) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.error('[Gemini] parseTextProfile failed after 2 attempts; returning fallback profile.');
  return generateFallbackProfileFromText(userText, true);
}

function sanitizeExtractedProfile(raw: any, fallbackUsed = false): ExtractedProfile {
  const fieldOfStudy = typeof raw?.fieldOfStudy === 'string' && raw.fieldOfStudy.trim()
    ? raw.fieldOfStudy.trim()
    : 'Computer Science';
  const role = typeof raw?.role === 'string' && raw.role.trim()
    ? raw.role.trim()
    : 'Software Developer';
  const summary = typeof raw?.summary === 'string' && raw.summary.trim()
    ? raw.summary.trim()
    : `${role} specializing in modern software development and engineering best practices.`;
  const yearsOfExperience = typeof raw?.yearsOfExperience === 'number' && !isNaN(raw.yearsOfExperience)
    ? Math.max(0, Math.floor(raw.yearsOfExperience))
    : 1;

  const validSkills: ExtractedSkill[] = [];
  const seenNames = new Set<string>();

  if (Array.isArray(raw?.skills)) {
    for (const item of raw.skills) {
      const rawName = typeof item === 'string' ? item : item?.name;
      if (!rawName) continue;

      const rawLevel = item?.claimedLevel || item?.level || 'Intermediate';
      const rawEvidence = item?.evidence;
      const rawCategory = item?.category;

      const normalized = normalizeSkill(rawName, rawLevel, rawEvidence, rawCategory);
      if (normalized && !seenNames.has(normalized.slug)) {
        seenNames.add(normalized.slug);
        validSkills.push({
          name: normalized.name,
          slug: normalized.slug,
          category: normalized.category,
          claimedLevel: normalized.claimedLevel,
          level: normalized.claimedLevel,
          evidence: normalized.evidence,
        });
      }
    }
  }

  // Ensure at least reasonable default skills if none were found
  if (validSkills.length === 0) {
    validSkills.push(
      { name: 'Python', slug: 'python', category: 'programming', claimedLevel: 'Intermediate', level: 'Intermediate' },
      { name: 'SQL', slug: 'sql', category: 'database', claimedLevel: 'Intermediate', level: 'Intermediate' },
      { name: 'JavaScript', slug: 'javascript', category: 'programming', claimedLevel: 'Intermediate', level: 'Intermediate' }
    );
  }

  return {
    fieldOfStudy,
    summary,
    role,
    yearsOfExperience,
    skills: validSkills,
    fallbackUsed,
  };
}

function generateFallbackProfile(role = 'Software Developer', fieldOfStudy = 'Computer Science', fallbackUsed = false): ExtractedProfile {
  return {
    role,
    fieldOfStudy,
    summary: 'Candidate profile with core foundational technical skills.',
    yearsOfExperience: 1,
    fallbackUsed,
    skills: [
      { name: 'Python', slug: 'python', category: 'programming', claimedLevel: 'Intermediate', level: 'Intermediate', evidence: 'Core language foundation' },
      { name: 'SQL', slug: 'sql', category: 'database', claimedLevel: 'Intermediate', level: 'Intermediate', evidence: 'Relational data query design' },
      { name: 'JavaScript', slug: 'javascript', category: 'programming', claimedLevel: 'Intermediate', level: 'Intermediate', evidence: 'Web application development' },
      { name: 'Git', slug: 'git', category: 'tool', claimedLevel: 'Intermediate', level: 'Intermediate', evidence: 'Version control workflows' },
    ],
  };
}

function generateFallbackProfileFromText(text: string, fallbackUsed = false): ExtractedProfile {
  const lower = text.toLowerCase();
  const detectedSkills: ExtractedSkill[] = [];
  const seen = new Set<string>();

  const catalog: Array<{ name: string; category: SkillCategory; keywords: string[] }> = [
    { name: 'Python', category: 'programming', keywords: ['python', 'py', 'django', 'fastapi', 'flask'] },
    { name: 'Java', category: 'programming', keywords: ['java', 'spring', 'jvm'] },
    { name: 'JavaScript', category: 'programming', keywords: ['javascript', 'js', 'node', 'express'] },
    { name: 'TypeScript', category: 'programming', keywords: ['typescript', 'ts'] },
    { name: 'React', category: 'framework', keywords: ['react', 'next.js', 'frontend'] },
    { name: 'C++', category: 'programming', keywords: ['c++', 'cpp'] },
    { name: 'SQL', category: 'database', keywords: ['sql', 'postgres', 'postgresql', 'mysql', 'database'] },
    { name: 'Git', category: 'tool', keywords: ['git', 'github', 'version control'] },
    { name: 'Docker', category: 'tool', keywords: ['docker', 'container', 'k8s', 'kubernetes'] },
    { name: 'Excel', category: 'tool', keywords: ['excel', 'sheets', 'spreadsheet'] },
  ];

  for (const item of catalog) {
    if (item.keywords.some((k) => lower.includes(k))) {
      const norm = normalizeSkill(item.name, 'Intermediate', undefined, item.category);
      if (norm && !seen.has(norm.slug)) {
        seen.add(norm.slug);
        detectedSkills.push({
          name: norm.name,
          slug: norm.slug,
          category: norm.category,
          claimedLevel: norm.claimedLevel,
          level: norm.claimedLevel,
          evidence: 'Mentioned in description',
        });
      }
    }
  }

  if (detectedSkills.length === 0) {
    detectedSkills.push(
      { name: 'Python', slug: 'python', category: 'programming', claimedLevel: 'Intermediate', level: 'Intermediate' },
      { name: 'SQL', slug: 'sql', category: 'database', claimedLevel: 'Intermediate', level: 'Intermediate' }
    );
  }

  return {
    role: 'Software Developer',
    fieldOfStudy: 'Computer Science',
    summary: 'Candidate self-reported background and engineering competencies.',
    yearsOfExperience: 1,
    skills: detectedSkills,
    fallbackUsed,
  };
}

/**
 * Generates calibrated assessment questions for a specific skill via Gemini, with fallback on failure.
 */
export async function generateSkillAssessmentWithGemini(
  skillName: string,
  level: string = 'Intermediate'
): Promise<GeneratedAssessment> {
  const assessmentId = `assess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return generateFallbackSkillAssessment(assessmentId, skillName, level);
  }

  const prompt = `Generate exactly 5 calibrated technical multiple-choice assessment questions for the skill "${skillName}" at "${level}" difficulty level.
Respond STRICTLY with valid JSON following this schema:
{
  "questions": [
    {
      "id": "q1",
      "prompt": "Clear question text testing real-world knowledge",
      "codeSnippet": "optional short code snippet if relevant, or null",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" },
        { "id": "C", "text": "Option C" },
        { "id": "D", "text": "Option D" }
      ],
      "correctOptionId": "A",
      "explanation": "Clear explanation of why this answer is correct",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}`;

  let attempts = 0;
  while (attempts < 2) {
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (Array.isArray(parsed?.questions) && parsed.questions.length >= 3) {
        const questions: GeneratedAssessmentQuestion[] = parsed.questions.map((q: any, idx: number) => ({
          id: q.id || `q_${idx + 1}`,
          prompt: q.prompt || `Question about ${skillName}`,
          codeSnippet: q.codeSnippet || undefined,
          options: Array.isArray(q.options) && q.options.length === 4
            ? q.options.map((opt: any, oIdx: number) => ({
                id: opt.id || ['A', 'B', 'C', 'D'][oIdx],
                text: String(opt.text || `Option ${oIdx + 1}`),
              }))
            : [
                { id: 'A', text: 'Correct implementation approach' },
                { id: 'B', text: 'Suboptimal alternative' },
                { id: 'C', text: 'Incorrect syntax or logic' },
                { id: 'D', text: 'Deprecated pattern' },
              ],
          correctOptionId: ['A', 'B', 'C', 'D'].includes(q.correctOptionId) ? q.correctOptionId : 'A',
          explanation: q.explanation || `Core competency in ${skillName}`,
          difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : (level as any) || 'Medium',
        }));

        return {
          id: assessmentId,
          skillName,
          level,
          createdAt: new Date().toISOString(),
          questions,
        };
      }
    } catch (err) {
      attempts++;
      console.warn(`[Gemini] generateSkillAssessment attempt ${attempts} failed:`, err);
      if (attempts >= 2) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.warn(`[Gemini] Falling back to pre-calibrated questions for ${skillName}`);
  return generateFallbackSkillAssessment(assessmentId, skillName, level);
}

function generateFallbackSkillAssessment(
  id: string,
  skillName: string,
  level: string
): GeneratedAssessment {
  return {
    id,
    skillName,
    level,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        prompt: `In ${skillName}, what is the primary recommended pattern for error handling and resource management?`,
        options: [
          { id: 'A', text: 'Structured try/catch or contextual resource managers' },
          { id: 'B', text: 'Ignoring return codes silently' },
          { id: 'C', text: 'Global unhandled exception suppression' },
          { id: 'D', text: 'Terminating the process abruptly' },
        ],
        correctOptionId: 'A',
        explanation: 'Idiomatic exception handling and context-managed resources guarantee predictable execution and prevent leaks.',
        difficulty: 'Easy',
      },
      {
        id: 'q2',
        prompt: `Which complexity profile describes optimal lookup performance for standard hash-based structures in ${skillName}?`,
        options: [
          { id: 'A', text: 'O(1) average case lookup' },
          { id: 'B', text: 'O(n^2) worst case linear scan' },
          { id: 'C', text: 'O(log n) tree traversal only' },
          { id: 'D', text: 'O(n!) factorial search' },
        ],
        correctOptionId: 'A',
        explanation: 'Hash maps and dictionaries provide O(1) expected lookup amortized.',
        difficulty: 'Medium',
      },
      {
        id: 'q3',
        prompt: `When building scalable production modules in ${skillName}, which design principle prevents tight coupling?`,
        options: [
          { id: 'A', text: 'Dependency injection and explicit interfaces' },
          { id: 'B', text: 'Hardcoding concrete dependencies in constructors' },
          { id: 'C', text: 'Using static mutable globals across files' },
          { id: 'D', text: 'Circulating cyclic imports' },
        ],
        correctOptionId: 'A',
        explanation: 'Inversion of control and interfaces foster modular, testable architectures.',
        difficulty: 'Medium',
      },
      {
        id: 'q4',
        prompt: `How should concurrent state mutation be handled safely when working in ${skillName}?`,
        options: [
          { id: 'A', text: 'Atomic operations, mutual exclusion locks, or immutable data' },
          { id: 'B', text: 'Unsynchronized multi-thread access' },
          { id: 'C', text: 'Random sleep intervals' },
          { id: 'D', text: 'Disabling compiler safety checks' },
        ],
        correctOptionId: 'A',
        explanation: 'Atomic operations and locks prevent data races and corrupted shared memory.',
        difficulty: 'Hard',
      },
      {
        id: 'q5',
        prompt: `What is the most effective approach for validating performance bottlenecks in a ${skillName} application?`,
        options: [
          { id: 'A', text: 'Profile CPU and memory allocation under realistic synthetic workloads' },
          { id: 'B', text: 'Guessing and rewriting random functions' },
          { id: 'C', text: 'Removing all unit tests' },
          { id: 'D', text: 'Increasing server RAM without measuring' },
        ],
        correctOptionId: 'A',
        explanation: 'Empirical profiling identifies hotspots before performing targeted optimizations.',
        difficulty: 'Hard',
      },
    ],
  };
}
