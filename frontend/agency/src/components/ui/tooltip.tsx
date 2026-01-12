'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
}

export function Tooltip({ children, content, side = 'top', delay = 200, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg pointer-events-none',
            sideClasses[side],
            'animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              side === 'top' && 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
              side === 'right' && 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
              side === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
              side === 'left' && 'left-full top-1/2 -translate-y-1/2 border-l-gray-900'
            )}
          />
        </div>
      )}
    </div>
  );
}


