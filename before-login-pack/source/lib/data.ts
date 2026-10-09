export type RoleId = 'backend' | 'frontend' | 'data'

export type SkillMetric = {
  name: string
  current: number
  target: number
}

export type Recommendation = {
  title: string
  detail: string
  skill: string
  duration: string
}

export type Role = {
  id: RoleId
  title: string
  description: string
  skills: string[]
  overall: number
  metrics: SkillMetric[]
  insight: string
  recommendations: Recommendation[]
}

export const student = {
  name: 'Alex Morgan',
  initials: 'AM',
  role: 'Backend Developer',
  score: 82,
  passportId: 'SP-2026-0418',
  lastAssessed: 'Sep 24, 2026',
  location: 'Toronto, Canada',
  education: 'B.Sc. Computer Science, 2026',
}

export const roles: Role[] = [
  {
    id: 'backend',
    title: 'Backend Developer',
    description: 'Design APIs, model data, and build reliable services that scale.',
    skills: ['Python', 'SQL', 'REST APIs', 'Git'],
    overall: 82,
    metrics: [
      { name: 'Python', current: 84, target: 75 },
      { name: 'SQL', current: 61, target: 75 },
      { name: 'REST APIs', current: 52, target: 70 },
      { name: 'Git', current: 81, target: 65 },
      { name: 'Problem Solving', current: 76, target: 80 },
    ],
    insight: 'REST API design is your biggest opportunity for improvement.',
    recommendations: [
      {
        title: 'Design a versioned REST API',
        detail: 'Build pagination, filtering, and consistent error responses for a small service.',
        skill: 'REST APIs',
        duration: '2 weeks',
      },
      {
        title: 'Practice joins and window functions',
        detail: 'Complete 12 query challenges focused on aggregation and ranking.',
        skill: 'SQL',
        duration: '10 days',
      },
      {
        title: 'Timed algorithm sessions',
        detail: 'Three 45-minute sessions a week on hash maps, graphs, and two-pointer patterns.',
        skill: 'Problem Solving',
        duration: '3 weeks',
      },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'Craft accessible, performant interfaces with modern frameworks.',
    skills: ['TypeScript', 'React', 'CSS', 'Accessibility'],
    overall: 74,
    metrics: [
      { name: 'TypeScript', current: 72, target: 75 },
      { name: 'React', current: 78, target: 75 },
      { name: 'CSS', current: 66, target: 70 },
      { name: 'Accessibility', current: 48, target: 70 },
      { name: 'Testing', current: 55, target: 65 },
    ],
    insight: 'Accessibility is your biggest opportunity for improvement.',
    recommendations: [
      {
        title: 'Audit a component library',
        detail: 'Fix keyboard navigation, focus order, and ARIA labelling across five components.',
        skill: 'Accessibility',
        duration: '2 weeks',
      },
      {
        title: 'Write integration tests',
        detail: 'Cover a checkout flow with user-centric tests and mocked network requests.',
        skill: 'Testing',
        duration: '10 days',
      },
      {
        title: 'Build a responsive layout system',
        detail: 'Recreate a dashboard using container queries and fluid type.',
        skill: 'CSS',
        duration: '1 week',
      },
    ],
  },
  {
    id: 'data',
    title: 'Data Analyst',
    description: 'Turn raw data into clear, decision-ready insight for teams.',
    skills: ['SQL', 'Python', 'Statistics', 'Visualization'],
    overall: 69,
    metrics: [
      { name: 'SQL', current: 61, target: 80 },
      { name: 'Python', current: 84, target: 70 },
      { name: 'Statistics', current: 58, target: 75 },
      { name: 'Visualization', current: 71, target: 70 },
      { name: 'Spreadsheets', current: 80, target: 65 },
    ],
    insight: 'Advanced SQL is your biggest opportunity for improvement.',
    recommendations: [
      {
        title: 'Analyze a public dataset end-to-end',
        detail: 'Write CTE-heavy queries and summarize findings in a one-page brief.',
        skill: 'SQL',
        duration: '2 weeks',
      },
      {
        title: 'Hypothesis testing fundamentals',
        detail: 'Run A/B test analyses with confidence intervals and effect sizes.',
        skill: 'Statistics',
        duration: '2 weeks',
      },
      {
        title: 'Rebuild a dashboard for clarity',
        detail: 'Reduce chart noise and annotate the three most important trends.',
        skill: 'Visualization',
        duration: '1 week',
      },
    ],
  },
]

export const getRole = (id: RoleId) => roles.find((r) => r.id === id) ?? roles[0]

export type PassportSkill = {
  name: string
  score: number
  level: 'Advanced' | 'Proficient' | 'Intermediate' | 'Developing'
  status: 'verified' | 'in-progress'
  evidenceCount: number
  evidence: string[]
  lastAssessed: string
}

export const passportSkills: PassportSkill[] = [
  {
    name: 'Python',
    score: 84,
    level: 'Advanced',
    status: 'verified',
    evidenceCount: 4,
    evidence: ['Async job processor challenge', 'Data pipeline project review'],
    lastAssessed: 'Sep 24, 2026',
  },
  {
    name: 'Git',
    score: 81,
    level: 'Advanced',
    status: 'verified',
    evidenceCount: 2,
    evidence: ['Rebase and conflict resolution task', 'Branching strategy assessment'],
    lastAssessed: 'Aug 30, 2026',
  },
  {
    name: 'SQL',
    score: 61,
    level: 'Intermediate',
    status: 'verified',
    evidenceCount: 3,
    evidence: ['Window functions challenge', 'Schema design assessment'],
    lastAssessed: 'Sep 24, 2026',
  },
  {
    name: 'REST APIs',
    score: 52,
    level: 'Developing',
    status: 'verified',
    evidenceCount: 2,
    evidence: ['Paginated endpoint code review', 'HTTP semantics assessment'],
    lastAssessed: 'Sep 12, 2026',
  },
  {
    name: 'Problem Solving',
    score: 76,
    level: 'Proficient',
    status: 'in-progress',
    evidenceCount: 1,
    evidence: ['Algorithms assessment (1 of 2 complete)'],
    lastAssessed: 'Sep 24, 2026',
  },
]

export type EvidenceItem = {
  title: string
  skill: string
  type: 'Practical challenge' | 'Code review' | 'Workflow task' | 'Assessment'
  result: string
  date: string
}

export const evidence: EvidenceItem[] = [
  { title: 'Window functions challenge', skill: 'SQL', type: 'Practical challenge', result: '92%', date: 'Sep 24' },
  { title: 'Paginated REST endpoint', skill: 'REST APIs', type: 'Code review', result: 'Reviewed', date: 'Sep 12' },
  { title: 'Async job processor', skill: 'Python', type: 'Practical challenge', result: '88%', date: 'Sep 08' },
  { title: 'Rebase & conflict resolution', skill: 'Git', type: 'Workflow task', result: 'Passed', date: 'Aug 30' },
]

export type AssessmentRecord = {
  name: string
  date: string
  score: number
  questions: number
  duration: string
  skills: string[]
}

export const assessmentHistory: AssessmentRecord[] = [
  { name: 'Backend Fundamentals', date: 'Sep 24, 2026', score: 82, questions: 24, duration: '38 min', skills: ['Python', 'SQL', 'Problem Solving'] },
  { name: 'API Design Practical', date: 'Sep 12, 2026', score: 52, questions: 8, duration: '52 min', skills: ['REST APIs'] },
  { name: 'Git Workflow', date: 'Aug 30, 2026', score: 81, questions: 12, duration: '21 min', skills: ['Git'] },
  { name: 'Python Core', date: 'Aug 18, 2026', score: 79, questions: 20, duration: '34 min', skills: ['Python'] },
]

export const scoreTrend = [
  { month: 'May', score: 64 },
  { month: 'Jun', score: 68 },
  { month: 'Jul', score: 71 },
  { month: 'Aug', score: 76 },
  { month: 'Sep', score: 80 },
  { month: 'Oct', score: 82 },
]

export const demoQuestion = {
  category: 'Databases · SQL',
  prompt:
    'A query filters a 10M-row orders table by customer_id and sorts by created_at. Which change most improves its performance?',
  options: [
    'Add an index on created_at only',
    'Add a composite index on (customer_id, created_at)',
    'Rewrite the query using SELECT DISTINCT',
    'Increase the LIMIT so fewer pages are requested',
  ],
  correct: 1,
  explanation:
    'A composite index lets the database locate one customer’s rows and read them already sorted, avoiding a full scan and an expensive sort step.',
}

export type Question = {
  category: string
  prompt: string
  code?: string
  options: string[]
  correct: number
  explanation: string
}

export const assessmentQuestions: Question[] = [
  {
    category: 'SQL',
    prompt: 'Which clause filters groups after aggregation has been applied?',
    options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
    correct: 1,
    explanation: 'HAVING filters aggregated groups; WHERE filters individual rows before grouping.',
  },
  {
    category: 'REST APIs',
    prompt:
      'A client retries a request after a network timeout. Which HTTP method is defined as idempotent, so repeating it will not create duplicates?',
    options: ['POST', 'PUT', 'CONNECT', 'None of these'],
    correct: 1,
    explanation: 'PUT replaces the target resource, so repeating the same request produces the same result.',
  },
  {
    category: 'Python',
    prompt: 'What does this expression evaluate to?',
    code: '[x * 2 for x in range(3)]',
    options: ['[2, 4, 6]', '[0, 2, 4]', '[0, 1, 2]', '(0, 2, 4)'],
    correct: 1,
    explanation: 'range(3) yields 0, 1, 2 — each doubled gives [0, 2, 4] as a list.',
  },
  {
    category: 'REST APIs',
    prompt: 'Which status code best fits a successful request that created a new resource?',
    options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
    correct: 1,
    explanation: '201 Created signals a new resource, ideally with a Location header pointing to it.',
  },
  {
    category: 'Git',
    prompt:
      'You need to undo a commit that is already pushed to a shared branch, without rewriting history. What do you use?',
    options: ['git reset --hard', 'git revert', 'git commit --amend', 'git rebase -i'],
    correct: 1,
    explanation: 'git revert creates a new commit that inverses the original, keeping shared history intact.',
  },
  {
    category: 'Problem Solving',
    prompt: 'What is the most time-efficient general approach to detect duplicates in an unsorted array?',
    options: [
      'Compare every pair with nested loops',
      'Sort, then compare neighbours',
      'Track seen values in a hash set',
      'Binary search for each element',
    ],
    correct: 2,
    explanation: 'A hash set gives O(n) expected time, compared with O(n log n) for sorting.',
  },
]
