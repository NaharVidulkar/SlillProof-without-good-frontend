/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { AppShell } from './components/layout/AppShell.tsx';
import { NavTabId } from './components/layout/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { AssessmentView } from './components/AssessmentView.tsx';
import { SkillsView } from './components/SkillsView.tsx';
import { JobMatchView } from './components/JobMatchView.tsx';
import { PassportView } from './components/PassportView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { HelpView } from './components/HelpView.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [isAttemptMode, setIsAttemptMode] = useState<boolean>(false);
  const [dashboardRightPanel, setDashboardRightPanel] = useState<React.ReactNode>(null);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string>('python-fundamentals');
  const [currentSubView, setCurrentSubView] = useState<'list' | 'detail' | 'attempt' | undefined>(undefined);

  // Synchronize browser history / URL path
  useEffect(() => {
    const handleUrlSync = () => {
      const pathname = window.location.pathname;
      const path = pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase().replace('#', '');

      if (path.includes('challenges') || hash.includes('challenges')) {
        setActiveTab('assessments');
        setCurrentAttemptId(null);
        setCurrentSubView('list');
        window.history.replaceState(null, '', '/assessments');
        return;
      }

      // Check for deep attempt link e.g. /assessments/python-fundamentals/attempt/att_xxx or /attempts/att_xxx
      const attemptMatch = pathname.match(/(?:assessments\/([^/]+)\/attempt|attempts)\/([^/?#]+)/i);
      if (attemptMatch) {
        setActiveTab('assessments');
        if (attemptMatch[1]) {
          setCurrentAssessmentId(attemptMatch[1]);
        }
        setCurrentAttemptId(attemptMatch[2]);
        setCurrentSubView('attempt');
        return;
      }

      // Check for assessment detail e.g. /assessments/python-fundamentals
      const assessmentDetailMatch = pathname.match(/^\/assessments\/([^/?#]+)$/i);
      if (assessmentDetailMatch && assessmentDetailMatch[1] && assessmentDetailMatch[1] !== 'attempt') {
        setActiveTab('assessments');
        setCurrentAssessmentId(assessmentDetailMatch[1]);
        setCurrentAttemptId(null);
        setCurrentSubView('detail');
        return;
      }

      if (path.includes('assessments') || hash.includes('assessments') || path.includes('assessment')) {
        setActiveTab('assessments');
        setCurrentAttemptId(null);
        setCurrentSubView('list');
      } else if (path.includes('skills') || hash.includes('skills')) {
        setActiveTab('skills');
      } else if (path.includes('job-match') || hash.includes('job-match')) {
        setActiveTab('job-match');
      } else if (path.includes('passport') || hash.includes('passport')) {
        setActiveTab('passport');
      } else if (path.includes('profile') || hash.includes('profile')) {
        setActiveTab('profile');
      } else if (path.includes('help') || hash.includes('help')) {
        setActiveTab('help');
      } else if (path.includes('dashboard') || hash.includes('dashboard')) {
        setActiveTab('dashboard');
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, []);

  const handleTabChange = useCallback((tab: NavTabId) => {
    setActiveTab(tab);
    window.history.pushState(null, '', `/${tab}`);
    // If navigating away from assessments, ensure attempt mode is exited
    if (tab !== 'assessments') {
      setIsAttemptMode(false);
      setCurrentAttemptId(null);
    }
  }, []);

  const handleNavigateToAssessments = useCallback((assessmentId?: string) => {
    if (assessmentId) {
      setCurrentAssessmentId(assessmentId);
      setCurrentSubView('detail');
      window.history.pushState(null, '', `/assessments/${assessmentId}`);
    } else {
      setCurrentSubView('list');
      window.history.pushState(null, '', '/assessments');
    }
    setActiveTab('assessments');
    setIsAttemptMode(false);
    setCurrentAttemptId(null);
  }, []);

  const handleNavigateToSkills = useCallback(() => {
    handleTabChange('skills');
  }, [handleTabChange]);

  const handleNavigateToProfile = useCallback(() => {
    handleTabChange('profile');
  }, [handleTabChange]);

  const handleNavigateToPassport = useCallback(() => {
    handleTabChange('passport');
  }, [handleTabChange]);

  const handleOpenAttempt = useCallback((attId: string) => {
    setCurrentAttemptId(attId);
    setCurrentSubView('attempt');
    setActiveTab('assessments');
    window.history.pushState(null, '', `/assessments/${currentAssessmentId}/attempt/${attId}`);
  }, [currentAssessmentId, handleTabChange]);

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      rightPanel={activeTab === 'dashboard' ? dashboardRightPanel : undefined}
      isAttemptMode={isAttemptMode}
    >
      {activeTab === 'dashboard' && (
        <DashboardView
          onNavigateToAssessments={handleNavigateToAssessments}
          onNavigateToSkills={handleNavigateToSkills}
          onNavigateToProfile={handleNavigateToProfile}
          onOpenAttempt={handleOpenAttempt}
          onUpdateRightPanel={setDashboardRightPanel}
        />
      )}

      {activeTab === 'assessments' && (
        <AssessmentView
          key={currentAttemptId ? `attempt-${currentAttemptId}` : 'assessments-root'}
          initialAttemptId={currentAttemptId}
          initialAssessmentId={currentAssessmentId}
          initialSubView={currentSubView}
          onNavigateToPassport={handleNavigateToPassport}
          onAttemptModeChange={setIsAttemptMode}
        />
      )}

      {activeTab === 'skills' && (
        <SkillsView
          onNavigateToAssessments={handleNavigateToAssessments}
        />
      )}

      {activeTab === 'job-match' && (
        <JobMatchView
          onNavigateToAssessments={handleNavigateToAssessments}
        />
      )}

      {activeTab === 'passport' && (
        <PassportView />
      )}

      {activeTab === 'profile' && (
        <ProfileView
          onSignOut={() => {
            window.location.href = '/';
          }}
        />
      )}

      {activeTab === 'help' && (
        <HelpView />
      )}
    </AppShell>
  );
}
