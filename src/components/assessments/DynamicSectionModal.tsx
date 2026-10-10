/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Send,
  Code2,
  Layers,
  Award,
  RefreshCw,
  Terminal,
  Save,
  Clock,
} from 'lucide-react';
import { clientApi } from '@/lib/client/api.ts';
import { ErrorBoundary } from '../ui/ErrorBoundary.tsx';

interface DynamicQuestionClient {
  id: string;
  type: 'mcq' | 'code';
  prompt?: string;
  codeSnippet?: string;
  options?: Array<{ id: string; text: string }>;
  difficulty?: string;
  title?: string;
  statement?: string;
  inputFormat?: string;
  outputFormat?: string;
  starterCode?: string;
  language?: string;
  visibleTests?: Array<{ input: string; expected: string }>;
}

interface DynamicSectionModalProps {
  skillSlug: string;
  skillName: string;
  claimedLevel: string;
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (result: any) => void;
}

export const DynamicSectionModal: React.FC<DynamicSectionModalProps> = ({
  skillSlug,
  skillName,
  claimedLevel,
  isOpen,
  onClose,
  onCompleted,
}) => {
  const [section, setSection] = useState<any>(null);
  const [questions, setQuestions] = useState<DynamicQuestionClient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Assessment player states
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [codeDrafts, setCodeDrafts] = useState<Record<string, string>>({});

  // Code runner states
  const [runningCode, setRunningCode] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [compilerError, setCompilerError] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<any>(null);
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch or trigger section open
  const loadSection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientApi.openUserSection(skillSlug);
      setSection(data.section);

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        if (data.section.answers) {
          setAnswers(data.section.answers);
        }
        if (data.section.codeDrafts) {
          setCodeDrafts(data.section.codeDrafts);
        }
        if (typeof data.section.currentQuestionIndex === 'number') {
          setCurrentIndex(Math.min(data.section.currentQuestionIndex, data.questions.length - 1));
        }
      }
    } catch (err: any) {
      console.error('[DynamicSection] Load error:', err);
      setError(err?.message || 'Failed to open assessment section');
    } finally {
      setLoading(false);
    }
  }, [skillSlug]);

  useEffect(() => {
    if (isOpen) {
      loadSection();
    }
  }, [isOpen, loadSection]);

  // Autosave progress debounced
  const saveProgress = useCallback(
    async (newAnswers: Record<string, string>, newDrafts: Record<string, string>, index: number) => {
      try {
        await clientApi.saveSectionProgress(skillSlug, {
          currentQuestionIndex: index,
          answers: newAnswers,
          codeDrafts: newDrafts,
        });
        setAutoSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.warn('[DynamicSection] Autosave warning:', err);
      }
    },
    [skillSlug]
  );

  const handleSelectOption = (qid: string, optId: string) => {
    const updated = { ...answers, [qid]: optId };
    setAnswers(updated);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveProgress(updated, codeDrafts, currentIndex);
    }, 600);
  };

  const handleCodeChange = (qid: string, code: string | undefined) => {
    if (code === undefined) return;
    const updatedDrafts = { ...codeDrafts, [qid]: code };
    setCodeDrafts(updatedDrafts);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveProgress(answers, updatedDrafts, currentIndex);
    }, 1200);
  };

  // Run Code via protected backend
  const handleRunCode = async () => {
    const activeQ = questions[currentIndex];
    if (!activeQ || activeQ.type !== 'code') return;

    const userCode = codeDrafts[activeQ.id] || activeQ.starterCode || '';
    setRunningCode(true);
    setCompilerError(null);
    setRunResult(null);

    try {
      const res = await clientApi.runDynamicCode({
        skillSlug,
        questionId: activeQ.id,
        code: userCode,
        language: activeQ.language,
      });

      setRunResult(res);
      // Mark code as answer
      const updatedAnswers = { ...answers, [activeQ.id]: userCode };
      setAnswers(updatedAnswers);
      saveProgress(updatedAnswers, codeDrafts, currentIndex);
    } catch (err: any) {
      setCompilerError(err?.message || 'Code runner is busy, please try again in a moment');
    } finally {
      setRunningCode(false);
    }
  };

  // Submit Section
  const handleSubmitSection = async () => {
    if (!confirm('Are you ready to submit your assessment? Your score and verified badge will be calculated.')) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await clientApi.submitSection(skillSlug, {
        answers,
        codeDrafts,
      });

      setSubmittedResult(res);
      if (onCompleted) {
        onCompleted(res);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] rounded-3xl bg-white shadow-2xl border border-border flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A64B8] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {skillName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-ink">{skillName} Assessment</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {claimedLevel}
                </span>
                {section?.status === 'ready' && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    25 Questions
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                <span>Progress: {answeredCount} / {questions.length || 25} answered</span>
                {autoSavedTime && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                    <Save className="size-3" /> Autosaved at {autoSavedTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-ink hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Close / Exit assessment (progress is saved)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
            <button
              type="button"
              onClick={loadSection}
              className="text-xs font-bold text-red-900 hover:underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto">
          {/* STATE 1: LOADING / GENERATING SKELETON */}
          {loading || section?.status === 'generating' ? (
            <div className="p-10 flex flex-col items-center justify-center text-center h-full space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-[#4A64B8]/10 text-[#4A64B8] flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="absolute inset-0 rounded-3xl border-2 border-[#4A64B8] border-t-transparent animate-spin" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold text-ink">Preparing Your {skillName} Assessment</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gemini is assembling your personalized 25 questions calibrated to your {claimedLevel} level. Questions are validated and cached for instant resumption.
                </p>
              </div>
              <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#4A64B8] rounded-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
              </div>
            </div>
          ) : submittedResult ? (
            /* STATE 2: COMPLETED RESULT SCREEN */
            <div className="p-8 max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-3">
                <div
                  className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white ${
                    submittedResult.badgeLabel === 'Verified'
                      ? 'bg-emerald-600'
                      : submittedResult.badgeLabel === 'Partially verified'
                      ? 'bg-indigo-600'
                      : 'bg-amber-600'
                  }`}
                >
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-ink">{submittedResult.badgeLabel}</h3>
                <p className="text-sm text-muted-foreground">
                  You scored <strong className="text-ink">{submittedResult.score}%</strong> on {skillName} ({submittedResult.correctCount}/{submittedResult.totalQuestions} questions passed).
                </p>
                {submittedResult.badgeLabel === 'Verified' && (
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                    Badge Added to Your Skill Passport
                  </div>
                )}
              </div>

              {/* Review breakdown */}
              <div className="rounded-2xl border border-border bg-slate-50 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Assessment Breakdown
                </h4>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {(submittedResult.breakdown || []).map((item: any, i: number) => (
                    <div
                      key={item.id || i}
                      className="p-3 rounded-xl bg-white border border-border text-xs flex items-start gap-3"
                    >
                      <div className="mt-0.5">
                        {item.isCorrect ? (
                          <CheckCircle2 className="size-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="size-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold text-ink">
                          Question {i + 1}: {item.prompt || item.title}
                        </div>
                        {item.type === 'mcq' && (
                          <div className="text-[11px] text-muted-foreground">
                            Your answer: <span className="font-mono font-medium">{item.userChoice || 'None'}</span> · Correct: <span className="font-mono font-bold text-emerald-700">{item.correctChoice}</span>
                          </div>
                        )}
                        {item.explanation && (
                          <p className="text-[11px] text-slate-600 italic mt-0.5">{item.explanation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-6 rounded-xl bg-[#3B4A6B] text-white hover:bg-[#2F3A53] font-semibold text-xs cursor-pointer shadow-sm transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : questions.length > 0 && currentQ ? (
            /* STATE 3: INTERACTIVE QUESTION PLAYER */
            <div className="flex flex-col h-full">
              {/* Question numbers bar */}
              <div className="px-6 py-2.5 bg-slate-100/70 border-b border-border flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = Boolean(answers[q.id]);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        saveProgress(answers, codeDrafts, idx);
                        setCurrentIndex(idx);
                        setRunResult(null);
                        setCompilerError(null);
                      }}
                      className={`size-7 rounded-lg text-xs font-bold shrink-0 flex items-center justify-center cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#4A64B8] text-white shadow-xs'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                      title={`Question ${idx + 1} (${q.type.toUpperCase()})`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Main question area */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Badge & difficulty */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Question {currentIndex + 1} of {questions.length} · {currentQ.type === 'code' ? 'Coding Problem' : 'Multiple Choice'}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Difficulty: {currentQ.difficulty || 'Medium'}
                    </span>
                  </div>

                  {/* QUESTION TYPE A: MCQ */}
                  {currentQ.type === 'mcq' && (
                    <div className="space-y-5">
                      <h3 className="text-base sm:text-lg font-bold text-ink leading-relaxed">
                        {currentQ.prompt}
                      </h3>

                      {currentQ.codeSnippet && (
                        <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed shadow-2xs">
                          <pre>{currentQ.codeSnippet}</pre>
                        </div>
                      )}

                      <div className="space-y-3 pt-2">
                        {(currentQ.options || []).map((opt) => {
                          const isSelected = answers[currentQ.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectOption(currentQ.id, opt.id)}
                              className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#4A64B8]/10 border-[#4A64B8] text-ink shadow-2xs ring-1 ring-[#4A64B8]'
                                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                              }`}
                            >
                              <div
                                className={`size-5 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
                                  isSelected
                                    ? 'bg-[#4A64B8] text-white border-[#4A64B8]'
                                    : 'border-slate-300 text-slate-500'
                                }`}>
                                {opt.id}
                              </div>
                              <span className="text-xs sm:text-sm font-medium leading-relaxed">
                                {opt.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* QUESTION TYPE B: CODING PROBLEM */}
                  {currentQ.type === 'code' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-ink">{currentQ.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap">
                          {currentQ.statement}
                        </p>
                      </div>

                      {/* Visible examples */}
                      {currentQ.visibleTests && currentQ.visibleTests.length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs">
                          <div className="font-bold text-slate-800">Example Test Cases:</div>
                          {currentQ.visibleTests.map((t, idx) => (
                            <div key={idx} className="font-mono text-[11px] text-slate-700">
                              Input: <code className="bg-white px-1.5 py-0.5 rounded border border-border">{t.input || '(empty)'}</code> · Expected: <code className="bg-white px-1.5 py-0.5 rounded border border-border">{t.expected}</code>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Monaco Editor wrapped in ErrorBoundary */}
                      <ErrorBoundary fallbackTitle="Code Editor encountered an issue">
                        <div className="border border-border rounded-2xl overflow-hidden shadow-2xs">
                          <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-300">
                            <span className="font-mono flex items-center gap-1.5">
                              <Code2 className="size-3.5 text-[#4A64B8]" />
                              {currentQ.language || 'python'} solution
                            </span>
                            <span className="text-[11px] text-slate-400">Autosaves draft code</span>
                          </div>
                          <Editor
                            height="280px"
                            language={currentQ.language || 'python'}
                            theme="vs-dark"
                            value={codeDrafts[currentQ.id] || currentQ.starterCode || ''}
                            onChange={(val) => handleCodeChange(currentQ.id, val)}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 13,
                              lineNumbers: 'on',
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                            }}
                          />
                        </div>
                      </ErrorBoundary>

                      {/* Run button & compiler feedback */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={runningCode}
                          onClick={handleRunCode}
                          className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
                        >
                          {runningCode ? (
                            <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Play className="size-3.5 text-emerald-400" />
                          )}
                          <span>{runningCode ? 'Running Tests...' : 'Run Solution'}</span>
                        </button>
                      </div>

                      {compilerError && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                          <AlertCircle className="size-4 text-amber-700 shrink-0" />
                          <span>{compilerError}</span>
                        </div>
                      )}

                      {runResult && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-border text-xs space-y-2 font-mono">
                          <div className="flex items-center justify-between font-sans">
                            <span className="font-bold text-slate-800">Test Execution Results:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                runResult.allPassed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {runResult.passedCount} / {runResult.totalCount} Tests Passed
                            </span>
                          </div>
                          {runResult.firstFailingVisibleExample && (
                            <div className="text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 font-sans">
                              Failing Example #{runResult.firstFailingVisibleExample.index}: expected <code className="font-mono bg-white px-1 rounded">{runResult.firstFailingVisibleExample.expected}</code> but received <code className="font-mono bg-white px-1 rounded">{runResult.firstFailingVisibleExample.actual || 'none'}</code>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Navigation & Submit Bar */}
              <div className="px-6 py-3.5 border-t border-border bg-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => {
                    saveProgress(answers, codeDrafts, currentIndex - 1);
                    setCurrentIndex((prev) => Math.max(0, prev - 1));
                    setRunResult(null);
                    setCompilerError(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-border bg-white text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-3">
                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        saveProgress(answers, codeDrafts, currentIndex + 1);
                        setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                        setRunResult(null);
                        setCompilerError(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#4A64B8] text-white hover:bg-[#3B4A6B] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="size-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmitSection}
                      className="px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      <span>Finish & Submit ({answeredCount}/25)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-xs text-muted-foreground">
              No questions found for this section. Please retry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
