/**
 * AuthContext: React Context for authentication state management
 *
 * Manages current user session, login/logout operations, and session restoration
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Account } from '../types/auth';

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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        // Silent failure - user will see login screen
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

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

  const value = React.useMemo(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      isLoading,
      login,
      logout,
      error,
      clearError,
    }),
    [currentUser, isLoading, login, logout, error, clearError]
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
