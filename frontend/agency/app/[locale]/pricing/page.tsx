'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Sparkles, TrendingUp, Building2, Zap, Crown } from 'lucide-react';
import { planApi, PlanApiError } from '@/lib/plan-api';
import { useToast } from '@/components/ui/toast';
import type { Plan, PlanType } from '@/types/plans';

export default function PricingPage() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    loadPlans();
  }, [billingPeriod]);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const data = await planApi.getPricingComparison(billingPeriod);
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
      toast({
        title: t('errors.loadFailed') || 'Failed to load plans',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const plansByType = useMemo(() => {
    const grouped: Record<PlanType, Plan[]> = {
      pilot: [],
      growth: [],
      professional: [],
      enterprise: [],
      ai: [],
    };

    plans.forEach((plan) => {
      if (grouped[plan.planType]) {
        grouped[plan.planType].push(plan);
      }
    });

    // Get the first plan of each type (monthly or annual based on billingPeriod)
    return Object.entries(grouped).reduce((acc, [type, planList]) => {
      const plan = planList.find((p) => p.billingPeriod === billingPeriod) || planList[0];
      if (plan) {
        acc[type as PlanType] = plan;
      }
      return acc;
    }, {} as Record<PlanType, Plan>);
  }, [plans, billingPeriod]);

  const planIcons: Record<PlanType, typeof Sparkles> = {
    pilot: Sparkles,
    growth: TrendingUp,
    professional: Building2,
    enterprise: Zap,
    ai: Crown,
  };

  const planColors: Record<PlanType, string> = {
    pilot: 'bg-gray-100 text-gray-800',
    growth: 'bg-blue-100 text-blue-800',
    professional: 'bg-viridial-100 text-viridial-800',
    enterprise: 'bg-purple-100 text-purple-800',
    ai: 'bg-yellow-100 text-yellow-800',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viridial-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('title') || 'Choose Your Plan'}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('subtitle') || 'Take advantage of mixed pricing to lower your cost'}
          </p>

          {/* Billing Period Toggle */}
          <div className="inline-flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <Button
              variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('monthly')}
              className={billingPeriod === 'monthly' ? 'bg-viridial-600 text-white' : ''}
            >
              {t('monthly') || 'Monthly'}
            </Button>
            <Button
              variant={billingPeriod === 'annual' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('annual')}
              className={billingPeriod === 'annual' ? 'bg-viridial-600 text-white' : ''}
            >
              {t('annual') || 'Annual'}
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {Object.entries(plansByType).map(([type, plan]) => {
            const Icon = planIcons[type as PlanType];
            const colorClass = planColors[type as PlanType];

            return (
              <Card
                key={plan.id}
                className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.isPopular
                    ? 'border-viridial-500 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-viridial-300'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-viridial-600 text-white px-4 py-1">
                      {t('popular') || 'POPULAR'}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${colorClass}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="mt-2 min-h-[3rem]">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        ${Number(plan.standardPrice).toFixed(2)}
                      </span>
                      <span className="text-gray-500">
                        /{t('user') || 'user'}/{t('month') || 'month'}
                      </span>
                    </div>
                    {plan.singleAppPrice && (
                      <p className="text-sm text-gray-500 mt-2">
                        {t('singleAppPrice') || 'Single App'}: ${Number(plan.singleAppPrice).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Limits */}
                  {plan.limits && plan.limits.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">
                        {t('limits') || 'Limits'}:
                      </h4>
                      {plan.limits.slice(0, 3).map((limit) => (
                        <div key={limit.id} className="text-sm text-gray-600">
                          <span className="font-medium">{limit.limitName}:</span>{' '}
                          {limit.isUnlimited
                            ? t('unlimited') || 'Unlimited'
                            : `${limit.limitValue || 0} ${limit.limitUnit || ''}`}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Features Preview */}
                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">
                        {t('keyFeatures') || 'Key Features'}:
                      </h4>
                      <ul className="space-y-1">
                        {plan.features.slice(0, 5).map((feature) => (
                          <li key={feature.id} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="h-4 w-4 text-viridial-600 flex-shrink-0 mt-0.5" />
                            <span>{feature.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button
                    className="w-full"
                    variant={plan.isPopular ? 'default' : 'outline'}
                    onClick={() => {
                      // Navigate to subscription page or handle plan selection
                      router.push(`/${locale}/pricing/${plan.id}`);
                    }}
                  >
                    {t('getStarted') || 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison Table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            {t('featureComparison') || 'Feature Comparison'}
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      {t('feature') || 'Feature'}
                    </th>
                    {Object.values(plansByType).map((plan) => (
                      <th
                        key={plan.id}
                        className={`px-6 py-4 text-center text-sm font-semibold ${
                          plan.isPopular ? 'bg-viridial-50 text-viridial-900' : 'text-gray-900'
                        }`}
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Group features by category */}
                  {Object.entries(
                    Object.values(plansByType).reduce((acc, plan) => {
                      plan.features?.forEach((feature) => {
                        const category = feature.category || 'other';
                        if (!acc[category]) {
                          acc[category] = new Set();
                        }
                        acc[category].add(feature.name);
                      });
                      return acc;
                    }, {} as Record<string, Set<string>>),
                  ).map(([category, featureNames]) => (
                    <tr key={category}>
                      <td className="px-6 py-4 font-semibold text-gray-900 bg-gray-50">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </td>
                      {Object.values(plansByType).map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          {plan.features?.some((f) => (f.category || 'other') === category) ? (
                            <Check className="h-5 w-5 text-viridial-600 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

