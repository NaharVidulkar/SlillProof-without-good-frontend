/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

interface BadgeCardProps {
  hasBadge: boolean;
  label?: string;
  percent?: number;
  status?: 'active' | 'provisional' | 'under_review' | string;
  issuedAt?: string;
  onViewBadge?: () => void;
  onStartAssessment?: () => void;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  hasBadge,
  label = 'Competent',
  percent = 84,
  status = 'active',
  onViewBadge,
  onStartAssessment,
}) => {
  const getStatusChip = (s: string) => {
    switch (s.toLowerCase()) {
      case 'provisional':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Provisional
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Under review
          </span>
        );
      case 'active':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
    }
  };

  const getLabelColor = (l: string) => {
    switch (l) {
      case 'Expert':
        return 'from-[#8E7FBF] to-[#F28B94] text-white';
      case 'Strong':
        return 'from-[#4A64B8] to-[#6F86C9] text-white';
      case 'Competent':
        return 'from-[#5A73BC] to-[#7B8AB8] text-white';
      case 'Developing':
        return 'from-[#7B8AB8] to-[#8A94AD] text-white';
      default:
        return 'from-slate-400 to-slate-500 text-white';
    }
  };

  if (!hasBadge) {
    return (
      <div className="bg-[#EAEDF2]/60 rounded-2xl p-4 border border-slate-200/60 text-center space-y-2.5">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto text-[#7B8AB8] shadow-xs">
          <Award className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-[#3B4A6B]">
            Python Badge
          </h4>
          <p className="text-[11px] text-[#8A94AD] leading-relaxed">
            Complete the Python assessment to earn your verified badge.
          </p>
        </div>
        {onStartAssessment && (
          <button
            onClick={onStartAssessment}
            className="text-xs font-semibold text-[#4A64B8] hover:underline cursor-pointer"
          >
            Start Assessment →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(59,74,107,0.03)] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A94AD]">
          Verified Badge
        </span>
        {getStatusChip(status)}
      </div>

      <div className="flex items-center space-x-3">
        {/* Badge Shield Emblem */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${getLabelColor(label)} flex items-center justify-center shadow-xs shrink-0`}>
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline space-x-1.5">
            <h4 className="text-sm font-bold text-[#3B4A6B] truncate">
              {label}
            </h4>
            <span className="text-xs font-mono font-bold text-[#4A64B8]">
              {percent}%
            </span>
          </div>
          <p className="text-[11px] text-[#8A94AD]">
            Python Fundamentals
          </p>
        </div>
      </div>

      {onViewBadge && (
        <button
          onClick={onViewBadge}
          className="w-full flex items-center justify-between text-xs font-medium text-[#4A64B8] hover:text-[#3B4A6B] pt-2 border-t border-slate-100 cursor-pointer transition-colors"
        >
          <span>View badge credential</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
