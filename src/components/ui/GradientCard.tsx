/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight, FileCode2, ListChecks, Terminal } from 'lucide-react';

export type SectionTier = 'easy' | 'medium' | 'hard';

interface GradientCardProps {
  tier: SectionTier;
  title: string;
  subtitle: string;
  answeredCount?: number;
  totalQuestions: number;
  scorePercent?: number;
  isFinished?: boolean;
  weight: number;
  onClick: () => void;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  tier,
  title,
  subtitle,
  answeredCount = 0,
  totalQuestions,
  scorePercent,
  isFinished = false,
  weight,
  onClick,
}) => {
  const getGradientStyles = () => {
    switch (tier) {
      case 'easy':
        // Blue gradient matching reference
        return 'bg-gradient-to-br from-[#3B58B5] to-[#5A77D4] text-white';
      case 'medium':
        // Periwinkle gradient matching reference
        return 'bg-gradient-to-br from-[#5A73BC] to-[#7E92D2] text-white';
      case 'hard':
        // Purple to Coral gradient matching reference
        return 'bg-gradient-to-br from-[#8570B3] via-[#AC7BA4] to-[#E57D8E] text-white';
    }
  };

  const getIcon = () => {
    switch (tier) {
      case 'easy':
        return <ListChecks className="w-4 h-4 text-white/80" />;
      case 'medium':
        return <FileCode2 className="w-4 h-4 text-white/80" />;
      case 'hard':
        return <Terminal className="w-4 h-4 text-white/80" />;
    }
  };

  const percent = isFinished && scorePercent !== undefined
    ? scorePercent
    : totalQuestions > 0
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  const progressText = isFinished && scorePercent !== undefined
    ? `Score: ${scorePercent}%`
    : `answered ${answeredCount} of ${totalQuestions}`;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`rounded-2xl p-5 sm:p-6 shadow-[0_4px_16px_rgba(59,74,107,0.08)] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between min-h-[170px] select-none ${getGradientStyles()}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase opacity-85">
            Section {tier === 'easy' ? 'A' : tier === 'medium' ? 'B' : 'C'}
          </span>
          <span className="p-1 rounded-full bg-white/15 backdrop-blur-xs">
            {getIcon()}
          </span>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-white/85 font-medium mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-3">
        {/* Progress line & bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-white/90">
            <span>{progressText}</span>
            <span className="font-mono text-[11px]">{percent}%</span>
          </div>
          <div className="w-full bg-black/15 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Footer with weight */}
        <div className="flex items-center justify-between text-[11px] text-white/80 pt-1 border-t border-white/15">
          <span>Question weight: x{weight}</span>
          <span className="flex items-center gap-0.5 font-medium text-white group-hover:underline">
            Open <ChevronRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
