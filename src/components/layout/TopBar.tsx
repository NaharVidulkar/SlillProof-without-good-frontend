/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Award, Zap, FileText, Menu, ChevronRight } from 'lucide-react';
import { NavTabId } from './Sidebar.tsx';

interface SearchResultItem {
  id: string;
  category: 'Page' | 'Assessment' | 'Skill';
  title: string;
  subtitle: string;
  tab: NavTabId;
}

const SEARCH_CATALOG: SearchResultItem[] = [
  // Pages
  { id: 'page-dash', category: 'Page', title: 'Dashboard', subtitle: 'Overview, career readiness & current badge', tab: 'dashboard' },
  { id: 'page-ass', category: 'Page', title: 'Assessments', subtitle: '25-Question verified assessment suites', tab: 'assessments' },
  { id: 'page-sk', category: 'Page', title: 'Skills Matrix', subtitle: 'Deterministic Bayesian proficiency & evidence', tab: 'skills' },
  { id: 'page-jm', category: 'Page', title: 'Job Match', subtitle: 'Role requirement match & gap plan generator', tab: 'job-match' },
  { id: 'page-pass', category: 'Page', title: 'Verified Passport', subtitle: 'Public cryptographic credentials & employer view', tab: 'passport' },
  { id: 'page-prof', category: 'Page', title: 'Candidate Profile', subtitle: 'Account preferences & privacy settings', tab: 'profile' },
  { id: 'page-hlp', category: 'Page', title: 'Platform Guide & Help', subtitle: 'Documentation on scoring, levels & badges', tab: 'help' },

  // Assessments
  { id: 'ass-py', category: 'Assessment', title: 'Python Fundamentals: I know Python', subtitle: '25 Verified Questions (11 MCQs + 14 Coding)', tab: 'assessments' },
  { id: 'ass-sec-a', category: 'Assessment', title: 'Section A: Basic (Easy)', subtitle: '5 MCQs on types, scope & syntax (Weight x1)', tab: 'assessments' },
  { id: 'ass-sec-b', category: 'Assessment', title: 'Section B: Medium', subtitle: '6 MCQs + 4 Coding problems (Weight x2)', tab: 'assessments' },
  { id: 'ass-sec-c', category: 'Assessment', title: 'Section C: Hard', subtitle: '10 Real-life engineering coding problems (Weight x3)', tab: 'assessments' },

  // Skills
  { id: 'sk-py-core', category: 'Skill', title: 'py.core (Types & Control Flow)', subtitle: 'Operators, truthiness, slicing & scope', tab: 'skills' },
  { id: 'sk-py-strings', category: 'Skill', title: 'py.strings (String Processing)', subtitle: 'Formatting, regex, manipulation & parsing', tab: 'skills' },
  { id: 'sk-py-colls', category: 'Skill', title: 'py.collections (Collections)', subtitle: 'Lists, sets, dicts, tuples & comprehensions', tab: 'skills' },
  { id: 'sk-py-fn', category: 'Skill', title: 'py.functions (Functions & Scope)', subtitle: 'Closures, late binding, decorators & lambdas', tab: 'skills' },
  { id: 'sk-py-oop', category: 'Skill', title: 'py.oop (Object-Oriented Design)', subtitle: 'Classes, inheritance, methods & dunder protocols', tab: 'skills' },
  { id: 'sk-py-err', category: 'Skill', title: 'py.errors (Exceptions & Context)', subtitle: 'Exception handling, context managers & validation', tab: 'skills' },
  { id: 'sk-py-iter', category: 'Skill', title: 'py.iterators (Iterators & Generators)', subtitle: 'Laziness, generator expressions & memory efficiency', tab: 'skills' },
  { id: 'sk-py-std', category: 'Skill', title: 'py.stdlib (Standard Library)', subtitle: 'Collections, json, datetime, heapq & decimal', tab: 'skills' },
  { id: 'sk-py-algo', category: 'Skill', title: 'py.algorithms (Algorithmic Logic)', subtitle: 'Sorting, stacks, graph traversal & complexity', tab: 'skills' },
  { id: 'sk-py-tool', category: 'Skill', title: 'py.tooling (Python Ecosystem)', subtitle: 'Modules, imports, virtual environments & types', tab: 'skills' },
];

interface TopBarProps {
  onNavigate: (tab: NavTabId) => void;
  onOpenMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onNavigate,
  onOpenMobileMenu,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format current date: "8 October 2026, Thursday"
  const formattedDate = (() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const year = now.getFullYear();
    const weekday = now.toLocaleString('en-US', { weekday: 'long' });
    return `${day} ${month} ${year}, ${weekday}`;
  })();

  // Filter items based on query
  const results = query.trim()
    ? SEARCH_CATALOG.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }).slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResultItem) => {
    onNavigate(item.tab);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between gap-4 pb-5 pt-1">
      {/* Left zone: Mobile hamburger + Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open sidebar menu"
            className="p-2 rounded-xl bg-white text-[#3B4A6B] shadow-2xs hover:bg-slate-50 transition-colors lg:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Field */}
        <div ref={containerRef} className="relative flex-1">
          <div className="bg-white rounded-full px-4 py-2 flex items-center space-x-2.5 shadow-[0_2px_10px_rgba(59,74,107,0.03)] border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-[#6F86C9]/40">
            <Search className="w-4 h-4 text-[#8A94AD] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search assessments, skills, pages..."
              className="w-full bg-transparent border-none text-xs sm:text-sm text-[#3B4A6B] placeholder-[#8A94AD] focus:outline-none"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
                className="text-[#8A94AD] hover:text-[#3B4A6B] p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results Dropdown */}
          {isOpen && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden divide-y divide-slate-50">
              {results.map((res) => (
                <div
                  key={res.id}
                  onClick={() => handleSelect(res)}
                  className="px-4 py-2.5 hover:bg-[#EAEDF2]/60 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="p-1.5 rounded-lg bg-[#EAEDF2] text-[#4A64B8] shrink-0">
                      {res.category === 'Page' && <FileText className="w-3.5 h-3.5" />}
                      {res.category === 'Assessment' && <Award className="w-3.5 h-3.5" />}
                      {res.category === 'Skill' && <Zap className="w-3.5 h-3.5" />}
                    </span>
                    <div className="truncate">
                      <div className="text-xs font-bold text-[#3B4A6B] truncate">
                        {res.title}
                      </div>
                      <div className="text-[11px] text-[#8A94AD] truncate">
                        {res.subtitle}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#6F86C9] shrink-0 bg-[#EAEDF2] px-2 py-0.5 rounded-md">
                    {res.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right zone: Current Date formatted "8 October 2026, Thursday" */}
      <div className="text-right shrink-0">
        <span className="text-xs sm:text-sm font-bold text-[#3B4A6B]">
          {formattedDate}
        </span>
      </div>
    </div>
  );
};
