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
import { GitBranch, Info, Building2, AlertCircle } from 'lucide-react';
import { getAllSubOrganizations } from '@/data/mockData';

interface ChangeMultipleParentsModalProps {
  organizationIds: string[];
  organizations: Organization[];
  parentOrganization: Organization; // The parent organization (to prevent circular references)
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeParent: (organizationIds: string[], newParentId: string | null) => void;
}

export function ChangeMultipleParentsModal({
  organizationIds,
  organizations,
  parentOrganization,
  open,
  onOpenChange,
  onChangeParent,
}: ChangeMultipleParentsModalProps) {
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');

  const [selectedParentId, setSelectedParentId] = useState<string>('none');
  const [error, setError] = useState<string | null>(null);

  const selectedOrganizations = useMemo(() => {
    return organizations.filter(org => organizationIds.includes(org.id));
  }, [organizationIds, organizations]);

  useEffect(() => {
    if (open) {
      // Initialize with 'none' by default, allowing user to select a new parent
      setSelectedParentId('none');
      setError(null);
    }
  }, [open]);

  // Get all organizations that can be parents
  // Exclude the selected organizations themselves and their descendants
  const availableParents = useMemo(() => {
    const allDescendants = new Set<string>();
    
    // Get all descendants of all selected organizations
    organizationIds.forEach(orgId => {
      const descendants = getAllSubOrganizations(orgId);
      descendants.forEach(desc => allDescendants.add(desc.id));
    });

    return organizations.filter(
      (org) =>
        !organizationIds.includes(org.id) && // Cannot be one of the selected organizations
        !allDescendants.has(org.id) && // Cannot be a descendant of any selected organization
        org.id !== parentOrganization.id && // Cannot be the current parent (would be redundant)
        org.isActive // Only active organizations
    );
  }, [organizationIds, organizations, parentOrganization.id]);

  const selectedParent = selectedParentId && selectedParentId !== 'none'
    ? organizations.find((org) => org.id === selectedParentId)
    : null;

  const handleSubmit = () => {
    try {
      const newParentId = selectedParentId === 'none' ? null : selectedParentId;
      onChangeParent(organizationIds, newParentId);
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-viridial-600" />
            {t('changeParentForSelectedSubOrganizations') || 'Change Parent for Selected Sub-Organizations'}
          </DialogTitle>
          <DialogDescription>
            {t('changeParentForSelectedSubOrganizationsDescription') || `Select a new parent organization for ${organizationIds.length} selected organization(s).`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Selected Organizations Info */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">
              {t('selectedOrganizations') || 'Selected Organizations'} ({selectedOrganizations.length})
            </Label>
            <div className="max-h-32 overflow-y-auto space-y-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              {selectedOrganizations.map((org) => (
                <div key={org.id} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded text-sm">
                  <Building2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900 truncate">{org.name}</span>
                  {org.parentId && (
                    <Badge variant="outline" className="text-xs ml-auto flex-shrink-0">
                      {t('hasExistingParent') || 'Has parent'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Parent Organization Info */}
          <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <Label className="text-sm font-semibold text-gray-900">
              {t('currentParentOrganization') || 'Current Parent Organization'}
            </Label>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-gray-200">
                <Building2 className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{parentOrganization.name}</p>
                <p className="text-xs text-gray-500 truncate">{parentOrganization.slug}</p>
                {parentOrganization.city && parentOrganization.country && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {parentOrganization.city}, {parentOrganization.country}
                  </p>
                )}
              </div>
            </div>
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
                    <span className="font-medium">{tCommon('none') || 'None'}</span>
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
                  {t('changeParentForMultipleHelp') ||
                    'Changing the parent organization will update the hierarchical structure for all selected organizations. This action will affect the parent relationships of all selected sub-organizations.'}
                </p>
              </div>
            </div>

            {selectedOrganizations.some(org => org.parentId && org.parentId !== parentOrganization.id) && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700">
                    {t('warningSomeHaveExistingParent') ||
                      'Warning: Some selected organizations already have a parent. Setting them as sub-organizations will remove their current parent relationships.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
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
            disabled={selectedParentId === 'none' && selectedOrganizations.every(org => !org.parentId)}
            className="bg-viridial-600 hover:bg-viridial-700 text-white"
          >
            {t('saveChanges') || 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

