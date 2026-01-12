'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitBranch, Info, Building2 } from 'lucide-react';
import { mockOrganizations, getAllSubOrganizations } from '@/data/mockData';

interface ChangeParentModalProps {
  organization: Organization;
  organizations: Organization[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeParent: (organizationId: string, newParentId: string | null) => void;
}

export function ChangeParentModal({
  organization,
  organizations,
  open,
  onOpenChange,
  onChangeParent,
}: ChangeParentModalProps) {
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');

  const [selectedParentId, setSelectedParentId] = useState<string>('none');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedParentId(organization.parentId || 'none');
      setError(null);
    }
  }, [open, organization.parentId]);

  // Obtenir toutes les organisations disponibles comme parents
  // (exclure l'organisation elle-même et ses descendants pour éviter les références circulaires)
  const availableParents = useMemo(() => {
    const descendants = getAllSubOrganizations(organization.id);
    const descendantIds = new Set(descendants.map((d) => d.id));

    return organizations.filter(
      (org) =>
        org.id !== organization.id && // Ne pas inclure l'organisation elle-même
        !descendantIds.has(org.id) && // Ne pas inclure les descendants
        org.isActive // Seulement les organisations actives
    );
  }, [organization.id, organizations]);

  const selectedParent = selectedParentId && selectedParentId !== 'none'
    ? organizations.find((org) => org.id === selectedParentId)
    : null;

  const handleSubmit = () => {
    try {
      const newParentId = selectedParentId === 'none' ? null : selectedParentId;
      onChangeParent(organization.id, newParentId);
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-viridial-600" />
            {t('changeParentOrganization') || 'Change Parent Organization'}
          </DialogTitle>
          <DialogDescription>
            {t('changeParentOrganizationDescription') || 'Select a new parent organization for this organization.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Current Organization Info */}
          <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <Label className="text-sm font-semibold text-gray-900">
              {t('currentOrganization') || 'Current Organization'}
            </Label>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-gray-200">
                <Building2 className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{organization.name}</p>
                <p className="text-xs text-gray-500 truncate">{organization.slug}</p>
                {organization.city && organization.country && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {organization.city}, {organization.country}
                  </p>
                )}
              </div>
            </div>
            {organization.parentId && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                <Info className="h-3 w-3 inline mr-1" />
                {t('currentParent') || 'Current parent'}:{' '}
                {organizations.find((o) => o.id === organization.parentId)?.name || 'Unknown'}
              </div>
            )}
          </div>

          {/* Parent Selection */}
          <div className="space-y-3">
            <Label htmlFor="parentId" className="text-sm font-semibold text-gray-900">
              {t('newParentOrganization') || 'New Parent Organization'}
            </Label>
            <Select value={selectedParentId} onValueChange={setSelectedParentId}>
              <SelectTrigger id="parentId" className="w-full">
                <SelectValue placeholder={t('selectParentOrganization') || 'Select parent organization'} />
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
              <div className="p-3 bg-viridial-50 border border-viridial-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {t('newParent') || 'New Parent'}
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">{selectedParent.name}</span>
                </div>
                {selectedParent.description && (
                  <p className="text-xs text-gray-600 mt-1">{selectedParent.description}</p>
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

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  {t('changeParentHelp') ||
                    'Changing the parent organization will update the hierarchical structure. Sub-organizations of this organization will remain unchanged.'}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-viridial-600 hover:bg-viridial-700 text-white"
          >
            {t('saveChanges') || 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


