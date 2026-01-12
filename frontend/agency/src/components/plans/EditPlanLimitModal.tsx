'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PlanLimit, CreatePlanLimitDto, LimitType } from '@/types/plans';
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
import { Pencil } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface EditPlanLimitModalProps {
  limit: PlanLimit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (limit: CreatePlanLimitDto) => Promise<void>;
}

const limitTypes: LimitType[] = ['users', 'records', 'storage', 'emails', 'api_calls', 'integrations', 'custom'];

export function EditPlanLimitModal({
  limit,
  open,
  onOpenChange,
  onSave,
}: EditPlanLimitModalProps) {
  const t = useTranslations('admin.plans');
  const tCommon = useTranslations('common');

  const [limitForm, setLimitForm] = useState<CreatePlanLimitDto>({
    limitType: 'custom',
    limitName: '',
    limitValue: undefined,
    limitUnit: undefined,
    isUnlimited: false,
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (open && limit) {
      setLimitForm({
        limitType: limit.limitType,
        limitName: limit.limitName,
        limitValue: limit.limitValue ?? undefined,
        limitUnit: limit.limitUnit ?? undefined,
        isUnlimited: limit.isUnlimited,
        description: limit.description || '',
      });
    }
  }, [limit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setIsSaving(true);
    try {
      await onSave(limitForm);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating limit:', error);
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
            <DialogTitle>{t('editLimit') || 'Edit Limit'}</DialogTitle>
            <DialogDescription>
              {t('editLimitDescription') || 'Update limit information'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="limitType">{t('limitType') || 'Limit Type'} *</Label>
                <Select
                  value={limitForm.limitType}
                  onValueChange={(value) => setLimitForm({ ...limitForm, limitType: value as LimitType })}
                >
                  <SelectTrigger id="limitType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {limitTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limitName">{t('limitName') || 'Limit Name'} *</Label>
                <Input
                  id="limitName"
                  value={limitForm.limitName}
                  onChange={(e) => setLimitForm({ ...limitForm, limitName: e.target.value })}
                  placeholder={t('limitNamePlaceholder') || 'Limit name'}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>{t('isUnlimited') || 'Unlimited'}</Label>
                <p className="text-sm text-gray-500">{t('isUnlimitedDescription') || 'This limit has no maximum value'}</p>
              </div>
              <Switch
                checked={limitForm.isUnlimited}
                onCheckedChange={(checked) => setLimitForm({ ...limitForm, isUnlimited: checked })}
              />
            </div>

            {!limitForm.isUnlimited && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="limitValue">{t('limitValue') || 'Limit Value'}</Label>
                  <Input
                    id="limitValue"
                    type="number"
                    min="0"
                    value={limitForm.limitValue ?? ''}
                    onChange={(e) => setLimitForm({ 
                      ...limitForm, 
                      limitValue: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder={t('limitValuePlaceholder') || '0'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limitUnit">{t('limitUnit') || 'Unit'}</Label>
                  <Input
                    id="limitUnit"
                    value={limitForm.limitUnit || ''}
                    onChange={(e) => setLimitForm({ ...limitForm, limitUnit: e.target.value || undefined })}
                    placeholder={t('limitUnitPlaceholder') || 'e.g., GB, MB, etc.'}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="limitDescription">{t('description') || 'Description'}</Label>
              <Textarea
                id="limitDescription"
                value={limitForm.description}
                onChange={(e) => setLimitForm({ ...limitForm, description: e.target.value })}
                rows={3}
                placeholder={t('limitDescriptionPlaceholder') || 'Limit description'}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" className="bg-viridial-600 hover:bg-viridial-700 text-white" disabled={isSaving || !limitForm.limitName.trim()}>
                {isSaving ? (
                  tCommon('saving') || 'Saving...'
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('updateLimit') || 'Update Limit'}
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
        description={t('confirmUpdateLimit') || 'Are you sure you want to update this limit?'}
        confirmText={tCommon('save') || 'Save'}
        cancelText={tCommon('cancel') || 'Cancel'}
      />
    </>
  );
}

