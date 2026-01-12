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
import { featureApi } from '@/lib/feature-api';
import { useToast } from '@/components/ui/toast';
import type { CreatePermissionDto, UpdatePermissionDto, Permission, Feature, Resource } from '@/types/admin';

interface CreatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (permission: Permission) => void;
  permission?: Permission; // If provided, modal is in edit mode
  resource: Resource; // The resource this permission belongs to
}

const ACTIONS = ['read', 'write', 'delete', 'admin', 'create', 'update', 'view', 'manage'];

export function CreatePermissionModal({ isOpen, onClose, onSuccess, permission, resource }: CreatePermissionModalProps) {
  const t = useTranslations('admin.resources.detail');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [formData, setFormData] = useState<CreatePermissionDto>({
    resourceId: resource.id,
    resource: resource.name,
    action: '',
    description: '',
    externalCode: '',
    featureIds: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePermissionDto, string>>>({});

  // Load features for selection
  useEffect(() => {
    if (isOpen) {
      featureApi.getAll().then(setFeatures).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (permission) {
        // Edit mode: populate form with existing permission data
        setFormData({
          resourceId: permission.resourceId || resource.id,
          resource: permission.resource || resource.name,
          action: permission.action,
          description: permission.description || '',
          externalCode: permission.externalCode || '',
          featureIds: permission.features?.map(f => f.id) || [],
        });
      } else {
        // Create mode: reset form
        setFormData({
          resourceId: resource.id,
          resource: resource.name,
          action: '',
          description: '',
          externalCode: '',
          featureIds: [],
        });
      }
      setErrors({});
    }
  }, [isOpen, permission, resource]);

  const handleChange = (field: keyof CreatePermissionDto | 'featureIds', value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof CreatePermissionDto]) {
      setErrors((prev) => ({ ...prev, [field as keyof CreatePermissionDto]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePermissionDto, string>> = {};

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
      const dataToSave: CreatePermissionDto | UpdatePermissionDto = {
        resourceId: resource.id,
        resource: resource.name,
        action: formData.action.trim(),
        description: formData.description?.trim() || undefined,
        externalCode: formData.externalCode?.trim() || undefined,
        featureIds: formData.featureIds || [],
      };

      let savedPermission: Permission;
      if (permission) {
        savedPermission = await permissionApi.update(permission.id, dataToSave);
      } else {
        savedPermission = await permissionApi.create(dataToSave as CreatePermissionDto);
      }

      onSuccess(savedPermission);
      onClose();
    } catch (error) {
      console.error('Failed to save permission:', error);
      toast({
        variant: 'error',
        title: permission ? (t('errors.updateFailed') || 'Failed to update permission') : (t('errors.createFailed') || 'Failed to create permission'),
        description: error instanceof PermissionApiError ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-viridial-600" />
            {permission 
              ? (t('editPermission') || 'Edit Permission')
              : (t('createPermission') || 'Create Permission')
            }
          </DialogTitle>
          <DialogDescription>
            {permission
              ? (t('editPermissionDescription') || 'Update permission information')
              : (t('createPermissionDescription') || `Create a new permission for resource: ${resource.name}`)
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Resource Info (read-only) */}
          <div className="space-y-2">
            <Label>{t('resource') || 'Resource'}</Label>
            <Input
              value={resource.name}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* Action */}
          <div className="space-y-2">
            <Label htmlFor="action">
              {t('action') || 'Action'} *
            </Label>
            <Select
              value={formData.action}
              onValueChange={(value) => handleChange('action', value)}
            >
              <SelectTrigger id="action" className={errors.action ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('selectAction') || 'Select action'} />
              </SelectTrigger>
              <SelectContent>
                {ACTIONS.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.action && (
              <p className="text-xs text-red-600">{errors.action}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('description') || 'Description'}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
              placeholder={t('descriptionPlaceholder') || 'Permission description...'}
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* External Code */}
          <div className="space-y-2">
            <Label htmlFor="externalCode">{t('externalCode') || 'External Code'}</Label>
            <Input
              id="externalCode"
              value={formData.externalCode}
              onChange={(e) => handleChange('externalCode', e.target.value)}
              className={errors.externalCode ? 'border-red-500' : ''}
              placeholder={t('externalCodePlaceholder') || 'Optional external identifier'}
            />
            {errors.externalCode && (
              <p className="text-xs text-red-600">{errors.externalCode}</p>
            )}
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('cancel') || 'Cancel'}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-viridial-600 hover:bg-viridial-700"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {permission ? (t('save') || 'Save') : (t('create') || 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

