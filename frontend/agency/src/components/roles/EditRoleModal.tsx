'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Role, Permission, UpdateRoleDto } from '@/types/admin';
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
import { Switch } from '@/components/ui/switch';
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
import { RefreshCw, Save, Shield } from 'lucide-react';

interface EditRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  permissions: Permission[];
  groupedPermissions: Record<string, Permission[]>;
  organizations: Organization[];
  isSuperAdmin: boolean;
  onSaveSuccess: () => void;
}

export function EditRoleModal({
  open,
  onOpenChange,
  role,
  permissions,
  groupedPermissions,
  organizations,
  isSuperAdmin,
  onSaveSuccess,
}: EditRoleModalProps) {
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateRoleDto>({
    name: role.name,
    description: role.description || '',
    isActive: role.isActive,
    permissionIds: role.permissions.map((p) => p.id),
  });

  // Update form data when role changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        isActive: role.isActive,
        permissionIds: role.permissions.map((p) => p.id),
      });
    }
  }, [role]);

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: tCommon('error') || 'Error',
        description: t('errors.nameRequired') || 'Role name is required',
        variant: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);
      await roleApi.update(role.id, formData);
      toast({
        variant: 'success',
        title: tCommon('success') || 'Success',
        description: t('updateSuccess') || 'Role updated successfully',
      });
      onSaveSuccess();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof RoleApiError 
          ? error.message 
          : t('errors.updateFailed') || 'Failed to update role',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-viridial-100 rounded-lg">
              <Shield className="h-5 w-5 text-viridial-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">{t('editRole') || 'Edit Role'}</DialogTitle>
              <DialogDescription className="mt-1">
                {t('editDescription') || 'Update role details and permissions to control access'}
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
                value={formData.name || ''}
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

            {/* Active Status */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label>{t('active') || 'Active'}</Label>
                <p className="text-sm text-gray-500">
                  {t('activeDescription') || 'Inactive roles cannot be assigned to users'}
                </p>
              </div>
              <Switch
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <Label className="text-base font-semibold">{t('permissions') || 'Permissions'}</Label>
                <Badge variant="secondary" className="text-sm font-medium">
                  {selectedPermissionIds.length} {t('selected') || 'selected'}
                </Badge>
              </div>

              <div className="space-y-4 border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                {Object.entries(groupedPermissions).map(([resource, perms]) => {
                  const resourcePermissionIds = perms.map((p) => p.id);
                  const allSelected = resourcePermissionIds.every((id) => selectedPermissionIds.includes(id));
                  const someSelected = resourcePermissionIds.some((id) => selectedPermissionIds.includes(id));

                  return (
                    <div key={resource} className="space-y-2">
                      {/* Resource Header */}
                      <div className="flex items-center space-x-3 pb-3 border-b border-gray-300 bg-white p-3 rounded-lg">
                        <Checkbox
                          id={`resource-${resource}`}
                          checked={allSelected}
                          indeterminate={someSelected && !allSelected}
                          onCheckedChange={() => toggleResourcePermissions(resource)}
                          className="border-gray-400"
                        />
                        <Label
                          htmlFor={`resource-${resource}`}
                          className="font-semibold cursor-pointer flex-1 flex items-center gap-2"
                        >
                          <Badge variant="outline" className="font-medium px-2.5 py-1">
                            {resource}
                          </Badge>
                          <span className="text-sm text-gray-600">{t('selectAll') || 'Select All'}</span>
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          {perms.length} {t('permissions') || 'permissions'}
                        </Badge>
                      </div>

                      {/* Permission Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                        {perms.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={selectedPermissionIds.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                            <Label
                              htmlFor={`permission-${permission.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {permission.action}
                                </Badge>
                                {permission.description && (
                                  <span className="text-gray-500 text-xs">
                                    {permission.description}
                                  </span>
                                )}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
            disabled={isLoading || !formData.name?.trim()}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('saving') || 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {tCommon('save') || 'Save'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

