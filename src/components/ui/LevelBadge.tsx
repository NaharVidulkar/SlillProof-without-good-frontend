/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SkillLevel } from '../../../lib/types.ts';

interface LevelBadgeProps {
  level: SkillLevel | string;
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, className = '' }) => {
  const getStyles = () => {
    switch (level) {
      case 'Advanced':
        return 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]';
      case 'Intermediate':
        return 'bg-[#E0E7FF] text-[#4F46E5] border-[#C7D2FE]';
      case 'Beginner':
        return 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]';
      case 'Novice':
      default:
        return 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${getStyles()} ${className}`}
    >
      {level}
    </span>
  );
};
