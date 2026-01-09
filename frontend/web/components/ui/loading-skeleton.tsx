'use client';

import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';

/**
 * Property Card Skeleton for loading states with enhanced animations
 */
export function PropertyCardSkeleton() {
  return (
    <Card className="border-2 border-gray-200 bg-white overflow-hidden rounded-2xl shadow-sm">
      <div className="relative w-full h-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 shimmer">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          <Skeleton className="h-6 w-16 rounded-full bg-white/80 backdrop-blur-sm" />
          <Skeleton className="h-6 w-12 rounded-full bg-white/80 backdrop-blur-sm" />
        </div>
      </div>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 mt-4 flex-wrap">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Property List Skeleton - Enhanced with stagger animation
 */
export function PropertyListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="stagger-item">
          <PropertyCardSkeleton />
        </div>
      ))}
    </div>
  );
}

/**
 * Search Results Skeleton with staggered animation
 */
export function SearchResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between animate-fade-in">
        <Skeleton className="h-6 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="animate-fade-in"
            style={{
              animationDelay: `${i * 50}ms`,
              animationFillMode: 'both',
            }}
          >
            <PropertyCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 bg-white">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

