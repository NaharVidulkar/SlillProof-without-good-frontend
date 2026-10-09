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
  Zap,
} from 'lucide-react';
import { clientApi } from '../../lib/client/api.ts';
import { DashboardData, SkillMetric } from '../../lib/types.ts';
import {
  AssessmentAttempt,
  AssessmentResult,
  PublicAssessmentDetail,
} from '../../lib/server/assessments/types.ts';
import { Banner, BannerState } from './ui/Banner.tsx';
import { GradientCard } from './ui/GradientCard.tsx';
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

export interface DashboardViewProps {
  onNavigateToAssessments: () => void;
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [assessmentDetail, setAssessmentDetail] = useState<PublicAssessmentDetail | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<AssessmentAttempt | null>(null);
  const [lastResult, setLastResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, detail] = await Promise.all([
        clientApi.getDashboard(),
        clientApi.getAssessmentDetail('python-fundamentals'),
      ]);

      setDashboardData(dash);
      setAssessmentDetail(detail);

      // If there's an in-progress attempt, fetch its details
      if (detail.inProgressAttemptId) {
        try {
          const att = await clientApi.getAttempt(detail.inProgressAttemptId);
          setCurrentAttempt(att);
        } catch {
          setCurrentAttempt(null);
        }
      } else {
        setCurrentAttempt(null);
      }

      // If there's a last result, try fetching its full result details
      if (detail.lastResult?.recordId) {
        try {
          // Check attempt result
          const attempts = await clientApi.getDashboard();
          const lastActivity = attempts.recentActivity.find((a) => a.type === 'assessment');
          if (lastActivity) {
            // Find completed attempt result if available
          }
        } catch {
          // ignore
        }
      }
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
    const mins = Math.floor(assessmentDetail.remainingSeconds / 60);
    const secs = assessmentDetail.remainingSeconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m`;
    }
    return `${mins}m ${secs}s`;
  }, [assessmentDetail?.remainingSeconds]);

  // Calculate Section Answered counts from active attempt
  const sectionCounts = useMemo(() => {
    const answers = currentAttempt?.answers || {};
    let secA = 0;
    let secB = 0;
    let secC = 0;

    Object.entries(answers).forEach(([qid, ans]) => {
      const isAnswered = Boolean(ans.choiceId || (ans.code && ans.code.trim().length > 10));
      if (!isAnswered) return;
      if (qid.startsWith('A')) secA++;
      else if (qid.startsWith('B')) secB++;
      else if (qid.startsWith('C')) secC++;
    });

    return { secA, secB, secC };
  }, [currentAttempt]);

  // Combine evaluated skills with the 10 Python skills
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
          lastVerified: 'Recently verified',
          isEvidenced: true,
        };
      }
      return {
        id: canon.id,
        name: canon.name,
        level: 'Novice' as const,
        confidence: 'Low' as const,
        confidenceScore: 0.2,
        tier: 'Claimed' as const,
        evidenceCount: 0,
        lastVerified: '—',
        isEvidenced: false,
      };
    }).slice(0, 5); // Show top 5 rows on dashboard as per spec
  }, [dashboardData?.skills]);

  // Compute Calendar Events from real data
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Recent activity dates
    if (dashboardData?.recentActivity) {
      dashboardData.recentActivity.forEach((act) => {
        events.push({
          date: act.date,
          title: `${act.title} (${act.score}%)`,
          type: 'attempt_finished',
        });
      });
    }

    // Badge issue & expiry dates
    if (assessmentDetail?.lastResult?.completedAt) {
      const issued = new Date(assessmentDetail.lastResult.completedAt);
      events.push({
        date: issued.toISOString(),
        title: `Badge Issued: ${assessmentDetail.lastResult.badgeLabel} (${assessmentDetail.lastResult.overallPercent}%)`,
        type: 'badge_issued',
      });

      // Expiry (12 months later)
      const expiry = new Date(issued.getTime() + 365 * 24 * 60 * 60 * 1000);
      events.push({
        date: expiry.toISOString(),
        title: `Badge Expiry: ${assessmentDetail.lastResult.badgeLabel}`,
        type: 'badge_expiry',
      });
    }

    // In-progress attempt deadline
    if (currentAttempt?.deadlineAt) {
      events.push({
        date: currentAttempt.deadlineAt,
        title: 'Active Assessment Deadline',
        type: 'attempt_started',
      });
    }

    return events;
  }, [dashboardData?.recentActivity, assessmentDetail?.lastResult, currentAttempt?.deadlineAt]);

  // Compute Reminders from real data
  const reminders: ReminderItem[] = useMemo(() => {
    const list: ReminderItem[] = [];

    // 1. Attempt in progress with deadline
    if (currentAttempt && remainingTimeText) {
      list.push({
        id: 'rem-in-progress',
        title: 'Python assessment in progress',
        dateText: `${remainingTimeText} remaining to submit`,
        type: 'in_progress',
      });
    }

    // 2. Badge expiring within 30 days
    if (assessmentDetail?.lastResult?.completedAt) {
      const issued = new Date(assessmentDetail.lastResult.completedAt);
      const expiry = new Date(issued.getTime() + 365 * 24 * 60 * 60 * 1000);
      const daysUntilExpiry = Math.round((expiry.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        list.push({
          id: 'rem-expiry',
          title: 'Python badge renewal upcoming',
          dateText: `Expires in ${daysUntilExpiry} days`,
          type: 'expiring',
        });
      }
    }

    // 3. Practise next: weakest skill
    if (dashboardData?.skills && dashboardData.skills.length > 0) {
      const sorted = [...dashboardData.skills].sort((a, b) => a.proficiency - b.proficiency);
      const weakest = sorted[0];
      if (weakest) {
        list.push({
          id: 'rem-practise',
          title: `Practise next: ${weakest.skillName}`,
          dateText: `Recommended next skill to elevate to Demonstrated`,
          type: 'practise',
        });
      }
    } else {
      list.push({
        id: 'rem-practise-first',
        title: 'Practise next: Python Fundamentals',
        dateText: 'Complete the diagnostic assessment',
        type: 'practise',
      });
    }

    // 4. Retake available cooldown (if completed)
    if (assessmentDetail?.lastResult?.completedAt && !currentAttempt) {
      const completed = new Date(assessmentDetail.lastResult.completedAt);
      list.push({
        id: 'rem-retake',
        title: 'Assessment Retake',
        dateText: 'Available now (evidence updates on submission)',
        type: 'retake',
      });
    }

    return list;
  }, [currentAttempt, remainingTimeText, assessmentDetail?.lastResult, dashboardData?.skills]);

  // Update Right Panel in parent AppShell whenever data changes
  useEffect(() => {
    if (onUpdateRightPanel) {
      const rightPanelElement = (
        <RightPanel
          userName="Stella Walton"
          userRole="Student"
          hasBadge={Boolean(assessmentDetail?.lastResult)}
          badgeLabel={assessmentDetail?.lastResult?.badgeLabel}
          badgePercent={assessmentDetail?.lastResult?.overallPercent}
          badgeStatus="active"
          calendarEvents={calendarEvents}
          reminders={reminders}
          onNavigateToProfile={onNavigateToProfile}
          onViewBadge={() => {
            if (assessmentDetail?.lastResult) {
              onNavigateToAssessments();
            }
          }}
          onStartAssessment={onNavigateToAssessments}
          onReminderClick={(rem) => {
            if (rem.type === 'in_progress' && assessmentDetail?.inProgressAttemptId && onOpenAttempt) {
              onOpenAttempt(assessmentDetail.inProgressAttemptId);
            } else {
              onNavigateToAssessments();
            }
          }}
        />
      );
      onUpdateRightPanel(rightPanelElement);
    }

    return () => {
      onUpdateRightPanel?.(null);
    };
  }, [
    assessmentDetail,
    calendarEvents,
    reminders,
    currentAttempt,
    onNavigateToAssessments,
    onNavigateToProfile,
    onOpenAttempt,
    onUpdateRightPanel,
  ]);

  const handleBannerAction = () => {
    if (bannerState === 'in_progress' && assessmentDetail?.inProgressAttemptId && onOpenAttempt) {
      onOpenAttempt(assessmentDetail.inProgressAttemptId);
    } else {
      onNavigateToAssessments();
    }
  };

  const handleSectionClick = () => {
    if (assessmentDetail?.inProgressAttemptId && onOpenAttempt) {
      onOpenAttempt(assessmentDetail.inProgressAttemptId);
    } else {
      onNavigateToAssessments();
    }
  };

  // Define Columns for Skills DataTable
  const skillColumns: Column<{
    id: string;
    name: string;
    level: string;
    confidence: string;
    confidenceScore: number;
    tier: string;
    evidenceCount: number;
    lastVerified: string;
    isEvidenced: boolean;
  }>[] = [
    {
      key: 'skill',
      header: 'Skill',
      className: 'col-span-4 sm:col-span-3',
      render: (item) => (
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-[#3B4A6B]">{item.name}</div>
          <div className="text-[10px] font-mono text-[#8A94AD]">{item.id}</div>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      className: 'col-span-2',
      render: (item) => <LevelBadge level={item.level} />,
    },
    {
      key: 'confidence',
      header: 'Confidence',
      className: 'col-span-3 sm:col-span-2',
      render: (item) => (
        <ConfidenceRing
          confidence={item.confidence}
          score={item.confidenceScore}
        />
      ),
    },
    {
      key: 'tier',
      header: 'Tier',
      className: 'col-span-2 hidden sm:block',
      render: (item) => <TierChip tier={item.tier} />,
    },
    {
      key: 'evidence',
      header: 'Evidence',
      className: 'col-span-3 sm:col-span-2 text-right sm:text-left',
      render: (item) => (
        <span
          className={`text-xs font-semibold ${
            item.isEvidenced ? 'text-[#3B4A6B]' : 'text-[#8A94AD]'
          }`}
        >
          {item.isEvidenced ? `${item.evidenceCount} items` : 'Not yet evidenced'}
        </span>
      ),
    },
    {
      key: 'lastVerified',
      header: 'Last Verified',
      className: 'col-span-1 hidden sm:block text-right',
      render: (item) => (
        <span className="text-[11px] text-[#8A94AD]">
          {item.lastVerified}
        </span>
      ),
    },
  ];

  // Define Columns for Recent Attempts DataTable
  const attemptColumns: Column<{
    id: string;
    type: 'submission' | 'assessment';
    title: string;
    score: number;
    date: string;
    status: string;
  }>[] = [
    {
      key: 'date',
      header: 'Date',
      className: 'col-span-3 sm:col-span-2',
      render: (item) => (
        <span className="text-xs font-medium text-[#8A94AD]">
          {new Date(item.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Assessment / Activity',
      className: 'col-span-4 sm:col-span-4',
      render: (item) => (
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-[#EAEDF2] text-[#4A64B8] shrink-0">
            <Award className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#3B4A6B] truncate">
            {item.title}
          </span>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      className: 'col-span-2',
      render: (item) => (
        <span className="text-xs font-mono font-bold text-[#3B4A6B]">
          {item.score}%
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'col-span-3 sm:col-span-2',
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Completed
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      className: 'col-span-2 hidden sm:block text-right',
      render: () => (
        <button
          onClick={onNavigateToAssessments}
          className="text-xs font-bold text-[#4A64B8] hover:text-[#3B4A6B] cursor-pointer"
        >
          View result →
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Banner */}
        <div className="bg-white rounded-3xl p-8 h-44 animate-pulse shadow-xs" />
        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl h-44 animate-pulse shadow-xs" />
          <div className="bg-white rounded-2xl h-44 animate-pulse shadow-xs" />
          <div className="bg-white rounded-2xl h-44 animate-pulse shadow-xs" />
        </div>
        {/* Skeleton Table */}
        <div className="bg-white rounded-2xl p-6 h-64 animate-pulse shadow-xs" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-rose-100 shadow-sm text-center space-y-4">
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
      {/* 1. WELCOME BANNER matching Learnthru reference card */}
      <Banner
        userName="Stella"
        state={bannerState}
        remainingTimeText={remainingTimeText}
        badgeLabel={assessmentDetail?.lastResult?.badgeLabel}
        badgePercent={assessmentDetail?.lastResult?.overallPercent}
        onActionClick={handleBannerAction}
      />

      {/* 2. ASSESSMENT SECTIONS matching reference's class cards */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#3B4A6B] tracking-tight">
            Assessment
          </h2>
          <button
            onClick={onNavigateToAssessments}
            className="text-xs font-semibold text-[#8A94AD] hover:text-[#3B4A6B] flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GradientCard
            tier="easy"
            title="Section A: Basic"
            subtitle="5 MCQs"
            answeredCount={sectionCounts.secA}
            totalQuestions={5}
            scorePercent={assessmentDetail?.lastResult ? 100 : undefined}
            isFinished={Boolean(assessmentDetail?.lastResult)}
            weight={1}
            onClick={handleSectionClick}
          />
          <GradientCard
            tier="medium"
            title="Section B: Medium"
            subtitle="6 MCQs + 4 coding"
            answeredCount={sectionCounts.secB}
            totalQuestions={10}
            scorePercent={assessmentDetail?.lastResult ? Math.min(100, assessmentDetail.lastResult.overallPercent) : undefined}
            isFinished={Boolean(assessmentDetail?.lastResult)}
            weight={2}
            onClick={handleSectionClick}
          />
          <GradientCard
            tier="hard"
            title="Section C: Hard"
            subtitle="10 coding problems"
            answeredCount={sectionCounts.secC}
            totalQuestions={10}
            scorePercent={assessmentDetail?.lastResult ? Math.max(0, assessmentDetail.lastResult.overallPercent - 10) : undefined}
            isFinished={Boolean(assessmentDetail?.lastResult)}
            weight={3}
            onClick={handleSectionClick}
          />
        </div>
      </div>

      {/* 3. SKILLS DataTable matching reference's Lessons table */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#3B4A6B] tracking-tight">
            Your Python skills
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

      {/* 4. RECENT ATTEMPTS Compact DataTable */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#3B4A6B] tracking-tight">
            Recent Attempts
          </h2>
          <button
            onClick={onNavigateToAssessments}
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
          onRowClick={onNavigateToAssessments}
          emptyMessage="No attempts recorded yet. Start the Python assessment to earn your verified badge."
        />
      </div>
    </div>
  );
};
