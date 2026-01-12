'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { FeatureCard } from '@/components/features/FeatureCard';
import { FeaturesStatsCards } from '@/components/features/FeaturesStatsCards';
import { FeaturesFilterBar } from '@/components/features/FeaturesFilterBar';
import { AgencyLayout } from '@/components/layout/AgencyLayout';
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
import { Plus, Grid3x3, List, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { featureApi, FeatureApiError } from '@/lib/feature-api';
import type { Feature, CreateFeatureDto, FeatureFilters } from '@/types/admin';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

// Lazy load modals
const CreateFeatureModal = dynamic(() => import('@/components/features/CreateFeatureModal').then(mod => ({ default: mod.CreateFeatureModal })), {
  loading: () => null,
  ssr: false,
});

export default function FeaturesPage() {
  const t = useTranslations('admin.features');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { toast } = useToast();
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState('25');
  const [filters, setFilters] = useState<FeatureFilters>({
    search: '',
    category: undefined,
    isActive: undefined,
  });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  // Load features
  const loadFeatures = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await featureApi.getAll(filters);
      setFeatures(data);
    } catch (error) {
      console.error('Failed to load features:', error);
      toast({
        title: t('errors.loadFailed') || 'Failed to load features',
        description: error instanceof FeatureApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, t, toast]);

  // Reload when filters change
  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleCreateSuccess = (newFeature: Feature) => {
    setFeatures((prev) => [newFeature, ...prev]);
    setIsCreateModalOpen(false);
    setEditingFeature(null);
    loadFeatures(); // Reload to get updated list
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await featureApi.delete(id);
      setFeatures((prev) => prev.filter(f => f.id !== id));
      toast({
        variant: 'success',
        title: t('success.deleted') || 'Feature deleted',
        description: t('success.deletedDescription') || 'Feature has been deleted successfully',
      });
      setConfirmDelete({ open: false, id: null });
    } catch (error) {
      console.error('Failed to delete feature:', error);
      toast({
        variant: 'error',
        title: t('errors.deleteFailed') || 'Failed to delete feature',
        description: error instanceof FeatureApiError ? error.message : 'An error occurred',
      });
    }
  };

  const handleSelectFeature = useCallback((featureId: string) => {
    setSelectedFeatures((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedFeatures(new Set());
  }, []);

  // Get unique categories from features
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    features.forEach((feature) => {
      if (feature.category) {
        uniqueCategories.add(feature.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [features]);

  // Filtered features - server-side filtering is already applied via API
  const filteredFeatures = features;

  // Pagination
  const paginatedFeatures = useMemo(() => {
    const limit = parseInt(rowsPerPage);
    return filteredFeatures.slice(0, limit);
  }, [filteredFeatures, rowsPerPage]);

  return (
    <AgencyLayout
      headerTitle={t('title') || 'Features'}
      headerSubtitle={t('subtitle') || 'Manage features for the RBAC system'}
      headerActions={
        <>
          <LanguageSelector />
          <Button 
            className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-sm h-9 px-4"
            onClick={() => {
              setEditingFeature(null);
              setIsCreateModalOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            {t('newFeature') || 'New Feature'}
          </Button>
        </>
      }
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Fixed Top Section */}
              <div className="flex-shrink-0 p-6 pb-4 space-y-4 overflow-hidden">
                {/* Stats Cards */}
                <FeaturesStatsCards features={features} />

                {/* Filter Bar */}
                <FeaturesFilterBar
                  filters={filters}
                  onFilterChange={setFilters}
                  features={features}
                />

                {/* Results Header */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{tCommon('rowsPerPage')}:</span>
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
                      {tCommon('showing')} 1 {tCommon('to')} {Math.min(parseInt(rowsPerPage), filteredFeatures.length)} {tCommon('of')} {filteredFeatures.length} {tCommon('results')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Results Area */}
              <div ref={scrollableAreaRef} className="flex-1 overflow-y-auto px-6 pb-4">
                {isLoading ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                    <div className="text-gray-500">{t('loading') || 'Loading features...'}</div>
                  </div>
                ) : paginatedFeatures.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center animate-fade-in">
                    <div className="text-gray-500 mb-2">{t('noFeatures') || 'No features found'}</div>
                    <div className="text-sm text-gray-400">
                      {t('createFirstFeature') || 'Create your first feature to get started'}
                    </div>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedFeatures.map((feature) => (
                      <FeatureCard
                        key={feature.id}
                        feature={feature}
                        isSelected={selectedFeatures.has(feature.id)}
                        onSelect={() => handleSelectFeature(feature.id)}
                        onView={() => router.push(`/admin/features/${feature.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100/80 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedFeatures.map((feature, index) => (
                          <tr
                            key={feature.id}
                            className={`hover:bg-gray-100/70 cursor-pointer ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                            }`}
                            onClick={() => router.push(`/admin/features/${feature.id}`)}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">{feature.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">{feature.category || '-'}</td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                feature.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {feature.isActive ? t('active') || 'Active' : t('inactive') || 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/admin/features/${feature.id}`);
                                  }}
                                  className="h-7 px-2"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(feature);
                                  }}
                                  className="h-7 px-2"
                                >
                                  {tCommon('edit')}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDelete({ open: true, id: feature.id });
                                  }}
                                  className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  {tCommon('delete')}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
      </div>

      {/* Create/Edit Feature Modal */}
      <CreateFeatureModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingFeature(null);
        }}
        onSuccess={handleCreateSuccess}
        feature={editingFeature || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open, id: confirmDelete.id })}
        title={t('confirmDelete.title') || 'Delete Feature'}
        description={t('confirmDelete.description') || 'Are you sure you want to delete this feature? This action cannot be undone.'}
        confirmText={tCommon('delete') || 'Delete'}
        cancelText={tCommon('cancel') || 'Cancel'}
        variant="danger"
        onConfirm={() => {
          if (confirmDelete.id) {
            handleDelete(confirmDelete.id);
          }
        }}
      />
    </AgencyLayout>
  );
}

