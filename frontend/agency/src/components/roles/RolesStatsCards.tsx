'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { Role } from '@/lib/role-api';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface RolesStatsCardsProps {
  roles: Role[];
}

export const RolesStatsCards = memo(function RolesStatsCards({ roles }: RolesStatsCardsProps) {
  const t = useTranslations('roles');
  
  const stats = useMemo(() => {
    const total = roles.length;
    const active = roles.filter(r => r.isActive).length;
    const inactive = roles.filter(r => !r.isActive).length;
    const totalPermissions = roles.reduce((sum, r) => sum + (r.permissions?.length || 0), 0);
    const avgPermissions = total > 0 ? Math.round(totalPermissions / total) : 0;

    return {
      total,
      active,
      inactive,
      avgPermissions,
    };
  }, [roles]);

  const cards = [
    {
      label: t('totalRoles') || 'Total Roles',
      value: stats.total,
      icon: Shield,
      color: 'text-viridial-600',
      bgColor: 'bg-viridial-50',
      borderColor: 'border-viridial-200',
      trend: null,
    },
    {
      label: t('activeRoles') || 'Active Roles',
      value: stats.active,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      trend: null,
    },
    {
      label: t('inactiveRoles') || 'Inactive Roles',
      value: stats.inactive,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      trend: null,
    },
    {
      label: t('avgPermissions') || 'Avg Permissions',
      value: stats.avgPermissions,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
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

