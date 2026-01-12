'use client';

import { useState, useMemo, memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Property, PropertyStatus, PropertyType } from '@/types/property';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Home, MapPin, Euro, MoreVertical, Edit, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export type SortField = 'title' | 'type' | 'price' | 'status' | 'city' | 'createdAt' | 'updatedAt' | null;
export type SortDirection = 'asc' | 'desc' | null;

interface PropertyTableProps {
  properties: Property[];
  selectedIds?: Set<string>;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  onSelectAll?: (checked: boolean) => void;
  onToggleSelection?: (propertyId: string) => void;
  onView?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  onFavorite?: (property: Property) => void;
  favoritedIds?: Set<string>;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
  currentLanguage?: string;
}

const statusColors: Record<PropertyStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  review: 'bg-yellow-100 text-yellow-700',
  listed: 'bg-green-100 text-green-700',
  flagged: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
};

const statusIcons: Record<PropertyStatus, typeof CheckCircle2> = {
  draft: Clock,
  review: Clock,
  listed: CheckCircle2,
  flagged: AlertTriangle,
  archived: XCircle,
};

const typeLabels: Record<PropertyType, string> = {
  house: 'Maison',
  apartment: 'Appartement',
  villa: 'Villa',
  land: 'Terrain',
  commercial: 'Commercial',
  other: 'Autre',
};

export const PropertyTable = memo(function PropertyTable({ 
  properties, 
  selectedIds = new Set(),
  isAllSelected = false,
  isIndeterminate = false,
  onSelectAll,
  onToggleSelection,
  onView, 
  onEdit, 
  onDelete,
  onFavorite,
  favoritedIds = new Set(),
  sortField: externalSortField,
  sortDirection: externalSortDirection,
  onSort: externalOnSort,
  currentLanguage = 'fr',
}: PropertyTableProps) {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  const [internalSortField, setInternalSortField] = useState<SortField>(null);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(null);
  
  const sortField = externalSortField ?? internalSortField;
  const sortDirection = externalSortDirection ?? internalSortDirection;
  const handleSort = externalOnSort ?? ((field: SortField, direction: SortDirection) => {
    setInternalSortField(field);
    setInternalSortDirection(direction);
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const sortedProperties = useMemo(() => {
    if (!sortField || !sortDirection) return properties;

    const sorted = [...properties].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          const aTranslation = a.translations?.find(t => t.language.startsWith(currentLanguage)) || a.translations?.[0];
          const bTranslation = b.translations?.find(t => t.language.startsWith(currentLanguage)) || b.translations?.[0];
          aValue = (aTranslation?.title || '').toLowerCase();
          bValue = (bTranslation?.title || '').toLowerCase();
          break;
        case 'type':
          const typeOrder = { house: 0, apartment: 1, villa: 2, land: 3, commercial: 4, other: 5 };
          aValue = typeOrder[a.type as keyof typeof typeOrder] ?? 999;
          bValue = typeOrder[b.type as keyof typeof typeOrder] ?? 999;
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'status':
          const statusOrder = { draft: 0, review: 1, listed: 2, flagged: 3, archived: 4 };
          aValue = statusOrder[a.status] ?? 999;
          bValue = statusOrder[b.status] ?? 999;
          break;
        case 'city':
          aValue = (a.city || '').toLowerCase();
          bValue = (b.city || '').toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [properties, sortField, sortDirection, currentLanguage]);

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle: asc -> desc -> null
      if (sortDirection === 'asc') {
        handleSort(field, 'desc');
      } else if (sortDirection === 'desc') {
        handleSort(null, null);
      } else {
        handleSort(field, 'asc');
      }
    } else {
      handleSort(field, 'asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3.5 w-3.5 text-viridial-600" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-3.5 w-3.5 text-viridial-600" />;
    }
    return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="relative overflow-x-auto bg-gray-50/30">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100/80 border-b border-gray-200 hover:bg-gray-100/80">
              <TableHead className="w-12 border-r border-gray-200">
                {onSelectAll && (
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onCheckedChange={onSelectAll}
                  />
                )}
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('title')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('form.title') || 'Property'}
                  {getSortIcon('title')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('type')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('form.type') || 'Type'}
                  {getSortIcon('type')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('price')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('form.price') || 'Price'}
                  {getSortIcon('price')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('city')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('location') || 'Location'}
                  {getSortIcon('city')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('status')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('form.status') || 'Status'}
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('updatedAt')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('updatedAt') || 'Updated'}
                  {getSortIcon('updatedAt')}
                </Button>
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-700">{tCommon('actions') || 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProperties.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="text-center text-gray-500 py-12 bg-white">
                  {t('noProperties') || 'No properties found'}
                </TableCell>
              </TableRow>
            ) : (
              sortedProperties.map((property, index) => {
                const translation = property.translations?.find(t => t.language.startsWith(currentLanguage)) 
                  || property.translations?.[0];
                const StatusIcon = statusIcons[property.status];
                const mainImage = property.mediaUrls && property.mediaUrls.length > 0 ? property.mediaUrls[0] : null;
                const isFavorited = favoritedIds.has(property.id);

                return (
                  <TableRow 
                    key={property.id} 
                    className={cn(
                      'border-b border-gray-200 transition-colors',
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
                      selectedIds.has(property.id) && 'bg-viridial-50/50 ring-1 ring-viridial-200',
                      'hover:bg-gray-100/70'
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="py-3 border-r border-gray-200">
                      {onToggleSelection && (
                        <Checkbox
                          checked={selectedIds.has(property.id)}
                          onCheckedChange={() => onToggleSelection(property.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </TableCell>
                    <TableCell className="py-3 border-r border-gray-200">
                      <div className="flex items-center gap-3">
                        {mainImage ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={mainImage}
                              alt={translation?.title || 'Property'}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                            <Home className="h-4 w-4 text-viridial-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {translation?.title || t('noTitle') || 'No title'}
                          </div>
                          {property.details?.bedrooms && property.details?.bathrooms && (
                            <div className="text-xs text-gray-500">
                              {property.details.bedrooms} {t('bedrooms') || 'bed'} · {property.details.bathrooms} {t('bathrooms') || 'bath'}
                            </div>
                          )}
                          {property.details?.surfaceArea && (
                            <div className="text-xs text-gray-400">
                              {property.details.surfaceArea} m²
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 border-r border-gray-200">
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[property.type] || property.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 border-r border-gray-200">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-viridial-600">
                        <Euro className="h-3.5 w-3.5 text-viridial-500" />
                        <span>
                          {new Intl.NumberFormat(currentLanguage === 'fr' ? 'fr-FR' : 'en-US', {
                            style: 'currency',
                            currency: property.currency || 'EUR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(property.price)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 border-r border-gray-200">
                      {(property.city || property.country) && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span className="truncate">
                            {[property.city, property.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3 border-r border-gray-200">
                      <Badge className={cn('text-xs px-2 py-0.5 gap-1', statusColors[property.status])}>
                        <StatusIcon className="h-3 w-3" />
                        {t(`status.${property.status}`) || property.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-600 border-r border-gray-200">
                      {formatDate(property.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex items-center justify-end gap-1">
                        {onFavorite && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onFavorite(property)}
                            className={cn(
                              'h-8 w-8',
                              isFavorited && 'text-red-600'
                            )}
                            title={isFavorited ? t('removeFromFavorites') || 'Remove from favorites' : t('addToFavorites') || 'Add to favorites'}
                          >
                            <svg
                              className={cn('h-3.5 w-3.5', isFavorited && 'fill-current')}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </Button>
                        )}
                        {onView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(property)}
                            className="h-8 w-8"
                            title={tCommon('view') || 'View'}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(property)}
                            className="h-8 w-8"
                            title={tCommon('edit') || 'Edit'}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(property)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title={tCommon('delete') || 'Delete'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  const propertiesChanged = 
    prevProps.properties.length !== nextProps.properties.length ||
    prevProps.properties.some((prop, idx) => {
      const nextProp = nextProps.properties[idx];
      return !nextProp || prop.id !== nextProp.id || prop.updatedAt !== nextProp.updatedAt;
    });

  const prevSelectedIds = prevProps.selectedIds || new Set();
  const nextSelectedIds = nextProps.selectedIds || new Set();
  const selectionsChanged = 
    prevSelectedIds.size !== nextSelectedIds.size ||
    Array.from(prevSelectedIds).some(id => !nextSelectedIds.has(id));

  const prevFavoritedIds = prevProps.favoritedIds || new Set();
  const nextFavoritedIds = nextProps.favoritedIds || new Set();
  const favoritesChanged = 
    prevFavoritedIds.size !== nextFavoritedIds.size ||
    Array.from(prevFavoritedIds).some(id => !nextFavoritedIds.has(id));

  const sortChanged = 
    prevProps.sortField !== nextProps.sortField ||
    prevProps.sortDirection !== nextProps.sortDirection;

  return !propertiesChanged && !selectionsChanged && !favoritesChanged && !sortChanged &&
    prevProps.isAllSelected === nextProps.isAllSelected &&
    prevProps.isIndeterminate === nextProps.isIndeterminate;
});

