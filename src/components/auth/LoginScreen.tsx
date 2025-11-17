/**
 * LoginScreen: Authentication form
 *
 * Allows users to log in with handle and password
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorDisplay } from './ErrorDisplay';

// Handle validation regex: alphanumeric, dots, and hyphens
const HANDLE_REGEX = /^[a-zA-Z0-9.-]+$/;
const HANDLE_MAX_LENGTH = 253;

export const LoginScreen: React.FC = () => {
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, error, clearError } = useAuth();

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
      // Pass serverUrl only if it's not empty
      await login(handle, password, serverUrl || undefined);
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ログイン</h1>
          <p className="mt-2 text-gray-600">Blueskyアカウントでログイン</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="handle" className="block text-sm font-medium text-gray-700">
                ハンドル
              </label>
              <input
                id="handle"
                name="handle"
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
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
              {validationError ? (
                <p className="mt-1 text-sm text-red-600">{validationError}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">
                  例: user.bsky.social または your@email.com
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700">
                サーバーURL（オプション）
              </label>
              <input
                id="serverUrl"
                name="serverUrl"
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="bsky.social（デフォルト）"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
              <p className="mt-1 text-sm text-gray-500">
                カスタムPDSサーバーを使用する場合は入力してください。https:// は省略可能です。
              </p>
            </div>
          </div>

          {error && (
            <ErrorDisplay
              title="ログインに失敗しました"
              message={error}
              onClose={clearError}
              variant="error"
            />
          )}

          <button
            type="submit"
            disabled={isSubmitting || !handle || !password}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </button>

          <div className="text-center text-sm text-gray-600">
            <p>
              アカウントをお持ちでない方は{' '}
              <a
                href="https://bsky.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                bsky.app
              </a>{' '}
              で作成できます
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
