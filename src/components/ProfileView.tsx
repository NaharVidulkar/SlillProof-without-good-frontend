/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Mail, Shield, Eye, LogOut, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card, PageHeader } from './ui/index.tsx';

interface ProfileViewProps {
  onSignOut?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onSignOut }) => {
  const [name, setName] = useState('Stella Walton');
  const [email] = useState('stella.walton@example.com');
  const [role, setRole] = useState<'Student' | 'Employer'>('Student');
  const [isPublic, setIsPublic] = useState(true);
  const [savedNote, setSavedNote] = useState(false);

  const handleSave = () => {
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200/80">
        <h2 className="text-xl sm:text-2xl font-bold text-[#3B4A6B]">
          Candidate Profile
        </h2>
        <p className="text-xs sm:text-sm text-[#8A94AD] mt-1">
          Manage your verification credentials, role preferences, and passport privacy settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Details */}
        <div className="md:col-span-1 space-y-4">
          <Card className="flex flex-col items-center text-center p-6 space-y-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-24 h-24 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#6F86C9] to-[#F28B94]">
              <div className="w-full h-full rounded-full bg-[#EAEDF2] flex items-center justify-center text-2xl font-bold text-[#3B4A6B]">
                SW
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#3B4A6B]">{name}</h3>
              <p className="text-xs text-[#8A94AD]">{email}</p>
            </div>

            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#DCE1F5] text-[#4A64B8]">
              {role}
            </div>
          </Card>
        </div>

        {/* Right Column: Settings Form */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#3B4A6B]">
              Personal Information
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8A94AD] font-semibold mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A94AD] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-[#3B4A6B] font-medium focus:outline-none focus:border-[#4A64B8] focus:ring-1 focus:ring-[#4A64B8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8A94AD] font-semibold mb-1.5">
                  Email Address (Google Account)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A94AD] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8A94AD] font-semibold mb-1.5">
                  Active Platform Role
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setRole('Student')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      role === 'Student'
                        ? 'bg-[#3B4A6B] text-white shadow-xs'
                        : 'bg-slate-100 text-[#8A94AD] hover:bg-slate-200'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Employer')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      role === 'Employer'
                        ? 'bg-[#3B4A6B] text-white shadow-xs'
                        : 'bg-slate-100 text-[#8A94AD] hover:bg-slate-200'
                    }`}
                  >
                    Employer
                  </button>
                </div>
              </div>

              {/* Passport Privacy Toggle */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#3B4A6B]">
                      Passport Public Visibility
                    </h4>
                    <p className="text-[11px] text-[#8A94AD] mt-0.5">
                      Allow verified employers to view your SkillProof Passport and badge credentials.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isPublic ? 'bg-[#4A64B8]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isPublic ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 rounded-full bg-[#7B8AB8] hover:bg-[#6877A6] text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>

                {savedNote && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Settings updated
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Account Safety */}
          <Card className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#3B4A6B]">Sign Out</h4>
              <p className="text-[11px] text-[#8A94AD] mt-0.5">
                End your local preview session.
              </p>
            </div>
            <button
              onClick={() => {
                if (onSignOut) onSignOut();
                else window.location.reload();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};
