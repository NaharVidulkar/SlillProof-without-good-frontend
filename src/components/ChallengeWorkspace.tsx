/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import {
  ArrowLeft,
  Play,
  Send,
  RotateCcw,
  Clock,
  Award,
  Layers,
  FileCode2,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Lock,
  Terminal,
  Save,
  Check,
  AlertCircle,
  RefreshCw,
  XCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { clientApi } from '../../lib/client/api.ts';
import {
  PublicProblem,
  RunTestItemResult,
  Submission,
  SupportedLanguage,
} from '../../lib/types.ts';

interface ChallengeWorkspaceProps {
  problem: PublicProblem;
  onBack: () => void;
  onSubmissionComplete?: () => void;
}

type ProblemTab = 'description' | 'examples' | 'constraints';
type OutputTab = 'output' | 'tests' | 'ai-review';

export const ChallengeWorkspace: React.FC<ChallengeWorkspaceProps> = ({
  problem,
  onBack,
  onSubmissionComplete,
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState<string>('');
  const [problemTab, setProblemTab] = useState<ProblemTab>('description');
  const [outputTab, setOutputTab] = useState<OutputTab>('tests');
  const [selectedTestIndex, setSelectedTestIndex] = useState<number>(0);
  const [savedStatus, setSavedStatus] = useState<string>('Saved locally');

  // Custom Input State
  const [useCustomInput, setUseCustomInput] = useState<boolean>(false);
  const [customInputText, setCustomInputText] = useState<string>('');

  // Run State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runResults, setRunResults] = useState<RunTestItemResult[] | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionProgress, setSubmissionProgress] = useState<string>('');
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Monaco Editor Reference for line highlighting
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationsCollectionRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const highlightLine = (line: number) => {
    if (!editorRef.current) return;
    editorRef.current.revealLineInCenter(line);
    editorRef.current.setPosition({ lineNumber: line, column: 1 });
    editorRef.current.focus();

    if (decorationsCollectionRef.current) {
      decorationsCollectionRef.current.clear();
    }

    decorationsCollectionRef.current = editorRef.current.createDecorationsCollection([
      {
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1000,
        },
        options: {
          isWholeLine: true,
          className: 'bg-indigo-900/40 border-l-4 border-indigo-400',
        },
      },
    ]);
  };

  // Load code from localStorage or fallback to starter code
  const loadCodeForLanguage = useCallback(
    (lang: SupportedLanguage) => {
      const storageKey = `skillproof_code_${problem.id}_${lang}`;
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setCode(saved);
      } else {
        setCode(problem.starterCode[lang] || '');
      }
    },
    [problem.id, problem.starterCode]
  );

  useEffect(() => {
    loadCodeForLanguage(language);
  }, [language, loadCodeForLanguage]);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value ?? '';
    setCode(newCode);
    const storageKey = `skillproof_code_${problem.id}_${language}`;
    localStorage.setItem(storageKey, newCode);
    setSavedStatus('Saving...');
    setTimeout(() => {
      setSavedStatus('Saved locally');
    }, 400);
  };

  const handleResetStarter = () => {
    const starter = problem.starterCode[language] || '';
    setCode(starter);
    const storageKey = `skillproof_code_${problem.id}_${language}`;
    localStorage.setItem(storageKey, starter);
    setSavedStatus('Reset to starter code');
    setTimeout(() => {
      setSavedStatus('Saved locally');
    }, 1500);
  };

  // Run Code against visible tests or custom input
  const handleRun = async () => {
    setIsRunning(true);
    setRunError(null);
    setOutputTab(useCustomInput ? 'output' : 'tests');

    try {
      const res = await clientApi.runCode({
        problemId: problem.id,
        language,
        code,
        customInput: useCustomInput ? customInputText : undefined,
      });
      setRunResults(res.results);
      if (useCustomInput) {
        setOutputTab('output');
      } else {
        setOutputTab('tests');
        setSelectedTestIndex(0);
      }
    } catch (err: unknown) {
      setRunError(err instanceof Error ? err.message : 'Execution failed');
      setOutputTab('output');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution against hidden test cases
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setCurrentSubmission(null);
    setSubmissionProgress('Queued submission in testing pipeline...');
    setOutputTab('tests');

    try {
      const { submissionId } = await clientApi.submitSolution({
        problemId: problem.id,
        language,
        code,
      });

      // Poll every 1.5 seconds for completion
      const maxPolls = 30;
      let polls = 0;

      const pollInterval = setInterval(async () => {
        polls++;
        try {
          const sub = await clientApi.getSubmission(submissionId);
          if (sub.status === 'completed') {
            clearInterval(pollInterval);
            setIsSubmitting(false);
            setCurrentSubmission(sub);
            setSubmissionProgress('Evaluation completed!');
            onSubmissionComplete?.();
          } else if (sub.status === 'failed') {
            clearInterval(pollInterval);
            setIsSubmitting(false);
            setSubmitError(sub.error || 'Evaluation failed on remote runner');
          } else {
            setSubmissionProgress(`Evaluating hidden test suites (${polls * 1.5}s)...`);
          }
        } catch (err) {
          if (polls >= maxPolls) {
            clearInterval(pollInterval);
            setIsSubmitting(false);
            setSubmitError('Polling timed out waiting for runner completion');
          }
        }

        if (polls >= maxPolls) {
          clearInterval(pollInterval);
          setIsSubmitting(false);
          setSubmitError('Submission timed out');
        }
      }, 1500);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : 'Submission initiation failed');
    }
  };

  const monacoLanguage = language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'python';

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
      {/* Top Workspace Toolbar */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 text-slate-300 hover:text-white text-xs font-medium px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Challenges</span>
          </button>

          <span className="text-slate-600">|</span>

          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-bold tracking-tight text-white">{problem.title}</h1>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                problem.difficulty === 'Easy'
                  ? 'bg-emerald-900 text-emerald-300'
                  : problem.difficulty === 'Medium'
                  ? 'bg-amber-900 text-amber-300'
                  : 'bg-rose-900 text-rose-300'
              }`}
            >
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center space-x-3">
          {/* Custom Input Toggle */}
          <button
            onClick={() => setUseCustomInput(!useCustomInput)}
            className={`text-xs px-2 py-1 rounded transition-colors flex items-center space-x-1 cursor-pointer ${
              useCustomInput ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <span>Custom Stdin</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-800 px-2 py-1 rounded">
            <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="python" className="bg-slate-900 text-white">
                Python 3
              </option>
              <option value="java" className="bg-slate-900 text-white">
                Java (Main.java)
              </option>
              <option value="cpp" className="bg-slate-900 text-white">
                C++ (g++)
              </option>
            </select>
          </div>

          {/* Reset Code */}
          <button
            onClick={handleResetStarter}
            title="Reset to starter code"
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Saved Status Indicator */}
          <span className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-400 font-mono">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>{savedStatus}</span>
          </span>

          {/* Action Buttons: Run & Submit */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded cursor-pointer transition-colors disabled:opacity-50"
            >
              <Play className={`w-3 h-3 text-emerald-400 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded cursor-pointer transition-colors shadow-xs disabled:opacity-50"
            >
              <Send className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Pane: Problem Details & Constraints (Col 5) */}
        <div className="lg:col-span-5 border-r border-slate-200 flex flex-col bg-white overflow-hidden">
          {/* Problem Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2">
            <button
              onClick={() => setProblemTab('description')}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                problemTab === 'description'
                  ? 'border-slate-900 text-slate-900 bg-white rounded-t'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setProblemTab('examples')}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                problemTab === 'examples'
                  ? 'border-slate-900 text-slate-900 bg-white rounded-t'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Examples ({problem.examples.length})
            </button>
            <button
              onClick={() => setProblemTab('constraints')}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                problemTab === 'constraints'
                  ? 'border-slate-900 text-slate-900 bg-white rounded-t'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Constraints & Rules
            </button>
          </div>

          {/* Problem Tab Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-slate-800 text-xs leading-relaxed">
            {problemTab === 'description' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-500 pb-2 border-b border-slate-100">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Estimated Time: {problem.timeEstimateMin} minutes</span>
                  <span>·</span>
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>{problem.points} Points</span>
                </div>

                <div className="whitespace-pre-line font-normal text-slate-700 leading-normal text-xs">
                  {problem.description}
                </div>

                <div className="pt-2">
                  <h4 className="font-semibold text-slate-900 mb-2">Verified Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {problem.skills.map((s) => (
                      <span
                        key={s}
                        className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {problemTab === 'examples' && (
              <div className="space-y-4">
                {problem.examples.map((ex, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-md p-3 bg-slate-50/75 space-y-2">
                    <div className="font-semibold text-slate-800 text-xs">Example {idx + 1}</div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium mb-1">Standard Input:</div>
                      <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[11px] overflow-x-auto whitespace-pre">
                        {ex.input}
                      </pre>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium mb-1">Standard Output:</div>
                      <pre className="bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-[11px] overflow-x-auto whitespace-pre">
                        {ex.output}
                      </pre>
                    </div>
                    {ex.note && (
                      <p className="text-[11px] text-slate-600 italic mt-1 bg-white p-2 rounded border border-slate-100">
                        <strong>Explanation:</strong> {ex.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {problemTab === 'constraints' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Input Constraints & Specifications:</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                    {problem.constraints.map((c, idx) => (
                      <li key={idx} className="font-mono text-[11px]">{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                  <div className="font-semibold text-slate-900 text-xs">Execution Limits:</div>
                  <div className="text-slate-600 text-[11px]">
                    · Maximum Execution Time: <strong>{problem.timeLimitMs} ms</strong>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    · Maximum Memory Allocation: <strong>{problem.memoryLimitKb / 1024} MB</strong>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    · Output Truncation Limit: <strong>&lt; 900 chars</strong> (Strictly enforced)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Monaco Editor + Output / Tests Tabs (Col 7) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 overflow-hidden">
          {/* Custom Input Drawer (if open) */}
          {useCustomInput && (
            <div className="bg-slate-950 p-2 border-b border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1 font-mono flex items-center justify-between">
                <span>Custom Stdin:</span>
                <span className="text-[10px] text-slate-500">Will be provided on standard input</span>
              </div>
              <textarea
                rows={2}
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                placeholder="Enter custom input lines here..."
                className="w-full bg-slate-900 text-slate-200 text-xs font-mono p-2 rounded border border-slate-800 focus:outline-none"
              />
            </div>
          )}

          {/* Monaco Editor View */}
          <div className="flex-1 relative min-h-[300px]">
            <Editor
              height="100%"
              theme="vs-dark"
              language={monacoLanguage}
              value={code}
              onMount={handleEditorMount}
              onChange={handleEditorChange}
              options={{
                fontSize: 13,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
                insertSpaces: true,
                automaticLayout: true,
                wordWrap: 'on',
                renderWhitespace: 'selection',
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              }}
            />
          </div>

          {/* Bottom Output / Tests / Review Panel */}
          <div className="h-64 bg-slate-950 border-t border-slate-800 flex flex-col">
            {/* Panel Tabs Header */}
            <div className="flex items-center justify-between px-3 pt-1.5 bg-slate-900 border-b border-slate-800">
              <div className="flex space-x-1">
                <button
                  onClick={() => setOutputTab('tests')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
                    outputTab === 'tests'
                      ? 'border-indigo-500 text-white bg-slate-950 rounded-t'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Test Suites{' '}
                    {currentSubmission ? `(${currentSubmission.deterministic?.correctness}% Passed)` : ''}
                  </span>
                </button>

                <button
                  onClick={() => setOutputTab('output')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
                    outputTab === 'output'
                      ? 'border-indigo-500 text-white bg-slate-950 rounded-t'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Console & Run Output</span>
                </button>

                <button
                  onClick={() => setOutputTab('ai-review')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
                    outputTab === 'ai-review'
                      ? 'border-indigo-500 text-white bg-slate-950 rounded-t'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Review {currentSubmission?.aiReview ? '✓' : ''}</span>
                </button>
              </div>

              {/* Status & Badges */}
              <div className="flex items-center space-x-2 text-[11px]">
                {currentSubmission?.deterministic && (
                  <span className="flex items-center space-x-1 bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 font-mono">
                    <Lock className="w-3 h-3 text-indigo-400" />
                    <span>Deterministic: {currentSubmission.deterministic.correctness}%</span>
                  </span>
                )}

                {currentSubmission?.needsReview && (
                  <span className="flex items-center space-x-1 bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>Needs Review</span>
                  </span>
                )}
              </div>
            </div>

            {/* Panel Content Body */}
            <div className="flex-1 p-3 overflow-y-auto text-xs text-slate-300 font-mono">
              {/* Submission in progress stepper */}
              {isSubmitting && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                  <p className="text-xs text-slate-300 font-sans font-medium">{submissionProgress}</p>
                  <div className="text-[11px] text-slate-500 font-sans">
                    Visible tests → Hidden edge cases → Deterministic calculation → Gemini review
                  </div>
                </div>
              )}

              {/* Submit Error */}
              {!isSubmitting && submitError && (
                <div className="bg-red-950/70 border border-red-800 p-3 rounded mb-2 text-red-200 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-xs">Submission Error</div>
                    <div className="text-[11px] mt-0.5">{submitError}</div>
                  </div>
                </div>
              )}

              {/* Tests Tab */}
              {!isSubmitting && outputTab === 'tests' && (
                <div className="space-y-3 font-sans">
                  {/* Selector for Visible tests and Hidden tests */}
                  <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2">
                    <span className="text-[11px] text-slate-400 mr-1">Visible:</span>
                    {problem.visibleTests.map((_, idx) => {
                      const runResult = runResults?.[idx];
                      const subResult = currentSubmission?.visibleTestResults?.[idx];
                      const verdict = subResult?.verdict || runResult?.verdict;
                      const isPassed = verdict === 'Passed';
                      const isFailed = verdict && verdict !== 'Passed';

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedTestIndex(idx)}
                          className={`px-2 py-1 text-xs rounded font-medium cursor-pointer transition-colors flex items-center space-x-1 ${
                            selectedTestIndex === idx
                              ? 'bg-slate-800 text-white font-bold border border-slate-700'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          {isPassed && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                          {isFailed && <XCircle className="w-3 h-3 text-red-400" />}
                          <span>Test {idx + 1}</span>
                        </button>
                      );
                    })}

                    {currentSubmission?.hiddenTestResults && (
                      <>
                        <span className="text-[11px] text-slate-400 ml-3 mr-1 flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>Hidden:</span>
                        </span>
                        {currentSubmission.hiddenTestResults.map((ht, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 text-[11px] rounded font-mono flex items-center space-x-1 ${
                              ht.verdict === 'Passed'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-900'
                                : 'bg-red-950 text-red-300 border border-red-900'
                            }`}
                          >
                            <span>H{ht.index}</span>
                            <span className="text-[9px] text-slate-400">({ht.category})</span>
                          </span>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Selected Test Detail */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Standard Input:</div>
                      <pre className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-200 whitespace-pre overflow-x-auto text-[11px] font-mono">
                        {problem.visibleTests[selectedTestIndex]?.input}
                      </pre>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                        <span>Expected Output:</span>
                        {runResults?.[selectedTestIndex] && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              runResults[selectedTestIndex].verdict === 'Passed'
                                ? 'bg-emerald-900 text-emerald-300'
                                : 'bg-red-900 text-red-300'
                            }`}
                          >
                            {runResults[selectedTestIndex].verdict}
                          </span>
                        )}
                      </div>
                      <pre className="bg-slate-900 p-2.5 rounded border border-slate-800 text-emerald-400 whitespace-pre overflow-x-auto text-[11px] font-mono">
                        {problem.visibleTests[selectedTestIndex]?.expected}
                      </pre>
                    </div>
                  </div>

                  {/* Actual Run Output for selected test */}
                  {runResults?.[selectedTestIndex] && (
                    <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 font-mono text-[11px]">
                      <div className="text-slate-400 text-[10px] mb-1 flex items-center justify-between">
                        <span>Your Program Output:</span>
                        <span>
                          {runResults[selectedTestIndex].timeSec}s · {runResults[selectedTestIndex].memoryKb} KB
                        </span>
                      </div>
                      <pre className="text-slate-100 whitespace-pre overflow-x-auto">
                        {runResults[selectedTestIndex].output || '(No stdout)'}
                      </pre>
                      {runResults[selectedTestIndex].error && (
                        <pre className="text-red-400 whitespace-pre mt-1">
                          {runResults[selectedTestIndex].error}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Output Tab */}
              {!isSubmitting && outputTab === 'output' && (
                <div className="space-y-3 font-mono">
                  {isRunning && (
                    <div className="flex items-center space-x-2 text-slate-400 py-4">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Executing code via isolated runner...</span>
                    </div>
                  )}

                  {!isRunning && runError && (
                    <div className="bg-red-950 border border-red-800 p-3 rounded text-red-200">
                      <div className="font-semibold text-xs">Runtime Error</div>
                      <div className="text-[11px] mt-1">{runError}</div>
                    </div>
                  )}

                  {!isRunning && runResults && (
                    <div className="space-y-2">
                      <div className="text-slate-400 text-xs flex items-center justify-between border-b border-slate-800 pb-1">
                        <span>Execution Results ({runResults.length} tests):</span>
                        <span>
                          {runResults.every((r) => r.verdict === 'Passed') ? (
                            <span className="text-emerald-400 font-bold">ALL PASSED</span>
                          ) : (
                            <span className="text-amber-400 font-bold">SOME FAILED</span>
                          )}
                        </span>
                      </div>

                      {runResults.map((r, idx) => (
                        <div key={idx} className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                          <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px]">
                            <span>Test #{r.index}</span>
                            <span
                              className={`font-bold px-1.5 py-0.5 rounded ${
                                r.verdict === 'Passed'
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-red-950 text-red-300'
                              }`}
                            >
                              {r.verdict}
                            </span>
                          </div>
                          <div className="text-slate-300 whitespace-pre overflow-x-auto text-[11px]">
                            {r.output || '(No stdout)'}
                          </div>
                          {r.error && (
                            <div className="text-red-400 whitespace-pre text-[11px] mt-1">
                              {r.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!isRunning && !runResults && !runError && (
                    <div className="text-slate-500 py-4 font-sans text-xs">
                      Click <strong>Run</strong> to test your code against visible test cases or custom input, or click <strong>Submit</strong> to evaluate against hidden test suites and receive an AI review.
                    </div>
                  )}
                </div>
              )}

              {/* AI Review Tab */}
              {!isSubmitting && outputTab === 'ai-review' && (
                <div className="space-y-4 font-sans">
                  {currentSubmission?.aiReview ? (
                    <div className="space-y-3">
                      {/* Four Quality Bars */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-400">Code Quality</div>
                          <div className="text-sm font-bold text-indigo-400">
                            {currentSubmission.aiReview.codeQuality}/100
                          </div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-400">Problem Solving</div>
                          <div className="text-sm font-bold text-indigo-400">
                            {currentSubmission.aiReview.problemSolving}/100
                          </div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-400">Testing Approach</div>
                          <div className="text-sm font-bold text-indigo-400">
                            {currentSubmission.aiReview.testing}/100
                          </div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-400">Security & Robustness</div>
                          <div className="text-sm font-bold text-indigo-400">
                            {currentSubmission.aiReview.security}/100
                          </div>
                        </div>
                      </div>

                      {/* Summary Scores */}
                      <div className="p-2.5 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center space-x-1 text-slate-300 font-semibold">
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Correctness: {currentSubmission.deterministic?.correctness}%</span>
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="flex items-center space-x-1 text-indigo-300">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Overall Combined: {currentSubmission.overallScore}/100</span>
                          </span>
                        </div>
                        {currentSubmission.aiReview.opinion && (
                          <span className="text-[11px] text-slate-400">
                            Opinion: {currentSubmission.aiReview.opinion.verdict}
                          </span>
                        )}
                      </div>

                      {/* Strengths with line highlights */}
                      {currentSubmission.aiReview.strengths.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-emerald-400 mb-1">Strengths:</div>
                          <div className="space-y-1">
                            {currentSubmission.aiReview.strengths.map((s, idx) => (
                              <div key={idx} className="bg-slate-900/60 p-2 rounded text-xs text-slate-300 flex items-start justify-between">
                                <span>{s.text}</span>
                                {s.lines?.length > 0 && (
                                  <button
                                    onClick={() => highlightLine(s.lines[0])}
                                    className="ml-2 px-1.5 py-0.5 bg-indigo-950 text-indigo-300 rounded text-[10px] font-mono hover:bg-indigo-900 cursor-pointer shrink-0"
                                  >
                                    Line {s.lines.join(', ')}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {currentSubmission.aiReview.weaknesses.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-amber-400 mb-1">Areas for Refinement:</div>
                          <div className="space-y-1">
                            {currentSubmission.aiReview.weaknesses.map((w, idx) => (
                              <div key={idx} className="bg-slate-900/60 p-2 rounded text-xs text-slate-300 flex items-start justify-between">
                                <span>{w.text}</span>
                                {w.lines?.length > 0 && (
                                  <button
                                    onClick={() => highlightLine(w.lines[0])}
                                    className="ml-2 px-1.5 py-0.5 bg-amber-950 text-amber-300 rounded text-[10px] font-mono hover:bg-amber-900 cursor-pointer shrink-0"
                                  >
                                    Line {w.lines.join(', ')}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-500 text-xs">
                      <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-slate-300">No submission review available yet</p>
                      <p className="mt-1 max-w-sm mx-auto text-slate-400">
                        Click <strong>Submit</strong> to run your solution against hidden tests and receive structured, line-cited qualitative feedback from Gemini.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
