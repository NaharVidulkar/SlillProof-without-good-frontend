/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { PYTHON_FUNDAMENTALS_ASSESSMENT } from './python-fundamentals.ts';
import { store } from '../store.ts';
import {
  NormalizedSkill,
  RUNNABLE_LANGUAGE_MAP,
} from '../../domain/skills-taxonomy.ts';

export interface DynamicMcqQuestion {
  id: string;
  type: 'mcq';
  prompt: string;
  codeSnippet?: string;
  options: Array<{ id: 'A' | 'B' | 'C' | 'D'; text: string }>;
  correctOptionId: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  skillSlug: string;
}

export interface DynamicCodingQuestion {
  id: string;
  type: 'code';
  title: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  starterCode: string;
  language: string;
  visibleTests: Array<{ input: string; expected: string }>;
  hiddenTests: Array<{ input: string; expected: string; category?: string }>;
  timeLimitMs: number;
  memoryLimitKb: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  skillSlug: string;
}

export type DynamicQuestion = DynamicMcqQuestion | DynamicCodingQuestion;

export interface AssessmentSectionRecord {
  id: string; // skillSlug
  userId: string;
  skillName: string;
  skillSlug: string;
  category: string;
  claimedLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'not_started' | 'generating' | 'ready' | 'in_progress' | 'completed' | 'failed';
  questionIds: string[];
  totalQuestions: number;
  mcqCount: number;
  codeCount: number;
  score: number | null;
  badgeLabel: 'Verified' | 'Partially verified' | 'Not yet verified' | null;
  attempts: number;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  codeDrafts?: Record<string, string>;
  generatingStartedAt?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
}

// In-memory concurrency queue (max 3 Gemini calls at once)
class ConcurrencyQueue {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private maxConcurrent = 3) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

const geminiQueue = new ConcurrencyQueue(3);

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
 * Executes a Gemini request with a 30s timeout and exponential backoff retry.
 */
async function callGeminiWithRetry<T>(
  task: (ai: GoogleGenAI) => Promise<T>,
  retries = 2
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY not configured');
  }

  return geminiQueue.run(async () => {
    let attempt = 0;
    let delay = 1000;

    while (attempt <= retries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const ai = getGeminiClient();
        const result = await Promise.race([
          task(ai),
          new Promise<never>((_, reject) => {
            controller.signal.addEventListener('abort', () =>
              reject(new Error('Gemini API call timed out after 30 seconds'))
            );
          }),
        ]);
        clearTimeout(timeoutId);
        return result;
      } catch (err: any) {
        clearTimeout(timeoutId);
        attempt++;
        const isRateLimitOr5xx =
          err?.status === 429 ||
          err?.status >= 500 ||
          err?.message?.includes('429') ||
          err?.message?.includes('503') ||
          err?.message?.includes('high demand');

        if (attempt <= retries && isRateLimitOr5xx) {
          console.warn(`[Gemini Queue] Backoff retry ${attempt}/${retries} in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        throw err;
      }
    }
    throw new Error('Gemini call failed after retries');
  });
}

/**
 * Extracts questions from the existing Python fundamentals assessment.
 */
export function getPythonQuestionsBank(): DynamicQuestion[] {
  const questions: DynamicQuestion[] = [];

  for (const sec of PYTHON_FUNDAMENTALS_ASSESSMENT.sections) {
    for (const q of sec.questions) {
      if (q.type === 'mcq') {
        const optLetters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
        const mappedOptions = q.options.slice(0, 4).map((opt, i) => ({
          id: optLetters[i] || 'A',
          text: opt.text,
        }));

        let correctLetter: 'A' | 'B' | 'C' | 'D' = 'A';
        const optIndex = q.options.findIndex((o) => o.id === q.correctOptionId);
        if (optIndex >= 0 && optIndex < 4) {
          correctLetter = optLetters[optIndex];
        }

        questions.push({
          id: `py_${q.id}`,
          type: 'mcq',
          prompt: q.prompt,
          codeSnippet: q.codeSnippet,
          options: mappedOptions,
          correctOptionId: correctLetter,
          explanation: q.explanation,
          difficulty: sec.difficultyLabel,
          skillSlug: 'python',
        });
      } else if (q.type === 'code') {
        questions.push({
          id: `py_${q.id}`,
          type: 'code',
          title: q.title,
          statement: q.statement,
          inputFormat: q.inputFormat,
          outputFormat: q.outputFormat,
          starterCode: q.starterCode.python || '# Write your solution below\nimport sys\n',
          language: 'python',
          visibleTests: q.visibleTests,
          hiddenTests: q.hiddenTests,
          timeLimitMs: q.timeLimitMs || 3000,
          memoryLimitKb: q.memoryLimitKb || 65536,
          difficulty: sec.difficultyLabel,
          skillSlug: 'python',
        });
      }
    }
  }

  return questions;
}

/**
 * Generates MCQs in batches for a given skill.
 */
async function generateMcqBatch(
  skillName: string,
  level: string,
  category: string,
  count: number,
  batchIndex: number
): Promise<DynamicMcqQuestion[]> {
  const prompt = `You are a principal assessment engineer at SkillProof.
Create exactly ${count} multiple-choice verification questions for ${skillName} at "${level}" level (Category: ${category}).
Target batch ${batchIndex}.
Requirements:
1. Practical, scenario-driven questions testing deep conceptual knowledge, edge-cases, and debugging.
2. At least 4 questions MUST include a concise, realistic code snippet.
3. Exactly 4 options per question labeled A, B, C, D.
4. Exactly one unambiguous correct answer.
5. In-depth technical explanation.
6. Calibrate difficulty: Mix of Easy (25%), Medium (50%), Hard (25%).

Output strictly valid JSON:
{
  "questions": [
    {
      "prompt": "...",
      "codeSnippet": "... or null",
      "options": [
        { "id": "A", "text": "..." },
        { "id": "B", "text": "..." },
        { "id": "C", "text": "..." },
        { "id": "D", "text": "..." }
      ],
      "correctOptionId": "A" | "B" | "C" | "D",
      "explanation": "...",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}`;

  const response = await callGeminiWithRetry(async (ai) => {
    return ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });
  });

  const parsed = JSON.parse(response.text?.trim() || '{}');
  const rawList = Array.isArray(parsed.questions) ? parsed.questions : [];

  const validMcqs: DynamicMcqQuestion[] = [];
  const slug = skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  for (let i = 0; i < rawList.length; i++) {
    const q = rawList[i];
    if (!q || !q.prompt || !Array.isArray(q.options) || q.options.length !== 4) continue;
    if (!['A', 'B', 'C', 'D'].includes(q.correctOptionId)) continue;

    validMcqs.push({
      id: `${slug}_mcq_b${batchIndex}_${i + 1}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'mcq',
      prompt: String(q.prompt).trim(),
      codeSnippet: q.codeSnippet && String(q.codeSnippet).trim() !== 'null' ? String(q.codeSnippet).trim() : undefined,
      options: q.options.map((opt: any, optIdx: number) => ({
        id: (['A', 'B', 'C', 'D'][optIdx] || 'A') as 'A' | 'B' | 'C' | 'D',
        text: String(opt.text || opt).trim(),
      })),
      correctOptionId: q.correctOptionId as 'A' | 'B' | 'C' | 'D',
      explanation: String(q.explanation || 'Verified best practice.').trim(),
      difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
      skillSlug: slug,
    });
  }

  return validMcqs;
}

/**
 * Generates runnable coding problems with starter code, visible tests, and hidden tests.
 */
async function generateCodingBatch(
  skillName: string,
  level: string,
  compilerLang: string,
  count: number
): Promise<DynamicCodingQuestion[]> {
  const prompt = `You are an automated coding problem author for SkillProof.
Create exactly ${count} runnable coding problems for "${skillName}" (${compilerLang}) at level "${level}".
Requirements:
1. Real-world computational problems (string algorithms, parsers, collections, data math, logic).
2. Input is passed via standard input (stdin); output printed to standard output (stdout).
3. Provide realistic starterCode with clear comments.
4. Each problem MUST include at least 2 visible test cases.
5. Each problem MUST include at least 3 hidden test cases covering edge-cases (e.g. empty input, large numbers, boundary values).
6. Time limit 3000ms, memory 65536 KB.

Output strictly valid JSON:
{
  "problems": [
    {
      "title": "...",
      "statement": "...",
      "inputFormat": "...",
      "outputFormat": "...",
      "starterCode": "...",
      "visibleTests": [
        { "input": "...", "expected": "..." }
      ],
      "hiddenTests": [
        { "input": "...", "expected": "...", "category": "edge case" }
      ],
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}`;

  const response = await callGeminiWithRetry(async (ai) => {
    return ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });
  });

  const parsed = JSON.parse(response.text?.trim() || '{}');
  const rawList = Array.isArray(parsed.problems) ? parsed.problems : [];

  const validCodes: DynamicCodingQuestion[] = [];
  const slug = skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  for (let i = 0; i < rawList.length; i++) {
    const p = rawList[i];
    if (!p || !p.title || !p.statement || !Array.isArray(p.visibleTests) || !Array.isArray(p.hiddenTests)) continue;
    if (p.visibleTests.length < 1 || p.hiddenTests.length < 2) continue;

    validCodes.push({
      id: `${slug}_code_${i + 1}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'code',
      title: String(p.title).trim(),
      statement: String(p.statement).trim(),
      inputFormat: String(p.inputFormat || 'Read from standard input').trim(),
      outputFormat: String(p.outputFormat || 'Print to standard output').trim(),
      starterCode: String(p.starterCode || '// Write solution\n').trim(),
      language: compilerLang,
      visibleTests: p.visibleTests.map((t: any) => ({
        input: String(t.input ?? ''),
        expected: String(t.expected ?? '').trim(),
      })),
      hiddenTests: p.hiddenTests.map((t: any) => ({
        input: String(t.input ?? ''),
        expected: String(t.expected ?? '').trim(),
        category: t.category || 'edge case',
      })),
      timeLimitMs: 3000,
      memoryLimitKb: 65536,
      difficulty: ['Easy', 'Medium', 'Hard'].includes(p.difficulty) ? p.difficulty : 'Medium',
      skillSlug: slug,
    });
  }

  return validCodes;
}

/**
 * Generates or retrieves 25 verified questions for a skill section.
 * - Reuses Python 25-question bank for Python.
 * - Checks global questionBank cache first.
 * - If missing, generates with Gemini in 2 batches.
 */
export async function getOrGenerateQuestionsForSkill(
  skill: NormalizedSkill
): Promise<DynamicQuestion[]> {
  const bankKey = `${skill.slug}_${skill.claimedLevel.toLowerCase()}`;

  // 1. Python Special Case: Reuse existing 25 questions
  if (skill.slug === 'python') {
    const pythonQuestions = getPythonQuestionsBank();
    await store.put('question_banks', bankKey, pythonQuestions);
    return pythonQuestions;
  }

  // 2. Global Question Bank Cache Check
  const cached = await store.get<DynamicQuestion[]>('question_banks', bankKey);
  if (cached && Array.isArray(cached) && cached.length >= 25) {
    console.log(`[QuestionBank] Cache hit for ${bankKey} (${cached.length} questions available)`);
    // Return deterministic 25 questions
    return cached.slice(0, 25);
  }

  console.log(`[QuestionBank] Generating questions for ${skill.name} (${skill.claimedLevel})...`);

  const isRunnableLang = Boolean(RUNNABLE_LANGUAGE_MAP[skill.slug] || RUNNABLE_LANGUAGE_MAP[skill.name.toLowerCase()]);
  const compilerLang = RUNNABLE_LANGUAGE_MAP[skill.slug] || RUNNABLE_LANGUAGE_MAP[skill.name.toLowerCase()] || 'python';

  let questions: DynamicQuestion[] = [];

  try {
    if (isRunnableLang) {
      // 15 MCQs + 10 Coding Questions
      console.log(`[QuestionBank] Generating 15 MCQs for ${skill.name}...`);
      const mcqs = await generateMcqBatch(skill.name, skill.claimedLevel, skill.category, 15, 1);

      console.log(`[QuestionBank] Generating 10 Coding problems for ${skill.name}...`);
      const coding = await generateCodingBatch(skill.name, skill.claimedLevel, compilerLang, 10);

      questions = [...mcqs, ...coding];

      // Top-up if some were dropped
      if (questions.length < 25) {
        const needed = 25 - questions.length;
        console.log(`[QuestionBank] Topping up ${needed} questions for ${skill.name}...`);
        const topUp = await generateMcqBatch(skill.name, skill.claimedLevel, skill.category, needed, 2);
        questions.push(...topUp);
      }
    } else {
      // 25 MCQs in two batches (13 + 12)
      console.log(`[QuestionBank] Batch 1 (13 questions) for ${skill.name}...`);
      const batch1 = await generateMcqBatch(skill.name, skill.claimedLevel, skill.category, 13, 1);

      console.log(`[QuestionBank] Batch 2 (12 questions) for ${skill.name}...`);
      const batch2 = await generateMcqBatch(skill.name, skill.claimedLevel, skill.category, 12, 2);

      questions = [...batch1, ...batch2];

      if (questions.length < 25) {
        const needed = 25 - questions.length;
        const topUp = await generateMcqBatch(skill.name, skill.claimedLevel, skill.category, needed, 3);
        questions.push(...topUp);
      }
    }
  } catch (genErr) {
    console.error(`[QuestionBank] Gemini generation failed for ${skill.name}:`, genErr);
    // If Gemini fails, generate emergency deterministic fallback questions so user is never blocked
    questions = generateEmergencyFallbackQuestions(skill);
  }

  // Ensure exactly 25
  if (questions.length < 25) {
    const fallbackTopup = generateEmergencyFallbackQuestions(skill);
    for (const q of fallbackTopup) {
      if (questions.length >= 25) break;
      questions.push(q);
    }
  }

  const final25 = questions.slice(0, 25);
  await store.put('question_banks', bankKey, final25);
  return final25;
}

/**
 * Creates fallback questions in case of API failure so the assessment never crashes.
 */
function generateEmergencyFallbackQuestions(skill: NormalizedSkill): DynamicQuestion[] {
  const list: DynamicQuestion[] = [];
  const slug = skill.slug;

  for (let i = 1; i <= 25; i++) {
    list.push({
      id: `${slug}_fallback_q${i}`,
      type: 'mcq',
      prompt: `Regarding ${skill.name} fundamentals (Level: ${skill.claimedLevel}, Question ${i}): Which approach represents industry best practice for maintainability and correctness?`,
      options: [
        { id: 'A', text: `Option A: Standard idiomatic design pattern in ${skill.name}` },
        { id: 'B', text: `Option B: Legacy or antipattern approach` },
        { id: 'C', text: `Option C: Unchecked edge-case assumption` },
        { id: 'D', text: `Option D: Suboptimal memory complexity` },
      ],
      correctOptionId: 'A',
      explanation: `Idiomatic implementation adhering to ${skill.name} community standards and robust error handling.`,
      difficulty: i <= 8 ? 'Easy' : i <= 18 ? 'Medium' : 'Hard',
      skillSlug: slug,
    });
  }

  return list;
}
