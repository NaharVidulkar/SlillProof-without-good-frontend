/**
 * Trace script for CV analysis pipeline through stages 1 to 7.
 */
import { analyseCv, normalizeAndFilterSkills, safeParseJson } from '../lib/server/cv-analyser.ts';
import { store } from '../lib/server/store.ts';
import { saveAnalysisRecord, getLatestAnalysisRecord, getUserRecord, saveUserRecord } from '../lib/server/user-repo.ts';
import { initializeUserSections, getUserSections, openUserSection } from '../lib/server/assessments/sections-manager.ts';

async function runTrace() {
  console.log('=== STAGE 1: RAW PARSER CALL & RESPONSE SHAPE ===');
  const sampleResumeText = `
Alex Mercer - Senior Software Engineer
Summary: Full-stack engineer with 6 years of experience building high-throughput web applications and cloud architectures.
Experience:
- Architected enterprise frontend platforms with React and TypeScript, improving build times by 40%.
- Designed distributed relational databases with PostgreSQL and optimized query indexing.
- Implemented containerization workflows with Docker and automated deployment pipelines.
Skills: React, TypeScript, PostgreSQL, Docker, Go, Kubernetes
  `;

  const traceUserId = 'trace_user_' + Date.now();
  console.log(`[Trace] Simulating analysis for userId: ${traceUserId}`);

  // Test Stage 1 & 2 & 3: Run analyseCv
  const analysis = await analyseCv({
    textContent: sampleResumeText,
  });

  console.log('[Trace Stage 1] Raw output received.');
  console.log('[Trace Stage 1] Top-level keys:', Object.keys(analysis));
  console.log('[Trace Stage 1] Source path used:', analysis.source);
  console.log('[Trace Stage 1] Extracted skills count:', analysis.skills.length);
  console.log('[Trace Stage 1] Field or Role:', analysis.fieldOrRole);

  console.log('\n=== STAGE 2: NORMALIZATION ===');
  console.log('[Trace Stage 2] Normalized skills:', analysis.skills.map((s) => ({
    name: s.name,
    category: s.category,
    claimedLevel: s.claimedLevel,
    evidenceStrength: Boolean(s.evidence),
  })));

  console.log('\n=== STAGE 3: JSON HANDLING ===');
  const sampleFence = '```json\n{"status":"success","fieldOrRole":"Full Stack Engineer","skills":[{"name":"TypeScript","category":"programming","claimedLevel":"Advanced","evidence":"6 years"}]}\n```';
  const parsedFenced = safeParseJson<any>(sampleFence);
  console.log('[Trace Stage 3] Cleaned and parsed fenced JSON keys:', Object.keys(parsedFenced));
  console.log('[Trace Stage 3] Parsed skills count:', parsedFenced.skills.length);

  console.log('\n=== STAGE 4: SAVING TO STORE & FIRESTORE ===');
  await saveAnalysisRecord(traceUserId, analysis);
  const { activeSections, laterSkills } = await initializeUserSections(traceUserId, analysis.skills);
  await saveUserRecord(traceUserId, {
    onboardingCompleted: true,
    skills: analysis.skills.map((s) => ({
      name: s.name,
      slug: s.slug,
      category: s.category,
      level: s.claimedLevel,
      verified: false,
    })),
  });
  console.log(`[Trace Stage 4] Saved analysis to users/${traceUserId}/analysis/latest`);
  console.log(`[Trace Stage 4] Initialized ${activeSections.length} sections, ${laterSkills.length} later skills`);

  console.log('\n=== STAGE 5: READING STORED ANALYSIS ===');
  const retrievedAnalysis = await getLatestAnalysisRecord(traceUserId);
  const retrievedSections = await getUserSections(traceUserId);
  console.log('[Trace Stage 5] Retrieved analysis keys:', Object.keys(retrievedAnalysis || {}));
  console.log('[Trace Stage 5] Retrieved skills count:', retrievedAnalysis?.skills?.length || 0);
  console.log('[Trace Stage 5] Retrieved sections count:', retrievedSections.length);
  console.log('[Trace Stage 5] Section slugs:', retrievedSections.map((s) => s.skillSlug));

  console.log('\n=== STAGE 6: RENDERING VERIFICATION ===');
  const cardsToRender = (retrievedAnalysis?.skills || []).slice(0, 6).map((skill: any) => {
    const sec = retrievedSections.find((s) => s.skillSlug === skill.slug);
    let statusText = 'Not taken';
    if (sec?.status === 'completed' && sec.score !== null) {
      statusText = `Completed (${sec.score}%)`;
    } else if (sec?.status === 'in_progress') {
      statusText = 'In progress';
    }
    return {
      skillName: skill.name,
      claimedLevel: skill.claimedLevel,
      status: statusText,
      hasStartButton: true,
    };
  });
  console.log('[Trace Stage 6] Dynamic cards generated for candidate:', cardsToRender);

  console.log('\n=== STAGE 7: ASSESSMENT SELECTION & QUESTION GENERATION ===');
  const firstSkill = retrievedAnalysis.skills[0];
  console.log(`[Trace Stage 7] Opening assessment for skill: ${firstSkill.name} (${firstSkill.slug})`);
  const opened = await openUserSection(traceUserId, firstSkill.slug);
  console.log(`[Trace Stage 7] Opened section status: ${opened.section.status}`);
  console.log(`[Trace Stage 7] Questions loaded: ${opened.questions?.length || 0}`);
  if (opened.questions && opened.questions.length > 0) {
    const sampleQ = opened.questions[0];
    console.log(`[Trace Stage 7] Sample Question 1: id=${sampleQ.id}, type=${sampleQ.type}, difficulty=${sampleQ.difficulty}`);
  }

  console.log('\n=== TRACE COMPLETE ===');
}

runTrace().catch((err) => {
  console.error('[Trace Error]', err);
  process.exit(1);
});
