/**
 * AccountList: Display and manage multiple accounts
 *
 * Shows list of all registered accounts with delete functionality
 */

import React, { useState } from 'react';
import { useAccounts } from '../../contexts/AccountsContext';
import type { Account } from '../../types/auth';

export const AccountList: React.FC = () => {
  const { accounts, removeAccount, isLoading } = useAccounts();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (account: Account) => {
    if (!confirm(`アカウント「${account.handle}」を削除しますか？\n\n認証情報は削除されますが、カラム設定は保持されます。`)) {
      return;
    }

    setDeletingId(account.id);
    try {
      await removeAccount(account.id);
    } catch (err) {
      console.error('Failed to delete account:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>登録されているアカウントがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3 flex-1">
            {account.avatar && (
              <img
                src={account.avatar}
                alt={account.handle}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {account.displayName || account.handle}
              </p>
              <p className="text-sm text-gray-500 truncate">@{account.handle}</p>
              <p className="text-xs text-gray-400 mt-1">
                サーバー: {account.serverUrl.replace('https://', '')}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDelete(account)}
            disabled={deletingId === account.id}
            className="ml-4 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {deletingId === account.id ? '削除中...' : '削除'}
          </button>
        </div>
      ))}
    </div>
  );
};
