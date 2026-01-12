'use client';

import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AuthGuard } from '@/middleware/auth-guard';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Folder, 
  Shield, 
  Settings,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Loader2,
  Key,
  Tag,
  Plus,
  GitBranch
} from 'lucide-react';
import { resourceApi, ResourceApiError } from '@/lib/resource-api';
import { permissionApi, PermissionApiError } from '@/lib/permission-api';
import { featureApi, FeatureApiError } from '@/lib/feature-api';
import { useToast } from '@/components/ui/toast';
import type { Resource, Permission, Feature } from '@/types/admin';

// Lazy load modals
const CreateResourceModal = dynamic(() => import('@/components/resources/CreateResourceModal').then(mod => ({ default: mod.CreateResourceModal })), {
  loading: () => null,
  ssr: false,
});

const CreatePermissionModal = dynamic(() => import('@/components/permissions/CreatePermissionModal').then(mod => ({ default: mod.CreatePermissionModal })), {
  loading: () => null,
  ssr: false,
});

const CreateFeatureModal = dynamic(() => import('@/components/features/CreateFeatureModal').then(mod => ({ default: mod.CreateFeatureModal })), {
  loading: () => null,
  ssr: false,
});

const ConfirmationDialog = dynamic(() => import('@/components/ui/confirmation-dialog').then(mod => ({ default: mod.ConfirmationDialog })), {
  loading: () => null,
  ssr: false,
});

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('admin.resources');
  const tDetail = useTranslations('admin.resources.detail');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const resourceId = params.id as string;
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatePermissionModalOpen, setIsCreatePermissionModalOpen] = useState(false);
  const [isCreateFeatureModalOpen, setIsCreateFeatureModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  // Load resource, its permissions, and related features
  const loadData = useCallback(async () => {
    if (!resourceId) return;
    
    try {
      setIsLoading(true);
      const [resourceData, permissionsData] = await Promise.all([
        resourceApi.getById(resourceId),
        permissionApi.getAll({ resourceId }),
      ]);
      setResource(resourceData);
      setPermissions(permissionsData);

      // Load all features and filter those that use permissions from this resource
      const allFeatures = await featureApi.getAll();
      const resourcePermissionIds = new Set(permissionsData.map(p => p.id));
      const relatedFeatures = allFeatures.filter(feature => 
        feature.permissions?.some(perm => resourcePermissionIds.has(perm.id))
      );
      setFeatures(relatedFeatures);
    } catch (error) {
      console.error('Failed to load resource:', error);
      toast({
        variant: 'error',
        title: t('errors.loadFailed') || 'Failed to load resource',
        description: error instanceof ResourceApiError ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  }, [resourceId, t, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group permissions by action - MUST be before early returns
  const permissionsByAction = useMemo(() => {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.action]) {
        acc[perm.action] = [];
      }
      acc[perm.action].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  const handleDelete = async () => {
    if (!resource) return;
    
    setIsDeleting(true);
    try {
      await resourceApi.delete(resource.id);
        toast({
          variant: 'success',
          title: tDetail('resourceDeletedSuccessfully') || 'Resource deleted successfully',
          description: `${resource.name} has been deleted.`,
        });
      router.push('/admin/resources');
    } catch (error) {
      console.error('Failed to delete resource:', error);
      toast({
        variant: 'error',
        title: t('errors.deleteFailed') || 'Failed to delete resource',
        description: error instanceof ResourceApiError ? error.message : 'An error occurred',
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleUpdate = (updatedResource: Resource) => {
    setResource(updatedResource);
    setIsEditModalOpen(false);
    toast({
      variant: 'success',
      title: tDetail('resourceUpdatedSuccessfully') || 'Resource updated successfully',
      description: `${updatedResource.name} has been updated.`,
    });
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="h-screen bg-gray-50 flex overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!resource) {
    return (
      <AuthGuard>
        <div className="h-screen bg-gray-50 flex overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 flex items-center justify-center">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>{tDetail('resourceNotFound') || 'Resource not found'}</CardTitle>
                  <CardDescription>
                    {tDetail('resourceNotFoundDescription') || 'The resource you are looking for does not exist.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push('/admin/resources')}>
                    {tCommon('back') || 'Back to Resources'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const handlePermissionCreate = async (permission: Permission) => {
    setPermissions(prev => [...prev, permission]);
    await loadData(); // Reload to get updated features
    toast({
      variant: 'success',
      title: tDetail('permissionCreated') || 'Permission created',
      description: `${permission.resource}:${permission.action} has been created.`,
    });
  };

  const handlePermissionUpdate = async (permission: Permission) => {
    setPermissions(prev => prev.map(p => p.id === permission.id ? permission : p));
    await loadData(); // Reload to get updated features
    toast({
      variant: 'success',
      title: tDetail('permissionUpdated') || 'Permission updated',
      description: `${permission.resource}:${permission.action} has been updated.`,
    });
  };

  const handlePermissionDelete = async (permissionId: string) => {
    try {
      await permissionApi.delete(permissionId);
      setPermissions(prev => prev.filter(p => p.id !== permissionId));
      await loadData(); // Reload to get updated features
      toast({
        variant: 'success',
        title: tDetail('permissionDeleted') || 'Permission deleted',
        description: 'Permission has been deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete permission:', error);
      toast({
        variant: 'error',
        title: tDetail('permissionDeleteFailed') || 'Failed to delete permission',
        description: error instanceof PermissionApiError ? error.message : 'An error occurred',
      });
    }
  };

  const handleFeatureCreate = async (feature: Feature) => {
    await loadData(); // Reload to get updated features
    toast({
      variant: 'success',
      title: tDetail('featureCreated') || 'Feature created',
      description: `${feature.name} has been created.`,
    });
  };

  const handleFeatureUpdate = async (feature: Feature) => {
    await loadData(); // Reload to get updated features
    toast({
      variant: 'success',
      title: tDetail('featureUpdated') || 'Feature updated',
      description: `${feature.name} has been updated.`,
    });
  };

  const handleFeatureDelete = async (featureId: string) => {
    try {
      await featureApi.delete(featureId);
      await loadData(); // Reload to get updated features
      toast({
        variant: 'success',
        title: tDetail('featureDeleted') || 'Feature deleted',
        description: 'Feature has been deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete feature:', error);
      toast({
        variant: 'error',
        title: tDetail('featureDeleteFailed') || 'Failed to delete feature',
        description: error instanceof FeatureApiError ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <AuthGuard>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="flex-shrink-0 border-b border-gray-200 bg-white z-10">
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => router.back()}
                    className="h-8 w-8 text-gray-600 hover:text-gray-900"
                    title={tCommon('back')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">{resource.name}</h1>
                    <p className="text-xs text-gray-500">{tDetail('resourceDetails') || 'Resource details'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-sm h-9 px-4 gap-2"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {tCommon('edit')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-sm h-9 px-4 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {tCommon('delete')}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('permissions') || 'Permissions'}</div>
                <div className="text-2xl font-bold text-gray-900">{permissions.length}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{tDetail('features') || 'Features'}</div>
                <div className="text-2xl font-bold text-gray-900">{features.length}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('status') || 'Status'}</div>
                <div className="text-sm font-medium text-gray-900">
                  {resource.isActive ? (
                    <Badge variant="success" className="gap-1 text-xs px-2 py-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      {tCommon('active')}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1 text-xs px-2 py-0.5">
                      <XCircle className="h-3 w-3" />
                      {tCommon('inactive')}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('category') || 'Category'}</div>
                <div className="text-sm font-medium text-gray-900">
                  {resource.category || tDetail('uncategorized') || 'Uncategorized'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* General Information Card */}
              <Card className="lg:col-span-2 border-gray-200 bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-900">{tDetail('generalInformation') || 'General Information'}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    className="gap-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {tCommon('edit')}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                      <Folder className="h-6 w-6 text-viridial-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-semibold text-gray-900 mb-1">{resource.name}</h2>
                      <p className="text-sm text-gray-500 mb-3">{resource.internalCode}</p>
                      {resource.description && (
                        <p className="text-sm text-gray-700 leading-relaxed">{resource.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{tDetail('internalCode') || 'Internal Code'}</p>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-900">{resource.internalCode}</span>
                      </div>
                    </div>
                    {resource.externalCode && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{tDetail('externalCode') || 'External Code'}</p>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-mono text-gray-900">{resource.externalCode}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-900">{tDetail('quickActions') || 'Quick Actions'}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    {tDetail('editResource') || 'Edit Resource'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {tDetail('deleteResource') || 'Delete Resource'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for Permissions and Features */}
            <Tabs defaultValue="permissions" className="w-full">
              <div className="bg-white border border-gray-200 rounded-lg p-1 mb-6 inline-block">
                <TabsList className="bg-transparent h-auto p-0 gap-1">
                  <TabsTrigger 
                    value="permissions" 
                    className="gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors data-[state=active]:bg-viridial-50 data-[state=active]:text-viridial-700 data-[state=active]:border data-[state=active]:border-viridial-200 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-50"
                  >
                    <Shield className="h-4 w-4" />
                    {t('permissions')} ({permissions.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="features" 
                    className="gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors data-[state=active]:bg-viridial-50 data-[state=active]:text-viridial-700 data-[state=active]:border data-[state=active]:border-viridial-200 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-50"
                  >
                    <GitBranch className="h-4 w-4" />
                    {tDetail('features')} ({features.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="permissions" className="mt-0">
                <Card className="border-gray-200 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900">{tDetail('resourcePermissions') || 'Resource Permissions'}</CardTitle>
                    <Button 
                      size="sm" 
                      className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-white h-9 px-4"
                      onClick={() => {
                        setEditingPermission(null);
                        setIsCreatePermissionModalOpen(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {tDetail('addPermission') || 'Add Permission'}
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {permissions.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm">{tDetail('noPermissions') || 'No permissions found for this resource'}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 gap-2"
                          onClick={() => {
                            setEditingPermission(null);
                            setIsCreatePermissionModalOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {tDetail('createFirstPermission') || 'Create First Permission'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(permissionsByAction).map(([action, actionPermissions]) => (
                          <div key={action} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Key className="h-4 w-4 text-viridial-600" />
                              <h3 className="text-sm font-semibold text-gray-900 uppercase">{action}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {actionPermissions.length}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {actionPermissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {permission.description || `${resource.name}:${permission.action}`}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 font-mono">
                                      {permission.internalCode}
                                    </p>
                                    {permission.features && permission.features.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {permission.features.map((feature) => (
                                          <Badge key={feature.id} variant="outline" className="text-xs">
                                            {feature.name}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8"
                                      onClick={() => {
                                        setEditingPermission(permission);
                                        setIsCreatePermissionModalOpen(true);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handlePermissionDelete(permission.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="mt-0">
                <Card className="border-gray-200 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900">{tDetail('resourceFeatures') || 'Resource Features'}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-2 h-9 px-4"
                        onClick={() => {
                          setEditingFeature(null);
                          setIsCreateFeatureModalOpen(true);
                        }}
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                        {tDetail('addExistingFeature') || 'Add Existing Feature'}
                      </Button>
                      <Button 
                        size="sm" 
                        className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-white h-9 px-4"
                        onClick={() => {
                          setEditingFeature(null);
                          setIsCreateFeatureModalOpen(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {tDetail('createNewFeature') || 'Create New Feature'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {features.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm">{tDetail('noFeatures') || 'No features found for this resource'}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 gap-2"
                          onClick={() => {
                            setEditingFeature(null);
                            setIsCreateFeatureModalOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {tDetail('createFirstFeature') || 'Create First Feature'}
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((feature) => (
                          <Card key={feature.id} className="border-gray-200 bg-white hover:shadow-sm transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100">
                                    <GitBranch className="h-4 w-4 text-viridial-600" />
                                  </div>
                                  <CardTitle className="text-base font-semibold">{feature.name}</CardTitle>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {feature.permissions?.length || 0} {t('permissions')}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {feature.description || tDetail('noDescription') || 'No description provided.'}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                                <span>{t('category')}: {feature.category || tDetail('uncategorized')}</span>
                                {feature.isActive ? (
                                  <Badge variant="success" className="gap-1 text-xs px-2 py-0.5">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {tCommon('active')}
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="gap-1 text-xs px-2 py-0.5">
                                    <XCircle className="h-3 w-3" />
                                    {tCommon('inactive')}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-1 gap-2 text-xs h-7"
                                  onClick={() => {
                                    setEditingFeature(feature);
                                    setIsCreateFeatureModalOpen(true);
                                  }}
                                >
                                  <Pencil className="h-3 w-3" />
                                  {tCommon('edit')}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-1 gap-2 text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleFeatureDelete(feature.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  {tCommon('delete')}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && resource && (
        <CreateResourceModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleUpdate}
          resource={resource}
        />
      )}
      {isCreatePermissionModalOpen && resource && (
        <CreatePermissionModal
          isOpen={isCreatePermissionModalOpen}
          onClose={() => {
            setIsCreatePermissionModalOpen(false);
            setEditingPermission(null);
          }}
          onSuccess={(permission) => {
            if (editingPermission) {
              handlePermissionUpdate(permission);
            } else {
              handlePermissionCreate(permission);
            }
            setIsCreatePermissionModalOpen(false);
            setEditingPermission(null);
          }}
          permission={editingPermission || undefined}
          resource={resource}
        />
      )}
      {isCreateFeatureModalOpen && (
        <CreateFeatureModal
          isOpen={isCreateFeatureModalOpen}
          onClose={() => {
            setIsCreateFeatureModalOpen(false);
            setEditingFeature(null);
          }}
          onSuccess={(feature) => {
            if (editingFeature) {
              handleFeatureUpdate(feature);
            } else {
              handleFeatureCreate(feature);
            }
            setIsCreateFeatureModalOpen(false);
            setEditingFeature(null);
          }}
          feature={editingFeature || undefined}
          resource={resource || undefined}
        />
      )}
      <ConfirmationDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t('confirmDeleteTitle') || 'Confirm Deletion'}
        description={t('confirmDeleteDescription') || 'Are you sure you want to delete this resource? This action cannot be undone.'}
        confirmText={tCommon('delete') || 'Delete'}
        cancelText={tCommon('cancel') || 'Cancel'}
        onConfirm={handleDelete}
        variant="danger"
        isLoading={isDeleting}
      />
    </AuthGuard>
  );
}

