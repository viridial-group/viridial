'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Organization } from '@/types/organization';
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
import { Badge } from '@/components/ui/badge';
import { Building2, Network, Globe, Info } from 'lucide-react';

interface CreateOrganizationModalProps {
  organizations: Organization[]; // Toutes les organisations pour sélectionner un parent
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultParentId?: string; // ParentId par défaut (pour créer une sous-organisation)
  onCreate: (data: {
    name: string;
    slug: string;
    description?: string;
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    maxUsers: number;
    isActive: boolean;
    country?: string;
    city?: string;
    parentId?: string;
  }) => void;
}

export function CreateOrganizationModal({
  organizations,
  open,
  onOpenChange,
  defaultParentId,
  onCreate,
}: CreateOrganizationModalProps) {
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    plan: 'basic' as 'free' | 'basic' | 'professional' | 'enterprise',
    maxUsers: 10,
    isActive: true,
    country: '',
    city: '',
    parentId: '',
  });

  const [slugError, setSlugError] = useState<string>('');

  useEffect(() => {
    if (open) {
      // Reset form when modal opens, but use defaultParentId if provided
      setFormData({
        name: '',
        slug: '',
        description: '',
        plan: 'basic',
        maxUsers: 10,
        isActive: true,
        country: '',
        city: '',
        parentId: defaultParentId || '',
      });
      setSlugError('');
    }
  }, [open, defaultParentId]);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !slugError) {
      const generatedSlug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, slugError]);

  // Validate slug uniqueness
  useEffect(() => {
    if (formData.slug) {
      const existingOrg = organizations.find(
        (org) => org.slug === formData.slug
      );
      if (existingOrg) {
        setSlugError(t('slugAlreadyExists') || 'This slug is already taken');
      } else {
        setSlugError('');
      }
    }
  }, [formData.slug, organizations, t]);

  // Get unique countries and cities from existing organizations
  const uniqueCountries = Array.from(
    new Set(
      organizations
        .map((org) => org.country)
        .filter((country): country is string => Boolean(country))
    )
  ).sort();

  const uniqueCities = Array.from(
    new Set(
      organizations
        .map((org) => org.city)
        .filter((city): city is string => Boolean(city))
    )
  ).sort();

  // Filter organizations that can be parents
  // All active organizations can be parents (even sub-organizations can have children)
  // Circular references are prevented by the backend validation
  const availableParents = organizations.filter(
    (org) => org.isActive // Only active organizations can be parents
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string, field: keyof typeof formData) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleParentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, parentId: value === 'none' ? '' : value }));
  };

  const selectedParent = formData.parentId
    ? organizations.find((org) => org.id === formData.parentId)
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError || !formData.name || !formData.slug) {
      return;
    }
    onCreate({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      plan: formData.plan,
      maxUsers: formData.maxUsers,
      isActive: formData.isActive,
      country: formData.country || undefined,
      city: formData.city || undefined,
      parentId: formData.parentId || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-viridial-600" />
            {t('createOrganization')}
          </DialogTitle>
          <DialogDescription>
            {t('createOrganizationDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Building2 className="h-4 w-4 text-viridial-600" />
              <Label className="text-base font-semibold">{t('basicInformation')}</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                {t('name')} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full"
                placeholder={t('namePlaceholder') || 'Organization name'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                {t('slug')} *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className={`w-full ${slugError ? 'border-red-500' : ''}`}
                placeholder={t('slugPlaceholder') || 'organization-slug'}
              />
              {slugError && (
                <p className="text-xs text-red-600">{slugError}</p>
              )}
              <p className="text-xs text-gray-500">{t('slugHelp') || 'Auto-generated from name. Must be unique.'}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full"
                placeholder={t('descriptionPlaceholder') || 'Organization description...'}
              />
            </div>
          </div>

          {/* Plan and Configuration */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan">
                  {t('plan')} *
                </Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) =>
                    handleSelectChange(value, 'plan')
                  }
                >
                  <SelectTrigger id="plan" className="w-full">
                    <SelectValue placeholder={t('selectPlan')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">
                      {t('plans.free')} ({t('maxUsersFree')} {t('users')})
                    </SelectItem>
                    <SelectItem value="basic">
                      {t('plans.basic')} ({t('maxUsersBasic')} {t('users')})
                    </SelectItem>
                    <SelectItem value="professional">
                      {t('plans.professional')} ({t('maxUsersProfessional')} {t('users')})
                    </SelectItem>
                    <SelectItem value="enterprise">
                      {t('plans.enterprise')} ({t('maxUsersEnterprise')} {t('users')})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUsers">
                  {t('maxUsers')} *
                </Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min="1"
                  value={formData.maxUsers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsers: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-base">{t('status')}</Label>
                <p className="text-sm text-gray-500">{t('activeStatusDescription')}</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 pb-2">
              <Globe className="h-4 w-4 text-viridial-600" />
              <Label className="text-base font-semibold">{t('locationInformation')}</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">{t('country')}</Label>
                <Select
                  value={formData.country || 'none'}
                  onValueChange={(value) =>
                    handleSelectChange(value === 'none' ? '' : value, 'country')
                  }
                >
                  <SelectTrigger id="country" className="w-full">
                    <SelectValue placeholder={t('selectCountry') || 'Select country'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('none') || 'None'}</SelectItem>
                    {uniqueCountries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t('city')}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full"
                  placeholder={t('cityPlaceholder') || 'City name'}
                />
              </div>
            </div>
          </div>

          {/* Organization Relationship */}
          {defaultParentId ? (
            // Si defaultParentId est fourni, afficher un bloc d'information sur le parent
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="p-4 bg-viridial-50 border border-viridial-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-viridial-600" />
                  <Label className="text-sm font-semibold text-gray-900">
                    {t('parentOrganization')}
                  </Label>
                </div>
                {selectedParent ? (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-viridial-100">
                      <Building2 className="h-4 w-4 text-viridial-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {selectedParent.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {selectedParent.slug}
                      </p>
                      {selectedParent.city && selectedParent.country && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {selectedParent.city}, {selectedParent.country}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {t(`plans.${selectedParent.plan}`)}
                    </Badge>
                  </div>
                ) : null}
                <p className="text-xs text-gray-600 mt-2">
                  {t('addSubOrganizationHelp') || 'The new organization will be created as a sub-organization of the parent organization above.'}
                </p>
              </div>
            </div>
          ) : (
            // Si defaultParentId n'est pas fourni, afficher le sélecteur
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 pb-2">
                <Network className="h-4 w-4 text-viridial-600" />
                <Label className="text-base font-semibold">{t('organizationRelationship')}</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">
                  {t('parentOrganization')}
                </Label>
                <Select
                  value={formData.parentId || 'none'}
                  onValueChange={handleParentChange}
                >
                  <SelectTrigger id="parentId" className="w-full">
                    <SelectValue placeholder={t('selectParentOrganization') || 'Select parent organization (optional)'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{t('none') || 'None'}</span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {t('rootOrganization') || 'Root organization (no parent)'}
                        </span>
                      </div>
                    </SelectItem>
                    {availableParents.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{org.name}</span>
                          {org.city && org.country && (
                            <span className="text-xs text-gray-500 mt-0.5">
                              {org.city}, {org.country}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedParent && (
                  <div className="mt-2 p-3 bg-viridial-50 border border-viridial-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {t('parentOrganization')}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedParent.name}
                      </span>
                    </div>
                    {selectedParent.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedParent.description}
                      </p>
                    )}
                    {selectedParent.plan && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {t(`plans.${selectedParent.plan}`)}
                        </Badge>
                        {selectedParent.city && selectedParent.country && (
                          <span className="text-xs text-gray-500">
                            {selectedParent.city}, {selectedParent.country}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {t('parentOrganizationHelp') || 'Select a parent organization to create a hierarchical relationship. The new organization will be a sub-organization of the selected parent.'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-viridial-600 hover:bg-viridial-700 text-white"
              disabled={!!slugError || !formData.name || !formData.slug}
            >
              <Building2 className="h-4 w-4 mr-2" />
              {t('createOrganization')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

