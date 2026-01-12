'use client';

import { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Resource } from '@/types/admin';
import { Folder, CheckCircle2, XCircle } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  isSelected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
}

export const ResourceCard = memo(function ResourceCard({ resource, isSelected = false, onSelect, onView }: ResourceCardProps) {
  const t = useTranslations('admin');

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[type="checkbox"]')) {
      return;
    }
    onSelect?.();
  }, [onSelect]);

  const handleCardDoubleClick = useCallback((e: React.MouseEvent) => {
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
              <Folder className="h-5 w-5 text-viridial-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle 
                className="text-base font-semibold truncate hover:text-viridial-600"
                onClick={handleViewClick}
              >
                {resource.name}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs text-gray-500">
                {resource.internalCode}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
            {resource.isActive ? (
              <Badge variant="success" className="gap-1 text-xs px-2 py-0.5">
                <CheckCircle2 className="h-3 w-3" />
                {t('active') || 'Active'}
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1 text-xs px-2 py-0.5">
                <XCircle className="h-3 w-3" />
                {t('inactive') || 'Inactive'}
              </Badge>
            )}
            {resource.category && (
              <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5">
                {resource.category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {resource.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {resource.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <span>
              {resource.permissions?.length || 0} {t('permissions') || 'permissions'}
            </span>
          </div>
          <div>
            {t('createdAt') || 'Created'}: {new Date(resource.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.resource.id === nextProps.resource.id &&
    prevProps.resource.name === nextProps.resource.name &&
    prevProps.resource.isActive === nextProps.resource.isActive &&
    prevProps.resource.category === nextProps.resource.category &&
    prevProps.isSelected === nextProps.isSelected
  );
});

