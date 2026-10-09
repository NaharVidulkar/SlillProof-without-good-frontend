/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarEvent {
  date: string; // ISO date or YYYY-MM-DD
  title: string;
  type: 'attempt_started' | 'attempt_finished' | 'badge_issued' | 'badge_expiry';
}

interface MiniCalendarProps {
  events?: CalendarEvent[];
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ events = [] }) => {
  // Default to October 2026 as per local environment time or today
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Compute days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert so Monday is 0:
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonthToday = today.getFullYear() === year && today.getMonth() === month;
  const todayDateNumber = today.getDate();

  // Map events to day numbers
  const eventsByDay: Record<number, CalendarEvent[]> = {};
  for (const ev of events) {
    const d = new Date(ev.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      if (!eventsByDay[dayNum]) {
        eventsByDay[dayNum] = [];
      }
      eventsByDay[dayNum].push(ev);
    }
  }

  // Days grid
  const days: Array<{
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarEvent[];
  }> = [];

  // Trailing days from prev month
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      dayNumber: prevMonthDays - i,
      isCurrentMonth: false,
      isToday: false,
      events: [],
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      dayNumber: d,
      isCurrentMonth: true,
      isToday: isCurrentMonthToday && d === todayDateNumber,
      events: eventsByDay[d] || [],
    });
  }

  // Leading days into next month to complete 35 or 42 slots
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    days.push({
      dayNumber: d,
      isCurrentMonth: false,
      isToday: false,
      events: [],
    });
  }

  const [hoveredEvent, setHoveredEvent] = useState<{ text: string; x: number; y: number } | null>(null);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(59,74,107,0.03)] space-y-3 relative select-none">
      {/* Month Header with navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          aria-label="Previous month"
          className="p-1 rounded-lg text-[#8A94AD] hover:text-[#3B4A6B] hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-bold text-[#3B4A6B]">
          {monthName}
        </span>

        <button
          onClick={handleNextMonth}
          aria-label="Next month"
          className="p-1 rounded-lg text-[#8A94AD] hover:text-[#3B4A6B] hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-[#8A94AD]">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
        {days.map((cell, idx) => {
          const hasEvent = cell.events.length > 0;

          let dayClasses = 'text-[#8A94AD]/60';
          if (cell.isCurrentMonth) {
            dayClasses = 'text-[#3B4A6B] font-medium hover:bg-slate-50';
          }
          if (cell.isToday) {
            dayClasses = 'bg-[#F28B94] text-white font-bold shadow-xs';
          } else if (hasEvent && cell.isCurrentMonth) {
            dayClasses = 'bg-[#DCE1F5] text-[#3B4A6B] font-bold';
          }

          return (
            <div
              key={idx}
              className="flex items-center justify-center relative py-0.5"
              onMouseEnter={(e) => {
                if (hasEvent) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredEvent({
                    text: cell.events.map((ev) => ev.title).join(' • '),
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }
              }}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-default text-[11px] ${dayClasses}`}
              >
                {cell.dayNumber}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip for calendar events */}
      {hoveredEvent && (
        <div
          className="fixed z-50 px-2.5 py-1 text-[11px] font-medium bg-[#3B4A6B] text-white rounded-md shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-full mb-1"
          style={{ left: hoveredEvent.x, top: hoveredEvent.y - 6 }}
        >
          {hoveredEvent.text}
        </div>
      )}
    </div>
  );
};
