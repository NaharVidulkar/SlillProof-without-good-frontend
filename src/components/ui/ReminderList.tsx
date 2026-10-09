/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';

export interface ReminderItem {
  id: string;
  title: string;
  dateText: string;
  type?: 'in_progress' | 'expiring' | 'retake' | 'practise' | 'review';
}

interface ReminderListProps {
  reminders?: ReminderItem[];
  onItemClick?: (item: ReminderItem) => void;
}

export const ReminderList: React.FC<ReminderListProps> = ({
  reminders = [],
  onItemClick,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(59,74,107,0.03)] space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#3B4A6B]">
          Reminders
        </h3>
        <span className="text-[11px] text-[#8A94AD] font-medium">
          {reminders.length > 0 ? `${reminders.length} active` : ''}
        </span>
      </div>

      {reminders.length === 0 ? (
        <div className="py-6 text-center space-y-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
          <p className="text-xs font-semibold text-[#3B4A6B]">
            You're all caught up
          </p>
          <p className="text-[11px] text-[#8A94AD]">
            No pending assessment deadlines or cooldowns.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="space-y-3 pb-4">
            {reminders.slice(0, 4).map((rem) => (
              <div
                key={rem.id}
                onClick={() => onItemClick?.(rem)}
                className={`flex items-start space-x-3 group ${
                  onItemClick ? 'cursor-pointer' : ''
                }`}
              >
                {/* Circular / Rounded bell icon box matching reference */}
                <div className="w-8 h-8 rounded-xl bg-[#EAEDF2] flex items-center justify-center text-[#4A64B8] shrink-0 group-hover:bg-[#DCE1F5] transition-colors mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#3B4A6B] leading-tight group-hover:text-[#4A64B8] transition-colors truncate">
                    {rem.title}
                  </h4>
                  <p className="text-[11px] text-[#8A94AD] mt-0.5">
                    {rem.dateText}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom fade out gradient matching reference */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  );
};
