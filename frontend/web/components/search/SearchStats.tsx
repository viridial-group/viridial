'use client';

import { Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchStatsProps {
  totalHits: number;
  processingTimeMs?: number;
  query?: string;
}

export default function SearchStats({ totalHits, processingTimeMs, query }: SearchStatsProps) {
  if (totalHits === 0) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-gray-500 px-4 py-2 bg-gray-50 border-b border-gray-200">
      {processingTimeMs && processingTimeMs > 0 && (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{processingTimeMs}ms</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        <span>{totalHits} {totalHits === 1 ? 'résultat' : 'résultats'}</span>
      </div>
      {query && (
        <Badge variant="outline" className="ml-auto text-xs">
          &quot;{query}&quot;
        </Badge>
      )}
    </div>
  );
}

