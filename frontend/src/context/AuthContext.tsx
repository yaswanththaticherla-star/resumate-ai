import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

export interface AuthContextType {
  user: User;
  isLoading: boolean;
  updateUser: (updated: User) => void;
  refreshUser: () => Promise<void>;
}

const DEFAULT_WORKSPACE_USER: User = {
  id: 2,
  email: 'alex.morgan@resumate.ai',
  full_name: 'yaswanth',
  headline: 'Senior Full Stack Engineer & Cloud Architect',
  theme_preference: 'dark',
  default_template: 'ats_classic',
  created_at: new Date().toISOString(),
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DEFAULT_WORKSPACE_USER);
  const [isLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadWorkspaceProfile() {
      try {
        const profile = await api.getMe();
        if (isMounted && profile && profile.id) {
          setUser(profile);
        }
      } catch {
        // Fallback default workspace profile is already loaded
      }
    }
    loadWorkspaceProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await api.getMe();
      if (u) setUser(u);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth } from './useAuth';
