'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CreatePlanFeatureDto, FeatureCategory } from '@/types/plans';
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
import { Plus } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface CreatePlanFeatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (feature: CreatePlanFeatureDto) => Promise<void>;
}

const featureCategories: (FeatureCategory | 'none')[] = ['none', 'ai', 'sales', 'marketing', 'support', 'inventory', 'project', 'analytics', 'collaboration', 'productivity', 'integration', 'administration', 'other'];

export function CreatePlanFeatureModal({
  open,
  onOpenChange,
  onSave,
}: CreatePlanFeatureModalProps) {
  const t = useTranslations('admin.plans');
  const tCommon = useTranslations('common');

  const [featureForm, setFeatureForm] = useState<CreatePlanFeatureDto>({
    name: '',
    description: '',
    category: undefined,
    isIncluded: true,
    displayOrder: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setFeatureForm({
        name: '',
        description: '',
        category: undefined,
        isIncluded: true,
        displayOrder: 0,
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setIsSaving(true);
    try {
      await onSave(featureForm);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating feature:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('addFeature') || 'Add Feature'}</DialogTitle>
            <DialogDescription>
              {t('addFeatureDescription') || 'Create a new feature for this plan'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="featureName">{t('featureName') || 'Feature Name'} *</Label>
                <Input
                  id="featureName"
                  value={featureForm.name}
                  onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })}
                  placeholder={t('featureNamePlaceholder') || 'Feature name'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featureCategory">{t('category') || 'Category'}</Label>
                <Select
                  value={featureForm.category || 'none'}
                  onValueChange={(value) => setFeatureForm({ 
                    ...featureForm, 
                    category: value === 'none' ? undefined : (value as FeatureCategory)
                  })}
                >
                  <SelectTrigger id="featureCategory">
                    <SelectValue placeholder={t('selectCategory') || 'Select category'} />
                  </SelectTrigger>
                  <SelectContent>
                    {featureCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'none' ? (t('none') || 'None') : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="featureDescription">{t('description') || 'Description'}</Label>
              <Textarea
                id="featureDescription"
                value={featureForm.description}
                onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                rows={3}
                placeholder={t('featureDescriptionPlaceholder') || 'Feature description'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="featureDisplayOrder">{t('displayOrder') || 'Display Order'}</Label>
                <Input
                  id="featureDisplayOrder"
                  type="number"
                  min="0"
                  value={featureForm.displayOrder}
                  onChange={(e) => setFeatureForm({ ...featureForm, displayOrder: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="flex items-center justify-between pt-8">
                <div className="space-y-0.5">
                  <Label>{t('isIncluded') || 'Included'}</Label>
                </div>
                <Switch
                  checked={featureForm.isIncluded}
                  onCheckedChange={(checked) => setFeatureForm({ ...featureForm, isIncluded: checked })}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" className="bg-viridial-600 hover:bg-viridial-700 text-white" disabled={isSaving || !featureForm.name.trim()}>
                {isSaving ? (
                  tCommon('saving') || 'Saving...'
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addFeature') || 'Add Feature'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleConfirm}
        title={tCommon('confirm') || 'Confirm'}
        description={t('confirmAddFeature') || 'Are you sure you want to add this feature?'}
        confirmText={tCommon('save') || 'Save'}
        cancelText={tCommon('cancel') || 'Cancel'}
      />
    </>
  );
}

