import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, getAuthHeaders, logout as apiLogout } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  onboardingCompleted?: boolean;
  onboardingSkipped?: boolean;
  profile?: {
    role?: string;
    fieldOfStudy?: string;
    yearsOfExperience?: number;
  } | null;
  skills?: Array<{
    name: string;
    level: string;
    verified?: boolean;
    score?: number;
    tier?: string;
  }>;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/me', {
        headers: authHeaders,
        credentials: 'include',
      });

      if (res.status === 401) {
        setUser(null);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to load profile (${res.status})`);
      }

      const data = await res.json();
      setUser(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    // Listen to Firebase client auth state changes
    const unsubscribe = onAuthStateChanged(auth, () => {
      fetchUser();
    });
    return () => unsubscribe();
  }, [fetchUser]);

  const handleLogout = useCallback(async () => {
    await apiLogout();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        logout: handleLogout,
        refresh: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
