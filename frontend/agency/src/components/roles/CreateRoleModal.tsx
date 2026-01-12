'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Permission, CreateRoleDto } from '@/types/admin';
import { Organization } from '@/types/organization';
import { roleApi, RoleApiError } from '@/lib/role-api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { RefreshCw, Save, X, Shield, Info, Search, CheckSquare, Square } from 'lucide-react';

interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: Permission[];
  groupedPermissions: Record<string, Permission[]>;
  organizations: Organization[];
  isSuperAdmin: boolean;
  onCreateSuccess: () => void;
}

export function CreateRoleModal({
  open,
  onOpenChange,
  permissions,
  groupedPermissions,
  organizations,
  isSuperAdmin,
  onCreateSuccess,
}: CreateRoleModalProps) {
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<CreateRoleDto>({
    name: '',
    description: '',
    organizationId: isSuperAdmin ? null : undefined,
    permissionIds: [],
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        description: '',
        organizationId: isSuperAdmin ? null : undefined,
        permissionIds: [],
      });
    }
  }, [open, isSuperAdmin]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: tCommon('error') || 'Error',
        description: t('errors.nameRequired') || 'Role name is required',
        variant: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);
      await roleApi.create(formData);
      toast({
        variant: 'success',
        title: tCommon('success') || 'Success',
        description: t('createSuccess') || 'Role created successfully',
      });
      onCreateSuccess();
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof RoleApiError 
          ? error.message 
          : t('errors.createFailed') || 'Failed to create role',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => {
      const currentIds = prev.permissionIds || [];
      if (currentIds.includes(permissionId)) {
        return {
          ...prev,
          permissionIds: currentIds.filter((id) => id !== permissionId),
        };
      } else {
        return {
          ...prev,
          permissionIds: [...currentIds, permissionId],
        };
      }
    });
  };

  const toggleResourcePermissions = (resource: string) => {
    const resourcePermissions = groupedPermissions[resource] || [];
    const resourcePermissionIds = resourcePermissions.map((p) => p.id);
    const currentIds = formData.permissionIds || [];
    
    // Check if all permissions for this resource are selected
    const allSelected = resourcePermissionIds.every((id) => currentIds.includes(id));
    
    setFormData((prev) => {
      const currentIds = prev.permissionIds || [];
      if (allSelected) {
        // Deselect all permissions for this resource
        return {
          ...prev,
          permissionIds: currentIds.filter((id) => !resourcePermissionIds.includes(id)),
        };
      } else {
        // Select all permissions for this resource
        const newIds = [...currentIds];
        resourcePermissionIds.forEach((id) => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return {
          ...prev,
          permissionIds: newIds,
        };
      }
    });
  };

  const selectedPermissionIds = formData.permissionIds || [];

  // Filter permissions based on search query
  const filteredGroupedPermissions = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedPermissions;
    }
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, Permission[]> = {};
    Object.entries(groupedPermissions).forEach(([resource, perms]) => {
      const matchingPerms = perms.filter(
        (p) =>
          resource.toLowerCase().includes(query) ||
          p.action.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
      if (matchingPerms.length > 0) {
        filtered[resource] = matchingPerms;
      }
    });
    return filtered;
  }, [groupedPermissions, searchQuery]);

  // Select/Deselect all permissions
  const toggleAllPermissions = () => {
    const allPermissionIds = permissions.map((p) => p.id);
    const allSelected = allPermissionIds.every((id) => selectedPermissionIds.includes(id));
    
    setFormData((prev) => ({
      ...prev,
      permissionIds: allSelected ? [] : allPermissionIds,
    }));
  };

  const allPermissionsSelected = permissions.length > 0 && permissions.every((p) => selectedPermissionIds.includes(p.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-viridial-100 rounded-lg">
              <Shield className="h-5 w-5 text-viridial-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">{t('createRole') || 'Create Role'}</DialogTitle>
              <DialogDescription className="mt-1">
                {t('createDescription') || 'Create a new role and assign permissions to control access'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Role Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('name') || 'Name'} *</Label>
              <Input
                id="name"
                placeholder={t('namePlaceholder') || 'Enter role name'}
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('description') || 'Description'}</Label>
              <Textarea
                id="description"
                placeholder={t('descriptionPlaceholder') || 'Enter role description'}
                value={formData.description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Organization (super admin only) */}
            {isSuperAdmin && organizations.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="organization">{t('organization') || 'Organization'}</Label>
                <Select
                  value={formData.organizationId || 'global'}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      organizationId: value === 'global' ? null : value,
                    }));
                  }}
                >
                  <SelectTrigger id="organization">
                    <SelectValue placeholder={t('selectOrganization') || 'Select organization'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">{t('globalRole') || 'Global (System Role)'}</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Permissions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">{t('permissions') || 'Permissions'}</Label>
                  <div className="group relative">
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                      {t('permissionsHelp') || 'Select permissions to control what actions users with this role can perform. You can select all permissions or choose specific ones by resource.'}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm font-medium">
                  {selectedPermissionIds.length} / {permissions.length} {t('selected') || 'selected'}
                </Badge>
              </div>

              {/* Search and Select All Controls */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('searchPermissions') || 'Search permissions by resource or action...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleAllPermissions}
                  className="flex items-center gap-2"
                >
                  {allPermissionsSelected ? (
                    <>
                      <Square className="h-4 w-4" />
                      {t('deselectAll') || 'Deselect All'}
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      {t('selectAll') || 'Select All'}
                    </>
                  )}
                </Button>
              </div>

              {/* Helpful Info Message */}
              {selectedPermissionIds.length === 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      {t('noPermissionsWarning') || 'No permissions selected. Users with this role will not have access to any features. Please select at least one permission.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4 border-2 border-gray-200 rounded-lg p-4 bg-gray-50 max-h-[400px] overflow-y-auto">
                {Object.keys(filteredGroupedPermissions).length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {t('noPermissionsFound') || 'No permissions found matching your search'}
                  </div>
                ) : (
                  Object.entries(filteredGroupedPermissions).map(([resource, perms]) => {
                    const resourcePermissionIds = perms.map((p) => p.id);
                    const allSelected = resourcePermissionIds.every((id) => selectedPermissionIds.includes(id));
                    const someSelected = resourcePermissionIds.some((id) => selectedPermissionIds.includes(id));

                    return (
                      <div key={resource} className="space-y-3 bg-white rounded-lg p-3 border border-gray-200">
                        {/* Resource Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`resource-${resource}`}
                              checked={allSelected}
                              indeterminate={someSelected && !allSelected}
                              onCheckedChange={() => toggleResourcePermissions(resource)}
                            />
                            <Label
                              htmlFor={`resource-${resource}`}
                              className="font-semibold cursor-pointer flex items-center gap-2"
                            >
                              <Badge variant="outline" className="font-medium px-2.5 py-1">
                                {resource}
                              </Badge>
                            </Label>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {perms.length} {t('permissions') || 'permissions'}
                          </Badge>
                        </div>

                        {/* Permission Items */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                          {perms.map((permission) => (
                            <div
                              key={permission.id}
                              className={`flex items-start space-x-2 p-2 rounded transition-colors ${
                                selectedPermissionIds.includes(permission.id)
                                  ? 'bg-viridial-50 border border-viridial-200'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <Checkbox
                                id={`permission-${permission.id}`}
                                checked={selectedPermissionIds.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                                className="mt-0.5"
                              />
                              <Label
                                htmlFor={`permission-${permission.id}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs font-medium">
                                      {permission.action}
                                    </Badge>
                                  </div>
                                  {permission.description && (
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {tCommon('cancel') || 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.name.trim()}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('saving') || 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('create') || 'Create'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

