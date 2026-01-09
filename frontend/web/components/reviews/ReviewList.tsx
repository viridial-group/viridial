'use client';

import { memo, useState } from 'react';
import { Review } from '@/lib/api/review';
import { ReviewCard } from './ReviewCard';
import { ReviewFilters } from './ReviewFilters';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare } from 'lucide-react';

interface ReviewListProps {
  reviews: Review[];
  loading?: boolean;
  total?: number;
  page?: number;
  limit?: number;
  currentUserId?: string;
  onVote?: (reviewId: string, voteType: 'helpful' | 'not_helpful') => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onRespond?: (review: Review) => void;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: any) => void;
  showFilters?: boolean;
}

export const ReviewList = memo(function ReviewList({
  reviews,
  loading = false,
  total = 0,
  page = 1,
  limit = 20,
  currentUserId,
  onVote,
  onEdit,
  onDelete,
  onRespond,
  onPageChange,
  onFilterChange,
  showFilters = true,
}: ReviewListProps) {
  const [filters, setFilters] = useState<any>({});

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0 && !loading) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Aucun avis pour le moment"
        description="Soyez le premier à laisser un avis sur cette propriété."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <ReviewFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          totalReviews={total}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserId={currentUserId}
            onVote={onVote}
            onEdit={onEdit}
            onDelete={onDelete}
            onRespond={onRespond}
          />
        ))}
      </div>

      {/* Loading indicator for pagination */}
      {loading && reviews.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Page {page} sur {totalPages} ({total} {total === 1 ? 'avis' : 'avis'})
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
            >
              Précédent
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange?.(pageNum)}
                    className="min-w-[2.5rem]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

