/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Code2,
  Clock,
  Award,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { clientApi } from '../../lib/client/api.ts';
import { PublicProblem } from '../../lib/types.ts';

interface ChallengesListProps {
  onSelectProblem: (problemId: string) => void;
}

export const ChallengesList: React.FC<ChallengesListProps> = ({ onSelectProblem }) => {
  const [problems, setProblems] = useState<PublicProblem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientApi.getProblems();
      setProblems(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load challenges';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Coding Challenges
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Solve deterministic stdin/stdout challenges inside the Monaco editor. Visible tests guide implementation; hidden edge cases decide correctness.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 w-44"
            />
          </div>

          <div className="relative">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="pl-2.5 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-500 space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-slate-700" />
          <span className="text-sm">Loading challenges from server...</span>
        </div>
      )}

      {/* Error State with Retry */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">Failed to load challenges</h3>
              <p className="text-xs text-red-700 mt-1 font-mono">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchProblems}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Challenges Grid */}
      {!loading && !error && (
        <>
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg bg-white">
              <Code2 className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-600 mt-2 font-medium">No challenges found matching your criteria</p>
              <button
                onClick={() => {
                  setSearch('');
                  setDifficultyFilter('All');
                }}
                className="mt-3 text-xs text-slate-900 underline font-medium hover:text-slate-700"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProblems.map((problem) => {
                const isEasy = problem.difficulty === 'Easy';
                const isMedium = problem.difficulty === 'Medium';

                return (
                  <div
                    key={problem.id}
                    onClick={() => onSelectProblem(problem.id)}
                    className="group bg-white border border-slate-200 hover:border-slate-400 rounded-lg p-5 transition-all cursor-pointer shadow-xs hover:shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            isEasy
                              ? 'bg-emerald-100 text-emerald-800'
                              : isMedium
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {problem.difficulty}
                        </span>

                        <div className="flex items-center space-x-3 text-xs text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{problem.timeEstimateMin}m</span>
                          </span>
                          <span className="flex items-center space-x-1 font-medium text-slate-700">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>{problem.points} pts</span>
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                        {problem.title}
                      </h3>

                      {/* Description excerpt */}
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {problem.description.split('\n\n')[0]}
                      </p>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {problem.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded font-mono"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700 group-hover:text-slate-900">
                      <span>{problem.visibleTests.length} visible tests · hidden test suites</span>
                      <span className="flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform text-slate-900 font-semibold">
                        <span>Open Workspace</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
