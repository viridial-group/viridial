'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, CreditCard, Users, Settings, AlertCircle } from 'lucide-react';
import { subscriptionApi, SubscriptionApiError } from '@/lib/subscription-api';
import { useToast } from '@/components/ui/toast';
import type { Subscription } from '@/types/plans';

export default function SubscriptionsPage() {
  const t = useTranslations('subscriptions');
  const router = useRouter();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'trial' | 'cancelled' | 'all'>('active');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      const organizationId = localStorage.getItem('organizationId');
      if (!organizationId) {
        toast({
          title: t('errors.noOrganization') || 'No organization found',
          description: t('errors.noOrganizationDescription') || 'Please select an organization first',
          variant: 'error',
        });
        return;
      }

      const data = await subscriptionApi.getAll({ organizationId });
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      toast({
        title: t('errors.loadFailed') || 'Failed to load subscriptions',
        description: error instanceof SubscriptionApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    if (activeTab === 'all') return subscriptions;
    return subscriptions.filter((sub) => sub.status === activeTab);
  }, [subscriptions, activeTab]);

  const statusColors: Record<string, string> = {
    trial: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('title') || 'Subscriptions'}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('subtitle') || 'Manage your organization subscriptions'}
            </p>
          </div>
          <Button onClick={() => router.push('/pricing')}>
            <Plus className="h-4 w-4 mr-2" />
            {t('newSubscription') || 'New Subscription'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-8">
          <TabsList>
            <TabsTrigger value="active">
              {t('tabs.active') || 'Active'} ({subscriptions.filter((s) => s.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="trial">
              {t('tabs.trial') || 'Trial'} ({subscriptions.filter((s) => s.status === 'trial').length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              {t('tabs.cancelled') || 'Cancelled'} ({subscriptions.filter((s) => s.status === 'cancelled').length})
            </TabsTrigger>
            <TabsTrigger value="all">
              {t('tabs.all') || 'All'} ({subscriptions.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Subscriptions Grid */}
        {filteredSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('noSubscriptions') || 'No subscriptions found'}
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                {t('noSubscriptionsDescription') || 'Get started by creating a new subscription'}
              </p>
              <Button onClick={() => router.push('/pricing')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('browsePlans') || 'Browse Plans'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map((subscription) => (
              <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">
                      {subscription.plan?.name || t('unknownPlan') || 'Unknown Plan'}
                    </CardTitle>
                    <Badge className={statusColors[subscription.status] || statusColors.active}>
                      {subscription.status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>
                    {subscription.plan?.description || ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pricing */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(subscription.monthlyAmount, subscription.currency)}
                    </span>
                    <span className="text-sm text-gray-500">
                      /{t('month') || 'month'}
                    </span>
                  </div>

                  {/* Users */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {subscription.standardUsersCount} {t('standardUsers') || 'Standard Users'}
                    </span>
                  </div>
                  {subscription.singleAppUsersCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        {subscription.singleAppUsersCount} {t('singleAppUsers') || 'Single App Users'}
                      </span>
                    </div>
                  )}

                  {/* Dates */}
                  {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {t('currentPeriod') || 'Current Period'}: {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                        </span>
                      </div>
                    </div>
                  )}

                  {subscription.nextPaymentDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard className="h-4 w-4" />
                      <span>
                        {t('nextPayment') || 'Next Payment'}: {formatDate(subscription.nextPaymentDate)}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/subscriptions/${subscription.id}`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t('manage') || 'Manage'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

