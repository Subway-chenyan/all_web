import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';
import { ServiceDraft, ServiceFormData } from '@/types/services';
import { formatDate, formatRelativeTime } from '@/utils';
import Button from '@/components/ui/Button';

export interface DraftManagerProps {
  drafts: ServiceDraft[];
  onLoadDraft: (draft: ServiceDraft) => void;
  onDeleteDraft: (draftId: string) => void;
  onSaveDraft: (data: Partial<ServiceFormData>) => void;
  currentData: Partial<ServiceFormData>;
  className?: string;
  disabled?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number; // in milliseconds
}

const DraftManager: React.FC<DraftManagerProps> = ({
  drafts,
  onLoadDraft,
  onDeleteDraft,
  onSaveDraft,
  currentData,
  className = '',
  disabled = false,
  autoSave = true,
  autoSaveInterval = 30000 // 30 seconds
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || disabled) return;

    const interval = setInterval(() => {
      handleAutoSave();
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [currentData, autoSave, autoSaveInterval, disabled]);

  const handleAutoSave = async () => {
    // Check if there's enough data to save
    if (!currentData.title && !currentData.description && (!currentData.packages || currentData.packages.length === 0)) {
      return;
    }

    setIsAutoSaving(true);
    try {
      await onSaveDraft(currentData);
      setLastAutoSave(new Date());
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleLoadDraft = (draft: ServiceDraft) => {
    if (!disabled) {
      onLoadDraft(draft);
      setIsOpen(false);
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    if (!disabled) {
      onDeleteDraft(draftId);
      setShowDeleteConfirm(null);
    }
  };

  const getDraftPreview = (draft: ServiceDraft): string => {
    if (draft.data.title) return draft.data.title;
    if (draft.data.description) {
      const plainText = draft.data.description.replace(/<[^>]*>/g, '');
      return plainText.substring(0, 50) + (plainText.length > 50 ? '...' : '');
    }
    return '未命名草稿';
  };

  const getDraftCompletion = (draft: ServiceDraft): number => {
    let completed = 0;
    let total = 7;

    if (draft.data.title) completed++;
    if (draft.data.category) completed++;
    if (draft.data.description) completed++;
    if (draft.data.packages && draft.data.packages.length > 0) completed++;
    if (draft.data.images && draft.data.images.length > 0) completed++;
    if (draft.data.seoTitle) completed++;
    if (draft.data.requirements && draft.data.requirements.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const sortedDrafts = [...drafts].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return (
    <div className={cn('relative', className)}>
      {/* Draft Toggle Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="relative"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            草稿管理
            {drafts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                {drafts.length}
              </span>
            )}
          </Button>

          {/* Auto-save indicator */}
          {autoSave && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {isAutoSaving ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>自动保存中...</span>
                </>
              ) : lastAutoSave ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>上次保存: {formatRelativeTime(lastAutoSave)}</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>等待自动保存</span>
                </>
              )}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleAutoSave}
          disabled={disabled || isAutoSaving}
        >
          {isAutoSaving ? '保存中...' : '立即保存'}
        </Button>
      </div>

      {/* Draft Manager Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">草稿管理</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {sortedDrafts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-300 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>暂无草稿</p>
                  <p className="text-sm mt-1">开始编辑后将自动保存草稿</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {sortedDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {getDraftPreview(draft)}
                          </h4>
                          <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                            <span>步骤 {draft.step + 1}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(draft.updatedAt)}</span>
                            <span>•</span>
                            <span>{getDraftCompletion(draft)}% 完成</span>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full"
                                style={{ width: `${getDraftCompletion(draft)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-3">
                          <button
                            type="button"
                            onClick={() => handleLoadDraft(draft)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="加载草稿"
                            disabled={disabled}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </button>

                          {showDeleteConfirm === draft.id ? (
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteDraft(draft.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="确认删除"
                                disabled={disabled}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(null)}
                                className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                title="取消"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(draft.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="删除草稿"
                              disabled={disabled}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div>
                  最多保存 10 个草稿，自动清理 30 天前的草稿
                </div>
                <div>
                  {drafts.length}/10
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DraftManager;