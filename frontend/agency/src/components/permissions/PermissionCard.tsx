'use client';

import { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Permission } from '@/types/admin';
import { Shield, Folder, Eye } from 'lucide-react';

interface PermissionCardProps {
  permission: Permission;
  isSelected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
}

export const PermissionCard = memo(function PermissionCard({
  permission,
  isSelected = false,
  onSelect,
  onView,
}: PermissionCardProps) {
  const t = useTranslations('admin.permissions');

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger view if clicking checkbox
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
      return;
    }
    onView?.();
  }, [onView]);

  const actionColors: Record<string, string> = {
    read: 'bg-blue-100 text-blue-800',
    write: 'bg-green-100 text-green-800',
    delete: 'bg-red-100 text-red-800',
    admin: 'bg-purple-100 text-purple-800',
    create: 'bg-emerald-100 text-emerald-800',
    update: 'bg-amber-100 text-amber-800',
    view: 'bg-cyan-100 text-cyan-800',
    manage: 'bg-indigo-100 text-indigo-800',
  };

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
                <Shield className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <CardTitle className="text-sm font-semibold text-gray-900 truncate">
                  {permission.resource}:{permission.action}
                </CardTitle>
              </div>
              {permission.description && (
                <CardDescription className="text-xs text-gray-600 line-clamp-2">
                  {permission.description}
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs px-2 py-0.5 border-gray-200">
            <Folder className="h-3 w-3 mr-1" />
            {permission.resource}
          </Badge>
          <Badge className={`text-xs px-2 py-0.5 ${actionColors[permission.action] || 'bg-gray-100 text-gray-800'}`}>
            {permission.action}
          </Badge>
          {permission.features && permission.features.length > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {permission.features.length} {t('features') || 'features'}
            </Badge>
          )}
        </div>
        {permission.externalCode && (
          <div className="mt-2 text-xs text-gray-500">
            {t('externalCode') || 'External Code'}: {permission.externalCode}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

