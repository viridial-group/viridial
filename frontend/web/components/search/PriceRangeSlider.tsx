'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';
// Simple debounce implementation
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

interface PriceRangeSliderProps {
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
  currency?: string;
  max?: number;
  min?: number;
}

export default function PriceRangeSlider({
  minPrice,
  maxPrice,
  onPriceChange,
  currency = 'EUR',
  max = 5000000,
  min = 0,
}: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = useState<number>(minPrice || min);
  const [localMax, setLocalMax] = useState<number>(maxPrice || max);
  const [minInput, setMinInput] = useState<string>(minPrice?.toString() || '');
  const [maxInput, setMaxInput] = useState<string>(maxPrice?.toString() || '');

  // Debounced callback to avoid too many updates
  const debouncedPriceChange = useCallback(
    debounce((minVal: number | undefined, maxVal: number | undefined) => {
      onPriceChange(minVal, maxVal);
    }, 500),
    [onPriceChange]
  );

  // Sync with props
  useEffect(() => {
    setLocalMin(minPrice || min);
    setLocalMax(maxPrice || max);
    setMinInput(minPrice?.toString() || '');
    setMaxInput(maxPrice?.toString() || '');
  }, [minPrice, maxPrice, min, max]);

  const handleSliderChange = (values: number[]) => {
    const [newMin, newMax] = values;
    setLocalMin(newMin);
    setLocalMax(newMax);
    setMinInput(newMin.toString());
    setMaxInput(newMax.toString());
    debouncedPriceChange(newMin === min ? undefined : newMin, newMax === max ? undefined : newMax);
  };

  const handleMinInputChange = (value: string) => {
    setMinInput(value);
    const numValue = parseInt(value) || min;
    const clampedValue = Math.max(min, Math.min(numValue, localMax - 1000));
    setLocalMin(clampedValue);
    debouncedPriceChange(clampedValue === min ? undefined : clampedValue, maxPrice);
  };

  const handleMaxInputChange = (value: string) => {
    setMaxInput(value);
    const numValue = parseInt(value) || max;
    const clampedValue = Math.max(localMin + 1000, Math.min(numValue, max));
    setLocalMax(clampedValue);
    debouncedPriceChange(minPrice, clampedValue === max ? undefined : clampedValue);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-3">
      <Label>Fourchette de prix</Label>
      <div className="px-2 py-2">
        <Slider
          value={[localMin, localMax]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={1000}
          className="w-full"
        />
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="price-min" className="text-xs text-gray-500 font-medium">
            Min
          </Label>
          <Input
            id="price-min"
            type="number"
            value={minInput}
            onChange={(e) => handleMinInputChange(e.target.value)}
            min={min}
            max={localMax}
            placeholder={formatPrice(min)}
            className="h-10 text-sm"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="price-max" className="text-xs text-gray-500 font-medium">
            Max
          </Label>
          <Input
            id="price-max"
            type="number"
            value={maxInput}
            onChange={(e) => handleMaxInputChange(e.target.value)}
            min={localMin}
            max={max}
            placeholder={formatPrice(max)}
            className="h-10 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium pt-1">
        <span>{formatPrice(localMin)}</span>
        <span>{formatPrice(localMax)}</span>
      </div>
    </div>
  );
}

