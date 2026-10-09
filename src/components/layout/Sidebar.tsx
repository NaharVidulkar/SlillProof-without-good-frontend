/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Award,
  Zap,
  Briefcase,
  ShieldCheck,
  HelpCircle,
  User,
  ChevronRight,
} from 'lucide-react';

export type NavTabId =
  | 'dashboard'
  | 'assessments'
  | 'skills'
  | 'job-match'
  | 'passport'
  | 'profile'
  | 'help';

interface SidebarProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  className = '',
}) => {
  const navItems: Array<{ id: NavTabId; label: string; icon: React.ReactNode }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: <Award className="w-5 h-5" />,
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      id: 'job-match',
      label: 'Job Match',
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      id: 'passport',
      label: 'Passport',
      icon: <ShieldCheck className="w-5 h-5" />,
    },
  ];

  return (
    <aside
      className={`w-60 bg-white rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between shadow-[0_4px_24px_rgba(59,74,107,0.04)] border border-slate-100 shrink-0 ${className}`}
    >
      <div className="space-y-6">
        {/* Original SkillProof Logo & Wordmark */}
        <div
          onClick={() => onTabChange('dashboard')}
          className="flex items-center space-x-3 cursor-pointer py-1 select-none"
        >
          {/* Original Geometric Mark: Interlocking Shield Nodes */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3B4A6B] to-[#4A64B8] flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path
                d="M12 2L4 6V12C4 17.5 7.4 22.3 12 23.5C16.6 22.3 20 17.5 20 12V6L12 2Z"
                fill="#4A64B8"
              />
              <path
                d="M12 2L20 6V12C20 17.5 16.6 22.3 12 23.5V2Z"
                fill="#3B4A6B"
              />
              <path
                d="M9 12L11.5 14.5L15.5 9.5"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-[#3B4A6B]">
              SkillProof
            </span>
            <span className="text-[10px] font-semibold text-[#8A94AD] tracking-wider uppercase -mt-0.5">
              Verified Skills
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#EAEDF2] text-[#4A64B8] font-bold shadow-2xs'
                    : 'text-[#8A94AD] hover:text-[#3B4A6B] hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-[#4A64B8]' : 'text-[#8A94AD]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: "Need help?" Card matching reference */}
      <div className="pt-4">
        <div className="bg-[#EAEDF2]/70 rounded-2xl p-4 text-center space-y-3 border border-slate-200/50">
          {/* Original Illustration: Help & Guide desk with headset SVG */}
          <div className="w-16 h-16 mx-auto relative flex items-center justify-center">
            <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
              <circle cx="40" cy="40" r="32" fill="#DCE1F5" />
              {/* Screen / laptop */}
              <rect x="22" y="32" width="36" height="24" rx="3" fill="#3B4A6B" />
              <rect x="25" y="35" width="30" height="18" rx="2" fill="#FFFFFF" />
              <line x1="18" y1="56" x2="62" y2="56" stroke="#4A64B8" strokeWidth="3" strokeLinecap="round" />
              {/* Headset icon */}
              <circle cx="40" cy="24" r="8" fill="#F28B94" />
              <path
                d="M 33 24 A 7 7 0 0 1 47 24"
                stroke="#3B4A6B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <rect x="31" y="22" width="3" height="5" rx="1.5" fill="#3B4A6B" />
              <rect x="46" y="22" width="3" height="5" rx="1.5" fill="#3B4A6B" />
              {/* Badge pill 24/7 */}
              <rect x="45" y="12" width="22" height="12" rx="4" fill="#F28B94" />
              <text x="56" y="21" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">
                GUIDE
              </text>
            </svg>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#3B4A6B]">
              Need help?
            </h4>
            <p className="text-[11px] text-[#8A94AD] leading-relaxed">
              Understand how verification, levels, confidence & badges work.
            </p>
          </div>

          <button
            onClick={() => onTabChange('help')}
            className="w-full py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#3B4A6B] text-xs font-bold shadow-2xs border border-slate-200/80 transition-colors cursor-pointer"
          >
            Platform Guide
          </button>
        </div>
      </div>
    </aside>
  );
};
