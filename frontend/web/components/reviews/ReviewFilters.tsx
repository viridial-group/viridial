'use client';

import { memo, useState } from 'react';
import { ReviewSortBy } from '@/lib/api/review';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter, SlidersHorizontal, Star, Camera, CheckCircle2, TrendingUp } from 'lucide-react';

interface ReviewFiltersProps {
  filters: {
    minRating?: number;
    maxRating?: number;
    sortBy?: ReviewSortBy;
    hasPhotos?: boolean;
    verifiedOnly?: boolean;
    recommendedOnly?: boolean;
  };
  onFilterChange: (filters: any) => void;
  totalReviews?: number;
}

export const ReviewFilters = memo(function ReviewFilters({
  filters,
  onFilterChange,
  totalReviews = 0,
}: ReviewFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof typeof filters];
    onFilterChange(newFilters);
  };

  const activeFiltersCount = Object.keys(filters).filter((key) => {
    const value = filters[key as keyof typeof filters];
    return value !== undefined && value !== null && value !== '';
  }).length;

  const clearAllFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
          <Filter className="h-4 w-4" />
          <span>Trier par:</span>
        </div>

        <Select
          value={filters.sortBy || ReviewSortBy.RECENT}
          onValueChange={(value) => updateFilter('sortBy', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ReviewSortBy.RECENT}>Plus récents</SelectItem>
            <SelectItem value={ReviewSortBy.HELPFUL}>Plus utiles</SelectItem>
            <SelectItem value={ReviewSortBy.RATING_HIGH}>Note la plus élevée</SelectItem>
            <SelectItem value={ReviewSortBy.RATING_LOW}>Note la plus basse</SelectItem>
          </SelectContent>
        </Select>

        {/* Rating Filter */}
        <Select
          value={filters.minRating?.toString() || 'all'}
          onValueChange={(value) => updateFilter('minRating', value === 'all' ? undefined : parseInt(value))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Note minimum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les notes</SelectItem>
            <SelectItem value="5">5 étoiles</SelectItem>
            <SelectItem value="4">4+ étoiles</SelectItem>
            <SelectItem value="3">3+ étoiles</SelectItem>
            <SelectItem value="2">2+ étoiles</SelectItem>
            <SelectItem value="1">1+ étoile</SelectItem>
          </SelectContent>
        </Select>

        {/* Quick filter buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant={filters.hasPhotos ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('hasPhotos', !filters.hasPhotos)}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Avec photos
          </Button>

          <Button
            variant={filters.verifiedOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Vérifiés
          </Button>

          <Button
            variant={filters.recommendedOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('recommendedOnly', !filters.recommendedOnly)}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Recommandés
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              Réinitialiser ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">Filtres actifs:</span>
          {filters.minRating && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {filters.minRating}+ étoiles
              <button
                onClick={() => removeFilter('minRating')}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.hasPhotos && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Camera className="h-3 w-3" />
              Avec photos
              <button
                onClick={() => removeFilter('hasPhotos')}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.verifiedOnly && (
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Vérifiés uniquement
              <button
                onClick={() => removeFilter('verifiedOnly')}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.recommendedOnly && (
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Recommandés uniquement
              <button
                onClick={() => removeFilter('recommendedOnly')}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results count */}
      {totalReviews > 0 && (
        <div className="text-sm text-gray-600">
          {totalReviews} {totalReviews === 1 ? 'avis trouvé' : 'avis trouvés'}
        </div>
      )}
    </div>
  );
});

