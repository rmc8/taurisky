/**
 * Add Column Button and Modal Component
 *
 * Allows users to add new columns to the deck
 */

import React, { useState } from 'react';
import { useDeck } from '../../contexts/DeckContext';
import { useAccounts } from '../../contexts/AccountsContext';
import { ColumnType, ColumnWidth } from '../../types/auth';

const AddColumnButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex-shrink-0 w-80 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
        aria-label="カラムを追加"
      >
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">+</div>
          <div className="text-sm font-medium">カラムを追加</div>
        </div>
      </button>

      {isModalOpen && (
        <AddColumnModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

interface AddColumnModalProps {
  onClose: () => void;
}

const AddColumnModal: React.FC<AddColumnModalProps> = ({ onClose }) => {
  const { addColumn, error, clearError } = useDeck();
  const { accounts } = useAccounts();

  const [selectedType, setSelectedType] = useState<ColumnType>(ColumnType.Timeline);
  const [selectedDid, setSelectedDid] = useState<string>(
    accounts[0]?.did || ''
  );
  const [selectedWidth, setSelectedWidth] = useState<ColumnWidth>(ColumnWidth.Medium);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDid) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await addColumn({
        did: selectedDid,
        type: selectedType,
        title: customTitle || undefined,
        width: selectedWidth,
      });
      onClose();
    } catch (err) {
      // Error is handled by DeckContext
      console.error('Failed to add column:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columnTypeOptions = [
    { value: ColumnType.Timeline, label: 'タイムライン', icon: '📰' },
    { value: ColumnType.Notifications, label: '通知', icon: '🔔' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">カラムを追加</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Error Display (Inline) */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={clearError}
                  className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Column Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カラムタイプ
            </label>
            <div className="grid grid-cols-2 gap-3">
              {columnTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedType(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedType === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Account Selection */}
          <div>
            <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
              アカウント
            </label>
            <select
              id="account"
              value={selectedDid}
              onChange={(e) => setSelectedDid(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.did}>
                  {account.handle} {account.displayName ? `(${account.displayName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Column Width Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カラム幅
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: ColumnWidth.Xxs, label: 'XXS', pixels: '280px' },
                { value: ColumnWidth.Xs, label: 'XS', pixels: '320px' },
                { value: ColumnWidth.Small, label: 'S', pixels: '350px' },
                { value: ColumnWidth.Medium, label: 'M', pixels: '400px' },
                { value: ColumnWidth.Large, label: 'L', pixels: '450px' },
                { value: ColumnWidth.Xl, label: 'XL', pixels: '500px' },
                { value: ColumnWidth.Xxl, label: 'XXL', pixels: '550px' },
              ].map((width) => (
                <button
                  key={width.value}
                  type="button"
                  onClick={() => setSelectedWidth(width.value)}
                  className={`px-2 py-2 rounded-md border text-xs font-medium transition-colors ${
                    selectedWidth === width.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  title={width.pixels}
                >
                  <div>{width.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{width.pixels}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Title (Optional) */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              カスタムタイトル（任意）
            </label>
            <input
              type="text"
              id="title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="デフォルトのタイトルを使用"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedDid}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '追加中...' : '追加'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddColumnButton;
