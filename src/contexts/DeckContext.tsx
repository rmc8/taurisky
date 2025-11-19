/**
 * Deck Context
 *
 * Manages deck column configurations and provides CRUD operations
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { DeckColumnConfig } from '../types/auth';
import { ColumnType, ColumnWidth } from '../types/auth';

interface DeckContextValue {
  columns: DeckColumnConfig[];
  isLoading: boolean;
  error: string | null;
  reloadColumns: () => Promise<void>;
  addColumn: (config: Partial<DeckColumnConfig>) => Promise<void>;
  removeColumn: (columnId: string) => Promise<void>;
  updateColumn: (columnId: string, updates: Partial<DeckColumnConfig>) => Promise<void>;
  clearError: () => void;
}

const DeckContext = createContext<DeckContextValue | undefined>(undefined);

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [columns, setColumns] = useState<DeckColumnConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load columns from backend
   */
  const reloadColumns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cols = await invoke<DeckColumnConfig[]>('get_columns');
      setColumns(cols);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Failed to load columns:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save columns to backend
   */
  const saveColumns = useCallback(async (newColumns: DeckColumnConfig[]) => {
    setError(null);
    try {
      await invoke('save_columns_command', { columns: newColumns });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Add a new column
   */
  const addColumn = useCallback(
    async (config: Partial<DeckColumnConfig>) => {
      const newColumn: DeckColumnConfig = {
        id: crypto.randomUUID(),
        did: config.did || '',
        type: config.type || ColumnType.Timeline,
        title: config.title,
        position: columns.length,
        width: config.width || ColumnWidth.Medium,
        settings: config.settings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newColumns = [...columns, newColumn];
      setColumns(newColumns);

      try {
        await saveColumns(newColumns);
      } catch (err) {
        // Rollback on error
        setColumns(columns);
        throw err;
      }
    },
    [columns, saveColumns]
  );

  /**
   * Remove a column
   */
  const removeColumn = useCallback(
    async (columnId: string) => {
      // Validate: at least one column must remain
      if (columns.length <= 1) {
        setError('最低1つのカラムが必要です');
        return;
      }

      const newColumns = columns
        .filter((col) => col.id !== columnId)
        .map((col, index) => ({
          ...col,
          position: index, // Reindex positions
          updatedAt: new Date().toISOString(),
        }));

      const oldColumns = columns;
      setColumns(newColumns);

      try {
        await saveColumns(newColumns);
      } catch (err) {
        // Rollback on error
        setColumns(oldColumns);
        throw err;
      }
    },
    [columns, saveColumns]
  );

  /**
   * Update a column
   */
  const updateColumn = useCallback(
    async (columnId: string, updates: Partial<DeckColumnConfig>) => {
      const newColumns = columns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : col
      );

      const oldColumns = columns;
      setColumns(newColumns);

      try {
        await saveColumns(newColumns);
      } catch (err) {
        // Rollback on error
        setColumns(oldColumns);
        throw err;
      }
    },
    [columns, saveColumns]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load columns on mount
  useEffect(() => {
    reloadColumns();
  }, [reloadColumns]);

  // Auto-save on columns change (debounced in real implementation)
  useEffect(() => {
    if (!isLoading && columns.length > 0) {
      // Columns are already saved by individual operations
      // This effect is for future auto-save logic if needed
    }
  }, [columns, isLoading]);

  const value: DeckContextValue = {
    columns,
    isLoading,
    error,
    reloadColumns,
    addColumn,
    removeColumn,
    updateColumn,
    clearError,
  };

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
};

/**
 * Hook to use deck context
 */
export const useDeck = (): DeckContextValue => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error('useDeck must be used within a DeckProvider');
  }
  return context;
};
