/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SupportedLanguage } from '../types.ts';

interface CompilerInfo {
  id: string;
  name: string;
  language?: string;
  version?: string;
}

let cachedCompilers: CompilerInfo[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

export const LANGUAGE_ENTRY_RULES = {
  python: {
    entryRule: 'Standard script execution with stdin. Use `sys.stdin.read()` or input loops.',
    defaultCompilerId: 'python-3.14',
  },
  java: {
    entryRule: 'The primary entry class must be named `public class Main` containing `public static void main(String[] args)`.',
    defaultCompilerId: 'openjdk-25',
  },
  cpp: {
    entryRule: 'The code must contain a standard `int main()` entry point. Compiled with g++.',
    defaultCompilerId: 'g++-15',
  },
};

export async function fetchSupportedCompilers(): Promise<CompilerInfo[]> {
  const now = Date.now();
  if (cachedCompilers && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedCompilers;
  }

  const apiKey = process.env.ONLINECOMPILER_API_KEY?.trim();

  try {
    const headers: Record<string, string> = {};
    if (apiKey && apiKey !== 'MY_ONLINECOMPILER_API_KEY') {
      headers['Authorization'] = apiKey;
    }

    const res = await fetch('https://api.onlinecompiler.io/api/compilers/', {
      headers,
    });

    if (res.ok) {
      const data = (await res.json()) as { compilers?: CompilerInfo[] } | CompilerInfo[];
      const list = Array.isArray(data) ? data : data.compilers;
      if (Array.isArray(list) && list.length > 0) {
        cachedCompilers = list;
        cacheTimestamp = now;
        return list;
      }
    }
  } catch (err) {
    console.warn('Could not fetch compilers from onlinecompiler.io, using default mapping:', err);
  }

  const fallback = [
    { id: 'python-3.14', name: 'Python 3.14' },
    { id: 'openjdk-25', name: 'OpenJDK 25' },
    { id: 'g++-15', name: 'G++ 15' },
  ];
  cachedCompilers = fallback;
  cacheTimestamp = now;
  return fallback;
}

export async function getCompilerIdForLanguage(lang: SupportedLanguage): Promise<string> {
  const compilers = await fetchSupportedCompilers();
  const lower = lang.toLowerCase();

  if (lower === 'python') {
    const found = compilers.find((c) => c.id.toLowerCase().includes('python'));
    if (found) return found.id;
    return 'python-3.14';
  }

  if (lower === 'java') {
    const found = compilers.find(
      (c) => c.id.toLowerCase().includes('openjdk') || c.id.toLowerCase().includes('java')
    );
    if (found) return found.id;
    return 'openjdk-25';
  }

  if (lower === 'cpp') {
    const found = compilers.find(
      (c) => c.id.toLowerCase().includes('g++') || c.id.toLowerCase().includes('cpp')
    );
    if (found) return found.id;
    return 'g++-15';
  }

  return LANGUAGE_ENTRY_RULES[lang].defaultCompilerId;
}
