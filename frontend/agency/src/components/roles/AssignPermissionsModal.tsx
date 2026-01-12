'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Role, Permission } from '@/lib/role-api';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { Search, Shield, Loader2, CheckCircle2 } from 'lucide-react';

interface AssignPermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  permissions: Permission[];
  groupedPermissions: Record<string, Permission[]>;
  onSuccess: () => void;
}

export function AssignPermissionsModal({
  open,
  onOpenChange,
  role,
  permissions,
  groupedPermissions,
  onSuccess,
}: AssignPermissionsModalProps) {
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize selected permissions with current role permissions
  useEffect(() => {
    if (open && role) {
      const currentPermissionIds = new Set(role.permissions.map(p => p.id));
      setSelectedPermissionIds(currentPermissionIds);
      setSearchQuery('');
    }
  }, [open, role]);

  // Filter permissions by search query
  const filteredGroupedPermissions = useRef<Record<string, Permission[]>>({});
  useEffect(() => {
    if (!searchQuery.trim()) {
      filteredGroupedPermissions.current = groupedPermissions;
    } else {
      const query = searchQuery.toLowerCase();
      const filtered: Record<string, Permission[]> = {};
      
      Object.entries(groupedPermissions).forEach(([resource, perms]) => {
        const matchingPerms = perms.filter(perm =>
          perm.resource.toLowerCase().includes(query) ||
          perm.action.toLowerCase().includes(query) ||
          (perm.description && perm.description.toLowerCase().includes(query))
        );
        
        if (matchingPerms.length > 0) {
          filtered[resource] = matchingPerms;
        }
      });
      
      filteredGroupedPermissions.current = filtered;
    }
  }, [searchQuery, groupedPermissions]);

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(permissions.map(p => p.id));
    setSelectedPermissionIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedPermissionIds(new Set());
  };

  const handleSelectResource = (resource: string) => {
    const resourcePerms = filteredGroupedPermissions.current[resource] || [];
    const resourceIds = new Set(resourcePerms.map(p => p.id));
    const allSelected = resourcePerms.every(p => selectedPermissionIds.has(p.id));
    
    setSelectedPermissionIds((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        resourceIds.forEach(id => newSet.delete(id));
      } else {
        resourceIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await roleApi.update(role.id, {
        permissionIds: Array.from(selectedPermissionIds),
      });
      
      toast({
        variant: 'success',
        title: tCommon('success') || 'Success',
        description: t('permissionsAssigned') || 'Permissions assigned successfully',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error assigning permissions:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof RoleApiError 
          ? error.message 
          : t('errors.assignPermissionsFailed') || 'Failed to assign permissions',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCount = selectedPermissionIds.size;
  const totalCount = permissions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-viridial-600" />
            {t('assignPermissions') || 'Assign Permissions'}
          </DialogTitle>
          <DialogDescription>
            {t('assignPermissionsDescription') || 'Select permissions to assign to this role. Users with this role will have access to these permissions.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          {/* Search and Actions */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('searchPermissions') || 'Search permissions by resource or action...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              {t('selectAll') || 'Select All'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="text-xs"
            >
              {t('deselectAll') || 'Deselect All'}
            </Button>
          </div>

          {/* Selected Count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {t('selected') || 'Selected'}: <strong>{selectedCount}</strong> {t('of') || 'of'} <strong>{totalCount}</strong> {t('permissions') || 'permissions'}
            </span>
          </div>

          {/* Permissions List */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 border border-gray-200 rounded-lg">
            <div className="p-4 space-y-4">
              {Object.keys(filteredGroupedPermissions.current).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">{t('noPermissionsFound') || 'No permissions found matching your search'}</p>
                </div>
              ) : (
                Object.entries(filteredGroupedPermissions.current).map(([resource, perms]) => {
                  const allSelected = perms.every(p => selectedPermissionIds.has(p.id));
                  const someSelected = perms.some(p => selectedPermissionIds.has(p.id));

                  return (
                    <div key={resource} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={allSelected}
                            ref={(el) => {
                              if (el) {
                                el.indeterminate = someSelected && !allSelected;
                              }
                            }}
                            onCheckedChange={() => handleSelectResource(resource)}
                          />
                          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-viridial-600" />
                            {resource}
                          </h4>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {perms.filter(p => selectedPermissionIds.has(p.id)).length} / {perms.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                        {perms.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleTogglePermission(perm.id)}
                          >
                            <Checkbox
                              checked={selectedPermissionIds.has(perm.id)}
                              onCheckedChange={() => handleTogglePermission(perm.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{perm.action}</span>
                                {selectedPermissionIds.has(perm.id) && (
                                  <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              {perm.description && (
                                <p className="text-xs text-gray-500 truncate">{perm.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {selectedCount === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                {t('noPermissionsWarning') || 'No permissions selected. Users with this role will not have access to any features. Please select at least one permission.'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {tCommon('cancel') || 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-viridial-600 hover:bg-viridial-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('saving') || 'Saving...'}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t('savePermissions') || 'Save Permissions'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

