/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { clientApi } from '../../lib/client/api.ts';
import { SkillMetric } from '../../lib/types.ts';
import { Button, Card, Chip, PageHeader } from './ui/index.tsx';

interface SkillsViewProps {
  onNavigateToAssessments?: () => void;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  onNavigateToAssessments,
}) => {
  const [skills, setSkills] = useState<SkillMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientApi.getSkills();
      setSkills(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load verified skills');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const toggleExpand = (skillId: string) => {
    setExpandedSkillId((prev) => (prev === skillId ? null : skillId));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills & Evidence Matrix"
        description="Deterministic Bayesian proficiency model. Skills are never bare percentages; they are expressed through Level, Confidence, and Tier."
        action={
          <Button variant="secondary" size="sm" onClick={fetchSkills} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-600" />
          <span className="text-sm text-slate-500">Computing Bayesian skill proficiency and evidence...</span>
        </div>
      )}

      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-900">Failed to load skills</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchSkills}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => {
            const isExpanded = expandedSkillId === skill.skillId;
            const hasEvidence = skill.evidenceCount > 0;

            return (
              <Card
                key={skill.skillId}
                className="flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">{skill.skillName}</h3>
                    <div className="flex items-center space-x-1.5">
                      <Chip label={skill.level} variant="neutral" />
                      <Chip label={skill.tier} variant="accent" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Confidence:</span>
                      <div className="font-semibold text-slate-800 flex items-center space-x-1 mt-0.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {skill.confidence} ({Math.round(skill.confidenceScore * 100)}%)
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px]">Evidence Items:</span>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        {skill.evidenceCount} verified {skill.evidenceCount === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  {hasEvidence ? (
                    <div>
                      <button
                        onClick={() => toggleExpand(skill.skillId)}
                        className="text-xs text-slate-700 hover:text-slate-900 font-medium flex items-center space-x-1 cursor-pointer"
                      >
                        <span>
                          {isExpanded
                            ? 'Hide Evidence Details'
                            : `View ${skill.evidenceCount} Evidence Item(s)`}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-2 text-xs">
                          {skill.evidence.map((ev) => (
                            <div
                              key={ev.id}
                              className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1"
                            >
                              <div className="flex items-center justify-between font-mono text-[11px]">
                                <span className="font-semibold uppercase text-slate-700">
                                  Type: {ev.type}
                                </span>
                                <span className="text-slate-500">Integrity: {ev.integrity}</span>
                              </div>
                              <div className="text-slate-600 text-[11px]">
                                Score: <strong>{Math.round(ev.score * 100)}%</strong> · Difficulty: {ev.difficulty}/3
                              </div>
                              {ev.details && (
                                <div className="text-slate-500 text-[10px]">
                                  {ev.details.problemTitle || ev.sourceRef}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>No graded evidence yet</span>
                      {onNavigateToAssessments && (
                        <button
                          onClick={onNavigateToAssessments}
                          className="text-xs text-slate-900 hover:underline font-semibold cursor-pointer"
                        >
                          Take Assessment →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
