/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SkillCategory = 'programming' | 'framework' | 'database' | 'tool' | 'soft-or-other';

export interface NormalizedSkill {
  name: string;
  slug: string;
  category: SkillCategory;
  runnableLanguage: string | null; // e.g. 'python', 'java', 'node', 'cpp', null if not runnable
}

const ALIAS_MAP: Record<string, { name: string; category: SkillCategory; runnableLanguage: string | null }> = {
  // Programming languages
  python: { name: 'Python', category: 'programming', runnableLanguage: 'python' },
  py: { name: 'Python', category: 'programming', runnableLanguage: 'python' },
  python3: { name: 'Python', category: 'programming', runnableLanguage: 'python' },
  'python 3': { name: 'Python', category: 'programming', runnableLanguage: 'python' },
  
  javascript: { name: 'JavaScript', category: 'programming', runnableLanguage: 'node' },
  js: { name: 'JavaScript', category: 'programming', runnableLanguage: 'node' },
  es6: { name: 'JavaScript', category: 'programming', runnableLanguage: 'node' },
  node: { name: 'JavaScript', category: 'programming', runnableLanguage: 'node' },
  nodejs: { name: 'JavaScript', category: 'programming', runnableLanguage: 'node' },
  'node.js': { name: 'JavaScript', category: 'programming', runnableLanguage: 'node' },

  typescript: { name: 'TypeScript', category: 'programming', runnableLanguage: 'node' },
  ts: { name: 'TypeScript', category: 'programming', runnableLanguage: 'node' },

  java: { name: 'Java', category: 'programming', runnableLanguage: 'java' },
  openjdk: { name: 'Java', category: 'programming', runnableLanguage: 'java' },
  jdk: { name: 'Java', category: 'programming', runnableLanguage: 'java' },

  cpp: { name: 'C++', category: 'programming', runnableLanguage: 'cpp' },
  'c++': { name: 'C++', category: 'programming', runnableLanguage: 'cpp' },
  cplusplus: { name: 'C++', category: 'programming', runnableLanguage: 'cpp' },

  c: { name: 'C', category: 'programming', runnableLanguage: 'c' },
  gcc: { name: 'C', category: 'programming', runnableLanguage: 'c' },

  csharp: { name: 'C#', category: 'programming', runnableLanguage: 'csharp' },
  'c#': { name: 'C#', category: 'programming', runnableLanguage: 'csharp' },
  dotnet: { name: 'C#', category: 'programming', runnableLanguage: 'csharp' },
  '.net': { name: 'C#', category: 'programming', runnableLanguage: 'csharp' },

  go: { name: 'Go', category: 'programming', runnableLanguage: 'golang' },
  golang: { name: 'Go', category: 'programming', runnableLanguage: 'golang' },

  rust: { name: 'Rust', category: 'programming', runnableLanguage: 'rust' },
  ruby: { name: 'Ruby', category: 'programming', runnableLanguage: 'ruby' },
  php: { name: 'PHP', category: 'programming', runnableLanguage: 'php' },

  // Databases
  sql: { name: 'SQL', category: 'database', runnableLanguage: null },
  mysql: { name: 'MySQL', category: 'database', runnableLanguage: null },
  postgresql: { name: 'PostgreSQL', category: 'database', runnableLanguage: null },
  postgres: { name: 'PostgreSQL', category: 'database', runnableLanguage: null },
  sqlite: { name: 'SQLite', category: 'database', runnableLanguage: null },
  mongodb: { name: 'MongoDB', category: 'database', runnableLanguage: null },
  mongo: { name: 'MongoDB', category: 'database', runnableLanguage: null },
  redis: { name: 'Redis', category: 'database', runnableLanguage: null },

  // Frameworks
  react: { name: 'React', category: 'framework', runnableLanguage: null },
  reactjs: { name: 'React', category: 'framework', runnableLanguage: null },
  'react.js': { name: 'React', category: 'framework', runnableLanguage: null },
  angular: { name: 'Angular', category: 'framework', runnableLanguage: null },
  vue: { name: 'Vue', category: 'framework', runnableLanguage: null },
  vuejs: { name: 'Vue', category: 'framework', runnableLanguage: null },
  nextjs: { name: 'Next.js', category: 'framework', runnableLanguage: null },
  'next.js': { name: 'Next.js', category: 'framework', runnableLanguage: null },
  express: { name: 'Express', category: 'framework', runnableLanguage: null },
  expressjs: { name: 'Express', category: 'framework', runnableLanguage: null },
  spring: { name: 'Spring Boot', category: 'framework', runnableLanguage: null },
  'spring boot': { name: 'Spring Boot', category: 'framework', runnableLanguage: null },
  django: { name: 'Django', category: 'framework', runnableLanguage: null },
  fastapi: { name: 'FastAPI', category: 'framework', runnableLanguage: null },
  flask: { name: 'Flask', category: 'framework', runnableLanguage: null },

  // Tools & Platforms
  docker: { name: 'Docker', category: 'tool', runnableLanguage: null },
  kubernetes: { name: 'Kubernetes', category: 'tool', runnableLanguage: null },
  k8s: { name: 'Kubernetes', category: 'tool', runnableLanguage: null },
  git: { name: 'Git', category: 'tool', runnableLanguage: null },
  github: { name: 'Git', category: 'tool', runnableLanguage: null },
  aws: { name: 'AWS', category: 'tool', runnableLanguage: null },
  azure: { name: 'Azure', category: 'tool', runnableLanguage: null },
  gcp: { name: 'GCP', category: 'tool', runnableLanguage: null },
  excel: { name: 'Excel', category: 'tool', runnableLanguage: null },
  'microsoft excel': { name: 'Excel', category: 'tool', runnableLanguage: null },
  linux: { name: 'Linux', category: 'tool', runnableLanguage: null },
  bash: { name: 'Linux', category: 'tool', runnableLanguage: null },
  'data structures': { name: 'Data Structures', category: 'tool', runnableLanguage: null },
  dsa: { name: 'Data Structures', category: 'tool', runnableLanguage: null },
  algorithms: { name: 'Algorithms', category: 'tool', runnableLanguage: null },
};

// Vague non-technical buzzwords to drop
const IGNORED_NON_SKILLS = new Set([
  'hardworking',
  'hard working',
  'motivated',
  'self-motivated',
  'communication',
  'teamwork',
  'team player',
  'leadership',
  'quick learner',
  'fast learner',
  'punctual',
  'punctuality',
  'problem solving',
  'critical thinking',
  'multitasking',
  'dedicated',
  'enthusiastic',
  'creative',
  'detail oriented',
  'detail-oriented',
  'passionate',
]);

/**
 * Normalizes a raw skill name:
 * - Checks alias map
 * - Ignores vague non-skills
 * - Resolves category and compiler runnable language
 */
export function normalizeSkill(rawName: string): NormalizedSkill | null {
  if (!rawName || typeof rawName !== 'string') return null;
  const clean = rawName.trim();
  const lower = clean.toLowerCase();

  if (IGNORED_NON_SKILLS.has(lower)) {
    return null;
  }

  if (ALIAS_MAP[lower]) {
    const item = ALIAS_MAP[lower];
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
      name: item.name,
      slug,
      category: item.category,
      runnableLanguage: item.runnableLanguage,
    };
  }

  // Deduce generic category
  let category: SkillCategory = 'tool';
  let runnable: string | null = null;

  if (lower.includes('sql') || lower.includes('database') || lower.includes('db')) {
    category = 'database';
  } else if (lower.includes('framework') || lower.includes('react') || lower.includes('vue') || lower.includes('angular')) {
    category = 'framework';
  } else if (lower.includes('script') || lower.includes('lang') || lower.includes('programming')) {
    category = 'programming';
  }

  // Capitalize properly
  const formattedName = clean
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const slug = formattedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    name: formattedName,
    slug,
    category,
    runnableLanguage: runnable,
  };
}
