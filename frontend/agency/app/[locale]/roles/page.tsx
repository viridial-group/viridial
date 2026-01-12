'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { roleApi, RoleApiError, Role, CreateRoleDto, UpdateRoleDto } from '@/lib/role-api';
import { permissionApi, PermissionApiError, Permission } from '@/lib/permission-api';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/navigation/Sidebar';
import { AuthGuard } from '@/middleware/auth-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  Save,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { organizationApi } from '@/lib/organization-api';
import { Organization } from '@/types/organization';

// Lazy load modals
const CreateRoleModal = dynamic(() => import('@/components/roles/CreateRoleModal').then(mod => ({ default: mod.CreateRoleModal })), {
  loading: () => null,
  ssr: false,
});

const EditRoleModal = dynamic(() => import('@/components/roles/EditRoleModal').then(mod => ({ default: mod.EditRoleModal })), {
  loading: () => null,
  ssr: false,
});

export default function RolesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const { user } = useAuth();

  // Check if user is super admin
  const isSuperAdmin = user?.role === 'super_admin';

  // State
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  // Load permissions (for assignment to roles)
  const loadPermissions = useCallback(async () => {
    try {
      const allPermissions = await permissionApi.getAll();
      setPermissions(allPermissions);
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

  // Load organizations (for super admin to see which org a role belongs to)
  const loadOrganizations = useCallback(async () => {
    if (!isSuperAdmin) return;

    try {
      const result = await organizationApi.findAll();
      setOrganizations(result.data);
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  }, [isSuperAdmin]);

  // Load roles
  const loadRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (debouncedSearch) filters.search = debouncedSearch;
      if (isActiveFilter !== 'all') {
        filters.isActive = isActiveFilter === 'active';
      }

      const allRoles = await roleApi.getAll(filters);
      setRoles(allRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof RoleApiError 
          ? error.message 
          : t('errors.loadFailed') || 'Failed to load roles',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, toast, tCommon, t]);

  useEffect(() => {
    loadRoles();
    loadPermissions();
    loadOrganizations();
  }, [loadRoles, loadPermissions, loadOrganizations]);

  // Delete role
  const handleDelete = async () => {
    if (!confirmDelete.id) return;

    try {
      setIsProcessing(true);
      await roleApi.delete(confirmDelete.id);
      toast({
        variant: 'success',
        title: tCommon('success') || 'Success',
        description: t('deleteSuccess') || 'Role deleted successfully',
      });
      setConfirmDelete({ open: false, id: null });
      loadRoles();
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
    }
  };

  // Handle create success
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    loadRoles();
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setEditingRole(null);
    loadRoles();
  };

  // Open edit modal
  const handleEdit = (role: Role) => {
    setEditingRole(role);
  };

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

  // Get organization name
  const getOrganizationName = (organizationId: string | null) => {
    if (!organizationId) return t('globalRole') || 'Global';
    const org = organizations.find(o => o.id === organizationId);
    return org?.name || organizationId;
  };

  // Filtered roles
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        return (
          role.name.toLowerCase().includes(searchLower) ||
          (role.description && role.description.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [roles, debouncedSearch]);

  // Statistics
  const stats = useMemo(() => {
    const active = filteredRoles.filter(r => r.isActive).length;
    const inactive = filteredRoles.filter(r => !r.isActive).length;
    const totalPermissions = filteredRoles.reduce((sum, r) => sum + r.permissions.length, 0);
    const avgPermissions = filteredRoles.length > 0 ? Math.round(totalPermissions / filteredRoles.length) : 0;
    return { total: filteredRoles.length, active, inactive, avgPermissions };
  }, [filteredRoles]);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-viridial-50/30 to-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-viridial-100 rounded-lg">
                      <Shield className="h-6 w-6 text-viridial-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{t('title') || 'Roles'}</h1>
                      <p className="mt-1 text-sm text-gray-500">
                        {t('description') || 'Manage roles and assign permissions to control access'}
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-viridial-600 hover:bg-viridial-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('create') || 'Create Role'}
                </Button>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card 
                  className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white animate-fade-in"
                  style={{ animationDelay: '0ms' }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {t('totalRoles') || 'Total Roles'}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                      </div>
                      <div className="p-3 bg-viridial-100 rounded-lg shadow-sm">
                        <Shield className="h-5 w-5 text-viridial-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card 
                  className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white animate-fade-in"
                  style={{ animationDelay: '50ms' }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {t('activeRoles') || 'Active'}
                        </p>
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card 
                  className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white animate-fade-in"
                  style={{ animationDelay: '100ms' }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {t('inactiveRoles') || 'Inactive'}
                        </p>
                        <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                      </div>
                      <div className="p-3 bg-gray-100 rounded-lg shadow-sm">
                        <XCircle className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card 
                  className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white animate-fade-in"
                  style={{ animationDelay: '150ms' }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {t('avgPermissions') || 'Avg Permissions'}
                        </p>
                        <p className="text-2xl font-bold text-viridial-600">{stats.avgPermissions}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg shadow-sm">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
                <CardHeader className="pb-3 bg-gray-50/50">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    {t('filters') || 'Filters'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder={t('searchPlaceholder') || 'Search by name or description...'}
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-10 bg-white border-gray-300 focus:border-viridial-500 focus:ring-viridial-500"
                        />
                      </div>
                    </div>

                    {/* Active Filter */}
                    <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
                      <SelectTrigger className="w-full sm:w-[200px] bg-white border-gray-300">
                        <SelectValue placeholder={t('filterByStatus') || 'Filter by status'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allStatuses') || 'All Statuses'}</SelectItem>
                        <SelectItem value="active">{t('active') || 'Active'}</SelectItem>
                        <SelectItem value="inactive">{t('inactive') || 'Inactive'}</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Refresh Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        loadRoles();
                        loadPermissions();
                      }}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      {tCommon('refresh') || 'Refresh'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Roles List */}
              {isLoading ? (
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="py-16 text-center">
                    <RefreshCw className="h-10 w-10 animate-spin mx-auto text-viridial-600 mb-4" />
                    <p className="text-gray-600 font-medium">{tCommon('loading') || 'Loading roles...'}</p>
                    <p className="text-sm text-gray-500 mt-2">{t('loadingDescription') || 'Please wait while we fetch the roles'}</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
                  <CardHeader className="border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">{t('allRoles') || 'All Roles'}</CardTitle>
                        <CardDescription className="mt-1">
                          {t('totalCount', { count: filteredRoles.length }) || `${filteredRoles.length} ${filteredRoles.length === 1 ? 'role' : 'roles'} found`}
                        </CardDescription>
                      </div>
                      {filteredRoles.length > 0 && (
                        <Badge variant="outline" className="text-sm">
                          {stats.active} {t('active') || 'active'}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {filteredRoles.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                          <Shield className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noRoles') || 'No roles found'}</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                          {search || isActiveFilter !== 'all' 
                            ? (t('noRolesFiltered') || 'Try adjusting your filters to see more results')
                            : (t('noRolesDescription') || 'Get started by creating your first role')}
                        </p>
                        {!search && isActiveFilter === 'all' && (
                          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-viridial-600 hover:bg-viridial-700">
                            <Plus className="h-4 w-4 mr-2" />
                            {t('createFirstRole') || 'Create Your First Role'}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-semibold text-gray-700">{t('name') || 'Name'}</TableHead>
                              <TableHead className="font-semibold text-gray-700">{t('description') || 'Description'}</TableHead>
                              {isSuperAdmin && (
                                <TableHead className="font-semibold text-gray-700">{t('organization') || 'Organization'}</TableHead>
                              )}
                              <TableHead className="font-semibold text-gray-700">{t('permissions') || 'Permissions'}</TableHead>
                              <TableHead className="font-semibold text-gray-700">{t('status') || 'Status'}</TableHead>
                              <TableHead className="text-right font-semibold text-gray-700">{t('actions') || 'Actions'}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredRoles.map((role, index) => (
                              <TableRow 
                                key={role.id} 
                                className="hover:bg-viridial-50/50 transition-colors animate-fade-in"
                                style={{ animationDelay: `${index * 30}ms` }}
                              >
                                <TableCell className="font-semibold">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-viridial-100 rounded">
                                      <Shield className="h-4 w-4 text-viridial-600" />
                                    </div>
                                    <span className="text-gray-900">{role.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-600 max-w-md">
                                  <p className="truncate" title={role.description || undefined}>
                                    {role.description || <span className="text-gray-400 italic">No description</span>}
                                  </p>
                                </TableCell>
                                {isSuperAdmin && (
                                  <TableCell>
                                    <Badge variant="outline" className="font-normal">
                                      {getOrganizationName(role.organizationId)}
                                    </Badge>
                                  </TableCell>
                                )}
                                <TableCell>
                                  <div className="flex flex-wrap gap-1.5">
                                    {role.permissions.length > 0 ? (
                                      <>
                                        {role.permissions.slice(0, 2).map((perm) => (
                                          <Badge key={perm.id} variant="secondary" className="text-xs font-normal">
                                            {perm.resource}:{perm.action}
                                          </Badge>
                                        ))}
                                        {role.permissions.length > 2 && (
                                          <Badge variant="outline" className="text-xs font-normal">
                                            +{role.permissions.length - 2} {t('more') || 'more'}
                                          </Badge>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-sm text-gray-400 italic">No permissions</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {role.isActive ? (
                                    <Badge className="bg-green-600 hover:bg-green-700 text-white border-0">
                                      <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                      {t('active') || 'Active'}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                      <XCircle className="h-3 w-3 mr-1.5" />
                                      {t('inactive') || 'Inactive'}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(role)}
                                      className="h-8 w-8 p-0 hover:bg-viridial-50"
                                      title={t('edit') || 'Edit role'}
                                    >
                                      <Edit className="h-4 w-4 text-gray-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setConfirmDelete({ open: true, id: role.id })}
                                      className="h-8 w-8 p-0 hover:bg-red-50"
                                      title={t('delete') || 'Delete role'}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Create Role Modal */}
              {isCreateModalOpen && (
                <CreateRoleModal
                  open={isCreateModalOpen}
                  onOpenChange={setIsCreateModalOpen}
                  permissions={permissions}
                  groupedPermissions={groupedPermissions}
                  organizations={isSuperAdmin ? organizations : []}
                  isSuperAdmin={isSuperAdmin}
                  onCreateSuccess={handleCreateSuccess}
                />
              )}

              {/* Edit Role Modal */}
              {editingRole && (
                <EditRoleModal
                  open={!!editingRole}
                  onOpenChange={(open) => {
                    if (!open) setEditingRole(null);
                  }}
                  role={editingRole}
                  permissions={permissions}
                  groupedPermissions={groupedPermissions}
                  organizations={isSuperAdmin ? organizations : []}
                  isSuperAdmin={isSuperAdmin}
                  onSaveSuccess={handleEditSuccess}
                />
              )}

              {/* Delete Confirmation */}
              <ConfirmationDialog
                open={confirmDelete.open}
                onOpenChange={(open) => setConfirmDelete({ open, id: confirmDelete.id })}
                title={t('deleteTitle') || 'Delete Role'}
                description={t('deleteDescription') || 'Are you sure you want to delete this role? Users with this role will lose their permissions.'}
                variant="danger"
                confirmText={tCommon('delete') || 'Delete'}
                cancelText={tCommon('cancel') || 'Cancel'}
                onConfirm={handleDelete}
                isLoading={isProcessing}
              />
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

