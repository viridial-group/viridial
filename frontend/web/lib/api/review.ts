/**
 * API Client pour review-service
 */

const REVIEW_API_URL = process.env.NEXT_PUBLIC_REVIEW_API_URL || 'http://localhost:3005';

export enum ReviewEntityType {
  PROPERTY = 'property',
  CITY = 'city',
  NEIGHBORHOOD = 'neighborhood',
  COUNTRY = 'country',
}

export enum ReviewTag {
  SECURITY = 'security',
  LOCATION = 'location',
  PRICE = 'price',
  QUALITY = 'quality',
  NEIGHBORHOOD = 'neighborhood',
  TRANSPORT = 'transport',
  CLEANLINESS = 'cleanliness',
  COMMUNICATION = 'communication',
  VALUE = 'value',
  AMENITIES = 'amenities',
}

export enum ReviewSortBy {
  RECENT = 'recent',
  HELPFUL = 'helpful',
  RATING_HIGH = 'rating_high',
  RATING_LOW = 'rating_low',
}

export interface Review {
  id: string;
  userId: string;
  entityType: ReviewEntityType;
  entityId: string;
  rating: number; // 1-5
  title: string | null;
  comment: string | null;
  status: 'pending' | 'approved' | 'rejected';
  photos: string[] | null;
  tags: ReviewTag[] | null;
  recommended: boolean | null;
  verified: boolean;
  visitDate: Date | null;
  helpfulCount: number;
  notHelpfulCount: number;
  userVote?: 'helpful' | 'not_helpful' | null;
  responses?: ReviewResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewResponse {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewStats {
  entityType: ReviewEntityType;
  entityId: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  recommendationRate?: number;
  verifiedReviewsCount?: number;
}

export interface CreateReviewRequest {
  entityType: ReviewEntityType;
  entityId: string;
  rating: number;
  title?: string;
  comment?: string;
  photos?: string[];
  tags?: ReviewTag[];
  recommended?: boolean;
  visitDate?: string; // ISO date string
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
  photos?: string[];
  tags?: ReviewTag[];
  recommended?: boolean;
  visitDate?: string;
}

export interface ReviewFilters {
  entityType?: ReviewEntityType;
  entityId?: string;
  minRating?: number;
  maxRating?: number;
  hasPhotos?: boolean;
  verifiedOnly?: boolean;
  recommendedOnly?: boolean;
  sortBy?: ReviewSortBy;
  page?: number;
  limit?: number;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Create headers with authentication
 */
function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Create a new review
 */
export async function createReview(review: CreateReviewRequest): Promise<Review> {
  const response = await fetch(`${REVIEW_API_URL}/reviews`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(review),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create review' }));
    throw new Error(error.message || 'Failed to create review');
  }

  return response.json();
}

/**
 * Get all reviews with filters
 */
export async function getReviews(filters: ReviewFilters = {}): Promise<ReviewListResponse> {
  const params = new URLSearchParams();

  if (filters.entityType) params.append('entityType', filters.entityType);
  if (filters.entityId) params.append('entityId', filters.entityId);
  if (filters.minRating) params.append('minRating', filters.minRating.toString());
  if (filters.maxRating) params.append('maxRating', filters.maxRating.toString());
  if (filters.hasPhotos !== undefined) params.append('hasPhotos', filters.hasPhotos.toString());
  if (filters.verifiedOnly !== undefined) params.append('verifiedOnly', filters.verifiedOnly.toString());
  if (filters.recommendedOnly !== undefined) params.append('recommendedOnly', filters.recommendedOnly.toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await fetch(`${REVIEW_API_URL}/reviews/search?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch reviews' }));
    throw new Error(error.message || 'Failed to fetch reviews');
  }

  return response.json();
}

/**
 * Get a single review by ID
 */
export async function getReview(id: string): Promise<Review> {
  const response = await fetch(`${REVIEW_API_URL}/reviews/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch review' }));
    throw new Error(error.message || 'Failed to fetch review');
  }

  return response.json();
}

/**
 * Update a review
 */
export async function updateReview(id: string, review: UpdateReviewRequest): Promise<Review> {
  const response = await fetch(`${REVIEW_API_URL}/reviews/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(review),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update review' }));
    throw new Error(error.message || 'Failed to update review');
  }

  return response.json();
}

/**
 * Delete a review
 */
export async function deleteReview(id: string): Promise<void> {
  const response = await fetch(`${REVIEW_API_URL}/reviews/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete review' }));
    throw new Error(error.message || 'Failed to delete review');
  }
}

/**
 * Get review statistics for an entity
 */
export async function getReviewStats(entityType: ReviewEntityType, entityId: string): Promise<ReviewStats> {
  const response = await fetch(`${REVIEW_API_URL}/reviews/stats/${entityType}/${entityId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch review stats' }));
    throw new Error(error.message || 'Failed to fetch review stats');
  }

  return response.json();
}

/**
 * Vote on a review (helpful or not helpful)
 */
export async function voteReview(reviewId: string, voteType: 'helpful' | 'not_helpful'): Promise<void> {
  const response = await fetch(`${REVIEW_API_URL}/reviews/${reviewId}/vote`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ voteType }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to vote on review' }));
    throw new Error(error.message || 'Failed to vote on review');
  }
}

/**
 * Remove vote from a review
 */
export async function removeVote(reviewId: string, voteType: 'helpful' | 'not_helpful'): Promise<void> {
  const response = await fetch(`${REVIEW_API_URL}/reviews/${reviewId}/vote?type=${voteType}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to remove vote' }));
    throw new Error(error.message || 'Failed to remove vote');
  }
}

/**
 * Create a response to a review
 */
export async function createReviewResponse(reviewId: string, content: string): Promise<ReviewResponse> {
  const response = await fetch(`${REVIEW_API_URL}/reviews/${reviewId}/responses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create response' }));
    throw new Error(error.message || 'Failed to create response');
  }

  return response.json();
}

/**
 * Update a response
 */
export async function updateReviewResponse(responseId: string, content: string): Promise<ReviewResponse> {
  const response = await fetch(`${REVIEW_API_URL}/reviews/responses/${responseId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update response' }));
    throw new Error(error.message || 'Failed to update response');
  }

  return response.json();
}

/**
 * Delete a response
 */
export async function deleteReviewResponse(responseId: string): Promise<void> {
  const response = await fetch(`${REVIEW_API_URL}/reviews/responses/${responseId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete response' }));
    throw new Error(error.message || 'Failed to delete response');
  }
}

