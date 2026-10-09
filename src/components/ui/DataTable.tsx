/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-xs text-[#8A94AD] border border-slate-100">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <div className="min-w-[620px]">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#8A94AD]">
          {columns.map((col) => (
            <div key={col.key} className={col.className || 'col-span-2'}>
              {col.header}
            </div>
          ))}
        </div>

        {/* Rows: Each row is an independent rounded card matching reference */}
        <div className="space-y-2.5">
          {data.map((item, index) => {
            const key = keyExtractor(item, index);
            const isClickable = Boolean(onRowClick);

            return (
              <div
                key={key}
                onClick={() => onRowClick?.(item)}
                className={`grid grid-cols-12 items-center px-5 py-3.5 bg-white rounded-xl sm:rounded-2xl border border-slate-100/90 shadow-[0_2px_8px_rgba(59,74,107,0.02)] transition-all ${
                  isClickable
                    ? 'cursor-pointer hover:border-[#6F86C9]/40 hover:shadow-xs hover:bg-slate-50/50'
                    : ''
                }`}
              >
                {columns.map((col) => (
                  <div key={col.key} className={col.className || 'col-span-2'}>
                    {col.render(item, index)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
