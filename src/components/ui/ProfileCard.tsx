/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ProfileCardProps {
  name?: string;
  role?: string;
  photoUrl?: string;
  onNavigateToProfile: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name = 'Stella Walton',
  role = 'Student',
  photoUrl,
  onNavigateToProfile,
}) => {
  const getInitials = (str: string) => {
    return str
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col items-center text-center space-y-3 py-2">
      {/* Round Avatar matching reference with subtle ring */}
      <div className="relative">
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#6F86C9] to-[#F28B94] shadow-xs">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-full h-full object-cover rounded-full bg-white"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[#EAEDF2] flex items-center justify-center text-lg font-bold text-[#3B4A6B]">
              {getInitials(name)}
            </div>
          )}
        </div>
      </div>

      {/* Name and Role */}
      <div className="space-y-0.5">
        <h3 className="text-base font-bold text-[#3B4A6B]">
          {name}
        </h3>
        <p className="text-xs text-[#8A94AD] font-medium">
          {role}
        </p>
      </div>

      {/* Profile Pill Button */}
      <button
        onClick={onNavigateToProfile}
        className="px-6 py-1.5 rounded-full bg-[#7B8AB8] hover:bg-[#6877A6] active:bg-[#5C6A96] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7B8AB8] focus:ring-offset-1"
      >
        Profile
      </button>
    </div>
  );
};
