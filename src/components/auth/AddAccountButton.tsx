/**
 * AddAccountButton: Trigger to add a new account
 *
 * Opens login flow for registering additional accounts
 */

import React, { useState } from 'react';
import { useAccounts } from '../../contexts/AccountsContext';
import { ErrorDisplay } from './ErrorDisplay';

// Handle validation regex: alphanumeric, dots, and hyphens
const HANDLE_REGEX = /^[a-zA-Z0-9.-]+$/;
const HANDLE_MAX_LENGTH = 253;

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { addAccount, error, clearError } = useAccounts();

  /**
   * Validate handle format
   */
  const validateHandle = (value: string): boolean => {
    if (!value) {
      setValidationError('ハンドルを入力してください');
      return false;
    }

    if (value.length > HANDLE_MAX_LENGTH) {
      setValidationError(`ハンドルは${HANDLE_MAX_LENGTH}文字以内で入力してください`);
      return false;
    }

    if (!HANDLE_REGEX.test(value)) {
      setValidationError('ハンドルには英数字、ドット、ハイフンのみ使用できます');
      return false;
    }

    setValidationError(null);
    return true;
  };

  /**
   * Handle handle input change with validation
   */
  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHandle(value);

    // Validate on change (non-blocking)
    if (value) {
      validateHandle(value);
    } else {
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    // Validate handle before submission
    if (!validateHandle(handle)) {
      setIsSubmitting(false);
      return;
    }

    try {
      await addAccount(handle, password, serverUrl || undefined);
      // Success - close modal and reset form
      setHandle('');
      setPassword('');
      setServerUrl('');
      setValidationError(null);
      onClose();
    } catch (err) {
      // Error is handled by AccountsContext
      console.error('Add account failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">アカウントを追加</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="add-handle" className="block text-sm font-medium text-gray-700">
              ハンドル
            </label>
            <input
              id="add-handle"
              type="text"
              required
              value={handle}
              onChange={handleHandleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 ${
                validationError
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="user.bsky.social"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
            {validationError && (
              <p className="mt-1 text-sm text-red-600">{validationError}</p>
            )}
          </div>

          <div>
            <label htmlFor="add-password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              id="add-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="add-serverUrl" className="block text-sm font-medium text-gray-700">
              サーバーURL（オプション）
            </label>
            <input
              id="add-serverUrl"
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="bsky.social（デフォルト）"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>

          {error && (
            <ErrorDisplay
              message={error}
              onClose={clearError}
              variant="error"
            />
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !handle || !password}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '追加中...' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddAccountButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        + アカウントを追加
      </button>

      <AddAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
