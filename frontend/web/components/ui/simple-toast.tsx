'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  variant: ToastVariant;
  title?: string;
  description?: string;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...newToast, id }]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
    default: Info,
  };

  const variantStyles = {
    default: 'border-gray-200 bg-white',
    success: 'border-viridial-200 bg-viridial-50',
    error: 'border-red-200 bg-red-50',
    warning: 'border-yellow-200 bg-yellow-50',
    info: 'border-blue-200 bg-blue-50',
  };

  const iconColors = {
    success: 'text-primary',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    default: 'text-gray-600',
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 right-0 z-[100] flex flex-col gap-2 p-4 sm:bottom-0 sm:top-auto md:max-w-[420px] pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.variant];
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all duration-300 ease-out',
              'animate-[slideInRight_0.3s_ease-out, fadeIn_0.3s_ease-out]',
              variantStyles[toast.variant]
            )}
          >
            <div className="flex gap-3 items-start flex-1">
              <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColors[toast.variant])} />
              <div className="grid gap-1 flex-1">
                {toast.title && <div className="text-sm font-semibold text-gray-900">{toast.title}</div>}
                {toast.description && <div className="text-sm text-gray-600">{toast.description}</div>}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

