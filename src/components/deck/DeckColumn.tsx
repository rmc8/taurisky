/**
 * Deck Column Component
 *
 * Individual column in the deck with independent vertical scrolling
 */

import React from 'react';
import type { DeckColumnConfig } from '../../types/auth';
import { ColumnWidth } from '../../types/auth';
import DeckColumnHeader from './DeckColumnHeader';

interface DeckColumnProps {
  column: DeckColumnConfig;
}

const DeckColumn: React.FC<DeckColumnProps> = ({ column }) => {
  // Width mapping for 7-stage column widths
  const widthClass = {
    [ColumnWidth.Xxs]: 'w-[280px]',
    [ColumnWidth.Xs]: 'w-80', // 320px
    [ColumnWidth.Small]: 'w-[350px]',
    [ColumnWidth.Medium]: 'w-[400px]',
    [ColumnWidth.Large]: 'w-[450px]',
    [ColumnWidth.Xl]: 'w-[500px]',
    [ColumnWidth.Xxl]: 'w-[550px]',
  }[column.width || ColumnWidth.Medium];

  return (
    <div
      className={`flex-shrink-0 ${widthClass} h-full flex flex-col bg-white rounded-lg shadow-md border border-gray-200`}
    >
      <DeckColumnHeader column={column} />

      <div className="flex-1 overflow-y-auto p-4">
        {/* Placeholder content for MVP */}
        <div className="text-gray-500 text-sm text-center py-8">
          <p className="mb-2">
            {column.type === 'timeline' ? 'タイムライン' : '通知'}
          </p>
          <p className="text-xs text-gray-400">
            コンテンツは次のフェーズで実装されます
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeckColumn;
