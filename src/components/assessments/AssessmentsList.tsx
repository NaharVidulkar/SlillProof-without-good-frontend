/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, ChevronRight, RefreshCw, AlertCircle, Award } from 'lucide-react';
import { clientApi } from '../../../lib/client/api.ts';
import { PublicAssessmentSummary } from '../../../lib/server/assessments/types.ts';
import { Card, Button, Chip } from '../ui/index.tsx';

interface AssessmentsListProps {
  onSelectAssessment: (id: string) => void;
}

export const AssessmentsList: React.FC<AssessmentsListProps> = ({ onSelectAssessment }) => {
  const [assessments, setAssessments] = useState<PublicAssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientApi.getAssessments();
      setAssessments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assessments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Standardized, evidence-based evaluations. One comprehensive assessment per subject.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-900">Unable to load assessments</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchAssessments}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-600" />
          <span className="text-sm text-slate-500">Loading assessments...</span>
        </div>
      )}

      {/* Grid of Assessment Cards */}
      {!loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments.map((assessment) => (
              <Card
                key={assessment.id}
                interactive
                onClick={() => onSelectAssessment(assessment.id)}
                className="flex flex-col justify-between hover:border-slate-300"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        {assessment.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">{assessment.domain}</p>
                    </div>
                    {assessment.lastResult ? (
                      <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                        <Award className="w-3.5 h-3.5 text-slate-700" />
                        <span className="text-xs font-semibold text-slate-900">
                          {assessment.lastResult.badgeLabel}
                        </span>
                        <span className="text-xs text-slate-500">
                          · {assessment.lastResult.overallPercent}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Not attempted</span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {assessment.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{assessment.timeLimitMinutes} min</span>
                    </span>
                    <span>·</span>
                    <span>
                      {assessment.totalQuestions} questions ({assessment.totalMcq} MCQs + {assessment.totalCode} Coding)
                    </span>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Chip label="Section A (Easy)" variant="neutral" />
                    <Chip label="Section B (Medium)" variant="neutral" />
                    <Chip label="Section C (Hard)" variant="neutral" />
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAssessment(assessment.id);
                    }}
                  >
                    <span>View Assessment</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Muted line for future assessments */}
          <p className="text-center text-xs text-slate-400 pt-4">
            More assessments coming soon
          </p>
        </div>
      )}
    </div>
  );
};
