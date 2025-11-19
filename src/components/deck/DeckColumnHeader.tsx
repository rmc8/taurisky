/**
 * Deck Column Header Component
 *
 * Column header with account information and controls
 */

import React, { useState } from 'react';
import type { DeckColumnConfig } from '../../types/auth';
import { useAccounts } from '../../contexts/AccountsContext';
import { useDeck } from '../../contexts/DeckContext';
import AccountSelector from './AccountSelector';
import ColumnSettingsModal from './ColumnSettingsModal';

interface DeckColumnHeaderProps {
  column: DeckColumnConfig;
}

const DeckColumnHeader: React.FC<DeckColumnHeaderProps> = ({ column }) => {
  const { accounts } = useAccounts();
  const { removeColumn, updateColumn, columns, error } = useDeck();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Find the account for this column
  const account = accounts.find((acc) => acc.did === column.did);

  // Handle account selection change
  const handleAccountChange = async (did: string) => {
    try {
      await updateColumn(column.id, { did });
    } catch (err) {
      console.error('Failed to update column account:', err);
      // Error is shown in DeckContext
    }
  };

  // Column type display name
  const typeDisplayName = {
    timeline: 'タイムライン',
    notifications: '通知',
  }[column.type];

  // Check if this is the last column
  const isLastColumn = columns.length <= 1;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeColumn(column.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Failed to delete column:', err);
      // Error is shown in DeckContext
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        {/* Top row: Column info and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Account avatar */}
            {account?.avatar ? (
              <img
                src={account.avatar}
                alt={account.handle}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
            )}

            {/* Column info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-800 truncate">
                {column.title || typeDisplayName}
              </div>
              <div className="text-xs text-gray-500 truncate">
                @{account?.handle || 'Unknown account'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-md transition-colors text-gray-400 hover:text-blue-600 hover:bg-blue-50"
              title="カラム設定"
              aria-label="カラム設定"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Delete button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLastColumn}
              className={`p-1.5 rounded-md transition-colors ${
                isLastColumn
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title={isLastColumn ? '最低1つのカラムが必要です' : 'カラムを削除'}
              aria-label="カラムを削除"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom row: Account selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-medium">アカウント:</span>
          <AccountSelector
            selectedDid={column.did}
            onAccountChange={handleAccountChange}
            className="flex-1"
          />
        </div>
      </div>

      {/* Column Settings Modal */}
      {showSettings && (
        <ColumnSettingsModal
          column={column}
          onClose={() => setShowSettings(false)}
          onSave={updateColumn}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                カラムを削除しますか？
              </h3>
              <p className="text-sm text-gray-600">
                「{column.title || typeDisplayName}」カラムを削除します。この操作は取り消せません。
              </p>
              {error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeckColumnHeader;
