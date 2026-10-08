# SkillProof — Core Idea

> "Don't just claim a skill. Prove it."

Users solve HARD CODING PROBLEMS entirely inside the Monaco editor; onlinecompiler.io executes the code; hidden test cases decide correctness; Gemini gives a structured review that can NEVER change correctness. Results become skill EVIDENCE, and evidence becomes a skill LEVEL plus a CONFIDENCE value. Skills are never shown as bare percentages. A quiz alone can never make someone "Intermediate".

---

## Architectural Non-Negotiables

1. **Deterministic Correctness**:
   - Hidden tests run on onlinecompiler.io are the sole decider of correctness.
   - LLMs / Gemini give qualitative feedback, code quality analysis, and suggestions, but can NEVER modify test verdicts or correctness scores.

2. **Evidence-Based Skill Engine**:
   - Skill levels are **Novice**, **Beginner**, **Intermediate**, **Advanced**.
   - Confidence levels are **Low**, **Medium**, **High**.
   - Tiers are **Claimed**, **Assessed**, **Demonstrated**.
   - A quiz alone yields only knowledge evidence, capped strictly at "Beginner" and "Assessed" tier. Intermediate and Advanced require graded coding or project evidence.

3. **Security & Secrets**:
   - `ONLINECOMPILER_API_KEY` and `GEMINI_API_KEY` live only in server environment variables, never on the client, never logged, and never returned in API responses.
   - User code is never executed on our application server.
   - Hidden test cases and test solutions are server-only and never exposed to the client.

4. **Clean Decoupled Architecture**:
   - All business logic lives in `lib/` (domain, runner, ai, server) and is unit-testable.
   - Data access goes through `lib/server/store.ts` implementing a generic `Store` interface with file-backed JSON in `.data/` now, ready to swap to Firestore in Stage 9 without touching business logic.
   - Client components only communicate via `lib/client/api.ts`.
