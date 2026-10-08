/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Globe,
  QrCode,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { clientApi } from '../../lib/client/api.ts';
import { CandidateRanking, PassportProfile } from '../../lib/types.ts';
import { Button, Card, Chip, PageHeader } from './ui/index.tsx';

export const PassportView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'passport' | 'employer'>('passport');
  const [passport, setPassport] = useState<PassportProfile | null>(null);
  const [candidates, setCandidates] = useState<CandidateRanking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Employer Controls
  const [blindMode, setBlindMode] = useState<boolean>(false);
  const [weights, setWeights] = useState({
    requirementCoverage: 0.5,
    evidenceConfidence: 0.2,
    recency: 0.1,
    projectRelevance: 0.1,
    practicalEvidence: 0.1,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [passRes, candRes] = await Promise.all([
        clientApi.getPassport('demo-user'),
        clientApi.getCandidates(),
      ]);
      setPassport(passRes);
      setCandidates(candRes.candidates);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load passport or employer data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRankWeights = async (newWeights: typeof weights) => {
    setWeights(newWeights);
    try {
      const res = await clientApi.rankCandidates(newWeights);
      setCandidates(res.candidates);
    } catch (err: unknown) {
      console.error('Failed to re-rank candidates:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Skill Passport & Employer Audit
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Auditable evidence credentials designed for deterministic verification.
          </p>
        </div>

        {/* View Switcher: Candidate Passport vs Employer Ranking */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab('passport')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'passport'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Candidate Passport
          </button>
          <button
            onClick={() => setActiveSubTab('employer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'employer'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Employer View (Demo)
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-600" />
          <span className="text-sm text-slate-500">Loading passport audit records...</span>
        </div>
      )}

      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Candidate Passport View */}
      {!loading && !error && activeSubTab === 'passport' && passport && (
        <div className="space-y-6">
          {/* Passport Header Card */}
          <Card className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900">{passport.fullName}</h2>
                <Chip label="Public Audit Trail" variant="success" />
              </div>
              <p className="text-xs text-slate-500">{passport.tagline}</p>
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500">
                <span>Record ID: <strong>{passport.recordId}</strong></span>
                <span>·</span>
                <span>Audit Issued: {new Date(passport.issuedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* QR Verification Box */}
            <div className="flex flex-col items-center bg-slate-50 p-3 rounded-lg border border-slate-200 shrink-0">
              <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center rounded-md">
                <QrCode className="w-10 h-10 text-slate-200" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1">Audit QR Seal</span>
            </div>
          </Card>

          {/* Verified Skills Trail */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Verified Evidence Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {passport.verifiedSkills.map((s) => (
                <div
                  key={s.skillId}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>{s.skillName}</span>
                    <Chip label={s.level} variant="neutral" />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Tier: <strong>{s.tier}</strong> · Confidence: {s.confidence}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {s.evidenceCount} verified evidence items
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Submission Audit Log */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Auditable Coding Verification History
            </h3>
            {passport.submissionsHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No coding submissions logged yet. Completed coding problems inside assessments populate this audit log.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {passport.submissionsHistory.map((sub) => (
                  <div
                    key={sub.id}
                    className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{sub.problemTitle}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Lang: {sub.language} · Date: {new Date(sub.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 font-mono">
                        {sub.correctness}% Correctness
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Integrity Factor: {sub.integrityFactor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 2. Employer View */}
      {!loading && !error && activeSubTab === 'employer' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Candidate Ranking Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Re-rank candidates dynamically using custom weights.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setBlindMode(!blindMode)}
                >
                  {blindMode ? (
                    <>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span>Disable Blind Mode</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 mr-1" />
                      <span>Enable Blind Mode</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Weights Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Coverage Weight: {Math.round(weights.requirementCoverage * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.requirementCoverage}
                  onChange={(e) =>
                    handleRankWeights({
                      ...weights,
                      requirementCoverage: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Confidence Weight: {Math.round(weights.evidenceConfidence * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.evidenceConfidence}
                  onChange={(e) =>
                    handleRankWeights({
                      ...weights,
                      evidenceConfidence: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Practical Evidence: {Math.round(weights.practicalEvidence * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.practicalEvidence}
                  onChange={(e) =>
                    handleRankWeights({
                      ...weights,
                      practicalEvidence: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-slate-900"
                />
              </div>
            </div>
          </Card>

          {/* Candidates List */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Ranked Candidates</h3>

            <div className="divide-y divide-slate-100 text-xs">
              {candidates.map((cand, idx) => (
                <div
                  key={cand.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-400">#{idx + 1}</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {blindMode ? `Candidate #${cand.id.slice(-4)}` : cand.displayName}
                      </span>
                      {cand.isDemoData && <Chip label="Demo Data" variant="neutral" />}
                    </div>
                    <p className="text-slate-500 text-[11px]">{cand.targetRole}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cand.skills.map((s, si) => (
                        <span
                          key={si}
                          className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono"
                        >
                          {s.name} ({s.level})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className="text-2xl font-bold font-mono text-slate-900">
                      {cand.matchScore}%
                    </div>
                    <div className="text-[10px] text-slate-400">Composite Score</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
