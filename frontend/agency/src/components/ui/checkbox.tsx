'use client';

import * as React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, indeterminate, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    };

    const isChecked = checked || false;
    const isIndeterminate = indeterminate || false;
    const state = isIndeterminate ? 'indeterminate' : isChecked ? 'checked' : 'unchecked';

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          checked={isChecked}
          onChange={handleChange}
          className={cn(
            'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-viridial-600 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:bg-viridial-600 data-[state=checked]:text-white data-[state=checked]:border-viridial-600',
            'data-[state=indeterminate]:bg-viridial-600 data-[state=indeterminate]:text-white data-[state=indeterminate]:border-viridial-600',
            className
          )}
          data-state={state}
          {...props}
        />
        {isChecked && !isIndeterminate && (
          <Check className="absolute h-3 w-3 text-white pointer-events-none left-0.5 top-0.5" />
        )}
        {isIndeterminate && (
          <Minus className="absolute h-3 w-3 text-white pointer-events-none left-0.5 top-0.5" />
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

