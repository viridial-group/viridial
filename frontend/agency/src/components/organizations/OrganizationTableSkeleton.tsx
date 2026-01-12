'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface OrganizationTableSkeletonProps {
  rows?: number;
}

export function OrganizationTableSkeleton({ rows = 5 }: OrganizationTableSkeletonProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
            <TableRow className="border-b border-gray-200 hover:bg-transparent bg-white">
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-700">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <TableRow key={index} className="border-b border-gray-100">
                <TableCell className="py-3">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="py-3">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell className="py-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="py-3">
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell className="py-3">
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell className="py-3">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


