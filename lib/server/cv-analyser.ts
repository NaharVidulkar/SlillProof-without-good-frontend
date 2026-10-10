/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import { normalizeSkill } from '../domain/skills-taxonomy.ts';
import type {
  NormalizedSkill,
  ClaimedLevel,
  SkillCategory,
} from '../domain/skills-taxonomy.ts';

export interface CvFilePayload {
  fileData?: string; // base64 string
  fileName?: string;
  mimeType?: string;
  textContent?: string;
}

export interface NormalizedCvSkill {
  name: string;
  category: SkillCategory;
  claimedLevel: ClaimedLevel;
  evidence: string;
  slug: string;
}

export interface NormalizedCvAnalysis {
  fieldOrRole: string;
  summary: string;
  skills: NormalizedCvSkill[];
  analyzedAt: string;
  source: 'cv_analyser' | 'gemini_fallback';
}

/**
 * Safely parse JSON from LLMs or APIs, stripping markdown code fences.
 */
export function safeParseJson<T = any>(rawText: string): T {
  let cleaned = (rawText || '').trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  return JSON.parse(cleaned) as T;
}

/**
 * Extracts plain text from DOCX buffer.
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value ? result.value.trim() : '';
}

/**
 * Normalizes any raw skills array into the required structure:
 * - Normalizes aliases (py/python3 -> Python, js -> JavaScript)
 * - Removes duplicates (by slug)
 * - Drops soft skills (category 'soft-or-other' or blacklisted vague traits)
 * - Sorts by evidence strength (skills with evidence first)
 */
export function normalizeAndFilterSkills(rawSkills: any[]): NormalizedCvSkill[] {
  if (!Array.isArray(rawSkills)) return [];

  const seenSlugs = new Set<string>();
  const normalized: NormalizedCvSkill[] = [];

  for (const item of rawSkills) {
    const rawName = typeof item === 'string' ? item : item?.name || item?.skill;
    if (!rawName || typeof rawName !== 'string') continue;

    const rawLevel = item?.claimedLevel || item?.level || 'Intermediate';
    const rawEvidence = item?.evidence || item?.context || item?.details || '';
    const rawCategory = item?.category;

    const norm = normalizeSkill(rawName, rawLevel, rawEvidence, rawCategory);
    if (!norm) continue;

    // Drop soft skills per specification: "drop soft skills"
    if (norm.category === 'soft-or-other') {
      continue;
    }

    if (!seenSlugs.has(norm.slug)) {
      seenSlugs.add(norm.slug);
      normalized.push({
        name: norm.name,
        slug: norm.slug,
        category: norm.category,
        claimedLevel: norm.claimedLevel,
        evidence: rawEvidence ? String(rawEvidence).trim() : 'Evidenced from CV experience',
      });
    }
  }

  // Rank by evidence strength: non-empty specific evidence comes first
  normalized.sort((a, b) => {
    const aHasSpecific = a.evidence && a.evidence !== 'Evidenced from CV experience';
    const bHasSpecific = b.evidence && b.evidence !== 'Evidenced from CV experience';
    if (aHasSpecific && !bHasSpecific) return -1;
    if (!aHasSpecific && bHasSpecific) return 1;
    return 0;
  });

  return normalized;
}

/**
 * Third-party CV Analyser API Adapter.
 *
 * Endpoint & Fields Assumed:
 * Endpoint: process.env.CV_ANALYSER_API_URL || 'https://api.cvanalyser.com/v1/parse'
 * Auth: Authorization: Bearer ${process.env.CV_ANALYSER_API_KEY}
 * Request Body:
 * {
 *   file: base64Data,
 *   filename: fileName,
 *   mimeType: mimeType,
 *   text: plainText
 * }
 * Response Body Assumed (supports both nested data and flat):
 * {
 *   status: 'success' | 'ok',
 *   data?: {
 *     fieldOrRole?: string;
 *     role?: string;
 *     summary?: string;
 *     skills?: Array<{ name: string; category?: string; claimedLevel?: string; evidence?: string }>;
 *     extracted_skills?: Array<any>;
 *     skill_list?: Array<any>;
 *   },
 *   fieldOrRole?: string;
 *   role?: string;
 *   summary?: string;
 *   skills?: Array<any>;
 *   extracted_skills?: Array<any>;
 *   skill_list?: Array<any>;
 * }
 */
export async function callCvAnalyserApi(payload: {
  fileBase64?: string;
  fileName?: string;
  mimeType?: string;
  text?: string;
}): Promise<NormalizedCvAnalysis | null> {
  const apiKey = process.env.CV_ANALYSER_API_KEY?.trim();
  if (!apiKey) {
    console.log('[CV Analyser] CV_ANALYSER_API_KEY not set; using Gemini fallback.');
    return null;
  }

  const endpoint = process.env.CV_ANALYSER_API_URL || 'https://api.cvanalyser.com/v1/parse';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        file: payload.fileBase64,
        filename: payload.fileName || 'cv.pdf',
        mimeType: payload.mimeType || 'application/pdf',
        text: payload.text,
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[CV Analyser] API returned HTTP ${res.status}`);
      return null;
    }

    const raw = await res.json();

    // Log the shape of the raw response (top-level keys, status, number of skills; NEVER log resume text or API keys)
    const rawKeys = Object.keys(raw || {});
    const statusVal = raw?.status ?? raw?.success ?? 'unknown';
    const container = raw?.data || raw;
    const rawSkillsList =
      container?.skills ||
      container?.extracted_skills ||
      container?.skill_list ||
      raw?.skills ||
      raw?.extracted_skills ||
      [];
    const skillsCount = Array.isArray(rawSkillsList) ? rawSkillsList.length : 0;

    console.log(
      `[CV Analyser] Raw response shape: keys=[${rawKeys.join(', ')}], status=${statusVal}, skillsCount=${skillsCount}`
    );

    const normalizedSkills = normalizeAndFilterSkills(rawSkillsList);
    if (normalizedSkills.length === 0) {
      console.warn('[CV Analyser] 0 usable technical skills extracted from CV Analyser response');
      return null;
    }

    const fieldOrRole =
      container?.fieldOrRole ||
      container?.role ||
      raw?.fieldOrRole ||
      raw?.role ||
      'Software Developer';

    const summary =
      container?.summary ||
      raw?.summary ||
      'Structured technical profile extracted from candidate CV.';

    return {
      fieldOrRole,
      summary,
      skills: normalizedSkills,
      analyzedAt: new Date().toISOString(),
      source: 'cv_analyser',
    };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn('[CV Analyser] Request timed out after 30 seconds');
    } else {
      console.warn('[CV Analyser] Error calling CV Analyser API:', err?.message || err);
    }
    return null;
  }
}

/**
 * Extracts CV skills using Gemini with the platform resume prompt.
 */
export async function extractCvWithGemini(payload: {
  fileBase64?: string;
  fileName?: string;
  mimeType?: string;
  textContent?: string;
}): Promise<NormalizedCvAnalysis> {
  const systemInstruction = `You are an expert technical talent assessor on the SkillProof verification platform.
Analyze the provided resume document or text.
Extract:
1. "fieldOrRole": The candidate's primary job title or technical field (e.g. "Frontend Engineer", "Full Stack Developer", "Data Engineer").
2. "summary": A concise 1-2 sentence executive summary of the candidate's core technical expertise.
3. "skills": An array of prominent, verifiable technical skills.
For each skill:
- "name": Clean canonical title (e.g. "Python", "React", "TypeScript", "PostgreSQL", "Docker").
- "category": EXACTLY one of: "programming" | "framework" | "database" | "tool".
- "claimedLevel": EXACTLY one of: "Beginner" | "Intermediate" | "Advanced".
- "evidence": A short phrase from the resume showing where or how the skill was demonstrated.

DO NOT extract soft skills (e.g. "teamwork", "leadership", "communication", "hardworking", "problem solving").

Respond STRICTLY with valid JSON following this schema:
{
  "fieldOrRole": string,
  "summary": string,
  "skills": [
    {
      "name": string,
      "category": "programming" | "framework" | "database" | "tool",
      "claimedLevel": "Beginner" | "Intermediate" | "Advanced",
      "evidence": string
    }
  ]
}`;

  let contents: any;
  if (payload.fileBase64 && (payload.mimeType === 'application/pdf' || payload.fileName?.toLowerCase().endsWith('.pdf'))) {
    contents = {
      parts: [
        {
          inlineData: {
            data: payload.fileBase64,
            mimeType: 'application/pdf',
          },
        },
        {
          text: `Please analyze this resume (${payload.fileName || 'resume.pdf'}) and extract structured role, summary, and technical skills.`,
        },
      ],
    };
  } else {
    const rawText = payload.textContent || '';
    contents = `Candidate Resume Content:\n${rawText.slice(0, 30000)}\n\nPlease extract structured fieldOrRole, summary, and technical skills.`;
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let responseText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });
    responseText = response.text || '{}';
  } catch (err: any) {
    console.warn('[Gemini Extraction] Primary model error; trying gemini-3.8-flash:', err?.message?.slice(0, 100));
    const fallbackResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });
    responseText = fallbackResponse.text || '{}';
  }

  const parsed = safeParseJson<any>(responseText);

  // Log raw Gemini shape (keys, status, skill count)
  const rawKeys = Object.keys(parsed || {});
  const rawSkills = Array.isArray(parsed?.skills)
    ? parsed.skills
    : Array.isArray(parsed?.extracted_skills)
    ? parsed.extracted_skills
    : Array.isArray(parsed?.skill_list)
    ? parsed.skill_list
    : Array.isArray(parsed?.technical_skills)
    ? parsed.technical_skills
    : [];

  console.log(
    `[Gemini Extraction] Raw response shape: keys=[${rawKeys.join(', ')}], status=success, skillsCount=${rawSkills.length}`
  );

  const normalizedSkills = normalizeAndFilterSkills(rawSkills);

  return {
    fieldOrRole: parsed?.fieldOrRole || parsed?.role || 'Software Developer',
    summary: parsed?.summary || 'Extracted technical profile from candidate resume.',
    skills: normalizedSkills,
    analyzedAt: new Date().toISOString(),
    source: 'gemini_fallback',
  };
}

/**
 * Top-level analyseCv pipeline:
 * 1. Checks CV Analyser API if configured
 * 2. Falls back to Gemini with 30s timeout and safe parsing
 * 3. Logs path used to server logs only
 */
export async function analyseCv(payload: CvFilePayload): Promise<NormalizedCvAnalysis> {
  // Validate empty input
  if (!payload.fileData && (!payload.textContent || !payload.textContent.trim())) {
    throw new Error('Empty file or text content provided. Please upload a valid CV document.');
  }

  // 1. If DOCX, extract text with mammoth
  let extractedDocxText = '';
  const isDocx =
    payload.fileName?.toLowerCase().endsWith('.docx') ||
    payload.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (payload.fileData && isDocx) {
    try {
      const buffer = Buffer.from(payload.fileData, 'base64');
      extractedDocxText = await extractTextFromDocx(buffer);
      if (!extractedDocxText) {
        throw new Error('Empty DOCX document');
      }
    } catch (docxErr: any) {
      console.warn('[Docx Extraction] Mammoth text extraction error:', docxErr?.message || docxErr);
    }
  }

  const effectiveText = extractedDocxText || payload.textContent || '';
  if (!payload.fileData && !effectiveText.trim()) {
    throw new Error('No readable text found in document. Please upload a valid CV.');
  }

  // 2. Try third-party CV Analyser
  let result: NormalizedCvAnalysis | null = null;
  try {
    result = await callCvAnalyserApi({
      fileBase64: payload.fileData,
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      text: effectiveText,
    });
  } catch (err) {
    console.warn('[CV Analyser] Primary analyser call error:', err);
    result = null;
  }

  if (result && result.skills.length > 0) {
    console.log(`[CV Analyser] Path used: CV_ANALYSER_API (detected ${result.skills.length} technical skills)`);
    return result;
  }

  // 3. Fallback: Gemini extraction
  console.log('[CV Analyser] Falling back to Gemini resume extraction...');
  try {
    result = await extractCvWithGemini({
      fileBase64: isDocx ? undefined : payload.fileData,
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      textContent: effectiveText || (payload.fileData ? Buffer.from(payload.fileData, 'base64').toString('utf-8') : ''),
    });
    console.log(`[CV Analyser] Path used: GEMINI_FALLBACK (detected ${result.skills.length} technical skills)`);
    return result;
  } catch (geminiErr: any) {
    console.error('[CV Analyser] Both primary analyser and Gemini fallback failed:', geminiErr);
    throw new Error('Failed to analyze CV. Please try again or enter your skills manually.');
  }
}
