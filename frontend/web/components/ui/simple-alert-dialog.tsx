'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface AlertDialogState {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
}

interface AlertDialogContextType {
  dialog: AlertDialogState;
  openDialog: (dialog: Omit<AlertDialogState, 'open'>) => void;
  closeDialog: () => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<AlertDialogState>({ open: false });

  const openDialog = useCallback((newDialog: Omit<AlertDialogState, 'open'>) => {
    setDialog({ ...newDialog, open: true });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <AlertDialogContext.Provider value={{ dialog, openDialog, closeDialog }}>
      {children}
      <AlertDialogComponent />
    </AlertDialogContext.Provider>
  );
}

export function useAlertDialog() {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within AlertDialogProvider');
  }
  return context;
}

function AlertDialogComponent() {
  const { dialog, closeDialog } = useAlertDialog();

  if (!dialog.open) return null;

  const handleConfirm = () => {
    if (dialog.onConfirm) {
      dialog.onConfirm();
    }
    closeDialog();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0"
        onClick={closeDialog}
      />
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]">
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 gap-4 animate-in zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]">
          <div className="flex flex-col space-y-2">
            {dialog.title && (
              <h2 className="text-lg font-semibold text-gray-900">{dialog.title}</h2>
            )}
            {dialog.description && (
              <p className="text-sm text-gray-600">{dialog.description}</p>
            )}
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={closeDialog}
              className="mt-2 sm:mt-0"
            >
              {dialog.cancelLabel || 'Annuler'}
            </Button>
            <Button
              variant={dialog.variant === 'danger' ? 'danger' : 'default'}
              onClick={handleConfirm}
              className={cn(
                dialog.variant === 'danger' && 'bg-red-600 hover:bg-red-700 text-white'
              )}
            >
              {dialog.confirmLabel || 'Confirmer'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper hook for easier usage
export function useConfirm() {
  const { openDialog } = useAlertDialog();

  return useCallback(
    (options: {
      title: string;
      description: string;
      onConfirm: () => void;
      variant?: 'default' | 'danger';
      confirmLabel?: string;
      cancelLabel?: string;
    }) => {
      openDialog({
        title: options.title,
        description: options.description,
        onConfirm: options.onConfirm,
        variant: options.variant || 'default',
        confirmLabel: options.confirmLabel,
        cancelLabel: options.cancelLabel,
      });
    },
    [openDialog]
  );
}

