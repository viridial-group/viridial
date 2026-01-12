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

export interface FilterState {
  search: string;
  plan: string;
  status: string;
  minUsers: string;
  maxUsers: string;
  country: string;
  city: string;
}

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const t = useTranslations();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    plan: 'all',
    status: 'all',
    minUsers: '',
    maxUsers: '',
    country: 'all',
    city: 'all',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      search: '',
      plan: 'all',
      status: 'all',
      minUsers: '',
      maxUsers: '',
      country: 'all',
      city: 'all',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const activeFilters = [
    filters.search && `${t('common.search')}: ${filters.search}`,
    filters.plan !== 'all' && `${t('organizations.plan')}: ${t(`organizations.plans.${filters.plan}`)}`,
    filters.status !== 'all' && `${t('organizations.status')}: ${t(`common.${filters.status}`)}`,
    filters.country !== 'all' && `${t('organizations.country')}: ${filters.country}`,
    filters.city !== 'all' && filters.city && `${t('organizations.city')}: ${filters.city}`,
    filters.minUsers && `${t('organizations.minUsers')}: ${filters.minUsers}`,
    filters.maxUsers && `${t('organizations.maxUsers')}: ${filters.maxUsers}`,
  ].filter(Boolean) as string[];

  const removeFilter = (filterToRemove: string) => {
    const searchLabel = `${t('common.search')}:`;
    const planLabel = `${t('organizations.plan')}:`;
    const statusLabel = `${t('organizations.status')}:`;
    const countryLabel = `${t('organizations.country')}:`;
    const cityLabel = `${t('organizations.city')}:`;
    const minUsersLabel = `${t('organizations.minUsers')}:`;
    const maxUsersLabel = `${t('organizations.maxUsers')}:`;
    
    if (filterToRemove.startsWith(searchLabel)) {
      handleFilterChange('search', '');
    } else if (filterToRemove.startsWith(planLabel)) {
      handleFilterChange('plan', 'all');
    } else if (filterToRemove.startsWith(statusLabel)) {
      handleFilterChange('status', 'all');
    } else if (filterToRemove.startsWith(countryLabel)) {
      handleFilterChange('country', 'all');
    } else if (filterToRemove.startsWith(cityLabel)) {
      handleFilterChange('city', 'all');
    } else if (filterToRemove.startsWith(minUsersLabel)) {
      handleFilterChange('minUsers', '');
    } else if (filterToRemove.startsWith(maxUsersLabel)) {
      handleFilterChange('maxUsers', '');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      {/* Main Filter Row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('organizations.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9 h-9 text-sm border-gray-200"
          />
        </div>
        
        <Select
          value={filters.plan}
          onValueChange={(value) => handleFilterChange('plan', value)}
        >
          <SelectTrigger className="w-40 h-9 text-sm border-gray-200">
            <SelectValue placeholder={t('organizations.plan')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('organizations.allPlans')}</SelectItem>
            <SelectItem value="free">{t('organizations.plans.free')}</SelectItem>
            <SelectItem value="basic">{t('organizations.plans.basic')}</SelectItem>
            <SelectItem value="professional">{t('organizations.plans.professional')}</SelectItem>
            <SelectItem value="enterprise">{t('organizations.plans.enterprise')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-40 h-9 text-sm border-gray-200">
            <SelectValue placeholder={t('organizations.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('organizations.allStatuses')}</SelectItem>
            <SelectItem value="active">{t('common.active')}</SelectItem>
            <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-9 gap-2 border-gray-300"
        >
          <Filter className="h-3.5 w-3.5" />
          {t('organizations.moreFilters')}
        </Button>

        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-9 text-xs text-gray-600 hover:text-gray-900"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            {t('common.reset')}
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="pt-3 border-t border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                {t('organizations.country')}
              </label>
              <Select
                value={filters.country}
                onValueChange={(value) => handleFilterChange('country', value)}
              >
                <SelectTrigger className="h-9 text-sm border-gray-200">
                  <SelectValue placeholder={t('organizations.allCountries')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('organizations.allCountries')}</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Belgium">Belgium</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                {t('organizations.city')}
              </label>
              <Input
                type="text"
                placeholder={t('organizations.searchCity')}
                value={filters.city === 'all' ? '' : filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value || 'all')}
                className="h-9 text-sm border-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                {t('organizations.minUsers')}
              </label>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minUsers}
                onChange={(e) => handleFilterChange('minUsers', e.target.value)}
                className="h-9 text-sm border-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                {t('organizations.maxUsers')}
              </label>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxUsers}
                onChange={(e) => handleFilterChange('maxUsers', e.target.value)}
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
            <span className="text-xs font-medium text-gray-500">{t('organizations.activeFilters')}:</span>
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

