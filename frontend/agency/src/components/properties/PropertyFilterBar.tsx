'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, RotateCcw, Filter } from 'lucide-react';
import { PropertyStatus, PropertyType } from '@/types/property';

export interface PropertyFilterState {
  search: string;
  status: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  country: string;
  city: string;
}

interface PropertyFilterBarProps {
  onFilterChange: (filters: PropertyFilterState) => void;
}

export function PropertyFilterBar({ onFilterChange }: PropertyFilterBarProps) {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  const [filters, setFilters] = useState<PropertyFilterState>({
    search: '',
    status: 'all',
    type: 'all',
    minPrice: '',
    maxPrice: '',
    country: '',
    city: '',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof PropertyFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: PropertyFilterState = {
      search: '',
      status: 'all',
      type: 'all',
      minPrice: '',
      maxPrice: '',
      country: '',
      city: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const activeFilters = [
    filters.search && `${tCommon('search')}: ${filters.search}`,
    filters.status !== 'all' && `${t('form.status')}: ${t(`status.${filters.status}`)}`,
    filters.type !== 'all' && `${t('form.type')}: ${t(`type.${filters.type}`)}`,
    filters.country && `${t('filters.country')}: ${filters.country}`,
    filters.city && `${t('filters.city')}: ${filters.city}`,
    filters.minPrice && `${t('filters.minPrice')}: ${filters.minPrice}`,
    filters.maxPrice && `${t('filters.maxPrice')}: ${filters.maxPrice}`,
  ].filter(Boolean) as string[];

  const removeFilter = (filterToRemove: string) => {
    const searchLabel = `${tCommon('search')}:`;
    const statusLabel = `${t('form.status')}:`;
    const typeLabel = `${t('form.type')}:`;
    const countryLabel = `${t('filters.country')}:`;
    const cityLabel = `${t('filters.city')}:`;
    const minPriceLabel = `${t('filters.minPrice')}:`;
    const maxPriceLabel = `${t('filters.maxPrice')}:`;
    
    if (filterToRemove.startsWith(searchLabel)) {
      handleFilterChange('search', '');
    } else if (filterToRemove.startsWith(statusLabel)) {
      handleFilterChange('status', 'all');
    } else if (filterToRemove.startsWith(typeLabel)) {
      handleFilterChange('type', 'all');
    } else if (filterToRemove.startsWith(countryLabel)) {
      handleFilterChange('country', '');
    } else if (filterToRemove.startsWith(cityLabel)) {
      handleFilterChange('city', '');
    } else if (filterToRemove.startsWith(minPriceLabel)) {
      handleFilterChange('minPrice', '');
    } else if (filterToRemove.startsWith(maxPriceLabel)) {
      handleFilterChange('maxPrice', '');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      {/* Main Filter Row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('searchPlaceholder') || 'Search properties...'}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9 h-9 text-sm border-gray-200"
          />
        </div>
        
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-40 h-9 text-sm border-gray-200">
            <SelectValue placeholder={t('form.status') || 'Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon('all') || 'All'}</SelectItem>
            <SelectItem value={PropertyStatus.DRAFT}>{t(`status.${PropertyStatus.DRAFT}`) || 'Draft'}</SelectItem>
            <SelectItem value={PropertyStatus.REVIEW}>{t(`status.${PropertyStatus.REVIEW}`) || 'Review'}</SelectItem>
            <SelectItem value={PropertyStatus.LISTED}>{t(`status.${PropertyStatus.LISTED}`) || 'Listed'}</SelectItem>
            <SelectItem value={PropertyStatus.FLAGGED}>{t(`status.${PropertyStatus.FLAGGED}`) || 'Flagged'}</SelectItem>
            <SelectItem value={PropertyStatus.ARCHIVED}>{t(`status.${PropertyStatus.ARCHIVED}`) || 'Archived'}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value) => handleFilterChange('type', value)}
        >
          <SelectTrigger className="w-40 h-9 text-sm border-gray-200">
            <SelectValue placeholder={t('form.type') || 'Type'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon('all') || 'All'}</SelectItem>
            <SelectItem value={PropertyType.HOUSE}>{t(`type.${PropertyType.HOUSE}`) || 'House'}</SelectItem>
            <SelectItem value={PropertyType.APARTMENT}>{t(`type.${PropertyType.APARTMENT}`) || 'Apartment'}</SelectItem>
            <SelectItem value={PropertyType.VILLA}>{t(`type.${PropertyType.VILLA}`) || 'Villa'}</SelectItem>
            <SelectItem value={PropertyType.LAND}>{t(`type.${PropertyType.LAND}`) || 'Land'}</SelectItem>
            <SelectItem value={PropertyType.COMMERCIAL}>{t(`type.${PropertyType.COMMERCIAL}`) || 'Commercial'}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-9 gap-2 border-gray-300"
        >
          <Filter className="h-3.5 w-3.5" />
          {t('filters.more') || 'More Filters'}
        </Button>

        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-9 text-xs text-gray-600 hover:text-gray-900"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            {tCommon('reset') || 'Reset'}
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="pt-3 border-t border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                {t('filters.country') || 'Country'}
              </label>
              <Input
                type="text"
                placeholder={t('filters.countryPlaceholder') || 'Country code (FR, US, etc.)'}
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="h-9 text-sm border-gray-200"
                maxLength={2}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                {t('filters.city') || 'City'}
              </label>
              <Input
                type="text"
                placeholder={t('filters.cityPlaceholder') || 'City name'}
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="h-9 text-sm border-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                {t('filters.minPrice') || 'Min Price'}
              </label>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="h-9 text-sm border-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                {t('filters.maxPrice') || 'Max Price'}
              </label>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="h-9 text-sm border-gray-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500">{t('filters.active') || 'Active filters'}:</span>
            {activeFilters.map((filter, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer gap-1 text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 border-gray-200"
                onClick={() => removeFilter(filter)}
              >
                {filter}
                <X className="h-2.5 w-2.5" />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

