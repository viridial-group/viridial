'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';
import { planApi, PlanApiError } from '@/lib/plan-api';
import { subscriptionApi, SubscriptionApiError } from '@/lib/subscription-api';
import { useToast } from '@/components/ui/toast';
import type { Plan, PlanFeature, PlanLimit } from '@/types/plans';

export default function PlanSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('pricing');
  const { toast } = useToast();
  const planId = params.id as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
  }, [planId, billingPeriod]);

  const loadPlan = async () => {
    try {
      setIsLoading(true);
      const data = await planApi.getById(planId);
      setPlan(data);
    } catch (error) {
      console.error('Failed to load plan:', error);
      toast({
        title: t('errors.loadFailed') || 'Failed to load plan',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!plan) return;

    try {
      setIsSubscribing(true);
      // Get current organization ID from context or localStorage
      const organizationId = localStorage.getItem('organizationId');
      if (!organizationId) {
        toast({
          title: t('errors.noOrganization') || 'No organization found',
          description: t('errors.noOrganizationDescription') || 'Please select an organization first',
          variant: 'error',
        });
        return;
      }

      await subscriptionApi.create({
        organizationId,
        planId: plan.id,
        billingPeriod,
        status: 'trial',
        standardUsersCount: 1,
        singleAppUsersCount: 0,
      });

      toast({
        title: t('subscriptionCreated') || 'Subscription created',
        description: t('subscriptionCreatedDescription') || 'Your subscription has been created successfully',
        variant: 'success',
      });

      // Redirect to subscription management page
      router.push('/subscriptions');
    } catch (error) {
      console.error('Failed to create subscription:', error);
      toast({
        title: t('errors.subscribeFailed') || 'Failed to create subscription',
        description: error instanceof SubscriptionApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-viridial-600 mx-auto" />
          <p className="mt-4 text-gray-600">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('planNotFound') || 'Plan not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('planNotFoundDescription') || 'The plan you are looking for does not exist.'}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back') || 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back') || 'Back'}
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{plan.name}</h1>
          <p className="text-xl text-gray-600">{plan.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t('pricing') || 'Pricing'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setBillingPeriod('monthly')}
                  >
                    {t('monthly') || 'Monthly'}
                  </Button>
                  <Button
                    variant={billingPeriod === 'annual' ? 'default' : 'outline'}
                    onClick={() => setBillingPeriod('annual')}
                  >
                    {t('annual') || 'Annual'}
                  </Button>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">
                    ${Number(plan.standardPrice).toFixed(2)}
                  </span>
                  <span className="text-gray-500">
                    /{t('user') || 'user'}/{t('month') || 'month'}
                  </span>
                </div>
                {plan.singleAppPrice && (
                  <p className="text-sm text-gray-500">
                    {t('singleAppPrice') || 'Single App'}: ${Number(plan.singleAppPrice).toFixed(2)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            {plan.features && plan.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('features') || 'Features'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature.id} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-viridial-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                          {feature.description && (
                            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Limits */}
            {plan.limits && plan.limits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('limits') || 'Limits'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan.limits.map((limit) => (
                      <div key={limit.id} className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-900">{limit.limitName}</h4>
                          {limit.description && (
                            <p className="text-sm text-gray-600 mt-1">{limit.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-4">
                          {limit.isUnlimited
                            ? t('unlimited') || 'Unlimited'
                            : `${limit.limitValue || 0} ${limit.limitUnit || ''}`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - CTA */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>{t('subscribe') || 'Subscribe'}</CardTitle>
                <CardDescription>
                  {t('subscribeDescription') || 'Start your subscription today'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    ${plan.standardPrice.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    /{t('user') || 'user'}/{t('month') || 'month'}
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('subscribing') || 'Subscribing...'}
                    </>
                  ) : (
                    t('subscribeNow') || 'Subscribe Now'
                  )}
                </Button>
                <p className="text-xs text-center text-gray-500">
                  {t('trialInfo') || 'Start with a free trial, cancel anytime'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

