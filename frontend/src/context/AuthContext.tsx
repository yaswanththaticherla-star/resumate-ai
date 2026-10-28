import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

export interface AuthContextType {
  user: User;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, fullName: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (updated: User) => void;
  refreshUser: () => Promise<void>;
}

const DEFAULT_WORKSPACE_USER: User = {
  id: 2,
  email: 'alex.morgan@example.com',
  full_name: 'Alex Morgan',
  headline: 'Senior Full Stack Engineer & Cloud Architect',
  theme_preference: 'dark',
  default_template: 'modern',
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

  const login = useCallback(async (_email: string, _password: string): Promise<User> => {
    return user;
  }, [user]);

  const register = useCallback(async (_email: string, _fullName: string, _password: string): Promise<User> => {
    return user;
  }, [user]);

  const logout = useCallback(() => {
    // No-op in unauthenticated workspace mode
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
        token: null,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth } from './useAuth';
