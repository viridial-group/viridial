'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2 } from 'lucide-react';
import { roleApi, Role } from '@/lib/role-api';

interface AssignRolesModalProps {
  user: {
    id: string;
    userRoles?: Array<{ roleId: string; role?: Role }>;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (roleIds: string[]) => Promise<void>;
}

export function AssignRolesModal({
  user,
  open,
  onOpenChange,
  onAssign,
}: AssignRolesModalProps) {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available roles
  useEffect(() => {
    if (open) {
      loadRoles();
      // Initialize selected roles with current user roles
      const currentRoleIds = new Set(user.userRoles?.map(ur => ur.roleId) || []);
      setSelectedRoleIds(currentRoleIds);
    }
  }, [open, user.userRoles]);

  const loadRoles = async () => {
    setIsLoadingRoles(true);
    setError(null);
    try {
      const roles = await roleApi.getAll({ isActive: true });
      setAvailableRoles(roles);
    } catch (err) {
      console.error('Error loading roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load roles');
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds(prev => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  };

  const handleAssign = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onAssign(Array.from(selectedRoleIds));
      onOpenChange(false);
    } catch (err) {
      console.error('Error assigning roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign roles');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('assignRoles') || 'Assign Roles'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoadingRoles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          ) : availableRoles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">{t('noRolesAvailable') || 'No roles available'}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {availableRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={selectedRoleIds.has(role.id)}
                    onCheckedChange={() => handleToggleRole(role.id)}
                    id={`role-${role.id}`}
                  />
                  <Label
                    htmlFor={`role-${role.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    {role.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{role.description}</div>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isLoading || isLoadingRoles}
            className="bg-viridial-600 hover:bg-viridial-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('saving') || 'Saving...'}
              </>
            ) : (
              t('assignRoles') || 'Assign Roles'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

