'use client';

import { memo } from 'react';
import { ReviewStats as ReviewStatsType } from '@/lib/api/review';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

interface ReviewStatsProps {
  stats: ReviewStatsType | null;
  loading?: boolean;
}

export const ReviewStats = memo(function ReviewStats({ stats, loading }: ReviewStatsProps) {
  if (loading) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6 text-center text-gray-500">
          <p>Aucun avis pour le moment</p>
        </CardContent>
      </Card>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
        <span className="ml-2 text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</span>
      </div>
    );
  };

  const getMaxRating = () => {
    const dist = stats.ratingDistribution;
    return Math.max(dist['1'], dist['2'], dist['3'], dist['4'], dist['5']);
  };

  const maxRating = getMaxRating();

  return (
    <Card className="border border-gray-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          Avis et notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div>
          {renderStars(stats.averageRating)}
          <p className="text-sm text-gray-600 mt-2">
            Basé sur <span className="font-semibold">{stats.totalReviews}</span>{' '}
            {stats.totalReviews === 1 ? 'avis' : 'avis'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-900 mb-3">Répartition des notes</h4>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating.toString() as keyof typeof stats.ratingDistribution];
            const percentage = maxRating > 0 ? (count / maxRating) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Additional Stats */}
        {(stats.recommendationRate !== undefined || stats.verifiedReviewsCount !== undefined) && (
          <div className="pt-4 border-t border-gray-200 space-y-3">
            {stats.recommendationRate !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">Taux de recommandation</span>
                </div>
                <Badge variant="success" className="text-sm font-semibold">
                  {stats.recommendationRate}%
                </Badge>
              </div>
            )}

            {stats.verifiedReviewsCount !== undefined && stats.verifiedReviewsCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">Avis vérifiés</span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {stats.verifiedReviewsCount}
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

