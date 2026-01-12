'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, CheckCircle2, Folder, TrendingUp } from 'lucide-react';
import { Permission } from '@/types/admin';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PermissionsStatsCardsProps {
  permissions: Permission[];
}

export const PermissionsStatsCards = memo(function PermissionsStatsCards({ permissions }: PermissionsStatsCardsProps) {
  const t = useTranslations('admin.permissions');
  
  const stats = useMemo(() => {
    const total = permissions.length;
    const uniqueResources = new Set(permissions.map(p => p.resource)).size;
    const uniqueActions = new Set(permissions.map(p => p.action)).size;
    const avgPermissionsPerResource = uniqueResources > 0 ? (total / uniqueResources).toFixed(1) : '0';

    return {
      total,
      uniqueResources,
      uniqueActions,
      avgPermissionsPerResource,
    };
  }, [permissions]);

  const cards = [
    {
      label: t('stats.totalPermissions') || 'Total Permissions',
      value: stats.total,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      trend: null,
    },
    {
      label: t('stats.uniqueResources') || 'Unique Resources',
      value: stats.uniqueResources,
      icon: Folder,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      trend: null,
    },
    {
      label: t('stats.uniqueActions') || 'Unique Actions',
      value: stats.uniqueActions,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      trend: null,
    },
    {
      label: t('stats.avgPerResource') || 'Avg per Resource',
      value: stats.avgPermissionsPerResource,
      icon: TrendingUp,
      color: 'text-viridial-600',
      bgColor: 'bg-viridial-50',
      borderColor: 'border-viridial-200',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={cn(
              'bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200',
              card.borderColor,
              'relative overflow-hidden group'
            )}
          >
            <div className={cn('absolute top-0 right-0 w-20 h-20 opacity-10 -translate-y-4 translate-x-4', card.bgColor)} />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-2">
                <div className={cn('p-2 rounded-lg', card.bgColor)}>
                  <Icon className={cn('h-5 w-5', card.color)} />
                </div>
                {card.trend && (
                  <div className={cn('text-xs font-medium px-2 py-1 rounded-full', card.bgColor, card.color)}>
                    {card.trend}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-600">{card.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

