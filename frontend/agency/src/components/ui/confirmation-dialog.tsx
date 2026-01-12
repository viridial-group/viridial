'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  variant?: ConfirmationVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  itemsCount?: number; // Nombre d'éléments concernés pour afficher dans le message
}

const variantConfig: Record<
  ConfirmationVariant,
  { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }
> = {
  danger: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = 'danger',
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
  itemsCount,
}: ConfirmationDialogProps) {
  const tCommon = useTranslations('common');
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const defaultConfirmText =
    variant === 'danger'
      ? tCommon('delete') || 'Delete'
      : variant === 'warning'
      ? tCommon('confirm') || 'Confirm'
      : tCommon('save') || 'Save';

  const defaultCancelText = tCommon('cancel') || 'Cancel';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className={cn('p-3 rounded-lg border w-fit mb-2', config.bgColor)}>
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>
          <DialogTitle className="text-left">{title}</DialogTitle>
          <DialogDescription className="text-left text-gray-600">
            {description}
            {itemsCount !== undefined && itemsCount > 1 && (
              <span className="block mt-2 font-medium text-gray-900">
                {tCommon('itemsCount') || 'Items'}: {itemsCount}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText || defaultCancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              variant === 'danger' && 'bg-red-600 hover:bg-red-700 text-white',
              variant === 'warning' && 'bg-orange-600 hover:bg-orange-700 text-white',
              variant === 'info' && 'bg-blue-600 hover:bg-blue-700 text-white',
              variant === 'success' && 'bg-green-600 hover:bg-green-700 text-white'
            )}
          >
            {isLoading ? (
              <>
                <span className="mr-2">{tCommon('processing') || 'Processing...'}</span>
              </>
            ) : (
              confirmText || defaultConfirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


