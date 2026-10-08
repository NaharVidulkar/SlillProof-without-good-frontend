/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { clientApi } from '../../lib/client/api.ts';
import { JobMatchResult } from '../../lib/types.ts';
import { Button, Card, Chip, PageHeader } from './ui/index.tsx';

const SAMPLE_JOB_TEXT = `We are looking for a Senior Backend Software Engineer with strong proficiency in Python, RESTful API design, relational SQL databases (PostgreSQL), and robust unit testing. Experience with algorithms, data structures, and microservice validation is a major plus.`;

interface JobMatchViewProps {
  onNavigateToAssessments?: () => void;
}

export const JobMatchView: React.FC<JobMatchViewProps> = ({
  onNavigateToAssessments,
}) => {
  const [jobText, setJobText] = useState<string>(SAMPLE_JOB_TEXT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jobText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientApi.matchJob(jobText);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Job matching failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Match & Gap Plan"
        description="Match job specifications against candidate verified evidence. Extraction is structured and quantitative matches are computed in code."
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form Card */}
      <Card className="space-y-4">
        <label className="text-xs font-semibold text-slate-900 block">
          Job Description Text:
        </label>
        <textarea
          rows={4}
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Paste requirements, job spec, or role expectations..."
          className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            Schema-validated extraction against verified skills.
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAnalyze}
            disabled={isLoading || !jobText.trim()}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Analyzing Match...</span>
              </>
            ) : (
              <span>Analyze Match & Gap Plan</span>
            )}
          </Button>
        </div>
      </Card>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Match Score Card */}
          <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Matched Role
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">{result.jobTitle}</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                {result.explanation}
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <div className="text-3xl font-extrabold text-slate-900 font-mono">
                {result.overallMatchPercent}%
              </div>
              <div className="text-xs text-slate-400">Overall Evidence Match</div>
            </div>
          </Card>

          {/* Requirements Audit Grid */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Extracted Role Requirements Audit</h3>

            <div className="divide-y divide-slate-100 text-xs">
              {result.requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">{req.name}</span>
                      {req.mustHave && <Chip label="Must Have" variant="danger" />}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Category: {req.category} · Expected: {req.expectedLevel}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Chip
                      label={req.status}
                      variant={
                        req.status === 'Strong'
                          ? 'success'
                          : req.status === 'Needs improvement'
                          ? 'warning'
                          : 'neutral'
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actionable Gap Plan */}
          {result.gapPlan && result.gapPlan.length > 0 && (
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Actionable Gap Plan</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.gapPlan.map((item) => (
                  <div
                    key={item.week}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        Week {item.week}: Focus on {item.focusSkill}
                      </span>
                      <Chip label={`Target: ${item.targetMilestone}`} variant="neutral" />
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {item.recommendedAction}
                    </p>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Close skill gap:</span>
                      {onNavigateToAssessments && (
                        <button
                          onClick={onNavigateToAssessments}
                          className="text-xs font-semibold text-slate-900 hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Take Assessment</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
