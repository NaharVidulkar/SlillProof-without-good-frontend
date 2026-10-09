// Smoke test for SkillProof assessment end-to-end flow
import { DEMO_USER_ID } from '../lib/server/store.ts';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runSmokeTest() {
  console.log(`[smoke] Starting smoke test against ${BASE_URL}...`);

  // Step 1: Sign in / verify session as demo student
  console.log('[smoke] 1. Verifying demo student session...');
  const meRes = await fetch(`${BASE_URL}/api/me/dashboard`, {
    headers: { 'x-user-id': DEMO_USER_ID },
  });
  if (!meRes.ok) {
    throw new Error(`Failed to verify demo user dashboard: status ${meRes.status}`);
  }
  const dashboard = await meRes.json();
  console.log(`[smoke] Demo student verified: user ${dashboard.userId || DEMO_USER_ID}`);

  // Step 2: Start assessment
  console.log('[smoke] 2. Starting Python assessment (POST /api/assessments/python-fundamentals/start)...');
  const startRes = await fetch(`${BASE_URL}/api/assessments/python-fundamentals/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': DEMO_USER_ID,
    },
  });
  if (!startRes.ok) {
    const errorText = await startRes.text();
    throw new Error(`Failed to start assessment: status ${startRes.status} - ${errorText}`);
  }
  const startData = await startRes.json();
  const attemptId = startData.attemptId;
  if (!attemptId) {
    throw new Error('No attemptId returned from start endpoint');
  }
  console.log(`[smoke] Attempt successfully initialized / resumed: ${attemptId}`);

  // Step 3: Fetch attempt and verify 25 questions
  console.log(`[smoke] 3. Fetching attempt details (GET /api/attempts/${attemptId})...`);
  const attemptRes = await fetch(`${BASE_URL}/api/attempts/${attemptId}`, {
    headers: { 'x-user-id': DEMO_USER_ID },
  });
  if (!attemptRes.ok) {
    throw new Error(`Failed to fetch attempt: status ${attemptRes.status}`);
  }
  const attemptData = await attemptRes.json();
  if (!attemptData.questions || attemptData.questions.length !== 25) {
    throw new Error(`Expected 25 questions, got ${attemptData.questions?.length}`);
  }
  console.log(`[smoke] Attempt loaded with ${attemptData.questions.length} questions.`);

  // Step 4: Answer one MCQ
  const firstMcq = attemptData.questions.find((q: any) => q.type === 'mcq');
  if (!firstMcq) {
    throw new Error('No MCQ question found in questions list');
  }
  const mcqQid = firstMcq.id;
  const chosenOption = firstMcq.options?.[0]?.id || 'a';
  console.log(`[smoke] 4. Answering MCQ question ${mcqQid} with option '${chosenOption}'...`);

  const answerMcqRes = await fetch(`${BASE_URL}/api/attempts/${attemptId}/answer`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': DEMO_USER_ID,
    },
    body: JSON.stringify({
      qid: mcqQid,
      choiceId: chosenOption,
    }),
  });
  if (!answerMcqRes.ok) {
    throw new Error(`Failed to answer MCQ: status ${answerMcqRes.status}`);
  }
  console.log(`[smoke] MCQ answer submitted successfully.`);

  // Step 5: Save a code draft
  const firstCode = attemptData.questions.find((q: any) => q.type === 'code');
  if (!firstCode) {
    throw new Error('No code question found in questions list');
  }
  const codeQid = firstCode.id;
  const draftCode = '# SkillProof Smoke Test Draft\ndef solve():\n    return 42\n';
  console.log(`[smoke] 5. Saving code draft for ${codeQid}...`);

  const answerCodeRes = await fetch(`${BASE_URL}/api/attempts/${attemptId}/answer`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': DEMO_USER_ID,
    },
    body: JSON.stringify({
      qid: codeQid,
      code: draftCode,
    }),
  });
  if (!answerCodeRes.ok) {
    throw new Error(`Failed to save code draft: status ${answerCodeRes.status}`);
  }
  console.log(`[smoke] Code draft saved successfully.`);

  // Step 6: Fetch again and confirm answers persisted
  console.log(`[smoke] 6. Refetching attempt to confirm persistence...`);
  const verifyRes = await fetch(`${BASE_URL}/api/attempts/${attemptId}`, {
    headers: { 'x-user-id': DEMO_USER_ID },
  });
  if (!verifyRes.ok) {
    throw new Error(`Failed to refetch attempt: status ${verifyRes.status}`);
  }
  const verifyData = await verifyRes.json();
  const savedMcq = verifyData.answers?.[mcqQid];
  const savedCode = verifyData.answers?.[codeQid];

  if (!savedMcq || savedMcq.choiceId !== chosenOption) {
    throw new Error(`MCQ answer did not persist. Expected choice ${chosenOption}, got ${savedMcq?.choiceId}`);
  }
  if (!savedCode || savedCode.code !== draftCode) {
    throw new Error(`Code draft did not persist. Expected code length ${draftCode.length}, got ${savedCode?.code?.length}`);
  }

  console.log('[smoke] Verification successful! Both MCQ answer and code draft persisted in storage.');
  console.log('[smoke] All smoke checks passed successfully!');
}

runSmokeTest().catch((err) => {
  console.error('[smoke] Smoke test failed:', err);
  process.exit(1);
});
