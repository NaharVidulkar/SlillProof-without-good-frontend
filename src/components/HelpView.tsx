/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './ui/index.tsx';
import { ShieldCheck, Award, Zap, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200/80">
        <h2 className="text-xl sm:text-2xl font-bold text-[#3B4A6B]">
          SkillProof Platform Guide
        </h2>
        <p className="text-xs sm:text-sm text-[#8A94AD] mt-1">
          Evidence-based verification: how assessments, scoring, Bayesian levels, and badges work in plain language.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. How Assessments Work */}
        <Card className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#DCE1F5] text-[#4A64B8]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#3B4A6B]">
              1. Deterministic Assessments
            </h3>
          </div>
          <p className="text-xs text-[#8A94AD] leading-relaxed">
            SkillProof tests real programming competence across three weighted sections:
          </p>
          <ul className="text-xs text-[#3B4A6B] space-y-1.5 list-disc pl-4">
            <li><strong>Section A (Basic, 1x):</strong> 5 Multiple-Choice Questions on syntax, types, and scope.</li>
            <li><strong>Section B (Medium, 2x):</strong> 6 MCQs + 4 algorithmic coding challenges.</li>
            <li><strong>Section C (Hard, 3x):</strong> 10 real-life scenario engineering challenges.</li>
          </ul>
          <p className="text-xs text-[#8A94AD] leading-relaxed pt-1">
            <strong>Key Guarantee:</strong> Hidden test cases running in an isolated execution sandbox decide correctness. AI models provide code quality reviews but can <em>never</em> alter test verdicts.
          </p>
        </Card>

        {/* 2. Skill Levels & Gating */}
        <Card className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#EDE9FE] text-[#8E7FBF]">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#3B4A6B]">
              2. Skill Levels & Gating
            </h3>
          </div>
          <p className="text-xs text-[#8A94AD] leading-relaxed">
            Skills are mathematically modeled through Bayesian proficiency rather than arbitrary percentages:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center">
              <span className="font-bold text-[#3B4A6B]">Novice (&lt; 0.35)</span>
              <span className="text-[#8A94AD]">Foundational knowledge missing</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center">
              <span className="font-bold text-[#3B4A6B]">Beginner (0.35 – 0.60)</span>
              <span className="text-[#8A94AD]">Understands syntax & basics</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center">
              <span className="font-bold text-[#3B4A6B]">Intermediate (0.60 – 0.80)</span>
              <span className="text-[#8A94AD]">Requires passed coding evidence</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center">
              <span className="font-bold text-[#3B4A6B]">Advanced (≥ 0.80)</span>
              <span className="text-[#8A94AD]">Requires high-scoring hard problems</span>
            </div>
          </div>
          <p className="text-[11px] text-[#4A64B8] font-medium pt-1">
            * Strict Rule: A quiz alone can never advance someone to Intermediate or Advanced.
          </p>
        </Card>

        {/* 3. Confidence & Tiers */}
        <Card className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#DCFCE7] text-[#15803D]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#3B4A6B]">
              3. Confidence & Verification Tiers
            </h3>
          </div>
          <div className="space-y-3 text-xs text-[#3B4A6B]">
            <div>
              <span className="font-bold">Confidence (Low / Medium / High):</span>
              <p className="text-[#8A94AD] mt-0.5">
                Measures the consistency, diversity, and volume of evidence behind a skill. High confidence requires repeatable success across multiple tasks.
              </p>
            </div>
            <div>
              <span className="font-bold">Three Verification Tiers:</span>
              <ul className="list-disc pl-4 text-[#8A94AD] space-y-1 mt-1">
                <li><strong className="text-[#3B4A6B]">Claimed:</strong> Declared on resume with no test proof.</li>
                <li><strong className="text-[#3B4A6B]">Assessed:</strong> Knowledge verified via diagnostic MCQs.</li>
                <li><strong className="text-[#3B4A6B]">Demonstrated:</strong> Working implementation proven against hidden tests.</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 4. Badge Labels & Anti-Cheat */}
        <Card className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#FEE2E2] text-[#DC2626]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#3B4A6B]">
              4. Verified Badges & Integrity
            </h3>
          </div>
          <div className="space-y-2.5 text-xs text-[#3B4A6B]">
            <p className="text-[#8A94AD]">
              Badge labels correspond to weighted performance with hard problem gating:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-50 rounded-lg"><strong>Emerging:</strong> 0–39%</div>
              <div className="p-2 bg-slate-50 rounded-lg"><strong>Developing:</strong> 40–59%</div>
              <div className="p-2 bg-slate-50 rounded-lg"><strong>Competent:</strong> 60–74%</div>
              <div className="p-2 bg-slate-50 rounded-lg"><strong>Strong:</strong> 75–89% (≥4 hard)</div>
              <div className="p-2 bg-slate-50 rounded-lg col-span-2"><strong>Expert:</strong> 90–100% (≥8 hard problems solved)</div>
            </div>
            <p className="text-[11px] text-[#8A94AD] pt-1">
              <strong>Proctoring & Integrity:</strong> More than 5 tab switches or 3 large paste events flag the attempt. Flagged attempts are capped at Competent and marked <em>Under review</em>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
