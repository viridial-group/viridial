'use client';

import { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { OrganizationWithStats } from '@/types/organization';
import { Building2, Users, CheckCircle2, XCircle, MapPin } from 'lucide-react';

interface OrganizationCardProps {
  organization: OrganizationWithStats;
  isSelected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
}

export const OrganizationCard = memo(function OrganizationCard({ organization, isSelected = false, onSelect, onView }: OrganizationCardProps) {
  const t = useTranslations();
  const planColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-viridial-100 text-viridial-800',
  };

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // If clicking on checkbox, don't trigger selection
    if ((e.target as HTMLElement).closest('[type="checkbox"]')) {
      return;
    }
    onSelect?.();
  }, [onSelect]);

  const handleCardDoubleClick = useCallback((e: React.MouseEvent) => {
    // If clicking on checkbox, don't trigger view
    if ((e.target as HTMLElement).closest('[type="checkbox"]')) {
      return;
    }
    e.stopPropagation();
    onView?.();
  }, [onView]);

  const handleViewClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.();
  }, [onView]);

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 ease-out hover:shadow-lg border-gray-200 bg-white animate-fade-in ${
        isSelected ? 'border-viridial-400 bg-viridial-50/50 ring-2 ring-viridial-200' : 'hover:border-viridial-400 hover:-translate-y-0.5'
      }`}
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
      style={{ animationDelay: '0ms' }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
              <Building2 className="h-5 w-5 text-viridial-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle 
                className="text-base font-semibold truncate hover:text-viridial-600"
                onClick={handleViewClick}
              >
                {organization.name}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs text-gray-500">
                {organization.slug}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
            {organization.isActive ? (
              <Badge variant="success" className="gap-1 text-xs px-2 py-0.5">
                <CheckCircle2 className="h-3 w-3" />
                {t('common.active')}
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1 text-xs px-2 py-0.5">
                <XCircle className="h-3 w-3" />
                {t('common.inactive')}
              </Badge>
            )}
            <Badge className={`${planColors[organization.plan]} text-xs px-2 py-0.5`}>
              {t(`organizations.plans.${organization.plan}`)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {organization.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {organization.description}
          </p>
        )}
        {(organization.country || organization.city) && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {[organization.city, organization.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>
              {organization.activeUserCount}/{organization.userCount} {t('common.active')}
            </span>
          </div>
          <div>
            {t('organizations.limit')}: {organization.maxUsers}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo to prevent unnecessary re-renders
  return (
    prevProps.organization.id === nextProps.organization.id &&
    prevProps.organization.name === nextProps.organization.name &&
    prevProps.organization.isActive === nextProps.organization.isActive &&
    prevProps.organization.plan === nextProps.organization.plan &&
    prevProps.organization.userCount === nextProps.organization.userCount &&
    prevProps.organization.activeUserCount === nextProps.organization.activeUserCount &&
    prevProps.organization.city === nextProps.organization.city &&
    prevProps.organization.country === nextProps.organization.country &&
    prevProps.isSelected === nextProps.isSelected
  );
});

