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
} from 'lucide-react';

interface ExtractedSkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  selected?: boolean;
}

interface ProfileData {
  role: string;
  fieldOfStudy: string;
  yearsOfExperience: number;
  skills: ExtractedSkill[];
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

  // Extracted and editable profile
  const [role, setRole] = useState<string>('Software Developer');
  const [fieldOfStudy, setFieldOfStudy] = useState<string>('Computer Science');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(1);
  const [skills, setSkills] = useState<ExtractedSkill[]>([]);
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

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

  // Parse Resume via Gemini
  const handleParseResume = async () => {
    if (!selectedFile) {
      setError('Please choose a resume file to upload.');
      return;
    }

    setLoading(true);
    setError(null);

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

      // Pre-select top 5 skills
      const parsedSkills: ExtractedSkill[] = (prof.skills || []).map((s, idx) => ({
        name: s.name,
        level: s.level || 'Intermediate',
        selected: idx < 5,
      }));
      setSkills(parsedSkills);
      setStep('review');
    } catch (err: unknown) {
      console.error('[Onboarding] parse error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze resume with Gemini.');
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

      // Pre-select top 5 skills
      const parsedSkills: ExtractedSkill[] = (prof.skills || []).map((s, idx) => ({
        name: s.name,
        level: s.level || 'Intermediate',
        selected: idx < 5,
      }));
      setSkills(parsedSkills);
      setStep('review');
    } catch (err: unknown) {
      console.error('[Onboarding] parse error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze your introduction.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection on a skill chip (max 5 selected for immediate assessment)
  const handleToggleSelectSkill = (index: number) => {
    const currentSelectedCount = skills.filter((s) => s.selected).length;
    const target = skills[index];

    if (!target.selected && currentSelectedCount >= 5) {
      setError('You can select a maximum of 5 skills to verify initially.');
      return;
    }

    setError(null);
    setSkills((prev) =>
      prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s))
    );
  };

  // Remove skill chip
  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // Add custom skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const exists = skills.some(
      (s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase()
    );
    if (exists) {
      setError('This skill is already in your list.');
      return;
    }

    const selectedCount = skills.filter((s) => s.selected).length;
    setSkills((prev) => [
      ...prev,
      {
        name: newSkillName.trim(),
        level: newSkillLevel,
        selected: selectedCount < 5,
      },
    ]);
    setNewSkillName('');
    setError(null);
  };

  // Save profile and mark onboardingCompleted = true
  const handleSaveProfile = async () => {
    const selectedSkills = skills.filter((s) => s.selected);
    if (selectedSkills.length === 0) {
      setError('Please select at least 1 skill to verify.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role,
          fieldOfStudy,
          yearsOfExperience: Number(yearsOfExperience),
          skills: selectedSkills,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#4A64B8]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink tracking-tight">
                {step === 'input' && 'Personalized Skill Setup'}
                {step === 'review' && 'Review Your Extracted Profile'}
                {step === 'ready' && 'Your Passport is Ready!'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step === 'input' && 'Upload a resume or tell us your background to extract your skills.'}
                {step === 'review' && 'Select up to 5 priority skills to verify with AI-guided diagnostics.'}
                {step === 'ready' && 'Start your first skill verification or explore your dashboard.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-ink hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: INPUT PATHS (Resume or Text) */}
          {step === 'input' && (
            <div className="space-y-5">
              {/* Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('resume');
                    setError(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'resume'
                      ? 'bg-white text-ink shadow-2xs font-bold'
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
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'text'
                      ? 'bg-white text-ink shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-ink'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Tell Us About Yourself</span>
                </button>
              </div>

              {/* Resume Upload Tab */}
              {activeTab === 'resume' && (
                <div className="space-y-4">
                  <label
                    htmlFor="resume-upload"
                    className="border-2 border-dashed border-slate-200 hover:border-[#4A64B8] rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/40 hover:bg-[#4A64B8]/5 group"
                  >
                    <div className="size-12 rounded-full bg-slate-100 group-hover:bg-[#4A64B8]/10 text-slate-500 group-hover:text-[#4A64B8] flex items-center justify-center mb-3 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-ink">
                      {selectedFile ? selectedFile.name : 'Click to select or drop resume file'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Supports PDF or DOCX up to 5 MB
                    </span>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

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
                    <span>{loading ? 'Analyzing with Gemini AI...' : 'Extract Profile & Skills'}</span>
                  </button>
                </div>
              )}

              {/* Text Introduction Tab */}
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

              {/* Skill chips section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Verified Skills Checklist ({selectedCount}/5 Selected)
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Click chip to select for verification
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => {
                    const isSelected = skill.selected;
                    return (
                      <div
                        key={`${skill.name}-${index}`}
                        onClick={() => handleToggleSelectSkill(index)}
                        className={`group px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#4A64B8] text-white border-[#4A64B8] shadow-2xs'
                            : 'bg-white text-ink border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-300'}`}
                        />
                        <span>{skill.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-muted-foreground'
                          }`}
                        >
                          {skill.level}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSkill(index);
                          }}
                          className={`p-0.5 rounded-full hover:bg-black/10 cursor-pointer ${
                            isSelected ? 'text-white/80' : 'text-slate-400'
                          }`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add custom skill input */}
              <form onSubmit={handleAddSkill} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Add another skill (e.g. Rust, AWS)"
                  className="flex-1 bg-white rounded-lg border border-border px-3 py-1.5 text-xs text-ink outline-none"
                />
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as any)}
                  className="bg-white rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-ink flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: READY / SUCCESS CONFIRMATION */}
          {step === 'ready' && (
            <div className="space-y-5 text-center py-4">
              <div className="size-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">Skills Added to Your Profile!</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Your top skills are configured. Choose a skill below to take your first AI-generated diagnostic assessment!
                </p>
              </div>

              <div className="space-y-2 max-w-md mx-auto pt-2">
                {skills
                  .filter((s) => s.selected)
                  .map((skill) => (
                    <div
                      key={skill.name}
                      className="p-3 rounded-xl border border-border bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="text-left font-semibold text-ink flex items-center gap-2">
                        <span>{skill.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-normal">
                          {skill.level}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onStartAssessment) {
                            onStartAssessment(skill.name, skill.level);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#4A64B8] text-white hover:bg-[#3B4A6B] font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>Start Verification</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border bg-slate-50/50 flex items-center justify-between text-xs">
          {step === 'input' && (
            <>
              <button
                type="button"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-ink font-medium cursor-pointer"
              >
                Skip for now
              </button>
              <span className="text-[11px] text-muted-foreground">
                You can complete onboarding anytime from the dashboard.
              </span>
            </>
          )}

          {step === 'review' && (
            <>
              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-muted-foreground hover:text-ink font-medium cursor-pointer"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-ink font-medium cursor-pointer"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  disabled={loading || selectedCount === 0}
                  onClick={handleSaveProfile}
                  className="px-5 py-2 rounded-xl bg-[#3B4A6B] text-white hover:bg-[#2F3A53] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Save & Continue</span>
                </button>
              </div>
            </>
          )}

          {step === 'ready' && (
            <div className="w-full flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#3B4A6B] text-white hover:bg-[#2F3A53] font-bold text-xs cursor-pointer shadow-sm"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
