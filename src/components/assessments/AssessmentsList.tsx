/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Clock,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Award,
  Sparkles,
  FileText,
  Lock,
  ArrowRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import { clientApi } from '../../../lib/client/api.ts';
import { PublicAssessmentSummary } from '../../../lib/server/assessments/types.ts';
import { Card, Button, Chip } from '../ui/index.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { OnboardingModal } from '../onboarding/OnboardingModal.tsx';

interface AssessmentsListProps {
  onSelectAssessment: (id: string) => void;
}

export const AssessmentsList: React.FC<AssessmentsListProps> = ({ onSelectAssessment }) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<PublicAssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [signInPrompt, setSignInPrompt] = useState<string | null>(null);

  const fetchAssessments = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleCardClick = (assessmentId: string) => {
    const isPython = assessmentId === 'python-fundamentals' || assessmentId === 'python';
    if (!isPython && !user) {
      setSignInPrompt(assessmentId);
      return;
    }
    onSelectAssessment(assessmentId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assessments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Standardized, evidence-based evaluations. Exactly 25 questions per assessment with automated scoring.
          </p>
        </div>
      </div>

      {/* Prominent "Analyse my resume / CV" Button with Coming Soon Modal */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-[#4A64B8] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3B4A6B]">Personalized CV Analysis</h3>
            <p className="text-xs text-[#6B7A99] mt-0.5">
              Personalized CV analysis coming soon. For now, choose one of the skill assessments below.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowComingSoon(true)}
          className="px-5 py-2.5 rounded-xl bg-[#4A64B8] hover:bg-[#3B4A6B] text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyse my resume / CV</span>
        </button>
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

      {/* 4 Fixed Assessments Grid */}
      {!loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments.map((assessment) => {
              const isPython = assessment.id === 'python-fundamentals' || assessment.id === 'python';
              const isLocked = !isPython && !user;

              return (
                <Card
                  key={assessment.id}
                  interactive
                  onClick={() => handleCardClick(assessment.id)}
                  className="flex flex-col justify-between hover:border-slate-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            {assessment.title}
                          </h2>
                          {isLocked && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              <Lock className="w-3 h-3" />
                              <span>Sign in</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{assessment.domain}</p>
                      </div>

                      {assessment.lastResult ? (
                        <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <Award className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-xs font-semibold text-emerald-900">
                            {assessment.lastResult.badgeLabel}
                          </span>
                          <span className="text-xs text-emerald-700">
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
                        handleCardClick(assessment.id);
                      }}
                    >
                      <span>{assessment.lastResult ? 'Retake Test' : 'Start Assessment'}</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* CV Analysis Coming Soon Modal */}
      <OnboardingModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      />

      {/* Visitor Sign-In Modal */}
      {signInPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 text-center space-y-5">
            <button
              onClick={() => setSignInPrompt(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center shadow-inner">
              <Lock className="w-7 h-7 text-amber-700" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Sign In Required</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Please sign in to take this assessment. The Python assessment is available for public preview without an account.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSignInPrompt(null);
                  onSelectAssessment('python-fundamentals');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Try Python Assessment
              </button>
              <a
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-[#4A64B8] hover:bg-[#3B4A6B] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>Sign In to Continue</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
