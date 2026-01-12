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
import { Checkbox } from '@/components/ui/checkbox';
import { GitBranch, Loader2, Key } from 'lucide-react';
import { featureApi, FeatureApiError } from '@/lib/feature-api';
import { permissionApi } from '@/lib/permission-api';
import { useToast } from '@/components/ui/toast';
import type { CreateFeatureDto, UpdateFeatureDto, Feature, Permission, Resource } from '@/types/admin';

interface CreateFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (feature: Feature) => void;
  feature?: Feature; // If provided, modal is in edit mode
  resource?: Resource; // Optional: if provided, filter permissions to this resource
}

export function CreateFeatureModal({ isOpen, onClose, onSuccess, feature, resource }: CreateFeatureModalProps) {
  const t = useTranslations('admin.features');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [formData, setFormData] = useState<CreateFeatureDto & { permissionIds: string[] }>({
    name: '',
    description: '',
    category: '',
    externalCode: '',
    isActive: true,
    permissionIds: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateFeatureDto, string>>>({});

  // Load permissions for selection
  useEffect(() => {
    if (isOpen) {
      const loadPermissions = async () => {
        try {
          const filters = resource ? { resourceId: resource.id } : undefined;
          const perms = await permissionApi.getAll(filters);
          setPermissions(perms);
        } catch (error) {
          console.error('Failed to load permissions:', error);
        }
      };
      loadPermissions();
    }
  }, [isOpen, resource]);

  useEffect(() => {
    if (isOpen) {
      if (feature) {
        // Edit mode: populate form with existing feature data
        setFormData({
          name: feature.name,
          description: feature.description || '',
          category: feature.category || '',
          externalCode: feature.externalCode || '',
          isActive: feature.isActive,
          permissionIds: feature.permissions?.map(p => p.id) || [],
        });
      } else {
        // Create mode: reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          externalCode: '',
          isActive: true,
          permissionIds: [],
        });
      }
      setErrors({});
    }
  }, [isOpen, feature]);

  const handleChange = (field: keyof CreateFeatureDto | 'permissionIds', value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof CreateFeatureDto]) {
      setErrors((prev) => ({ ...prev, [field as keyof CreateFeatureDto]: undefined }));
    }
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => {
      const currentIds = prev.permissionIds || [];
      if (currentIds.includes(permissionId)) {
        return { ...prev, permissionIds: currentIds.filter(id => id !== permissionId) };
      } else {
        return { ...prev, permissionIds: [...currentIds, permissionId] };
      }
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateFeatureDto, string>> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = t('errors.nameRequired') || 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = t('errors.nameTooLong') || 'Name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = t('errors.descriptionTooLong') || 'Description must be less than 255 characters';
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
      const dataToSave: CreateFeatureDto | UpdateFeatureDto = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        category: formData.category?.trim() || undefined,
        externalCode: formData.externalCode?.trim() || undefined,
        isActive: formData.isActive ?? true,
        permissionIds: formData.permissionIds || [],
      };

      let savedFeature: Feature;
      if (feature) {
        savedFeature = await featureApi.update(feature.id, dataToSave);
      } else {
        savedFeature = await featureApi.create(dataToSave as CreateFeatureDto);
      }

      onSuccess(savedFeature);
      onClose();
    } catch (error) {
      console.error('Failed to save feature:', error);
      toast({
        variant: 'error',
        title: feature ? (t('errors.updateFailed') || 'Failed to update feature') : (t('errors.createFailed') || 'Failed to create feature'),
        description: error instanceof FeatureApiError ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['core', 'admin', 'billing', 'reporting', 'integration', 'other'];

  // Group permissions by resource
  const permissionsByResource = permissions.reduce((acc, perm) => {
    const resourceName = perm.resource;
    if (!acc[resourceName]) {
      acc[resourceName] = [];
    }
    acc[resourceName].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-viridial-600" />
            {feature 
              ? (t('editFeature') || 'Edit Feature')
              : (t('createFeature') || 'Create Feature')
            }
          </DialogTitle>
          <DialogDescription>
            {feature
              ? (t('editFeatureDescription') || 'Update feature information')
              : (t('createFeatureDescription') || 'Create a new feature that groups permissions')
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <GitBranch className="h-4 w-4 text-viridial-600" />
              <Label className="text-base font-semibold">{t('basicInformation') || 'Basic Information'}</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                {t('name') || 'Name'} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className={errors.name ? 'border-red-500' : ''}
                placeholder={t('namePlaceholder') || 'e.g., property-management, user-management'}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description') || 'Description'}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
                placeholder={t('descriptionPlaceholder') || 'Feature description...'}
              />
              {errors.description && (
                <p className="text-xs text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{t('category') || 'Category'}</Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => handleChange('category', value || '')}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder={t('selectCategory') || 'Select category'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            </div>
          </div>

          {/* Permissions Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Key className="h-4 w-4 text-viridial-600" />
              <Label className="text-base font-semibold">{t('selectPermissions') || 'Select Permissions'}</Label>
            </div>

            {permissions.length === 0 ? (
              <p className="text-sm text-gray-500">{t('noPermissionsAvailable') || 'No permissions available'}</p>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {Object.entries(permissionsByResource).map(([resourceName, resourcePermissions]) => (
                  <div key={resourceName} className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">{resourceName}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                      {resourcePermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start space-x-2 p-2 rounded transition-colors hover:bg-gray-50"
                        >
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={formData.permissionIds.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600">{permission.action}</span>
                              </div>
                              {permission.description && (
                                <p className="text-xs text-gray-500 leading-relaxed">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
            {feature ? (t('save') || 'Save') : (t('create') || 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

