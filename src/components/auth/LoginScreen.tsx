/**
 * LoginScreen: Authentication form
 *
 * Allows users to log in with handle and password
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginScreen: React.FC = () => {
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    try {
      await login(handle, password);
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
                onChange={(e) => setHandle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="user.bsky.social"
                autoComplete="username"
              />
              <p className="mt-1 text-sm text-gray-500">
                例: user.bsky.social または your@email.com
              </p>
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
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="text-sm font-medium">ログインに失敗しました</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
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
