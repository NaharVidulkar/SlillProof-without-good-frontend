/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft,
  Clock,
  Code2,
  FileText,
  AlertCircle,
  RefreshCw,
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  Terminal,
  ListChecks,
  CheckCircle2,
  Flag,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { clientApi } from '../../../lib/client/api.ts';
import {
  PublicAssessmentDetail,
  PublicAssessmentQuestion,
  PublicCodeQuestion,
  PublicMcqQuestion,
  PublicSection,
  AssessmentAttempt,
} from '../../../lib/server/assessments/types.ts';
import { Card, Button, Chip } from '../ui/index.tsx';

interface AssessmentDetailProps {
  assessmentId: string;
  onBack: () => void;
  onStartAttempt: (attemptId: string, questionIndex?: number) => void;
  onViewResult?: (attemptId: string) => void;
}

type QuestionFilter = 'all' | 'section-a' | 'section-b' | 'section-c' | 'mcq' | 'code';

export const AssessmentDetail: React.FC<AssessmentDetailProps> = ({
  assessmentId,
  onBack,
  onStartAttempt,
  onViewResult,
}) => {
  const [detail, setDetail] = useState<
    (PublicAssessmentDetail & { inProgressAttemptId?: string; remainingSeconds?: number }) | null
  >(null);
  const [currentAttempt, setCurrentAttempt] = useState<AssessmentAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<QuestionFilter>('all');
  const [expandedQid, setExpandedQid] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientApi.getAssessmentDetail(assessmentId);
      setDetail(data);

      if (data.inProgressAttemptId) {
        try {
          const att = await clientApi.getAttempt(data.inProgressAttemptId);
          setCurrentAttempt(att);
        } catch {
          setCurrentAttempt(null);
        }
      } else {
        setCurrentAttempt(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [assessmentId]);

  const handleStart = async (targetQuestionIndex = 0) => {
    setStarting(true);
    setError(null);
    try {
      const res = await clientApi.startAssessmentAttempt(assessmentId);
      onStartAttempt(res.attemptId, targetQuestionIndex);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start assessment attempt');
      setStarting(false);
    }
  };

  const formatRemaining = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m remaining`;
    return `${mins}m remaining`;
  };

  // Flatten questions with section and global index info
  const allFlattenedQuestions = useMemo(() => {
    if (!detail?.sectionsDetailed) return [];
    const flat: Array<{
      question: PublicAssessmentQuestion;
      section: PublicSection;
      globalIndex: number; // 0 to 24
      qNumber: number; // 1 to 25
      isAnswered: boolean;
      isFlagged: boolean;
    }> = [];

    let count = 0;
    detail.sectionsDetailed.forEach((sec) => {
      (sec.questions || []).forEach((q) => {
        const userAns = currentAttempt?.answers?.[q.id];
        let answered = false;
        if (q.type === 'mcq') {
          answered = Boolean(userAns?.choiceId);
        } else {
          answered = Boolean(
            (currentAttempt?.submissionsCountByQid?.[q.id] || 0) > 0 ||
              (userAns?.code && userAns.code.trim().length > 10)
          );
        }

        flat.push({
          question: q,
          section: sec,
          globalIndex: count,
          qNumber: count + 1,
          isAnswered: answered,
          isFlagged: Boolean(userAns?.flagged),
        });
        count++;
      });
    });

    return flat;
  }, [detail?.sectionsDetailed, currentAttempt]);

  // Filtered list based on active filter tab
  const filteredQuestions = useMemo(() => {
    switch (filter) {
      case 'section-a':
        return allFlattenedQuestions.filter((item) => item.section.id === 'A');
      case 'section-b':
        return allFlattenedQuestions.filter((item) => item.section.id === 'B');
      case 'section-c':
        return allFlattenedQuestions.filter((item) => item.section.id === 'C');
      case 'mcq':
        return allFlattenedQuestions.filter((item) => item.question.type === 'mcq');
      case 'code':
        return allFlattenedQuestions.filter((item) => item.question.type === 'code');
      case 'all':
      default:
        return allFlattenedQuestions;
    }
  }, [allFlattenedQuestions, filter]);

  const toggleExpand = (qid: string) => {
    setExpandedQid((prev) => (prev === qid ? null : qid));
  };

  return (
    <div className="space-y-6">
      {/* Back navigation & Page header */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs text-[#8A94AD] hover:text-[#3B4A6B] font-medium cursor-pointer mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to assessments</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3B4A6B]">
                {detail?.title || 'Python Fundamentals'}
              </h1>
              <Chip label="25 Questions" variant="accent" />
            </div>
            <p className="text-sm text-[#8A94AD] mt-1.5 max-w-2xl">
              {detail?.description ||
                'Evidence-based verification of core Python internals, data structures, algorithms, and real-life systems.'}
            </p>
          </div>

          {detail?.lastResult && (
            <div className="flex items-center space-x-3 bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6F86C9] to-[#8E7FBF] flex items-center justify-center text-white">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#3B4A6B] block">
                  {detail.lastResult.badgeLabel} Badge
                </span>
                <span className="text-[#8A94AD] font-mono">
                  Score: {detail.lastResult.overallPercent}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-900">Error</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchDetail}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#4A64B8]" />
          <span className="text-sm text-[#8A94AD]">Loading full assessment syllabus...</span>
        </div>
      )}

      {!loading && detail && (
        <div className="space-y-7">
          {/* Action / Launch Banner */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(59,74,107,0.04)] border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#4A64B8]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#4A64B8]">
                  Timed Assessment (180 Minutes)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#3B4A6B]">
                {detail.inProgressAttemptId
                  ? 'Active Attempt In Progress'
                  : 'Start Full Python Assessment'}
              </h3>
              <p className="text-xs text-[#8A94AD] leading-relaxed">
                {detail.inProgressAttemptId && detail.remainingSeconds
                  ? `You have an active attempt with ${formatRemaining(detail.remainingSeconds)}. You can resume immediately or jump into any specific question below.`
                  : 'Solve 25 verified questions (11 MCQs + 14 Coding problems). Tests execute in real sandboxes to verify your skill evidence.'}
              </p>
            </div>

            <div className="shrink-0 flex items-center space-x-3">
              <button
                onClick={() => handleStart(0)}
                disabled={starting}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#7B8AB8] hover:bg-[#6877A6] active:bg-[#5C6A96] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {starting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Opening Workspace...</span>
                  </>
                ) : detail.inProgressAttemptId ? (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume Assessment</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Assessment (180m)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {detail.sectionsDetailed.map((sec) => (
              <Card
                key={sec.id}
                className="p-5 bg-white rounded-2xl border border-slate-100/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A94AD]">
                    Section {sec.id}
                  </span>
                  <Chip
                    label={`Weight: x${sec.weight}`}
                    variant={sec.id === 'A' ? 'neutral' : sec.id === 'B' ? 'warning' : 'danger'}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3B4A6B]">
                    {sec.title}
                  </h4>
                  <p className="text-xs text-[#8A94AD] mt-0.5">
                    {sec.questionCount} Questions ({sec.mcqCount} MCQs + {sec.codeCount} Coding)
                  </p>
                </div>
                <div className="text-[11px] text-[#4A64B8] font-semibold pt-1">
                  Difficulty: {sec.difficultyLabel}
                </div>
              </Card>
            ))}
          </div>

          {/* ============================================================== */}
          {/* THE COMPLETE QUESTIONS SYLLABUS & DIRECT QUESTION BROWSER    */}
          {/* ============================================================== */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#3B4A6B] tracking-tight">
                  Assessment Questions Syllabus (25 Questions)
                </h2>
                <p className="text-xs text-[#8A94AD]">
                  Browse all questions, view problem statements &amp; requirements, or launch directly into any challenge.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    filter === 'all'
                      ? 'bg-[#3B4A6B] text-white shadow-xs'
                      : 'bg-white text-[#8A94AD] hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  All (25)
                </button>
                <button
                  onClick={() => setFilter('section-a')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    filter === 'section-a'
                      ? 'bg-[#3B4A6B] text-white shadow-xs'
                      : 'bg-white text-[#8A94AD] hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  Section A (5)
                </button>
                <button
                  onClick={() => setFilter('section-b')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    filter === 'section-b'
                      ? 'bg-[#3B4A6B] text-white shadow-xs'
                      : 'bg-white text-[#8A94AD] hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  Section B (10)
                </button>
                <button
                  onClick={() => setFilter('section-c')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    filter === 'section-c'
                      ? 'bg-[#3B4A6B] text-white shadow-xs'
                      : 'bg-white text-[#8A94AD] hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  Section C (10)
                </button>
                <button
                  onClick={() => setFilter('code')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    filter === 'code'
                      ? 'bg-[#3B4A6B] text-white shadow-xs'
                      : 'bg-white text-[#8A94AD] hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  Coding (14)
                </button>
                <button
                  onClick={() => setFilter('mcq')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    filter === 'mcq'
                      ? 'bg-[#3B4A6B] text-white shadow-xs'
                      : 'bg-white text-[#8A94AD] hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  MCQs (11)
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {filteredQuestions.map((item) => {
                const q = item.question;
                const isExpanded = expandedQid === q.id;
                const isCode = q.type === 'code';
                const codeQ = isCode ? (q as PublicCodeQuestion) : null;
                const mcqQ = !isCode ? (q as PublicMcqQuestion) : null;

                const questionTitle = isCode
                  ? codeQ?.title
                  : mcqQ?.prompt.split('\n')[0].slice(0, 80) + '...';

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(59,74,107,0.02)] overflow-hidden transition-all hover:border-slate-200"
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpand(q.id)}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/50"
                    >
                      <div className="flex items-start sm:items-center space-x-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCode
                              ? 'bg-[#EAEDF2] text-[#4A64B8]'
                              : 'bg-[#EDE9FE] text-[#8E7FBF]'
                          }`}
                        >
                          {isCode ? (
                            <Terminal className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold uppercase text-[#8A94AD]">
                              Q{item.qNumber} · Section {item.section.id} ({item.section.difficultyLabel})
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-[11px] font-semibold text-[#4A64B8]">
                              Weight x{item.section.weight}
                            </span>
                            {item.isAnswered && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Answered
                              </span>
                            )}
                            {item.isFlagged && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <Flag className="w-3 h-3" /> Flagged
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-[#3B4A6B] mt-0.5">
                            {questionTitle}
                          </h3>
                        </div>
                      </div>

                      {/* Right chips & actions */}
                      <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                        <div className="hidden md:flex items-center space-x-1.5">
                          {q.skills.slice(0, 2).map((sk) => (
                            <span
                              key={sk}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#EAEDF2] text-[#3B4A6B]"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStart(item.globalIndex);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#7B8AB8] hover:bg-[#6877A6] text-white text-xs font-semibold cursor-pointer shadow-2xs transition-colors flex items-center space-x-1"
                        >
                          <span>Solve</span>
                          <Play className="w-3 h-3 fill-current ml-1" />
                        </button>

                        <button
                          type="button"
                          className="p-1 rounded-lg text-[#8A94AD] hover:text-[#3B4A6B]"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Question Detail Drawer */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4 text-xs">
                        {/* MCQ Preview */}
                        {!isCode && mcqQ && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <span className="font-bold text-[#8A94AD] uppercase text-[10px]">
                                Question Prompt:
                              </span>
                              <p className="text-sm text-[#3B4A6B] leading-relaxed font-medium whitespace-pre-wrap">
                                {mcqQ.prompt}
                              </p>
                            </div>

                            {mcqQ.codeSnippet && (
                              <div className="bg-[#1E293B] text-slate-100 p-3.5 rounded-xl font-mono text-xs overflow-x-auto">
                                <pre>{mcqQ.codeSnippet}</pre>
                              </div>
                            )}

                            <div className="space-y-1.5 pt-1">
                              <span className="font-bold text-[#8A94AD] uppercase text-[10px]">
                                Options (4 choices):
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {mcqQ.options.map((opt, oIdx) => (
                                  <div
                                    key={opt.id}
                                    className="p-2.5 rounded-xl bg-white border border-slate-200/70 text-slate-700 flex items-start space-x-2"
                                  >
                                    <span className="font-bold text-[#4A64B8] shrink-0">
                                      {String.fromCharCode(65 + oIdx)}.
                                    </span>
                                    <span>{opt.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Coding Problem Preview */}
                        {isCode && codeQ && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <span className="font-bold text-[#8A94AD] uppercase text-[10px]">
                                Problem Statement:
                              </span>
                              <p className="text-sm text-[#3B4A6B] leading-relaxed whitespace-pre-wrap">
                                {codeQ.statement}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                                <span className="font-bold text-[#3B4A6B] block">
                                  Input Format:
                                </span>
                                <p className="text-slate-600 font-mono text-[11px]">
                                  {codeQ.inputFormat}
                                </p>
                              </div>
                              <div className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                                <span className="font-bold text-[#3B4A6B] block">
                                  Output Format:
                                </span>
                                <p className="text-slate-600 font-mono text-[11px]">
                                  {codeQ.outputFormat}
                                </p>
                              </div>
                            </div>

                            {/* Examples */}
                            {codeQ.examples && codeQ.examples.length > 0 && (
                              <div className="space-y-2 pt-1">
                                <span className="font-bold text-[#8A94AD] uppercase text-[10px]">
                                  Sample Test Examples:
                                </span>
                                <div className="space-y-2">
                                  {codeQ.examples.slice(0, 2).map((ex, eIdx) => (
                                    <div
                                      key={eIdx}
                                      className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-2 font-mono text-xs"
                                    >
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">
                                            Sample Input:
                                          </span>
                                          <div className="p-2 bg-slate-50 rounded-lg text-slate-800 whitespace-pre-wrap">
                                            {ex.input}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">
                                            Sample Output:
                                          </span>
                                          <div className="p-2 bg-slate-50 rounded-lg text-slate-800 whitespace-pre-wrap">
                                            {ex.output}
                                          </div>
                                        </div>
                                      </div>
                                      {ex.explanation && (
                                        <p className="text-[11px] font-sans text-slate-500 italic">
                                          Note: {ex.explanation}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Runtime constraints */}
                            <div className="flex items-center justify-between text-[11px] text-[#8A94AD] pt-2 border-t border-slate-200">
                              <span>Time Limit: {codeQ.timeLimitMs}ms · Memory: {codeQ.memoryLimitKb}KB</span>
                              <button
                                onClick={() => handleStart(item.globalIndex)}
                                className="text-[#4A64B8] font-bold hover:underline cursor-pointer flex items-center space-x-1"
                              >
                                <span>Open in Monaco Workspace</span>
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
