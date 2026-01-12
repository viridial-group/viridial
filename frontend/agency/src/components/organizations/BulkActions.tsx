'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Trash2, PowerOff, Download, X, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkActionsProps {
  selectedCount: number;
  onDelete?: () => void;
  onDeactivate?: () => void;
  onExport?: () => void;
  onChangeParent?: () => void;
  onClearSelection?: () => void;
  isLoading?: boolean;
}

export const BulkActions = memo(function BulkActions({
  selectedCount,
  onDelete,
  onDeactivate,
  onExport,
  onChangeParent,
  onClearSelection,
  isLoading = false,
}: BulkActionsProps) {
  const t = useTranslations();
  
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-viridial-50 border border-viridial-200 rounded-lg p-4 mb-4 flex items-center justify-between animate-slide-in-bottom shadow-sm transition-all duration-300 ease-out">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-900">
          {t('organizations.bulkActions.title', { count: selectedCount })}
        </span>
        {onClearSelection && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            {t('organizations.bulkActions.clear')}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onChangeParent && (
          <Button
            variant="outline"
            size="sm"
            onClick={onChangeParent}
            className="h-8 px-3 text-sm gap-2 text-viridial-600 hover:text-viridial-700 hover:bg-viridial-50"
          >
            <GitBranch className="h-3.5 w-3.5" />
            {t('organizations.bulkActions.changeParent') || 'Change Parent'}
          </Button>
        )}
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-8 px-3 text-sm gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            {t('organizations.bulkActions.export')}
          </Button>
        )}
        {onDeactivate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDeactivate}
            className="h-8 px-3 text-sm gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            <PowerOff className="h-3.5 w-3.5" />
            {t('organizations.bulkActions.deactivate')}
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isLoading}
            className="h-8 px-3 text-sm gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-3.5 w-3.5 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {t('organizations.bulkActions.delete')}
          </Button>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if selectedCount or isLoading changes
  return (
    prevProps.selectedCount === nextProps.selectedCount &&
    prevProps.isLoading === nextProps.isLoading
  );
});

