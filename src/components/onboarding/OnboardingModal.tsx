/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (skills?: any[]) => void;
  onStartAssessment?: (skillName: string, level: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 text-center space-y-5">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#4A64B8] mx-auto flex items-center justify-center shadow-inner">
          <Sparkles className="w-7 h-7 text-[#4A64B8]" />
        </div>

        {/* Heading & Notice */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">
            CV Analysis Coming Soon
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            CV analysis is coming soon. For now, choose one of the skill assessments below.
          </p>
        </div>

        {/* Four available tests highlight */}
        <div className="bg-slate-50 rounded-xl p-3 text-left space-y-2 border border-slate-100 text-xs text-slate-600">
          <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
            Available Verified Assessments (25 Questions):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Python
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Java
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Data Structures
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Front-end Dev
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#4A64B8] hover:bg-[#3B4A6B] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <span>Choose an Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
