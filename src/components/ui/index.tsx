/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`max-w-[1200px] w-full mx-auto px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}> = ({ children, className = '', onClick, interactive = false }) => {
  const base = 'bg-white border border-slate-200 rounded-xl p-6 transition-colors';
  const interactiveClass = interactive
    ? 'cursor-pointer hover:border-slate-300 hover:bg-slate-50/50'
    : '';

  return (
    <div onClick={onClick} className={`${base} ${interactiveClass} ${className}`}>
      {children}
    </div>
  );
};

export const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  const variantStyles = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500',
    secondary:
      'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400',
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:text-slate-300',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg font-medium',
    md: 'text-sm px-4 py-2 rounded-lg font-medium',
    lg: 'text-sm px-5 py-2.5 rounded-lg font-semibold',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Chip: React.FC<{
  label: string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'accent';
  className?: string;
}> = ({ label, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    accent: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {label}
    </span>
  );
};

export const PageHeader: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export * from './LevelBadge.tsx';
export * from './ConfidenceRing.tsx';
export * from './TierChip.tsx';
export * from './Banner.tsx';
export * from './GradientCard.tsx';
export * from './DataTable.tsx';
export * from './ProfileCard.tsx';
export * from './BadgeCard.tsx';
export * from './MiniCalendar.tsx';
export * from './ReminderList.tsx';

