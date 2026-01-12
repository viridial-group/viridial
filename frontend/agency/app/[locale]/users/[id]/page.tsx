'use client';

import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AgencyLayout } from '@/components/layout/AgencyLayout';
import { userApi, User as ApiUser } from '@/lib/user-api';
import { organizationApi } from '@/lib/organization-api';
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
  Building2, 
  Shield, 
  Mail,
  Phone as PhoneIcon,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Key,
  Globe,
  Plus,
  Power,
  RefreshCw,
  Download,
  MoreVertical,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

// Lazy load modals
const EditUserModal = dynamic(() => import('@/components/users/EditUserModal').then(mod => ({ default: mod.EditUserModal })), {
  loading: () => null,
  ssr: false,
});
const AssignRolesModal = dynamic(() => import('@/components/users/AssignRolesModal').then(mod => ({ default: mod.AssignRolesModal })), {
  loading: () => null,
  ssr: false,
});
const ChangeOrganizationModal = dynamic(() => import('@/components/users/ChangeOrganizationModal').then(mod => ({ default: mod.ChangeOrganizationModal })), {
  loading: () => null,
  ssr: false,
});
const ResetPasswordModal = dynamic(() => import('@/components/users/ResetPasswordModal').then(mod => ({ default: mod.ResetPasswordModal })), {
  loading: () => null,
  ssr: false,
});

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isAssignRolesModalOpen, setIsAssignRolesModalOpen] = useState(false);
  const [isChangeOrganizationModalOpen, setIsChangeOrganizationModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<{ open: boolean }>({ open: false });
  const [confirmRemoveRole, setConfirmRemoveRole] = useState<{ open: boolean; roleId?: string }>({ open: false });

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        // Fetch user
        const userData = await userApi.getById(params.id as string);
        setUser(userData);

        // Fetch organization if user has one
        if (userData.organizationId) {
          try {
            const org = await organizationApi.findById(userData.organizationId);
            setOrganization(org);
          } catch (error) {
            console.error('Error fetching organization:', error);
          }
        }

        // Fetch all organizations for the edit modal
        try {
          const orgsResponse = await organizationApi.findAll({ page: 1, limit: 1000 });
          setOrganizations(orgsResponse.data || []);
        } catch (error) {
          console.error('Error fetching organizations:', error);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error instanceof Error ? error.message : 'Failed to load user');
        toast({
          variant: 'error',
          title: t('errorLoadingUser') || 'Error loading user',
          description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, toast, t, tCommon]);

  // Refresh function to reload all data
  const refreshData = async () => {
    if (!params.id) return;
    
    try {
      const userData = await userApi.getById(params.id as string);
      setUser(userData);

      if (userData.organizationId) {
        try {
          const org = await organizationApi.findById(userData.organizationId);
          setOrganization(org);
        } catch (error) {
          console.error('Error fetching organization:', error);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Handle user update
  const handleSaveUser = async (data: any) => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const updatedUser = await userApi.update(user.id, data);
      setUser(updatedUser);
      
      // Refresh organization if organizationId changed
      if (data.organizationId !== undefined && data.organizationId !== user.organizationId) {
        if (data.organizationId) {
          try {
            const org = await organizationApi.findById(data.organizationId);
            setOrganization(org);
          } catch (error) {
            console.error('Error fetching organization:', error);
          }
        } else {
          setOrganization(null);
        }
      }
      
      toast({
        variant: 'success',
        title: t('userUpdated') || 'User updated',
        description: t('userUpdatedSuccessfully') || 'The user has been updated successfully.',
      });
      setIsEditUserModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: 'error',
        title: t('errorUpdatingUser') || 'Error updating user',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle user deletion
  const handleRequestDeleteUser = () => {
    setConfirmDeleteUser({ open: true });
  };

  const handleConfirmDeleteUser = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      await userApi.delete(user.id);
      toast({
        variant: 'success',
        title: t('userDeleted') || 'User deleted',
        description: t('userDeletedSuccessfully') || 'The user has been deleted successfully.',
      });
      router.push('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'error',
        title: t('errorDeletingUser') || 'Error deleting user',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
      setConfirmDeleteUser({ open: false });
    }
  };

  // Handle role assignment
  const handleAssignRoles = async (roleIds: string[]) => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const updatedUser = await userApi.assignRoles(user.id, roleIds);
      setUser(updatedUser);
      toast({
        variant: 'success',
        title: t('rolesAssigned') || 'Roles assigned',
        description: t('rolesAssignedSuccessfully') || 'Roles have been assigned successfully.',
      });
    } catch (error) {
      console.error('Error assigning roles:', error);
      toast({
        variant: 'error',
        title: t('errorAssigningRoles') || 'Error assigning roles',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle role removal
  const handleRequestRemoveRole = (roleId: string) => {
    setConfirmRemoveRole({ open: true, roleId });
  };

  const handleConfirmRemoveRole = async () => {
    if (!user || !confirmRemoveRole.roleId) return;
    
    setIsProcessing(true);
    try {
      const updatedUser = await userApi.removeRoles(user.id, [confirmRemoveRole.roleId]);
      setUser(updatedUser);
      toast({
        variant: 'success',
        title: t('roleRemoved') || 'Role removed',
        description: t('roleRemovedSuccessfully') || 'Role has been removed successfully.',
      });
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        variant: 'error',
        title: t('errorRemovingRole') || 'Error removing role',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
      setConfirmRemoveRole({ open: false });
    }
  };

  // Handle organization change
  const handleChangeOrganization = async (organizationId: string | null) => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const updatedUser = await userApi.update(user.id, { organizationId });
      setUser(updatedUser);
      
      // Refresh organization
      if (organizationId) {
        try {
          const org = await organizationApi.findById(organizationId);
          setOrganization(org);
        } catch (error) {
          console.error('Error fetching organization:', error);
        }
      } else {
        setOrganization(null);
      }
      
      toast({
        variant: 'success',
        title: t('organizationChanged') || 'Organization changed',
        description: t('organizationChangedSuccessfully') || 'Organization has been changed successfully.',
      });
    } catch (error) {
      console.error('Error changing organization:', error);
      toast({
        variant: 'error',
        title: t('errorChangingOrganization') || 'Error changing organization',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (newPassword: string) => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      await userApi.resetPassword(user.id, { newPassword });
      toast({
        variant: 'success',
        title: t('passwordReset') || 'Password reset',
        description: t('passwordResetSuccessfully') || 'Password has been reset successfully.',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        variant: 'error',
        title: t('errorResettingPassword') || 'Error resetting password',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const updatedUser = await userApi.update(user.id, { isActive: !user.isActive });
      setUser(updatedUser);
      toast({
        variant: 'success',
        title: user.isActive ? (t('userDeactivated') || 'User deactivated') : (t('userActivated') || 'User activated'),
        description: user.isActive 
          ? (t('userDeactivatedSuccessfully') || 'User has been deactivated successfully.')
          : (t('userActivatedSuccessfully') || 'User has been activated successfully.'),
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        variant: 'error',
        title: t('errorUpdatingUser') || 'Error updating user',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle export user data
  const handleExportUserData = () => {
    if (!user) return;
    
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      internalCode: user.internalCode,
      externalCode: user.externalCode,
      role: user.role,
      organization: organization ? {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      } : null,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      roles: user.userRoles?.map(ur => ({
        id: ur.roleId,
        name: ur.role?.name,
        description: ur.role?.description,
        assignedAt: ur.assignedAt,
        permissions: ur.role?.permissions || [],
      })) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-${user.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      variant: 'success',
      title: t('dataExported') || 'Data exported',
      description: t('dataExportedSuccessfully') || 'User data has been exported successfully.',
    });
  };

  if (isLoading) {
    return (
      <AgencyLayout>
        <div className="p-6">
          <Card className="max-w-md border-gray-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle>{tCommon('loading') || 'Loading...'}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </AgencyLayout>
    );
  }

  if (!user) {
    return (
      <AgencyLayout>
        <div className="p-6">
          <Card className="max-w-md border-gray-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle>{t('userNotFound') || 'User not found'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/users')}>
                {tCommon('backToHome') || 'Back to users'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AgencyLayout>
    );
  }

  const fullName = user.firstName || user.lastName 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : user.email;

  // Get all permissions from user roles
  const allPermissions = user.userRoles?.flatMap(userRole => 
    userRole.role?.permissions || []
  ) || [];

  // Group permissions by resource
  const permissionsByResource = allPermissions.reduce((acc, perm) => {
    const resource = perm.resource || 'other';
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(perm);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  return (
    <AgencyLayout
      headerContent={
        <>
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
            <h1 className="text-lg font-semibold text-gray-900">{fullName}</h1>
            <p className="text-xs text-gray-500">{t('userDetails') || 'User details'}</p>
          </div>
        </>
      }
      headerActions={
        <>
          <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm h-9 px-4 gap-2"
                        disabled={isProcessing}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                        {tCommon('more') || 'More'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleToggleActive} disabled={isProcessing}>
                        <Power className={`h-3.5 w-3.5 mr-2 ${user.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                        {user.isActive ? (t('deactivate') || 'Deactivate') : (t('activate') || 'Activate')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsAssignRolesModalOpen(true)} disabled={isProcessing}>
                        <Shield className="h-3.5 w-3.5 mr-2" />
                        {t('assignRoles') || 'Assign Roles'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsChangeOrganizationModalOpen(true)} disabled={isProcessing}>
                        <Building2 className="h-3.5 w-3.5 mr-2" />
                        {t('changeOrganization') || 'Change Organization'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsResetPasswordModalOpen(true)} disabled={isProcessing}>
                        <Key className="h-3.5 w-3.5 mr-2" />
                        {t('resetPassword') || 'Reset Password'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleExportUserData} disabled={isProcessing}>
                        <Download className="h-3.5 w-3.5 mr-2" />
                        {t('exportUserData') || 'Export User Data'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="text-sm h-9 px-4 gap-2"
            onClick={() => setIsEditUserModalOpen(true)}
            disabled={isProcessing}
          >
            <Edit className="h-3.5 w-3.5" />
            {tCommon('edit')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-sm h-9 px-4 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleRequestDeleteUser}
            disabled={isProcessing}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {tCommon('delete')}
          </Button>
        </>
      }
    >
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('status') || 'Status'}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {user.isActive ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {tCommon('active')}
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        {tCommon('inactive')}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('emailVerified') || 'Email Verified'}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {user.emailVerified ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t('verified')}
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        {t('unverified')}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('roles') || 'Roles'}</div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">
                    {user.userRoles?.length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('createdAt') || tCommon('createdAt') || 'Created'}</div>
                  <div className="text-sm font-medium text-gray-900 mt-2">
                    {new Date(user.createdAt).toLocaleDateString(locale)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                <TabsList className="bg-white border border-gray-200 w-full sm:w-auto">
                  <TabsTrigger value="overview" className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    {t('overview') || 'Overview'}
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="gap-2">
                    <Shield className="h-4 w-4" />
                    {t('roles') || 'Roles'} ({user.userRoles?.length || 0})
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* General Information */}
                  <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 bg-gray-50/50">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-viridial-600" />
                        {t('userInformation') || 'User Information'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                          <UserIcon className="h-6 w-6 text-viridial-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 mb-1">{fullName}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-0.5">{t('email') || 'Email'}</div>
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                          </div>
                        </div>

                        {user.phone && (
                          <div className="flex items-center gap-3">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500 mb-0.5">{t('phone') || 'Phone'}</div>
                              <div className="text-sm font-medium text-gray-900">{user.phone}</div>
                            </div>
                          </div>
                        )}

                        {user.internalCode && (
                          <div className="flex items-center gap-3">
                            <Key className="h-4 w-4 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500 mb-0.5">{t('internalCode') || 'Internal Code'}</div>
                              <div className="text-sm font-medium text-gray-900">{user.internalCode}</div>
                            </div>
                          </div>
                        )}

                        {user.externalCode && (
                          <div className="flex items-center gap-3">
                            <Key className="h-4 w-4 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500 mb-0.5">{t('externalCode') || 'External Code'}</div>
                              <div className="text-sm font-medium text-gray-900">{user.externalCode}</div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-0.5">{t('createdAt') || tCommon('createdAt') || 'Created'}</div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(user.createdAt).toLocaleDateString(locale, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>

                        {user.updatedAt && (
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500 mb-0.5">{t('updatedAt') || tCommon('updatedAt') || 'Last Updated'}</div>
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(user.updatedAt).toLocaleDateString(locale, {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Organization & Status */}
                  <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 bg-gray-50/50">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-viridial-600" />
                        {t('organizationAndStatus') || 'Organization & Status'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {organization ? (
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex-shrink-0">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1">{t('organization') || 'Organization'}</div>
                            <div className="text-sm font-semibold text-gray-900 mb-3">{organization.name}</div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/organizations/${organization.id}`)}
                                className="h-8 px-3 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-50 gap-1.5"
                              >
                                {t('viewOrganization') || 'View Organization'}
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsChangeOrganizationModalOpen(true)}
                                className="h-8 px-3 text-xs text-viridial-600 hover:text-viridial-700 hover:bg-viridial-50 gap-1.5 border-viridial-200"
                                disabled={isProcessing}
                              >
                                <Edit className="h-3 w-3" />
                                {t('changeOrganization') || 'Change'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
                            <Building2 className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1">{t('organization') || 'Organization'}</div>
                            <div className="text-sm font-medium text-gray-500 mb-3">{t('noOrganization') || 'No organization'}</div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsChangeOrganizationModalOpen(true)}
                              className="h-8 px-3 text-xs text-viridial-600 hover:text-viridial-700 hover:bg-viridial-50 gap-1.5 border-viridial-200"
                              disabled={isProcessing}
                            >
                              <Plus className="h-3 w-3" />
                              {t('assignOrganization') || 'Assign Organization'}
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">{t('status') || 'Status'}</div>
                          {user.isActive ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {tCommon('active')}
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              {tCommon('inactive')}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">{t('emailVerified') || 'Email Verified'}</div>
                          {user.emailVerified ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {t('verified')}
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              {t('unverified')}
                            </Badge>
                          )}
                        </div>

                        {user.role && (
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">{t('role') || 'Role'}</div>
                            <Badge variant="outline" className="border-gray-300">
                              {user.role}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Roles Tab */}
              <TabsContent value="roles" className="space-y-6">
                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 bg-gray-50/50">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-viridial-600" />
                      {t('assignedRoles') || 'Assigned Roles'}
                      {user.userRoles && user.userRoles.length > 0 && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-viridial-100 text-viridial-700 border-viridial-200">
                          {user.userRoles.length}
                        </Badge>
                      )}
                    </CardTitle>
                    <Button
                      size="sm"
                      className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-white h-9 px-4"
                      onClick={() => setIsAssignRolesModalOpen(true)}
                      disabled={isProcessing}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('assignRoles') || 'Assign Roles'}
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {user.userRoles && user.userRoles.length > 0 ? (
                      <div className="space-y-3">
                        {user.userRoles.map((userRole, index) => (
                          <div
                            key={userRole.roleId || index}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white hover:border-viridial-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                                  <Shield className="h-5 w-5 text-viridial-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="text-sm font-semibold text-gray-900">
                                      {userRole.role?.name || user.role || 'Unknown Role'}
                                    </div>
                                    <Badge
                                      variant={userRole.role?.isActive ? 'default' : 'secondary'}
                                      className={`text-xs px-2 py-0.5 ${
                                        userRole.role?.isActive 
                                          ? 'bg-green-100 text-green-800 border-green-200' 
                                          : 'bg-gray-100 text-gray-800 border-gray-200'
                                      }`}
                                    >
                                      {userRole.role?.isActive ? tCommon('active') : tCommon('inactive')}
                                    </Badge>
                                  </div>
                                  {userRole.role?.description && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {userRole.role.description}
                                    </div>
                                  )}
                                  {userRole.assignedAt && (
                                    <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {t('assignedAt') || 'Assigned'} {new Date(userRole.assignedAt).toLocaleDateString(locale)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRequestRemoveRole(userRole.roleId)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                disabled={isProcessing}
                                title={t('removeRole') || 'Remove role'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {userRole.role?.permissions && userRole.role.permissions.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <Key className="h-3.5 w-3.5 text-gray-400" />
                                  {t('permissionsLabel') || 'Permissions'} 
                                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-50">
                                    {userRole.role.permissions.length}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {userRole.role.permissions.map((permission) => (
                                    <div
                                      key={permission.id}
                                      className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                      <span className="font-medium text-gray-900">{permission.resource}</span>
                                      <span className="text-gray-400">:</span>
                                      <span className="text-gray-600">{permission.action}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {t('noRolesAssigned') || 'No roles assigned'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('noRolesAssignedDescription') || 'This user does not have any roles assigned yet.'}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* All Permissions Summary */}
                {allPermissions.length > 0 && (
                  <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 bg-gray-50/50">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-viridial-600" />
                        {t('allPermissions') || 'All Permissions'}
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-viridial-100 text-viridial-700 border-viridial-200">
                          {allPermissions.length}
                        </Badge>
                      </CardTitle>
                      <div className="text-xs text-gray-500 font-medium">
                        {Object.keys(permissionsByResource).length} {t('resources') || 'resources'}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {Object.entries(permissionsByResource).map(([resource, permissions]) => (
                          <div key={resource} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white">
                            <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Globe className="h-4 w-4 text-viridial-500" />
                              {resource.charAt(0).toUpperCase() + resource.slice(1)}
                              <Badge variant="outline" className="text-xs px-2 py-0.5 ml-auto bg-gray-50">
                                {permissions.length} {t('permissionsCount') || 'permissions'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {permissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                  <span className="font-medium text-gray-900">{permission.resource}</span>
                                  <span className="text-gray-400">:</span>
                                  <span className="text-gray-600">{permission.action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
      </div>

      {/* Edit User Modal */}
      {user && (
        <EditUserModal
          user={user || undefined}
          organizations={organizations}
          open={isEditUserModalOpen}
          onOpenChange={setIsEditUserModalOpen}
          onUpdate={handleSaveUser}
        />
      )}

      {/* Assign Roles Modal */}
      {user && (
        <AssignRolesModal
          user={user || undefined}
          open={isAssignRolesModalOpen}
          onOpenChange={setIsAssignRolesModalOpen}
          onAssign={handleAssignRoles}
        />
      )}

      {/* Change Organization Modal */}
      {user && (
        <ChangeOrganizationModal
          user={user || undefined}
          open={isChangeOrganizationModalOpen}
          onOpenChange={setIsChangeOrganizationModalOpen}
          onChange={handleChangeOrganization}
        />
      )}

      {/* Reset Password Modal */}
      {user && (
        <ResetPasswordModal
          user={user || undefined}
          open={isResetPasswordModalOpen}
          onOpenChange={setIsResetPasswordModalOpen}
          onReset={handleResetPassword}
        />
      )}

      {/* Delete User Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDeleteUser.open}
        onOpenChange={(open) => setConfirmDeleteUser({ open })}
        title={t('deleteUser') || 'Delete User'}
        description={t('deleteUserDescription') || `Are you sure you want to delete ${fullName}? This action cannot be undone.`}
        confirmText={tCommon('delete')}
        cancelText={tCommon('cancel')}
        onConfirm={handleConfirmDeleteUser}
        variant="danger"
      />

      {/* Remove Role Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmRemoveRole.open}
        onOpenChange={(open) => setConfirmRemoveRole({ open })}
        title={t('removeRole') || 'Remove Role'}
        description={t('removeRoleDescription') || `Are you sure you want to remove this role from ${fullName}?`}
        confirmText={tCommon('remove') || 'Remove'}
        cancelText={tCommon('cancel')}
        onConfirm={handleConfirmRemoveRole}
        variant="danger"
      />
    </AgencyLayout>
  );
}

