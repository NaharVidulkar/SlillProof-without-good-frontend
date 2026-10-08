/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Code2,
  FileText,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { clientApi } from '../../../lib/client/api.ts';
import { PublicAssessmentDetail } from '../../../lib/server/assessments/types.ts';
import { Card, Button, Chip } from '../ui/index.tsx';

interface AssessmentDetailProps {
  assessmentId: string;
  onBack: () => void;
  onStartAttempt: (attemptId: string) => void;
  onViewResult?: (attemptId: string) => void;
}

export const AssessmentDetail: React.FC<AssessmentDetailProps> = ({
  assessmentId,
  onBack,
  onStartAttempt,
  onViewResult,
}) => {
  const [detail, setDetail] = useState<
    (PublicAssessmentDetail & { inProgressAttemptId?: string; remainingSeconds?: number }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientApi.getAssessmentDetail(assessmentId);
      setDetail(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [assessmentId]);

  const handleStart = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await clientApi.startAssessmentAttempt(assessmentId);
      onStartAttempt(res.attemptId);
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

  return (
    <div className="space-y-6">
      {/* Back navigation & Page title */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to assessments</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {detail?.title || 'Python'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {detail?.description ||
                'Evidence-based verification of core Python internals, data structures, algorithms, and real-life systems.'}
            </p>
          </div>

          {detail?.lastResult && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <Award className="w-4 h-4 text-slate-700" />
              <div className="text-xs">
                <span className="font-semibold text-slate-900">{detail.lastResult.badgeLabel}</span>
                <span className="text-slate-500"> ({detail.lastResult.overallPercent}%)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between">
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
        <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-600" />
          <span className="text-sm text-slate-500">Loading assessment details...</span>
        </div>
      )}

      {!loading && detail && (
        <div className="space-y-6">
          {/* Main Grid: Left (Section rows) and Right (Structure columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left / Top: The three sections as rows matching diagram */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Assessment Sections
              </h2>

              <Card className="p-4 space-y-3">
                {/* Row 1: Easy */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-slate-900">Easy: 5 MCQs</span>
                    <p className="text-xs text-slate-500">Language syntax, operators, control flow</p>
                  </div>
                  <Chip label="Easy" variant="neutral" />
                </div>

                {/* Row 2: Medium */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-slate-900">
                      Medium: 10 questions (6 MCQs + 4 coding)
                    </span>
                    <p className="text-xs text-slate-500">Collections, scope, memory & stdin routines</p>
                  </div>
                  <Chip label="Medium" variant="warning" />
                </div>

                {/* Row 3: Hard */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-slate-900">
                      Hard: 10 real-life coding problems
                    </span>
                    <p className="text-xs text-slate-500">Full standalone programs against hidden test suites</p>
                  </div>
                  <Chip label="Hard" variant="danger" />
                </div>
              </Card>
            </div>

            {/* Center / Right: Two columns matching diagram */}
            <div className="lg:col-span-7 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Question Breakdown
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Column 1: Contains MCQs */}
                <Card className="p-5 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-900">
                      <FileText className="w-4 h-4 text-slate-700" />
                      <h3 className="text-sm font-semibold">Contains MCQs (11)</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      11 conceptual multiple-choice questions verifying runtime semantics, scope, exceptions, and memory behavior.
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                    Graded by server answer keys upon completion.
                  </div>
                </Card>

                {/* Column 2: Contains coding problem statements */}
                <Card className="p-5 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-900">
                      <Code2 className="w-4 h-4 text-slate-700" />
                      <h3 className="text-sm font-semibold">Contains coding problem statements (14)</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      14 real-life coding problems evaluated against hidden test cases executed in an isolated runtime.
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                    Up to 3 submissions allowed per coding question.
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Action and Rules Card */}
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {detail.inProgressAttemptId ? 'Resume Active Attempt' : 'Ready to begin?'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {detail.inProgressAttemptId && detail.remainingSeconds
                    ? `You have an in-progress attempt with ${formatRemaining(detail.remainingSeconds)}.`
                    : 'The assessment must be completed within 180 minutes once started.'}
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleStart}
                disabled={starting}
                className="shrink-0"
              >
                {starting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    <span>Loading workspace...</span>
                  </>
                ) : detail.inProgressAttemptId ? (
                  <span>
                    Resume Assessment{' '}
                    {detail.remainingSeconds ? `(${formatRemaining(detail.remainingSeconds)})` : ''}
                  </span>
                ) : (
                  <span>Start Assessment (180 min)</span>
                )}
              </Button>
            </div>

            {/* Rules list matching diagram */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-900 mb-2">Rules & Format</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                <li className="flex items-start space-x-2">
                  <span className="text-slate-400">·</span>
                  <span><strong>180-minute timer:</strong> Server-authoritative countdown; answers autosaved continuously.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-slate-400">·</span>
                  <span><strong>3 submissions per coding question:</strong> The best submission score counts toward your result.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-slate-400">·</span>
                  <span><strong>Integrity monitoring:</strong> Tab switches and large pastes (&gt;200 chars) are recorded for verification confidence.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-slate-400">·</span>
                  <span><strong>Verified badge:</strong> Deterministic correctness determines score; badge and skill breakdown issued on finish.</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
