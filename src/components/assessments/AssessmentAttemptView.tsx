/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import {
  Clock,
  Flag,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Terminal,
  FileText,
  Code2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { clientApi } from '../../../lib/client/api.ts';
import {
  AssessmentAttempt,
  AssessmentResult,
  CodeQuestion,
  McqQuestion,
  PublicAssessmentDetail,
  PublicAssessmentQuestion,
  PublicCodeQuestion,
  PublicMcqQuestion,
} from '../../../lib/server/assessments/types.ts';
import { RunTestItemResult } from '../../../lib/types.ts';
import { Button, Card, Chip, Modal } from '../ui/index.tsx';

interface AssessmentAttemptViewProps {
  attemptId: string;
  onFinish: (result: AssessmentResult) => void;
  onExit: () => void;
  initialQuestionIndex?: number;
}

export const AssessmentAttemptView: React.FC<AssessmentAttemptViewProps> = ({
  attemptId,
  onFinish,
  onExit,
  initialQuestionIndex = 0,
}) => {
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [detail, setDetail] = useState<PublicAssessmentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active question index: 0 to 24
  const [currentIndex, setCurrentIndex] = useState<number>(initialQuestionIndex);

  // Flat list of 25 questions with their section metadata
  const [flatQuestions, setFlatQuestions] = useState<
    Array<{
      question: PublicAssessmentQuestion;
      sectionId: 'A' | 'B' | 'C';
      sectionTitle: string;
      difficultyLabel: 'Easy' | 'Medium' | 'Hard';
      qNumber: number; // 1 to 25
    }>
  >([]);

  // Local draft answers
  const [answers, setAnswers] = useState<
    Record<string, { choiceId?: string; code?: string; flagged?: boolean }>
  >({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Live timer
  const [remainingSeconds, setRemainingSeconds] = useState<number>(10800);

  // Monaco editor ref
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Coding results pane state
  const [codingTab, setCodingTab] = useState<'output' | 'tests' | 'ai'>('tests');
  const [runResults, setRunResults] = useState<RunTestItemResult[]>([]);
  const [running, setRunning] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [lastSubmissionInfo, setLastSubmissionInfo] = useState<{
    deterministic?: any;
    aiReview?: any;
    overallScore?: number;
    remainingSubmissions: number;
  } | null>(null);

  // Finish confirmation modal
  const [isFinishModalOpen, setIsFinishModalOpen] = useState<boolean>(false);
  const [finishing, setFinishing] = useState<boolean>(false);

  // Autosave timeout ref
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch initial attempt and assessment data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const att = await clientApi.getAttempt(attemptId);
      setAttempt(att);
      setAnswers(att.answers || {});
      setRemainingSeconds(att.remainingSeconds ?? 10800);

      // Extract 25 questions directly from getAttempt response
      const flat: Array<{
        question: PublicAssessmentQuestion;
        sectionId: 'A' | 'B' | 'C';
        sectionTitle: string;
        difficultyLabel: 'Easy' | 'Medium' | 'Hard';
        qNumber: number;
      }> = [];

      if (att.questions && att.questions.length > 0) {
        att.questions.forEach((q: any, idx: number) => {
          flat.push({
            question: q,
            sectionId: q.sectionId || (idx < 5 ? 'A' : idx < 15 ? 'B' : 'C'),
            sectionTitle:
              q.sectionTitle ||
              (idx < 5
                ? 'Section A: Easy'
                : idx < 15
                ? 'Section B: Medium'
                : 'Section C: Hard'),
            difficultyLabel:
              q.difficultyLabel || (idx < 5 ? 'Easy' : idx < 15 ? 'Medium' : 'Hard'),
            qNumber: idx + 1,
          });
        });
        setFlatQuestions(flat);
        setDetail({
          id: att.assessmentId,
          title: att.assessmentTitle || 'Python',
          domain: 'Python Engineering & System Architecture',
          description:
            'Evidence-based verification of core Python internals, data structures, algorithms, and real-life systems.',
          timeLimitMinutes: att.timeLimitMinutes || 180,
          totalQuestions: att.questions.length,
          totalMcq: 11,
          totalCode: 14,
          sections: [],
          sectionsDetailed: att.sectionsDetailed || [],
        });
      } else {
        const det = await clientApi.getAssessmentDetail(att.assessmentId);
        setDetail(det);

        let qCount = 0;
        for (const sec of det.sectionsDetailed) {
          for (const q of sec.questions || []) {
            qCount++;
            flat.push({
              question: q,
              sectionId: sec.id,
              sectionTitle: sec.title,
              difficultyLabel: sec.difficultyLabel,
              qNumber: qCount,
            });
          }
        }
        setFlatQuestions(flat);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment attempt');
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live countdown timer
  useEffect(() => {
    if (loading || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinish(); // Auto-finish when timer reaches zero
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, remainingSeconds]);

  // Integrity listeners: tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clientApi.recordAttemptEvent(attemptId, { type: 'tab_switch' }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [attemptId]);

  // Debounced server save
  const triggerAutoSave = (
    qid: string,
    updatedAnswer: { choiceId?: string; code?: string; flagged?: boolean }
  ) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await clientApi.saveAnswer(attemptId, {
          qid,
          ...updatedAnswer,
        });
        setSaveStatus('saved');
      } catch {
        // Fallback: keep local state
        setSaveStatus('saved');
      }
    }, 1000);
  };

  // Handle MCQ answer selection
  const handleSelectOption = (qid: string, choiceId: string) => {
    setAnswers((prev) => {
      const updated = {
        ...prev,
        [qid]: {
          ...prev[qid],
          choiceId,
        },
      };
      triggerAutoSave(qid, updated[qid]);
      return updated;
    });
  };

  // Handle Code changes
  const handleCodeChange = (qid: string, code: string) => {
    setAnswers((prev) => {
      const updated = {
        ...prev,
        [qid]: {
          ...prev[qid],
          code,
        },
      };
      triggerAutoSave(qid, updated[qid]);
      return updated;
    });
  };

  // Toggle flag on current question
  const handleToggleFlag = (qid: string) => {
    setAnswers((prev) => {
      const currentFlag = prev[qid]?.flagged || false;
      const updated = {
        ...prev,
        [qid]: {
          ...prev[qid],
          flagged: !currentFlag,
        },
      };
      triggerAutoSave(qid, updated[qid]);
      return updated;
    });
  };

  // Run visible tests
  const handleRunCode = async (qid: string) => {
    const currentCode = answers[qid]?.code || '';
    setRunning(true);
    setCodingTab('tests');
    try {
      const res = await clientApi.runAssessmentCode(attemptId, qid, {
        code: currentCode,
        customInput: showCustomInput ? customInput : undefined,
      });
      setRunResults(res.results);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to execute code');
    } finally {
      setRunning(false);
    }
  };

  // Submit coding problem against all tests (max 3 times)
  const handleSubmitCode = async (qid: string) => {
    const currentCode = answers[qid]?.code || '';
    setSubmitting(true);
    try {
      const res = await clientApi.submitAssessmentCode(attemptId, qid, {
        code: currentCode,
      });
      setLastSubmissionInfo(res);
      setCodingTab('ai');

      // Update attempt submissions count locally
      setAttempt((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          submissionsCountByQid: {
            ...prev.submissionsCountByQid,
            [qid]: (prev.submissionsCountByQid[qid] || 0) + 1,
          },
        };
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Finish assessment
  const handleFinish = async () => {
    setFinishing(true);
    try {
      const res = await clientApi.finishAssessmentAttempt(attemptId);
      setIsFinishModalOpen(false);
      onFinish(res);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to finish assessment');
      setFinishing(false);
    }
  };

  // Calculate unanswered questions count
  const unansweredCount = flatQuestions.reduce((count, item) => {
    const a = answers[item.question.id];
    if (item.question.type === 'mcq') {
      return a?.choiceId ? count : count + 1;
    } else {
      const subCount = attempt?.submissionsCountByQid[item.question.id] || 0;
      return subCount > 0 ? count : count + 1;
    }
  }, 0);

  // Format timer HH:MM:SS
  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="space-y-4 -mt-2 animate-pulse">
        {/* Top Bar Skeleton */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-32 bg-slate-200 rounded-md" />
            <span className="text-slate-300">|</span>
            <div className="h-4 w-28 bg-slate-200 rounded-md" />
            <div className="h-5 w-14 bg-slate-200 rounded-full" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-slate-200 rounded-full" />
            <div className="h-5 w-20 bg-slate-200 rounded-md font-mono" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-4 w-12 bg-slate-200 rounded-md" />
            <div className="h-8 w-20 bg-slate-200 rounded-lg" />
            <div className="h-8 w-32 bg-slate-200 rounded-lg" />
          </div>
        </div>

        {/* 2-Column Main Workspace Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Palette Skeleton */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="h-4 w-28 bg-slate-200 rounded-md" />
                <div className="h-3 w-16 bg-slate-100 rounded-md" />
              </div>

              {/* Section A Skeleton */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
                  <div className="h-3 w-12 bg-slate-100 rounded-md" />
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={`skel-a-${i}`} className="h-8 rounded bg-slate-100" />
                  ))}
                </div>
              </div>

              {/* Section B Skeleton */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-28 bg-slate-200 rounded-md" />
                  <div className="h-3 w-16 bg-slate-100 rounded-md" />
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={`skel-b-${i}`} className="h-8 rounded bg-slate-100" />
                  ))}
                </div>
              </div>

              {/* Section C Skeleton */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
                  <div className="h-3 w-14 bg-slate-100 rounded-md" />
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={`skel-c-${i}`} className="h-8 rounded bg-slate-100" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Question Area Skeleton */}
          <div className="lg:col-span-9 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="space-y-2">
                <div className="h-6 w-3/4 bg-slate-200 rounded-md" />
                <div className="h-4 w-full bg-slate-100 rounded-md" />
                <div className="h-4 w-5/6 bg-slate-100 rounded-md" />
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="h-12 w-full bg-slate-100 rounded-xl" />
                <div className="h-12 w-full bg-slate-100 rounded-xl" />
                <div className="h-12 w-full bg-slate-100 rounded-xl" />
                <div className="h-12 w-full bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !detail || flatQuestions.length === 0) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-2 text-rose-800">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-semibold text-sm">Failed to load attempt</h3>
        </div>
        <p className="text-xs text-rose-700">{error || 'Attempt or questions unavailable'}</p>
        <Button variant="secondary" size="sm" onClick={fetchData}>
          Retry
        </Button>
      </div>
    );
  }

  const activeItem = flatQuestions[currentIndex];
  const activeQuestion = activeItem.question;
  const isMcq = activeQuestion.type === 'mcq';
  const activeMcq = isMcq ? (activeQuestion as PublicMcqQuestion) : null;
  const activeCode = !isMcq ? (activeQuestion as PublicCodeQuestion) : null;
  const currentAnswer = answers[activeQuestion.id];
  const isFlagged = Boolean(currentAnswer?.flagged);
  const submissionsLeft = 3 - (attempt?.submissionsCountByQid[activeQuestion.id] || 0);

  return (
    <div className="space-y-4 -mt-2">
      {/* Top Bar matching spec */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-16 z-10">
        {/* Left: Title & Question number */}
        <div className="flex items-center space-x-3">
          <span className="font-bold text-sm text-slate-900">{detail.title}</span>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-semibold text-slate-700">
            Question {activeItem.qNumber} of 25
          </span>
          <Chip
            label={activeItem.difficultyLabel}
            variant={
              activeItem.difficultyLabel === 'Easy'
                ? 'neutral'
                : activeItem.difficultyLabel === 'Medium'
                ? 'warning'
                : 'danger'
            }
          />
        </div>

        {/* Center: Live countdown timer */}
        <div className="flex items-center space-x-2 self-start sm:self-center">
          <Clock
            className={`w-4 h-4 ${remainingSeconds < 900 ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`}
          />
          <span
            className={`text-sm font-mono font-bold tabular-nums ${
              remainingSeconds < 900 ? 'text-amber-700' : 'text-slate-900'
            }`}
          >
            {formatTimer(remainingSeconds)}
          </span>
        </div>

        {/* Right: Save status, Flag, Finish button */}
        <div className="flex items-center space-x-3 self-end sm:self-center">
          <span className="text-xs text-slate-400 font-mono">
            {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
          </span>

          <button
            onClick={() => handleToggleFlag(activeQuestion.id)}
            className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isFlagged
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsFinishModalOpen(true)}
          >
            Finish Assessment
          </Button>
        </div>
      </div>

      {/* Main 2-column layout: Left (Palette) & Right (Work Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left sidebar palette: Grouped by the three sections */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Question Palette
              </span>
              <span className="text-[11px] text-slate-400">
                {25 - unansweredCount}/25 complete
              </span>
            </div>

            {/* Section A: Easy 1–5 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Section A: Easy</span>
                <span className="text-[10px] text-slate-400">5 MCQs</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {flatQuestions.slice(0, 5).map((item, idx) => {
                  const qAns = answers[item.question.id];
                  const hasAnswered = Boolean(qAns?.choiceId);
                  const isCurrent = currentIndex === idx;
                  const flagged = Boolean(qAns?.flagged);

                  return (
                    <button
                      key={item.question.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-8 rounded text-xs font-medium flex items-center justify-center transition-all relative cursor-pointer ${
                        isCurrent
                          ? 'ring-2 ring-slate-900 bg-slate-900 text-white font-bold'
                          : hasAnswered
                          ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.qNumber}
                      {flagged && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section B: Medium 6–15 */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Section B: Medium</span>
                <span className="text-[10px] text-slate-400">6 MCQ · 4 Code</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {flatQuestions.slice(5, 15).map((item, idx) => {
                  const actualIdx = idx + 5;
                  const qAns = answers[item.question.id];
                  const isCoding = item.question.type === 'code';
                  const hasAnswered = isCoding
                    ? (attempt?.submissionsCountByQid[item.question.id] || 0) > 0
                    : Boolean(qAns?.choiceId);
                  const isCurrent = currentIndex === actualIdx;
                  const flagged = Boolean(qAns?.flagged);

                  return (
                    <button
                      key={item.question.id}
                      onClick={() => setCurrentIndex(actualIdx)}
                      className={`h-8 rounded text-xs font-medium flex items-center justify-center transition-all relative cursor-pointer ${
                        isCurrent
                          ? 'ring-2 ring-slate-900 bg-slate-900 text-white font-bold'
                          : hasAnswered
                          ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.qNumber}
                      {isCoding && (
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono leading-none text-slate-400">
                          c
                        </span>
                      )}
                      {flagged && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section C: Hard 16–25 */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Section C: Hard</span>
                <span className="text-[10px] text-slate-400">10 Code</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {flatQuestions.slice(15, 25).map((item, idx) => {
                  const actualIdx = idx + 15;
                  const qAns = answers[item.question.id];
                  const hasSubmitted =
                    (attempt?.submissionsCountByQid[item.question.id] || 0) > 0;
                  const isCurrent = currentIndex === actualIdx;
                  const flagged = Boolean(qAns?.flagged);

                  return (
                    <button
                      key={item.question.id}
                      onClick={() => setCurrentIndex(actualIdx)}
                      className={`h-8 rounded text-xs font-medium flex items-center justify-center transition-all relative cursor-pointer ${
                        isCurrent
                          ? 'ring-2 ring-slate-900 bg-slate-900 text-white font-bold'
                          : hasSubmitted
                          ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.qNumber}
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono leading-none text-slate-400">
                        c
                      </span>
                      {flagged && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Palette legend */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-900" />
                <span>Current</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-200" />
                <span>Answered</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span>Flagged</span>
              </span>
            </div>
          </Card>
        </div>

        {/* Right main area: Either MCQ view OR Coding workspace */}
        <div className="lg:col-span-9 space-y-4">
          {/* MCQ VIEW */}
          {isMcq && activeMcq && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900">
                    Question {activeItem.qNumber}
                  </span>
                  <span>·</span>
                  <span>{activeItem.sectionTitle}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {activeMcq.skills.map((s) => (
                    <span key={s} className="font-mono text-[11px] text-slate-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-slate-900 leading-relaxed">
                  {activeMcq.prompt}
                </h2>

                {activeMcq.codeSnippet && (
                  <pre className="p-3.5 bg-slate-950 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800">
                    {activeMcq.codeSnippet}
                  </pre>
                )}
              </div>

              {/* 4 Option cards */}
              <div className="space-y-2.5 pt-2">
                {activeMcq.options.map((opt) => {
                  const isSelected = currentAnswer?.choiceId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(activeMcq.id, opt.id)}
                      className={`p-3.5 rounded-lg border text-xs flex items-start space-x-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 font-medium text-slate-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => handleSelectOption(activeMcq.id, opt.id)}
                        className="mt-0.5 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="flex-1 leading-relaxed">{opt.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Nav actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Previous</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(flatQuestions.length - 1, prev + 1))
                  }
                  disabled={currentIndex === flatQuestions.length - 1}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          )}

          {/* CODING WORKSPACE */}
          {!isMcq && activeCode && (
            <div className="space-y-4">
              {/* Question Header & Submissions info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {activeItem.qNumber}. {activeCode.title}
                  </h2>
                  <p className="text-xs text-slate-500">{activeItem.sectionTitle}</p>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-mono text-slate-500">
                    Submissions remaining: <strong className="text-slate-900">{submissionsLeft}/3</strong>
                  </span>
                </div>
              </div>

              {/* Coding 3-Pane Area: Description (top/left) + Monaco (center) + Results (bottom) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Pane 1: Problem statement & constraints (4 cols on lg) */}
                <Card className="lg:col-span-4 p-4 space-y-4 max-h-[620px] overflow-y-auto text-xs">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Problem Statement</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                      {activeCode.statement}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Input Format</h3>
                    <p className="text-slate-600 font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                      {activeCode.inputFormat}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Output Format</h3>
                    <p className="text-slate-600 font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                      {activeCode.outputFormat}
                    </p>
                  </div>

                  {activeCode.examples && activeCode.examples.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-900">Examples</h3>
                      {activeCode.examples.map((ex, i) => (
                        <div key={i} className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1.5">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Input:</span>
                            <pre className="font-mono text-[11px] text-slate-800 whitespace-pre-wrap">{ex.input}</pre>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Output:</span>
                            <pre className="font-mono text-[11px] text-slate-800 whitespace-pre-wrap">{ex.output}</pre>
                          </div>
                          {ex.explanation && (
                            <p className="text-[11px] text-slate-500 italic">{ex.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeCode.constraints && activeCode.constraints.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Constraints</h3>
                      <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-0.5">
                        {activeCode.constraints.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>

                {/* Pane 2 & 3: Monaco Editor & Output (8 cols on lg) */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Monaco Editor Container */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Terminal className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono text-slate-700 font-medium">solution.py</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Autosaves continuously</span>
                    </div>

                    <div className="h-[380px] w-full">
                      <Editor
                        height="100%"
                        language="python"
                        value={currentAnswer?.code ?? activeCode.starterCode.python}
                        onChange={(value) => handleCodeChange(activeCode.id, value || '')}
                        onMount={(editor) => {
                          editorRef.current = editor;
                        }}
                        options={{
                          fontSize: 13,
                          lineNumbers: 'on',
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 4,
                          insertSpaces: true,
                        }}
                      />
                    </div>

                    {/* Editor Action Bar */}
                    <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowCustomInput(!showCustomInput)}
                          className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer underline text-[11px]"
                        >
                          {showCustomInput ? 'Hide custom input' : 'Use custom input'}
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRunCode(activeCode.id)}
                          disabled={running || submitting}
                        >
                          {running ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              <span>Running...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 mr-1.5" />
                              <span>Run Visible Tests</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSubmitCode(activeCode.id)}
                          disabled={submitting || running || submissionsLeft <= 0}
                        >
                          {submitting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 mr-1.5" />
                              <span>Submit Solution ({submissionsLeft} left)</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Custom input box */}
                  {showCustomInput && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Custom Standard Input</label>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Paste standard input for testing..."
                        className="w-full h-16 p-2 text-xs font-mono border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  )}

                  {/* Pane 3: Tabs Output / Tests / AI Review */}
                  <Card className="p-4 space-y-3">
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                      <button
                        onClick={() => setCodingTab('tests')}
                        className={`text-xs font-medium px-3 py-1 rounded-md transition-colors cursor-pointer ${
                          codingTab === 'tests'
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Visible Tests ({runResults.length})
                      </button>
                      <button
                        onClick={() => setCodingTab('output')}
                        className={`text-xs font-medium px-3 py-1 rounded-md transition-colors cursor-pointer ${
                          codingTab === 'output'
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Execution Output
                      </button>
                      <button
                        onClick={() => setCodingTab('ai')}
                        className={`text-xs font-medium px-3 py-1 rounded-md transition-colors cursor-pointer ${
                          codingTab === 'ai'
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Submission & AI Review
                      </button>
                    </div>

                    {/* Tab 1: Visible Tests */}
                    {codingTab === 'tests' && (
                      <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                        {runResults.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 text-center">
                            Click "Run Visible Tests" to evaluate your solution against sample cases.
                          </p>
                        ) : (
                          runResults.map((r, i) => (
                            <div
                              key={i}
                              className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                                r.verdict === 'Passed'
                                  ? 'bg-emerald-50/50 border-emerald-200'
                                  : 'bg-rose-50/50 border-rose-200'
                              }`}
                            >
                              <div className="flex items-center justify-between font-medium">
                                <span className="text-slate-800">Test Case {r.index}</span>
                                <span
                                  className={
                                    r.verdict === 'Passed' ? 'text-emerald-700' : 'text-rose-700'
                                  }
                                >
                                  {r.verdict}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                <div>
                                  <span className="text-slate-400">Expected:</span>
                                  <div className="p-1 bg-white rounded border border-slate-100 whitespace-pre-wrap">
                                    {r.expected}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Actual:</span>
                                  <div className="p-1 bg-white rounded border border-slate-100 whitespace-pre-wrap">
                                    {r.output || r.error || 'Empty'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Tab 2: Execution Output */}
                    {codingTab === 'output' && (
                      <div className="text-xs space-y-2">
                        {runResults.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 text-center">No execution output recorded yet.</p>
                        ) : (
                          <pre className="p-3 bg-slate-950 text-slate-100 rounded-md font-mono text-xs overflow-x-auto max-h-48">
                            {runResults.map((r) => `Test ${r.index} [${r.verdict}]:\n${r.output || r.error}`).join('\n\n')}
                          </pre>
                        )}
                      </div>
                    )}

                    {/* Tab 3: Submission & AI Review */}
                    {codingTab === 'ai' && (
                      <div className="text-xs space-y-3">
                        {!lastSubmissionInfo ? (
                          <p className="text-xs text-slate-400 py-3 text-center">
                            Submit your solution to run hidden test verification and trigger structured AI code review.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                              <div>
                                <span className="font-semibold text-slate-900">
                                  Correctness: {lastSubmissionInfo.deterministic?.correctness}%
                                </span>
                                <p className="text-[11px] text-slate-500">
                                  Visible: {lastSubmissionInfo.deterministic?.visiblePassed}/
                                  {lastSubmissionInfo.deterministic?.visibleTotal} · Hidden:{' '}
                                  {lastSubmissionInfo.deterministic?.hiddenPassed}/
                                  {lastSubmissionInfo.deterministic?.hiddenTotal}
                                </p>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-900">
                                Overall Score: {lastSubmissionInfo.overallScore}/100
                              </span>
                            </div>

                            {lastSubmissionInfo.aiReview?.opinion && (
                              <div className="p-3 border border-slate-100 rounded-lg space-y-1">
                                <span className="font-semibold text-slate-700">AI Second Opinion:</span>
                                <p className="text-xs text-slate-600">
                                  {lastSubmissionInfo.aiReview.opinion.reasoning}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>

                  {/* Navigation row */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      <span>Previous Question</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setCurrentIndex((prev) => Math.min(flatQuestions.length - 1, prev + 1))
                      }
                      disabled={currentIndex === flatQuestions.length - 1}
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Finish Confirmation Modal */}
      <Modal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        title="Finish Assessment"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to finalize your assessment? Once submitted, your answers will be
            locked and graded.
          </p>

          {unansweredCount > 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Warning:</strong> You have{' '}
                <span className="font-bold underline">{unansweredCount}</span> unanswered question
                {unansweredCount > 1 ? 's' : ''}. Unanswered questions will receive a score of 0.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All 25 questions have draft answers or submitted code!</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFinishModalOpen(false)}
              disabled={finishing}
            >
              Back to Questions
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleFinish}
              disabled={finishing}
            >
              {finishing ? 'Grading & Issuing Badge...' : 'Submit & Finish'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
