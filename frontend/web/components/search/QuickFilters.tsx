'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Leaf, Sparkles, TrendingDown, Home, Filter, Star, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import styles from './QuickFilters.module.scss';

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

interface QuickFiltersProps {
  filters: {
    ecoCertified?: boolean;
    newListings?: boolean;
    priceReduced?: boolean;
    featured?: boolean;
    withReviews?: boolean;
    withContact?: boolean;
  };
  onFilterChange: (filterId: string, value: boolean) => void;
  totalEcoProperties?: number;
  totalWithReviews?: number;
  totalWithContact?: number;
}

const QuickFilters = memo(function QuickFilters({ 
  filters, 
  onFilterChange, 
  totalEcoProperties,
  totalWithReviews,
  totalWithContact 
}: QuickFiltersProps) {
  const quickFilters: QuickFilter[] = [
    {
      id: 'ecoCertified',
      label: 'Éco-certifié',
      icon: <Leaf className="h-4 w-4" />,
      color: 'emerald',
      active: filters.ecoCertified || false,
      onClick: () => onFilterChange('ecoCertified', !filters.ecoCertified),
      count: totalEcoProperties,
    },
    {
      id: 'newListings',
      label: 'Nouveautés',
      icon: <Sparkles className="h-4 w-4" />,
      color: 'blue',
      active: filters.newListings || false,
      onClick: () => onFilterChange('newListings', !filters.newListings),
    },
    {
      id: 'priceReduced',
      label: 'Prix réduits',
      icon: <TrendingDown className="h-4 w-4" />,
      color: 'red',
      active: filters.priceReduced || false,
      onClick: () => onFilterChange('priceReduced', !filters.priceReduced),
    },
    {
      id: 'featured',
      label: 'À la une',
      icon: <Home className="h-4 w-4" />,
      color: 'purple',
      active: filters.featured || false,
      onClick: () => onFilterChange('featured', !filters.featured),
    },
    {
      id: 'withReviews',
      label: 'Avec avis',
      icon: <Star className="h-4 w-4" />,
      color: 'yellow',
      active: filters.withReviews || false,
      onClick: () => onFilterChange('withReviews', !filters.withReviews),
      count: totalWithReviews,
    },
    {
      id: 'withContact',
      label: 'Avec contact',
      icon: <Phone className="h-4 w-4" />,
      color: 'primary',
      active: filters.withContact || false,
      onClick: () => onFilterChange('withContact', !filters.withContact),
      count: totalWithContact,
    },
  ];

  const getButtonStyles = (filter: QuickFilter) => {
    const baseStyles = 'flex items-center gap-2 rounded-full border-2 transition-all duration-200 h-9 px-4 text-sm font-semibold';
    const colorMap: Record<string, { active: string; inactive: string }> = {
      emerald: {
        active: 'bg-viridial-50 border-viridial-300 text-viridial-700 hover:bg-viridial-100 shadow-sm',
        inactive: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
      },
      blue: {
        active: 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 shadow-sm',
        inactive: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
      },
      red: {
        active: 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100 shadow-sm',
        inactive: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
      },
      purple: {
        active: 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100 shadow-sm',
        inactive: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
      },
      yellow: {
        active: 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100 shadow-sm',
        inactive: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
      },
      primary: {
        active: 'bg-primary/10 border-primary text-primary hover:bg-primary/20 shadow-sm',
        inactive: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
      },
    };

    return `${baseStyles} ${filter.active ? colorMap[filter.color]?.active || colorMap.primary.active : colorMap[filter.color]?.inactive || colorMap.primary.inactive}`;
  };

  return (
    <div className={styles.quickFilters}>
      <div className={styles.quickFiltersLabel}>
        <Filter className={styles.labelIcon} />
        <span className={styles.labelText}>Filtres rapides</span>
      </div>
      {quickFilters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={filter.onClick}
          className={`${styles.quickFilterButton} ${styles[filter.color]} ${filter.active ? styles.active : ''}`}
        >
          <span className={styles.filterIcon}>{filter.icon}</span>
          <span className={styles.filterLabel}>{filter.label}</span>
          {filter.count !== undefined && filter.count > 0 && (
            <Badge className={`${styles.filterCount} ${styles[filter.color]}`}>
              {filter.count}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
});

export default QuickFilters;
