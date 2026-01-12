'use client';

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
import { Search, X, RotateCcw } from 'lucide-react';

export interface RoleFilters {
  search?: string;
  isActive?: boolean;
}

interface RolesFilterBarProps {
  filters: RoleFilters;
  onFilterChange: (filters: RoleFilters) => void;
}

export function RolesFilterBar({ filters, onFilterChange }: RolesFilterBarProps) {
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');

  const handleFilterChange = (key: keyof RoleFilters, value: string | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value === 'all' || value === '' ? undefined : value };
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    onFilterChange({
      search: '',
      isActive: undefined,
    });
  };

  const activeFilters = [
    filters.search && `${tCommon('search')}: ${filters.search}`,
    filters.isActive !== undefined && `${t('status')}: ${filters.isActive ? t('active') : t('inactive')}`,
  ].filter(Boolean) as string[];

  const removeFilter = (filterToRemove: string) => {
    const searchLabel = `${tCommon('search')}:`;
    const statusLabel = `${t('status')}:`;
    
    if (filterToRemove.startsWith(searchLabel)) {
      handleFilterChange('search', '');
    } else if (filterToRemove.startsWith(statusLabel)) {
      handleFilterChange('isActive', undefined);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      {/* Main Filter Row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('searchPlaceholder') || 'Search by name or description...'}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9 h-9 text-sm border-gray-200"
          />
        </div>
        
        <Select
          value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
          onValueChange={(value) => {
            if (value === 'all') {
              handleFilterChange('isActive', undefined);
            } else {
              handleFilterChange('isActive', value === 'active');
            }
          }}
        >
          <SelectTrigger className="w-40 h-9 text-sm border-gray-200">
            <SelectValue placeholder={t('filterByStatus') || 'Filter by status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses') || 'All Statuses'}</SelectItem>
            <SelectItem value="active">{t('active') || 'Active'}</SelectItem>
            <SelectItem value="inactive">{t('inactive') || 'Inactive'}</SelectItem>
          </SelectContent>
        </Select>

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

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="pt-3 mt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500">{tCommon('activeFilters') || 'Active filters'}:</span>
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

