/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Code2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { AssessmentResult, QuestionReviewItem } from '../../lib/server/assessments/types.ts';
import { Button, Card, Chip, PageHeader } from '../ui/index.tsx';

interface AssessmentResultViewProps {
  result: AssessmentResult;
  onBackToAssessments: () => void;
  onNavigateToPassport?: () => void;
}

export const AssessmentResultView: React.FC<AssessmentResultViewProps> = ({
  result,
  onBackToAssessments,
  onNavigateToPassport,
}) => {
  const [expandedQid, setExpandedQid] = useState<string | null>(null);

  const toggleExpand = (qid: string) => {
    setExpandedQid((prev) => (prev === qid ? null : qid));
  };

  const getBadgeVariant = (label: string) => {
    switch (label) {
      case 'Expert':
      case 'Strong':
        return 'success';
      case 'Competent':
        return 'accent';
      case 'Developing':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={onBackToAssessments}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to assessments</span>
        </button>
      </div>

      {/* Badge Hero Card */}
      <Card className="p-8 border-slate-300 relative overflow-hidden bg-white shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Badge Symbol & Percentage */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-24 h-24 rounded-full border-4 border-slate-900 flex flex-col items-center justify-center bg-white shadow-xs mb-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {result.overallPercent}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Verified
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Evaluation Label
              </span>
              <h2 className="text-xl font-bold text-slate-900">{result.badgeLabel}</h2>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200 w-full flex items-center justify-center space-x-2 text-xs text-slate-500">
              <Chip
                label={result.badgeStatus.toUpperCase()}
                variant={result.badgeStatus === 'active' ? 'success' : 'warning'}
              />
              <span className="font-mono text-[11px] text-slate-400">{result.recordId}</span>
            </div>
          </div>

          {/* Right: Meaning, Capping & Verification Details */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Verified Assessment Credential</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                Python Fundamentals
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Issued on {new Date(result.issuedAt).toLocaleDateString()} · Deterministic execution audit
              </p>
            </div>

            {/* Cap Reason alert if applicable */}
            {result.capReason && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2.5 text-amber-900 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Performance Cap Applied: </strong>
                  <span>{result.capReason}</span>
                </div>
              </div>
            )}

            {/* Verification Engine Levels */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Skill Level</span>
                <p className="text-sm font-bold text-slate-900">{result.level}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Confidence</span>
                <p className="text-sm font-bold text-slate-900">{result.confidence}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Evidence Tier</span>
                <p className="text-sm font-bold text-slate-900">{result.tier}</p>
              </div>
            </div>

            {/* AI Summary note */}
            {result.summary?.headline && (
              <div className="pt-2 text-xs text-slate-600 leading-relaxed italic border-t border-slate-100">
                "{result.summary.headline}"
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Section Breakdown matching spec */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
          Section Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.sectionBreakdown.map((sec) => (
            <Card key={sec.id} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Section {sec.id}: {sec.difficultyLabel}
                  </h3>
                  <p className="text-xs text-slate-400">{sec.questionCount} questions</p>
                </div>
                <span className="text-lg font-bold font-mono text-slate-900">
                  {sec.percent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    sec.percent >= 75
                      ? 'bg-slate-900'
                      : sec.percent >= 50
                      ? 'bg-slate-600'
                      : 'bg-slate-400'
                  }`}
                  style={{ width: `${sec.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Score: {sec.earnedScore} / {sec.maxScore}</span>
                <span>Weight: {sec.weight}x</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Verified Skills Breakdown */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
          Verified Python Skills
        </h2>

        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-slate-100 text-xs">
            {result.skillsBreakdown.map((skill) => (
              <div
                key={skill.skillId}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900">{skill.skillName}</span>
                    <span className="font-mono text-[11px] text-slate-400">({skill.skillId})</span>
                  </div>
                  {skill.coverageNote && (
                    <p className="text-[11px] text-amber-700">{skill.coverageNote}</p>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-400">Score:</span>
                    <span className="font-mono font-bold text-slate-900">{skill.score}%</span>
                  </div>
                  <Chip label={skill.level} variant="neutral" />
                  <Chip
                    label={`${skill.confidence} Conf`}
                    variant={
                      skill.confidence === 'High'
                        ? 'success'
                        : skill.confidence === 'Medium'
                        ? 'warning'
                        : 'neutral'
                    }
                  />
                  <Chip label={skill.tier} variant="accent" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 25-Question Review with revealed answer keys & hidden test results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
            Question-by-Question Audit (25 Questions)
          </h2>
          <span className="text-xs text-slate-400">Click any question to view solution details</span>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {result.questionsReview.map((item, index) => {
              const isExpanded = expandedQid === item.qid;
              const isMcq = item.type === 'mcq';

              return (
                <div key={item.qid} className="p-4 space-y-3">
                  <div
                    onClick={() => toggleExpand(item.qid)}
                    className="flex items-start justify-between cursor-pointer gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {item.correct ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="font-bold text-slate-900">Q{index + 1}.</span>
                          <span className="font-semibold text-slate-800">
                            {isMcq ? item.titleOrPrompt : `${item.titleOrPrompt} (Coding)`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                          <span>Section {item.sectionId}</span>
                          <span>·</span>
                          <span>{item.type.toUpperCase()}</span>
                          <span>·</span>
                          <span>{item.skills.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {Math.round(item.score * 100)}%
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Solution / Grading Details */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 text-xs space-y-3 bg-slate-50 -mx-4 -mb-4 p-4">
                      {/* MCQ Revealed explanation */}
                      {isMcq && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                              Your Selection:{' '}
                              <strong className={item.correct ? 'text-emerald-700' : 'text-rose-700'}>
                                {item.userChoiceId || 'No answer selected'}
                              </strong>
                            </span>
                            <span className="text-slate-500">
                              Correct Option: <strong className="text-emerald-700">{item.correctOptionId}</strong>
                            </span>
                          </div>

                          {item.explanation && (
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                              <strong className="text-slate-900 block mb-1">Official Explanation:</strong>
                              {item.explanation}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Code Revealed Execution results */}
                      {!isMcq && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                            <span>
                              Visible Tests Passed: <strong>{item.visiblePassed}/{item.visibleTotal}</strong>
                            </span>
                            <span>
                              Hidden Tests Passed: <strong>{item.hiddenPassed}/{item.hiddenTotal}</strong>
                            </span>
                            {item.aiQuality !== undefined && (
                              <span>AI Quality Score: <strong>{item.aiQuality}/100</strong></span>
                            )}
                          </div>

                          {item.submittedCode && (
                            <div className="space-y-1">
                              <span className="text-slate-500 text-[11px] font-semibold">Submitted Solution Code:</span>
                              <pre className="p-3 bg-slate-950 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto max-h-48 border border-slate-800">
                                {item.submittedCode}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Summary Prose & Integrity Note */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Summary prose */}
        <Card className="md:col-span-8 p-6 space-y-4 text-xs">
          <div className="flex items-center space-x-2 text-slate-900">
            <Sparkles className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold">Verification Summary</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">{result.summary.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="font-semibold text-slate-900 block mb-1.5">Identified Strengths:</span>
              <ul className="list-disc pl-4 text-slate-600 space-y-1">
                {result.summary.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-semibold text-slate-900 block mb-1.5">Areas for Development:</span>
              <ul className="list-disc pl-4 text-slate-600 space-y-1">
                {result.summary.focusAreas.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Right: Integrity Verification */}
        <Card className="md:col-span-4 p-6 space-y-4 text-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold">Integrity Verification</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span>Tab switches recorded:</span>
                <span className="font-mono font-bold text-slate-900">
                  {result.integrity.tabSwitches}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Large pastes (&gt;200c):</span>
                <span className="font-mono font-bold text-slate-900">
                  {result.integrity.largePastes}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Verification trigger:</span>
                <span
                  className={`font-semibold ${
                    result.integrity.flagged ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {result.integrity.flagged ? 'Active (Flagged)' : 'Clean Verification'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Unproctored automated test evaluation with runtime verification.
          </div>
        </Card>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button variant="secondary" onClick={onBackToAssessments}>
          Back to Assessments
        </Button>
        {onNavigateToPassport && (
          <Button variant="primary" onClick={onNavigateToPassport}>
            View Credential in Passport
          </Button>
        )}
      </div>
    </div>
  );
};
