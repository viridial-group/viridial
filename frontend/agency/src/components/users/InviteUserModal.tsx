'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Organization, Role, User, Permission } from '@/types/organization';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, User as UserIcon, Shield, CheckCircle2, Users, AlertCircle, Info } from 'lucide-react';

interface InviteUserModalProps {
  organization: Organization;
  roles: Role[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (data: Array<{ email: string; firstName?: string; lastName?: string; roleId: string }>) => void;
}

export function InviteUserModal({
  organization,
  roles,
  open,
  onOpenChange,
  onInvite,
}: InviteUserModalProps) {
  const t = useTranslations('organizations');
  const tUsers = useTranslations('users');
  const tCommon = useTranslations('common');

  const [inviteMode, setInviteMode] = useState<'single' | 'multiple'>('single');
  const [singleEmail, setSingleEmail] = useState('');
  const [multipleEmails, setMultipleEmails] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleId, setRoleId] = useState(roles.length > 0 ? roles[0].id : '');
  const [emailError, setEmailError] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<Role | undefined>(
    roles.length > 0 ? roles[0] : undefined
  );

  useEffect(() => {
    if (open) {
      setSingleEmail('');
      setMultipleEmails('');
      setFirstName('');
      setLastName('');
      setRoleId(roles.length > 0 ? roles[0].id : '');
      setInviteMode('single');
      setEmailError(null);
      setSelectedRole(roles.length > 0 ? roles[0] : undefined);
    }
  }, [open, roles]);

  // Parse emails from textarea (support both comma and newline separated)
  const parseEmails = (text: string): string[] => {
    return text
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0 && email.includes('@'));
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const parsedEmails = inviteMode === 'multiple' ? parseEmails(multipleEmails) : [];
  const validEmails = parsedEmails.filter((email) => isValidEmail(email));
  const invalidEmails = parsedEmails.filter((email) => !isValidEmail(email));

  const handleRoleChange = (newRoleId: string) => {
    const role = roles.find((r) => r.id === newRoleId);
    setSelectedRole(role);
    setRoleId(newRoleId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    if (!roleId) {
      setEmailError(tUsers('roleRequired') || 'Role is required');
      return;
    }

    if (inviteMode === 'single') {
      if (!singleEmail || !isValidEmail(singleEmail)) {
        setEmailError(tUsers('invalidEmail') || 'Please enter a valid email address');
        return;
      }
      onInvite([
        {
          email: singleEmail,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          roleId,
        },
      ]);
    } else {
      if (validEmails.length === 0) {
        setEmailError(tUsers('noValidEmails') || 'Please enter at least one valid email address');
        return;
      }
      // Inviter tous les emails valides avec le même nom/prénom et rôle
      const invitations = validEmails.map((email) => ({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        roleId,
      }));
      onInvite(invitations);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Grouper les permissions par catégorie pour un affichage plus clair
  const groupPermissionsByCategory = (permissions: Permission[]) => {
    const categories: Record<string, Permission[]> = {
      organizations: [],
      users: [],
      roles: [],
      properties: [],
      settings: [],
    };

    permissions.forEach((permission) => {
      const category = permission.split(':')[0];
      if (category in categories) {
        categories[category].push(permission);
      }
    });

    return categories;
  };

  const permissionLabels: Record<Permission, string> = {
    'organizations:read': tUsers('permissions.organizations.read'),
    'organizations:write': tUsers('permissions.organizations.write'),
    'organizations:delete': tUsers('permissions.organizations.delete'),
    'users:read': tUsers('permissions.users.read'),
    'users:write': tUsers('permissions.users.write'),
    'users:delete': tUsers('permissions.users.delete'),
    'roles:read': tUsers('permissions.roles.read'),
    'roles:write': tUsers('permissions.roles.write'),
    'roles:delete': tUsers('permissions.roles.delete'),
    'properties:read': tUsers('permissions.properties.read'),
    'properties:write': tUsers('permissions.properties.write'),
    'properties:delete': tUsers('permissions.properties.delete'),
    'settings:read': tUsers('permissions.settings.read'),
    'settings:write': tUsers('permissions.settings.write'),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-viridial-600" />
            {tUsers('inviteUser')}
          </DialogTitle>
          <DialogDescription>
            {tUsers('inviteUserDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invite Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">
              {tUsers('inviteMode') || 'Invite Mode'}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={inviteMode === 'single' ? 'default' : 'outline'}
                className={`h-10 ${
                  inviteMode === 'single'
                    ? 'bg-viridial-600 hover:bg-viridial-700 text-white'
                    : ''
                }`}
                onClick={() => {
                  setInviteMode('single');
                  setEmailError(null);
                }}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                {tUsers('singleUser') || 'Single User'}
              </Button>
              <Button
                type="button"
                variant={inviteMode === 'multiple' ? 'default' : 'outline'}
                className={`h-10 ${
                  inviteMode === 'multiple'
                    ? 'bg-viridial-600 hover:bg-viridial-700 text-white'
                    : ''
                }`}
                onClick={() => {
                  setInviteMode('multiple');
                  setEmailError(null);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                {tUsers('multipleUsers') || 'Multiple Users'}
              </Button>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <UserIcon className="h-4 w-4 text-viridial-600" />
              <Label className="text-base font-semibold">{tUsers('userInformation')}</Label>
            </div>

            {inviteMode === 'single' ? (
              <div className="space-y-2">
                <Label htmlFor="email">
                  {tUsers('email')} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={singleEmail}
                  onChange={(e) => {
                    setSingleEmail(e.target.value);
                    setEmailError(null);
                  }}
                  required
                  className="w-full"
                  placeholder="user@example.com"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="emails">
                  {tUsers('emails')} * ({validEmails.length} {tUsers('valid') || 'valid'})
                </Label>
                <Textarea
                  id="emails"
                  value={multipleEmails}
                  onChange={(e) => {
                    setMultipleEmails(e.target.value);
                    setEmailError(null);
                  }}
                  placeholder={tUsers('emailsPlaceholder') || 'Enter emails separated by commas or new lines:\nuser1@example.com\nuser2@example.com, user3@example.com'}
                  className="w-full min-h-[120px] font-mono text-sm"
                  required
                />
                {invalidEmails.length > 0 && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    {tUsers('invalidEmailsFound') || 'Invalid emails'}: {invalidEmails.join(', ')}
                  </div>
                )}
                {validEmails.length > 0 && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                    {validEmails.length} {tUsers('validEmailsReady') || 'valid emails ready to invite'}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  <Info className="h-3 w-3 inline mr-1" />
                  {tUsers('emailsHelp') || 'You can enter multiple emails separated by commas or new lines. All emails will be invited with the same role and optional name.'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{tUsers('firstName')}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full"
                  placeholder={tUsers('firstNamePlaceholder')}
                />
                <p className="text-xs text-gray-500">
                  {inviteMode === 'multiple'
                    ? tUsers('appliedToAllUsers') || 'Applied to all users'
                    : ''}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{tUsers('lastName')}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full"
                  placeholder={tUsers('lastNamePlaceholder')}
                />
                <p className="text-xs text-gray-500">
                  {inviteMode === 'multiple'
                    ? tUsers('appliedToAllUsers') || 'Applied to all users'
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 pb-2">
              <Shield className="h-4 w-4 text-viridial-600" />
              <Label className="text-base font-semibold">{tUsers('roleAndPermissions')}</Label>
            </div>

            {roles.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-3">{t('noRoles')}</p>
                <p className="text-xs text-gray-500">{tUsers('createRoleFirst')}</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="role">
                    {tUsers('selectRole')} *
                    {inviteMode === 'multiple' && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({tUsers('appliedToAllUsers') || 'Applied to all users'})
                      </span>
                    )}
                  </Label>
                  <Select value={roleId} onValueChange={handleRoleChange}>
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder={tUsers('selectRolePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{role.name}</span>
                            {role.description && (
                              <span className="text-xs text-gray-500 mt-0.5">
                                {role.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Permissions Preview */}
                {selectedRole && selectedRole.permissions.length > 0 && (
                  <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-gray-900">
                        {tUsers('permissionsLabel')} ({selectedRole.permissions.length})
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        {selectedRole.name}
                      </Badge>
                    </div>

                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                      {Object.entries(groupPermissionsByCategory(selectedRole.permissions)).map(
                        ([category, perms]) =>
                          perms.length > 0 && (
                            <div key={category} className="space-y-1.5">
                              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                {tUsers(`permissions.categories.${category}`)}
                              </Label>
                              <div className="flex flex-wrap gap-1.5">
                                {perms.map((permission) => (
                                  <Badge
                                    key={permission}
                                    variant="outline"
                                    className="text-xs px-2 py-0.5 bg-white text-gray-700 border-gray-300 font-normal"
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1 inline text-viridial-600" />
                                    {permissionLabels[permission] || permission}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                )}

                {selectedRole && selectedRole.permissions.length === 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      {tUsers('noPermissionsWarning')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Email Error Message */}
          {emailError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{emailError}</p>
              </div>
            </div>
          )}

          {/* Preview for Multiple Mode */}
          {inviteMode === 'multiple' && validEmails.length > 0 && (
            <div className="space-y-2 p-4 bg-viridial-50 border border-viridial-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold text-gray-900">
                  {tUsers('previewInvitations') || 'Preview Invitations'} ({validEmails.length})
                </Label>
              </div>
              <ScrollArea className="h-[120px] border rounded-md p-3 bg-white">
                <div className="space-y-1">
                  {validEmails.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-gray-700 py-1"
                    >
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="font-mono">{email}</span>
                      {firstName && lastName && (
                        <span className="text-gray-500">
                          ({firstName} {lastName})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-viridial-600 hover:bg-viridial-700 text-white"
              disabled={
                !roleId ||
                roles.length === 0 ||
                (inviteMode === 'single' && (!singleEmail || !isValidEmail(singleEmail))) ||
                (inviteMode === 'multiple' && validEmails.length === 0)
              }
            >
              <Mail className="h-4 w-4 mr-2" />
              {inviteMode === 'single'
                ? tUsers('sendInvitation')
                : `${tUsers('sendInvitations') || 'Send Invitations'} (${validEmails.length})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

