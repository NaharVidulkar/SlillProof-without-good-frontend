/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

/**
 * Concurrency limiter and queue for server-side Gemini calls.
 * Ensures max 3 concurrent calls, 30s timeout per call, and exponential backoff for 429/5xx.
 */
class GeminiQueue {
  private maxConcurrent = 3;
  private currentRunning = 0;
  private queue: Array<() => void> = [];

  // Per-user daily rate limits: uid -> counts and timestamps
  private userRateLimits = new Map<
    string,
    {
      resumeParses: { count: number; day: string };
      sectionGenerations: { count: number; day: string };
      skillLastAttempt: Map<string, number>; // skillSlug -> timestamp
    }
  >();

  private getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private getUserLimits(uid: string) {
    const today = this.getTodayString();
    let record = this.userRateLimits.get(uid);
    if (!record) {
      record = {
        resumeParses: { count: 0, day: today },
        sectionGenerations: { count: 0, day: today },
        skillLastAttempt: new Map(),
      };
      this.userRateLimits.set(uid, record);
    }
    if (record.resumeParses.day !== today) {
      record.resumeParses = { count: 0, day: today };
    }
    if (record.sectionGenerations.day !== today) {
      record.sectionGenerations = { count: 0, day: today };
    }
    return record;
  }

  /**
   * Checks if user has exceeded resume parse rate limit (max 3 per day).
   */
  canParseResume(uid: string): { allowed: boolean; remaining: number } {
    const limits = this.getUserLimits(uid);
    const max = 3;
    if (limits.resumeParses.count >= max) {
      return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: max - limits.resumeParses.count };
  }

  recordResumeParse(uid: string): void {
    const limits = this.getUserLimits(uid);
    limits.resumeParses.count++;
  }

  /**
   * Checks if user has exceeded section generation rate limit (max 8 per day).
   */
  canGenerateSection(uid: string): { allowed: boolean; remaining: number } {
    const limits = this.getUserLimits(uid);
    const max = 8;
    if (limits.sectionGenerations.count >= max) {
      return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: max - limits.sectionGenerations.count };
  }

  recordSectionGeneration(uid: string): void {
    const limits = this.getUserLimits(uid);
    limits.sectionGenerations.count++;
  }

  /**
   * Checks 24-hour retake cooldown for a skill.
   */
  canRetakeSkill(uid: string, skillSlug: string): { allowed: boolean; hoursRemaining?: number } {
    const limits = this.getUserLimits(uid);
    const lastTime = limits.skillLastAttempt.get(skillSlug);
    if (!lastTime) return { allowed: true };

    const hoursPassed = (Date.now() - lastTime) / (1000 * 60 * 60);
    if (hoursPassed < 24) {
      return {
        allowed: false,
        hoursRemaining: Math.ceil(24 - hoursPassed),
      };
    }
    return { allowed: true };
  }

  recordSkillAttempt(uid: string, skillSlug: string): void {
    const limits = this.getUserLimits(uid);
    limits.skillLastAttempt.set(skillSlug, Date.now());
  }

  /**
   * Enqueues a task and executes with concurrency limiting, 30s timeout, and exponential backoff.
   */
  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    if (this.currentRunning >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.currentRunning++;
    try {
      return await this.executeWithBackoff(fn);
    } finally {
      this.currentRunning--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next?.();
      }
    }
  }

  private async executeWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
    const maxRetries = 2;
    let delayMs = 1000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Enforce 30s timeout per attempt
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Gemini API call timed out after 30 seconds')), 30000);
        });

        return await Promise.race([fn(), timeoutPromise]);
      } catch (err: any) {
        const isRateLimitOrServer =
          err?.status === 429 ||
          err?.status >= 500 ||
          err?.message?.includes('429') ||
          err?.message?.includes('high demand') ||
          err?.message?.includes('503');

        if (isRateLimitOrServer && attempt < maxRetries) {
          console.warn(`[GeminiQueue] Transient error (attempt ${attempt + 1}/${maxRetries}), backing off ${delayMs}ms:`, err?.message);
          await new Promise((res) => setTimeout(res, delayMs));
          delayMs *= 2;
          continue;
        }

        throw err;
      }
    }

    throw new Error('Gemini queue maximum retries exceeded');
  }
}

export const geminiQueue = new GeminiQueue();

export function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}
