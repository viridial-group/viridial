'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, UserApiError, User as ApiUser, CreateUserDto, UpdateUserDto } from '@/lib/user-api';
import { organizationApi } from '@/lib/organization-api';
import { Organization } from '@/types/organization';
import dynamic from 'next/dynamic';
import { AgencyLayout } from '@/components/layout/AgencyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Mail,
  User as UserIcon,
  Building2,
  Shield,
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { UsersStatsCards } from '@/components/users/UsersStatsCards';
import { LanguageSelector } from '@/components/ui/language-selector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileJson } from 'lucide-react';
import { exportToCSV, exportToJSON, exportToExcel } from '@/utils/export';

// Type for simplified organization used in modals
type OrganizationOption = Pick<Organization, 'id' | 'name' | 'slug'>;

// Lazy load modals
const CreateUserModal = dynamic(() => import('@/components/users/CreateUserModal').then(mod => ({ default: mod.CreateUserModal })), {
  loading: () => null,
  ssr: false,
});

const EditUserModal = dynamic(() => import('@/components/users/EditUserModal').then(mod => ({ default: mod.EditUserModal })), {
  loading: () => null,
  ssr: false,
});

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const { user, isLoading: authLoading } = useAuth();

  // Check if user is super admin
  const isSuperAdmin = user?.role === 'super_admin';
  
  // Get user's organization ID
  const userOrganizationId = user?.organizationId;

  // State
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; ids: string[] }>({ open: false, ids: [] });
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [internalCodeFilter, setInternalCodeFilter] = useState('');
  const debouncedInternalCode = useDebounce(internalCodeFilter, 500);
  const [externalCodeFilter, setExternalCodeFilter] = useState('');
  const debouncedExternalCode = useDebounce(externalCodeFilter, 500);
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Load users
  const loadUsers = useCallback(async () => {
    // For non-super-admin users, require organizationId
    if (!isSuperAdmin && !userOrganizationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Backend UserFiltersDto only accepts: organizationId, role, isActive, search
      const filters: any = {};
      
      // Only add organizationId filter for non-super-admin users or if organization filter is set
      if (!isSuperAdmin && userOrganizationId) {
        filters.organizationId = userOrganizationId;
      } else if (isSuperAdmin && organizationFilter !== 'all') {
        filters.organizationId = organizationFilter;
      }

      if (debouncedSearch) filters.search = debouncedSearch;
      if (roleFilter !== 'all') filters.role = roleFilter;
      if (statusFilter === 'active') filters.isActive = true;
      if (statusFilter === 'inactive') filters.isActive = false;

      const response = await userApi.findAll(filters);
      setUsers(response.data);
      // Update pagination based on actual data (client-side pagination)
      if (response.meta) {
        setPagination({
          page: response.meta.page || 1,
          limit: response.meta.limit || response.data.length,
          total: response.meta.total || response.data.length,
          totalPages: response.meta.totalPages || 1,
        });
      } else {
        // If no meta, calculate from data
        setPagination({
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1,
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        variant: 'error',
        title: tCommon('error') || 'Error',
        description: error instanceof UserApiError
          ? error.message
          : t('errorLoadingUsers') || 'Failed to load users',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin, userOrganizationId, debouncedSearch, roleFilter, statusFilter, toast, t, tCommon]);

  // Load organizations (for modals)
  const loadOrganizations = useCallback(async () => {
    if (!userOrganizationId) return;

    try {
      const response = await organizationApi.findAll({ limit: 1000 });
      // Filter to only show user's organization
      const filteredOrgs = response.data
        .filter(org => org.id === userOrganizationId)
        .map(org => ({ id: org.id, name: org.name, slug: org.slug }));
      setOrganizations(filteredOrgs);
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  }, [userOrganizationId]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, debouncedInternalCode, debouncedExternalCode, roleFilter, statusFilter, emailVerifiedFilter, organizationFilter, sortBy, sortOrder]);

  // Wait for auth to load before attempting to load users
  useEffect(() => {
    // Don't load if auth is still loading
    if (authLoading) return;

    // If user is not loaded yet, stop loading
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Load users and organizations
    loadUsers();
    loadOrganizations();
  }, [authLoading, user, loadUsers, loadOrganizations]);

  // Reload users when filters change (for backend-supported filters)
  useEffect(() => {
    if (!authLoading && user) {
      loadUsers();
    }
  }, [debouncedSearch, roleFilter, statusFilter, organizationFilter, authLoading, user, loadUsers]);

  // Handle create user
  const handleCreateUser = async (data: CreateUserDto) => {
    try {
      setIsProcessing(true);
      // Ensure organizationId is set to user's organization
      const userData: CreateUserDto = {
        ...data,
        organizationId: userOrganizationId || data.organizationId,
      };
      await userApi.create(userData);
      toast({
        variant: 'success',
        title: tCommon('success') || 'Success',
        description: t('userCreated') || 'User created successfully',
      });
      setIsCreateModalOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        variant: 'error',
        title: tCommon('error') || 'Error',
        description: error instanceof UserApiError
          ? error.message
          : t('errorCreatingUser') || 'Failed to create user',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle update user
  const handleUpdateUser = useCallback(async (data: UpdateUserDto) => {
    if (!editingUser) return;
    try {
      setIsProcessing(true);
      await userApi.update(editingUser.id, data);
      toast({
        variant: 'success',
        title: tCommon('success') || 'Success',
        description: t('userUpdated') || 'User updated successfully',
      });
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: 'error',
        title: tCommon('error') || 'Error',
        description: error instanceof UserApiError
          ? error.message
          : t('errorUpdatingUser') || 'Failed to update user',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [editingUser, toast, t, tCommon, loadUsers]);

  // Handle delete users
  const handleRequestDeleteUsers = (ids: string[]) => {
    setConfirmDelete({ open: true, ids });
  };

  const handleDeleteUsers = async () => {
    try {
      setIsProcessing(true);
      const deletePromises = confirmDelete.ids.map(id => userApi.delete(id));
      await Promise.all(deletePromises);
      toast({
        variant: 'success',
        title: tCommon('success') || 'Success',
        description: t('usersDeleted', { count: confirmDelete.ids.length }) || `${confirmDelete.ids.length} user(s) deleted successfully`,
      });
      setSelectedUserIds(new Set());
      loadUsers();
    } catch (error) {
      console.error('Error deleting users:', error);
      toast({
        variant: 'error',
        title: tCommon('error') || 'Error',
        description: error instanceof UserApiError
          ? error.message
          : t('errorDeletingUsers') || 'Failed to delete users',
      });
    } finally {
      setIsProcessing(false);
      setConfirmDelete({ open: false, ids: [] });
    }
  };

  // Get unique roles from users
  const availableRoles = useMemo(() => {
    const roles = new Set(users.map(u => u.role));
    return Array.from(roles).sort();
  }, [users]);

  // Statistics
  const stats = useMemo(() => {
    const active = users.filter(u => u.isActive).length;
    const inactive = users.filter(u => !u.isActive).length;
    const byRole: Record<string, number> = {};
    users.forEach(u => {
      byRole[u.role] = (byRole[u.role] || 0) + 1;
    });
    return { total: users.length, active, inactive, byRole };
  }, [users]);

  // Filtered, sorted, and paginated users for display (client-side)
  const displayedUsers = useMemo(() => {
    let filtered = [...users];

    // Apply client-side filters (for fields not supported by backend)
    
    // Filter by internalCode
    if (debouncedInternalCode) {
      filtered = filtered.filter(user => 
        user.internalCode?.toLowerCase().includes(debouncedInternalCode.toLowerCase())
      );
    }

    // Filter by externalCode
    if (debouncedExternalCode) {
      filtered = filtered.filter(user => 
        user.externalCode?.toLowerCase().includes(debouncedExternalCode.toLowerCase())
      );
    }

    // Filter by emailVerified
    if (emailVerifiedFilter === 'verified') {
      filtered = filtered.filter(user => user.emailVerified === true);
    } else if (emailVerifiedFilter === 'unverified') {
      filtered = filtered.filter(user => user.emailVerified === false);
    }

    // Apply client-side sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'email':
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case 'role':
            aValue = a.role.toLowerCase();
            bValue = b.role.toLowerCase();
            break;
          case 'name':
            aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase() || a.email.toLowerCase();
            bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase() || b.email.toLowerCase();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === 'ASC' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    // Apply client-side pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filtered.slice(startIndex, endIndex);
  }, [users, debouncedInternalCode, debouncedExternalCode, emailVerifiedFilter, sortBy, sortOrder, page, limit]);

  // Calculate total filtered users (before pagination) for pagination display
  const totalFilteredUsers = useMemo(() => {
    let filtered = [...users];
    if (debouncedInternalCode) {
      filtered = filtered.filter(user => 
        user.internalCode?.toLowerCase().includes(debouncedInternalCode.toLowerCase())
      );
    }
    if (debouncedExternalCode) {
      filtered = filtered.filter(user => 
        user.externalCode?.toLowerCase().includes(debouncedExternalCode.toLowerCase())
      );
    }
    if (emailVerifiedFilter === 'verified') {
      filtered = filtered.filter(user => user.emailVerified === true);
    } else if (emailVerifiedFilter === 'unverified') {
      filtered = filtered.filter(user => user.emailVerified === false);
    }
    return filtered.length;
  }, [users, debouncedInternalCode, debouncedExternalCode, emailVerifiedFilter]);

  // Update pagination state based on filtered results
  useEffect(() => {
    const totalPages = Math.ceil(totalFilteredUsers / limit);
    setPagination(prev => ({
      ...prev,
      total: totalFilteredUsers,
      totalPages: totalPages,
    }));
  }, [totalFilteredUsers, limit]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(displayedUsers.map(u => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  // Handle select user
  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  // Handle edit
  const handleEdit = (user: ApiUser) => {
    setEditingUser(user);
  };

  // Redirect super admins to admin/users page
  // Super admins can see all users without organization filter
  // No need to redirect - they can use this page directly

  // Show loading while auth is loading
  if (authLoading || (isLoading && !user)) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md border-gray-200 shadow-sm">
            <CardContent className="pt-6 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-viridial-600 mb-4" />
              <p className="text-gray-600">{tCommon('loading') || 'Loading...'}</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  // Show error if user doesn't have an organization (for non-super-admin users)
  if (!isSuperAdmin && !userOrganizationId) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                {tCommon('error') || 'Error'}
              </CardTitle>
              <CardDescription>
                {t('noOrganization') || 'You are not associated with an organization'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/')}>
                {tCommon('backToHome') || 'Back to Home'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  // Super admins can see all users - no need for special handling

  // Handle bulk export
  const handleBulkExport = (format: 'csv' | 'json' | 'excel') => {
    const selectedIds = Array.from(selectedUserIds);
    const selectedUsers = displayedUsers.filter((user) => selectedIds.includes(user.id));
    
    if (selectedUsers.length === 0) {
      toast({
        variant: 'warning',
        title: t('noSelection') || 'No users selected',
        description: t('selectToExport') || 'Please select at least one user to export.',
      });
      return;
    }

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `users_${timestamp}`;

      const userHeaders = ['Name', 'Email', 'Role', 'Status', 'Email Verified', 'Created At'];
      const userRowMapper = (user: ApiUser) => [
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        user.email,
        user.role,
        user.isActive !== false ? 'Active' : 'Inactive',
        user.emailVerified ? 'Yes' : 'No',
        new Date(user.createdAt).toLocaleDateString(),
      ];

      switch (format) {
        case 'csv':
          exportToCSV(selectedUsers, `${filename}.csv`, userHeaders, userRowMapper);
          break;
        case 'json':
          exportToJSON(selectedUsers, `${filename}.json`);
          break;
        case 'excel':
          exportToExcel(selectedUsers, `${filename}.xlsx`, userHeaders, userRowMapper);
          break;
      }

      toast({
        variant: 'success',
        title: t('exportedSuccessfully') || 'Export successful',
        description: t('exportedCount', { count: selectedUsers.length, format: format.toUpperCase() }) || `${selectedUsers.length} user(s) exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        variant: 'error',
        title: t('exportFailed') || 'Export failed',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <AgencyLayout
      headerTitle={t('title') || 'Users'}
      headerSubtitle={t('description') || 'Manage users in your organization'}
      headerActions={
        <>
          <LanguageSelector />
          <Button 
            className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-sm h-9 px-4"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            {t('create') || 'Create User'}
          </Button>
        </>
      }
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Fixed Top Section */}
              <div className="flex-shrink-0 p-6 pb-4 space-y-4 overflow-hidden">
                {/* Stats Cards */}
                <UsersStatsCards users={users} rolesCount={availableRoles.length} />

                {/* Filter Bar */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  {/* Main Filter Row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t('searchPlaceholder') || 'Search by name, email...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-sm border-gray-200"
                      />
                    </div>
                    
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-40 h-9 text-sm border-gray-200">
                        <SelectValue placeholder={t('filterByRole') || 'Role'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allRoles') || 'All Roles'}</SelectItem>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 h-9 text-sm border-gray-200">
                        <SelectValue placeholder={t('filterByStatus') || 'Status'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allStatuses') || 'All Statuses'}</SelectItem>
                        <SelectItem value="active">{tCommon('active') || 'Active'}</SelectItem>
                        <SelectItem value="inactive">{tCommon('inactive') || 'Inactive'}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className="h-9 gap-2 border-gray-300"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      {showAdvancedFilters ? (t('lessFilters') || 'Less Filters') : (t('moreFilters') || 'More Filters')}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        loadUsers();
                        loadOrganizations();
                      }}
                      disabled={isLoading}
                      className="h-9 gap-2 border-gray-300"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      {tCommon('refresh') || 'Refresh'}
                    </Button>

                    {(search || roleFilter !== 'all' || statusFilter !== 'all' || organizationFilter !== 'all' || internalCodeFilter || externalCodeFilter || emailVerifiedFilter !== 'all') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearch('');
                          setInternalCodeFilter('');
                          setExternalCodeFilter('');
                          setOrganizationFilter('all');
                          setRoleFilter('all');
                          setStatusFilter('all');
                          setEmailVerifiedFilter('all');
                          loadUsers();
                        }}
                        className="h-9 text-xs text-gray-600 hover:text-gray-900"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        {tCommon('reset') || 'Reset'}
                      </Button>
                    )}
                  </div>

                  {/* Expanded Filters */}
                  {showAdvancedFilters && (
                    <div className="pt-3 border-t border-gray-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Organization Filter (only for super admins) */}
                        {isSuperAdmin && (
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                              {t('filterByOrganization') || 'Organization'}
                            </label>
                            <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                              <SelectTrigger className="h-9 text-sm border-gray-200">
                                <SelectValue placeholder={t('allOrganizations') || 'All Organizations'} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">{t('allOrganizations') || 'All Organizations'}</SelectItem>
                                {organizations.map((org) => (
                                  <SelectItem key={org.id} value={org.id}>
                                    {org.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Internal Code Filter */}
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                            {t('internalCode') || 'Internal Code'}
                          </label>
                          <Input
                            placeholder={t('searchInternalCode') || 'Search by internal code...'}
                            value={internalCodeFilter}
                            onChange={(e) => setInternalCodeFilter(e.target.value)}
                            className="h-9 text-sm border-gray-200"
                          />
                        </div>

                        {/* External Code Filter */}
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                            {t('externalCode') || 'External Code'}
                          </label>
                          <Input
                            placeholder={t('searchExternalCode') || 'Search by external code...'}
                            value={externalCodeFilter}
                            onChange={(e) => setExternalCodeFilter(e.target.value)}
                            className="h-9 text-sm border-gray-200"
                          />
                        </div>

                        {/* Email Verified Filter */}
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                            {t('emailVerified') || 'Email Verified'}
                          </label>
                          <Select value={emailVerifiedFilter} onValueChange={setEmailVerifiedFilter}>
                            <SelectTrigger className="h-9 text-sm border-gray-200">
                              <SelectValue placeholder={t('all') || 'All'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{t('all') || 'All'}</SelectItem>
                              <SelectItem value="verified">{t('verified') || 'Verified'}</SelectItem>
                              <SelectItem value="unverified">{t('unverified') || 'Unverified'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Results Header */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{tCommon('rowsPerPage') || 'Rows per page'}:</span>
                    <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                      <SelectTrigger className="w-20 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600">
                      {tCommon('showing') || 'Showing'} {((page - 1) * limit) + 1} {tCommon('to') || 'to'} {Math.min(page * limit, totalFilteredUsers)} {tCommon('of') || 'of'} {totalFilteredUsers}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedUserIds.size > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 h-7 px-3">
                            <Download className="h-3.5 w-3.5" />
                            {t('export') || 'Export'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleBulkExport('csv')}>
                            <FileText className="h-4 w-4 mr-2" />
                            {t('exportCSV') || 'Export as CSV'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkExport('json')}>
                            <FileJson className="h-4 w-4 mr-2" />
                            {t('exportJSON') || 'Export as JSON'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleBulkExport('excel')}>
                            <Download className="h-4 w-4 mr-2" />
                            {t('exportExcel') || 'Export as Excel'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {/* Bulk Actions */}
                {selectedUserIds.size > 0 && (
                  <div className="mb-4 p-4 bg-viridial-50 border border-viridial-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-sm">
                        {selectedUserIds.size} {t('selected') || 'selected'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestDeleteUsers(Array.from(selectedUserIds))}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('deleteSelected') || 'Delete Selected'}
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUserIds(new Set())}
                    >
                      {tCommon('clear') || 'Clear'}
                    </Button>
                  </div>
                )}

                {/* Users Table */}
                {isLoading ? (
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="py-16 text-center">
                      <RefreshCw className="h-10 w-10 animate-spin mx-auto text-viridial-600 mb-4" />
                      <p className="text-gray-600 font-medium">{tCommon('loading') || 'Loading users...'}</p>
                      <p className="text-sm text-gray-500 mt-2">{t('loadingDescription') || 'Please wait while we fetch the users'}</p>
                    </CardContent>
                  </Card>
                ) : displayedUsers.length === 0 ? (
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="py-16 text-center">
                      <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noUsers') || 'No users found'}</h3>
                      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        {search || internalCodeFilter || externalCodeFilter || roleFilter !== 'all' || statusFilter !== 'all' || emailVerifiedFilter !== 'all' || (isSuperAdmin && organizationFilter !== 'all')
                          ? (t('noUsersFiltered') || 'Try adjusting your filters to see more results')
                          : (t('noUsersDescription') || 'Get started by creating your first user')}
                      </p>
                      {!search && !internalCodeFilter && !externalCodeFilter && roleFilter === 'all' && statusFilter === 'all' && emailVerifiedFilter === 'all' && (!isSuperAdmin || organizationFilter === 'all') && (
                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-viridial-600 hover:bg-viridial-700">
                          <Plus className="h-4 w-4 mr-2" />
                          {t('createFirstUser') || 'Create Your First User'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border border-gray-200 shadow-sm bg-white">
                    <CardHeader className="border-b border-gray-200 bg-gray-50/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold">{t('allUsers') || 'All Users'}</CardTitle>
                          <CardDescription className="mt-1">
                            {t('totalCount', { count: totalFilteredUsers }) || `${totalFilteredUsers} ${totalFilteredUsers === 1 ? 'user' : 'users'} found`}
                          </CardDescription>
                        </div>
                        {displayedUsers.length > 0 && (
                          <Badge variant="outline" className="text-sm">
                            {stats.active} {tCommon('active') || 'active'}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 bg-gray-50/30">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100/80 border-b border-gray-200 hover:bg-gray-100/80">
                              <TableHead className="w-12 border-r border-gray-200">
                                <Checkbox
                                  checked={selectedUserIds.size > 0 && selectedUserIds.size === displayedUsers.length}
                                  indeterminate={selectedUserIds.size > 0 && selectedUserIds.size < displayedUsers.length}
                                  onCheckedChange={handleSelectAll}
                                />
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">{t('name') || 'Name'}</TableHead>
                              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">{t('email') || 'Email'}</TableHead>
                              {isSuperAdmin && (
                                <TableHead className="font-semibold text-gray-700 border-r border-gray-200">{t('organization') || 'Organization'}</TableHead>
                              )}
                              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">{t('internalCode') || 'Internal Code'}</TableHead>
                              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">{t('externalCode') || 'External Code'}</TableHead>
                              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">{t('role') || 'Role'}</TableHead>
                              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">{t('status') || 'Status'}</TableHead>
                              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">{t('emailVerified') || 'Email Verified'}</TableHead>
                              <TableHead className="text-right font-semibold text-gray-700">{tCommon('actions') || 'Actions'}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {displayedUsers.map((user, index) => (
                              <TableRow 
                                key={user.id} 
                                className={`border-b border-gray-200 transition-colors ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                } hover:bg-gray-100/70`}
                              >
                                <TableCell className="border-r border-gray-200">
                                  <Checkbox
                                    checked={selectedUserIds.has(user.id)}
                                    onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                                  />
                                </TableCell>
                                <TableCell className="font-semibold border-r border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-viridial-100 rounded-full">
                                      <UserIcon className="h-4 w-4 text-viridial-600" />
                                    </div>
                                    <span className="text-gray-900">
                                      {user.firstName || user.lastName
                                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                        : user.email}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-600 border-r border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                    <span>{user.email}</span>
                                  </div>
                                </TableCell>
                                {isSuperAdmin && (
                                  <TableCell className="text-gray-600 border-r border-gray-200">
                                    {user.organization ? (
                                      <div className="flex items-center gap-2">
                                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-sm">{user.organization.name}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-sm">—</span>
                                    )}
                                  </TableCell>
                                )}
                                <TableCell className="text-gray-600 border-r border-gray-200">
                                  <span className="text-sm font-mono">{user.internalCode || '—'}</span>
                                </TableCell>
                                <TableCell className="text-gray-600 border-r border-gray-200">
                                  <span className="text-sm font-mono">{user.externalCode || '—'}</span>
                                </TableCell>
                                <TableCell className="border-r border-gray-200">
                                  <Badge variant="outline" className="font-normal">
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell className="border-r border-gray-200">
                                  {user.isActive !== false ? (
                                    <Badge className="bg-green-600 hover:bg-green-700 text-white border-0">
                                      <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                      {tCommon('active') || 'Active'}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                      <XCircle className="h-3 w-3 mr-1.5" />
                                      {tCommon('inactive') || 'Inactive'}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="border-r border-gray-200">
                                  {user.emailVerified ? (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                      <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                      {t('verified') || 'Verified'}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                      <XCircle className="h-3 w-3 mr-1.5" />
                                      {t('unverified') || 'Unverified'}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => router.push(`/users/${user.id}`)}
                                      className="h-8 w-8 p-0"
                                      title={tCommon('view') || 'View'}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRequestDeleteUsers([user.id])}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {tCommon('showing') || 'Showing'} {((page - 1) * limit) + 1} {tCommon('to') || 'to'} {Math.min(page * limit, totalFilteredUsers)} {tCommon('of') || 'of'} {totalFilteredUsers}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={pagination.page === 1 || isLoading}
                      >
                        {tCommon('previous') || 'Previous'}
                      </Button>
                      <div className="text-sm text-gray-600">
                        {t('page', { page: pagination.page, total: pagination.totalPages }) || `Page ${pagination.page} of ${pagination.totalPages}`}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={pagination.page === pagination.totalPages || isLoading}
                      >
                        {tCommon('next') || 'Next'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Create User Modal */}
              {isCreateModalOpen && (
                <CreateUserModal
                  organizations={organizations}
                  open={isCreateModalOpen}
                  onOpenChange={setIsCreateModalOpen}
                  onCreate={handleCreateUser}
                />
              )}

              {/* Edit User Modal */}
              {editingUser && (
                <EditUserModal
                  user={editingUser}
                  organizations={organizations}
                  open={!!editingUser}
                  onOpenChange={(open) => {
                    if (!open) setEditingUser(null);
                  }}
                  onUpdate={handleUpdateUser}
                />
              )}

              {/* Delete Confirmation */}
              <ConfirmationDialog
                open={confirmDelete.open}
                onOpenChange={(open) => setConfirmDelete({ open, ids: confirmDelete.ids })}
                title={t('deleteTitle') || 'Delete Users'}
                description={t('deleteDescription', { count: confirmDelete.ids.length }) || `Are you sure you want to delete ${confirmDelete.ids.length} user(s)? This action cannot be undone.`}
                variant="danger"
                confirmText={tCommon('delete') || 'Delete'}
                cancelText={tCommon('cancel') || 'Cancel'}
                onConfirm={handleDeleteUsers}
                isLoading={isProcessing}
                itemsCount={confirmDelete.ids.length}
              />
      </div>
    </AgencyLayout>
  );
}

