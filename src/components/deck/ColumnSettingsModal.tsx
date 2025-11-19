/**
 * Column Settings Modal Component
 *
 * Allows users to customize individual column settings including:
 * - Column width (7-stage selection)
 * - Timeline filters (repost/reply display)
 * - Auto-refresh settings
 * - Display customization options
 */

import React, { useState } from 'react';
import type { DeckColumnConfig, ColumnWidth, ColumnSettings, RepostFilter, ReplyFilter, AutoRefreshInterval } from '../../types/auth';
import { ColumnWidth as CW, RepostFilter as RF, ReplyFilter as RLF, AutoRefreshInterval as ARI } from '../../types/auth';

interface ColumnSettingsModalProps {
  column: DeckColumnConfig;
  onClose: () => void;
  onSave: (columnId: string, updates: Partial<DeckColumnConfig>) => Promise<void>;
}

const ColumnSettingsModal: React.FC<ColumnSettingsModalProps> = ({
  column,
  onClose,
  onSave,
}) => {
  // Initialize state from column settings
  const [selectedWidth, setSelectedWidth] = useState<ColumnWidth>(
    column.width || CW.Medium
  );

  const [repostFilter, setRepostFilter] = useState<RepostFilter>(
    column.settings?.filters?.repostDisplay || RF.All
  );

  const [replyFilter, setReplyFilter] = useState<ReplyFilter>(
    column.settings?.filters?.replyDisplay || RLF.All
  );

  const [autoRefreshInterval, setAutoRefreshInterval] = useState<AutoRefreshInterval>(
    column.settings?.autoRefresh?.interval || ARI.Off
  );

  const [scrollToTop, setScrollToTop] = useState<boolean>(
    column.settings?.autoRefresh?.scrollToTop ?? true
  );

  const [showIcons, setShowIcons] = useState<boolean>(
    column.settings?.display?.showIcons ?? true
  );

  const [mediaColumns, setMediaColumns] = useState<boolean>(
    column.settings?.display?.mediaColumns ?? false
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Build updated settings object
      const updatedSettings: ColumnSettings = {
        filters: {
          repostDisplay: repostFilter,
          replyDisplay: replyFilter,
        },
        autoRefresh: {
          interval: autoRefreshInterval,
          scrollToTop,
        },
        display: {
          showIcons,
          mediaColumns,
        },
      };

      await onSave(column.id, {
        width: selectedWidth,
        settings: updatedSettings,
      });

      onClose();
    } catch (err) {
      console.error('Failed to save column settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const widthOptions = [
    { value: CW.Xxs, label: 'XXS', pixels: '280px', description: '通知向け' },
    { value: CW.Xs, label: 'XS', pixels: '320px', description: 'コンパクト' },
    { value: CW.Small, label: 'S', pixels: '350px', description: '狭め' },
    { value: CW.Medium, label: 'M', pixels: '400px', description: 'デフォルト' },
    { value: CW.Large, label: 'L', pixels: '450px', description: 'ゆったり' },
    { value: CW.Xl, label: 'XL', pixels: '500px', description: '広め' },
    { value: CW.Xxl, label: 'XXL', pixels: '550px', description: 'メディア重視' },
  ];

  const repostFilterOptions = [
    { value: RF.All, label: 'すべて表示', description: 'フィルタリングなし' },
    { value: RF.Many, label: 'ほぼすべて表示', description: '約75%表示' },
    { value: RF.Soso, label: '半分程度表示', description: '約50%表示' },
    { value: RF.Less, label: '少なめに表示', description: '約25%表示' },
    { value: RF.None, label: 'すべて非表示', description: 'リポスト完全非表示' },
  ];

  const replyFilterOptions = [
    { value: RLF.All, label: 'すべて表示', description: 'すべてのリプライ' },
    { value: RLF.Following, label: 'フォロー中のみ', description: 'フォロー中へのリプライのみ' },
    { value: RLF.Me, label: '自分へのみ', description: '自分へのリプライのみ' },
  ];

  const autoRefreshOptions = [
    { value: ARI.Off, label: '自動更新なし', seconds: '0秒' },
    { value: ARI.TenSeconds, label: '10秒ごと', seconds: '10秒' },
    { value: ARI.ThirtySeconds, label: '30秒ごと', seconds: '30秒' },
    { value: ARI.OneMinute, label: '1分ごと', seconds: '60秒' },
    { value: ARI.FiveMinutes, label: '5分ごと', seconds: '300秒' },
    { value: ARI.TenMinutes, label: '10分ごと', seconds: '600秒' },
    { value: ARI.ThirtyMinutes, label: '30分ごと', seconds: '1800秒' },
    { value: ARI.Realtime, label: 'リアルタイム', seconds: 'WebSocket' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">カラム設定</h2>
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
        <div className="px-6 py-4 space-y-6">
          {/* Column Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              カラム幅
            </label>
            <div className="grid grid-cols-4 gap-2">
              {widthOptions.map((width) => (
                <button
                  key={width.value}
                  type="button"
                  onClick={() => setSelectedWidth(width.value)}
                  className={`px-3 py-2 rounded-md border text-xs font-medium transition-colors ${
                    selectedWidth === width.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  title={`${width.pixels} - ${width.description}`}
                >
                  <div className="font-bold">{width.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{width.pixels}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Filters */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">タイムラインフィルター</h3>

            {/* Repost Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                リポスト表示
              </label>
              <select
                value={repostFilter}
                onChange={(e) => setRepostFilter(e.target.value as RepostFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {repostFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Reply Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                リプライ表示
              </label>
              <select
                value={replyFilter}
                onChange={(e) => setReplyFilter(e.target.value as ReplyFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {replyFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Auto-Refresh Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">自動更新</h3>

            {/* Refresh Interval */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                更新間隔
              </label>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value) as AutoRefreshInterval)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {autoRefreshOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.seconds})
                  </option>
                ))}
              </select>
            </div>

            {/* Scroll to Top */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="scrollToTop"
                checked={scrollToTop}
                onChange={(e) => setScrollToTop(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="scrollToTop" className="ml-2 text-sm text-gray-700">
                更新時に最上部へスクロール
              </label>
            </div>
          </div>

          {/* Display Options */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">表示オプション</h3>

            <div className="space-y-3">
              {/* Show Icons */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showIcons"
                  checked={showIcons}
                  onChange={(e) => setShowIcons(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showIcons" className="ml-2 text-sm text-gray-700">
                  アイコンを表示
                </label>
              </div>

              {/* Media Columns */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mediaColumns"
                  checked={mediaColumns}
                  onChange={(e) => setMediaColumns(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="mediaColumns" className="ml-2 text-sm text-gray-700">
                  メディアをカラム表示
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnSettingsModal;
