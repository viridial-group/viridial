'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { organizationApi } from '@/lib/organization-api';

interface ChangeOrganizationModalProps {
  user: {
    id: string;
    organizationId: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (organizationId: string | null) => Promise<void>;
}

export function ChangeOrganizationModal({
  user,
  open,
  onOpenChange,
  onChange,
}: ChangeOrganizationModalProps) {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load organizations
  useEffect(() => {
    if (open) {
      loadOrganizations();
      setSelectedOrganizationId(user.organizationId || 'none');
    }
  }, [open, user.organizationId]);

  const loadOrganizations = async () => {
    setIsLoadingOrgs(true);
    setError(null);
    try {
      const response = await organizationApi.findAll({ page: 1, limit: 1000 });
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error loading organizations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const handleChange = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgId = selectedOrganizationId === 'none' ? null : selectedOrganizationId;
      await onChange(orgId);
      onOpenChange(false);
    } catch (err) {
      console.error('Error changing organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to change organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('changeOrganization') || 'Change Organization'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="organization">
              {t('organization') || 'Organization'} *
            </Label>
            {isLoadingOrgs ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <Select
                value={selectedOrganizationId}
                onValueChange={setSelectedOrganizationId}
              >
                <SelectTrigger id="organization" className="w-full">
                  <SelectValue placeholder={t('selectOrganization') || 'Select organization'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t('noOrganization') || 'No organization'}
                  </SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-gray-500">
              {t('changeOrganizationDescription') || 'Select a new organization for this user.'}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleChange}
            disabled={isLoading || isLoadingOrgs}
            className="bg-viridial-600 hover:bg-viridial-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('saving') || 'Saving...'}
              </>
            ) : (
              t('changeOrganization') || 'Change Organization'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

