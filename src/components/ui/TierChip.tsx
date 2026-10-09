/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tier } from '../../../lib/types.ts';

interface TierChipProps {
  tier: Tier | string;
  className?: string;
}

export const TierChip: React.FC<TierChipProps> = ({ tier, className = '' }) => {
  const getStyles = () => {
    switch (tier) {
      case 'Demonstrated':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
      case 'Assessed':
        return 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]';
      case 'Claimed':
      default:
        return 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getStyles()} ${className}`}
    >
      {tier}
    </span>
  );
};
