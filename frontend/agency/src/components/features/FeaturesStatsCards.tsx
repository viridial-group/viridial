'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, CheckCircle2, Shield, TrendingUp } from 'lucide-react';
import { Feature } from '@/types/admin';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface FeaturesStatsCardsProps {
  features: Feature[];
}

export const FeaturesStatsCards = memo(function FeaturesStatsCards({ features }: FeaturesStatsCardsProps) {
  const t = useTranslations('admin.features');
  
  const stats = useMemo(() => {
    const total = features.length;
    const active = features.filter((f) => f.isActive).length;
    const totalPermissions = features.reduce((sum, f) => sum + (f.permissions?.length || 0), 0);
    const activeRate = total > 0 ? ((active / total) * 100) : 0;

    return {
      total,
      active,
      totalPermissions,
      activeRate: activeRate.toFixed(1),
    };
  }, [features]);

  const cards = [
    {
      label: t('stats.totalFeatures') || 'Total Features',
      value: stats.total,
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      trend: null,
    },
    {
      label: t('stats.activeFeatures') || 'Active Features',
      value: stats.active,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      trend: stats.total > 0 ? `${stats.activeRate}%` : '0%',
    },
    {
      label: t('stats.totalPermissions') || 'Total Permissions',
      value: stats.totalPermissions,
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      trend: null,
    },
    {
      label: t('stats.avgPermissions') || 'Avg Permissions',
      value: stats.total > 0 ? Math.round(stats.totalPermissions / stats.total) : 0,
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

