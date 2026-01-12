'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Home, CheckCircle2, TrendingUp, Euro, Clock, AlertTriangle } from 'lucide-react';
import { Property, PropertyStatus } from '@/types/property';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PropertyStatsCardsProps {
  properties: Property[];
}

export const PropertyStatsCards = memo(function PropertyStatsCards({ properties }: PropertyStatsCardsProps) {
  const t = useTranslations('properties');
  
  const stats = useMemo(() => {
    const total = properties.length;
    const listed = properties.filter((p) => p.status === PropertyStatus.LISTED).length;
    const draft = properties.filter((p) => p.status === PropertyStatus.DRAFT).length;
    const totalValue = properties.reduce((sum, p) => sum + (p.price || 0), 0);
    const averagePrice = total > 0 ? totalValue / total : 0;
    const listedRate = total > 0 ? ((listed / total) * 100) : 0;

    return {
      total,
      listed,
      draft,
      totalValue,
      averagePrice,
      listedRate: listedRate.toFixed(1),
    };
  }, [properties]);

  const cards = [
    {
      label: t('stats.total') || 'Total Properties',
      value: stats.total,
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      trend: null,
    },
    {
      label: t('stats.listed') || 'Listed',
      value: stats.listed,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      trend: stats.total > 0 ? `${((stats.listed / stats.total) * 100).toFixed(0)}%` : '0%',
    },
    {
      label: t('stats.draft') || 'Draft',
      value: stats.draft,
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      trend: null,
    },
    {
      label: t('stats.totalValue') || 'Total Value',
      value: stats.totalValue,
      icon: Euro,
      color: 'text-viridial-600',
      bgColor: 'bg-viridial-50',
      borderColor: 'border-viridial-200',
      trend: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.averagePrice),
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
                  {typeof card.value === 'number' && card.value > 1000
                    ? card.value.toLocaleString()
                    : card.value}
                </div>
              </div>
              
              {/* Progress bar for percentage-based stats */}
              {card.trend && card.trend.includes('%') && (
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
  // Only re-render if properties array reference or length changes
  return (
    prevProps.properties.length === nextProps.properties.length &&
    prevProps.properties.every((prop, idx) => {
      const nextProp = nextProps.properties[idx];
      return nextProp && prop.id === nextProp.id && prop.status === nextProp.status && prop.price === nextProp.price;
    })
  );
});

