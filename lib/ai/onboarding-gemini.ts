/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

export interface ExtractedSkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  selected?: boolean;
}

export interface ExtractedProfile {
  role: string;
  fieldOfStudy: string;
  yearsOfExperience: number;
  skills: ExtractedSkill[];
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
 * Extracts a candidate's profile and top technical skills from an uploaded resume (PDF or extracted text).
 */
export async function parseResumeWithGemini(params: {
  fileData?: string;
  mimeType?: string;
  textContent?: string;
  fileName?: string;
}): Promise<ExtractedProfile> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return generateFallbackProfile('Software Engineer', [
      { name: 'Python', level: 'Intermediate' },
      { name: 'JavaScript', level: 'Intermediate' },
      { name: 'Data Structures', level: 'Beginner' },
      { name: 'SQL', level: 'Intermediate' },
      { name: 'Git', level: 'Intermediate' },
    ]);
  }

  const ai = getGeminiClient();
  const systemInstruction = `You are an expert technical talent assessor on the SkillProof verification platform.
Analyze the provided resume document or text.
Extract:
1. "role": The primary current job title, aspiring role, or student title (e.g. "Full Stack Developer", "CS Student", "Backend Engineer").
2. "fieldOfStudy": Academic discipline or domain (e.g. "Computer Science", "Information Technology", "Self-Taught").
3. "yearsOfExperience": Non-negative integer number of years (0 if student/entry-level).
4. "skills": An array of at most 10 of the most prominent, verifiable technical skills.
Each skill must have:
- "name": Clean canonical title (e.g. "Python", "React", "TypeScript", "SQL", "Docker", "Algorithms").
- "level": One of "Beginner", "Intermediate", "Advanced". Infer from depth of experience described.

Respond STRICTLY with valid JSON following this schema:
{
  "role": string,
  "fieldOfStudy": string,
  "yearsOfExperience": number,
  "skills": [
    { "name": string, "level": "Beginner" | "Intermediate" | "Advanced" }
  ]
}`;

  let contents: any;
  if (params.fileData && params.mimeType === 'application/pdf') {
    contents = {
      parts: [
        {
          inlineData: {
            data: params.fileData,
            mimeType: 'application/pdf',
          },
        },
        {
          text: `Please analyze this resume (${params.fileName || 'resume.pdf'}) and extract the candidate profile and skills according to the system instructions.`,
        },
      ],
    };
  } else {
    const rawText = params.textContent || (params.fileData ? Buffer.from(params.fileData, 'base64').toString('utf-8') : '');
    contents = `Candidate Resume Content:\n${rawText.slice(0, 30000)}\n\nPlease extract candidate profile and skills according to the system instructions.`;
  }

  try {
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
    console.error('[Gemini] parseResume failed:', err);
    return generateFallbackProfile('Candidate', [
      { name: 'Python', level: 'Intermediate' },
      { name: 'JavaScript', level: 'Intermediate' },
      { name: 'SQL', level: 'Intermediate' },
      { name: 'Git', level: 'Intermediate' },
    ]);
  }
}

/**
 * Extracts candidate profile from free-form text input (e.g. "I'm a CS student, I know Java and Python").
 */
export async function parseTextProfileWithGemini(userText: string): Promise<ExtractedProfile> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return generateFallbackProfileFromText(userText);
  }

  const ai = getGeminiClient();
  const systemInstruction = `You are an expert technical talent assessor on the SkillProof verification platform.
The candidate typed a self-introduction:
"${userText}"

Extract:
1. "role": Deduced target role or current standing (e.g. "Computer Science Student", "Full Stack Developer", "Software Engineer").
2. "fieldOfStudy": Academic discipline or technical domain (e.g. "Computer Science", "Software Engineering").
3. "yearsOfExperience": Estimated years as a number (0 if student or beginner).
4. "skills": List of technical skills mentioned or strongly implied (up to 8).
Each skill has:
- "name": Canonical capitalized name (e.g. "Java", "Python", "React", "PostgreSQL").
- "level": "Beginner", "Intermediate", or "Advanced".

Respond STRICTLY with valid JSON following this schema:
{
  "role": string,
  "fieldOfStudy": string,
  "yearsOfExperience": number,
  "skills": [
    { "name": string, "level": "Beginner" | "Intermediate" | "Advanced" }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Candidate input:\n${userText}`,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return sanitizeExtractedProfile(parsed);
  } catch (err) {
    console.error('[Gemini] parseTextProfile failed:', err);
    return generateFallbackProfileFromText(userText);
  }
}

/**
 * Generates an adaptive 5-question skill verification assessment using Gemini.
 */
export async function generateSkillAssessmentWithGemini(
  skillName: string,
  claimedLevel: string = 'Intermediate'
): Promise<GeneratedAssessment> {
  const assessmentId = `assess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return generateFallbackAssessment(assessmentId, skillName, claimedLevel);
  }

  const ai = getGeminiClient();
  const systemInstruction = `You are a principal engineer on the SkillProof assessment engine.
Generate an evidence-based skill verification assessment for "${skillName}" targeted at claimed level "${claimedLevel}".

Create exactly 5 high-quality, practical multiple-choice questions.
Requirements:
1. Cover conceptual mastery, edge-cases, real-world bug identification, and practical problem solving.
2. At least 2 questions MUST include a concise code snippet illustrating the scenario.
3. Each question must have exactly 4 options labeled A, B, C, D.
4. Exactly one option is correct. The correct option ID must be "A", "B", "C", or "D".
5. Provide a clear, educational explanation citing why the answer is correct and why other choices fail.
6. Calibrate difficulties across the 5 questions: 1 Easy, 3 Medium, 1 Hard.

Respond STRICTLY with valid JSON following this schema:
{
  "questions": [
    {
      "id": "q1",
      "prompt": string,
      "codeSnippet": string or null,
      "options": [
        { "id": "A", "text": string },
        { "id": "B", "text": string },
        { "id": "C", "text": string },
        { "id": "D", "text": string }
      ],
      "correctOptionId": "A" | "B" | "C" | "D",
      "explanation": string,
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate 5 skill verification questions for ${skillName} (${claimedLevel} level).`,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    const questions: GeneratedAssessmentQuestion[] = Array.isArray(parsed.questions)
      ? parsed.questions.map((q: any, idx: number) => ({
          id: `q${idx + 1}`,
          prompt: String(q.prompt || `Question regarding ${skillName}`),
          codeSnippet: q.codeSnippet ? String(q.codeSnippet) : undefined,
          options: Array.isArray(q.options) && q.options.length === 4
            ? q.options.map((opt: any, optIdx: number) => ({
                id: ['A', 'B', 'C', 'D'][optIdx] || String(opt.id),
                text: String(opt.text || opt),
              }))
            : [
                { id: 'A', text: 'Option A' },
                { id: 'B', text: 'Option B' },
                { id: 'C', text: 'Option C' },
                { id: 'D', text: 'Option D' },
              ],
          correctOptionId: ['A', 'B', 'C', 'D'].includes(q.correctOptionId) ? q.correctOptionId : 'A',
          explanation: String(q.explanation || 'Verified best practice.'),
          difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
        }))
      : [];

    if (questions.length === 5) {
      return {
        id: assessmentId,
        skillName,
        level: claimedLevel,
        createdAt: new Date().toISOString(),
        questions,
      };
    }
    return generateFallbackAssessment(assessmentId, skillName, claimedLevel);
  } catch (err) {
    console.error('[Gemini] generateSkillAssessment failed:', err);
    return generateFallbackAssessment(assessmentId, skillName, claimedLevel);
  }
}

function sanitizeExtractedProfile(raw: any): ExtractedProfile {
  const role = typeof raw?.role === 'string' && raw.role.trim() ? raw.role.trim() : 'Software Developer';
  const fieldOfStudy = typeof raw?.fieldOfStudy === 'string' && raw.fieldOfStudy.trim()
    ? raw.fieldOfStudy.trim()
    : 'Computer Science';
  const yearsOfExperience = typeof raw?.yearsOfExperience === 'number' && !isNaN(raw.yearsOfExperience)
    ? Math.max(0, Math.floor(raw.yearsOfExperience))
    : 0;

  const validLevels = ['Beginner', 'Intermediate', 'Advanced'] as const;
  let skills: ExtractedSkill[] = [];

  if (Array.isArray(raw?.skills)) {
    skills = raw.skills
      .filter((s: any) => s && (typeof s === 'string' || typeof s.name === 'string'))
      .map((s: any) => {
        const name = typeof s === 'string' ? s.trim() : s.name.trim();
        const level = validLevels.includes(s.level) ? s.level : 'Intermediate';
        return { name, level };
      })
      .filter((s: ExtractedSkill) => s.name.length > 0)
      .slice(0, 10);
  }

  if (skills.length === 0) {
    skills = [
      { name: 'Python', level: 'Intermediate' },
      { name: 'JavaScript', level: 'Intermediate' },
      { name: 'SQL', level: 'Beginner' },
    ];
  }

  return {
    role,
    fieldOfStudy,
    yearsOfExperience,
    skills,
  };
}

function generateFallbackProfile(role: string, skills: ExtractedSkill[]): ExtractedProfile {
  return {
    role,
    fieldOfStudy: 'Computer Science & Engineering',
    yearsOfExperience: 1,
    skills,
  };
}

function generateFallbackProfileFromText(text: string): ExtractedProfile {
  const lower = text.toLowerCase();
  const detectedSkills: ExtractedSkill[] = [];

  const catalog = [
    { name: 'Python', keywords: ['python', 'django', 'fastapi', 'flask'] },
    { name: 'Java', keywords: ['java', 'spring', 'jvm'] },
    { name: 'JavaScript', keywords: ['javascript', 'js', 'node', 'express'] },
    { name: 'TypeScript', keywords: ['typescript', 'ts'] },
    { name: 'React', keywords: ['react', 'next.js', 'redux'] },
    { name: 'C++', keywords: ['c++', 'cpp'] },
    { name: 'SQL', keywords: ['sql', 'postgres', 'postgresql', 'mysql'] },
    { name: 'Git', keywords: ['git', 'github', 'version control'] },
    { name: 'Data Structures', keywords: ['data structure', 'dsa', 'algorithms'] },
  ];

  for (const item of catalog) {
    if (item.keywords.some((k) => lower.includes(k))) {
      detectedSkills.push({ name: item.name, level: 'Intermediate' });
    }
  }

  if (detectedSkills.length === 0) {
    detectedSkills.push(
      { name: 'Python', level: 'Intermediate' },
      { name: 'Java', level: 'Intermediate' }
    );
  }

  const isStudent = lower.includes('student') || lower.includes('university') || lower.includes('college');
  return {
    role: isStudent ? 'Computer Science Student' : 'Software Developer',
    fieldOfStudy: 'Computer Science',
    yearsOfExperience: isStudent ? 0 : 1,
    skills: detectedSkills,
  };
}

function generateFallbackAssessment(
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
        prompt: `In ${skillName}, what is the fundamental purpose of adhering to standard idempotency and pure functions?`,
        options: [
          { id: 'A', text: 'To ensure identical inputs always yield identical outputs without side effects' },
          { id: 'B', text: 'To force global variables to synchronize across threads' },
          { id: 'C', text: 'To bypass memory allocations during compilation' },
          { id: 'D', text: 'To encrypt data structures in transit' },
        ],
        correctOptionId: 'A',
        explanation: 'Pure functions and idempotent operations produce predictable outputs with zero external mutations.',
        difficulty: 'Easy',
      },
      {
        id: 'q2',
        prompt: `Consider this ${skillName} workflow. What will happen if memory or reference state is accessed concurrently without synchronization?`,
        codeSnippet: `// Concurrent worker task\nprocessQueue(sharedBuffer);\nupdateCounter(sharedBuffer.length);`,
        options: [
          { id: 'A', text: 'Race conditions and inconsistent shared state' },
          { id: 'B', text: 'Automatic memory isolation guarantee' },
          { id: 'C', text: 'Instantaneous compiler crash' },
          { id: 'D', text: 'The program will run 2x faster' },
        ],
        correctOptionId: 'A',
        explanation: 'Shared mutable state across concurrent threads requires proper locking or atomics to prevent data races.',
        difficulty: 'Medium',
      },
      {
        id: 'q3',
        prompt: `When designing resilient architectures in ${skillName}, how should unexpected transient exceptions be handled?`,
        options: [
          { id: 'A', text: 'Swallow the exception with an empty catch block' },
          { id: 'B', text: 'Employ exponential backoff retry policies and structured logging' },
          { id: 'C', text: 'Immediately restart the operating system process' },
          { id: 'D', text: 'Return null silently to caller routines' },
        ],
        correctOptionId: 'B',
        explanation: 'Exponential backoff paired with jitter and structured observability is the industry gold standard for handling transient failures.',
        difficulty: 'Medium',
      },
      {
        id: 'q4',
        prompt: `Which asymptotic time complexity best describes searching an element in an optimally balanced binary search tree or hash map?`,
        options: [
          { id: 'A', text: 'O(log n) for balanced BST and O(1) average for hash maps' },
          { id: 'B', text: 'O(n^2) for both' },
          { id: 'C', text: 'O(n!) factorial complexity' },
          { id: 'D', text: 'O(1) worst-case guaranteed in all cases' },
        ],
        correctOptionId: 'A',
        explanation: 'Balanced BST lookups take O(log n) while well-distributed hash maps achieve O(1) average lookup time.',
        difficulty: 'Medium',
      },
      {
        id: 'q5',
        prompt: `In an advanced production system using ${skillName}, what is the primary risk of creating circular object references when using automatic garbage collection?`,
        options: [
          { id: 'A', text: 'Potential memory leaks in simple reference-counting collectors unless cycle detection is present' },
          { id: 'B', text: 'Hardware bus faults' },
          { id: 'C', text: 'CPU frequency throttling' },
          { id: 'D', text: 'Network connection dropouts' },
        ],
        correctOptionId: 'A',
        explanation: 'Cyclic references prevent simple reference count decrements to zero, requiring generational mark-and-sweep or explicit weak references.',
        difficulty: 'Hard',
      },
    ],
  };
}
