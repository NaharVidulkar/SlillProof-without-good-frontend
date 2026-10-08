/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Award,
  ChevronRight,
} from 'lucide-react';
import { clientApi } from '../../lib/client/api.ts';
import { DashboardData } from '../../lib/types.ts';
import { Button, Card, Chip, PageHeader } from './ui/index.tsx';

interface DashboardViewProps {
  onNavigateToAssessments?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToAssessments,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clientApi.getDashboard();
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Candidate role readiness calculated from evidence, verified skills, and recent assessments."
        action={
          <Button variant="secondary" size="sm" onClick={fetchDashboard} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-600" />
          <span className="text-sm text-slate-500">Calculating career readiness and evidence...</span>
        </div>
      )}

      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-900">Failed to load dashboard</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchDashboard}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-6">
          {/* Target Role Readiness Card */}
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Target Role
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {data.careerReadiness.roleTitle}
                </h2>
              </div>

              <div className="sm:text-right">
                <div className="text-3xl font-extrabold text-slate-900 font-mono">
                  {data.careerReadiness.scorePercent}%
                </div>
                <div className="text-xs text-slate-500">
                  Coverage: {data.careerReadiness.assessableCoverage}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${data.careerReadiness.scorePercent}%` }}
              />
            </div>

            {/* Skills breakdown table */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-semibold text-slate-800">Role Requirements Audit</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {data.careerReadiness.skillsBreakdown.map((s) => (
                  <div
                    key={s.skillId}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{s.skillName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {s.currentLevel} · {s.confidence} Conf.
                      </div>
                    </div>
                    {s.met ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Verification Activity</h3>
              {onNavigateToAssessments && (
                <Button variant="secondary" size="sm" onClick={onNavigateToAssessments}>
                  <span>Take Assessment</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>

            {data.recentActivity.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-3">
                <p>No verified activity recorded yet.</p>
                {onNavigateToAssessments && (
                  <Button variant="primary" size="sm" onClick={onNavigateToAssessments}>
                    Start Python Assessment
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-slate-100 rounded-md">
                        <Award className="w-4 h-4 text-slate-700" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{act.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(act.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">{act.score}%</div>
                      <div className="text-[11px] text-slate-500">{act.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
