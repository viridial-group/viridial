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
  Shield,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  Key,
  Building2,
  Calendar,
  Plus,
  MoreVertical,
  Eye,
  RefreshCw,
  User as UserIcon,
  Settings,
  LogOut,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { roleApi, RoleApiError, Role } from '@/lib/role-api';
import { permissionApi, PermissionApiError, Permission } from '@/lib/permission-api';
import { userApi, User } from '@/lib/user-api';
import { organizationApi } from '@/lib/organization-api';
import { Organization } from '@/types/organization';
import { Globe } from 'lucide-react';
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
const EditRoleModal = dynamic(() => import('@/components/roles/EditRoleModal').then(mod => ({ default: mod.EditRoleModal })), {
  loading: () => null,
  ssr: false,
});

const AssignPermissionsModal = dynamic(() => import('@/components/roles/AssignPermissionsModal').then(mod => ({ default: mod.AssignPermissionsModal })), {
  loading: () => null,
  ssr: false,
});

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const roleId = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal states
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isAssignPermissionsModalOpen, setIsAssignPermissionsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false });
  const [confirmRemovePermission, setConfirmRemovePermission] = useState<{ open: boolean; permissionId?: string }>({ open: false });

  // Grouped permissions by resource
  const groupedPermissions = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    allPermissions.forEach((perm) => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm);
    });
    return grouped;
  }, [allPermissions]);

  // Load role data
  const loadRole = useCallback(async () => {
    if (!roleId) return;

    try {
      setIsLoading(true);
      const roleData = await roleApi.getById(roleId);
      setRole(roleData);

      // Load organization if role has one
      if (roleData.organizationId) {
        try {
          const org = await organizationApi.findById(roleData.organizationId);
          setOrganization(org);
        } catch (error) {
          console.error('Error fetching organization:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load role:', error);
      toast({
        title: t('errors.loadFailed') || 'Failed to load role',
        description: error instanceof RoleApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
      router.push('/roles');
    } finally {
      setIsLoading(false);
    }
  }, [roleId, router, toast, t]);

  // Load permissions
  const loadPermissions = useCallback(async () => {
    try {
      const permissions = await permissionApi.getAll();
      setAllPermissions(permissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof PermissionApiError 
          ? error.message 
          : t('errors.loadPermissionsFailed') || 'Failed to load permissions',
        variant: 'error',
      });
    }
  }, [toast, tCommon, t]);

  // Load users with this role
  const loadUsers = useCallback(async () => {
    if (!role) return;

    try {
      // Fetch all users and filter by role name
      // Note: Backend may not support roleId filter, so we filter client-side
      const response = await userApi.findAll({ limit: 1000 });
      const allUsers = response.data || [];
      
      // Filter users that have this role assigned
      const usersWithRole = allUsers.filter((user: User) => {
        // Check if user has this role via userRoles relationship
        if (user.userRoles && user.userRoles.length > 0) {
          return user.userRoles.some((ur: any) => ur.roleId === role.id || ur.role?.id === role.id);
        }
        // Fallback: check legacy role field
        return user.role === role.name;
      });
      
      setUsers(usersWithRole);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: 'Failed to load users',
        variant: 'error',
      });
    }
  }, [role, toast, tCommon]);

  useEffect(() => {
    loadRole();
    loadPermissions();
  }, [loadRole, loadPermissions]);

  useEffect(() => {
    if (role) {
      loadUsers();
    }
  }, [role, loadUsers]);

  // Handle delete role
  const handleDelete = async () => {
    if (!role) return;

    try {
      setIsProcessing(true);
      await roleApi.delete(role.id);
      toast({
        variant: 'success',
        title: tCommon('success') || 'Success',
        description: t('deleteSuccess') || 'Role deleted successfully',
      });
      router.push('/roles');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof RoleApiError 
          ? error.message 
          : t('errors.deleteFailed') || 'Failed to delete role',
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
      setConfirmDelete({ open: false });
    }
  };

  // Handle remove permission
  const handleRemovePermission = async (permissionId: string) => {
    if (!role) return;

    try {
      setIsProcessing(true);
      const currentPermissionIds = role.permissions.map((p: Permission) => p.id);
      const updatedPermissionIds = currentPermissionIds.filter((id: string) => id !== permissionId);
      
      await roleApi.update(role.id, {
        permissionIds: updatedPermissionIds,
      });
      
      toast({
        variant: 'success',
        title: tCommon('success') || 'Success',
        description: t('permissionRemoved') || 'Permission removed successfully',
      });
      
      loadRole();
      setConfirmRemovePermission({ open: false });
    } catch (error) {
      console.error('Error removing permission:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof RoleApiError 
          ? error.message 
          : t('errors.removePermissionFailed') || 'Failed to remove permission',
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle assign permissions success
  const handleAssignPermissionsSuccess = () => {
    loadRole();
    setIsAssignPermissionsModalOpen(false);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    loadRole();
    setIsEditRoleModalOpen(false);
  };

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([loadRole(), loadPermissions()]);
    if (role) {
      await loadUsers();
    }
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

  if (!role) {
    return (
      <AgencyLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-white">
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('roleNotFound') || 'Role not found'}</h3>
                <p className="text-gray-500 mb-6">{t('roleNotFoundDescription') || 'The role you are looking for does not exist.'}</p>
                <Button onClick={() => router.push('/roles')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {tCommon('back') || 'Back to Roles'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AgencyLayout>
    );
  }

  const stats = {
    totalPermissions: role.permissions?.length || 0,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    inactiveUsers: users.filter(u => !u.isActive).length,
  };

  return (
    <AgencyLayout
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
              <DropdownMenuItem onClick={() => setIsEditRoleModalOpen(true)}>
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
      headerContent={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/roles')}
            className="gap-2 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon('back') || 'Back'}
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="p-2 bg-gradient-to-br from-viridial-100 to-viridial-50 rounded-lg shadow-sm">
              <Shield className="h-6 w-6 text-viridial-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{role.name}</h1>
              <p className="text-sm text-gray-500">{t('roleDetails') || 'Role details and management'}</p>
            </div>
          </div>
        </>
      }
    >
      <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          {t('totalUsers') || 'Total Users'}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg shadow-sm">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-200 animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {t('activeUsers') || 'Active Users'}
                        </p>
                        <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-lg shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-200 animate-fade-in" style={{ animationDelay: '150ms' }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {t('status') || 'Status'}
                        </p>
                        <div className="mt-1">
                          {role.isActive ? (
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
                        <Shield className="h-5 w-5 text-viridial-600" />
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
                  <TabsTrigger value="users">
                    {t('users')} ({stats.totalUsers})
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* General Information */}
                    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-viridial-600" />
                          {t('generalInformation') || 'General Information'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('name') || 'Name'}
                          </label>
                          <p className="text-sm font-medium text-gray-900">{role.name}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('description') || 'Description'}
                          </label>
                          <p className="text-sm text-gray-600">{role.description || <span className="text-gray-400 italic">{t('noDescription') || 'No description'}</span>}</p>
                        </div>
                        {organization && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                              {t('organization') || 'Organization'}
                            </label>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <p className="text-sm text-gray-900">{organization.name}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/organizations/${organization.id}`)}
                                className="h-6 px-2 text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                {t('viewOrganization') || 'View'}
                              </Button>
                            </div>
                          </div>
                        )}
                        {!organization && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                              {t('scope') || 'Scope'}
                            </label>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              <Globe className="h-3 w-3 mr-1" />
                              {t('globalRole') || 'Global'}
                            </Badge>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('createdAt') || 'Created At'}
                          </label>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {new Date(role.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            {t('updatedAt') || 'Updated At'}
                          </label>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {new Date(role.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          {t('quickStats') || 'Quick Stats'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                          <span className="text-sm text-gray-600">{t('totalPermissions') || 'Total Permissions'}</span>
                          <span className="text-lg font-semibold text-gray-900">{stats.totalPermissions}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                          <span className="text-sm text-gray-600">{t('totalUsers') || 'Total Users'}</span>
                          <span className="text-lg font-semibold text-gray-900">{stats.totalUsers}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                          <span className="text-sm text-gray-600">{t('activeUsers') || 'Active Users'}</span>
                          <span className="text-lg font-semibold text-green-600">{stats.activeUsers}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                          <span className="text-sm text-gray-600">{t('inactiveUsers') || 'Inactive Users'}</span>
                          <span className="text-lg font-semibold text-gray-600">{stats.inactiveUsers}</span>
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
                      <Button
                        size="sm"
                        onClick={() => setIsAssignPermissionsModalOpen(true)}
                        className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-white h-9 px-4"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {t('assignPermissions') || 'Assign Permissions'}
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {!role.permissions || role.permissions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Key className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-sm">{t('noPermissions') || 'No permissions assigned'}</p>
                          <p className="text-xs text-gray-400 mt-2">{t('assignPermissionsDescription') || 'Assign permissions to this role to control access'}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {Object.entries(groupedPermissions).map(([resource, perms]) => {
                            const rolePerms = perms.filter((p: Permission) => role.permissions?.some((rp: Permission) => rp.id === p.id));
                            if (rolePerms.length === 0) return null;

                            return (
                              <div key={resource} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-sm transition-all duration-200 bg-white">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-viridial-600" />
                                    {resource}
                                  </h4>
                                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                    {rolePerms.length} {t('permissions') || 'permissions'}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {rolePerms.map((perm) => (
                                    <Badge
                                      key={perm.id}
                                      variant="secondary"
                                      className="text-xs px-2 py-1 bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 hover:bg-purple-100 transition-colors"
                                    >
                                      {perm.action}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setConfirmRemovePermission({ open: true, permissionId: perm.id })}
                                        className="h-4 w-4 p-0 ml-1 hover:bg-purple-200 rounded-full"
                                      >
                                        <XCircle className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-4 animate-fade-in">
                  <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        {t('usersWithRole') || 'Users with this Role'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {users.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-sm">{t('noUsersWithRole') || 'No users have this role assigned'}</p>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('name') || 'Name'}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('email') || 'Email'}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('organization') || 'Organization'}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('status') || 'Status'}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('actions') || 'Actions'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {users.map((user, index) => (
                                <tr
                                  key={user.id}
                                  className={`hover:bg-viridial-50 transition-colors duration-150 cursor-pointer ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }`}
                                >
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                    {user.firstName || user.lastName 
                                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                      : user.email.split('@')[0]
                                    }
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">{user.email}</td>
                                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                                    {user.organization ? (
                                      <Badge variant="outline" className="font-normal">
                                        {user.organization.name}
                                      </Badge>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                                    {user.isActive ? (
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
                                      onClick={() => router.push(`/users/${user.id}`)}
                                      className="h-7 px-2"
                                    >
                                      <Eye className="h-3.5 w-3.5 mr-1" />
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

      {/* Edit Role Modal */}
      {role && (
        <EditRoleModal
          open={isEditRoleModalOpen}
          onOpenChange={setIsEditRoleModalOpen}
          role={role}
          permissions={allPermissions}
          groupedPermissions={groupedPermissions}
          organizations={organization ? [organization] : []}
          isSuperAdmin={false}
          onSaveSuccess={handleEditSuccess}
        />
      )}

      {/* Assign Permissions Modal */}
      {role && (
        <AssignPermissionsModal
          open={isAssignPermissionsModalOpen}
          onOpenChange={setIsAssignPermissionsModalOpen}
          role={role}
          permissions={allPermissions}
          groupedPermissions={groupedPermissions}
          onSuccess={handleAssignPermissionsSuccess}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open })}
        title={t('deleteTitle') || 'Delete Role'}
        description={t('deleteDescription') || 'Are you sure you want to delete this role? Users with this role will lose their permissions.'}
        variant="danger"
        confirmText={tCommon('delete') || 'Delete'}
        cancelText={tCommon('cancel') || 'Cancel'}
        onConfirm={handleDelete}
        isLoading={isProcessing}
      />

      {/* Remove Permission Confirmation */}
      <ConfirmationDialog
        open={confirmRemovePermission.open}
        onOpenChange={(open) => setConfirmRemovePermission({ open, permissionId: confirmRemovePermission.permissionId })}
        title={t('removePermission') || 'Remove Permission'}
        description={t('removePermissionDescription') || 'Are you sure you want to remove this permission from this role?'}
        variant="danger"
        confirmText={tCommon('remove') || 'Remove'}
        cancelText={tCommon('cancel') || 'Cancel'}
        onConfirm={() => {
          if (confirmRemovePermission.permissionId) {
            handleRemovePermission(confirmRemovePermission.permissionId);
          }
        }}
        isLoading={isProcessing}
      />
    </AgencyLayout>
  );
}

