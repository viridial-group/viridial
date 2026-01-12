'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { roleApi, RoleApiError, Role } from '@/lib/role-api';
import { permissionApi, PermissionApiError, Permission } from '@/lib/permission-api';
import dynamic from 'next/dynamic';
import { RoleCard } from '@/components/roles/RoleCard';
import { RolesStatsCards } from '@/components/roles/RolesStatsCards';
import { RolesFilterBar, RoleFilters } from '@/components/roles/RolesFilterBar';
import { AgencyLayout } from '@/components/layout/AgencyLayout';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Grid3x3,
  List,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
  Eye,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
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
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState('25');
  const [filters, setFilters] = useState<RoleFilters>({
    search: '',
    isActive: undefined,
  });
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
      const apiFilters: any = {};
      if (filters.search) apiFilters.search = filters.search;
      if (filters.isActive !== undefined) {
        apiFilters.isActive = filters.isActive;
      }

      const allRoles = await roleApi.getAll(apiFilters);
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
  }, [filters, toast, tCommon, t]);

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

  // Filtered roles - server-side filtering is already applied via API
  const filteredRoles = roles;

  // Pagination
  const paginatedRoles = useMemo(() => {
    const limit = parseInt(rowsPerPage);
    return filteredRoles.slice(0, limit);
  }, [filteredRoles, rowsPerPage]);

  const handleSelectRole = useCallback((roleId: string) => {
    setSelectedRoles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedRoles(new Set());
  }, []);

  return (
    <AgencyLayout
      headerTitle={t('title') || 'Roles'}
      headerSubtitle={t('description') || 'Manage roles and assign permissions to control access'}
      headerActions={
        <>
          <LanguageSelector />
          <Button 
            className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-sm h-9 px-4"
            onClick={() => {
              setEditingRole(null);
              setIsCreateModalOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            {t('create') || 'Create Role'}
          </Button>
        </>
      }
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Fixed Top Section */}
              <div className="flex-shrink-0 p-6 pb-4 space-y-4 overflow-hidden">
                {/* Stats Cards */}
                <RolesStatsCards roles={roles} />

                {/* Filter Bar */}
                <RolesFilterBar
                  filters={filters}
                  onFilterChange={setFilters}
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
                      {tCommon('showing')} 1 {tCommon('to')} {Math.min(parseInt(rowsPerPage), filteredRoles.length)} {tCommon('of')} {filteredRoles.length} {tCommon('results')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Results Area */}
              <div ref={scrollableAreaRef} className="flex-1 overflow-y-auto px-6 pb-4">
                {isLoading ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                    <div className="text-gray-500">{t('loading') || 'Loading roles...'}</div>
                  </div>
                ) : paginatedRoles.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center animate-fade-in">
                    <div className="text-gray-500 mb-2">{t('noRoles') || 'No roles found'}</div>
                    <div className="text-sm text-gray-400">
                      {filters.search || filters.isActive !== undefined
                        ? (t('noRolesFiltered') || 'Try adjusting your filters to see more results')
                        : (t('createFirstRole') || 'Create your first role to get started')}
                    </div>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedRoles.map((role) => (
                      <RoleCard
                        key={role.id}
                        role={role}
                        isSelected={selectedRoles.has(role.id)}
                        onSelect={() => handleSelectRole(role.id)}
                        onView={() => router.push(`/roles/${role.id}`)}
                        onEdit={() => handleEdit(role)}
                        onDelete={() => setConfirmDelete({ open: true, id: role.id })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100/80 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('name') || 'Name'}</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('description') || 'Description'}</th>
                          {isSuperAdmin && (
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('organization') || 'Organization'}</th>
                          )}
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('permissions') || 'Permissions'}</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">{t('status') || 'Status'}</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('actions') || 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedRoles.map((role, index) => (
                          <tr
                            key={role.id}
                            className={`hover:bg-gray-100/70 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                            }`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-viridial-600" />
                                {role.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">{role.description || '-'}</td>
                            {isSuperAdmin && (
                              <td className="px-4 py-3 text-sm border-r border-gray-200">
                                <Badge variant="outline" className="font-normal">
                                  {getOrganizationName(role.organizationId)}
                                </Badge>
                              </td>
                            )}
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <div className="flex flex-wrap gap-1.5">
                                {role.permissions && role.permissions.length > 0 ? (
                                  <>
                                    {role.permissions.slice(0, 2).map((perm: Permission) => (
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
                                  <span className="text-xs text-gray-400 italic">{t('noPermissions') || 'No permissions'}</span>
                                )}
                              </div>
                            </td>
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
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/roles/${role.id}`)}
                                  className="h-7 px-2"
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  {tCommon('view') || 'View'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(role)}
                                  className="h-7 px-2"
                                >
                                  {tCommon('edit')}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setConfirmDelete({ open: true, id: role.id })}
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
    </AgencyLayout>
  );
}

