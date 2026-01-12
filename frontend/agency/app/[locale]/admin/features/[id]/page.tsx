'use client';

import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AgencyLayout } from '@/components/layout/AgencyLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Sparkles,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Key,
  Calendar,
  MoreVertical,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { featureApi, FeatureApiError } from '@/lib/feature-api';
import { Feature } from '@/types/admin';
import { permissionApi } from '@/lib/permission-api';
import { Permission } from '@/types/admin';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DetailPageSkeleton } from '@/components/ui/skeleton-loader';

// Lazy load modals
const CreateFeatureModal = dynamic(() => import('@/components/features/CreateFeatureModal').then(mod => ({ default: mod.CreateFeatureModal })), {
  loading: () => null,
  ssr: false,
});

export default function FeatureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('admin.features');
  const tCommon = useTranslations('common');
  const featureId = params.id as string;

  const [feature, setFeature] = useState<Feature | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal states
  const [isEditFeatureModalOpen, setIsEditFeatureModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false });

  // Grouped permissions by resource
  const groupedPermissions = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach((perm) => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm);
    });
    return grouped;
  }, [permissions]);

  // Load feature data
  const loadFeature = useCallback(async () => {
    if (!featureId) return;

    try {
      setIsLoading(true);
      const featureData = await featureApi.getById(featureId);
      setFeature(featureData);
      
      // Load permissions if they're included in the response
      if (featureData.permissions && featureData.permissions.length > 0) {
        setPermissions(featureData.permissions);
      } else {
        // If permissions not included, fetch them separately
        const allPermissions = await permissionApi.getAll();
        const featurePermissionIds = featureData.permissions?.map(p => p.id) || [];
        const featurePerms = allPermissions.filter(p => featurePermissionIds.includes(p.id));
        setPermissions(featurePerms);
      }
    } catch (error) {
      console.error('Failed to load feature:', error);
      toast({
        title: t('errors.loadFailed') || 'Failed to load feature',
        description: error instanceof FeatureApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
      router.push('/admin/features');
    } finally {
      setIsLoading(false);
    }
  }, [featureId, router, toast, t]);

  useEffect(() => {
    loadFeature();
  }, [loadFeature]);

  // Handle delete feature
  const handleDelete = async () => {
    if (!feature) return;

    try {
      setIsProcessing(true);
      await featureApi.delete(feature.id);
      toast({
        variant: 'success',
        title: tCommon('success') || 'Success',
        description: t('success.deleted') || 'Feature deleted successfully',
      });
      router.push('/admin/features');
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof FeatureApiError 
          ? error.message 
          : t('errors.deleteFailed') || 'Failed to delete feature',
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
      setConfirmDelete({ open: false });
    }
  };

  // Handle edit success
  const handleEditSuccess = () => {
    loadFeature();
    setIsEditFeatureModalOpen(false);
  };

  // Refresh all data
  const refreshData = async () => {
    await loadFeature();
  };

  if (isLoading) {
    return (
      <AgencyLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <DetailPageSkeleton />
          </div>
        </div>
      </AgencyLayout>
    );
  }

  if (!feature) {
    return (
      <AgencyLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-white">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('featureNotFound') || 'Feature not found'}</h3>
                <p className="text-gray-500 mb-6">{t('featureNotFoundDescription') || 'The feature you are looking for does not exist.'}</p>
                <Button onClick={() => router.push('/admin/features')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {tCommon('back') || 'Back to Features'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AgencyLayout>
    );
  }

  const stats = {
    totalPermissions: permissions.length,
  };

  return (
    <AgencyLayout
      headerContent={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/features')}
            className="gap-2 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon('back') || 'Back'}
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg shadow-sm">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{feature.name}</h1>
              <p className="text-sm text-gray-500">{t('featureDetails') || 'Feature details and management'}</p>
            </div>
          </div>
        </>
      }
      headerActions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {tCommon('refresh') || 'Refresh'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <MoreVertical className="h-4 w-4" />
                {tCommon('more') || 'More'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditFeatureModalOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                {tCommon('edit') || 'Edit'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmDelete({ open: true })}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {tCommon('delete') || 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-200 animate-fade-in" style={{ animationDelay: '0ms' }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {t('totalPermissions') || 'Total Permissions'}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalPermissions}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg shadow-sm">
                        <Key className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-200 animate-fade-in" style={{ animationDelay: '50ms' }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {t('status') || 'Status'}
                        </p>
                        <div className="mt-1">
                          {feature.isActive ? (
                            <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {t('active') || 'Active'}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 gap-1">
                              <XCircle className="h-3 w-3" />
                              {t('inactive') || 'Inactive'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-viridial-100 to-viridial-50 rounded-lg shadow-sm">
                        <Sparkles className="h-5 w-5 text-viridial-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">{t('overview') || 'Overview'}</TabsTrigger>
                  <TabsTrigger value="permissions">
                    {t('permissions')} ({stats.totalPermissions})
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* General Information */}
                    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          {t('generalInformation') || 'General Information'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('name') || 'Name'}
                          </label>
                          <p className="text-sm font-medium text-gray-900">{feature.name}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('description') || 'Description'}
                          </label>
                          <p className="text-sm text-gray-600">{feature.description || <span className="text-gray-400 italic">{t('noDescription') || 'No description'}</span>}</p>
                        </div>
                        {feature.category && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                              {t('category') || 'Category'}
                            </label>
                            <Badge variant="outline" className="text-sm">
                              {feature.category}
                            </Badge>
                          </div>
                        )}
                        {feature.externalCode && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                              {t('externalCode') || 'External Code'}
                            </label>
                            <p className="text-sm text-gray-600 font-mono">{feature.externalCode}</p>
                          </div>
                        )}
                        {feature.internalCode && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                              {t('internalCode') || 'Internal Code'}
                            </label>
                            <p className="text-sm text-gray-600 font-mono">{feature.internalCode}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('createdAt') || 'Created At'}
                          </label>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {new Date(feature.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('updatedAt') || 'Updated At'}
                          </label>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {new Date(feature.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          {t('quickStats') || 'Quick Stats'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-200 transition-colors">
                          <span className="text-sm text-gray-600">{t('totalPermissions') || 'Total Permissions'}</span>
                          <span className="text-lg font-semibold text-gray-900">{stats.totalPermissions}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-green-200 transition-colors">
                          <span className="text-sm text-gray-600">{t('status') || 'Status'}</span>
                          {feature.isActive ? (
                            <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {t('active') || 'Active'}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 gap-1">
                              <XCircle className="h-3 w-3" />
                              {t('inactive') || 'Inactive'}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Permissions Tab */}
                <TabsContent value="permissions" className="space-y-4 animate-fade-in">
                  <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Key className="h-5 w-5 text-purple-600" />
                        {t('permissions') || 'Permissions'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {permissions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Key className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-sm">{t('noPermissions') || 'No permissions assigned'}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {Object.entries(groupedPermissions).map(([resource, perms]) => (
                            <div key={resource} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-sm transition-all duration-200 bg-white">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                  <Key className="h-4 w-4 text-purple-600" />
                                  {resource}
                                </h4>
                                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                  {perms.length} {t('permissions') || 'permissions'}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {perms.map((perm) => (
                                  <Badge
                                    key={perm.id}
                                    variant="secondary"
                                    className="text-xs px-2 py-1 bg-purple-50 text-purple-700 border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                                    onClick={() => router.push(`/admin/permissions/${perm.id}`)}
                                  >
                                    {perm.action}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
      </div>

      {/* Edit Feature Modal */}
      {feature && (
        <CreateFeatureModal
          isOpen={isEditFeatureModalOpen}
          onClose={() => setIsEditFeatureModalOpen(false)}
          onSuccess={handleEditSuccess}
          feature={feature || undefined}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open })}
        title={t('confirmDelete.title') || 'Delete Feature'}
        description={t('confirmDelete.description') || 'Are you sure you want to delete this feature? This action cannot be undone.'}
        variant="danger"
        confirmText={tCommon('delete') || 'Delete'}
        cancelText={tCommon('cancel') || 'Cancel'}
        onConfirm={handleDelete}
        isLoading={isProcessing}
      />
    </AgencyLayout>
  );
}

