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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { GitBranch, Search, Building2, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { mockOrganizations, getAllSubOrganizations } from '@/data/mockData';

interface AddExistingSubOrganizationModalProps {
  parentOrganization: Organization; // L'organisation parente (pré-déterminée)
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (organizationIds: string[]) => void; // Appelé avec les IDs des organisations sélectionnées
}

export function AddExistingSubOrganizationModal({
  parentOrganization,
  open,
  onOpenChange,
  onAdd,
}: AddExistingSubOrganizationModalProps) {
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgIds, setSelectedOrgIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedOrgIds(new Set());
      setError(null);
    }
  }, [open]);

  // Filtrer les organisations disponibles (celles qui peuvent être ajoutées comme sous-organisations)
  const availableOrganizations = useMemo(() => {
    // Obtenir tous les descendants de l'organisation parente (pour éviter les références circulaires)
    const allDescendants = getAllSubOrganizations(parentOrganization.id);
    const descendantIds = new Set(allDescendants.map((desc) => desc.id));
    
    // Obtenir les organisations déjà sous-organisations d'un autre parent
    const organizationsWithParent = new Set(
      mockOrganizations
        .filter((org) => org.parentId && org.parentId !== '')
        .map((org) => org.id)
    );

    // Filtrer les organisations disponibles :
    // - Ne pas être la parente elle-même
    // - Ne pas être déjà un descendant (pour éviter les références circulaires)
    // - Optionnellement : ne pas avoir déjà un parent (on peut permettre de changer de parent)
    return mockOrganizations.filter((org) => {
      if (org.id === parentOrganization.id) return false; // Ne pas inclure la parente elle-même
      if (descendantIds.has(org.id)) return false; // Ne pas inclure les descendants (référence circulaire)
      if (!org.isActive) return false; // Seulement les organisations actives
      return true;
    });
  }, [parentOrganization.id]);

  // Filtrer par recherche
  const filteredOrganizations = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableOrganizations;
    }

    const query = searchQuery.toLowerCase();
    return availableOrganizations.filter(
      (org) =>
        org.name.toLowerCase().includes(query) ||
        org.slug.toLowerCase().includes(query) ||
        (org.city && org.city.toLowerCase().includes(query)) ||
        (org.country && org.country.toLowerCase().includes(query))
    );
  }, [availableOrganizations, searchQuery]);

  // Obtenir les organisations sélectionnées
  const selectedOrganizations = useMemo(() => {
    return availableOrganizations.filter((org) => selectedOrgIds.has(org.id));
  }, [availableOrganizations, selectedOrgIds]);

  // Vérifier si toutes les organisations visibles sont sélectionnées
  const isAllSelected = filteredOrganizations.length > 0 && filteredOrganizations.every((org) => selectedOrgIds.has(org.id));
  const isIndeterminate = filteredOrganizations.some((org) => selectedOrgIds.has(org.id)) && !isAllSelected;

  const handleSelect = (orgId: string, checked: boolean) => {
    setSelectedOrgIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(orgId);
      } else {
        newSet.delete(orgId);
      }
      return newSet;
    });
    setError(null);
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      // Sélectionner toutes les organisations visibles
      const allIds = new Set(filteredOrganizations.map((org) => org.id));
      setSelectedOrgIds((prev) => new Set([...prev, ...allIds]));
    } else {
      // Désélectionner toutes les organisations visibles
      const filteredIds = new Set(filteredOrganizations.map((org) => org.id));
      setSelectedOrgIds((prev) => {
        const newSet = new Set(prev);
        filteredIds.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
    setError(null);
  };

  const handleSubmit = () => {
    if (selectedOrgIds.size === 0) {
      setError(t('pleaseSelectAtLeastOneOrganization') || 'Please select at least one organization');
      return;
    }

    try {
      onAdd(Array.from(selectedOrgIds));
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || t('errorAddingSubOrganization') || 'Error adding sub-organization');
    }
  };

  const planColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-viridial-100 text-viridial-800',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-viridial-600" />
            {t('addExistingSubOrganization') || 'Add Existing Organization as Sub-Organization'}
          </DialogTitle>
          <DialogDescription>
            {t('addExistingSubOrganizationDescription') || 'Select an existing organization to add it as a sub-organization of this parent organization.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Parent Organization Info */}
          <div className="space-y-3 p-4 bg-viridial-50 border border-viridial-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-viridial-600" />
              <Label className="text-sm font-semibold text-gray-900">
                {t('parentOrganization')}
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-viridial-100">
                <Building2 className="h-4 w-4 text-viridial-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {parentOrganization.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {parentOrganization.slug}
                </p>
                {parentOrganization.city && parentOrganization.country && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {parentOrganization.city}, {parentOrganization.country}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {t(`plans.${parentOrganization.plan}`)}
              </Badge>
            </div>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">{t('search') || 'Search'}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchOrganizationsPlaceholder') || 'Search by name, slug, city, or country...'}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Organizations List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                {t('availableOrganizations') || 'Available Organizations'} ({filteredOrganizations.length})
              </Label>
              {filteredOrganizations.length > 0 && (
                <div
                  className="flex items-center gap-2 cursor-pointer h-8 px-2 text-xs text-viridial-600 hover:text-viridial-700 hover:bg-viridial-50 rounded-md transition-colors select-none"
                  onClick={() => handleSelectAll(!isAllSelected)}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onCheckedChange={(checked) => handleSelectAll(checked === true)}
                    />
                  </div>
                  <span>
                    {isAllSelected
                      ? t('deselectAll') || 'Deselect All'
                      : t('selectAll') || 'Select All'}
                  </span>
                </div>
              )}
            </div>
            <div className="border border-gray-200 rounded-lg max-h-[400px] overflow-y-auto">
              {filteredOrganizations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {searchQuery
                      ? t('noOrganizationsFound') || 'No organizations found'
                      : t('noAvailableOrganizations') || 'No available organizations'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {searchQuery
                      ? t('tryDifferentSearch') || 'Try a different search query'
                      : t('allOrganizationsAlreadySubOrganizations') || 'All organizations are already sub-organizations or cannot be added'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredOrganizations.map((org) => {
                    const isSelected = selectedOrgIds.has(org.id);
                    const orgHasParent = org.parentId
                      ? mockOrganizations.find((p) => p.id === org.parentId)
                      : null;

                    return (
                      <div
                        key={org.id}
                        onClick={(e) => {
                          // Ne pas déclencher la sélection si on clique sur la checkbox
                          if ((e.target as HTMLElement).closest('.checkbox-container')) {
                            return;
                          }
                          handleSelect(org.id, !isSelected);
                        }}
                        className={`p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-viridial-50 border-l-4 border-viridial-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                              className="checkbox-container flex-shrink-0 mt-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleSelect(org.id, checked === true)}
                              />
                            </div>
                            <div
                              className={`p-2 rounded-lg border flex-shrink-0 ${
                                isSelected
                                  ? 'bg-white border-viridial-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <Building2
                                className={`h-4 w-4 ${
                                  isSelected ? 'text-viridial-600' : 'text-gray-400'
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {org.name}
                                </p>
                                {isSelected && (
                                  <Badge variant="secondary" className="text-xs">
                                    {t('selectedLabel') || 'Selected'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mb-2 truncate">
                                {org.slug}
                              </p>
                              {org.description && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {org.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  className={`${planColors[org.plan]} text-xs px-2 py-0.5 font-medium`}
                                >
                                  {t(`plans.${org.plan}`)}
                                </Badge>
                                {org.city && org.country && (
                                  <span className="text-xs text-gray-500">
                                    {org.city}, {org.country}
                                  </span>
                                )}
                                {orgHasParent && (
                                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-300 bg-orange-50">
                                    {t('hasExistingParent') || 'Has parent'}: {orgHasParent.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Selected Organizations Info */}
          {selectedOrganizations.length > 0 && (
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-semibold text-gray-900">
                    {t('selectedOrganizations') || 'Selected Organizations'} ({selectedOrganizations.length})
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrgIds(new Set())}
                  className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-blue-100"
                >
                  {t('clearSelection') || 'Clear'}
                </Button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {selectedOrganizations.map((org) => {
                  const orgHasParent = org.parentId
                    ? mockOrganizations.find((p) => p.id === org.parentId)
                    : null;

                  return (
                    <div
                      key={org.id}
                      className="flex items-center gap-3 p-2 bg-white rounded-lg border border-blue-100"
                    >
                      <div className="p-1.5 bg-blue-50 rounded border border-blue-200 flex-shrink-0">
                        <Building2 className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {org.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {org.slug}
                        </p>
                        {orgHasParent && (
                          <p className="text-xs text-orange-600 mt-0.5">
                            {t('hasParent') || 'Has parent'}: {orgHasParent.name}
                          </p>
                        )}
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
              {selectedOrganizations.some((org) => org.parentId) && (
                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-orange-900 mb-1">
                        {t('warningSomeHaveExistingParent') || 'Warning: Some selected organizations already have a parent'}
                      </p>
                      <p className="text-xs text-orange-700">
                        {t('willChangeParentForSelected') || 'Setting these organizations as sub-organizations will remove their current parent relationships'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            className="bg-viridial-600 hover:bg-viridial-700 text-white"
            onClick={handleSubmit}
            disabled={selectedOrgIds.size === 0}
          >
            <GitBranch className="h-4 w-4 mr-2" />
            {selectedOrgIds.size > 0
              ? `${t('addAsSubOrganization') || 'Add'} (${selectedOrgIds.size})`
              : t('addAsSubOrganization') || 'Add as Sub-Organization'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

