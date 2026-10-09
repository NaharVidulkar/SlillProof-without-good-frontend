/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar, NavTabId } from './Sidebar.tsx';
import { TopBar } from './TopBar.tsx';
import { X } from 'lucide-react';

interface AppShellProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  isAttemptMode?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onTabChange,
  children,
  rightPanel,
  isAttemptMode = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className={`min-h-screen ${
        isAttemptMode ? 'bg-[#EAEDF2] p-2 sm:p-4' : 'bg-[#D9DEE8] p-2 sm:p-4 md:p-6 lg:p-8'
      } text-[#3B4A6B] flex justify-center`}
    >
      <div
        className={`${
          isAttemptMode
            ? 'w-full max-w-[1700px]'
            : 'max-w-[1480px] w-full flex flex-col lg:flex-row gap-4 sm:gap-6 items-start'
        }`}
      >
        {/* Desktop Left Sidebar */}
        {!isAttemptMode && (
          <div className="hidden lg:block shrink-0 sticky top-6 self-start h-[calc(100vh-3rem)] max-h-[880px]">
            <Sidebar
              activeTab={activeTab}
              onTabChange={onTabChange}
              className="h-full"
            />
          </div>
        )}

        {/* Mobile Sidebar Slide-in Drawer */}
        {!isAttemptMode && mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-[#3B4A6B]/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in panel */}
            <div className="relative z-10 w-72 max-w-[80vw] bg-white h-full p-4 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-bold text-[#3B4A6B]">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#8A94AD] hover:text-[#3B4A6B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <Sidebar
                activeTab={activeTab}
                onTabChange={(tab) => {
                  onTabChange(tab);
                  setMobileMenuOpen(false);
                }}
                className="w-full shadow-none p-0 border-none rounded-none"
              />
            </div>
          </div>
        )}

        {/* Main Column */}
        <div
          className={`flex-1 w-full min-w-0 ${
            isAttemptMode
              ? ''
              : 'bg-[#EAEDF2] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-[0_4px_24px_rgba(59,74,107,0.03)] border border-slate-200/60 flex flex-col min-h-[calc(100vh-3rem)]'
          }`}
        >
          {/* Top Bar (Search + Date + Mobile Menu Toggle) */}
          {!isAttemptMode && (
            <TopBar
              onNavigate={onTabChange}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
            />
          )}

          {/* Page Content */}
          <main className="flex-1 w-full space-y-6">
            {children}
          </main>

          {/* Right Panel stacked on intermediate screens (1024px to 1279px) */}
          {!isAttemptMode && rightPanel && (
            <div className="mt-8 block xl:hidden w-full">
              {rightPanel}
            </div>
          )}
        </div>

        {/* Right Panel column on wide desktop screens (>= 1280px / xl) */}
        {!isAttemptMode && rightPanel && (
          <div className="hidden xl:block shrink-0 sticky top-6 self-start w-80">
            {rightPanel}
          </div>
        )}
      </div>
    </div>
  );
};
