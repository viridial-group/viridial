'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
import { Key, Loader2 } from 'lucide-react';
import { permissionApi, PermissionApiError } from '@/lib/permission-api';
import { resourceApi } from '@/lib/resource-api';
import { featureApi } from '@/lib/feature-api';
import { useToast } from '@/components/ui/toast';
import type { CreatePermissionDto, UpdatePermissionDto, Permission, Feature, Resource } from '@/types/admin';

interface CreatePermissionModalGenericProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (permission: Permission) => void;
  permission?: Permission; // If provided, modal is in edit mode
}

const ACTIONS = ['read', 'write', 'delete', 'admin', 'create', 'update', 'view', 'manage'];

export function CreatePermissionModalGeneric({ isOpen, onClose, onSuccess, permission }: CreatePermissionModalGenericProps) {
  const t = useTranslations('admin.permissions');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [formData, setFormData] = useState<CreatePermissionDto>({
    resourceId: '',
    resource: '',
    action: '',
    description: '',
    externalCode: '',
    featureIds: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePermissionDto, string>>>({});

  // Load resources and features for selection
  useEffect(() => {
    if (isOpen) {
      Promise.all([
        resourceApi.getAll().then(setResources),
        featureApi.getAll().then(setFeatures),
      ]).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (permission) {
        // Edit mode: populate form with existing permission data
        setFormData({
          resourceId: permission.resourceId || '',
          resource: permission.resource,
          action: permission.action,
          description: permission.description || '',
          externalCode: permission.externalCode || '',
          featureIds: permission.features?.map(f => f.id) || [],
        });
      } else {
        // Create mode: reset form
        setFormData({
          resourceId: '',
          resource: '',
          action: '',
          description: '',
          externalCode: '',
          featureIds: [],
        });
      }
      setErrors({});
    }
  }, [isOpen, permission]);

  const handleChange = (field: keyof CreatePermissionDto | 'featureIds', value: string | string[]) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // If resourceId changes, update resource name
      if (field === 'resourceId' && typeof value === 'string') {
        const selectedResource = resources.find(r => r.id === value);
        if (selectedResource) {
          newData.resource = selectedResource.name;
        }
      }
      return newData;
    });
    if (errors[field as keyof CreatePermissionDto]) {
      setErrors((prev) => ({ ...prev, [field as keyof CreatePermissionDto]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePermissionDto, string>> = {};

    if (!formData.resource || formData.resource.trim().length === 0) {
      newErrors.resource = t('errors.resourceRequired') || 'Resource is required';
    }
    if (!formData.action || formData.action.trim().length === 0) {
      newErrors.action = t('errors.actionRequired') || 'Action is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const data: CreatePermissionDto = {
        resourceId: formData.resourceId || undefined,
        resource: formData.resource.trim(),
        action: formData.action.trim(),
        description: formData.description?.trim() || undefined,
        externalCode: formData.externalCode?.trim() || undefined,
        featureIds: formData.featureIds && formData.featureIds.length > 0 ? formData.featureIds : undefined,
      };

      if (permission) {
        // Update existing permission
        const updated = await permissionApi.update(permission.id, data as UpdatePermissionDto);
        onSuccess(updated);
        toast({
          variant: 'success',
          title: t('success.updated') || 'Permission updated',
          description: t('success.updatedDescription') || 'Permission has been updated successfully',
        });
      } else {
        // Create new permission
        const created = await permissionApi.create(data);
        onSuccess(created);
        toast({
          variant: 'success',
          title: t('success.created') || 'Permission created',
          description: t('success.createdDescription') || 'Permission has been created successfully',
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save permission:', error);
      toast({
        variant: 'error',
        title: permission 
          ? (t('errors.updateFailed') || 'Failed to update permission')
          : (t('errors.createFailed') || 'Failed to create permission'),
        description: error instanceof PermissionApiError ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-purple-600" />
            {permission 
              ? (t('editPermission') || 'Edit Permission')
              : (t('createPermission') || 'Create Permission')
            }
          </DialogTitle>
          <DialogDescription>
            {permission
              ? (t('editPermissionDescription') || 'Update permission details')
              : (t('createPermissionDescription') || 'Create a new permission for the RBAC system')
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resource Selection */}
          <div className="space-y-2">
            <Label htmlFor="resourceId">
              {t('form.resource') || 'Resource'} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.resourceId || ''}
              onValueChange={(value) => handleChange('resourceId', value)}
            >
              <SelectTrigger id="resourceId" className={errors.resource ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('form.selectResource') || 'Select a resource'} />
              </SelectTrigger>
              <SelectContent>
                {resources.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name} {resource.category && `(${resource.category})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.resource && (
              <p className="text-xs text-red-500">{errors.resource}</p>
            )}
          </div>

          {/* Action Selection */}
          <div className="space-y-2">
            <Label htmlFor="action">
              {t('form.action') || 'Action'} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.action}
              onValueChange={(value) => handleChange('action', value)}
            >
              <SelectTrigger id="action" className={errors.action ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('form.selectAction') || 'Select an action'} />
              </SelectTrigger>
              <SelectContent>
                {ACTIONS.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.action && (
              <p className="text-xs text-red-500">{errors.action}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('form.description') || 'Description'}</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('form.descriptionPlaceholder') || 'Optional description for this permission'}
              rows={3}
            />
          </div>

          {/* External Code */}
          <div className="space-y-2">
            <Label htmlFor="externalCode">{t('form.externalCode') || 'External Code'}</Label>
            <Input
              id="externalCode"
              value={formData.externalCode || ''}
              onChange={(e) => handleChange('externalCode', e.target.value)}
              placeholder={t('form.externalCodePlaceholder') || 'Optional external identifier'}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('form.cancel') || 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-viridial-600 hover:bg-viridial-700">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('form.saving') || 'Saving...'}
                </>
              ) : (
                t('form.save') || 'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

