'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { PermissionCard } from '@/components/permissions/PermissionCard';
import { PermissionsStatsCards } from '@/components/permissions/PermissionsStatsCards';
import { PermissionsFilterBar } from '@/components/permissions/PermissionsFilterBar';
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
import { permissionApi, PermissionApiError } from '@/lib/permission-api';
import type { Permission, CreatePermissionDto, PermissionFilters } from '@/types/admin';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

// Lazy load modals
const CreatePermissionModalGeneric = dynamic(() => import('@/components/permissions/CreatePermissionModalGeneric').then(mod => ({ default: mod.CreatePermissionModalGeneric })), {
  loading: () => null,
  ssr: false,
});

export default function PermissionsPage() {
  const t = useTranslations('admin.permissions');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { toast } = useToast();
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState('25');
  const [filters, setFilters] = useState<PermissionFilters>({
    search: '',
    resourceId: undefined,
    resource: undefined,
    action: undefined,
  });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  // Load permissions
  const loadPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await permissionApi.getAll(filters);
      setPermissions(data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      toast({
        title: t('errors.loadFailed') || 'Failed to load permissions',
        description: error instanceof PermissionApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, t, toast]);

  // Reload when filters change
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const handleCreateSuccess = (newPermission: Permission) => {
    setPermissions((prev) => [newPermission, ...prev]);
    setIsCreateModalOpen(false);
    setEditingPermission(null);
    loadPermissions(); // Reload to get updated list
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await permissionApi.delete(id);
      setPermissions((prev) => prev.filter(p => p.id !== id));
      toast({
        variant: 'success',
        title: t('success.deleted') || 'Permission deleted',
        description: t('success.deletedDescription') || 'Permission has been deleted successfully',
      });
      setConfirmDelete({ open: false, id: null });
    } catch (error) {
      console.error('Failed to delete permission:', error);
      toast({
        variant: 'error',
        title: t('errors.deleteFailed') || 'Failed to delete permission',
        description: error instanceof PermissionApiError ? error.message : 'An error occurred',
      });
    }
  };

  const handleSelectPermission = useCallback((permissionId: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedPermissions(new Set());
  }, []);

  // Filtered permissions - server-side filtering is already applied via API
  const filteredPermissions = permissions;

  // Pagination
  const paginatedPermissions = useMemo(() => {
    const limit = parseInt(rowsPerPage);
    return filteredPermissions.slice(0, limit);
  }, [filteredPermissions, rowsPerPage]);

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
                    <h1 className="text-lg font-semibold text-gray-900">{t('title') || 'Permissions'}</h1>
                    <p className="text-xs text-gray-500">{t('subtitle') || 'Manage permissions for the RBAC system'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <LanguageSelector />
                    <Button 
                      className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-sm h-9 px-4"
                      onClick={() => {
                        setEditingPermission(null);
                        setIsCreateModalOpen(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('newPermission') || 'New Permission'}
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
                <PermissionsStatsCards permissions={permissions} />

                {/* Filter Bar */}
                <PermissionsFilterBar
                  filters={filters}
                  onFilterChange={setFilters}
                  permissions={permissions}
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
                      {tCommon('showing')} 1 {tCommon('to')} {Math.min(parseInt(rowsPerPage), filteredPermissions.length)} {tCommon('of')} {filteredPermissions.length} {tCommon('results')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Results Area */}
              <div ref={scrollableAreaRef} className="flex-1 overflow-y-auto px-6 pb-4">
                {isLoading ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                    <div className="text-gray-500">{t('loading') || 'Loading permissions...'}</div>
                  </div>
                ) : paginatedPermissions.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center animate-fade-in">
                    <div className="text-gray-500 mb-2">{t('noPermissions') || 'No permissions found'}</div>
                    <div className="text-sm text-gray-400">
                      {t('createFirstPermission') || 'Create your first permission to get started'}
                    </div>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedPermissions.map((permission) => (
                      <PermissionCard
                        key={permission.id}
                        permission={permission}
                        isSelected={selectedPermissions.has(permission.id)}
                        onSelect={() => handleSelectPermission(permission.id)}
                        onView={() => router.push(`/admin/permissions/${permission.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">Resource</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">Action</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedPermissions.map((permission, index) => (
                          <tr
                            key={permission.id}
                            className={`hover:bg-gray-100/70 cursor-pointer ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                            }`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">{permission.resource}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">{permission.action}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">{permission.description || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/admin/permissions/${permission.id}`);
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
                                    handleEdit(permission);
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
                                    setConfirmDelete({ open: true, id: permission.id });
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

      {/* Create/Edit Permission Modal */}
      <CreatePermissionModalGeneric
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPermission(null);
        }}
        onSuccess={handleCreateSuccess}
        permission={editingPermission || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open, id: confirmDelete.id })}
        title={t('confirmDelete.title') || 'Delete Permission'}
        description={t('confirmDelete.description') || 'Are you sure you want to delete this permission? This action cannot be undone.'}
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

