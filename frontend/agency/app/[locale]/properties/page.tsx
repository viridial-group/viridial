'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { propertyApi, PropertyApiError } from '@/lib/property-api';
import { Property, PropertyFilters, PropertyStatus, PropertyType } from '@/types/property';
import dynamic from 'next/dynamic';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyStatsCards } from '@/components/properties/PropertyStatsCards';
import { PropertyFilterBar, PropertyFilterState } from '@/components/properties/PropertyFilterBar';
import { PropertyBulkActions } from '@/components/properties/PropertyBulkActions';
import { PropertyTable, SortField, SortDirection } from '@/components/properties/PropertyTable';
import { AgencyLayout } from '@/components/layout/AgencyLayout';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Grid3x3, List, Download, FileText, FileJson } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { exportToCSV, exportToJSON, exportToExcel } from '@/utils/export';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

// Lazy load modals
const CreatePropertyModal = dynamic(() => import('@/components/properties/CreatePropertyModal').then(mod => ({ default: mod.CreatePropertyModal })), {
  loading: () => null,
  ssr: false,
});

const EditPropertyModal = dynamic(() => import('@/components/properties/EditPropertyModal').then(mod => ({ default: mod.EditPropertyModal })), {
  loading: () => null,
  ssr: false,
});

export default function PropertiesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const scrollableAreaRef = useRef<HTMLDivElement>(null);

  // State
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [favoritedProperties, setFavoritedProperties] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState('25');
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterState, setFilterState] = useState<PropertyFilterState>({
    search: '',
    status: 'all',
    type: 'all',
    minPrice: '',
    maxPrice: '',
    country: '',
    city: '',
  });

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  // Handle wheel event on fixed section to redirect scroll to scrollable area
  const handleFixedSectionWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollableAreaRef.current) {
      e.preventDefault();
      scrollableAreaRef.current.scrollTop += e.deltaY;
    }
  };

  // Load favorite statuses
  const loadFavoriteStatuses = useCallback(async () => {
    if (!user) return;
    
    try {
      const favorites = await propertyApi.getUserFavorites();
      setFavoritedProperties(new Set(favorites.map(f => f.propertyId)));
    } catch (error) {
      // User might not be authenticated or no favorites, ignore
      console.error('Error loading favorites:', error);
    }
  }, [user]);

  // Convert filter state to API filters
  const filterStateToApiFilters = useCallback((state: PropertyFilterState): PropertyFilters => {
    const apiFilters: PropertyFilters = {
      limit: parseInt(rowsPerPage) || 25,
      offset: 0,
      sortBy: 'updatedAt',
      sortOrder: 'DESC',
    };

    if (state.search) {
      apiFilters.search = state.search;
    }
    if (state.status !== 'all') {
      apiFilters.status = state.status as PropertyStatus;
    }
    if (state.type !== 'all') {
      apiFilters.type = state.type as PropertyType;
    }
    if (state.minPrice) {
      apiFilters.minPrice = parseFloat(state.minPrice);
    }
    if (state.maxPrice) {
      apiFilters.maxPrice = parseFloat(state.maxPrice);
    }
    if (state.country) {
      apiFilters.country = state.country;
    }
    if (state.city) {
      apiFilters.city = state.city;
    }
    if (user?.id) {
      apiFilters.userId = user.id;
    }

    // Apply sorting
    if (sortField && sortDirection) {
      const sortFieldMap: Record<NonNullable<SortField>, string> = {
        title: 'title',
        type: 'type',
        price: 'price',
        status: 'status',
        city: 'city',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      };
      apiFilters.sortBy = sortFieldMap[sortField] || 'updatedAt';
      apiFilters.sortOrder = sortDirection.toUpperCase() as 'ASC' | 'DESC';
    }

    return apiFilters;
  }, [rowsPerPage, sortField, sortDirection, user?.id]);

  // Load properties
  const loadProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = filterStateToApiFilters(filterState);
      const response = await propertyApi.getAll(apiFilters);
      setProperties(response.properties || []);
      setTotal(response.total || 0);
      
      // Load favorite statuses after properties are loaded
      await loadFavoriteStatuses();
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load properties');
      toast({
        variant: 'error',
        title: t('errors.loadFailed') || 'Failed to load properties',
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filterState, filterStateToApiFilters, loadFavoriteStatuses, toast, t]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties, refreshKey]);

  // Handle creating a new property
  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false);
    setRefreshKey((prev) => prev + 1);
    setSelectedProperties(new Set());
    toast({
      variant: 'success',
      title: t('created') || 'Property created successfully',
      description: t('propertyCreated') || 'Property has been created successfully.',
    });
  }, [toast, t]);

  // Handle editing a property
  const handleEditSuccess = useCallback(() => {
    setEditingProperty(null);
    setRefreshKey((prev) => prev + 1);
    toast({
      variant: 'success',
      title: t('updated') || 'Property updated successfully',
      description: t('propertyUpdated') || 'Property has been updated successfully.',
    });
  }, [toast, t]);

  // Handle property selection
  const handleToggleSelection = useCallback((propertyId: string) => {
    setSelectedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedProperties(new Set(properties.map((prop) => prop.id)));
    } else {
      setSelectedProperties(new Set());
    }
  }, [properties]);

  const isAllSelected = properties.length > 0 && properties.every((prop) => selectedProperties.has(prop.id));
  const isIndeterminate = properties.some((prop) => selectedProperties.has(prop.id)) && !isAllSelected;

  // Handle bulk actions
  const handleBulkDelete = async () => {
    const selectedIds = Array.from(selectedProperties);
    if (window.confirm(t('bulkActions.deleteConfirm', { count: selectedIds.length }) || `Are you sure you want to delete ${selectedIds.length} property(ies)?`)) {
      setIsProcessing(true);
      try {
        await propertyApi.bulkDelete({
          propertyIds: selectedIds,
          hardDelete: false,
        });
        setRefreshKey((prev) => prev + 1);
        setSelectedProperties(new Set());
        
        toast({
          variant: 'success',
          title: t('deleted') || 'Properties deleted successfully',
          description: t('propertiesDeleted', { count: selectedIds.length }) || `${selectedIds.length} property(ies) have been deleted successfully.`,
        });
      } catch (error) {
        toast({
          variant: 'error',
          title: t('errors.deleteFailed') || 'Failed to delete properties',
          description: error instanceof Error ? error.message : t('errors.unexpectedError') || 'An unexpected error occurred.',
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBulkPublish = () => {
    const selectedIds = Array.from(selectedProperties);
    if (window.confirm(t('bulkActions.publishConfirm', { count: selectedIds.length }) || `Are you sure you want to publish ${selectedIds.length} property(ies)?`)) {
      setIsProcessing(true);
      Promise.all(selectedIds.map(id => propertyApi.publish(id)))
        .then(() => {
          setRefreshKey((prev) => prev + 1);
          setSelectedProperties(new Set());
          toast({
            variant: 'success',
            title: t('published') || 'Properties published successfully',
            description: t('propertiesPublished', { count: selectedIds.length }) || `${selectedIds.length} property(ies) have been published successfully.`,
          });
        })
        .catch((error) => {
          toast({
            variant: 'error',
            title: t('errors.publishFailed') || 'Failed to publish properties',
            description: error instanceof Error ? error.message : t('errors.unexpectedError') || 'An unexpected error occurred.',
          });
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }
  };

  const handleBulkArchive = () => {
    const selectedIds = Array.from(selectedProperties);
    if (window.confirm(t('bulkActions.archiveConfirm', { count: selectedIds.length }) || `Are you sure you want to archive ${selectedIds.length} property(ies)?`)) {
      setIsProcessing(true);
      propertyApi.bulkStatusUpdate({
        propertyIds: selectedIds,
        status: PropertyStatus.ARCHIVED,
      })
        .then(() => {
          setRefreshKey((prev) => prev + 1);
          setSelectedProperties(new Set());
          toast({
            variant: 'success',
            title: t('archived') || 'Properties archived successfully',
            description: t('propertiesArchived', { count: selectedIds.length }) || `${selectedIds.length} property(ies) have been archived successfully.`,
          });
        })
        .catch((error) => {
          toast({
            variant: 'error',
            title: t('errors.archiveFailed') || 'Failed to archive properties',
            description: error instanceof Error ? error.message : t('errors.unexpectedError') || 'An unexpected error occurred.',
          });
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }
  };

  const handleBulkExport = (format: 'csv' | 'json' | 'excel') => {
    const selectedIds = Array.from(selectedProperties);
    const selectedProps = properties.filter((prop) => selectedIds.includes(prop.id));
    
    if (selectedProps.length === 0) {
      toast({
        variant: 'warning',
        title: t('noSelection') || 'No properties selected',
        description: t('selectToExport') || 'Please select at least one property to export.',
      });
      return;
    }

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `properties_${timestamp}`;

      switch (format) {
        case 'csv':
          exportToCSV(selectedProps, `${filename}.csv`);
          break;
        case 'json':
          exportToJSON(selectedProps, `${filename}.json`);
          break;
        case 'excel':
          exportToExcel(selectedProps, `${filename}.xlsx`);
          break;
      }

      toast({
        variant: 'success',
        title: t('exported') || 'Export successful',
        description: t('exportedCount', { count: selectedProps.length, format: format.toUpperCase() }) || `${selectedProps.length} property(ies) exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        variant: 'error',
        title: t('errors.exportFailed') || 'Export failed',
        description: error instanceof Error ? error.message : t('errors.unexpectedError') || 'An unexpected error occurred.',
      });
    }
  };

  const handleClearSelection = useCallback(() => {
    setSelectedProperties(new Set());
  }, []);

  const handleSort = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  const handleView = useCallback((property: Property) => {
    router.push(`/properties/${property.id}`);
  }, [router]);

  const handleEdit = useCallback((property: Property) => {
    setEditingProperty(property);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setIsProcessing(true);
    try {
      await propertyApi.delete(id);
      toast({
        title: tCommon('success') || 'Success',
        description: t('deleted') || 'Property deleted successfully',
        variant: 'success',
      });
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof PropertyApiError 
          ? error.message 
          : t('errors.deleteFailed') || 'Failed to delete property',
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
      setConfirmDelete({ open: false, id: null });
    }
  }, [toast, tCommon, t]);

  const handleToggleFavorite = useCallback(async (property: Property) => {
    const isFavorited = favoritedProperties.has(property.id);
    
    try {
      if (isFavorited) {
        await propertyApi.removeFavorite(property.id);
        setFavoritedProperties(prev => {
          const next = new Set(prev);
          next.delete(property.id);
          return next;
        });
        toast({
          title: tCommon('success') || 'Success',
          description: t('removedFromFavorites') || 'Removed from favorites',
          variant: 'success',
        });
      } else {
        await propertyApi.addFavorite(property.id);
        setFavoritedProperties(prev => new Set(prev).add(property.id));
        toast({
          title: tCommon('success') || 'Success',
          description: t('addedToFavorites') || 'Added to favorites',
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof PropertyApiError 
          ? error.message 
          : t('errors.favoriteFailed') || 'Failed to update favorite',
        variant: 'error',
      });
    }
  }, [favoritedProperties, toast, tCommon, t]);

  // Sorting is now handled by the API, but we keep this for client-side fallback if needed
  const sortedFilteredProperties = properties;

  return (
    <AgencyLayout
      headerTitle={t('title') || 'Properties'}
      headerSubtitle={t('subtitle') || 'Manage your properties'}
      headerActions={
        <>
          <Button 
            className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-sm h-9 px-4"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            {t('addProperty') || 'Add Property'}
          </Button>
        </>
      }
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Fixed Top Section */}
        <div 
          className="flex-shrink-0 p-6 pb-4 space-y-4 overflow-hidden"
          onWheel={handleFixedSectionWheel}
        >
          {/* Stats Cards */}
          <PropertyStatsCards properties={properties} />

          {/* Filter Bar */}
          <PropertyFilterBar onFilterChange={setFilterState} />

          {/* Results Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{tCommon('rowsPerPage') || 'Rows per page'}:</span>
              <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
                <SelectTrigger className="w-20 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip content={t('gridViewTooltip') || 'Grid view'}>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`h-7 px-3 gap-1.5 transition-all duration-200 ease-out ${
                    viewMode === 'grid'
                      ? 'bg-viridial-600 hover:bg-viridial-700 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Grid3x3 className="h-3.5 w-3.5" />
                  {t('gridView') || 'Grid'}
                </Button>
              </Tooltip>
              <Tooltip content={t('tableViewTooltip') || 'Table view with sorting'}>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={`h-7 px-3 gap-1.5 transition-all duration-200 ease-out ${
                    viewMode === 'table'
                      ? 'bg-viridial-600 hover:bg-viridial-700 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  {t('tableView') || 'Table'}
                </Button>
              </Tooltip>
              {selectedProperties.size > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Tooltip content={t('exportSelected') || 'Export selected properties'}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t('export') || 'Export'}
                      </Button>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkExport('csv')}>
                      <FileText className="h-4 w-4 mr-2" />
                      {t('exportCSV') || 'Export as CSV'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkExport('json')}>
                      <FileJson className="h-4 w-4 mr-2" />
                      {t('exportJSON') || 'Export as JSON'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkExport('excel')}>
                      <FileText className="h-4 w-4 mr-2" />
                      {t('exportExcel') || 'Export as Excel'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <div className="text-sm text-gray-600">
                {tCommon('showing') || 'Showing'} 1 {tCommon('to') || 'to'} {Math.min(parseInt(rowsPerPage), sortedFilteredProperties.length)} {tCommon('of') || 'of'} {sortedFilteredProperties.length} {tCommon('results') || 'results'}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Results Area */}
        <div ref={scrollableAreaRef} className="flex-1 overflow-y-auto px-6 pb-4">
          {/* Bulk Actions */}
          {selectedProperties.size > 0 && (
            <PropertyBulkActions
              selectedCount={selectedProperties.size}
              onDelete={handleBulkDelete}
              onPublish={handleBulkPublish}
              onArchive={handleBulkArchive}
              onExport={() => handleBulkExport('csv')}
              onClearSelection={handleClearSelection}
              isLoading={isProcessing}
            />
          )}

          {/* Properties Display */}
          {isLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center animate-fade-in">
              <div className="text-gray-500 mb-2">{tCommon('loading') || 'Loading properties...'}</div>
            </div>
          ) : error ? (
            <div className="bg-white border border-red-200 rounded-lg p-12 text-center animate-fade-in">
              <div className="text-red-600 mb-2">{t('errors.loadFailed') || 'Failed to load properties'}</div>
              <div className="text-sm text-red-400">{error}</div>
            </div>
          ) : sortedFilteredProperties.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center animate-fade-in">
              <div className="text-gray-500 mb-2">{t('noProperties') || 'No properties found'}</div>
              <div className="text-sm text-gray-400">
                {t('tryFilters') || 'Try adjusting your filters or create a new property.'}
              </div>
            </div>
          ) : (
            <div className="transition-all duration-300 ease-out">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                  {sortedFilteredProperties.map((property: Property, index) => (
                    <div
                      key={property.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <PropertyCard
                        property={property}
                        isSelected={selectedProperties.has(property.id)}
                        isFavorited={favoritedProperties.has(property.id)}
                        onSelect={() => handleToggleSelection(property.id)}
                        onView={() => handleView(property)}
                        onEdit={() => handleEdit(property)}
                        onDelete={() => setConfirmDelete({ open: true, id: property.id })}
                        onFavorite={() => handleToggleFavorite(property)}
                        currentLanguage="fr"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="animate-fade-in">
                  <PropertyTable
                    properties={sortedFilteredProperties}
                    selectedIds={selectedProperties}
                    isAllSelected={isAllSelected}
                    isIndeterminate={isIndeterminate}
                    onSelectAll={handleSelectAll}
                    onToggleSelection={handleToggleSelection}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={(prop) => setConfirmDelete({ open: true, id: prop.id })}
                    onFavorite={handleToggleFavorite}
                    favoritedIds={favoritedProperties}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    currentLanguage="fr"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Pagination */}
        {properties.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {tCommon('showing') || 'Showing'} 1 {tCommon('to') || 'to'} {Math.min(parseInt(rowsPerPage), sortedFilteredProperties.length)} {tCommon('of') || 'of'} {sortedFilteredProperties.length} {tCommon('results') || 'results'}
              </div>
              <div className="flex items-center gap-1">
                <Tooltip content={tCommon('previousPage') || 'Previous page'}>
                  <Button variant="outline" size="sm" disabled className="h-8 px-3">
                    ←
                  </Button>
                </Tooltip>
                <Button variant="outline" size="sm" className="h-8 px-3 bg-viridial-50 border-viridial-300 text-viridial-700 font-medium">
                  1
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  2
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  3
                </Button>
                <Tooltip content={tCommon('nextPage') || 'Next page'}>
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    →
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Property Modal */}
      <CreatePropertyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Property Modal */}
      {editingProperty && (
        <EditPropertyModal
          isOpen={!!editingProperty}
          onClose={() => setEditingProperty(null)}
          onSuccess={handleEditSuccess}
          property={editingProperty}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open, id: confirmDelete.id })}
        title={t('confirmDelete.title') || 'Delete Property'}
        description={t('confirmDelete.description') || 'Are you sure you want to delete this property? This action cannot be undone.'}
        variant="danger"
        confirmText={tCommon('delete') || 'Delete'}
        cancelText={tCommon('cancel') || 'Cancel'}
        onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
      />
    </AgencyLayout>
  );
}
