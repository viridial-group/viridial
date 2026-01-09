'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  CheckCircle2, X, ArrowRight, Sparkles, Zap, Shield, Globe,
  Building2, Users, TrendingUp, Star, Crown, Rocket, HelpCircle,
  Award, Clock, RefreshCw, Heart, ThumbsUp, MessageSquare,
  BarChart3, Code, Headphones, Palette, Lock, CreditCard
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { DashboardIllustration } from '@/components/pricing/DashboardIllustration';
import { PropertyManagementIllustration } from '@/components/pricing/PropertyManagementIllustration';
import { AnalyticsIllustration } from '@/components/pricing/AnalyticsIllustration';
import { MobileAppIllustration } from '@/components/pricing/MobileAppIllustration';
import { LeadManagementIllustration } from '@/components/pricing/LeadManagementIllustration';
import {
  DashboardBackofficeSVG,
  PropertyManagementBackofficeSVG,
  AnalyticsBackofficeSVG,
  LeadManagementBackofficeSVG,
  MobileAppBackofficeSVG,
} from '@/components/home/BackofficeIllustrations';

interface PricingFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  badge?: string;
  icon: React.ReactNode;
  color: string;
  features: PricingFeature[];
  cta: string;
  ctaLink: string;
  popular?: boolean;
}

export default function PricingPage() {
  const { t } = useTranslation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: t('pricing.plans.free.name'),
      description: t('pricing.plans.free.description'),
      price: {
        monthly: 0,
        yearly: 0,
      },
      badge: t('pricing.plans.free.badge'),
      icon: <Sparkles className="h-6 w-6" />,
      color: 'gray',
      features: [
        { name: `${t('pricing.features.upTo')} 10 ${t('pricing.features.properties')}`, included: true },
        { name: t('pricing.features.basicSearch'), included: true },
        { name: t('pricing.features.autoGeolocation'), included: true },
        { name: `${t('pricing.features.mediaUpload')} (5 ${t('pricing.features.mediaPerProperty')})`, included: true },
        { name: t('pricing.features.emailSupport'), included: true },
        { name: t('pricing.features.basicDashboard'), included: true },
        { name: t('pricing.features.advancedAnalytics'), included: false },
        { name: t('pricing.features.basicNeighborhood'), included: false },
        { name: t('pricing.features.basicLeads'), included: false },
        { name: `Multi-${t('pricing.features.users')}`, included: false },
        { name: t('pricing.features.completeAPI'), included: false },
        { name: t('pricing.features.ecoFilters'), included: false },
        { name: t('pricing.features.prioritySupport'), included: false },
        { name: t('pricing.features.customization'), included: false },
      ],
      cta: t('pricing.plans.free.cta'),
      ctaLink: '/signup',
    },
    {
      id: 'starter',
      name: t('pricing.plans.starter.name'),
      description: t('pricing.plans.starter.description'),
      price: {
        monthly: 29,
        yearly: 290,
      },
      icon: <Zap className="h-6 w-6" />,
      color: 'blue',
      features: [
        { name: `${t('pricing.features.upTo')} 50 ${t('pricing.features.properties')}`, included: true },
        { name: t('pricing.features.intelligentSearch'), included: true },
        { name: t('pricing.features.autoGeolocation'), included: true },
        { name: `${t('pricing.features.mediaUpload')} ${t('pricing.features.unlimitedMedia')}`, included: true },
        { name: t('pricing.features.basicAnalytics'), included: true },
        { name: t('pricing.features.basicNeighborhood'), included: true },
        { name: t('pricing.features.ecoFilters'), included: true },
        { name: t('pricing.features.emailSupport'), included: true },
        { name: t('pricing.features.improvedDashboard'), included: true },
        { name: t('pricing.features.basicLeads'), included: true },
        { name: `${t('pricing.features.upTo')} 3 ${t('pricing.features.users')}`, included: true },
        { name: t('pricing.features.limitedAPI'), included: true },
        { name: t('pricing.features.prioritySupport'), included: false },
        { name: `${t('pricing.features.customization')} avancée`, included: false },
      ],
      cta: t('pricing.plans.starter.cta'),
      ctaLink: '/signup?plan=starter',
      popular: true,
    },
    {
      id: 'pro',
      name: t('pricing.plans.pro.name'),
      description: t('pricing.plans.pro.description'),
      price: {
        monthly: 99,
        yearly: 990,
      },
      badge: t('pricing.plans.pro.badge'),
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'green',
      features: [
        { name: `${t('pricing.features.properties')} ${t('pricing.features.unlimited')}`, included: true },
        { name: t('pricing.features.advancedSearch'), included: true },
        { name: t('pricing.features.geolocationPOI'), included: true },
        { name: t('pricing.features.unlimitedMediaTours'), included: true },
        { name: t('pricing.features.advancedAnalytics'), included: true },
        { name: t('pricing.features.detailedNeighborhood'), included: true },
        { name: t('pricing.features.completeLeads'), included: true },
        { name: t('pricing.features.autoLeadScoring'), included: true },
        { name: `${t('pricing.features.upTo')} 20 ${t('pricing.features.users')}`, included: true },
        { name: t('pricing.features.completeAPI'), included: true },
        { name: t('pricing.features.crmSync'), included: true },
        { name: t('pricing.features.advancedEcoFilters'), included: true },
        { name: t('pricing.features.prioritySupport'), included: true },
        { name: t('pricing.features.basicCustomization'), included: true },
      ],
      cta: t('pricing.plans.pro.cta'),
      ctaLink: '/signup?plan=pro',
      popular: false,
    },
    {
      id: 'enterprise',
      name: t('pricing.plans.enterprise.name'),
      description: t('pricing.plans.enterprise.description'),
      price: {
        monthly: 499,
        yearly: 4990,
      },
      badge: t('pricing.plans.enterprise.badge'),
      icon: <Crown className="h-6 w-6" />,
      color: 'purple',
      features: [
        { name: t('pricing.features.allInPro'), included: true, highlight: true },
        { name: t('pricing.features.unlimitedUsers'), included: true },
        { name: t('pricing.features.multiOrg'), included: true },
        { name: t('pricing.features.advancedRBAC'), included: true },
        { name: t('pricing.features.customAnalytics'), included: true },
        { name: t('pricing.features.customIntegrations'), included: true },
        { name: t('pricing.features.dedicatedDev'), included: true },
        { name: t('pricing.features.support24'), included: true },
        { name: t('pricing.features.accountManager'), included: true },
        { name: t('pricing.features.training'), included: true },
        { name: t('pricing.features.sla'), included: true },
        { name: t('pricing.features.completeCustomization'), included: true },
        { name: t('pricing.features.dedicatedHosting'), included: true },
        { name: t('pricing.features.securityAudit'), included: true },
      ],
      cta: t('pricing.plans.enterprise.cta'),
      ctaLink: '/contact?plan=enterprise',
      popular: false,
    },
  ];

  const getColorClasses = (color: string, isPopular: boolean = false) => {
    const colors: Record<string, string> = {
      gray: isPopular
        ? 'border-gray-300 bg-gray-50'
        : 'border-gray-200 bg-white',
      blue: isPopular
        ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-500'
        : 'border-blue-200 bg-white',
      green: isPopular
        ? 'border-primary bg-viridial-50 shadow-lg ring-2 ring-primary'
        : 'border-viridial-200 bg-white',
      purple: isPopular
        ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-500'
        : 'border-purple-200 bg-white',
    };
    return colors[color] || colors.gray;
  };

  const getButtonColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'bg-gray-600 hover:bg-gray-700',
      blue: 'bg-blue-600 hover:bg-blue-700',
      green: 'bg-primary hover:bg-viridial-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
    };
    return colors[color] || colors.gray;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateYearlyDiscount = (monthly: number) => {
    const yearlyEquivalent = monthly * 12;
    const yearlyPrice = monthly * 10; // 2 mois gratuits
    return Math.round(((yearlyEquivalent - yearlyPrice) / yearlyEquivalent) * 100);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-viridial-50 via-white to-blue-50 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-viridial-100 text-viridial-700 rounded-full text-sm font-semibold mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              {t('pricing.hero.badge')}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              {t('pricing.hero.title')}
              <span className="block gradient-text-artistic mt-2">{t('pricing.hero.subtitle')}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              {t('pricing.hero.description')}
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <span className={`text-sm font-medium transition-colors duration-200 ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                {t('pricing.hero.monthly')}
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  billingPeriod === 'yearly' ? 'bg-primary shadow-lg shadow-viridial-200' : 'bg-gray-300'
                }`}
                aria-label={t('pricing.hero.billingToggle')}
              >
                <span
                  className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium transition-colors duration-200 ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                  {t('pricing.hero.yearly')}
                </span>
                {billingPeriod === 'yearly' && (
                  <Badge variant="default" className="bg-primary text-white text-xs font-semibold px-3 py-1 animate-in fade-in zoom-in-95 duration-300">
                    {t('pricing.hero.save')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Savings Calculator */}
            {billingPeriod === 'yearly' && (
              <div className="animate-fade-in mb-8" style={{ animationDelay: '400ms' }}>
                <Card className="border-2 border-primary bg-gradient-to-r from-viridial-50 to-viridial-50 shadow-lg max-w-md mx-auto">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg text-gray-900">
                        {t('pricing.savingsCalculator.title')}
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>{t('pricing.savingsCalculator.monthlyPrice')}</span>
                        <span className="font-medium">
                          {formatPrice(plans.find(p => p.popular)?.price.monthly || 29 * 12)}
                        </span>
                      </div>
                      <div className="flex justify-between text-primary font-semibold">
                        <span>{t('pricing.savingsCalculator.annualSavings')}</span>
                        <span>
                          {formatPrice((plans.find(p => p.popular)?.price.monthly || 29) * 2)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-viridial-200 flex justify-between items-center">
                        <span className="font-semibold text-gray-900">{t('pricing.savingsCalculator.annualPrice')}</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(plans.find(p => p.popular)?.price.yearly || 290)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-viridial-200">
                        {t('pricing.savingsCalculator.note')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('pricing.featuresShowcase.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('pricing.featuresShowcase.description')}
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              {/* Dashboard */}
              <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <Card className="border-0 shadow-xl overflow-hidden h-full">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="h-6 w-6" />
                      <CardTitle className="text-2xl">{t('pricing.featuresShowcase.dashboard.title')}</CardTitle>
                    </div>
                    <CardDescription className="text-blue-100">
                      {t('pricing.featuresShowcase.dashboard.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 bg-gray-50">
                    <div className="relative aspect-video bg-white flex items-center justify-center p-4">
                      <DashboardBackofficeSVG className="w-full h-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Property Management */}
              <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <Card className="border-0 shadow-xl overflow-hidden h-full">
                  <CardHeader className="bg-gradient-to-r from-viridial-500 via-viridial-600 to-viridial-700 text-white pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="h-6 w-6" />
                      <CardTitle className="text-2xl">{t('pricing.featuresShowcase.propertyManagement.title')}</CardTitle>
                    </div>
                    <CardDescription className="text-viridial-100">
                      {t('pricing.featuresShowcase.propertyManagement.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 bg-gray-50">
                    <div className="relative aspect-video bg-white flex items-center justify-center p-4">
                      <PropertyManagementBackofficeSVG className="w-full h-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics */}
              <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <Card className="border-0 shadow-xl overflow-hidden h-full">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-6 w-6" />
                      <CardTitle className="text-2xl">{t('pricing.featuresShowcase.analytics.title')}</CardTitle>
                    </div>
                    <CardDescription className="text-purple-100">
                      {t('pricing.featuresShowcase.analytics.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 bg-gray-50">
                    <div className="relative aspect-video bg-white flex items-center justify-center p-4">
                      <AnalyticsBackofficeSVG className="w-full h-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Management */}
              <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                <Card className="border-0 shadow-xl overflow-hidden h-full">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-6 w-6" />
                      <CardTitle className="text-2xl">{t('pricing.featuresShowcase.leadManagement.title')}</CardTitle>
                    </div>
                    <CardDescription className="text-orange-100">
                      {t('pricing.featuresShowcase.leadManagement.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 bg-gray-50">
                    <div className="relative aspect-video bg-white flex items-center justify-center p-4">
                      <LeadManagementBackofficeSVG className="w-full h-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile App Highlight */}
            <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
              <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-viridial-50 to-blue-50">
                <CardContent className="p-8 lg:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary rounded-xl">
                          <Globe className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-gray-900">
                          {t('pricing.featuresShowcase.mobileApp.title')}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-lg text-gray-700 mb-6">
                        {t('pricing.featuresShowcase.mobileApp.description')}
                      </CardDescription>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-gray-700">{t('pricing.featuresShowcase.mobileApp.mobileOptimized')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-gray-700">{t('pricing.featuresShowcase.mobileApp.realTimeNotifications')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-gray-700">{t('pricing.featuresShowcase.mobileApp.autoSync')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                      <div className="relative w-full max-w-xs">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 rounded-3xl blur-2xl opacity-20 transform rotate-6"></div>
                        <div className="relative bg-white p-4 rounded-3xl shadow-2xl">
                          <MobileAppBackofficeSVG className="w-full h-auto" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <TooltipProvider>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, index) => {
                const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly;
                const isPopular = plan.popular && billingPeriod === 'monthly';

                return (
                  <Card
                    key={plan.id}
                    className={`border-2 relative ${getColorClasses(plan.color, isPopular)} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-fade-in flex flex-col`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold">
                        {plan.id === 'pro' ? t('pricing.plans.pro.badge') : t('pricing.plans.starter.popular')}
                      </span>
                    </div>
                  )}
                  
                  {plan.badge && !isPopular && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        plan.color === 'gray' ? 'bg-gray-100 text-gray-600' :
                        plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        plan.color === 'green' ? 'bg-viridial-100 text-primary' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {plan.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(price)}
                        </span>
                        {price > 0 && (
                          <span className="text-gray-500 text-sm">
                            /{billingPeriod === 'monthly' ? t('pricing.hero.perMonth') : t('pricing.hero.perYear')}
                          </span>
                        )}
                      </div>
                      {price > 0 && billingPeriod === 'yearly' && (
                        <div className="mt-2 flex items-center gap-2">
                          <p className="text-sm text-gray-600">
                            {t('pricing.hero.or')} {formatPrice(Math.round(price / 12))}/{t('pricing.hero.perMonth')}
                          </p>
                          <Badge variant="default" className="bg-primary text-white text-xs">
                            -{calculateYearlyDiscount(plan.price.monthly)}%
                          </Badge>
                        </div>
                      )}
                      {price === 0 && (
                        <p className="text-sm text-gray-600 mt-2">
                          {t('pricing.hero.foreverNoCard')}
                        </p>
                      )}
                    </div>

                    <CardFooter className="pt-6 px-0 pb-0">
                      <Button
                        asChild
                        className={`w-full ${getButtonColor(plan.color)} text-white hover:shadow-lg transition-all duration-200`}
                        size="lg"
                      >
                        <Link href={plan.ctaLink}>
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>

                    <div className="space-y-3 flex-1">
                      {plan.features.map((feature, featureIndex) => {
                        // Map feature names to tooltip translation keys
                        const featureTooltipKeys: Record<string, string> = {
                          [`${t('pricing.features.upTo')} 10 ${t('pricing.features.properties')}`]: 'pricing.features.tooltips.upTo10Properties',
                          [`${t('pricing.features.upTo')} 50 ${t('pricing.features.properties')}`]: 'pricing.features.tooltips.upTo50Properties',
                          [`${t('pricing.features.properties')} ${t('pricing.features.unlimited')}`]: 'pricing.features.tooltips.unlimitedProperties',
                          [t('pricing.features.basicSearch')]: 'pricing.features.tooltips.basicSearch',
                          [t('pricing.features.intelligentSearch')]: 'pricing.features.tooltips.intelligentSearch',
                          [t('pricing.features.advancedSearch')]: 'pricing.features.tooltips.advancedSearch',
                          [t('pricing.features.basicAnalytics')]: 'pricing.features.tooltips.basicAnalytics',
                          [t('pricing.features.advancedAnalytics')]: 'pricing.features.tooltips.advancedAnalytics',
                          [t('pricing.features.basicNeighborhood')]: 'pricing.features.tooltips.basicNeighborhood',
                          [t('pricing.features.detailedNeighborhood')]: 'pricing.features.tooltips.detailedNeighborhood',
                          [t('pricing.features.basicLeads')]: 'pricing.features.tooltips.basicLeads',
                          [t('pricing.features.completeLeads')]: 'pricing.features.tooltips.completeLeads',
                          [t('pricing.features.autoLeadScoring')]: 'pricing.features.tooltips.autoLeadScoring',
                          [t('pricing.features.crmSync')]: 'pricing.features.tooltips.crmSync',
                          [t('pricing.features.limitedAPI')]: 'pricing.features.tooltips.limitedAPI',
                          [t('pricing.features.completeAPI')]: 'pricing.features.tooltips.completeAPI',
                          [t('pricing.features.prioritySupport')]: 'pricing.features.tooltips.prioritySupport',
                          [t('pricing.features.basicCustomization')]: 'pricing.features.tooltips.basicCustomization',
                          [t('pricing.features.completeCustomization')]: 'pricing.features.tooltips.completeCustomization',
                          [t('pricing.features.multiOrg')]: 'pricing.features.tooltips.multiOrg',
                          [t('pricing.features.advancedRBAC')]: 'pricing.features.tooltips.advancedRBAC',
                          [t('pricing.features.customAnalytics')]: 'pricing.features.tooltips.customAnalytics',
                          [t('pricing.features.customIntegrations')]: 'pricing.features.tooltips.customIntegrations',
                          [t('pricing.features.dedicatedDev')]: 'pricing.features.tooltips.dedicatedDev',
                          [t('pricing.features.accountManager')]: 'pricing.features.tooltips.accountManager',
                          [t('pricing.features.sla')]: 'pricing.features.tooltips.sla',
                          [t('pricing.features.securityAudit')]: 'pricing.features.tooltips.securityAudit',
                        };

                        const tooltipKey = featureTooltipKeys[feature.name];
                        const tooltipText = tooltipKey ? t(tooltipKey) : '';

                        return (
                          <Tooltip key={featureIndex}>
                            <TooltipTrigger asChild>
                              <div
                                className={`flex items-start gap-3 ${tooltipText ? 'cursor-help' : ''} ${
                                  feature.highlight ? 'font-semibold text-gray-900' : ''
                                }`}
                              >
                                {feature.included ? (
                                  <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                                    plan.color === 'gray' ? 'text-gray-600' :
                                    plan.color === 'blue' ? 'text-blue-600' :
                                    plan.color === 'green' ? 'text-primary' :
                                    'text-purple-600'
                                  }`} />
                                ) : (
                                  <X className="h-5 w-5 flex-shrink-0 mt-0.5 text-gray-300" />
                                )}
                                <div className="flex items-center gap-2 flex-1">
                                  <span
                                    className={`text-sm ${
                                      feature.included
                                        ? 'text-gray-700'
                                        : 'text-gray-400 line-through'
                                    }`}
                                  >
                                    {feature.name}
                                  </span>
                                  {tooltipText && (
                                    <HelpCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            {tooltipText && (
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="text-sm">{tooltipText}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}
                    </div>
                  </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </TooltipProvider>

      {/* Trust & Guarantees Section */}
      <section className="py-20 bg-gradient-to-br from-viridial-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('pricing.trust.title')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('pricing.trust.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Card className="border-2 border-viridial-200 bg-viridial-50/50">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 bg-viridial-100 rounded-full mb-4">
                    <RefreshCw className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {t('pricing.trust.cancellation.title')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('pricing.trust.cancellation.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {t('pricing.trust.noHiddenFees.title')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('pricing.trust.noHiddenFees.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50/50">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 bg-purple-100 rounded-full mb-4">
                    <Headphones className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {t('pricing.trust.supportIncluded.title')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('pricing.trust.supportIncluded.description')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Savings Calculator */}
            {billingPeriod === 'yearly' && (
              <Card className="border-2 border-primary bg-gradient-to-br from-viridial-50 to-blue-50 mb-12">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h3 className="text-2xl font-bold text-gray-900">
                          {t('pricing.savingsCalculator.youSave')}
                        </h3>
                      </div>
                      <p className="text-gray-600">
                        {t('pricing.savingsCalculator.saveUpTo')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary mb-1">
                        {t('pricing.savingsCalculator.discount')}
                      </div>
                      <p className="text-sm text-gray-600">
                        {t('pricing.savingsCalculator.or2Months')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('pricing.comparison.title')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('pricing.comparison.description')}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10">{t('pricing.comparison.feature')}</th>
                    <th className="text-center p-4 font-semibold text-gray-900 min-w-[150px]">{t('pricing.plans.free.name')}</th>
                    <th className="text-center p-4 font-semibold text-gray-900 min-w-[150px] bg-blue-50">
                      {t('pricing.plans.starter.name')}
                      {billingPeriod === 'monthly' && <Badge variant="default" className="ml-2 text-xs">{t('pricing.plans.starter.popular')}</Badge>}
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-900 min-w-[150px]">{t('pricing.plans.pro.name')}</th>
                    <th className="text-center p-4 font-semibold text-gray-900 min-w-[150px]">{t('pricing.plans.enterprise.name')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white z-10">{t('pricing.comparison.properties')}</td>
                    <td className="text-center p-4 text-gray-600">10</td>
                    <td className="text-center p-4 text-gray-600 bg-blue-50/50">50</td>
                    <td className="text-center p-4 text-gray-600">{t('pricing.features.unlimited')}</td>
                    <td className="text-center p-4 text-gray-600">{t('pricing.features.unlimited')}</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white z-10">{t('pricing.comparison.users')}</td>
                    <td className="text-center p-4 text-gray-600">1</td>
                    <td className="text-center p-4 text-gray-600 bg-blue-50/50">3</td>
                    <td className="text-center p-4 text-gray-600">20</td>
                    <td className="text-center p-4 text-gray-600">{t('pricing.features.unlimitedUsers')}</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white z-10">{t('pricing.comparison.support')}</td>
                    <td className="text-center p-4">
                      <Badge variant="secondary">{t('pricing.comparison.email')}</Badge>
                    </td>
                    <td className="text-center p-4 bg-blue-50/50">
                      <Badge variant="secondary">{t('pricing.comparison.email')}</Badge>
                    </td>
                    <td className="text-center p-4">
                      <Badge variant="default">{t('pricing.comparison.priority')}</Badge>
                    </td>
                    <td className="text-center p-4">
                      <Badge variant="default">{t('pricing.comparison.dedicated24')}</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white z-10">{t('pricing.comparison.api')}</td>
                    <td className="text-center p-4">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-blue-50/50">
                      <Badge variant="outline">{t('pricing.comparison.limited')}</Badge>
                    </td>
                    <td className="text-center p-4">
                      <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white z-10">{t('pricing.comparison.analytics')}</td>
                    <td className="text-center p-4">
                      <Badge variant="outline">{t('pricing.comparison.basic')}</Badge>
                    </td>
                    <td className="text-center p-4 bg-blue-50/50">
                      <Badge variant="outline">{t('pricing.comparison.basic')}</Badge>
                    </td>
                    <td className="text-center p-4">
                      <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Badge variant="default">{t('pricing.comparison.custom')}</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white z-10">{t('pricing.comparison.crmIntegration')}</td>
                    <td className="text-center p-4">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-blue-50/50">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white z-10">{t('pricing.comparison.customization')}</td>
                    <td className="text-center p-4">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-blue-50/50">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Badge variant="outline">{t('pricing.comparison.basic')}</Badge>
                    </td>
                    <td className="text-center p-4">
                      <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white z-10">{billingPeriod === 'monthly' ? t('pricing.comparison.monthlyPrice') : t('pricing.comparison.annualPrice')}</td>
                    <td className="text-center p-4">
                      <div className="font-bold text-xl text-gray-900">{formatPrice(billingPeriod === 'monthly' ? 0 : 0)}</div>
                    </td>
                    <td className="text-center p-4 bg-blue-50/50">
                      <div className="font-bold text-xl text-gray-900">{formatPrice(billingPeriod === 'monthly' ? 29 : 290)}</div>
                      {billingPeriod === 'yearly' && <p className="text-xs text-primary mt-1">{t('pricing.savingsCalculator.savePercent')}</p>}
                    </td>
                    <td className="text-center p-4">
                      <div className="font-bold text-xl text-gray-900">{formatPrice(billingPeriod === 'monthly' ? 99 : 990)}</div>
                      {billingPeriod === 'yearly' && <p className="text-xs text-primary mt-1">{t('pricing.savingsCalculator.savePercent')}</p>}
                    </td>
                    <td className="text-center p-4">
                      <div className="font-bold text-xl text-gray-900">{formatPrice(billingPeriod === 'monthly' ? 499 : 4990)}</div>
                      {billingPeriod === 'yearly' && <p className="text-xs text-primary mt-1">{t('pricing.savingsCalculator.savePercent')}</p>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with Accordion */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('pricing.faq.title')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('pricing.faq.description')}
              </p>
            </div>

            <TooltipProvider>
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6 bg-white">
                  <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:no-underline">
                    {t('pricing.faq.changePlan.question')}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t('pricing.faq.changePlan.answer')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6 bg-white">
                  <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:no-underline">
                    {t('pricing.faq.hiddenFees.question')}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t('pricing.faq.hiddenFees.answer')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6 bg-white">
                  <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:no-underline">
                    {t('pricing.faq.cancel.question')}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t('pricing.faq.cancel.answer')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6 bg-white">
                  <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:no-underline">
                    {t('pricing.faq.freeLimit.question')}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t('pricing.faq.freeLimit.answer')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6 bg-white">
                  <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:no-underline">
                    {t('pricing.faq.vat.question')}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t('pricing.faq.vat.answer')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border border-gray-200 rounded-lg px-6 bg-white">
                  <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:no-underline">
                    {t('pricing.faq.discounts.question')}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t('pricing.faq.discounts.answer')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7" className="border border-gray-200 rounded-lg px-6 bg-white">
                  <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:no-underline">
                    {t('pricing.faq.trial.question')}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t('pricing.faq.trial.answer')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8" className="border border-gray-200 rounded-lg px-6 bg-white">
                  <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:no-underline">
                    {t('pricing.faq.payment.question')}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t('pricing.faq.payment.answer')}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TooltipProvider>
          </div>
        </div>
      </section>

      {/* Testimonials/Trust Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('pricing.trust.trustTitle')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('pricing.trust.trustDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-2 border-gray-200 hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-viridial-400 to-primary flex items-center justify-center text-white font-bold text-lg">
                      JD
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t('pricing.trust.testimonials.jean.name')}</p>
                      <p className="text-sm text-gray-600">{t('pricing.trust.testimonials.jean.role')}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm italic">
                    "{t('pricing.trust.testimonials.jean.text')}"
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-blue-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      ML
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t('pricing.trust.testimonials.marie.name')}</p>
                      <p className="text-sm text-gray-600">{t('pricing.trust.testimonials.marie.role')}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm italic">
                    "{t('pricing.trust.testimonials.marie.text')}"
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-purple-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      PM
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t('pricing.trust.testimonials.pierre.name')}</p>
                      <p className="text-sm text-gray-600">{t('pricing.trust.testimonials.pierre.role')}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm italic">
                    "{t('pricing.trust.testimonials.pierre.text')}"
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
                <div className="text-sm text-gray-600">{t('pricing.trust.stats.agencies')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
                <div className="text-sm text-gray-600">{t('pricing.trust.stats.properties')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-sm text-gray-600">{t('pricing.trust.stats.uptime')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-gray-600">{t('pricing.trust.stats.enterpriseSupport')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('pricing.enterprise.title')}
            </h2>
            <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
              {t('pricing.enterprise.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                <Link href="/contact?plan=enterprise">
                  {t('pricing.enterprise.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm">
                <Link href="/features">
                  {t('pricing.enterprise.ctaSecondary')}
                </Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Award className="h-6 w-6 mb-3 text-purple-200" />
                <h3 className="font-semibold mb-2">{t('pricing.enterprise.benefits.exclusiveFeatures.title')}</h3>
                <p className="text-sm text-purple-100">
                  {t('pricing.enterprise.benefits.exclusiveFeatures.description')}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Headphones className="h-6 w-6 mb-3 text-purple-200" />
                <h3 className="font-semibold mb-2">{t('pricing.enterprise.benefits.dedicatedSupport.title')}</h3>
                <p className="text-sm text-purple-100">
                  {t('pricing.enterprise.benefits.dedicatedSupport.description')}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Shield className="h-6 w-6 mb-3 text-purple-200" />
                <h3 className="font-semibold mb-2">{t('pricing.enterprise.benefits.slaGuaranteed.title')}</h3>
                <p className="text-sm text-purple-100">
                  {t('pricing.enterprise.benefits.slaGuaranteed.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

