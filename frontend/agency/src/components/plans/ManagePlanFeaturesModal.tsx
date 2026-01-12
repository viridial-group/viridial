'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plan, CreatePlanFeatureDto, FeatureCategory } from '@/types/plans';
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
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ManagePlanFeaturesModalProps {
  plan: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (features: CreatePlanFeatureDto[]) => Promise<void>;
}

const featureCategories: (FeatureCategory | 'none')[] = ['none', 'ai', 'sales', 'marketing', 'support', 'inventory', 'project', 'analytics', 'collaboration', 'productivity', 'integration', 'administration', 'other'];

export function ManagePlanFeaturesModal({
  plan,
  open,
  onOpenChange,
  onSave,
}: ManagePlanFeaturesModalProps) {
  const t = useTranslations('admin.plans');
  const tCommon = useTranslations('common');

  const [features, setFeatures] = useState<CreatePlanFeatureDto[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data from existing features
  const [featureForm, setFeatureForm] = useState<CreatePlanFeatureDto>({
    name: '',
    description: '',
    category: undefined,
    isIncluded: true,
    displayOrder: 0,
  });

  useEffect(() => {
    if (open) {
      // Convert existing features to DTO format
      const initialFeatures: CreatePlanFeatureDto[] = (plan.features || []).map((f) => ({
        name: f.name,
        description: f.description || '',
        category: f.category,
        isIncluded: f.isIncluded ?? true,
        displayOrder: f.displayOrder ?? 0,
      }));
      setFeatures(initialFeatures);
      setEditingIndex(null);
      setFeatureForm({
        name: '',
        description: '',
        category: undefined,
        isIncluded: true,
        displayOrder: 0,
      });
    }
  }, [plan, open]);

  const handleAddFeature = () => {
    if (!featureForm.name.trim()) return;
    
    if (editingIndex !== null) {
      // Update existing feature
      const updated = [...features];
      updated[editingIndex] = { ...featureForm };
      setFeatures(updated);
      setEditingIndex(null);
    } else {
      // Add new feature
      setFeatures([...features, { ...featureForm }]);
    }
    
    // Reset form
    setFeatureForm({
      name: '',
      description: '',
      category: undefined,
      isIncluded: true,
      displayOrder: features.length,
    });
  };

  const handleEditFeature = (index: number) => {
    setFeatureForm({ ...features[index] });
    setEditingIndex(index);
  };

  const handleDeleteFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setFeatureForm({
        name: '',
        description: '',
        category: undefined,
        isIncluded: true,
        displayOrder: 0,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setFeatureForm({
      name: '',
      description: '',
      category: undefined,
      isIncluded: true,
      displayOrder: features.length,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(features);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving features:', error);
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
          <DialogTitle>{t('manageFeatures') || 'Manage Plan Features'}</DialogTitle>
          <DialogDescription>
            {t('manageFeaturesDescription') || 'Add, edit, or remove features for this plan'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Add/Edit Feature Form */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="featureName">{t('featureName') || 'Feature Name'} *</Label>
                    <Input
                      id="featureName"
                      value={featureForm.name}
                      onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })}
                      placeholder={t('featureNamePlaceholder') || 'Feature name'}
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
                    rows={2}
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

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleAddFeature}
                    disabled={!featureForm.name.trim()}
                    className="flex-1"
                  >
                    {editingIndex !== null ? (
                      <>
                        <Pencil className="h-4 w-4 mr-2" />
                        {t('updateFeature') || 'Update Feature'}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addFeature') || 'Add Feature'}
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

          {/* Features List */}
          <div className="space-y-2">
            <Label>{t('features') || 'Features'} ({features.length})</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {features.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t('noFeatures') || 'No features added yet'}
                </p>
              ) : (
                features.map((feature, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{feature.name}</h4>
                            {feature.category && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {feature.category}
                              </span>
                            )}
                            {feature.isIncluded && (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                                {t('included') || 'Included'}
                              </span>
                            )}
                          </div>
                          {feature.description && (
                            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {t('displayOrder') || 'Order'}: {feature.displayOrder}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditFeature(index)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFeature(index)}
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

