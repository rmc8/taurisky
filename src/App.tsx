import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AccountsProvider, useAccounts } from "./contexts/AccountsContext";
import { WelcomeScreen } from "./components/auth/WelcomeScreen";
import { LoginScreen } from "./components/auth/LoginScreen";
import { AccountList } from "./components/auth/AccountList";
import { AddAccountButton } from "./components/auth/AddAccountButton";
import "./App.css";

/**
 * Main app content - shows appropriate screen based on auth state
 */
function AppContent() {
  const { isAuthenticated, isLoading, currentUser, logout, isSessionExpired, error } = useAuth();
  const { accounts } = useAccounts();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showAccountManagement, setShowAccountManagement] = useState(false);

  // Show loading spinner during initialization
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Session expired - show re-login prompt
  if (isSessionExpired && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⏱️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">セッションの有効期限切れ</h2>
          <p className="text-gray-600 mb-6">
            {error || 'セッションの有効期限が切れました。再度ログインしてください。'}
          </p>
          <button
            onClick={logout}
            className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            再ログイン
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated - show welcome or login screen
  if (!isAuthenticated) {
    if (showWelcome && !currentUser) {
      return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />;
    }
    return <LoginScreen />;
  }

  // Authenticated - show main app

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">TauriSky</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAccountManagement(!showAccountManagement)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              アカウント管理 ({accounts.length})
            </button>
            <span className="text-sm text-gray-600">
              {currentUser?.displayName || currentUser?.handle}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {showAccountManagement ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              アカウント管理
            </h2>
            <div className="space-y-6">
              <AddAccountButton />
              <AccountList />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAccountManagement(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                閉じる
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ログイン成功！
            </h2>
            <div className="space-y-2 text-gray-600">
              <p>
                <strong>DID:</strong> {currentUser?.did}
              </p>
              <p>
                <strong>ハンドル:</strong> {currentUser?.handle}
              </p>
              <p>
                <strong>サーバー:</strong> {currentUser?.serverUrl}
              </p>
              <p>
                <strong>登録アカウント数:</strong> {accounts.length}
              </p>
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                🎉 User Story 1-3 が完了しました！複数アカウントの管理ができるようになりました。
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Root App component with AuthProvider and AccountsProvider
 */
function App() {
  return (
    <AuthProvider>
      <AccountsProvider>
        <AppContent />
      </AccountsProvider>
    </AuthProvider>
  );
}

export default App;
