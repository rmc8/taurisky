/**
 * Deck Component
 *
 * Main deck UI with horizontal scrollable columns
 */

import React from 'react';
import { useDeck } from '../../contexts/DeckContext';
import DeckColumn from './DeckColumn';
import AddColumnButton from './AddColumnButton';

const Deck: React.FC = () => {
  const { columns, isLoading, error } = useDeck();

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-x-auto bg-gray-100">
        {/* Skeleton screen - loading state */}
        <div className="flex gap-4 p-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-96 h-full bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-lg mb-2">
            デッキの読み込みに失敗しました
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-gray-800 font-bold text-xl mb-4">
            カラムがありません
          </h2>
          <p className="text-gray-600 mb-6">
            アカウントにログインしてカラムを作成してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-x-auto bg-gray-100 md:gap-4 p-4">
      {columns.map((column) => (
        <DeckColumn key={column.id} column={column} />
      ))}
      <AddColumnButton />
    </div>
  );
};

export default Deck;
