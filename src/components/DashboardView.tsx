/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Lock,
  Code,
  Layers,
  ArrowRight,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { clientApi } from '../../lib/client/api.ts';
import { DashboardData, SkillMetric } from '../../lib/types.ts';
import {
  AssessmentAttempt,
  AssessmentResult,
  PublicAssessmentDetail,
  PublicAssessmentSummary,
} from '../../lib/server/assessments/types.ts';
import { Banner, BannerState } from './ui/Banner.tsx';
import { DataTable, Column } from './ui/DataTable.tsx';
import { LevelBadge } from './ui/LevelBadge.tsx';
import { ConfidenceRing } from './ui/ConfidenceRing.tsx';
import { TierChip } from './ui/TierChip.tsx';
import { RightPanel } from './layout/RightPanel.tsx';
import { CalendarEvent } from './ui/MiniCalendar.tsx';
import { ReminderItem } from './ui/ReminderList.tsx';

const PYTHON_CANONICAL_SKILLS = [
  { id: 'py.core', name: 'Core Language & Types', description: 'Operators, truthiness, slicing, scope & control flow' },
  { id: 'py.strings', name: 'String Processing', description: 'Indexing, immutability, f-strings & string algorithms' },
  { id: 'py.collections', name: 'Collections & Mappings', description: 'Lists, tuples, sets, dicts & comprehensions' },
  { id: 'py.functions', name: 'Functions & Scope', description: 'Closures, late binding, decorators & lambdas' },
  { id: 'py.oop', name: 'Object-Oriented Design', description: 'Classes, dunder protocols, inheritance & attributes' },
  { id: 'py.errors', name: 'Exceptions & Contexts', description: 'Exception handling, context managers & input validation' },
  { id: 'py.iterators', name: 'Iterators & Generators', description: 'Laziness, generator exhaustion & memory efficiency' },
  { id: 'py.stdlib', name: 'Standard Library', description: 'Collections, datetime, json, re, heapq & decimal' },
  { id: 'py.algorithms', name: 'Algorithmic Logic', description: 'Sorting, recursion, stacks, graphs & complexity' },
  { id: 'py.tooling', name: 'Python Tooling', description: 'Modules, imports, virtual environments & runtime typing' },
];

export interface FixedAssessmentCardConfig {
  id: string;
  title: string;
  shortDescription: string;
  questionsCount: string;
  format: string;
  requiresAuth: boolean;
  accentBadge: string;
  accentBg: string;
}

export const FIXED_ASSESSMENTS: FixedAssessmentCardConfig[] = [
  {
    id: 'python-fundamentals',
    title: 'Python',
    shortDescription: 'Evidence-based verification of core Python internals, data structures, algorithms, and real-life systems.',
    questionsCount: '25 questions',
    format: 'MCQ + coding',
    requiresAuth: false,
    accentBadge: 'bg-emerald-100 text-emerald-800',
    accentBg: 'from-emerald-500/10 to-teal-500/5',
  },
  {
    id: 'java',
    title: 'Java',
    shortDescription: 'Core Java: syntax, OOP, strings, collections, exceptions, streams and problem solving.',
    questionsCount: '25 questions',
    format: 'MCQ + coding',
    requiresAuth: true,
    accentBadge: 'bg-amber-100 text-amber-800',
    accentBg: 'from-amber-500/10 to-orange-500/5',
  },
  {
    id: 'dsa',
    title: 'Data Structures and Algorithms',
    shortDescription: 'Complexity, arrays, strings, linked lists, stacks, queues, hashing, trees, heaps, graphs, sorting and searching, and dynamic programming.',
    questionsCount: '25 questions',
    format: 'MCQ + coding',
    requiresAuth: true,
    accentBadge: 'bg-purple-100 text-purple-800',
    accentBg: 'from-purple-500/10 to-indigo-500/5',
  },
  {
    id: 'frontend-dev',
    title: 'Front-end Development',
    shortDescription: 'HTML semantics and accessibility, CSS layout and specificity, modern JavaScript, the event loop, React basics and browser fundamentals.',
    questionsCount: '25 questions',
    format: 'MCQ + coding',
    requiresAuth: true,
    accentBadge: 'bg-blue-100 text-blue-800',
    accentBg: 'from-blue-500/10 to-cyan-500/5',
  },
];

export interface DashboardViewProps {
  onNavigateToAssessments: (assessmentId?: string) => void;
  onNavigateToSkills: () => void;
  onNavigateToProfile: () => void;
  onOpenAttempt?: (attemptId: string) => void;
  onOpenResult?: (result: AssessmentResult) => void;
  onUpdateRightPanel?: (panelNode: React.ReactNode) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToAssessments,
  onNavigateToSkills,
  onNavigateToProfile,
  onOpenAttempt,
  onOpenResult,
  onUpdateRightPanel,
}) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [assessmentDetail, setAssessmentDetail] = useState<PublicAssessmentDetail | null>(null);
  const [assessmentsList, setAssessmentsList] = useState<PublicAssessmentSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Friendly "CV analysis coming soon" modal state
  const [showCvComingSoonModal, setShowCvComingSoonModal] = useState<boolean>(false);

  // Visitor sign-in requirement modal state
  const [signInPromptCard, setSignInPromptCard] = useState<FixedAssessmentCardConfig | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, detail, allAssessments] = await Promise.all([
        clientApi.getDashboard().catch(() => null),
        clientApi.getAssessmentDetail('python-fundamentals').catch(() => null),
        clientApi.getAssessments().catch(() => []),
      ]);

      setDashboardData(dash);
      setAssessmentDetail(detail);
      setAssessmentsList(allAssessments || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Determine banner state
  const bannerState: BannerState = useMemo(() => {
    if (assessmentDetail?.inProgressAttemptId) {
      return 'in_progress';
    }
    if (assessmentDetail?.lastResult) {
      return 'finished';
    }
    return 'no_attempt';
  }, [assessmentDetail]);

  const remainingTimeText = useMemo(() => {
    if (!assessmentDetail?.remainingSeconds) return undefined;
    const m = Math.floor(assessmentDetail.remainingSeconds / 60);
    const s = assessmentDetail.remainingSeconds % 60;
    return `${m}m ${s}s`;
  }, [assessmentDetail?.remainingSeconds]);

  const handleBannerAction = () => {
    onNavigateToAssessments('python-fundamentals');
  };

  const handleStartCard = (card: FixedAssessmentCardConfig) => {
    if (card.requiresAuth && !user) {
      // Visitor rule: signed-out visitors can only take Python test
      setSignInPromptCard(card);
      return;
    }
    onNavigateToAssessments(card.id);
  };

  // Canonical skill matrix
  const displaySkills = useMemo(() => {
    const evaluatedMap = new Map<string, SkillMetric>();
    if (dashboardData?.skills) {
      dashboardData.skills.forEach((s) => evaluatedMap.set(s.skillId, s));
    }

    return PYTHON_CANONICAL_SKILLS.map((canon) => {
      const ev = evaluatedMap.get(canon.id) || evaluatedMap.get(canon.id.replace('py.', ''));
      if (ev && ev.evidenceCount > 0) {
        return {
          id: canon.id,
          name: canon.name,
          level: ev.level,
          confidence: ev.confidence,
          confidenceScore: ev.confidenceScore,
          tier: ev.tier,
          evidenceCount: ev.evidenceCount,
          lastVerified: ev.lastVerified,
          isEvidenced: true,
        };
      }
      return {
        id: canon.id,
        name: canon.name,
        level: 'Foundation' as const,
        confidence: 'Low' as const,
        confidenceScore: 0.2,
        tier: 'Unverified' as const,
        evidenceCount: 0,
        lastVerified: 'Not verified yet',
        isEvidenced: false,
      };
    });
  }, [dashboardData]);

  // Skills table columns
  const skillColumns: Column<any>[] = [
    {
      key: 'name',
      header: 'Skill Domain',
      render: (item) => (
        <div>
          <div className="font-semibold text-xs text-[#3B4A6B]">{item.name}</div>
          <div className="text-[11px] text-[#8A94AD]">{item.id}</div>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: (item) => <LevelBadge level={item.level} />,
    },
    {
      key: 'confidence',
      header: 'Confidence',
      render: (item) => (
        <ConfidenceRing
          confidence={item.confidence}
          score={item.confidenceScore}
          size={24}
        />
      ),
    },
    {
      key: 'tier',
      header: 'Tier',
      render: (item) => <TierChip tier={item.tier} />,
    },
    {
      key: 'lastVerified',
      header: 'Verification Status',
      render: (item) => (
        <span className="text-[11px] text-[#8A94AD]">{item.lastVerified}</span>
      ),
    },
  ];

  // Recent attempts columns
  const attemptColumns: Column<any>[] = [
    {
      key: 'problemTitle',
      header: 'Assessment / Problem',
      render: (item) => (
        <span className="font-medium text-xs text-[#3B4A6B]">{item.problemTitle}</span>
      ),
    },
    {
      key: 'language',
      header: 'Language',
      render: (item) => (
        <span className="text-[11px] text-[#8A94AD] uppercase">{item.language}</span>
      ),
    },
    {
      key: 'status',
      header: 'Result',
      render: (item) => {
        const isPassed = item.status === 'Passed' || item.status === 'Accepted';
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isPassed
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {isPassed ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <AlertCircle className="w-3 h-3 text-rose-600" />
            )}
            <span>{item.status}</span>
          </span>
        );
      },
    },
    {
      key: 'timestamp',
      header: 'Completed',
      render: (item) => (
        <span className="text-[11px] text-[#8A94AD]">{item.timestamp}</span>
      ),
    },
  ];

  // Push right panel content
  useEffect(() => {
    if (!onUpdateRightPanel) return;

    const calendarEvents: CalendarEvent[] = [
      { id: '1', title: 'Python Fundamentals Review', date: new Date(), time: 'Today', type: 'assessment' },
      { id: '2', title: 'Java Core Systems Evaluation', date: new Date(Date.now() + 86400000), time: 'Tomorrow', type: 'assessment' },
    ];

    const reminders: ReminderItem[] = [
      {
        id: 'r1',
        title: 'Complete 25-Question Assessment',
        description: 'Earn a cryptographically signed score badge on your Skill Passport.',
        due: 'Anytime',
        actionLabel: 'Take Test',
        onAction: () => onNavigateToAssessments('python-fundamentals'),
      },
    ];

    onUpdateRightPanel(
      <RightPanel
        events={calendarEvents}
        reminders={reminders}
        onViewAllSchedule={() => onNavigateToAssessments()}
      />
    );
  }, [onUpdateRightPanel, onNavigateToAssessments]);

  if (loading && !dashboardData && !assessmentDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#4A64B8]" />
        <span className="text-xs text-[#8A94AD] font-medium">Loading skill dashboard...</span>
      </div>
    );
  }

  if (error && !dashboardData && !assessmentDetail) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-rose-200 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-[#3B4A6B]">Failed to load dashboard</h3>
          <p className="text-xs text-[#8A94AD] mt-1">{error}</p>
        </div>
        <button
          onClick={fetchAll}
          className="px-6 py-2 rounded-full bg-[#7B8AB8] text-white text-xs font-semibold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* 1. ANALYSE MY RESUME / CV BANNER (Friendly coming soon notice on click) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-[#4A64B8] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3B4A6B]">
              Personalized CV Analysis
            </h3>
            <p className="text-xs text-[#6B7A99] mt-0.5">
              Personalized CV analysis coming soon. For now, choose one of the verified skill assessments below.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCvComingSoonModal(true)}
          className="px-5 py-2.5 rounded-xl bg-[#4A64B8] hover:bg-[#3B4A6B] text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyse my resume / CV</span>
        </button>
      </div>

      {/* 2. WELCOME BANNER matching Learnthru reference card */}
      <Banner
        userName={user?.name ? user.name.split(' ')[0] : 'Candidate'}
        state={bannerState}
        remainingTimeText={remainingTimeText}
        badgeLabel={assessmentDetail?.lastResult?.badgeLabel}
        badgePercent={assessmentDetail?.lastResult?.overallPercent}
        onActionClick={handleBannerAction}
      />

      {/* 3. FOUR FIXED ASSESSMENT CARDS: Python, Java, DSA, and Front-end Development */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#3B4A6B] tracking-tight">
              Skill Assessments
            </h2>
            <p className="text-xs text-[#8A94AD] mt-0.5">
              25-question standardized assessments with automated MCQ and online coding verification.
            </p>
          </div>
          <button
            onClick={() => onNavigateToAssessments()}
            className="text-xs font-semibold text-[#8A94AD] hover:text-[#3B4A6B] flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIXED_ASSESSMENTS.map((card) => {
            const summary = assessmentsList.find(
              (a) => a.id === card.id || (card.id === 'python-fundamentals' && a.id === 'python')
            );
            const hasResult = Boolean(summary?.lastResult);
            const scorePercent = summary?.lastResult?.overallPercent;
            const inProgress = Boolean(summary?.lastResult ? false : summary && (summary as any).inProgressAttemptId);

            // Status label
            let statusBadge = (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                Not started
              </span>
            );
            let actionText = 'Start Test';

            if (hasResult && scorePercent !== undefined) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Score: {scorePercent}/100</span>
                </span>
              );
              actionText = 'Retake Test';
            } else if (inProgress) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>In progress</span>
                </span>
              );
              actionText = 'Resume Test';
            }

            const isLockedForVisitor = card.requiresAuth && !user;

            return (
              <div
                key={card.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top line: title, badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#3B4A6B]">
                          {card.title}
                        </h3>
                        {isLockedForVisitor && (
                          <span
                            title="Sign in required"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Sign in</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#8A94AD] font-medium">
                        <span>{card.questionsCount}</span>
                        <span>·</span>
                        <span>{card.format}</span>
                      </div>
                    </div>

                    <div className="shrink-0">{statusBadge}</div>
                  </div>

                  {/* Short description */}
                  <p className="text-xs text-[#6B7A99] leading-relaxed line-clamp-2">
                    {card.shortDescription}
                  </p>
                </div>

                {/* Footer action bar */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {card.id === 'python-fundamentals' ? 'Preview available' : 'Full 25-Q Suite'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStartCard(card)}
                    className="py-2 px-4 rounded-xl bg-[#4A64B8] hover:bg-[#3B4A6B] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <span>{actionText}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SKILLS DataTable */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#3B4A6B] tracking-tight">
            Verified Skills Matrix
          </h2>
          <button
            onClick={onNavigateToSkills}
            className="text-xs font-semibold text-[#8A94AD] hover:text-[#3B4A6B] flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <DataTable
          columns={skillColumns}
          data={displaySkills}
          keyExtractor={(item) => item.id}
          onRowClick={() => onNavigateToSkills()}
          emptyMessage="No skills evidenced yet"
        />
      </div>

      {/* 5. RECENT ATTEMPTS Compact DataTable */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#3B4A6B] tracking-tight">
            Recent Attempts
          </h2>
          <button
            onClick={() => onNavigateToAssessments()}
            className="text-xs font-semibold text-[#8A94AD] hover:text-[#3B4A6B] flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            <span>History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <DataTable
          columns={attemptColumns}
          data={dashboardData?.recentActivity?.slice(0, 3) || []}
          keyExtractor={(item) => item.id}
          onRowClick={() => onNavigateToAssessments()}
          emptyMessage="No attempts recorded yet."
        />
      </div>

      {/* MODAL 1: CV Analysis Coming Soon friendly message */}
      {showCvComingSoonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 text-center space-y-5">
            <button
              onClick={() => setShowCvComingSoonModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#4A64B8] mx-auto flex items-center justify-center shadow-inner">
              <Sparkles className="w-7 h-7 text-[#4A64B8]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                CV Analysis Coming Soon
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                CV analysis is coming soon. For now, choose one of the skill assessments below.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-left space-y-2 border border-slate-100 text-xs text-slate-600">
              <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                Available Assessments (25 Questions):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Python
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Java
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Data Structures
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Front-end Dev
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowCvComingSoonModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#4A64B8] hover:bg-[#3B4A6B] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <span>Choose an Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Visitor Sign-In Required for Java / DSA / Frontend */}
      {signInPromptCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 text-center space-y-5">
            <button
              onClick={() => setSignInPromptCard(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center shadow-inner">
              <Lock className="w-7 h-7 text-amber-700" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Sign In Required
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Please sign in to take the <strong>{signInPromptCard.title}</strong> assessment. The Python assessment is available for public preview without an account.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSignInPromptCard(null);
                  onNavigateToAssessments('python-fundamentals');
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
