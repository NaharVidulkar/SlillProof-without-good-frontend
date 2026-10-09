/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type BannerState = 'no_attempt' | 'in_progress' | 'finished';

interface BannerProps {
  userName?: string;
  state: BannerState;
  remainingTimeText?: string;
  badgeLabel?: string;
  badgePercent?: number;
  onActionClick: () => void;
}

export const Banner: React.FC<BannerProps> = ({
  userName = 'Stella',
  state,
  remainingTimeText,
  badgeLabel,
  badgePercent,
  onActionClick,
}) => {
  let statusText = 'Take the Python assessment to earn your first badge.';
  let buttonText = 'Start Assessment';

  if (state === 'in_progress') {
    statusText = `You have an assessment in progress, ${remainingTimeText || 'some time'} remaining.`;
    buttonText = 'Resume';
  } else if (state === 'finished' && badgeLabel) {
    statusText = `Your Python badge: ${badgeLabel} (${badgePercent ?? 0}%).`;
    buttonText = 'View result';
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(59,74,107,0.04)] border border-slate-100/80 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
      {/* Left content */}
      <div className="flex-1 space-y-3 z-10 w-full text-left">
        <h1 className="text-2xl sm:text-[28px] font-bold text-[#3B4A6B] tracking-tight">
          Welcome back, {userName}!
        </h1>
        <p className="text-sm text-[#8A94AD] leading-relaxed max-w-lg">
          {statusText}
        </p>
        <div className="pt-2">
          <button
            onClick={onActionClick}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#7B8AB8] hover:bg-[#6877A6] active:bg-[#5C6A96] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7B8AB8] focus:ring-offset-2"
          >
            {buttonText}
          </button>
        </div>
      </div>

      {/* Right isometric stack illustration */}
      <div className="shrink-0 w-48 sm:w-56 h-36 sm:h-40 flex items-center justify-center relative">
        <svg
          viewBox="0 0 240 180"
          className="w-full h-full drop-shadow-sm select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base shadow */}
          <ellipse cx="120" cy="155" rx="75" ry="18" fill="#D9DEE8" opacity="0.6" />

          {/* CARD 1 (Bottom): Deep Navy/Blue Base Card */}
          <g transform="translate(0, 16)">
            {/* Left face */}
            <path
              d="M 65 110 L 65 122 L 120 148 L 120 136 Z"
              fill="#2E3C5B"
            />
            {/* Right face */}
            <path
              d="M 120 136 L 120 148 L 175 122 L 175 110 Z"
              fill="#3B4A6B"
            />
            {/* Top face */}
            <path
              d="M 120 84 L 175 110 L 120 136 L 65 110 Z"
              fill="#4A64B8"
            />
            {/* Code lines on Card 1 */}
            <path d="M 85 106 L 105 116" stroke="#8A94AD" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
            <path d="M 95 118 L 130 135" stroke="#8A94AD" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          </g>

          {/* CARD 2 (Middle): Periwinkle / Purple Code Card */}
          <g transform="translate(0, -6)">
            {/* Left face */}
            <path
              d="M 60 92 L 60 104 L 120 132 L 120 120 Z"
              fill="#564C80"
            />
            {/* Right face */}
            <path
              d="M 120 120 L 120 132 L 180 104 L 180 92 Z"
              fill="#7366A3"
            />
            {/* Top face */}
            <path
              d="M 120 64 L 180 92 L 120 120 L 60 92 Z"
              fill="#8E7FBF"
            />
            {/* Decorative dots / terminal buttons */}
            <circle cx="82" cy="85" r="2" fill="#F28B94" />
            <circle cx="88" cy="88" r="2" fill="#E2E8F0" />
            <circle cx="94" cy="91" r="2" fill="#6F86C9" />

            {/* Code syntax lines */}
            <path d="M 104 95 L 140 112" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            <path d="M 90 101 L 115 113" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          </g>

          {/* CARD 3 (Top): Periwinkle & Crisp Slate Top Window */}
          <g transform="translate(0, -28)">
            {/* Left face */}
            <path
              d="M 55 74 L 55 86 L 120 116 L 120 104 Z"
              fill="#4F64A8"
            />
            {/* Right face */}
            <path
              d="M 120 104 L 120 116 L 185 86 L 185 74 Z"
              fill="#5E75BD"
            />
            {/* Top face */}
            <path
              d="M 120 44 L 185 74 L 120 104 L 55 74 Z"
              fill="#FFFFFF"
            />

            {/* Code Window Header on Top Face */}
            <path
              d="M 120 44 L 185 74 L 170 81 L 105 51 Z"
              fill="#EAEDF2"
            />
            {/* Window control dots */}
            <circle cx="118" cy="54" r="2" fill="#F28B94" />
            <circle cx="125" cy="57" r="2" fill="#8E7FBF" />
            <circle cx="132" cy="60" r="2" fill="#4A64B8" />

            {/* Isometric code lines on top surface */}
            <path d="M 85 76 L 115 90" stroke="#4A64B8" strokeWidth="3" strokeLinecap="round" />
            <path d="M 95 86 L 135 105" stroke="#6F86C9" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 90 92 L 110 101" stroke="#F28B94" strokeWidth="2" strokeLinecap="round" />

            {/* Verification badge stamp floating on card */}
            <g transform="translate(142, 68)">
              <polygon
                points="0,6 6,0 12,6 6,12"
                fill="#4A64B8"
              />
              <path
                d="M 3 6 L 5 8 L 9 4"
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>

          {/* Floating Python terminal indicator chip */}
          <g transform="translate(170, 36)">
            <rect
              x="0"
              y="0"
              width="36"
              height="20"
              rx="6"
              fill="#3B4A6B"
              className="drop-shadow-xs"
            />
            <text
              x="18"
              y="13"
              fill="#FFFFFF"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              &gt;_py
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
