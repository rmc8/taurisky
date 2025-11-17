/**
 * AccountsContext: React Context for multiple account management
 *
 * Manages list of all registered accounts, add/remove operations
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Account } from '../types/auth';

interface AccountsContextValue {
  /** List of all registered accounts */
  accounts: Account[];
  /** Whether accounts are being loaded */
  isLoading: boolean;
  /** Add a new account */
  addAccount: (handle: string, password: string, serverUrl?: string) => Promise<Account>;
  /** Remove an account by ID */
  removeAccount: (accountId: string) => Promise<void>;
  /** Switch to a different account (update last used) */
  switchAccount: (accountId: string) => void;
  /** Error message from last operation */
  error: string | null;
  /** Clear error message */
  clearError: () => void;
  /** Reload accounts list */
  reloadAccounts: () => Promise<void>;
}

const AccountsContext = createContext<AccountsContextValue | undefined>(undefined);

// Custom event for account changes
const ACCOUNTS_CHANGED_EVENT = 'accounts-changed';

export const AccountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all accounts from backend
   */
  const reloadAccounts = useCallback(async () => {
    try {
      const accountList = await invoke<Account[]>('list_accounts');
      setAccounts(accountList);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load accounts on mount and when accounts change
   */
  useEffect(() => {
    reloadAccounts();

    // Listen for account changes from other contexts
    const handleAccountsChanged = () => {
      console.log('Accounts changed event received - reloading');
      reloadAccounts();
    };

    window.addEventListener(ACCOUNTS_CHANGED_EVENT, handleAccountsChanged);

    return () => {
      window.removeEventListener(ACCOUNTS_CHANGED_EVENT, handleAccountsChanged);
    };
  }, [reloadAccounts]);

  /**
   * Add a new account
   */
  const addAccount = useCallback(
    async (handle: string, password: string, serverUrl?: string) => {
      setError(null);
      setIsLoading(true);

      try {
        const account = await invoke<Account>('add_account', {
          identifier: handle,
          password,
          serverUrl,
        });

        // Reload accounts list to include the new account
        await reloadAccounts();
        return account;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [reloadAccounts]
  );

  /**
   * Remove an account
   */
  const removeAccount = useCallback(
    async (accountId: string) => {
      setError(null);
      setIsLoading(true);

      try {
        await invoke('remove_account', { accountId });

        // Reload accounts list to reflect removal
        await reloadAccounts();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [reloadAccounts]
  );

  /**
   * Switch to a different account (update UI state)
   */
  const switchAccount = useCallback((accountId: string) => {
    // Update last used timestamp in the accounts list
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? { ...acc, lastUsedAt: new Date().toISOString() }
          : acc
      )
    );
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = React.useMemo(
    () => ({
      accounts,
      isLoading,
      addAccount,
      removeAccount,
      switchAccount,
      error,
      clearError,
      reloadAccounts,
    }),
    [accounts, isLoading, addAccount, removeAccount, switchAccount, error, clearError, reloadAccounts]
  );

  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>;
};

/**
 * Hook to access AccountsContext
 */
export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within AccountsProvider');
  }
  return context;
};
