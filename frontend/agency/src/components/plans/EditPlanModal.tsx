'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plan, UpdatePlanDto, PlanType, BillingPeriod } from '@/types/plans';
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

interface EditPlanModalProps {
  plan: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UpdatePlanDto) => Promise<void>;
}

const planTypes: PlanType[] = ['pilot', 'growth', 'professional', 'enterprise', 'ai'];
const billingPeriods: BillingPeriod[] = ['monthly', 'annual'];

export function EditPlanModal({
  plan,
  open,
  onOpenChange,
  onSave,
}: EditPlanModalProps) {
  const t = useTranslations('admin.plans');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<UpdatePlanDto>({
    planType: plan.planType,
    name: plan.name,
    description: plan.description || '',
    billingPeriod: plan.billingPeriod,
    standardPrice: plan.standardPrice,
    singleAppPrice: plan.singleAppPrice ?? undefined,
    displayOrder: plan.displayOrder,
    isActive: plan.isActive,
    isPopular: plan.isPopular,
    isFeatured: plan.isFeatured,
    externalCode: plan.externalCode || undefined,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        planType: plan.planType,
        name: plan.name,
        description: plan.description || '',
        billingPeriod: plan.billingPeriod,
        standardPrice: typeof plan.standardPrice === 'string' 
          ? parseFloat(plan.standardPrice) 
          : plan.standardPrice,
        singleAppPrice: plan.singleAppPrice 
          ? (typeof plan.singleAppPrice === 'string' 
            ? parseFloat(plan.singleAppPrice) 
            : plan.singleAppPrice)
          : undefined,
        displayOrder: plan.displayOrder,
        isActive: plan.isActive,
        isPopular: plan.isPopular,
        isFeatured: plan.isFeatured,
        externalCode: plan.externalCode || undefined,
      });
    }
  }, [plan, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error saving plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editPlan') || 'Edit Plan'}</DialogTitle>
          <DialogDescription>
            {t('editPlanDescription') || 'Update plan information and settings'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="planType">{t('planType') || 'Plan Type'} *</Label>
              <Select
                value={formData.planType}
                onValueChange={(value) => setFormData({ ...formData, planType: value as PlanType })}
              >
                <SelectTrigger id="planType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {planTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingPeriod">{t('billingPeriod') || 'Billing Period'} *</Label>
              <Select
                value={formData.billingPeriod}
                onValueChange={(value) => setFormData({ ...formData, billingPeriod: value as BillingPeriod })}
              >
                <SelectTrigger id="billingPeriod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {billingPeriods.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t('name') || 'Name'} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description') || 'Description'}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full"
              placeholder={t('descriptionPlaceholder') || 'Plan description'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="standardPrice">{t('standardPrice') || 'Standard Price'} *</Label>
              <Input
                id="standardPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.standardPrice}
                onChange={(e) => setFormData({ ...formData, standardPrice: parseFloat(e.target.value) || 0 })}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="singleAppPrice">{t('singleAppPrice') || 'Single App Price'}</Label>
              <Input
                id="singleAppPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.singleAppPrice ?? ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  singleAppPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">{t('displayOrder') || 'Display Order'}</Label>
            <Input
              id="displayOrder"
              type="number"
              min="0"
              value={formData.displayOrder ?? 0}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="externalCode">{t('externalCode') || 'External Code'}</Label>
            <Input
              id="externalCode"
              value={formData.externalCode || ''}
              onChange={(e) => setFormData({ ...formData, externalCode: e.target.value || undefined })}
              className="w-full"
              placeholder={t('externalCodePlaceholder') || 'External system code'}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t('isActive') || 'Active'}</Label>
                <p className="text-sm text-gray-500">{t('isActiveDescription') || 'Plan is available for subscription'}</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t('isPopular') || 'Popular'}</Label>
                <p className="text-sm text-gray-500">{t('isPopularDescription') || 'Mark as popular plan'}</p>
              </div>
              <Switch
                checked={formData.isPopular}
                onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t('isFeatured') || 'Featured'}</Label>
                <p className="text-sm text-gray-500">{t('isFeaturedDescription') || 'Highlight this plan'}</p>
              </div>
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" className="bg-viridial-600 hover:bg-viridial-700 text-white" disabled={isSaving}>
              {isSaving ? tCommon('saving') || 'Saving...' : tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

