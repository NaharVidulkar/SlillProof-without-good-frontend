/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Code2,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface AssessmentQuestion {
  id: string;
  prompt: string;
  codeSnippet?: string;
  options: Array<{ id: string; text: string }>;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface AssessmentQuestionReview {
  id: string;
  prompt: string;
  userChoice?: string;
  correctChoice: string;
  isCorrect: boolean;
  explanation: string;
}

interface AssessmentResultData {
  assessmentId: string;
  skillName: string;
  score: number;
  correctCount: number;
  totalCount: number;
  tier: string;
  passed: boolean;
  questionReviews: AssessmentQuestionReview[];
}

interface SkillAssessmentModalProps {
  skillName: string;
  level?: string;
  isOpen: boolean;
  onClose: () => void;
  onAssessmentCompleted?: (result: AssessmentResultData) => void;
}

export const SkillAssessmentModal: React.FC<SkillAssessmentModalProps> = ({
  skillName,
  level = 'Intermediate',
  isOpen,
  onClose,
  onAssessmentCompleted,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResultData | null>(null);

  // Load questions from server
  useEffect(() => {
    if (!isOpen || !skillName) return;

    let isMounted = true;
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      setResult(null);
      setSelectedAnswers({});
      setCurrentIndex(0);

      try {
        const res = await fetch('/api/skills/assess/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ skillName, level }),
        });

        if (!res.ok) {
          throw new Error(`Failed to generate assessment (${res.status})`);
        }

        const data = await res.json();
        if (isMounted) {
          setAssessmentId(data.id);
          setQuestions(data.questions || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Could not generate assessment.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuestions();

    return () => {
      isMounted = false;
    };
  }, [isOpen, skillName, level]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!assessmentId) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/skills/assess/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assessmentId,
          skillName,
          level,
          answers: selectedAnswers,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to submit assessment (${res.status})`);
      }

      const resData: AssessmentResultData = await res.json();
      setResult(resData);
      if (onAssessmentCompleted) {
        onAssessmentCompleted(resData);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
              <Sparkles className="w-4 h-4 text-[#4A64B8]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <span>{skillName} Verification</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-muted-foreground border border-slate-200">
                  {level}
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Adaptive Gemini-graded technical diagnostic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-ink hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading && (
            <div className="py-16 text-center space-y-4">
              <div className="w-8 h-8 mx-auto animate-spin rounded-full border-2 border-[#4A64B8] border-t-transparent" />
              <div>
                <p className="text-sm font-medium text-ink">
                  Generating verified diagnostic for {skillName}...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gemini is constructing real-world scenario questions.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Assessment notice</span>
              </div>
              <p>{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-100 hover:bg-red-200 text-red-800 font-medium cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {!loading && !result && currentQ && (
            <div className="space-y-6">
              {/* Stepper info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Question <strong className="text-ink">{currentIndex + 1}</strong> of{' '}
                  <strong className="text-ink">{questions.length}</strong>
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {currentQ.difficulty}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#4A64B8] h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question prompt */}
              <div className="space-y-3">
                <h4 className="text-sm sm:text-base font-semibold text-ink leading-snug">
                  {currentQ.prompt}
                </h4>

                {currentQ.codeSnippet && (
                  <div className="rounded-lg bg-[#1e2433] p-3 text-xs font-mono text-slate-100 overflow-x-auto border border-slate-700">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider mb-2 pb-1 border-b border-slate-700">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Code Snippet</span>
                    </div>
                    <pre className="whitespace-pre">{currentQ.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#4A64B8] bg-[#4A64B8]/5 text-ink ring-1 ring-[#4A64B8]'
                          : 'border-border bg-white text-ink hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`size-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          isSelected
                            ? 'bg-[#4A64B8] text-white'
                            : 'border border-slate-300 text-muted-foreground'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="flex-1 pt-0.5 leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results screen */}
          {result && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-border text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-ink">
                  {result.passed ? 'Skill Verification Confirmed!' : 'Diagnostic Completed'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your assessment has been recorded in your verifiable SkillProof matrix with cryptographic timestamping.
                </p>

                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-[#3B4A6B]">
                      {result.score}%
                    </div>
                    <div className="text-[11px] text-muted-foreground">Score</div>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-[#3B4A6B]">
                      {result.correctCount} / {result.totalCount}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Questions Correct</div>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <div className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-[#4A64B8]/10 text-[#4A64B8] border border-[#4A64B8]/20">
                      {result.tier}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Assigned Tier</div>
                  </div>
                </div>
              </div>

              {/* Review Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Question Review & Explanations
                </h4>
                <div className="space-y-3">
                  {result.questionReviews.map((rev, idx) => (
                    <div
                      key={rev.id}
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                        rev.isCorrect
                          ? 'border-emerald-200 bg-emerald-50/30 text-ink'
                          : 'border-amber-200 bg-amber-50/30 text-ink'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5">
                          {rev.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                          )}
                          <span>Question {idx + 1}</span>
                        </span>
                        <span className="text-[11px]">
                          {rev.isCorrect ? (
                            <span className="text-emerald-700 font-bold">Correct</span>
                          ) : (
                            <span className="text-amber-700">
                              Selected {rev.userChoice || 'None'} · Correct: {rev.correctChoice}
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-slate-700">{rev.prompt}</p>
                      <div className="pt-1 text-[11px] text-slate-600 border-t border-slate-200/60">
                        <strong className="text-slate-800">Explanation: </strong>
                        {rev.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-border bg-slate-50/50 flex items-center justify-between">
          {!result ? (
            <>
              <button
                type="button"
                disabled={currentIndex === 0 || submitting}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-200/60 disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>

              <div className="text-xs text-muted-foreground hidden sm:block">
                Answered {answeredCount} of {questions.length}
              </div>

              {isLastQuestion ? (
                <button
                  type="button"
                  disabled={submitting || answeredCount === 0}
                  onClick={handleSubmit}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#4A64B8] text-white hover:bg-[#3B4A6B] disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  {submitting ? (
                    <div className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{submitting ? 'Evaluating...' : 'Submit Assessment'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#3B4A6B] text-white hover:bg-[#2F3A53] flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-[#3B4A6B] text-white hover:bg-[#2F3A53] flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
