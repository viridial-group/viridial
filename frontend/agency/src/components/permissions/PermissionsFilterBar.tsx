'use client';

import { useState, useEffect } from 'react';
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
import type { PermissionFilters, Permission } from '@/types/admin';
import { resourceApi } from '@/lib/resource-api';
import type { Resource } from '@/types/admin';

interface PermissionsFilterBarProps {
  filters: PermissionFilters;
  onFilterChange: (filters: PermissionFilters) => void;
  permissions: Permission[]; // To extract unique resources and actions
}

export function PermissionsFilterBar({ filters, onFilterChange, permissions }: PermissionsFilterBarProps) {
  const t = useTranslations('admin.permissions');
  const [resources, setResources] = useState<Resource[]>([]);

  // Load resources for filter dropdown
  useEffect(() => {
    resourceApi.getAll().then(setResources).catch(console.error);
  }, []);

  const handleFilterChange = (key: keyof PermissionFilters, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value === 'all' || value === '' ? undefined : value };
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    onFilterChange({
      search: '',
      resourceId: undefined,
      resource: undefined,
      action: undefined,
    });
  };

  // Extract unique resources and actions from permissions
  const uniqueResources = Array.from(new Set(permissions.map(p => p.resource))).sort();
  const uniqueActions = Array.from(new Set(permissions.map(p => p.action))).sort();

  const activeFilters = [
    filters.search && `${t('filters.search')}: ${filters.search}`,
    filters.resource && `${t('filters.resource')}: ${filters.resource}`,
    filters.action && `${t('filters.action')}: ${filters.action}`,
  ].filter(Boolean) as string[];

  const removeFilter = (filterToRemove: string) => {
    const searchLabel = `${t('filters.search')}:`;
    const resourceLabel = `${t('filters.resource')}:`;
    const actionLabel = `${t('filters.action')}:`;
    
    if (filterToRemove.startsWith(searchLabel)) {
      handleFilterChange('search', '');
    } else if (filterToRemove.startsWith(resourceLabel)) {
      handleFilterChange('resource', undefined);
    } else if (filterToRemove.startsWith(actionLabel)) {
      handleFilterChange('action', undefined);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      {/* Main Filter Row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('filters.searchPlaceholder') || 'Search permissions...'}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9 h-9 text-sm border-gray-200"
          />
        </div>
        
        {uniqueResources.length > 0 && (
          <Select
            value={filters.resource || 'all'}
            onValueChange={(value) => handleFilterChange('resource', value)}
          >
            <SelectTrigger className="w-48 h-9 text-sm border-gray-200">
              <SelectValue placeholder={t('filters.allResources') || 'All Resources'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allResources') || 'All Resources'}</SelectItem>
              {uniqueResources.map((resource) => (
                <SelectItem key={resource} value={resource}>
                  {resource}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {uniqueActions.length > 0 && (
          <Select
            value={filters.action || 'all'}
            onValueChange={(value) => handleFilterChange('action', value)}
          >
            <SelectTrigger className="w-40 h-9 text-sm border-gray-200">
              <SelectValue placeholder={t('filters.allActions') || 'All Actions'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allActions') || 'All Actions'}</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-9 text-xs text-gray-600 hover:text-gray-900"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            {t('filters.reset') || 'Reset'}
          </Button>
        )}
      </div>

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="pt-3 mt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500">{t('filters.activeFilters') || 'Active filters'}:</span>
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

