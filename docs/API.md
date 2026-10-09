# SkillProof API Reference

All backend API routes return standard JSON responses and error messages formatted as `{ "error": string }` on non-2xx HTTP codes.

---

## 1. Health & Environment Check (Stage 0 — Temporary)

**Endpoint:** `GET /api/health/env`

**Description:**
Returns a security-safe boolean map indicating whether required environment variables are configured. It NEVER returns the actual secret values.
> ⚠️ **Notice**: This endpoint is temporary for staging verification. Remember to remove or secure before final production deployment.

**Request:**
- Method: `GET`
- Headers: None required
- Body: None

**Response (200 OK):**
```json
{
  "ONLINECOMPILER_API_KEY_CONFIGURED": false,
  "GEMINI_API_KEY_CONFIGURED": true,
  "APP_URL_CONFIGURED": false,
  "_warning": "Temporary diagnostic endpoint. Remove before production deployment."
}
```

---

## 2. Problem Challenges (Stage 1)

### `GET /api/problems`
**Description:** Returns the catalog of all available coding challenges in their public format (`PublicProblem[]`). **Hidden tests and answer keys are strictly omitted from the response.**

**Request:**
- Method: `GET`
- Body: None

**Response (200 OK):**
```json
[
  {
    "id": "student-registry",
    "title": "Student Registry",
    "difficulty": "Easy",
    "points": 100,
    "skills": ["data-structures", "state-management", "validation", "rest-semantics"],
    "timeEstimateMin": 25,
    "description": "You are building an in-memory student registry...",
    "constraints": ["1 <= N <= 100", "..."],
    "examples": [
      {
        "input": "6\nCREATE Alice 20\n...",
        "output": "201 1\n...",
        "note": "..."
      }
    ],
    "starterCode": {
      "python": "import sys\n...",
      "java": "public class Main {\n...",
      "cpp": "#include <iostream>\n..."
    },
    "visibleTests": [
      {
        "input": "6\nCREATE Alice 20\n...",
        "expected": "201 1\n..."
      }
    ],
    "timeLimitMs": 3000,
    "memoryLimitKb": 65536
  }
]
```

### `GET /api/problems/:id`
**Description:** Returns full public specifications for a specific problem. Returns 404 if not found. **Hidden tests remain protected on the server.**

**Request:**
- Method: `GET`
- URL Param: `id` (e.g. `student-registry`, `access-log-summary`, `rate-limiter`, `payload-validator`)

**Response (200 OK):**
```json
{
  "id": "student-registry",
  "title": "Student Registry",
  "difficulty": "Easy",
  "points": 100,
  "skills": ["data-structures", "state-management", "validation", "rest-semantics"],
  "timeEstimateMin": 25,
  "description": "...",
  "constraints": ["..."],
  "examples": [...],
  "starterCode": {...},
  "visibleTests": [...],
  "timeLimitMs": 3000,
  "memoryLimitKb": 65536
}
```

**Response (404 Not Found):**
```json
{
  "error": "Problem with ID 'non-existent' not found"
}
```

---

## 3. Code Execution & Testing (Stage 2)

### `POST /api/run`
**Description:** Executes student code against visible test cases or custom input one at a time via `onlinecompiler.io`.

**Request:**
```json
{
  "problemId": "student-registry",
  "language": "python",
  "code": "import sys\n...",
  "customInput": "optional custom stdin string"
}
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "index": 1,
      "input": "6\nCREATE Alice 20\n...",
      "expected": "201 1\n...",
      "output": "201 1\n...",
      "exitCode": 0,
      "timeSec": 0.05,
      "memoryKb": 1024,
      "verdict": "Passed"
    }
  ],
  "custom": false
}
```

---

## 4. Submissions & Dual Evaluation (Stage 3 & 4)

### `POST /api/submit`
**Description:** Asynchronously runs code against all visible and hidden test cases, applies the deterministic correctness formula, prompts Gemini for structured qualitative review (bounded by the combiner), and writes verified skill evidence.

**Request:**
```json
{
  "problemId": "student-registry",
  "language": "python",
  "code": "import sys\n..."
}
```

**Response (200 OK):**
```json
{
  "submissionId": "sub_1728389100_abc12"
}
```

### `GET /api/submissions/:id`
**Description:** Retrieves full submission evaluation. Visible tests include inputs/outputs; hidden tests return only `{ index, verdict, category }` to protect hidden test integrity.

**Response (200 OK):**
```json
{
  "id": "sub_1728389100_abc12",
  "problemId": "student-registry",
  "status": "completed",
  "deterministic": {
    "compiled": true,
    "visiblePassed": 3,
    "visibleTotal": 3,
    "hiddenPassed": 7,
    "hiddenTotal": 7,
    "maxTimeMs": 85,
    "maxMemoryKb": 2048,
    "correctness": 100
  },
  "visibleTestResults": [...],
  "hiddenTestResults": [
    {
      "index": 1,
      "verdict": "Passed",
      "category": "basic"
    }
  ],
  "aiReview": {
    "codeQuality": 88,
    "problemSolving": 92,
    "testing": 85,
    "security": 90,
    "strengths": [{"text": "Efficient dictionary lookups", "lines": [12, 14]}],
    "weaknesses": [],
    "recommendations": ["Consider type annotations"]
  },
  "overallScore": 95,
  "needsReview": false
}
```

---

## 5. Skills Matrix & Dashboard (Stage 5)

### `GET /api/me/skills`
**Description:** Returns computed skill metrics (`SkillMetric[]`) using the Bayesian proficiency formula, confidence bands (Low/Medium/High), and tiers (Claimed/Assessed/Demonstrated).

### `GET /api/me/dashboard`
**Description:** Returns role readiness calculations for Backend Developer, skill overview, and recent activity.

---

## 6. Diagnostic Assessment Quiz (Stage 6)

### `POST /api/assessment/start`
**Description:** Initiates a diagnostic assessment session with 12 randomized questions. Answers and explanations are omitted.

### `POST /api/assessment/submit`
**Description:** Grades submitted choices against the server answer key, writes `knowledge` evidence (capped at Beginner!), and reveals answers with detailed explanations.

---

## 7. Job Match & Gap Plan (Stage 7)

### `POST /api/job-match`
**Description:** Accepts job description text, extracts requirements via Gemini schema, computes deterministic match percentage against verified candidate skills, and builds an actionable gap plan.

---

## 8. Passport & Candidate Audit (Stage 8)

### `GET /api/passport/:slug`
**Description:** Returns public/private audit passport profile with verified skills, integrity factors, and audit record ID.

### `GET /api/candidates`
**Description:** Returns ranked synthetic candidates labeled "Demo data".

### `POST /api/candidates/rank`
**Description:** Re-ranks candidates dynamically using custom weights for coverage, confidence, recency, project relevance, and practical evidence.

---

## 9. Comprehensive Assessment Platform (25-Question Architecture)

### `GET /api/assessments`
**Description:** Returns catalog of assessments with time limit, question counts (MCQs and coding problems), section outlines, and the user's latest verified result.
**Response (200 OK):** `PublicAssessmentSummary[]`

### `GET /api/assessments/:id`
**Description:** Returns detail of an assessment, sanitized questions (no hidden tests or MCQ answer keys), active in-progress attempt ID and remaining seconds if an attempt is running.
**Response (200 OK):** `PublicAssessmentDetail & { inProgressAttemptId?: string, remainingSeconds?: number }`

### `POST /api/assessments/:id/start`
**Description:** Starts a new 180-minute attempt or resumes an existing active in-progress attempt. Accepts `python-fundamentals` or `python` alias. If an in-progress attempt exists with remaining time, returns the same `attemptId` (`inProgress: true`). Expired attempts are marked expired and not resumed. Enforces `ASSESSMENT_COOLDOWN_MINUTES` on completed retakes (never blocking a first attempt).
**Response (200 OK):**
```json
{
  "attemptId": "att_1712345678_ab12",
  "startedAt": "2026-10-08T12:00:00Z",
  "deadlineAt": "2026-10-08T15:00:00Z",
  "remainingSeconds": 10800,
  "inProgress": false
}
```

### `GET /api/attempts/:attemptId`
**Description:** Returns current attempt state, saved answers, submission counts, remaining time, and all 25 sanitized questions in order (5 easy, 10 medium, 10 hard) without answers or hidden tests.
**Response (200 OK):**
```json
{
  "id": "att_1712345678_ab12",
  "userId": "demo-user",
  "assessmentId": "python-fundamentals",
  "status": "in_progress",
  "startedAt": "2026-10-08T12:00:00Z",
  "deadlineAt": "2026-10-08T15:00:00Z",
  "remainingSeconds": 10800,
  "answers": {},
  "submissionsCountByQid": {},
  "integrity": { "tabSwitches": 0, "largePastes": 0, "flagged": false },
  "assessmentTitle": "Python",
  "timeLimitMinutes": 180,
  "questions": [
    { "id": "a1-types-operators", "type": "mcq", "prompt": "...", "sectionId": "A", "difficultyLabel": "Easy" }
  ],
  "sectionsDetailed": [...]
}
```

### `PUT /api/attempts/:attemptId/answer`
**Description:** Debounced autosave endpoint for MCQ choice selections or coding drafts.
**Request Body:** `{ "qid": "b7-word-frequency", "choiceId": "opt_1", "code": "...", "flagged": false }`
**Response (200 OK):** `{ "saved": true }`

### `POST /api/attempts/:attemptId/events`
**Description:** Records integrity events (tab switches and large pastes > 200 chars). Flags attempt if tab switches > 5 or pastes > 3.
**Request Body:** `{ "type": "tab_switch" | "large_paste" }`
**Response (200 OK):** `{ "recorded": true, "flagged": boolean }`

### `POST /api/attempts/:attemptId/questions/:qid/run`
**Description:** Executes code against visible test cases or custom input using `onlinecompiler.io`.
**Request Body:** `{ "code": "...", "customInput": "..." }`
**Response (200 OK):** `RunResponse`

### `POST /api/attempts/:attemptId/questions/:qid/submit`
**Description:** Evaluates code against visible + hidden tests (rate limited to max 3 submissions per question). Runs literal hardcoding check and Gemini review.
**Request Body:** `{ "code": "..." }`
**Response (200 OK):**
```json
{
  "submissionId": "sub_...",
  "deterministic": { "correctness": 85, "visiblePassed": 3, "visibleTotal": 3, "hiddenPassed": 9, "hiddenTotal": 10 },
  "overallScore": 88,
  "remainingSubmissions": 2
}
```

### `POST /api/attempts/:attemptId/finish`
**Description:** Finalizes assessment attempt: grades MCQs by server answer keys, determines best submission per coding problem, calculates weighted scores across sections (Easy: 1, Medium: 2, Hard: 3), checks gating caps, writes skill evidence rows, and issues badge.
**Response (200 OK):** `AssessmentResult`

### `GET /api/attempts/:attemptId/result`
**Description:** Retrieves finalized result, badge hero, section breakdown, skill breakdown, and question-by-question review with revealed explanations.
**Response (200 OK):** `AssessmentResult`
