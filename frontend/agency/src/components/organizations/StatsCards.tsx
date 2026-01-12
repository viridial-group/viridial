'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, Users, CheckCircle2, TrendingUp } from 'lucide-react';
import { OrganizationWithStats } from '@/types/organization';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  organizations: OrganizationWithStats[];
}

export const StatsCards = memo(function StatsCards({ organizations }: StatsCardsProps) {
  const t = useTranslations();
  
  const stats = useMemo(() => {
    const total = organizations.length;
    const active = organizations.filter((o) => o.isActive).length;
    const totalUsers = organizations.reduce((sum, org) => sum + org.userCount, 0);
    const activeUsers = organizations.reduce((sum, org) => sum + org.activeUserCount, 0);
    const inactiveRate = total > 0 ? ((total - active) / total) * 100 : 0;
    const userActivityRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    return {
      total,
      active,
      totalUsers,
      activeUsers,
      inactiveRate: inactiveRate.toFixed(1),
      userActivityRate: userActivityRate.toFixed(1),
    };
  }, [organizations]);

  const cards = [
    {
      label: t('organizations.totalOrganizations'),
      value: stats.total,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      trend: null,
    },
    {
      label: t('organizations.activeOrganizations'),
      value: stats.active,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      trend: stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(0)}%` : '0%',
    },
    {
      label: t('organizations.totalUsers'),
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      trend: null,
    },
    {
      label: t('organizations.activeUsers'),
      value: stats.activeUsers,
      icon: TrendingUp,
      color: 'text-viridial-600',
      bgColor: 'bg-viridial-50',
      borderColor: 'border-viridial-200',
      trend: `${stats.userActivityRate}%`,
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
  // Only re-render if organizations array reference or length changes
  return (
    prevProps.organizations.length === nextProps.organizations.length &&
    prevProps.organizations.every((org, idx) => {
      const nextOrg = nextProps.organizations[idx];
      return nextOrg && org.id === nextOrg.id && org.isActive === nextOrg.isActive && org.userCount === nextOrg.userCount && org.activeUserCount === nextOrg.activeUserCount;
    })
  );
});

