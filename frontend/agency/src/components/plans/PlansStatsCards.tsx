    'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, DollarSign, CheckCircle2, TrendingUp } from 'lucide-react';
import { Plan } from '@/types/plans';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PlansStatsCardsProps {
  plans: Plan[];
}

export const PlansStatsCards = memo(function PlansStatsCards({ plans }: PlansStatsCardsProps) {
  const t = useTranslations();
  
  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter((p) => p.isActive).length;
    const totalFeatures = plans.reduce((sum, plan) => sum + (plan.features?.length || 0), 0);
    const popularPlans = plans.filter((p) => p.isPopular).length;
    const activeRate = total > 0 ? ((active / total) * 100) : 0;

    return {
      total,
      active,
      totalFeatures,
      popularPlans,
      activeRate: activeRate.toFixed(1),
    };
  }, [plans]);

  const cards = [
    {
      label: t('plans.totalPlans') || 'Total Plans',
      value: stats.total,
      icon: Sparkles,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      trend: null,
    },
    {
      label: t('plans.activePlans') || 'Active Plans',
      value: stats.active,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      trend: stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(0)}%` : '0%',
    },
    {
      label: t('plans.totalFeatures') || 'Total Features',
      value: stats.totalFeatures,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      trend: null,
    },
    {
      label: t('plans.popularPlans') || 'Popular Plans',
      value: stats.popularPlans,
      icon: DollarSign,
      color: 'text-viridial-600',
      bgColor: 'bg-viridial-50',
      borderColor: 'border-viridial-200',
      trend: stats.total > 0 ? `${((stats.popularPlans / stats.total) * 100).toFixed(0)}%` : '0%',
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
  // Only re-render if plans array reference or length changes
  return (
    prevProps.plans.length === nextProps.plans.length &&
    prevProps.plans.every((plan, idx) => {
      const nextPlan = nextProps.plans[idx];
      return nextPlan && plan.id === nextPlan.id && plan.isActive === nextPlan.isActive;
    })
  );
});

