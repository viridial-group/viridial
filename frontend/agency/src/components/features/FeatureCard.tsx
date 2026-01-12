'use client';

import { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Feature } from '@/types/admin';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';

interface FeatureCardProps {
  feature: Feature;
  isSelected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
}

export const FeatureCard = memo(function FeatureCard({
  feature,
  isSelected = false,
  onSelect,
  onView,
}: FeatureCardProps) {
  const t = useTranslations('admin.features');

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger view if clicking checkbox
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
      return;
    }
    onView?.();
  }, [onView]);

  return (
    <Card
      className={`
        relative cursor-pointer transition-all duration-200 hover:shadow-md
        ${isSelected ? 'ring-2 ring-viridial-500 border-viridial-500' : 'border-gray-200'}
      `}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => {
                  if (checked !== isSelected) {
                    onSelect();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <CardTitle className="text-sm font-semibold text-gray-900 truncate">
                  {feature.name}
                </CardTitle>
              </div>
              {feature.description && (
                <CardDescription className="text-xs text-gray-600 line-clamp-2">
                  {feature.description}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {feature.isActive ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 flex-wrap">
          {feature.category && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 border-gray-200">
              {feature.category}
            </Badge>
          )}
          <Badge className={`text-xs px-2 py-0.5 ${feature.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {feature.isActive ? (t('active') || 'Active') : (t('inactive') || 'Inactive')}
          </Badge>
          {feature.permissions && feature.permissions.length > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {feature.permissions.length} {t('permissions') || 'permissions'}
            </Badge>
          )}
        </div>
        {feature.externalCode && (
          <div className="mt-2 text-xs text-gray-500">
            {t('externalCode') || 'External Code'}: {feature.externalCode}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

