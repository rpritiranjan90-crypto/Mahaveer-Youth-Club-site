import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export interface UserProfile {
  id: number;
  email: string;
  is_admin: boolean;
  totp_enabled: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface LoginResult {
  requires_2fa: boolean;
  challenge_token?: string;
  access_token?: string;
  user?: UserProfile;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verify2FA: (challengeToken: string, code: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'myc_admin_access_token';
const REFRESH_TOKEN_KEY = 'myc_admin_refresh_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const attemptTokenRefresh = useCallback(async (): Promise<string | null> => {
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
    try {
      const res = await apiService.refreshToken(storedRefresh);
      if (res?.access_token) {
        localStorage.setItem(TOKEN_KEY, res.access_token);
        setToken(res.access_token);
        if (res.refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
        }
        if (res.user) {
          setUser(res.user);
        }
        return res.access_token;
      }
    } catch {
      // Refresh failed
    }
    return null;
  }, []);

  const refreshUser = useCallback(async () => {
    let currentToken = token;
    if (!currentToken) {
      // Try refresh token if access token not present
      currentToken = await attemptTokenRefresh();
      if (!currentToken) {
        setUser(null);
        setLoading(false);
        return;
      }
    }

    try {
      const profile = await apiService.getMe(currentToken);
      setUser(profile);
    } catch {
      // Access token expired, attempt refresh
      const refreshedToken = await attemptTokenRefresh();
      if (refreshedToken) {
        try {
          const profile = await apiService.getMe(refreshedToken);
          setUser(profile);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(REFRESH_TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, attemptTokenRefresh]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Periodic background token refresh every 10 minutes to prevent expiry during active work
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      attemptTokenRefresh();
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, attemptTokenRefresh]);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const res = await apiService.login(email, password);
    if (!res.requires_2fa && res.access_token) {
      localStorage.setItem(TOKEN_KEY, res.access_token);
      setToken(res.access_token);
      if (res.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
      }
      if (res.user) {
        setUser(res.user);
      }
    }
    return res;
  };

  const verify2FA = async (challengeToken: string, code: string): Promise<LoginResult> => {
    const res = await apiService.verify2FA(challengeToken, code);
    if (res.access_token) {
      localStorage.setItem(TOKEN_KEY, res.access_token);
      setToken(res.access_token);
      if (res.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
      }
      if (res.user) {
        setUser(res.user);
      }
    }
    return res;
  };

  const logout = async (): Promise<void> => {
    if (token) {
      try {
        await apiService.logout(token);
      } catch {
        // Ignore errors on logout
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token && !!user && user.is_admin,
        login,
        verify2FA,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
