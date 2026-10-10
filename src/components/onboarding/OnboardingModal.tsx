/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  MessageSquare,
  Upload,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Award,
  Layers,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { ClaimedLevel, SkillCategory } from '../../../lib/domain/skills-taxonomy.ts';

export interface ExtractedSkill {
  name: string;
  slug?: string;
  category?: SkillCategory;
  claimedLevel: ClaimedLevel;
  level?: ClaimedLevel;
  evidence?: string;
  selected?: boolean;
}

interface ProfileData {
  role?: string;
  fieldOfStudy?: string;
  yearsOfExperience?: number;
  summary?: string;
  skills: ExtractedSkill[];
  fallbackUsed?: boolean;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted: (skills: ExtractedSkill[]) => void;
  onStartAssessment?: (skillName: string, level: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onCompleted,
  onStartAssessment,
}) => {
  const [step, setStep] = useState<'input' | 'review' | 'ready'>('input');
  const [activeTab, setActiveTab] = useState<'resume' | 'text'>('resume');

  // Input states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userText, setUserText] = useState<string>('');
  const [manualSkillsInput, setManualSkillsInput] = useState<string>('');

  // Processing state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<boolean>(false);

  // Extracted and editable profile
  const [role, setRole] = useState<string>('Software Developer');
  const [fieldOfStudy, setFieldOfStudy] = useState<string>('Computer Science');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(1);
  const [summary, setSummary] = useState<string>('');
  const [skills, setSkills] = useState<ExtractedSkill[]>([]);
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillLevel, setNewSkillLevel] = useState<ClaimedLevel>('Intermediate');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('programming');

  if (!isOpen) return null;

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5 MB maximum limit.');
      return;
    }

    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const lower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lower.endsWith(ext));
    if (!hasValidExt) {
      setError('Please upload a PDF or DOCX file (up to 5 MB).');
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  // Parse Resume via Gemini with 1 retry
  const handleParseResume = async () => {
    if (!selectedFile) {
      setError('Please choose a resume file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    setFallbackNotice(false);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result as string;
          const base64 = res.split(',')[1] || res;
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      const fileData = await base64Promise;

      const response = await fetch('/api/onboarding/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fileData,
          fileName: selectedFile.name,
          mimeType: selectedFile.type || 'application/pdf',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to parse resume (${response.status})`);
      }

      const data = await response.json();
      const prof: ProfileData = data.profile;

      setRole(prof.role || 'Software Developer');
      setFieldOfStudy(prof.fieldOfStudy || 'Computer Science');
      setYearsOfExperience(prof.yearsOfExperience ?? 1);
      setSummary(prof.summary || '');
      setFallbackNotice(Boolean(prof.fallbackUsed));

      // Pre-select up to 6 skills
      const parsedSkills: ExtractedSkill[] = (prof.skills || []).map((s, idx) => ({
        name: s.name,
        slug: s.slug,
        category: s.category || 'programming',
        claimedLevel: s.claimedLevel || s.level || 'Intermediate',
        level: s.claimedLevel || s.level || 'Intermediate',
        evidence: s.evidence,
        selected: idx < 6,
      }));
      setSkills(parsedSkills);
      setStep('review');
    } catch (err: unknown) {
      console.error('[Onboarding] parse error:', err);
      // Fallback manual input instead of crashing
      setFallbackNotice(true);
      setSkills([
        { name: 'Python', category: 'programming', claimedLevel: 'Intermediate', level: 'Intermediate', selected: true },
        { name: 'SQL', category: 'database', claimedLevel: 'Intermediate', level: 'Intermediate', selected: true },
        { name: 'JavaScript', category: 'programming', claimedLevel: 'Intermediate', level: 'Intermediate', selected: true },
        { name: 'Git', category: 'tool', claimedLevel: 'Intermediate', level: 'Intermediate', selected: true },
      ]);
      setStep('review');
    } finally {
      setLoading(false);
    }
  };

  // Parse Text via Gemini
  const handleParseText = async () => {
    const combinedText = [userText.trim(), manualSkillsInput.trim() ? `Additional skills: ${manualSkillsInput.trim()}` : '']
      .filter(Boolean)
      .join('\n');

    if (!combinedText) {
      setError('Please tell us a little bit about yourself or enter your skills.');
      return;
    }

    setLoading(true);
    setError(null);
    setFallbackNotice(false);

    try {
      const response = await fetch('/api/onboarding/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: combinedText }),
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze background (${response.status})`);
      }

      const data = await response.json();
      const prof: ProfileData = data.profile;

      setRole(prof.role || 'Software Developer');
      setFieldOfStudy(prof.fieldOfStudy || 'Computer Science');
      setYearsOfExperience(prof.yearsOfExperience ?? 1);
      setSummary(prof.summary || '');
      setFallbackNotice(Boolean(prof.fallbackUsed));

      // Pre-select up to 6 skills
      const parsedSkills: ExtractedSkill[] = (prof.skills || []).map((s, idx) => ({
        name: s.name,
        slug: s.slug,
        category: s.category || 'programming',
        claimedLevel: s.claimedLevel || s.level || 'Intermediate',
        level: s.claimedLevel || s.level || 'Intermediate',
        evidence: s.evidence,
        selected: idx < 6,
      }));
      setSkills(parsedSkills);
      setStep('review');
    } catch (err: unknown) {
      console.error('[Onboarding] parse error:', err);
      setFallbackNotice(true);
      setSkills([
        { name: 'Python', category: 'programming', claimedLevel: 'Intermediate', level: 'Intermediate', selected: true },
        { name: 'Java', category: 'programming', claimedLevel: 'Intermediate', level: 'Intermediate', selected: true },
        { name: 'SQL', category: 'database', claimedLevel: 'Intermediate', level: 'Intermediate', selected: true },
      ]);
      setStep('review');
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection on a skill chip (max 6 selected for immediate assessment)
  const handleToggleSelectSkill = (index: number) => {
    const currentSelectedCount = skills.filter((s) => s.selected).length;
    const target = skills[index];

    if (!target.selected && currentSelectedCount >= 6) {
      setError('You can select up to 6 skills to assess now. The rest will be kept in your dashboard under "Assess later".');
      return;
    }

    setError(null);
    setSkills((prev) =>
      prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s))
    );
  };

  // Change claimed level on a skill
  const handleChangeSkillLevel = (index: number, newLevel: ClaimedLevel) => {
    setSkills((prev) =>
      prev.map((s, i) => (i === index ? { ...s, claimedLevel: newLevel, level: newLevel } : s))
    );
  };

  // Remove skill chip
  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // Add custom skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillName.trim();
    if (!trimmed) return;

    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`Skill "${trimmed}" is already in your list.`);
      return;
    }

    const selectedCount = skills.filter((s) => s.selected).length;
    setSkills((prev) => [
      ...prev,
      {
        name: trimmed,
        claimedLevel: newSkillLevel,
        level: newSkillLevel,
        category: newSkillCategory,
        selected: selectedCount < 6,
      },
    ]);
    setNewSkillName('');
    setError(null);
  };

  // Save profile and initialize dynamic sections per skill
  const handleSaveProfile = async () => {
    const selectedSkills = skills.filter((s) => s.selected);
    if (selectedSkills.length === 0) {
      setError('Please select at least 1 skill to verify.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allPreparedSkills = [
        ...selectedSkills,
        ...skills.filter((s) => !s.selected),
      ];

      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role,
          fieldOfStudy,
          yearsOfExperience: Number(yearsOfExperience),
          skills: allPreparedSkills,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save profile');
      }

      setStep('ready');
      onCompleted(selectedSkills);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to finalize onboarding.');
    } finally {
      setLoading(false);
    }
  };

  // Skip for now
  const handleSkip = async () => {
    try {
      await fetch('/api/onboarding/skip', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // non-fatal
    } finally {
      onClose();
    }
  };

  const selectedCount = skills.filter((s) => s.selected).length;
  const unselectedCount = skills.length - selectedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-border p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF0FA] text-[#3B4A6B] text-[11px] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#4A64B8]" />
              <span>Personalized Skill Verification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
              {step === 'input' && 'Map Your Technical Skills'}
              {step === 'review' && 'Review Your Skill Sections'}
              {step === 'ready' && 'Your Personalized Sections Are Ready!'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {step === 'input' && 'Upload your resume or tell us your background. Gemini will create a dedicated 25-question assessment section for each skill.'}
              {step === 'review' && 'Select up to 6 skills to assess now. Each skill gets its own dedicated section with coding and scenario questions.'}
              {step === 'ready' && 'You can take your assessments anytime from your dashboard.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="p-1 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors cursor-pointer"
            title="Skip for now"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Fallback Notice */}
        {fallbackNotice && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">
              We couldn't automatically parse full resume details, so we've loaded standard skill suggestions below. You can customize, add, or change any skill before starting.
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="mt-6">
          {/* STEP 1: INPUT (RESUME OR TEXT) */}
          {step === 'input' && (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('resume');
                    setError(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    activeTab === 'resume'
                      ? 'bg-white text-ink shadow-xs'
                      : 'text-muted-foreground hover:text-ink'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Upload Resume (PDF / DOCX)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('text');
                    setError(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    activeTab === 'text'
                      ? 'bg-white text-ink shadow-xs'
                      : 'text-muted-foreground hover:text-ink'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Type Skills & Background</span>
                </button>
              </div>

              {/* Tab 1: Resume Upload */}
              {activeTab === 'resume' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 hover:border-[#4A64B8] rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white shadow-2xs border border-border flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5 text-[#4A64B8]" />
                    </div>
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer font-semibold text-xs text-[#4A64B8] hover:underline"
                    >
                      {selectedFile ? selectedFile.name : 'Click to select PDF or DOCX file'}
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Max file size: 5 MB. PDF or DOCX formats supported.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!selectedFile || loading}
                    onClick={handleParseResume}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#3B4A6B] text-white hover:bg-[#2F3A53] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Analyzing with Gemini...' : 'Extract & Generate Sections'}</span>
                  </button>
                </div>
              )}

              {/* Tab 2: Text Description */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Your Background & Interests
                    </label>
                    <textarea
                      rows={3}
                      value={userText}
                      onChange={(e) => setUserText(e.target.value)}
                      placeholder="e.g. I am a CS student passionate about backend systems. I've built projects with Java, Python, and PostgreSQL..."
                      className="w-full rounded-xl border border-border bg-white p-3 text-xs sm:text-sm text-ink outline-none focus:border-[#4A64B8] focus:ring-1 focus:ring-[#4A64B8] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Key Technical Skills (Optional)
                    </label>
                    <input
                      type="text"
                      value={manualSkillsInput}
                      onChange={(e) => setManualSkillsInput(e.target.value)}
                      placeholder="e.g. Python, Docker, React, SQL"
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs sm:text-sm text-ink outline-none focus:border-[#4A64B8] focus:ring-1 focus:ring-[#4A64B8] transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!userText.trim() || loading}
                    onClick={handleParseText}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#3B4A6B] text-white hover:bg-[#2F3A53] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Structuring Profile with Gemini...' : 'Analyze & Extract Skills'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: REVIEW EXTRACTED SKILLS & DETAILS */}
          {step === 'review' && (
            <div className="space-y-5">
              {/* Profile fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-border text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground">Target Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 w-full bg-white rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground">Field / Domain</label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    className="mt-1 w-full bg-white rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground">Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                    className="mt-1 w-full bg-white rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink font-medium"
                  />
                </div>
              </div>

              {/* Selection banner */}
              <div className="flex items-center justify-between text-xs">
                <div className="font-bold text-ink flex items-center gap-1.5">
                  <Layers className="size-4 text-[#4A64B8]" />
                  <span>Choose Skills to Assess Now ({selectedCount}/6 Selected)</span>
                </div>
                {unselectedCount > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    {unselectedCount} will be saved as "Assess later"
                  </span>
                )}
              </div>

              {/* Skill chips section */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2.5">
                  {skills.map((skill, index) => {
                    const isSelected = skill.selected;
                    return (
                      <div
                        key={`${skill.name}-${index}`}
                        className={`group px-3 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all select-none ${
                          isSelected
                            ? 'bg-[#4A64B8]/10 text-[#3B4A6B] border-[#4A64B8]'
                            : 'bg-white text-muted-foreground border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleSelectSkill(index)}
                          className="flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${isSelected ? 'text-[#4A64B8]' : 'text-slate-300'}`}
                          />
                          <span className="font-bold text-ink">{skill.name}</span>
                        </button>

                        {/* Level selector */}
                        <select
                          value={skill.claimedLevel || skill.level}
                          onChange={(e) => handleChangeSkillLevel(index, e.target.value as ClaimedLevel)}
                          className="text-[10px] bg-white border border-border rounded px-1 py-0.5 font-medium text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>

                        {/* Category tag */}
                        {skill.category && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                            {skill.category}
                          </span>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          className="p-0.5 rounded-full hover:bg-black/10 cursor-pointer text-slate-400 hover:text-red-500"
                          title="Remove skill"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add custom skill input */}
              <form onSubmit={handleAddSkill} className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/80">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Add another skill (e.g. Java, Docker, React)"
                  className="flex-1 min-w-[160px] bg-white rounded-lg border border-border px-3 py-1.5 text-xs text-ink outline-none"
                />
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as ClaimedLevel)}
                  className="bg-white border border-border rounded-lg px-2 py-1.5 text-xs text-slate-700 font-medium outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                  className="bg-white border border-border rounded-lg px-2 py-1.5 text-xs text-slate-700 font-medium outline-none"
                >
                  <option value="programming">Programming</option>
                  <option value="framework">Framework</option>
                  <option value="database">Database</option>
                  <option value="tool">Tool</option>
                  <option value="soft-or-other">Other</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-ink text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs text-muted-foreground hover:text-ink font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading || selectedCount === 0}
                  onClick={handleSaveProfile}
                  className="py-2.5 px-6 rounded-xl bg-[#3B4A6B] text-white hover:bg-[#2F3A53] font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>Create {selectedCount} Assessment {selectedCount === 1 ? 'Section' : 'Sections'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: READY */}
          {step === 'ready' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">Personalized Sections Configured!</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  We've initialized separate 25-question verification sections for each of your selected skills. Questions are lazily generated when you open a section.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-border max-w-md mx-auto text-left space-y-2">
                <div className="text-xs font-bold text-ink">Your Active Skill Sections:</div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.filter((s) => s.selected).map((s) => (
                    <span
                      key={s.name}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-ink"
                    >
                      <CheckCircle2 className="size-3 text-emerald-600" />
                      <span>{s.name} ({s.claimedLevel})</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-6 rounded-xl bg-[#3B4A6B] text-white hover:bg-[#2F3A53] font-semibold text-xs cursor-pointer shadow-sm transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
