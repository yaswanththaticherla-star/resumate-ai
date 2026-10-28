import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, fullName: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (updated: User) => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('resumate_token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session once on initial application load
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const storedToken = localStorage.getItem('resumate_token');
      // If there is no token in storage, user is unauthenticated; never call /api/auth/me
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const profile = await api.getMe();
        if (isMounted) {
          setUser(profile);
          setToken(storedToken);
        }
      } catch (err: any) {
        // Token is invalid, expired (401), or user account no longer exists
        console.warn('[ResuMate AI] Session restoration failed:', err?.message || err);
        if (isMounted) {
          localStorage.removeItem('resumate_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    // Listen for global unauthorized events dispatched by API client on 401s
    const handleAuthError = () => {
      if (isMounted) {
        localStorage.removeItem('resumate_token');
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener('resumate:auth-error', handleAuthError);

    return () => {
      isMounted = false;
      window.removeEventListener('resumate:auth-error', handleAuthError);
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('resumate_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, fullName: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.register({ email, full_name: fullName, password });
      localStorage.setItem('resumate_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('resumate_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('resumate_token');
    if (!storedToken) return;
    try {
      const u = await api.getMe();
      setUser(u);
    } catch (e: any) {
      console.warn('[ResuMate AI] Refresh user failed:', e?.message || e);
      localStorage.removeItem('resumate_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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

