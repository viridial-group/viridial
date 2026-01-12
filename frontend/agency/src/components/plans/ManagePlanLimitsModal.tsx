'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plan, CreatePlanLimitDto, LimitType } from '@/types/plans';
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
import { Plus, Trash2, Pencil, X, Infinity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ManagePlanLimitsModalProps {
  plan: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (limits: CreatePlanLimitDto[]) => Promise<void>;
}

const limitTypes: LimitType[] = ['users', 'records', 'storage', 'emails', 'api_calls', 'integrations', 'custom'];

export function ManagePlanLimitsModal({
  plan,
  open,
  onOpenChange,
  onSave,
}: ManagePlanLimitsModalProps) {
  const t = useTranslations('admin.plans');
  const tCommon = useTranslations('common');

  const [limits, setLimits] = useState<CreatePlanLimitDto[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data
  const [limitForm, setLimitForm] = useState<CreatePlanLimitDto>({
    limitType: 'custom',
    limitName: '',
    limitValue: undefined,
    limitUnit: '',
    isUnlimited: false,
    description: '',
  });

  useEffect(() => {
    if (open) {
      // Convert existing limits to DTO format
      const initialLimits: CreatePlanLimitDto[] = (plan.limits || []).map((l) => ({
        limitType: l.limitType,
        limitName: l.limitName,
        limitValue: l.limitValue ?? undefined,
        limitUnit: l.limitUnit || undefined,
        isUnlimited: l.isUnlimited ?? false,
        description: l.description || '',
      }));
      setLimits(initialLimits);
      setEditingIndex(null);
      setLimitForm({
        limitType: 'custom',
        limitName: '',
        limitValue: undefined,
        limitUnit: '',
        isUnlimited: false,
        description: '',
      });
    }
  }, [plan, open]);

  const handleAddLimit = () => {
    if (!limitForm.limitName.trim()) return;
    
    if (editingIndex !== null) {
      // Update existing limit
      const updated = [...limits];
      updated[editingIndex] = { ...limitForm };
      setLimits(updated);
      setEditingIndex(null);
    } else {
      // Add new limit
      setLimits([...limits, { ...limitForm }]);
    }
    
    // Reset form
    setLimitForm({
      limitType: 'custom',
      limitName: '',
      limitValue: undefined,
      limitUnit: '',
      isUnlimited: false,
      description: '',
    });
  };

  const handleEditLimit = (index: number) => {
    setLimitForm({ ...limits[index] });
    setEditingIndex(index);
  };

  const handleDeleteLimit = (index: number) => {
    setLimits(limits.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setLimitForm({
        limitType: 'custom',
        limitName: '',
        limitValue: undefined,
        limitUnit: '',
        isUnlimited: false,
        description: '',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setLimitForm({
      limitType: 'custom',
      limitName: '',
      limitValue: undefined,
      limitUnit: '',
      isUnlimited: false,
      description: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(limits);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving limits:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('manageLimits') || 'Manage Plan Limits'}</DialogTitle>
          <DialogDescription>
            {t('manageLimitsDescription') || 'Add, edit, or remove limits for this plan'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Add/Edit Limit Form */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
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
                    rows={2}
                    placeholder={t('limitDescriptionPlaceholder') || 'Limit description'}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleAddLimit}
                    disabled={!limitForm.limitName.trim()}
                    className="flex-1"
                  >
                    {editingIndex !== null ? (
                      <>
                        <Pencil className="h-4 w-4 mr-2" />
                        {t('updateLimit') || 'Update Limit'}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addLimit') || 'Add Limit'}
                      </>
                    )}
                  </Button>
                  {editingIndex !== null && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      {tCommon('cancel')}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limits List */}
          <div className="space-y-2">
            <Label>{t('limits') || 'Limits'} ({limits.length})</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {limits.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t('noLimits') || 'No limits added yet'}
                </p>
              ) : (
                limits.map((limit, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{limit.limitName}</h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {limit.limitType.replace('_', ' ')}
                            </span>
                            {limit.isUnlimited ? (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded flex items-center gap-1">
                                <Infinity className="h-3 w-3" />
                                {t('unlimited') || 'Unlimited'}
                              </span>
                            ) : limit.limitValue !== undefined && (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                                {limit.limitValue} {limit.limitUnit || ''}
                              </span>
                            )}
                          </div>
                          {limit.description && (
                            <p className="text-sm text-gray-600 mt-1">{limit.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLimit(index)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLimit(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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

