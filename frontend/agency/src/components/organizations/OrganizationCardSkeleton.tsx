'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function OrganizationCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      
      <div className="space-y-2 mb-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}


