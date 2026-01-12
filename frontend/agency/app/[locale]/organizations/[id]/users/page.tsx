'use client';

import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AuthGuard } from '@/middleware/auth-guard';
import { organizationApi } from '@/lib/organization-api';
import { userApi } from '@/lib/user-api';
import { roleApi } from '@/lib/role-api';
import { UserTable } from '@/components/users/UserTable';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Users, 
  Plus,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { BulkActions } from '@/components/organizations/BulkActions';
import type { User } from '@/types/organization';

// Lazy load modals
const InviteUserModal = dynamic(() => import('@/components/users/InviteUserModal').then(mod => ({ default: mod.InviteUserModal })), {
  loading: () => null,
  ssr: false,
});

const ConfirmationDialog = dynamic(() => import('@/components/ui/confirmation-dialog').then(mod => ({ default: mod.ConfirmationDialog })), {
  loading: () => null,
  ssr: false,
});

export default function OrganizationUserManagementPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');
  const { toast } = useToast();

  const [organization, setOrganization] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState(false);
  const [confirmDeleteUsers, setConfirmDeleteUsers] = useState({ open: false, userIds: [] as string[] });

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      setIsLoading(true);
      try {
        // Fetch organization
        const org = await organizationApi.findById(params.id as string);
        setOrganization(org);

        // Fetch users
        const usersResponse = await userApi.findAll({ organizationId: params.id as string });
        setUsers((usersResponse.data || []) as any as User[]);

        // Fetch roles
        const allRoles = await roleApi.getAll({ organizationId: params.id as string });
        setRoles(allRoles);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'error',
          title: t('error') || 'Error',
          description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, toast, t, tCommon]);

  const handleInviteUsers = async (userData: any) => {
    try {
      // Refresh users list
      const usersResponse = await userApi.findAll({ organizationId: params.id as string });
      setUsers((usersResponse.data || []) as any as User[]);
      
      toast({
        variant: 'success',
        title: t('userInvitedSuccessfully') || 'User invited successfully',
        description: 'The user has been invited to the organization.',
      });
      setIsInviteUserModalOpen(false);
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        variant: 'error',
        title: t('errorInvitingUser') || 'Error inviting user',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    }
  };

  const handleRequestDeleteUsers = (userIds: string[]) => {
    setConfirmDeleteUsers({ open: true, userIds });
  };

  const handleDeleteUsers = async () => {
    try {
      // Delete users one by one (no bulk delete endpoint)
      for (const userId of confirmDeleteUsers.userIds) {
        await userApi.delete(userId);
      }

      // Refresh users list
      const usersResponse = await userApi.findAll({ organizationId: params.id as string });
      setUsers((usersResponse.data || []) as any as User[]);
      
      setSelectedUserIds(new Set());
      setConfirmDeleteUsers({ open: false, userIds: [] });
      
      toast({
        variant: 'success',
        title: t('usersDeletedSuccessfully') || 'Users deleted successfully',
        description: `${confirmDeleteUsers.userIds.length} user(s) have been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting users:', error);
      toast({
        variant: 'error',
        title: t('errorDeletingUsers') || 'Error deleting users',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>{tCommon('loading') || 'Loading...'}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  if (!organization) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>{t('organizationNotFound') || 'Organization not found'}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <div className="flex flex-1 min-w-0">
          <Sidebar />

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <header className="flex-shrink-0 border-b border-gray-200 bg-white z-10">
              <div className="px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => router.push(`/organizations/${organization.id}`)}
                      className="h-8 w-8 text-gray-600 hover:text-gray-900"
                      title={tCommon('back')}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <h1 className="text-lg font-semibold text-gray-900">{t('userManagement') || 'User Management'}</h1>
                      <p className="text-xs text-gray-500">{organization.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-white h-9 px-4"
                      onClick={() => setIsInviteUserModalOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('inviteUser') || 'Invite User'}
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
              {/* Stats Card */}
              <div className="mb-6">
                <Card className="border-gray-200 bg-white">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100">
                        <Users className="h-5 w-5 text-viridial-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{t('organizationUsers') || 'Organization Users'}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {t('totalUsers') || 'Total'}: {users?.length ?? 0} {t('users') || 'users'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Users Table */}
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6 p-0">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Bulk Actions for Users */}
                    {selectedUserIds.size > 0 && (
                      <div className="p-4 bg-viridial-50 border-b border-viridial-200">
                        <BulkActions
                          selectedCount={selectedUserIds.size}
                          onDelete={() => handleRequestDeleteUsers(Array.from(selectedUserIds))}
                          onClearSelection={() => setSelectedUserIds(new Set())}
                        />
                      </div>
                    )}
                    <UserTable 
                      users={users} 
                      roles={roles}
                      selectedUserIds={selectedUserIds}
                      onSelectionChange={setSelectedUserIds}
                      onDelete={(user) => handleRequestDeleteUsers([user.id])}
                    />
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>

      {/* Modals */}
      {organization && (
        <>
          <InviteUserModal
            organization={organization}
            organizations={[organization]}
            open={isInviteUserModalOpen}
            onOpenChange={setIsInviteUserModalOpen}
            onInvite={handleInviteUsers}
          />
          <ConfirmationDialog
            open={confirmDeleteUsers.open}
            onOpenChange={(open) => setConfirmDeleteUsers({ open, userIds: open ? confirmDeleteUsers.userIds : [] })}
            title={t('confirmDeleteUsers') || 'Delete Users'}
            description={confirmDeleteUsers.userIds.length > 0 
              ? (t('confirmDeleteUsersDescription', { count: confirmDeleteUsers.userIds.length }) || `Are you sure you want to delete ${confirmDeleteUsers.userIds.length} user(s)? This action cannot be undone.`)
              : (t('confirmDeleteUsersDescription', { count: 0 }) || 'Are you sure you want to delete these users? This action cannot be undone.')
            }
            variant="danger"
            confirmText={tCommon('delete') || 'Delete'}
            cancelText={tCommon('cancel') || 'Cancel'}
            onConfirm={handleDeleteUsers}
          />
        </>
      )}
    </AuthGuard>
  );
}

