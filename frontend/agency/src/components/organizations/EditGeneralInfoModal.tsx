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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface EditGeneralInfoModalProps {
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Organization>) => void;
}

export function EditGeneralInfoModal({
  organization,
  open,
  onOpenChange,
  onSave,
}: EditGeneralInfoModalProps) {
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState({
    name: organization.name || '',
    slug: organization.slug || '',
    description: organization.description || '',
    plan: organization.plan || 'free',
    maxUsers: organization.maxUsers || 0,
    isActive: organization.isActive ?? true,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: organization.name || '',
        slug: organization.slug || '',
        description: organization.description || '',
        plan: organization.plan || 'free',
        maxUsers: organization.maxUsers || 0,
        isActive: organization.isActive ?? true,
      });
    }
  }, [organization, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editGeneralInformation')}</DialogTitle>
          <DialogDescription>
            {t('editGeneralInformationDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">{t('slug')} *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              className="w-full"
              placeholder="organization-slug"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full"
              placeholder={t('descriptionPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan">{t('plan')} *</Label>
              <Select
                value={formData.plan}
                onValueChange={(value) => setFormData({ ...formData, plan: value as Organization['plan'] })}
              >
                <SelectTrigger id="plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">{t('plans.free')}</SelectItem>
                  <SelectItem value="basic">{t('plans.basic')}</SelectItem>
                  <SelectItem value="professional">{t('plans.professional')}</SelectItem>
                  <SelectItem value="enterprise">{t('plans.enterprise')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsers">{t('maxUsers')} *</Label>
              <Input
                id="maxUsers"
                type="number"
                min="1"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value, 10) || 0 })}
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="space-y-0.5">
              <Label className="text-base">{t('status')}</Label>
              <p className="text-sm text-gray-500">{t('activeStatusDescription')}</p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" className="bg-viridial-600 hover:bg-viridial-700 text-white">
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

