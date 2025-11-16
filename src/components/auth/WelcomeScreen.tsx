/**
 * WelcomeScreen: First launch experience
 *
 * Shown when no accounts are registered
 */

import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">TauriSky へようこそ</h1>
          <p className="text-xl text-gray-600">
            デスクトップネイティブなBlueskyクライアント
          </p>
        </div>

        <div className="space-y-4 text-left">
          <h2 className="text-lg font-semibold text-gray-900">主な機能</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>デッキ型UI - 複数のカラムを同時表示</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>複数アカウント対応 - 同時利用が可能</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>安全な認証 - 暗号化されたローカルストレージ</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>カスタムサーバー - セルフホストPDSにも対応</span>
            </li>
          </ul>
        </div>

        <button
          onClick={onGetStarted}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          始める
        </button>

        <p className="text-sm text-gray-500">
          続行することで、
          <a href="#" className="text-blue-600 hover:underline">
            利用規約
          </a>
          と
          <a href="#" className="text-blue-600 hover:underline">
            プライバシーポリシー
          </a>
          に同意したものとみなされます
        </p>
      </div>
    </div>
  );
};
