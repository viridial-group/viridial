'use client';

import { memo } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchStatsProps {
  totalHits: number;
  processingTimeMs?: number;
  query?: string;
}

const SearchStats = memo(function SearchStats({ totalHits, processingTimeMs, query }: SearchStatsProps) {
  if (totalHits === 0) return null;

  return (
    <div className="flex items-center gap-4 text-xs text-gray-600 px-5 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-1.5 font-medium">
        <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
        <span className="text-gray-700">{totalHits} {totalHits === 1 ? 'résultat' : 'résultats'}</span>
      </div>
      {processingTimeMs && processingTimeMs > 0 && (
        <div className="flex items-center gap-1.5 text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{processingTimeMs}ms</span>
        </div>
      )}
      {query && (
        <Badge variant="outline" className="ml-auto text-xs border-gray-300 bg-gray-50 text-gray-700 font-medium">
          &quot;{query}&quot;
        </Badge>
      )}
    </div>
  );
});

export default SearchStats;

