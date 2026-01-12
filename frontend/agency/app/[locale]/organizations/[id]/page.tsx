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
import type { Subscription, Plan } from '@/types/plans';
import { UserTable } from '@/components/users/UserTable';
import { RoleCard } from '@/components/roles/RoleCard';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Shield, 
  Plus,
  Settings,
  MapPin,
  Phone as PhoneIcon,
  Mail,
  CheckCircle2,
  XCircle,
  Network,
  ChevronRight,
  ExternalLink,
  GitBranch,
  ChevronUp,
  Pencil,
  ChevronDown
} from 'lucide-react';
import { BulkActions } from '@/components/organizations/BulkActions';

// Lazy load modals to improve initial page load time
const EditGeneralInfoModal = dynamic(() => import('@/components/organizations/EditGeneralInfoModal').then(mod => ({ default: mod.EditGeneralInfoModal })), {
  loading: () => null,
  ssr: false,
});

const EditContactInfoModal = dynamic(() => import('@/components/organizations/EditContactInfoModal').then(mod => ({ default: mod.EditContactInfoModal })), {
  loading: () => null,
  ssr: false,
});

const InviteUserModal = dynamic(() => import('@/components/users/InviteUserModal').then(mod => ({ default: mod.InviteUserModal })), {
  loading: () => null,
  ssr: false,
});

const CreateOrganizationModal = dynamic(() => import('@/components/organizations/CreateOrganizationModal').then(mod => ({ default: mod.CreateOrganizationModal })), {
  loading: () => null,
  ssr: false,
});

const AddExistingSubOrganizationModal = dynamic(() => import('@/components/organizations/AddExistingSubOrganizationModal').then(mod => ({ default: mod.AddExistingSubOrganizationModal })), {
  loading: () => null,
  ssr: false,
});

const ChangeParentModal = dynamic(() => import('@/components/organizations/ChangeParentModal').then(mod => ({ default: mod.ChangeParentModal })), {
  loading: () => null,
  ssr: false,
});

const ChangeMultipleParentsModal = dynamic(() => import('@/components/organizations/ChangeMultipleParentsModal').then(mod => ({ default: mod.ChangeMultipleParentsModal })), {
  loading: () => null,
  ssr: false,
});

const ConfirmationDialog = dynamic(() => import('@/components/ui/confirmation-dialog').then(mod => ({ default: mod.ConfirmationDialog })), {
  loading: () => null,
  ssr: false,
});
import { Organization, Address, Phone, Email, User } from '@/types/organization';
import type { User as UserApiUser } from '@/lib/user-api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, GitBranch as GitBranchIcon, MoreVertical, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('organizations');
  const tUsers = useTranslations('users');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [parentOrganization, setParentOrganization] = useState<Organization | null>(null);
  const [subOrganizations, setSubOrganizations] = useState<Organization[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states (must be declared before conditional returns)
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState(false);
  const [isCreateSubOrganizationModalOpen, setIsCreateSubOrganizationModalOpen] = useState(false);
  const [isAddExistingSubOrganizationModalOpen, setIsAddExistingSubOrganizationModalOpen] = useState(false);
  const [isChangeParentModalOpen, setIsChangeParentModalOpen] = useState(false);
  const [isChangeMultipleParentsModalOpen, setIsChangeMultipleParentsModalOpen] = useState(false);
  
  // Selection states
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedSubOrgIds, setSelectedSubOrgIds] = useState<Set<string>>(new Set());
  
  // Confirmation dialogs states
  const [confirmDeleteUsers, setConfirmDeleteUsers] = useState<{ open: boolean; userIds: string[] }>({ open: false, userIds: [] });
  const [confirmDeleteSubOrgs, setConfirmDeleteSubOrgs] = useState<{ open: boolean; orgIds: string[] }>({ open: false, orgIds: [] });
  const [confirmChangeParent, setConfirmChangeParent] = useState<{ open: boolean; newParentId: string | null }>({ open: false, newParentId: null });
  
  // État pour gérer l'expansion du bloc de contact
  const [isContactExpanded, setIsContactExpanded] = useState(false);

  // États pour gérer les modals d'édition
  const [isGeneralInfoModalOpen, setIsGeneralInfoModalOpen] = useState(false);
  const [isContactInfoModalOpen, setIsContactInfoModalOpen] = useState(false);

  // Fetch organization data
  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      
      setIsLoading(true);
      try {
        // Fetch organization
        const org = await organizationApi.findById(params.id as string);
        setOrganization(org);

        // Fetch parent organization if parentId exists
        if (org.parentId) {
          try {
            const parent = await organizationApi.findById(org.parentId);
            setParentOrganization(parent);
          } catch (error) {
            console.error('Error fetching parent organization:', error);
          }
        }

        // Fetch sub-organizations
        try {
          const subs = await organizationApi.getSubOrganizations(params.id as string);
          setSubOrganizations(subs);
        } catch (error) {
          console.error('Error fetching sub-organizations:', error);
        }

        // Fetch users
        try {
          const usersResponse = await userApi.findAll({ organizationId: params.id as string });
          setUsers((usersResponse.data || []) as any as User[]);
        } catch (error) {
          console.error('Error fetching users:', error);
        }

        // Fetch roles
        try {
          const allRoles = await roleApi.getAll({ organizationId: params.id as string });
          setRoles(allRoles);
        } catch (error) {
          console.error('Error fetching roles:', error);
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
        toast({
          variant: 'error',
          title: t('organizationNotFound') || 'Organization not found',
          description: error instanceof Error ? error.message : t('organizationNotFoundDescription') || 'The organization you are looking for does not exist.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, toast, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{tCommon('loading') || 'Loading...'}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t('organizationNotFound')}</CardTitle>
            <CardDescription>
              {t('organizationNotFoundDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>
              {tCommon('backToHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Refresh function to reload all data
  const refreshData = async () => {
    if (!params.id) return;
    
    try {
      const org = await organizationApi.findById(params.id as string);
      setOrganization(org);

      if (org.parentId) {
        try {
          const parent = await organizationApi.findById(org.parentId);
          setParentOrganization(parent);
        } catch (error) {
          console.error('Error fetching parent organization:', error);
        }
      }

      try {
        const subs = await organizationApi.getSubOrganizations(params.id as string);
        setSubOrganizations(subs);
      } catch (error) {
        console.error('Error fetching sub-organizations:', error);
      }

      try {
        const usersResponse = await userApi.findAll({ organizationId: params.id as string });
        setUsers((usersResponse.data || []) as any as User[]);
      } catch (error) {
        console.error('Error fetching users:', error);
      }

      try {
        const allRoles = await roleApi.getAll({ organizationId: params.id as string });
        setRoles(allRoles);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Legacy plan colors (deprecated - use subscription.plan.planType instead)
  const planColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-viridial-100 text-viridial-800',
  };

  // New plan type colors (from subscription.plan.planType)
  const planTypeColors: Record<string, string> = {
    pilot: 'bg-blue-100 text-blue-800',
    growth: 'bg-green-100 text-green-800',
    professional: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-viridial-100 text-viridial-800',
    ai: 'bg-pink-100 text-pink-800',
  };

  // Get active subscription
  const activeSubscription = organization?.subscriptions?.find(
    (sub) => sub.status === 'active' || sub.status === 'trial'
  );
  const activePlan = activeSubscription?.plan;

  // Get primary address, phone, and email by type
  const getPrimaryAddress = (type: string) => {
    return organization.addresses?.find(addr => addr.type === type && addr.isPrimary) ||
           organization.addresses?.find(addr => addr.type === type);
  };

  const getPrimaryPhone = (type: string) => {
    return organization.phones?.find(phone => phone.type === type && phone.isPrimary) ||
           organization.phones?.find(phone => phone.type === type);
  };

  const getPrimaryEmail = (type: string) => {
    return organization.emails?.find(email => email.type === type && email.isPrimary) ||
           organization.emails?.find(email => email.type === type);
  };

  const mainAddress = getPrimaryAddress('headquarters') || organization.addresses?.find(addr => addr.isPrimary);
  const mainPhone = getPrimaryPhone('main') || organization.phones?.find(phone => phone.isPrimary);
  const mainEmail = getPrimaryEmail('main') || organization.emails?.find(email => email.isPrimary);

  // Obtenir toutes les informations de contact (groupées par type)
  const allAddresses = organization.addresses || [];
  const allPhones = organization.phones || [];
  const allEmails = organization.emails || [];

  // Fonction pour sauvegarder les informations générales
  const handleSaveGeneralInfo = async (data: Partial<Organization>) => {
    if (!organization) return;
    
    setIsProcessing(true);
    try {
      const updatedOrg = await organizationApi.update(organization.id, data);
      setOrganization(updatedOrg);
      toast({
        variant: 'success',
        title: t('organizationUpdated') || 'Organization updated',
        description: t('organizationUpdatedDescription') || 'The organization has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        variant: 'error',
        title: t('errorUpdatingOrganization') || 'Error updating organization',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour sauvegarder les informations de contact
  const handleSaveContactInfo = async (data: { addresses: Address[]; phones: Phone[]; emails: Email[] }) => {
    if (!organization) return;
    
    setIsProcessing(true);
    try {
      const updatedOrg = await organizationApi.update(organization.id, data);
      setOrganization(updatedOrg);
      toast({
        variant: 'success',
        title: t('organizationUpdated') || 'Organization updated',
        description: t('organizationUpdatedDescription') || 'The organization has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        variant: 'error',
        title: t('errorUpdatingOrganization') || 'Error updating organization',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour inviter un ou plusieurs utilisateurs
  const handleInviteUsers = async (dataArray: Array<{
    email: string;
    firstName?: string;
    lastName?: string;
    roleId: string;
  }>) => {
    setIsProcessing(true);
    try {
      const created: User[] = [];
      const errors: Array<{ email: string; error: string }> = [];

      // Generate a temporary password for each user
      // In a real system, this should be handled by an invite endpoint that sends an email
      const generateTempPassword = () => Math.random().toString(36).slice(-12) + 'A1!';

      for (const data of dataArray) {
        try {
          const newUser = await userApi.create({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            organizationId: organization!.id,
            role: data.roleId,
            password: generateTempPassword(), // Temporary password - user should reset on first login
          });
          created.push(newUser as any as User);
        } catch (error) {
          errors.push({
            email: data.email,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Rafraîchir la liste des utilisateurs
      if (created.length > 0) {
        const usersResponse = await userApi.findAll({ organizationId: organization!.id });
        setUsers((usersResponse.data || []) as any as User[]);
        
        // Rafraîchir les données de l'organisation
        const updatedOrg = await organizationApi.findById(organization!.id);
        setOrganization(updatedOrg);
      }
      
      setIsInviteUserModalOpen(false);
      
      // Afficher un message de succès ou d'erreur avec toast
      if (created.length > 0 && errors.length === 0) {
        toast({
          variant: 'success',
          title: created.length === 1
            ? tUsers('userInvitedSuccessfully') || 'User invited successfully'
            : tUsers('usersInvitedSuccessfully') || `${created.length} users invited successfully`,
          description: created.length === 1
            ? `${created[0].email} has been invited.`
            : `${created.length} users have been invited successfully.`,
        });
      } else if (created.length > 0 && errors.length > 0) {
        toast({
          variant: 'warning',
          title: tUsers('someUsersInvited') || 'Partial success',
          description: `${created.length} user(s) invited, but ${errors.length} failed. Check console for details.`,
        });
        console.error('Invitation errors:', errors);
      } else if (errors.length > 0) {
        toast({
          variant: 'error',
          title: tUsers('errorInvitingUsers') || 'Error inviting users',
          description: `Failed to invite ${errors.length} user(s). Check console for details.`,
        });
        console.error('Invitation errors:', errors);
      }
    } catch (error) {
      console.error('Error inviting users:', error);
      toast({
        variant: 'error',
        title: tUsers('errorInvitingUsers') || 'Error inviting users',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour créer une nouvelle sous-organisation
  const handleCreateSubOrganization = async (data: {
    name: string;
    slug: string;
    description?: string;
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    maxUsers: number;
    isActive: boolean;
    country?: string;
    city?: string;
    parentId?: string;
  }) => {
    setIsProcessing(true);
    try {
      // S'assurer que le parentId est toujours celui de l'organisation courante
      const newOrg = await organizationApi.create({
        ...data,
        parentId: organization!.id,
      });
      
      // Rafraîchir la liste des sous-organisations
      const subs = await organizationApi.getSubOrganizations(organization!.id);
      setSubOrganizations(subs);
      
      // Rafraîchir les organisations pour les modals
      const allOrgsResponse = await organizationApi.findAll({ page: 1, limit: 1000 });
      setAllOrganizations(allOrgsResponse.data || []);
      
      setIsCreateSubOrganizationModalOpen(false);
      
      // Afficher un message de succès avec toast
      toast({
        variant: 'success',
        title: t('subOrganizationCreatedSuccessfully') || 'Sub-organization created successfully',
        description: `${newOrg.name} has been created as a sub-organization.`,
      });
    } catch (error) {
      console.error('Error creating sub-organization:', error);
      toast({
        variant: 'error',
        title: t('errorCreatingSubOrganization') || 'Error creating sub-organization',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour ajouter une ou plusieurs organisations existantes comme sous-organisations
  const handleAddExistingSubOrganization = async (organizationIds: string[]) => {
    setIsProcessing(true);
    try {
      // Utiliser changeParent pour changer le parent de plusieurs organisations
      await organizationApi.changeParent({
        organizationIds,
        newParentId: organization!.id,
      });

      // Rafraîchir la liste des sous-organisations
      const subs = await organizationApi.getSubOrganizations(organization!.id);
      setSubOrganizations(subs);
      
      // Rafraîchir l'organisation
      const updatedOrg = await organizationApi.findById(organization!.id);
      setOrganization(updatedOrg);
      
      // Rafraîchir les organisations pour les modals
      const allOrgsResponse = await organizationApi.findAll({ page: 1, limit: 1000 });
      setAllOrganizations(allOrgsResponse.data || []);

      setIsAddExistingSubOrganizationModalOpen(false);
      
      // Afficher un message de succès
      toast({
        variant: 'success',
        title: organizationIds.length === 1
          ? t('subOrganizationAddedSuccessfully') || 'Organization added successfully'
          : t('subOrganizationsAddedSuccessfully') || `${organizationIds.length} organizations added successfully`,
        description: organizationIds.length === 1
          ? 'The organization has been added as a sub-organization.'
          : `${organizationIds.length} organizations have been added as sub-organizations.`,
      });
    } catch (error) {
      console.error('Error adding existing sub-organizations:', error);
      toast({
        variant: 'error',
        title: t('errorAddingSubOrganization') || 'Error adding sub-organization',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    }
  };

  // Fonction pour supprimer des utilisateurs (avec confirmation)
  const handleRequestDeleteUsers = (userIds: string[]) => {
    if (userIds.length === 0) return;
    setConfirmDeleteUsers({ open: true, userIds });
  };

  const handleConfirmDeleteUsers = async () => {
    setIsProcessing(true);
    try {
      const deleted: string[] = [];
      const errors: Array<{ userId: string; error: string }> = [];

      for (const userId of confirmDeleteUsers.userIds) {
        try {
          await userApi.delete(userId);
          deleted.push(userId);
        } catch (error) {
          errors.push({
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
      
      // Rafraîchir la liste des utilisateurs
      if (deleted.length > 0) {
        const usersResponse = await userApi.findAll({ organizationId: organization!.id });
        setUsers((usersResponse.data || []) as any as User[]);
        
        // Rafraîchir les données de l'organisation
        const updatedOrg = await organizationApi.findById(organization!.id);
        setOrganization(updatedOrg);
      }
      
      // Effacer la sélection
      setSelectedUserIds(new Set());
      
      // Afficher un message de succès ou d'erreur avec toast
      if (deleted.length > 0 && errors.length === 0) {
        toast({
          variant: 'success',
          title: deleted.length === 1
            ? tUsers('userDeletedSuccessfully') || 'User deleted successfully'
            : tUsers('usersDeletedSuccessfully') || `${deleted.length} users deleted successfully`,
          description: deleted.length === 1
            ? 'The user has been deleted successfully.'
            : `${deleted.length} users have been deleted successfully.`,
        });
      } else if (deleted.length > 0 && errors.length > 0) {
        toast({
          variant: 'warning',
          title: tUsers('someUsersDeleted') || 'Partial success',
          description: `${deleted.length} user(s) deleted, but ${errors.length} failed. Check console for details.`,
        });
        console.error('Deletion errors:', errors);
      } else if (errors.length > 0) {
        toast({
          variant: 'error',
          title: tUsers('errorDeletingUsers') || 'Error deleting users',
          description: `Failed to delete ${errors.length} user(s). Check console for details.`,
        });
        console.error('Deletion errors:', errors);
      }
    } catch (error) {
      console.error('Error deleting users:', error);
      toast({
        variant: 'error',
        title: tUsers('errorDeletingUsers') || 'Error deleting users',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
      setConfirmDeleteUsers({ open: false, userIds: [] });
    }
  };

  // Fonction pour supprimer des sous-organisations (avec confirmation)
  const handleRequestDeleteSubOrganizations = (orgIds: string[]) => {
    if (orgIds.length === 0) return;
    setConfirmDeleteSubOrgs({ open: true, orgIds });
  };

  const handleConfirmDeleteSubOrganizations = async () => {
    setIsProcessing(true);
    try {
      await organizationApi.bulkDelete(confirmDeleteSubOrgs.orgIds);
      
      // Rafraîchir la liste des sous-organisations
      const subs = await organizationApi.getSubOrganizations(organization!.id);
      setSubOrganizations(subs);
      
      // Rafraîchir l'organisation
      const updatedOrg = await organizationApi.findById(organization!.id);
      setOrganization(updatedOrg);
      
      // Rafraîchir les organisations pour les modals
      const allOrgsResponse = await organizationApi.findAll({ page: 1, limit: 1000 });
      setAllOrganizations(allOrgsResponse.data || []);
      
      // Effacer la sélection
      setSelectedSubOrgIds(new Set());
      
      // Afficher un message de succès
      toast({
        variant: 'success',
        title: confirmDeleteSubOrgs.orgIds.length === 1
          ? t('subOrganizationDeletedSuccessfully') || 'Sub-organization deleted successfully'
          : t('subOrganizationsDeletedSuccessfully') || `${confirmDeleteSubOrgs.orgIds.length} sub-organizations deleted successfully`,
        description: confirmDeleteSubOrgs.orgIds.length === 1
          ? 'The sub-organization has been deleted successfully.'
          : `${confirmDeleteSubOrgs.orgIds.length} sub-organizations have been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting sub-organizations:', error);
      toast({
        variant: 'error',
        title: t('errorDeletingSubOrganizations') || 'Error deleting sub-organizations',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
      setConfirmDeleteSubOrgs({ open: false, orgIds: [] });
    }
  };

  // Fonction pour changer le parent d'une organisation (avec confirmation)
  const handleRequestChangeParent = (newParentId: string | null) => {
    setConfirmChangeParent({ open: true, newParentId });
  };

  const handleConfirmChangeParent = async () => {
    setIsProcessing(true);
    try {
      await organizationApi.changeParent({
        organizationIds: [organization!.id],
        newParentId: confirmChangeParent.newParentId,
      });
      
      // Rafraîchir l'organisation
      const refreshedOrg = await organizationApi.findById(organization!.id);
      setOrganization(refreshedOrg);
      
      // Rafraîchir les sous-organisations si nécessaire
      const subs = await organizationApi.getSubOrganizations(organization!.id);
      setSubOrganizations(subs);
      
      // Rafraîchir les organisations pour les modals
      const allOrgsResponse = await organizationApi.findAll({ page: 1, limit: 1000 });
      setAllOrganizations(allOrgsResponse.data || []);
      
      toast({
        variant: 'success',
        title: t('parentOrganizationChangedSuccessfully') || 'Parent organization updated successfully',
        description: confirmChangeParent.newParentId
          ? 'The parent organization has been changed successfully.'
          : 'The parent organization has been removed successfully. This organization is now a root organization.',
      });
    } catch (error) {
      console.error('Error changing parent organization:', error);
      toast({
        variant: 'error',
        title: t('errorChangingParentOrganization') || 'Error changing parent organization',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
      setConfirmChangeParent({ open: false, newParentId: null });
    }
  };

  // Fonction pour changer directement le parent (utilisée par le modal)
  const handleChangeParent = async (organizationId: string, newParentId: string | null) => {
    setIsProcessing(true);
    try {
      await organizationApi.changeParent({
        organizationIds: [organizationId],
        newParentId,
      });
      
      // Rafraîchir l'organisation
      const refreshedOrg = await organizationApi.findById(organization!.id);
      setOrganization(refreshedOrg);
      
      // Rafraîchir les sous-organisations
      const subs = await organizationApi.getSubOrganizations(organization!.id);
      setSubOrganizations(subs);
      
      // Rafraîchir les organisations pour les modals
      const allOrgsResponse = await organizationApi.findAll({ page: 1, limit: 1000 });
      setAllOrganizations(allOrgsResponse.data || []);
      
      toast({
        variant: 'success',
        title: t('parentOrganizationChangedSuccessfully') || 'Parent organization updated successfully',
        description: newParentId
          ? 'The parent organization has been changed successfully.'
          : 'The parent organization has been removed successfully.',
      });
      setIsChangeParentModalOpen(false);
    } catch (error) {
      console.error('Error changing parent organization:', error);
      toast({
        variant: 'error',
        title: t('errorChangingParentOrganization') || 'Error changing parent organization',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour changer le parent de plusieurs sous-organisations sélectionnées
  const handleChangeMultipleParents = async (organizationIds: string[], newParentId: string | null) => {
    setIsProcessing(true);
    try {
      await organizationApi.changeParent({
        organizationIds,
        newParentId,
      });

      // Rafraîchir les sous-organisations
      const subs = await organizationApi.getSubOrganizations(organization!.id);
      setSubOrganizations(subs);
      
      // Rafraîchir l'organisation
      const updatedOrg = await organizationApi.findById(organization!.id);
      setOrganization(updatedOrg);
      
      // Rafraîchir les organisations pour les modals
      const allOrgsResponse = await organizationApi.findAll({ page: 1, limit: 1000 });
      setAllOrganizations(allOrgsResponse.data || []);
      
      setSelectedSubOrgIds(new Set());

      // Afficher les résultats avec toast
      toast({
        variant: 'success',
        title: organizationIds.length === 1
          ? t('parentOrganizationChangedSuccessfully') || 'Parent organization updated successfully'
          : t('subOrganizationsParentChangedSuccessfully') || `${organizationIds.length} parent organizations updated successfully`,
        description: organizationIds.length === 1
          ? 'The parent organization has been changed successfully.'
          : `${organizationIds.length} parent organizations have been changed successfully.`,
      });

      setIsChangeMultipleParentsModalOpen(false);
    } catch (error) {
      console.error('Error changing multiple parents:', error);
      toast({
        variant: 'error',
        title: t('errorChangingSubOrganizationsParent') || 'Error changing parent organizations',
        description: error instanceof Error ? error.message : tCommon('unexpectedError') || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
                    onClick={() => router.back()}
                    className="h-8 w-8 text-gray-600 hover:text-gray-900"
                    title={tCommon('back')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{organization.name}</h1>
                    <p className="text-xs text-gray-500">{t('organizationDetails')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-sm h-9 px-4 gap-2"
                    onClick={() => router.push(`/organizations/${organization.id}/users`)}
                  >
                    <Users className="h-3.5 w-3.5" />
                    {t('userManagement') || 'User Management'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-sm h-9 px-4 gap-2"
                    onClick={() => router.push(`/organizations/${organization.id}/org-chart`)}
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    {t('viewOrganizationChart')}
                  </Button>
                  <Button variant="outline" size="sm" className="text-sm h-9 px-4">
                    <Settings className="h-3.5 w-3.5 mr-2" />
                    {tCommon('settings')}
                  </Button>
                  <Button className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-sm h-9 px-4">
                    <Plus className="h-3.5 w-3.5" />
                    {t('newMember')}
              </Button>
            </div>
          </div>
        </div>
        </header>

          <main className="flex-1 overflow-y-auto p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('users')}</div>
                <div className="text-2xl font-bold text-gray-900">{users?.length ?? 0}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('roles')}</div>
                <div className="text-2xl font-bold text-gray-900">{roles?.length ?? 0}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('limit')}</div>
                <div className="text-2xl font-bold text-gray-900">{organization.maxUsers}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('createdAt')}</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(organization.createdAt).toLocaleDateString(locale)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* General Information Card */}
              <Card className="lg:col-span-2 border-gray-200 bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-900">{t('generalInformation')}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsGeneralInfoModalOpen(true)}
                    className="gap-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {tCommon('edit')}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                      <Building2 className="h-6 w-6 text-viridial-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-semibold text-gray-900 mb-1">{organization.name}</h2>
                      <p className="text-sm text-gray-500 mb-3">{organization.slug}</p>
                      {organization.description && (
                        <p className="text-sm text-gray-700 leading-relaxed">{organization.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('plan')}</p>
                      {activePlan ? (
                        <Badge className={`${planTypeColors[activePlan.planType] || planColors.professional} text-xs px-2.5 py-1 font-medium`}>
                          {activePlan.name}
                        </Badge>
                      ) : (
                        <Badge className={`${planColors[organization.plan]} text-xs px-2.5 py-1 font-medium`}>
                          {t(`plans.${organization.plan}`)}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('status')}</p>
                      {organization.isActive ? (
                        <Badge variant="success" className="gap-1.5 text-xs px-2.5 py-1 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {tCommon('active')}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1.5 text-xs px-2.5 py-1 font-medium">
                          <XCircle className="h-3.5 w-3.5" />
                          {tCommon('inactive')}
                        </Badge>
                      )}
              </div>
            </div>
          </CardContent>
        </Card>

              {/* Contact Information Card */}
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-gray-900">{t('contactInformation')}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsContactInfoModalOpen(true)}
                        className="gap-2 text-sm h-8 px-3 text-gray-600 hover:text-gray-900"
                        title={tCommon('edit')}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {tCommon('edit')}
                      </Button>
                      {(allAddresses.length > 1 || allPhones.length > 1 || allEmails.length > 1) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsContactExpanded(!isContactExpanded)}
                          className="gap-2 text-sm h-8 px-3 text-gray-600 hover:text-gray-900"
                        >
                          {isContactExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              {t('showLess')}
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              {t('showAllContacts')}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Primary Address */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                        <MapPin className="h-4 w-4 text-viridial-600" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('primaryAddress')}</span>
                    </div>
                    {mainAddress ? (
                      <div className="pl-12 space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900 leading-tight">{mainAddress.street}</p>
                          <p className="text-sm text-gray-600">{mainAddress.postalCode} {mainAddress.city}</p>
                          <p className="text-sm text-gray-600">{mainAddress.country}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-300 font-normal">
                            {t(`addressTypes.${mainAddress.type}`)}
                          </Badge>
                          {mainAddress.isPrimary && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-viridial-100 text-viridial-700 border-viridial-200">
                              {t('primary')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="pl-12 text-sm text-gray-400 italic">{t('noAddress')}</p>
                    )}
                  </div>

                  {/* Primary Phone */}
                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                        <PhoneIcon className="h-4 w-4 text-viridial-600" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('primaryPhone')}</span>
                    </div>
                    {mainPhone ? (
                      <div className="pl-12 space-y-2">
                        <p className="text-sm font-medium text-gray-900">{mainPhone.number}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-300 font-normal">
                            {t(`phoneTypes.${mainPhone.type}`)}
                          </Badge>
                          {mainPhone.isPrimary && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-viridial-100 text-viridial-700 border-viridial-200">
                              {t('primary')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="pl-12 text-sm text-gray-400 italic">{t('noPhone')}</p>
                    )}
                  </div>

                  {/* Primary Email */}
                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                        <Mail className="h-4 w-4 text-viridial-600" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('primaryEmail')}</span>
                    </div>
                    {mainEmail ? (
                      <div className="pl-12 space-y-2">
                        <p className="text-sm font-medium text-gray-900 break-all">{mainEmail.address}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-300 font-normal">
                            {t(`emailTypes.${mainEmail.type}`)}
                          </Badge>
                          {mainEmail.isPrimary && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-viridial-100 text-viridial-700 border-viridial-200">
                              {t('primary')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="pl-12 text-sm text-gray-400 italic">{t('noEmail')}</p>
                    )}
                  </div>

                  {/* Bloc extensible avec toutes les informations de contact */}
                  {isContactExpanded && (
                    <div className="pt-6 border-t border-gray-200 space-y-6">
                      {/* Toutes les adresses */}
                      {allAddresses.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                              <MapPin className="h-4 w-4 text-viridial-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">{t('allAddresses')} ({allAddresses.length})</h3>
                          </div>
                          <div className="pl-12 space-y-4">
                            {allAddresses.map((address, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="space-y-1.5 mb-2">
                                  <p className="text-sm font-medium text-gray-900 leading-tight">{address.street}</p>
                                  <p className="text-sm text-gray-600">{address.postalCode} {address.city}</p>
                                  <p className="text-sm text-gray-600">{address.country}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-300 font-normal">
                                    {t(`addressTypes.${address.type}`)}
                                  </Badge>
                                  {address.isPrimary && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-viridial-100 text-viridial-700 border-viridial-200">
                                      {t('primary')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tous les téléphones */}
                      {allPhones.length > 0 && (
                        <div className="space-y-4 pt-6 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                              <PhoneIcon className="h-4 w-4 text-viridial-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">{t('allPhones')} ({allPhones.length})</h3>
                          </div>
                          <div className="pl-12 space-y-3">
                            {allPhones.map((phone, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm font-medium text-gray-900 mb-2">{phone.number}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-300 font-normal">
                                    {t(`phoneTypes.${phone.type}`)}
                                  </Badge>
                                  {phone.isPrimary && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-viridial-100 text-viridial-700 border-viridial-200">
                                      {t('primary')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tous les emails */}
                      {allEmails.length > 0 && (
                        <div className="space-y-4 pt-6 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                              <Mail className="h-4 w-4 text-viridial-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">{t('allEmails')} ({allEmails.length})</h3>
                          </div>
                          <div className="pl-12 space-y-3">
                            {allEmails.map((email, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm font-medium text-gray-900 break-all mb-2">{email.address}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-300 font-normal">
                                    {t(`emailTypes.${email.type}`)}
                                  </Badge>
                                  {email.isPrimary && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-viridial-100 text-viridial-700 border-viridial-200">
                                      {t('primary')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Message si aucune information supplémentaire */}
                      {allAddresses.length <= 1 && allPhones.length <= 1 && allEmails.length <= 1 && (
                        <div className="text-center py-6 text-gray-500">
                          <p className="text-sm">{t('noAdditionalContacts')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="users" className="w-full">
              <div className="bg-white border border-gray-200 rounded-lg p-1 mb-6 inline-block">
                <TabsList className="bg-transparent h-auto p-0 gap-1">
                  <TabsTrigger 
                    value="users" 
                    className="gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors data-[state=active]:bg-viridial-50 data-[state=active]:text-viridial-700 data-[state=active]:border data-[state=active]:border-viridial-200 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-50"
                  >
                <Users className="h-4 w-4" />
                    {t('users')} ({users?.length ?? 0})
              </TabsTrigger>
                  <TabsTrigger 
                    value="roles" 
                    className="gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors data-[state=active]:bg-viridial-50 data-[state=active]:text-viridial-700 data-[state=active]:border data-[state=active]:border-viridial-200 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-50"
                  >
                <Shield className="h-4 w-4" />
                    {t('roles')} ({roles?.length ?? 0})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="structure" 
                    className="gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors data-[state=active]:bg-viridial-50 data-[state=active]:text-viridial-700 data-[state=active]:border data-[state=active]:border-viridial-200 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-50"
                  >
                    <Network className="h-4 w-4" />
                    {t('structure')} {subOrganizations.length > 0 && `(${subOrganizations.length})`}
              </TabsTrigger>
            </TabsList>
          </div>

              <TabsContent value="users" className="mt-0">
                <Card className="border-gray-200 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900">{t('organizationUsers')}</CardTitle>
                    <Button 
                      size="sm" 
                      className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-white h-9 px-4"
                      onClick={() => setIsInviteUserModalOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('inviteUser')}
              </Button>
                  </CardHeader>
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
          </TabsContent>

              <TabsContent value="roles" className="mt-0">
                <Card className="border-gray-200 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900">{t('rolesManagement')}</CardTitle>
                    <Button size="sm" className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-white h-9 px-4">
                      <Plus className="h-3.5 w-3.5" />
                      {t('createRole')}
              </Button>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {roles.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm">{t('noRoles')}</p>
            </div>
                    ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                          <RoleCard key={role.id} role={role} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="structure" className="mt-0">
                <div className={`grid grid-cols-1 gap-6 ${parentOrganization ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
                  {/* Organisation parente */}
                  {parentOrganization && (
                    <Card className="border-gray-200 bg-white">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-viridial-600" />
                          {t('parentOrganization')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                              <Building2 className="h-5 w-5 text-viridial-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-gray-900 mb-1">{parentOrganization.name}</h3>
                              <p className="text-sm text-gray-500 mb-2">{parentOrganization.slug}</p>
                              {parentOrganization.description && (
                                <p className="text-sm text-gray-700 mb-4 leading-relaxed">{parentOrganization.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge className={`${planColors[parentOrganization.plan]} text-xs px-2.5 py-1 font-medium`}>
                                  {t(`plans.${parentOrganization.plan}`)}
                                </Badge>
                                {parentOrganization.isActive ? (
                                  <Badge variant="success" className="gap-1.5 text-xs px-2.5 py-1 font-medium">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {tCommon('active')}
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="gap-1.5 text-xs px-2.5 py-1 font-medium">
                                    <XCircle className="h-3.5 w-3.5" />
                                    {tCommon('inactive')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-gray-100 space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/${locale}/organizations/${parentOrganization.id}`)}
                              className="w-full gap-2 text-sm h-9"
                            >
                              {t('viewDetails')}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsChangeParentModalOpen(true)}
                              className="w-full gap-2 text-sm h-9 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                              <GitBranchIcon className="h-3.5 w-3.5" />
                              {t('changeParent') || 'Change Parent'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sous-organisations */}
                  <Card className={`border-gray-200 bg-white ${!parentOrganization ? 'lg:col-span-1' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Network className="h-5 w-5 text-viridial-600" />
                        {t('subOrganizations')}
                        {subOrganizations.length > 0 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-gray-200">
                            {subOrganizations.length}
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {(parentOrganization || subOrganizations.length > 0) && (
                          <Button 
                            variant="outline"
                            size="sm" 
                            className="gap-2 text-sm h-9 px-4"
                            onClick={() => router.push(`/organizations/${organization.id}/org-chart`)}
                          >
                            <GitBranch className="h-3.5 w-3.5" />
                            {t('viewOrganizationChart')}
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              size="sm" 
                              className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-white h-9 px-4"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              {t('addSubOrganization')}
                              <ChevronDown className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                              onClick={() => setIsCreateSubOrganizationModalOpen(true)}
                              className="cursor-pointer"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {t('createNewSubOrganization') || 'Create New Sub-Organization'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setIsAddExistingSubOrganizationModalOpen(true)}
                              className="cursor-pointer"
                            >
                              <GitBranch className="h-4 w-4 mr-2" />
                              {t('addExistingOrganization') || 'Add Existing Organization'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                      <CardContent className="pt-6">
                      {subOrganizations.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Network className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-sm font-medium text-gray-600 mb-1">{t('noSubOrganizations')}</p>
                          <p className="text-xs text-gray-400 mb-6">{t('noSubOrganizationsDescription')}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                size="sm" 
                                className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-white h-9 px-4"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                {t('addSubOrganization')}
                                <ChevronDown className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem
                                onClick={() => setIsCreateSubOrganizationModalOpen(true)}
                                className="cursor-pointer"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                {t('createNewSubOrganization') || 'Create New Sub-Organization'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setIsAddExistingSubOrganizationModalOpen(true)}
                                className="cursor-pointer"
                              >
                                <GitBranch className="h-4 w-4 mr-2" />
                                {t('addExistingOrganization') || 'Add Existing Organization'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Select All and Bulk Actions for Sub-Organizations */}
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <Checkbox
                                checked={subOrganizations.length > 0 && subOrganizations.every((org) => selectedSubOrgIds.has(org.id))}
                                indeterminate={
                                  subOrganizations.some((org) => selectedSubOrgIds.has(org.id)) &&
                                  !subOrganizations.every((org) => selectedSubOrgIds.has(org.id))
                                }
                                onCheckedChange={(checked) => {
                                  if (checked === true) {
                                    setSelectedSubOrgIds(new Set(subOrganizations.map((org) => org.id)));
                                  } else {
                                    setSelectedSubOrgIds(new Set());
                                  }
                                }}
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {t('selectAll') || 'Select All'} ({subOrganizations.length})
                              </span>
                            </label>
                            {selectedSubOrgIds.size > 0 && (
                              <BulkActions
                                selectedCount={selectedSubOrgIds.size}
                                onDelete={() => handleRequestDeleteSubOrganizations(Array.from(selectedSubOrgIds))}
                                onChangeParent={() => setIsChangeMultipleParentsModalOpen(true)}
                                onClearSelection={() => setSelectedSubOrgIds(new Set())}
                              />
                            )}
                          </div>
                          {subOrganizations.map((subOrg) => {
                            const isSelected = selectedSubOrgIds.has(subOrg.id);
                            return (
                              <div
                                key={subOrg.id}
                                className={`group border rounded-lg p-4 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-viridial-50 border-viridial-300 shadow-sm'
                                    : 'border-gray-200 hover:bg-gray-50 hover:border-viridial-200 hover:shadow-sm'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div
                                      className="checkbox-container pt-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          const newSelection = new Set(selectedSubOrgIds);
                                          if (checked === true) {
                                            newSelection.add(subOrg.id);
                                          } else {
                                            newSelection.delete(subOrg.id);
                                          }
                                          setSelectedSubOrgIds(newSelection);
                                        }}
                                      />
                                    </div>
                                    <div
                                      className="flex-1 min-w-0"
                                      onClick={() => router.push(`/${locale}/organizations/${subOrg.id}`)}
                                    >
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                                          <Building2 className="h-4 w-4 text-viridial-600" />
                                        </div>
                                        <h4 className="text-sm font-semibold text-gray-900 truncate">{subOrg.name}</h4>
                                      </div>
                                      <p className="text-xs text-gray-500 mb-2 ml-10">{subOrg.slug}</p>
                                      {subOrg.description && (
                                        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed ml-10">{subOrg.description}</p>
                                      )}
                                      <div className="flex flex-wrap gap-2 mb-3 ml-10">
                                        <Badge className={`${planColors[subOrg.plan]} text-xs px-2 py-0.5 font-medium`}>
                                          {t(`plans.${subOrg.plan}`)}
                                        </Badge>
                                        {subOrg.isActive ? (
                                          <Badge variant="success" className="gap-1 text-xs px-2 py-0.5 font-medium">
                                            <CheckCircle2 className="h-3 w-3" />
                                            {tCommon('active')}
                                          </Badge>
                                        ) : (
                                          <Badge variant="destructive" className="gap-1 text-xs px-2 py-0.5 font-medium">
                                            <XCircle className="h-3 w-3" />
                                            {tCommon('inactive')}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-4 text-xs text-gray-500 ml-10">
                                        <div className="flex items-center gap-1.5">
                                          <Users className="h-3.5 w-3.5 text-gray-400" />
                                          <span>{subOrg.maxUsers} {t('maxUsers') || 'max users'}</span>
                                        </div>
                                        {subOrg.country && subOrg.city && (
                                          <div className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="truncate">{subOrg.city}, {subOrg.country}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push(`/${locale}/organizations/${subOrg.id}`)}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          {t('viewDetails')}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => handleRequestDeleteSubOrganizations([subOrg.id])}
                                          className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          {tCommon('delete')}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-viridial-600 transition-colors" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
            </div>
          </TabsContent>
        </Tabs>
        </main>
        </div>
      </div>

      {/* Modals */}
      <EditGeneralInfoModal
        organization={organization}
        open={isGeneralInfoModalOpen}
        onOpenChange={setIsGeneralInfoModalOpen}
        onSave={handleSaveGeneralInfo}
      />
      <EditContactInfoModal
        organization={organization}
        open={isContactInfoModalOpen}
        onOpenChange={setIsContactInfoModalOpen}
        onSave={handleSaveContactInfo}
      />
         <InviteUserModal
           organization={organization}
           roles={roles}
           open={isInviteUserModalOpen}
           onOpenChange={setIsInviteUserModalOpen}
           onInvite={handleInviteUsers}
         />
      <CreateOrganizationModal
        organizations={allOrganizations}
        open={isCreateSubOrganizationModalOpen}
        onOpenChange={setIsCreateSubOrganizationModalOpen}
        defaultParentId={organization.id}
        onCreate={handleCreateSubOrganization}
      />
      <AddExistingSubOrganizationModal
        parentOrganization={organization}
        open={isAddExistingSubOrganizationModalOpen}
        onOpenChange={setIsAddExistingSubOrganizationModalOpen}
        onAdd={handleAddExistingSubOrganization}
      />
      <ChangeParentModal
        organization={organization}
        organizations={allOrganizations}
        open={isChangeParentModalOpen}
        onOpenChange={setIsChangeParentModalOpen}
        onChangeParent={(orgId, newParentId) => {
          handleChangeParent(orgId, newParentId);
        }}
      />
      <ChangeMultipleParentsModal
        organizationIds={Array.from(selectedSubOrgIds)}
        organizations={allOrganizations}
        parentOrganization={organization}
        open={isChangeMultipleParentsModalOpen}
        onOpenChange={setIsChangeMultipleParentsModalOpen}
        onChangeParent={handleChangeMultipleParents}
      />
      <ConfirmationDialog
        open={confirmDeleteUsers.open}
        onOpenChange={(open) => setConfirmDeleteUsers({ open, userIds: open ? confirmDeleteUsers.userIds : [] })}
        title={tUsers('confirmDeleteUsersTitle', { count: confirmDeleteUsers.userIds.length })}
        description={tUsers('confirmDeleteUsersDescription', { count: confirmDeleteUsers.userIds.length })}
        confirmText={tUsers('deleteUsers')}
        cancelText={tCommon('cancel')}
        onConfirm={handleConfirmDeleteUsers}
        variant="danger"
      />
      <ConfirmationDialog
        open={confirmDeleteSubOrgs.open}
        onOpenChange={(open) => setConfirmDeleteSubOrgs({ open, orgIds: open ? confirmDeleteSubOrgs.orgIds : [] })}
        title={t('confirmDeleteOrganizationsTitle', { count: confirmDeleteSubOrgs.orgIds.length })}
        description={t('confirmDeleteOrganizationsDescription', { count: confirmDeleteSubOrgs.orgIds.length })}
        confirmText={t('deleteOrganizations')}
        cancelText={tCommon('cancel')}
        onConfirm={handleConfirmDeleteSubOrganizations}
        variant="danger"
      />
      </div>
    </AuthGuard>
  );
}

