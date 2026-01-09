'use client';

import { memo, useState } from 'react';
import { Review, ReviewEntityType, CreateReviewRequest, UpdateReviewRequest } from '@/lib/api/review';
import { useReviews } from '@/hooks/use-reviews';
import { ReviewStats } from './ReviewStats';
import { ReviewList } from './ReviewList';
import { ReviewForm } from './ReviewForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Plus, X } from 'lucide-react';

interface ReviewSectionProps {
  entityType: ReviewEntityType;
  entityId: string;
  currentUserId?: string;
  showForm?: boolean;
}

export const ReviewSection = memo(function ReviewSection({
  entityType,
  entityId,
  currentUserId,
  showForm = true,
}: ReviewSectionProps) {
  const {
    reviews,
    stats,
    loading,
    error,
    total,
    page,
    setPage,
    fetchReviews,
    fetchStats,
    createReview: createReviewApi,
    updateReview: updateReviewApi,
    removeReview: deleteReviewApi,
    vote,
    unvote,
  } = useReviews({
    entityType,
    entityId,
    autoFetch: true,
  });

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [filters, setFilters] = useState<any>({});

  const handleCreateReview = async (reviewData: CreateReviewRequest | UpdateReviewRequest) => {
    try {
      if (editingReview) {
        await updateReviewApi(editingReview.id, reviewData as UpdateReviewRequest);
        setEditingReview(null);
      } else {
        await createReviewApi(reviewData as CreateReviewRequest);
      }
      setShowReviewForm(false);
      await fetchReviews();
      await fetchStats();
    } catch (err) {
      console.error('Error saving review:', err);
      throw err;
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    try {
      await deleteReviewApi(reviewId);
      await fetchReviews();
      await fetchStats();
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Erreur lors de la suppression de l\'avis');
    }
  };

  const handleVote = async (reviewId: string, voteType: 'helpful' | 'not_helpful') => {
    try {
      const review = reviews.find((r) => r.id === reviewId);
      if (review?.userVote === voteType) {
        // Remove vote - clicking same vote type removes it
        await unvote(reviewId, voteType);
      } else {
        // Add or change vote
        await vote(reviewId, voteType);
      }
      // Refresh to get updated vote counts
      await fetchReviews();
    } catch (err) {
      console.error('Error voting on review:', err);
    }
  };

  const handleRespond = (review: Review) => {
    // TODO: Implement response form modal
    console.log('Respond to review:', review.id);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // Refetch with new filters - fetchReviews will use the updated filters from the hook
    fetchReviews(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchReviews();
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {stats && <ReviewStats stats={stats} loading={loading} />}

      {/* Actions */}
      {showForm && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Avis ({total || 0})
          </h3>
          {!showReviewForm && (
            <Button
              onClick={() => {
                setEditingReview(null);
                setShowReviewForm(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Laisser un avis
            </Button>
          )}
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="relative">
          <ReviewForm
            entityType={entityType}
            entityId={entityId}
            review={editingReview || undefined}
            onSubmit={handleCreateReview}
            onCancel={() => {
              setShowReviewForm(false);
              setEditingReview(null);
            }}
            loading={loading}
          />
          <button
            onClick={() => {
              setShowReviewForm(false);
              setEditingReview(null);
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <ReviewList
        reviews={reviews}
        loading={loading}
        total={total}
        page={page}
        limit={20}
        currentUserId={currentUserId}
        onVote={handleVote}
        onEdit={handleEditReview}
        onDelete={handleDeleteReview}
        onRespond={handleRespond}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        showFilters={true}
      />
    </div>
  );
});

