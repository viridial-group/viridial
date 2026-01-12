'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Users, CheckCircle2, XCircle, Shield, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { User as ApiUser } from '@/lib/user-api';

interface UsersStatsCardsProps {
  users: ApiUser[];
  rolesCount?: number;
}

export const UsersStatsCards = memo(function UsersStatsCards({ users, rolesCount = 0 }: UsersStatsCardsProps) {
  const t = useTranslations('users');
  
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive !== false).length;
    const inactive = total - active;
    const activeRate = total > 0 ? ((active / total) * 100) : 0;
    const uniqueRoles = new Set(users.map(u => u.role)).size;

    return {
      total,
      active,
      inactive,
      uniqueRoles: rolesCount > 0 ? rolesCount : uniqueRoles,
      activeRate: activeRate.toFixed(1),
    };
  }, [users, rolesCount]);

  const cards = [
    {
      label: t('totalUsers') || 'Total Users',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      trend: null,
    },
    {
      label: t('activeUsers') || 'Active Users',
      value: stats.active,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      trend: stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(0)}%` : '0%',
    },
    {
      label: t('inactiveUsers') || 'Inactive Users',
      value: stats.inactive,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      trend: stats.total > 0 ? `${((stats.inactive / stats.total) * 100).toFixed(0)}%` : '0%',
    },
    {
      label: t('roles') || 'Roles',
      value: stats.uniqueRoles,
      icon: Shield,
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
            {/* Background decoration */}
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
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {card.label}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {card.value.toLocaleString()}
                </div>
              </div>
              
              {/* Progress bar for percentage-based stats */}
              {card.trend && (
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full transition-all duration-500', card.bgColor)}
                    style={{
                      width: `${parseFloat(card.trend.replace('%', ''))}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if users array reference or length changes
  return (
    prevProps.users.length === nextProps.users.length &&
    prevProps.users.every((user, idx) => {
      const nextUser = nextProps.users[idx];
      return nextUser && user.id === nextUser.id && user.isActive === nextUser.isActive && user.role === nextUser.role;
    }) &&
    prevProps.rolesCount === nextProps.rolesCount
  );
});

