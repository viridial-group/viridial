'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { organizationApi } from '@/lib/organization-api';
import dynamic from 'next/dynamic';
import { OrganizationCard } from '@/components/organizations/OrganizationCard';
import { OrganizationTable, SortField, SortDirection } from '@/components/organizations/OrganizationTable';
import { BulkActions } from '@/components/organizations/BulkActions';
import { FilterBar, FilterState } from '@/components/filters/FilterBar';
import { StatsCards } from '@/components/organizations/StatsCards';
import { Sidebar } from '@/components/navigation/Sidebar';
import { AuthGuard } from '@/middleware/auth-guard';

// Lazy load modals to improve initial page load time
const CreateOrganizationModal = dynamic(() => import('@/components/organizations/CreateOrganizationModal').then(mod => ({ default: mod.CreateOrganizationModal })), {
  loading: () => null, // Don't show loading spinner for modals
  ssr: false, // Modals are client-side only
});
import { LanguageSelector } from '@/components/ui/language-selector';
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
import type { OrganizationWithStats } from '@/types/organization';

export default function HomePage() {
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { toast } = useToast();
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    plan: 'all',
    status: 'all',
    minUsers: '',
    maxUsers: '',
    country: 'all',
    city: 'all',
  });
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedOrganizations, setSelectedOrganizations] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh when organizations change
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Fetch organizations from API
  useEffect(() => {
    const fetchOrganizations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiFilters: any = {
          limit: 1000, // Get all organizations for now (we can implement pagination later)
        };

        // Apply filters
        if (filters.plan !== 'all') {
          apiFilters.plan = filters.plan;
        }
        if (filters.status === 'active') {
          apiFilters.isActive = true;
        } else if (filters.status === 'inactive') {
          apiFilters.isActive = false;
        }
        if (filters.country !== 'all') {
          apiFilters.country = filters.country;
        }
        if (filters.city !== 'all' && filters.city) {
          apiFilters.city = filters.city;
        }
        if (filters.minUsers) {
          apiFilters.minUsers = parseInt(filters.minUsers);
        }
        if (filters.maxUsers) {
          apiFilters.maxUsers = parseInt(filters.maxUsers);
        }
        if (filters.search) {
          apiFilters.search = filters.search;
        }

        // Apply sorting
        if (sortField && sortDirection) {
          const sortFieldMap: Record<NonNullable<SortField>, string> = {
            name: 'name',
            location: 'city',
            plan: 'plan',
            status: 'isActive',
            users: 'userCount',
            limit: 'maxUsers',
            createdAt: 'createdAt',
          };
          apiFilters.sortBy = sortFieldMap[sortField];
          apiFilters.sortOrder = sortDirection.toUpperCase();
        }

        const response = await organizationApi.findAll(apiFilters);
        setOrganizations(response.data as OrganizationWithStats[]);
        setTotalCount(response.meta.total);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load organizations');
        toast({
          variant: 'error',
          title: t('organizations.errors.loadFailed') || 'Failed to load organizations',
          description: err instanceof Error ? err.message : 'An unexpected error occurred.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [filters, sortField, sortDirection, refreshKey, toast, t]);

  // Handle wheel event on fixed section to redirect scroll to scrollable area
  const handleFixedSectionWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollableAreaRef.current) {
      e.preventDefault();
      scrollableAreaRef.current.scrollTop += e.deltaY;
    }
  };

  // Handle creating a new organization
  const handleCreateOrganization = async (data: {
    name: string;
    slug: string;
    description?: string;
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    maxUsers: number;
    isActive: boolean;
    country?: string;
    city?: string;
    parentId?: string;
  }) => {
    try {
      setIsProcessing(true);
      const newOrg = await organizationApi.create(data);
      // Force refresh by updating refreshKey
      setRefreshKey((prev) => prev + 1);
      // Reset selection since the list has changed
      setSelectedOrganizations(new Set());
      setIsCreateModalOpen(false);
      
      toast({
        variant: 'success',
        title: t('organizations.createdSuccessfully') || 'Organization created successfully',
        description: t('organizations.organizationCreated', { name: newOrg.name }) || `${newOrg.name} has been created successfully.`,
      });
      
      // Optionally redirect to the new organization detail page
      // router.push(`/organizations/${newOrg.id}`);
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        variant: 'error',
        title: t('organizations.creationFailed') || 'Failed to create organization',
        description: error instanceof Error ? error.message : t('organizations.unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Client-side filtering is no longer needed since API handles it
  // But we keep it for backward compatibility with local search
  const filteredOrganizations = useMemo(() => {
    let filtered = [...organizations];
    
    // Only apply client-side search if API doesn't support it well
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((org: OrganizationWithStats) => {
        return (
          org.name.toLowerCase().includes(searchLower) ||
          org.slug.toLowerCase().includes(searchLower) ||
          org.description?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return filtered;
  }, [organizations, filters.search]);

  // Handle organization selection (memoized to prevent re-renders)
  const handleToggleSelection = useCallback((orgId: string) => {
    setSelectedOrganizations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orgId)) {
        newSet.delete(orgId);
      } else {
        newSet.add(orgId);
      }
      return newSet;
    });
  }, []);

  // Handle select all (memoized with filteredOrganizations dependency)
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedOrganizations(new Set(filteredOrganizations.map((org) => org.id)));
    } else {
      setSelectedOrganizations(new Set());
    }
  }, [filteredOrganizations]);

  const isAllSelected = filteredOrganizations.length > 0 && filteredOrganizations.every((org) => selectedOrganizations.has(org.id));
  const isIndeterminate = filteredOrganizations.some((org) => selectedOrganizations.has(org.id)) && !isAllSelected;

  // Handle bulk actions
  const handleBulkDelete = async () => {
    const selectedIds = Array.from(selectedOrganizations);
    if (window.confirm(t('organizations.bulkActions.deleteConfirm', { count: selectedIds.length }) || `Are you sure you want to delete ${selectedIds.length} organization(s)?`)) {
      setIsProcessing(true);
      try {
        await organizationApi.bulkDelete(selectedIds);
        setRefreshKey((prev) => prev + 1);
        setSelectedOrganizations(new Set());
        
        toast({
          variant: 'success',
          title: t('organizations.deletedSuccessfully') || 'Organizations deleted successfully',
          description: t('organizations.organizationsDeleted', { count: selectedIds.length }) || `${selectedIds.length} organization(s) have been deleted successfully.`,
        });
      } catch (error) {
        toast({
          variant: 'error',
          title: t('organizations.deletionFailed') || 'Failed to delete organizations',
          description: error instanceof Error ? error.message : t('organizations.unexpectedError') || 'An unexpected error occurred.',
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBulkDeactivate = () => {
    const selectedIds = Array.from(selectedOrganizations);
    if (window.confirm(t('organizations.bulkActions.deactivateConfirm', { count: selectedIds.length }) || `Are you sure you want to deactivate ${selectedIds.length} organization(s)?`)) {
      // TODO: Implement actual deactivate logic
      toast({
        variant: 'info',
        title: t('organizations.deactivationPending') || 'Deactivation in progress',
        description: t('organizations.deactivatingOrganizations', { count: selectedIds.length }) || `Deactivating ${selectedIds.length} organization(s)...`,
      });
      setSelectedOrganizations(new Set());
    }
  };

  const handleBulkExport = (format: 'csv' | 'json' | 'excel') => {
    const selectedIds = Array.from(selectedOrganizations);
    const selectedOrgs = filteredOrganizations.filter((org) => selectedIds.includes(org.id));
    
    if (selectedOrgs.length === 0) {
      toast({
        variant: 'warning',
        title: t('organizations.noSelection') || 'No organizations selected',
        description: t('organizations.selectToExport') || 'Please select at least one organization to export.',
      });
      return;
    }

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `organizations_${timestamp}`;

      switch (format) {
        case 'csv':
          exportToCSV(selectedOrgs, `${filename}.csv`);
          break;
        case 'json':
          exportToJSON(selectedOrgs, `${filename}.json`);
          break;
        case 'excel':
          exportToExcel(selectedOrgs, `${filename}.xlsx`);
          break;
      }

      toast({
        variant: 'success',
        title: t('organizations.exportedSuccessfully') || 'Export successful',
        description: t('organizations.exportedCount', { count: selectedOrgs.length, format: format.toUpperCase() }) || `${selectedOrgs.length} organization(s) exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        variant: 'error',
        title: t('organizations.exportFailed') || 'Export failed',
        description: error instanceof Error ? error.message : t('organizations.unexpectedError') || 'An unexpected error occurred.',
      });
    }
  };

  const handleClearSelection = useCallback(() => {
    setSelectedOrganizations(new Set());
  }, []);

  const handleSort = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  // Sorting is now handled by the API, but we keep this for client-side fallback if needed
  const sortedFilteredOrganizations = filteredOrganizations;

  return (
    <AuthGuard>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Main Layout */}
      <div className="flex flex-1 min-w-0">
        {/* Navigation Sidebar */}
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="flex-shrink-0 border-b border-gray-200 bg-white z-10">
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{t('organizations.title')}</h1>
                  <p className="text-xs text-gray-500">{t('organizations.subtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <LanguageSelector />
                  <Button variant="ghost" size="sm" className="text-sm text-gray-600 hover:text-gray-900">
                    Blog
                  </Button>
                  <Button variant="ghost" size="sm" className="text-sm text-gray-600 hover:text-gray-900">
                    {tCommon('whatsNew') || "What's new?"}
                  </Button>
                  <Button 
                    className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-sm h-9 px-4"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('organizations.newOrganization')}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Fixed Top Section */}
            <div 
              className="flex-shrink-0 p-6 pb-4 space-y-4 overflow-hidden"
              onWheel={handleFixedSectionWheel}
            >
              {/* Stats Cards */}
              <StatsCards organizations={organizations} />

              {/* Filter Bar */}
              <FilterBar onFilterChange={setFilters} />

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
                  <Tooltip content={t('organizations.gridViewTooltip') || 'Grid view'}>
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
                      {t('organizations.gridView')}
                    </Button>
                  </Tooltip>
                  <Tooltip content={t('organizations.tableViewTooltip') || 'Table view with sorting'}>
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
                      {t('organizations.tableView')}
                    </Button>
                  </Tooltip>
                  {selectedOrganizations.size > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Tooltip content={t('organizations.exportSelected') || 'Export selected organizations'}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 gap-1.5"
                          >
                            <Download className="h-3.5 w-3.5" />
                            {t('organizations.export') || 'Export'}
                          </Button>
                        </Tooltip>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleBulkExport('csv')}>
                          <FileText className="h-4 w-4 mr-2" />
                          {t('organizations.exportCSV') || 'Export as CSV'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkExport('json')}>
                          <FileJson className="h-4 w-4 mr-2" />
                          {t('organizations.exportJSON') || 'Export as JSON'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkExport('excel')}>
                          <FileText className="h-4 w-4 mr-2" />
                          {t('organizations.exportExcel') || 'Export as Excel'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <div className="text-sm text-gray-600">
                    {tCommon('showing') || 'Showing'} 1 {tCommon('to') || 'to'} {Math.min(parseInt(rowsPerPage), sortedFilteredOrganizations.length)} {tCommon('of') || 'of'} {sortedFilteredOrganizations.length} {tCommon('results') || 'results'}
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Results Area */}
            <div ref={scrollableAreaRef} className="flex-1 overflow-y-auto px-6 pb-4">
              {/* Bulk Actions */}
              {selectedOrganizations.size > 0 && (
                <BulkActions
                  selectedCount={selectedOrganizations.size}
                  onDelete={handleBulkDelete}
                  onDeactivate={handleBulkDeactivate}
                  onExport={() => handleBulkExport('csv')}
                  onClearSelection={handleClearSelection}
                  isLoading={isProcessing}
                />
              )}

              {/* Organizations Display */}
              {isLoading ? (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center animate-fade-in">
                  <div className="text-gray-500 mb-2">{tCommon('loading') || 'Loading organizations...'}</div>
                </div>
              ) : error ? (
                <div className="bg-white border border-red-200 rounded-lg p-12 text-center animate-fade-in">
                  <div className="text-red-600 mb-2">{t('organizations.errors.loadFailed') || 'Failed to load organizations'}</div>
                  <div className="text-sm text-red-400">{error}</div>
                </div>
              ) : sortedFilteredOrganizations.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center animate-fade-in">
                  <div className="text-gray-500 mb-2">{t('organizations.noOrganizations')}</div>
                  <div className="text-sm text-gray-400">
                    {t('organizations.tryFilters')}
                  </div>
                </div>
              ) : (
                <div className="transition-all duration-300 ease-out">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                      {sortedFilteredOrganizations.map((org: OrganizationWithStats, index) => (
                        <div
                          key={org.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <OrganizationCard
                            organization={org}
                            isSelected={selectedOrganizations.has(org.id)}
                            onSelect={() => handleToggleSelection(org.id)}
                            onView={() => router.push(`/organizations/${org.id}` as any)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <OrganizationTable
                        organizations={sortedFilteredOrganizations}
                        selectedIds={selectedOrganizations}
                        isAllSelected={isAllSelected}
                        isIndeterminate={isIndeterminate}
                        onSelectAll={handleSelectAll}
                        onToggleSelection={handleToggleSelection}
                        onView={(org) => router.push(`/organizations/${org.id}` as any)}
                        onEdit={(org) => console.log('Edit:', org)}
                        onDelete={(org) => console.log('Delete:', org)}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fixed Pagination */}
            {filteredOrganizations.length > 0 && (
              <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {tCommon('showing') || 'Showing'} 1 {tCommon('to') || 'to'} {Math.min(parseInt(rowsPerPage), sortedFilteredOrganizations.length)} {tCommon('of') || 'of'} {sortedFilteredOrganizations.length} {tCommon('results') || 'results'}
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
          </main>
        </div>
      </div>

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        organizations={organizations}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreate={handleCreateOrganization}
      />
      </div>
    </AuthGuard>
  );
}
