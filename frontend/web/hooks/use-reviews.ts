'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getReviews,
  getReview,
  createReview as createReviewApi,
  updateReview as updateReviewApi,
  deleteReview as deleteReviewApi,
  getReviewStats,
  voteReview,
  removeVote,
  createReviewResponse as createResponseApi,
  updateReviewResponse as updateResponseApi,
  deleteReviewResponse as deleteResponseApi,
  type Review,
  type ReviewStats,
  type ReviewFilters,
  type CreateReviewRequest,
  type UpdateReviewRequest,
  type ReviewListResponse,
} from '@/lib/api/review';

interface UseReviewsOptions {
  entityType?: string;
  entityId?: string;
  autoFetch?: boolean;
}

export function useReviews(options: UseReviewsOptions = {}) {
  const { entityType, entityId, autoFetch = true } = options;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const fetchReviews = useCallback(
    async (filters?: ReviewFilters) => {
      if (!entityType || !entityId) return;

      setLoading(true);
      setError(null);

      try {
        const response: ReviewListResponse = await getReviews({
          entityType: entityType as any,
          entityId,
          ...(filters || {}),
          page: filters?.page || page,
          limit: filters?.limit || limit,
        });

        setReviews(response.reviews);
        setTotal(response.total);
        if (filters?.page) {
          setPage(filters.page);
        } else {
          setPage(response.page);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    },
    [entityType, entityId, page, limit],
  );

  const fetchStats = useCallback(async () => {
    if (!entityType || !entityId) return;

    setLoading(true);
    setError(null);

    try {
      const statsData = await getReviewStats(entityType as any, entityId);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch review stats');
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    if (autoFetch && entityType && entityId) {
      fetchReviews();
      fetchStats();
    }
  }, [autoFetch, entityType, entityId, fetchReviews, fetchStats]);

  const createReview = useCallback(
    async (review: CreateReviewRequest) => {
      setLoading(true);
      setError(null);

      try {
        const newReview = await createReviewApi(review);
        setReviews((prev) => [newReview, ...prev]);
        setTotal((prev) => prev + 1);
        await fetchStats(); // Refresh stats
        return newReview;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create review';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStats],
  );

  const updateReview = useCallback(
    async (id: string, review: UpdateReviewRequest) => {
      setLoading(true);
      setError(null);

      try {
        const updated = await updateReviewApi(id, review);
        setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
        await fetchStats(); // Refresh stats
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update review';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStats],
  );

  const removeReview = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        await deleteReviewApi(id);
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setTotal((prev) => prev - 1);
        await fetchStats(); // Refresh stats
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete review';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStats],
  );

  const vote = useCallback(async (reviewId: string, voteType: 'helpful' | 'not_helpful') => {
    try {
      await voteReview(reviewId, voteType);
      // Refresh reviews list to get updated vote counts
      await fetchReviews();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to vote on review';
      setError(message);
      throw err;
    }
  }, [fetchReviews]);

  const unvote = useCallback(async (reviewId: string, voteType: 'helpful' | 'not_helpful') => {
    try {
      await removeVote(reviewId, voteType);
      // Refresh reviews list to get updated vote counts
      await fetchReviews();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove vote';
      setError(message);
      throw err;
    }
  }, [fetchReviews]);

  return {
    reviews,
    stats,
    loading,
    error,
    total,
    page,
    limit,
    setPage,
    fetchReviews,
    fetchStats,
    createReview,
    updateReview,
    removeReview,
    vote,
    unvote,
  };
}

