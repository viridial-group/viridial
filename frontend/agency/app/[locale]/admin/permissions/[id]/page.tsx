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
  Key,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
  Sparkles,
  Calendar,
  MoreVertical,
  RefreshCw,
  Folder,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { permissionApi, PermissionApiError } from '@/lib/permission-api';
import { Permission } from '@/types/admin';
import { roleApi, Role } from '@/lib/role-api';
import { featureApi } from '@/lib/feature-api';
import { Feature } from '@/types/admin';
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
const CreatePermissionModalGeneric = dynamic(() => import('@/components/permissions/CreatePermissionModalGeneric').then(mod => ({ default: mod.CreatePermissionModalGeneric })), {
  loading: () => null,
  ssr: false,
});

export default function PermissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('admin.permissions');
  const tCommon = useTranslations('common');
  const permissionId = params.id as string;

  const [permission, setPermission] = useState<Permission | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal states
  const [isEditPermissionModalOpen, setIsEditPermissionModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false });

  // Load permission data
  const loadPermission = useCallback(async () => {
    if (!permissionId) return;

    try {
      setIsLoading(true);
      const permissionData = await permissionApi.getById(permissionId);
      setPermission(permissionData);
    } catch (error) {
      console.error('Failed to load permission:', error);
      toast({
        title: t('errors.loadFailed') || 'Failed to load permission',
        description: error instanceof PermissionApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
      router.push('/admin/permissions');
    } finally {
      setIsLoading(false);
    }
  }, [permissionId, router, toast, t]);

  // Load roles that have this permission
  const loadRoles = useCallback(async () => {
    try {
      const allRoles = await roleApi.getAll();
      // Filter roles that have this permission
      const rolesWithPermission = allRoles.filter((role: Role) => 
        role.permissions?.some((p: Permission) => p.id === permissionId)
      );
      setRoles(rolesWithPermission);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: 'Failed to load roles',
        variant: 'error',
      });
    }
  }, [permissionId, toast, tCommon]);

  // Load features that have this permission
  const loadFeatures = useCallback(async () => {
    try {
      const allFeatures = await featureApi.getAll();
      // Filter features that have this permission
      const featuresWithPermission = allFeatures.filter((feature: Feature) => 
        feature.permissions?.some((p: Permission) => p.id === permissionId)
      );
      setFeatures(featuresWithPermission);
    } catch (error) {
      console.error('Error loading features:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: 'Failed to load features',
        variant: 'error',
      });
    }
  }, [permissionId, toast, tCommon]);

  useEffect(() => {
    loadPermission();
  }, [loadPermission]);

  useEffect(() => {
    if (permission) {
      loadRoles();
      loadFeatures();
    }
  }, [permission, loadRoles, loadFeatures]);

  // Handle delete permission
  const handleDelete = async () => {
    if (!permission) return;

    try {
      setIsProcessing(true);
      await permissionApi.delete(permission.id);
      toast({
        variant: 'success',
        title: tCommon('success') || 'Success',
        description: t('success.deleted') || 'Permission deleted successfully',
      });
      router.push('/admin/permissions');
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof PermissionApiError 
          ? error.message 
          : t('errors.deleteFailed') || 'Failed to delete permission',
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
      setConfirmDelete({ open: false });
    }
  };

  // Handle edit success
  const handleEditSuccess = () => {
    loadPermission();
    setIsEditPermissionModalOpen(false);
  };

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([loadPermission()]);
    if (permission) {
      await Promise.all([loadRoles(), loadFeatures()]);
    }
  };

  const actionColors: Record<string, string> = {
    read: 'bg-blue-100 text-blue-800',
    write: 'bg-green-100 text-green-800',
    delete: 'bg-red-100 text-red-800',
    admin: 'bg-purple-100 text-purple-800',
    create: 'bg-emerald-100 text-emerald-800',
    update: 'bg-amber-100 text-amber-800',
    view: 'bg-cyan-100 text-cyan-800',
    manage: 'bg-indigo-100 text-indigo-800',
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

  if (!permission) {
    return (
      <AgencyLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-white">
              <CardContent className="py-12 text-center">
                <Key className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('permissionNotFound') || 'Permission not found'}</h3>
                <p className="text-gray-500 mb-6">{t('permissionNotFoundDescription') || 'The permission you are looking for does not exist.'}</p>
                <Button onClick={() => router.push('/admin/permissions')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {tCommon('back') || 'Back to Permissions'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AgencyLayout>
    );
  }

  const stats = {
    totalRoles: roles.length,
    totalFeatures: features.length,
  };

  return (
    <AgencyLayout
      headerContent={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/permissions')}
            className="gap-2 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon('back') || 'Back'}
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg shadow-sm">
              <Key className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{permission.resource}:{permission.action}</h1>
              <p className="text-sm text-gray-500">{t('permissionDetails') || 'Permission details and management'}</p>
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
              <DropdownMenuItem onClick={() => setIsEditPermissionModalOpen(true)}>
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
                          {t('totalRoles') || 'Total Roles'}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalRoles}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg shadow-sm">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-200 animate-fade-in" style={{ animationDelay: '50ms' }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {t('totalFeatures') || 'Total Features'}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalFeatures}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg shadow-sm">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">{t('overview') || 'Overview'}</TabsTrigger>
                  <TabsTrigger value="roles">
                    {t('roles')} ({stats.totalRoles})
                  </TabsTrigger>
                  <TabsTrigger value="features">
                    {t('features')} ({stats.totalFeatures})
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* General Information */}
                    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-purple-600" />
                          {t('generalInformation') || 'General Information'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('resource') || 'Resource'}
                          </label>
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900">{permission.resource}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('action') || 'Action'}
                          </label>
                          <Badge className={`text-xs px-2 py-1 ${actionColors[permission.action] || 'bg-gray-100 text-gray-800'}`}>
                            {permission.action}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('description') || 'Description'}
                          </label>
                          <p className="text-sm text-gray-600">{permission.description || <span className="text-gray-400 italic">{t('noDescription') || 'No description'}</span>}</p>
                        </div>
                        {permission.externalCode && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                              {t('externalCode') || 'External Code'}
                            </label>
                            <p className="text-sm text-gray-600 font-mono">{permission.externalCode}</p>
                          </div>
                        )}
                        {permission.internalCode && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                              {t('internalCode') || 'Internal Code'}
                            </label>
                            <p className="text-sm text-gray-600 font-mono">{permission.internalCode}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('createdAt') || 'Created At'}
                          </label>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {new Date(permission.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('updatedAt') || 'Updated At'}
                          </label>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {new Date(permission.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-purple-600" />
                          {t('quickStats') || 'Quick Stats'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                          <span className="text-sm text-gray-600">{t('totalRoles') || 'Total Roles'}</span>
                          <span className="text-lg font-semibold text-gray-900">{stats.totalRoles}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-200 transition-colors">
                          <span className="text-sm text-gray-600">{t('totalFeatures') || 'Total Features'}</span>
                          <span className="text-lg font-semibold text-gray-900">{stats.totalFeatures}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Roles Tab */}
                <TabsContent value="roles" className="space-y-4 animate-fade-in">
                  <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        {t('rolesWithPermission') || 'Roles with this Permission'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {roles.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-sm">{t('noRolesWithPermission') || 'No roles have this permission assigned'}</p>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('name') || 'Name'}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('description') || 'Description'}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('status') || 'Status'}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('actions') || 'Actions'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {roles.map((role, index) => (
                                <tr
                                  key={role.id}
                                  className={`hover:bg-purple-50 transition-colors duration-150 cursor-pointer ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }`}
                                >
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                    {role.name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">{role.description || '-'}</td>
                                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                                    {role.isActive ? (
                                      <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 gap-1 text-xs">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {t('active') || 'Active'}
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 gap-1 text-xs">
                                        <XCircle className="h-3 w-3" />
                                        {t('inactive') || 'Inactive'}
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => router.push(`/roles/${role.id}`)}
                                      className="h-7 px-2"
                                    >
                                      {tCommon('view') || 'View'}
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="space-y-4 animate-fade-in">
                  <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        {t('featuresWithPermission') || 'Features with this Permission'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {features.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-sm">{t('noFeaturesWithPermission') || 'No features have this permission assigned'}</p>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('name') || 'Name'}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('category') || 'Category'}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('status') || 'Status'}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('actions') || 'Actions'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {features.map((feature, index) => (
                                <tr
                                  key={feature.id}
                                  className={`hover:bg-purple-50 transition-colors duration-150 cursor-pointer ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }`}
                                >
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                    {feature.name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">{feature.category || '-'}</td>
                                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                                    {feature.isActive ? (
                                      <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 gap-1 text-xs">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {t('active') || 'Active'}
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 gap-1 text-xs">
                                        <XCircle className="h-3 w-3" />
                                        {t('inactive') || 'Inactive'}
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => router.push(`/admin/features/${feature.id}`)}
                                      className="h-7 px-2"
                                    >
                                      {tCommon('view') || 'View'}
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
      </div>

      {/* Edit Permission Modal */}
      {permission && (
        <CreatePermissionModalGeneric
          isOpen={isEditPermissionModalOpen}
          onClose={() => setIsEditPermissionModalOpen(false)}
          onSuccess={handleEditSuccess}
          permission={permission}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open })}
        title={t('confirmDelete.title') || 'Delete Permission'}
        description={t('confirmDelete.description') || 'Are you sure you want to delete this permission? This action cannot be undone.'}
        variant="danger"
        confirmText={tCommon('delete') || 'Delete'}
        cancelText={tCommon('cancel') || 'Cancel'}
        onConfirm={handleDelete}
        isLoading={isProcessing}
      />
    </AgencyLayout>
  );
}

