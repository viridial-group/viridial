'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Property, UpdatePropertyDto, PropertyType, PropertyStatus, PropertyTranslation } from '@/types/property';
import { propertyApi, PropertyApiError } from '@/lib/property-api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { RefreshCw, Save, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  property: Property;
}

export function EditPropertyModal({
  isOpen,
  onClose,
  onSuccess,
  property,
}: EditPropertyModalProps) {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<UpdatePropertyDto>({});

  // Load property data when modal opens
  useEffect(() => {
    if (isOpen && property) {
      const translation = property.translations?.[0];
      setFormData({
        type: property.type,
        price: property.price,
        currency: property.currency,
        street: property.street || undefined,
        postalCode: property.postalCode || undefined,
        city: property.city || undefined,
        region: property.region || undefined,
        country: property.country || undefined,
        latitude: property.latitude || undefined,
        longitude: property.longitude || undefined,
        mediaUrls: property.mediaUrls || undefined,
        translations: property.translations || undefined,
        status: property.status,
        details: property.details || undefined,
      });
      setActiveTab('basic');
    }
  }, [isOpen, property]);

  const handleSubmit = async () => {
    if (!formData.translations?.[0]?.title?.trim() && !property.translations?.[0]?.title) {
      toast({
        title: tCommon('error') || 'Error',
        description: t('errors.titleRequired') || 'Property title is required',
        variant: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);
      await propertyApi.update(property.id, formData);
      toast({
        variant: 'success',
        title: tCommon('success') || 'Success',
        description: t('updateSuccess') || 'Property updated successfully',
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof PropertyApiError 
          ? error.message 
          : t('errors.updateFailed') || 'Failed to update property',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTranslation = (field: keyof PropertyTranslation, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: (prev.translations || property.translations || []).map((t, i) => 
        i === 0 ? { ...t, [field]: value } : t
      ),
    }));
  };

  const currentTranslation = formData.translations?.[0] || property.translations?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editProperty') || 'Edit Property'}</DialogTitle>
          <DialogDescription>
            {t('editPropertyDescription') || 'Update property information'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">{t('tabs.basic') || 'Basic'}</TabsTrigger>
            <TabsTrigger value="location">{t('tabs.location') || 'Location'}</TabsTrigger>
            <TabsTrigger value="details">{t('tabs.details') || 'Details'}</TabsTrigger>
            <TabsTrigger value="media">{t('tabs.media') || 'Media'}</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('form.type') || 'Type'}</Label>
                <Select
                  value={formData.type || property.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as PropertyType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PropertyType.HOUSE}>{t(`type.${PropertyType.HOUSE}`) || 'House'}</SelectItem>
                    <SelectItem value={PropertyType.APARTMENT}>{t(`type.${PropertyType.APARTMENT}`) || 'Apartment'}</SelectItem>
                    <SelectItem value={PropertyType.VILLA}>{t(`type.${PropertyType.VILLA}`) || 'Villa'}</SelectItem>
                    <SelectItem value={PropertyType.LAND}>{t(`type.${PropertyType.LAND}`) || 'Land'}</SelectItem>
                    <SelectItem value={PropertyType.COMMERCIAL}>{t(`type.${PropertyType.COMMERCIAL}`) || 'Commercial'}</SelectItem>
                    <SelectItem value={PropertyType.OTHER}>{t(`type.${PropertyType.OTHER}`) || 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('form.status') || 'Status'}</Label>
                <Select
                  value={formData.status || property.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as PropertyStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PropertyStatus.DRAFT}>{t(`status.${PropertyStatus.DRAFT}`) || 'Draft'}</SelectItem>
                    <SelectItem value={PropertyStatus.REVIEW}>{t(`status.${PropertyStatus.REVIEW}`) || 'Review'}</SelectItem>
                    <SelectItem value={PropertyStatus.LISTED}>{t(`status.${PropertyStatus.LISTED}`) || 'Listed'}</SelectItem>
                    <SelectItem value={PropertyStatus.FLAGGED}>{t(`status.${PropertyStatus.FLAGGED}`) || 'Flagged'}</SelectItem>
                    <SelectItem value={PropertyStatus.ARCHIVED}>{t(`status.${PropertyStatus.ARCHIVED}`) || 'Archived'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{t('form.title') || 'Title'} *</Label>
              <Input
                value={currentTranslation?.title || ''}
                onChange={(e) => updateTranslation('title', e.target.value)}
                placeholder={t('form.titlePlaceholder') || 'Property title'}
              />
            </div>

            <div>
              <Label>{t('form.description') || 'Description'}</Label>
              <Textarea
                value={currentTranslation?.description || ''}
                onChange={(e) => updateTranslation('description', e.target.value)}
                placeholder={t('form.descriptionPlaceholder') || 'Property description'}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('form.price') || 'Price'} *</Label>
                <Input
                  type="number"
                  value={formData.price ?? property.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label>{t('form.currency') || 'Currency'}</Label>
                <Select
                  value={formData.currency || property.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CHF">CHF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('form.street') || 'Street'}</Label>
                <Input
                  value={formData.street ?? property.street ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value || undefined }))}
                  placeholder={t('form.streetPlaceholder') || 'Street address'}
                />
              </div>

              <div>
                <Label>{t('form.postalCode') || 'Postal Code'}</Label>
                <Input
                  value={formData.postalCode ?? property.postalCode ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value || undefined }))}
                  placeholder={t('form.postalCodePlaceholder') || 'Postal code'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('form.city') || 'City'}</Label>
                <Input
                  value={formData.city ?? property.city ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value || undefined }))}
                  placeholder={t('form.cityPlaceholder') || 'City'}
                />
              </div>

              <div>
                <Label>{t('form.region') || 'Region'}</Label>
                <Input
                  value={formData.region ?? property.region ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value || undefined }))}
                  placeholder={t('form.regionPlaceholder') || 'Region'}
                />
              </div>
            </div>

            <div>
              <Label>{t('form.country') || 'Country'}</Label>
              <Input
                value={formData.country ?? property.country ?? ''}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value.toUpperCase() || undefined }))}
                placeholder={t('form.countryPlaceholder') || 'Country code (FR, US, etc.)'}
                maxLength={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('form.latitude') || 'Latitude'}</Label>
                <Input
                  type="number"
                  value={formData.latitude ?? property.latitude ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || undefined }))}
                  placeholder="0.00000000"
                  step="0.00000001"
                />
              </div>

              <div>
                <Label>{t('form.longitude') || 'Longitude'}</Label>
                <Input
                  type="number"
                  value={formData.longitude ?? property.longitude ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || undefined }))}
                  placeholder="0.00000000"
                  step="0.00000001"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>{t('form.surfaceArea') || 'Surface Area (m²)'}</Label>
                <Input
                  type="number"
                  value={formData.details?.surfaceArea ?? property.details?.surfaceArea ?? ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    details: { ...prev.details, surfaceArea: parseFloat(e.target.value) || undefined },
                  }))}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <Label>{t('form.bedrooms') || 'Bedrooms'}</Label>
                <Input
                  type="number"
                  value={formData.details?.bedrooms ?? property.details?.bedrooms ?? ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    details: { ...prev.details, bedrooms: parseInt(e.target.value) || undefined },
                  }))}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <Label>{t('form.bathrooms') || 'Bathrooms'}</Label>
                <Input
                  type="number"
                  value={formData.details?.bathrooms ?? property.details?.bathrooms ?? ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    details: { ...prev.details, bathrooms: parseInt(e.target.value) || undefined },
                  }))}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 mt-4">
            <div>
              <Label>{t('form.mediaUrls') || 'Media URLs'}</Label>
              <Textarea
                value={(formData.mediaUrls || property.mediaUrls || []).join('\n')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  mediaUrls: e.target.value.split('\n').filter(url => url.trim()),
                }))}
                placeholder={t('form.mediaUrlsPlaceholder') || 'Enter one URL per line'}
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('form.mediaUrlsHint') || 'Enter one image URL per line'}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            {tCommon('cancel') || 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-viridial-600 hover:bg-viridial-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('updating') || 'Updating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {tCommon('update') || 'Update'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

