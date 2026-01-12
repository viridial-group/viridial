'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { StatsCards } from '@/components/resources/StatsCards';
import { CreateResourceModal } from '@/components/resources/CreateResourceModal';
import { ResourceFilterBar } from '@/components/resources/ResourceFilterBar';
import { Sidebar } from '@/components/navigation/Sidebar';
import { AuthGuard } from '@/middleware/auth-guard';
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
import { Plus, Grid3x3, List } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { resourceApi, ResourceApiError } from '@/lib/resource-api';
import type { Resource, CreateResourceDto, ResourceFilters } from '@/types/admin';

export default function ResourcesPage() {
  const t = useTranslations('admin.resources');
  const router = useRouter();
  const { toast } = useToast();
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState('25');
  const [filters, setFilters] = useState<ResourceFilters>({
    search: '',
    category: '',
    isActive: undefined,
  });

  // Load resources
  const loadResources = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await resourceApi.getAll(filters);
      setResources(data);
    } catch (error) {
      console.error('Failed to load resources:', error);
      toast({
        title: t('errors.loadFailed') || 'Failed to load resources',
        description: error instanceof ResourceApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, t, toast]);

  // Reload when filters change
  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleCreateSuccess = (newResource: Resource) => {
    setResources((prev) => [newResource, ...prev]);
    setIsCreateModalOpen(false);
    loadResources(); // Reload to get updated list
  };

  const handleSelectResource = useCallback((resourceId: string) => {
    setSelectedResources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedResources(new Set());
  }, []);

  // Get unique categories from resources
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    resources.forEach((resource) => {
      if (resource.category) {
        uniqueCategories.add(resource.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [resources]);

  // Filtered resources - server-side filtering is already applied via API
  const filteredResources = resources;

  // Pagination
  const paginatedResources = useMemo(() => {
    const limit = parseInt(rowsPerPage);
    return filteredResources.slice(0, limit);
  }, [filteredResources, rowsPerPage]);

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
                    <h1 className="text-lg font-semibold text-gray-900">{t('title') || 'Resources'}</h1>
                    <p className="text-xs text-gray-500">{t('subtitle') || 'Manage resources for permission system'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <LanguageSelector />
                    <Button 
                      className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-sm h-9 px-4"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('newResource') || 'New Resource'}
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Fixed Top Section */}
              <div className="flex-shrink-0 p-6 pb-4 space-y-4 overflow-hidden">
                {/* Stats Cards */}
                <StatsCards resources={resources} />

                {/* Filter Bar */}
                <ResourceFilterBar
                  filters={filters}
                  onFilterChange={setFilters}
                  categories={categories}
                />

                {/* Results Header */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{t('common.rowsPerPage') || 'Rows per page'}:</span>
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
                    <Tooltip content={t('tableViewTooltip') || 'Table view'}>
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
                    <div className="text-sm text-gray-600">
                      {t('common.showing') || 'Showing'} 1 {t('common.to') || 'to'} {Math.min(parseInt(rowsPerPage), filteredResources.length)} {t('common.of') || 'of'} {filteredResources.length} {t('common.results') || 'results'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Results Area */}
              <div ref={scrollableAreaRef} className="flex-1 overflow-y-auto px-6 pb-4">
                {isLoading ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                    <div className="text-gray-500">{t('loading') || 'Loading resources...'}</div>
                  </div>
                ) : paginatedResources.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center animate-fade-in">
                    <div className="text-gray-500 mb-2">{t('noResources') || 'No resources found'}</div>
                    <div className="text-sm text-gray-400">
                      {t('createFirstResource') || 'Create your first resource to get started'}
                    </div>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedResources.map((resource, index) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        isSelected={selectedResources.has(resource.id)}
                        onSelect={() => handleSelectResource(resource.id)}
                        onView={() => router.push(`/admin/resources/${resource.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedResources.map((resource) => (
                          <tr
                            key={resource.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => router.push(`/admin/resources/${resource.id}`)}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{resource.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{resource.category || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                resource.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {resource.isActive ? t('active') || 'Active' : t('inactive') || 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(resource.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Create Resource Modal */}
      <CreateResourceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </AuthGuard>
  );
}

