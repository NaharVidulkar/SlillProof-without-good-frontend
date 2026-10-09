/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Confidence } from '../../../lib/types.ts';

interface ConfidenceRingProps {
  confidence: Confidence | string;
  score?: number;
  className?: string;
}

export const ConfidenceRing: React.FC<ConfidenceRingProps> = ({
  confidence,
  score,
  className = '',
}) => {
  const percent = score !== undefined ? Math.round(score * 100) : confidence === 'High' ? 85 : confidence === 'Medium' ? 55 : 25;
  const strokeColor =
    confidence === 'High'
      ? '#4A64B8'
      : confidence === 'Medium'
      ? '#6F86C9'
      : '#8A94AD';

  return (
    <div className={`inline-flex items-center space-x-1.5 ${className}`}>
      {/* SVG mini gauge / ring */}
      <svg className="w-4 h-4 transform -rotate-90 shrink-0" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="3.5"
        />
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeDasharray="56.5"
          strokeDashoffset={56.5 - (56.5 * percent) / 100}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xs font-medium text-[#3B4A6B]">
        {confidence}
      </span>
    </div>
  );
};
