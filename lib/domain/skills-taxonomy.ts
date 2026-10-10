/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SkillCategory = 'programming' | 'framework' | 'database' | 'tool' | 'soft-or-other';
export type ClaimedLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface NormalizedSkill {
  name: string;
  slug: string;
  category: SkillCategory;
  claimedLevel: ClaimedLevel;
  evidence?: string;
  isRunnable: boolean;
  compilerLanguage?: string;
}

// Maps compiler-supported languages to compiler IDs
export const RUNNABLE_LANGUAGE_MAP: Record<string, string> = {
  python: 'python',
  java: 'java',
  javascript: 'javascript',
  typescript: 'javascript',
  'c++': 'cpp',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  ruby: 'ruby',
  php: 'php',
};

// Vague or non-technical traits to ignore
export const BLACKLISTED_VAGUE_TRAITS = new Set([
  'hardworking',
  'hard worker',
  'punctual',
  'punctuality',
  'team player',
  'teamwork',
  'communication',
  'leadership',
  'fast learner',
  'quick learner',
  'problem solver',
  'problem solving',
  'detail oriented',
  'enthusiastic',
  'motivated',
  'self motivated',
  'self-motivated',
  'passion',
  'passionate',
  'responsible',
  'critical thinking',
  'adaptability',
  'adaptable',
  'time management',
  'interpersonal skills',
  'work ethic',
  'good listener',
  'multitasking',
  'creative thinking',
]);

// Normalization alias dictionary
export const SKILL_ALIAS_MAP: Record<string, { canonical: string; category: SkillCategory }> = {
  // Programming languages
  python: { canonical: 'Python', category: 'programming' },
  py: { canonical: 'Python', category: 'programming' },
  python3: { canonical: 'Python', category: 'programming' },
  py3: { canonical: 'Python', category: 'programming' },
  javascript: { canonical: 'JavaScript', category: 'programming' },
  js: { canonical: 'JavaScript', category: 'programming' },
  es6: { canonical: 'JavaScript', category: 'programming' },
  ecmascript: { canonical: 'JavaScript', category: 'programming' },
  typescript: { canonical: 'TypeScript', category: 'programming' },
  ts: { canonical: 'TypeScript', category: 'programming' },
  java: { canonical: 'Java', category: 'programming' },
  jdk: { canonical: 'Java', category: 'programming' },
  'core java': { canonical: 'Java', category: 'programming' },
  'c++': { canonical: 'C++', category: 'programming' },
  cpp: { canonical: 'C++', category: 'programming' },
  'c plus plus': { canonical: 'C++', category: 'programming' },
  c: { canonical: 'C', category: 'programming' },
  'c lang': { canonical: 'C', category: 'programming' },
  'c#': { canonical: 'C#', category: 'programming' },
  csharp: { canonical: 'C#', category: 'programming' },
  'c-sharp': { canonical: 'C#', category: 'programming' },
  golang: { canonical: 'Go', category: 'programming' },
  go: { canonical: 'Go', category: 'programming' },
  rust: { canonical: 'Rust', category: 'programming' },
  rustlang: { canonical: 'Rust', category: 'programming' },
  ruby: { canonical: 'Ruby', category: 'programming' },
  php: { canonical: 'PHP', category: 'programming' },

  // Frameworks & Libraries
  react: { canonical: 'React', category: 'framework' },
  reactjs: { canonical: 'React', category: 'framework' },
  'react.js': { canonical: 'React', category: 'framework' },
  'react native': { canonical: 'React Native', category: 'framework' },
  node: { canonical: 'Node.js', category: 'framework' },
  nodejs: { canonical: 'Node.js', category: 'framework' },
  'node.js': { canonical: 'Node.js', category: 'framework' },
  nextjs: { canonical: 'Next.js', category: 'framework' },
  'next.js': { canonical: 'Next.js', category: 'framework' },
  vue: { canonical: 'Vue', category: 'framework' },
  vuejs: { canonical: 'Vue', category: 'framework' },
  'vue.js': { canonical: 'Vue', category: 'framework' },
  angular: { canonical: 'Angular', category: 'framework' },
  angularjs: { canonical: 'Angular', category: 'framework' },
  django: { canonical: 'Django', category: 'framework' },
  flask: { canonical: 'Flask', category: 'framework' },
  fastapi: { canonical: 'FastAPI', category: 'framework' },
  spring: { canonical: 'Spring Boot', category: 'framework' },
  'spring boot': { canonical: 'Spring Boot', category: 'framework' },
  express: { canonical: 'Express.js', category: 'framework' },
  expressjs: { canonical: 'Express.js', category: 'framework' },

  // Databases
  sql: { canonical: 'SQL', category: 'database' },
  postgresql: { canonical: 'PostgreSQL', category: 'database' },
  postgres: { canonical: 'PostgreSQL', category: 'database' },
  mysql: { canonical: 'MySQL', category: 'database' },
  sqlite: { canonical: 'SQLite', category: 'database' },
  mongodb: { canonical: 'MongoDB', category: 'database' },
  mongo: { canonical: 'MongoDB', category: 'database' },
  nosql: { canonical: 'NoSQL', category: 'database' },
  redis: { canonical: 'Redis', category: 'database' },

  // Tools & Platforms
  docker: { canonical: 'Docker', category: 'tool' },
  kubernetes: { canonical: 'Kubernetes', category: 'tool' },
  k8s: { canonical: 'Kubernetes', category: 'tool' },
  git: { canonical: 'Git', category: 'tool' },
  github: { canonical: 'Git', category: 'tool' },
  aws: { canonical: 'AWS', category: 'tool' },
  azure: { canonical: 'Azure', category: 'tool' },
  gcp: { canonical: 'GCP', category: 'tool' },
  linux: { canonical: 'Linux', category: 'tool' },
  bash: { canonical: 'Bash', category: 'tool' },
  excel: { canonical: 'Excel', category: 'tool' },
  'ms excel': { canonical: 'Excel', category: 'tool' },
  'microsoft excel': { canonical: 'Excel', category: 'tool' },
  tableau: { canonical: 'Tableau', category: 'tool' },
  'power bi': { canonical: 'Power BI', category: 'tool' },
  powerbi: { canonical: 'Power BI', category: 'tool' },
};

/**
 * Normalizes a raw skill name into canonical form, category, and runnable capability.
 * Returns null if the skill is blacklisted or invalid.
 */
export function normalizeSkill(
  rawName: string,
  claimedLevel: string = 'Intermediate',
  rawEvidence?: string,
  rawCategory?: string
): NormalizedSkill | null {
  const cleaned = rawName.trim().replace(/^[-•*#\d.]+\s*/, '');
  if (!cleaned || cleaned.length < 2) return null;

  const lower = cleaned.toLowerCase();
  if (BLACKLISTED_VAGUE_TRAITS.has(lower)) {
    return null;
  }

  // Check alias map
  let canonicalName = cleaned;
  let category: SkillCategory = 'soft-or-other';

  if (SKILL_ALIAS_MAP[lower]) {
    canonicalName = SKILL_ALIAS_MAP[lower].canonical;
    category = SKILL_ALIAS_MAP[lower].category;
  } else {
    // Basic title case
    canonicalName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (rawCategory && ['programming', 'framework', 'database', 'tool', 'soft-or-other'].includes(rawCategory)) {
      category = rawCategory as SkillCategory;
    }
  }

  const slug = canonicalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug) return null;

  // Level validation
  const validLevels: ClaimedLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
  const normalizedLevel = validLevels.includes(claimedLevel as ClaimedLevel)
    ? (claimedLevel as ClaimedLevel)
    : 'Intermediate';

  const isRunnable = Boolean(RUNNABLE_LANGUAGE_MAP[canonicalName.toLowerCase()]);
  const compilerLanguage = isRunnable ? RUNNABLE_LANGUAGE_MAP[canonicalName.toLowerCase()] : undefined;

  return {
    name: canonicalName,
    slug,
    category,
    claimedLevel: normalizedLevel,
    evidence: rawEvidence ? String(rawEvidence).trim() : undefined,
    isRunnable,
    compilerLanguage,
  };
}

/**
 * Normalizes an array of skills, removes duplicates, and caps at maxCount.
 */
export function normalizeSkillList(
  skills: Array<{ name: string; category?: string; claimedLevel?: string; level?: string; evidence?: string }>,
  maxCount: number = 6
): { activeSkills: NormalizedSkill[]; laterSkills: NormalizedSkill[] } {
  const seenSlugs = new Set<string>();
  const allNormalized: NormalizedSkill[] = [];

  for (const item of skills) {
    const rawLevel = item.claimedLevel || item.level || 'Intermediate';
    const norm = normalizeSkill(item.name, rawLevel, item.evidence, item.category);
    if (norm && !seenSlugs.has(norm.slug)) {
      seenSlugs.add(norm.slug);
      allNormalized.push(norm);
    }
  }

  return {
    activeSkills: allNormalized.slice(0, maxCount),
    laterSkills: allNormalized.slice(maxCount),
  };
}
