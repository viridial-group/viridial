'use client';

import { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Role } from '@/lib/role-api';
import { Permission } from '@/lib/permission-api';
import { Shield, CheckCircle2, XCircle, Users, Settings, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoleCardProps {
  role: Role;
  isSelected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const RoleCard = memo(function RoleCard({ 
  role, 
  isSelected = false, 
  onSelect,
  onView,
  onEdit,
  onDelete 
}: RoleCardProps) {
  const t = useTranslations('roles');

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // If clicking on checkbox, edit, delete, or view buttons, don't trigger selection
    if ((e.target as HTMLElement).closest('[type="checkbox"]') ||
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    onView?.() || onSelect?.();
  }, [onView, onSelect]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  }, [onEdit]);

  const handleViewClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.();
  }, [onView]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  }, [onDelete]);

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 ease-out hover:shadow-lg border-gray-200 bg-white animate-fade-in ${
        isSelected ? 'border-viridial-400 bg-viridial-50/50 ring-2 ring-viridial-200' : 'hover:border-viridial-400 hover:-translate-y-0.5'
      }`}
      onClick={handleCardClick}
      style={{ animationDelay: '0ms' }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {onSelect && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
            <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
              <Shield className="h-5 w-5 text-viridial-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate hover:text-viridial-600">
                {role.name}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                {role.description || t('noDescription') || 'No description'}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
            {role.isActive ? (
              <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 gap-1 text-xs px-2 py-0.5">
                <CheckCircle2 className="h-3 w-3" />
                {t('active') || 'Active'}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 gap-1 text-xs px-2 py-0.5">
                <XCircle className="h-3 w-3" />
                {t('inactive') || 'Inactive'}
              </Badge>
            )}
            {role.organizationId ? (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {t('organization') || 'Organization'}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700">
                {t('globalRole') || 'Global'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Permissions */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">
              {t('permissions') || 'Permissions'} ({role.permissions?.length || 0})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {role.permissions && role.permissions.length > 0 ? (
              <>
                {role.permissions.slice(0, 3).map((perm: Permission) => (
                  <Badge key={perm.id} variant="secondary" className="text-xs font-normal">
                    {perm.resource}:{perm.action}
                  </Badge>
                ))}
                {role.permissions.length > 3 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    +{role.permissions.length - 3} {t('more') || 'more'}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">{t('noPermissions') || 'No permissions'}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        {(onView || onEdit || onDelete) && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewClick}
                className="h-8 px-2 hover:bg-viridial-50"
                title={t('view') || 'View role'}
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="h-8 px-2 hover:bg-viridial-50"
                title={t('edit') || 'Edit role'}
              >
                <Edit className="h-4 w-4 text-gray-600" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="h-8 px-2 hover:bg-red-50"
                title={t('delete') || 'Delete role'}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.role.id === nextProps.role.id &&
    prevProps.role.name === nextProps.role.name &&
    prevProps.role.isActive === nextProps.role.isActive &&
    prevProps.role.organizationId === nextProps.role.organizationId &&
    prevProps.role.permissions?.length === nextProps.role.permissions?.length &&
    prevProps.isSelected === nextProps.isSelected
  );
});
