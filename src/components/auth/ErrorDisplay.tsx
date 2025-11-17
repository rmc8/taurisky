/**
 * ErrorDisplay: Generic error message component
 *
 * Displays user-friendly error messages with appropriate styling
 */

import React from 'react';

interface ErrorDisplayProps {
  /** Error message to display */
  message: string;
  /** Optional error title (defaults to "エラー") */
  title?: string;
  /** Optional onClose callback */
  onClose?: () => void;
  /** Variant style */
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  title = 'エラー',
  onClose,
  variant = 'error',
}) => {
  const variantStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      titleText: 'text-red-800',
      icon: '❌',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      titleText: 'text-yellow-800',
      icon: '⚠️',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      titleText: 'text-blue-800',
      icon: 'ℹ️',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`${styles.bg} border ${styles.border} ${styles.text} px-4 py-3 rounded-md relative`}
      role="alert"
    >
      <div className="flex items-start">
        <span className="text-xl mr-3">{styles.icon}</span>
        <div className="flex-1">
          <p className={`font-medium ${styles.titleText}`}>{title}</p>
          <p className="text-sm mt-1">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${styles.text} hover:opacity-75 ml-3`}
            aria-label="エラーを閉じる"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * LoadingSpinner: Generic loading spinner component
 */
interface LoadingSpinnerProps {
  /** Optional loading message */
  message?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-2',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`inline-block animate-spin rounded-full border-blue-600 ${sizeStyles[size]}`}
        role="status"
        aria-label="読み込み中"
      ></div>
      {message && <p className="mt-4 text-gray-600 text-sm">{message}</p>}
    </div>
  );
};

/**
 * FullScreenLoader: Full-screen loading overlay
 */
interface FullScreenLoaderProps {
  /** Loading message */
  message?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  message = '読み込み中...',
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
};
