/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AssessmentView } from './components/AssessmentView.tsx';
import { SkillsView } from './components/SkillsView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { JobMatchView } from './components/JobMatchView.tsx';
import { PassportView } from './components/PassportView.tsx';

type NavTab = 'dashboard' | 'assessments' | 'skills' | 'job-match' | 'passport';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Handle URL hash or path initialization and redirect /challenges to /assessments
  useEffect(() => {
    const handleUrlSync = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase().replace('#', '');

      if (path.includes('challenges') || hash.includes('challenges')) {
        setActiveTab('assessments');
        window.history.replaceState(null, '', '/assessments');
        return;
      }

      if (path.includes('assessments') || hash.includes('assessments') || path.includes('assessment')) {
        setActiveTab('assessments');
      } else if (path.includes('skills') || hash.includes('skills')) {
        setActiveTab('skills');
      } else if (path.includes('job-match') || hash.includes('job-match')) {
        setActiveTab('job-match');
      } else if (path.includes('passport') || hash.includes('passport')) {
        setActiveTab('passport');
      } else if (path.includes('dashboard') || hash.includes('dashboard')) {
        setActiveTab('dashboard');
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    window.history.pushState(null, '', `/${tab}`);
  };

  const navItems: Array<{ id: NavTab; label: string }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'skills', label: 'Skills' },
    { id: 'job-match', label: 'Job Match' },
    { id: 'passport', label: 'Passport' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Zone 1: Single Brand Wordmark */}
          <button
            onClick={() => handleTabChange('dashboard')}
            className="text-lg font-bold tracking-tight text-slate-900 hover:text-slate-700 transition-colors cursor-pointer"
          >
            SkillProof
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: User indicator */}
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-mono text-slate-700 font-medium hidden sm:inline">demo-user</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView onNavigateToAssessments={() => handleTabChange('assessments')} />
        )}

        {activeTab === 'assessments' && (
          <AssessmentView onNavigateToPassport={() => handleTabChange('passport')} />
        )}

        {activeTab === 'skills' && (
          <SkillsView onNavigateToAssessments={() => handleTabChange('assessments')} />
        )}

        {activeTab === 'job-match' && (
          <JobMatchView onNavigateToAssessments={() => handleTabChange('assessments')} />
        )}

        {activeTab === 'passport' && <PassportView />}
      </main>
    </div>
  );
}
