'use client';

import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function SkeletonLoader({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  lines = 1 
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              i === lines - 1 ? 'w-3/4' : 'w-full',
              'h-4'
            )}
            style={width ? { width } : undefined}
          />
        ))}
      </div>
    );
  }

  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded',
    card: 'rounded-lg h-32',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{
        width: width || (variant === 'circular' ? height : undefined),
        height: height || (variant === 'circular' ? width : undefined),
      }}
    />
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SkeletonLoader variant="rectangular" width={80} height={36} />
          <div className="flex items-center gap-3">
            <SkeletonLoader variant="circular" width={48} height={48} />
            <div className="space-y-2">
              <SkeletonLoader variant="text" width={200} height={24} />
              <SkeletonLoader variant="text" width={150} height={16} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SkeletonLoader variant="rectangular" width={100} height={36} />
          <SkeletonLoader variant="rectangular" width={80} height={36} />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonLoader key={i} variant="card" className="h-24" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonLoader variant="card" className="h-64" />
        <SkeletonLoader variant="card" className="h-64" />
      </div>
    </div>
  );
}

