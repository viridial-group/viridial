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
import { Switch } from '@/components/ui/switch';
import { Folder } from 'lucide-react';
import { resourceApi } from '@/lib/resource-api';
import { useToast } from '@/components/ui/toast';
import type { CreateResourceDto, UpdateResourceDto, Resource } from '@/types/admin';

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (resource: Resource) => void;
  resource?: Resource; // If provided, modal is in edit mode
}

export function CreateResourceModal({ isOpen, onClose, onSuccess, resource }: CreateResourceModalProps) {
  const t = useTranslations('admin.resources');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateResourceDto & { isActive: boolean }>({
    name: '',
    description: '',
    category: '',
    externalCode: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateResourceDto, string>>>({});

  useEffect(() => {
    if (isOpen) {
      if (resource) {
        // Edit mode: populate form with existing resource data
        setFormData({
          name: resource.name,
          description: resource.description || '',
          category: resource.category || '',
          externalCode: resource.externalCode || '',
          isActive: resource.isActive,
        });
      } else {
        // Create mode: reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          externalCode: '',
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, resource]);

  const handleChange = (field: keyof CreateResourceDto, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateResourceDto, string>> = {};
    
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = t('errors.nameRequired') || 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = t('errors.nameTooLong') || 'Name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = t('errors.descriptionTooLong') || 'Description must be less than 255 characters';
    }

    if (formData.category && formData.category.length > 50) {
      newErrors.category = t('errors.categoryTooLong') || 'Category must be less than 50 characters';
    }

    if (formData.externalCode && formData.externalCode.length > 255) {
      newErrors.externalCode = t('errors.externalCodeTooLong') || 'External code must be less than 255 characters';
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
      const data = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        category: formData.category?.trim() || undefined,
        externalCode: formData.externalCode?.trim() || undefined,
        isActive: formData.isActive ?? true,
      };

      if (resource) {
        // Update existing resource
        const updated = await resourceApi.update(resource.id, data as UpdateResourceDto);
        onSuccess(updated);
      } else {
        // Create new resource
        const created = await resourceApi.create(data);
        onSuccess(created);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save resource:', error);
      toast({
        variant: 'error',
        title: resource 
          ? (t('errors.updateFailed') || 'Failed to update resource')
          : (t('errors.createFailed') || 'Failed to create resource'),
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['core', 'admin', 'billing', 'reporting', 'integration', 'other'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-viridial-600" />
            {resource 
              ? (t('editResource') || 'Edit Resource')
              : (t('createResource') || 'Create Resource')
            }
          </DialogTitle>
          <DialogDescription>
            {resource
              ? (t('editResourceDescription') || 'Update resource information')
              : (t('createResourceDescription') || 'Create a new resource for permission management')
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Folder className="h-4 w-4 text-viridial-600" />
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
                className={`w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder={t('namePlaceholder') || 'e.g., property, user, organization'}
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
                className={`w-full ${errors.description ? 'border-red-500' : ''}`}
                placeholder={t('descriptionPlaceholder') || 'Resource description...'}
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
                  className={`w-full ${errors.externalCode ? 'border-red-500' : ''}`}
                  placeholder={t('externalCodePlaceholder') || 'Optional external identifier'}
                />
                {errors.externalCode && (
                  <p className="text-xs text-red-600">{errors.externalCode}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-sm font-medium">
                  {t('isActive') || 'Active'}
                </Label>
                <p className="text-xs text-gray-500">
                  {t('isActiveDescription') || 'Only active resources can be used in permissions'}
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
            </div>
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
            {isLoading 
              ? (t('saving') || 'Saving...')
              : resource
              ? (t('update') || 'Update Resource')
              : (t('create') || 'Create Resource')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

