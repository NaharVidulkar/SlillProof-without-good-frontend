/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProfileCard } from '../ui/ProfileCard.tsx';
import { BadgeCard } from '../ui/BadgeCard.tsx';
import { MiniCalendar, CalendarEvent } from '../ui/MiniCalendar.tsx';
import { ReminderList, ReminderItem } from '../ui/ReminderList.tsx';

interface RightPanelProps {
  userName?: string;
  userRole?: string;
  hasBadge: boolean;
  badgeLabel?: string;
  badgePercent?: number;
  badgeStatus?: string;
  calendarEvents?: CalendarEvent[];
  reminders?: ReminderItem[];
  onNavigateToProfile: () => void;
  onViewBadge?: () => void;
  onStartAssessment?: () => void;
  onReminderClick?: (item: ReminderItem) => void;
  className?: string;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  userName = 'Stella Walton',
  userRole = 'Student',
  hasBadge,
  badgeLabel,
  badgePercent,
  badgeStatus,
  calendarEvents = [],
  reminders = [],
  onNavigateToProfile,
  onViewBadge,
  onStartAssessment,
  onReminderClick,
  className = '',
}) => {
  return (
    <div
      className={`w-full xl:w-80 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(59,74,107,0.04)] border border-slate-100 flex flex-col space-y-6 shrink-0 ${className}`}
    >
      {/* 1. Profile Card */}
      <ProfileCard
        name={userName}
        role={userRole}
        onNavigateToProfile={onNavigateToProfile}
      />

      {/* 2. Badge Card */}
      <BadgeCard
        hasBadge={hasBadge}
        label={badgeLabel}
        percent={badgePercent}
        status={badgeStatus}
        onViewBadge={onViewBadge}
        onStartAssessment={onStartAssessment}
      />

      {/* 3. Mini Calendar */}
      <MiniCalendar events={calendarEvents} />

      {/* 4. Reminders */}
      <ReminderList
        reminders={reminders}
        onItemClick={onReminderClick}
      />
    </div>
  );
};
