/**
 * AuthContext: React Context for authentication state management
 *
 * Manages current user session, login/logout operations, session restoration, and token auto-refresh
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Account, AuthToken } from '../types/auth';

interface AuthContextValue {
  /** Current authenticated user */
  currentUser: Account | null;
  /** Whether a user is authenticated */
  isAuthenticated: boolean;
  /** Whether the auth state is being initialized */
  isLoading: boolean;
  /** Login with credentials */
  login: (handle: string, password: string, serverUrl?: string) => Promise<void>;
  /** Logout current user */
  logout: () => Promise<void>;
  /** Error message from last operation */
  error: string | null;
  /** Clear error message */
  clearError: () => void;
  /** Session expired flag */
  isSessionExpired: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Token refresh interval: 5 minutes before expiration
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Refresh token automatically before expiration
   */
  const refreshToken = useCallback(async (accountId: string) => {
    try {
      console.log('Auto-refreshing token for account:', accountId);
      const newToken = await invoke<AuthToken>('refresh_session', { accountId });

      // Schedule next refresh
      scheduleTokenRefresh(accountId, newToken.accessExpiresAt);

      setIsSessionExpired(false);
    } catch (err) {
      console.error('Token refresh failed:', err);
      setIsSessionExpired(true);
      setError('セッションの有効期限が切れました。再度ログインしてください。');
    }
  }, []);

  /**
   * Schedule automatic token refresh
   */
  const scheduleTokenRefresh = useCallback((accountId: string, accessExpiresAt: string) => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const expirationTime = new Date(accessExpiresAt).getTime();
    const now = Date.now();
    const timeUntilRefresh = expirationTime - now - TOKEN_REFRESH_BUFFER_MS;

    if (timeUntilRefresh > 0) {
      console.log(`Scheduling token refresh in ${Math.round(timeUntilRefresh / 1000)} seconds`);
      refreshTimerRef.current = setTimeout(() => {
        refreshToken(accountId);
      }, timeUntilRefresh);
    } else {
      // Token already expired or expires very soon - refresh immediately
      console.log('Token expiring soon - refreshing immediately');
      refreshToken(accountId);
    }
  }, [refreshToken]);

  /**
   * Restore session on mount
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const accounts = await invoke<Account[]>('restore_sessions');
        // For User Story 1 (single account), just use the first account
        if (accounts && accounts.length > 0) {
          setCurrentUser(accounts[0]);

          // Notify other contexts that accounts have been loaded
          window.dispatchEvent(new Event('accounts-changed'));

          // Note: We should ideally get the token info to schedule refresh
          // For now, we'll schedule a refresh check in 80 minutes (assuming 90 min token)
          setTimeout(() => {
            if (accounts[0]) {
              refreshToken(accounts[0].id);
            }
          }, 80 * 60 * 1000); // 80 minutes
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        // Silent failure - user will see login screen
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [refreshToken]);

  /**
   * Login with handle and password
   */
  const login = useCallback(async (handle: string, password: string, serverUrl?: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const account = await invoke<Account>('login', {
        identifier: handle,
        password,
        serverUrl,
      });

      setCurrentUser(account);

      // Notify other contexts that accounts have changed
      window.dispatchEvent(new Event('accounts-changed'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    if (!currentUser) return;

    setError(null);
    setIsLoading(true);

    try {
      await invoke('logout', { accountId: currentUser.id });
      setCurrentUser(null);

      // Notify other contexts that accounts have changed
      window.dispatchEvent(new Event('accounts-changed'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Cleanup timer on unmount
   */
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const value = React.useMemo(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      isLoading,
      login,
      logout,
      error,
      clearError,
      isSessionExpired,
    }),
    [currentUser, isLoading, login, logout, error, clearError, isSessionExpired]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
