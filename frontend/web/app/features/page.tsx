'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Search, Home, MapPin, TrendingUp, Shield, Globe,
  Zap, ArrowRight, CheckCircle2, Sparkles, Layers, Rocket, Star, Leaf,
  Building2, Users, CreditCard, BarChart3, Eye, Filter, Navigation,
  FileText, Lock, Cloud, Activity, Target, Heart, Smartphone, Camera,
  Map as MapIcon, BarChart, DollarSign, Clock, Globe2, Mail, MessageSquare,
  ShoppingBag, Settings, Database, Server, Recycle, Droplets
} from 'lucide-react';
import TestimonialSection from '@/components/features/TestimonialSection';
import ComparisonSection from '@/components/features/ComparisonSection';
import FAQSection from '@/components/features/FAQSection';
import {
  DashboardBackofficeSVG,
  PropertyManagementBackofficeSVG,
  AnalyticsBackofficeSVG,
  LeadManagementBackofficeSVG,
  SearchBackofficeSVG,
} from '@/components/home/BackofficeIllustrations';
import { useTranslation } from '@/contexts/I18nContext';

export default function FeaturesPage() {
  const { t } = useTranslation();
  const mainFeatures = [
    {
      icon: <Search className="h-8 w-8 text-viridial-600" />,
      illustration: <SearchBackofficeSVG className="w-full h-64" />,
      title: t('features.mainFeatures.search.title'),
      description: t('features.mainFeatures.search.description'),
      highlights: [
        t('features.mainFeatures.search.highlights.0'),
        t('features.mainFeatures.search.highlights.1'),
        t('features.mainFeatures.search.highlights.2'),
        t('features.mainFeatures.search.highlights.3'),
        t('features.mainFeatures.search.highlights.4'),
      ],
      color: 'green',
    },
    {
      icon: <Home className="h-8 w-8 text-blue-600" />,
      illustration: <PropertyManagementBackofficeSVG className="w-full h-64" />,
      title: t('features.mainFeatures.propertyManagement.title'),
      description: t('features.mainFeatures.propertyManagement.description'),
      highlights: [
        t('features.mainFeatures.propertyManagement.highlights.0'),
        t('features.mainFeatures.propertyManagement.highlights.1'),
        t('features.mainFeatures.propertyManagement.highlights.2'),
        t('features.mainFeatures.propertyManagement.highlights.3'),
        t('features.mainFeatures.propertyManagement.highlights.4'),
      ],
      color: 'blue',
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      illustration: <AnalyticsBackofficeSVG className="w-full h-64" />,
      title: t('features.mainFeatures.intelligence.title'),
      description: t('features.mainFeatures.intelligence.description'),
      highlights: [
        t('features.mainFeatures.intelligence.highlights.0'),
        t('features.mainFeatures.intelligence.highlights.1'),
        t('features.mainFeatures.intelligence.highlights.2'),
        t('features.mainFeatures.intelligence.highlights.3'),
        t('features.mainFeatures.intelligence.highlights.4'),
      ],
      color: 'purple',
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      illustration: <LeadManagementBackofficeSVG className="w-full h-64" />,
      title: t('features.mainFeatures.leadManagement.title'),
      description: t('features.mainFeatures.leadManagement.description'),
      highlights: [
        t('features.mainFeatures.leadManagement.highlights.0'),
        t('features.mainFeatures.leadManagement.highlights.1'),
        t('features.mainFeatures.leadManagement.highlights.2'),
        t('features.mainFeatures.leadManagement.highlights.3'),
        t('features.mainFeatures.leadManagement.highlights.4'),
      ],
      color: 'orange',
    },
    {
      icon: <Building2 className="h-8 w-8 text-indigo-600" />,
      illustration: <DashboardBackofficeSVG className="w-full h-64" />,
      title: t('features.mainFeatures.multiTenant.title'),
      description: t('features.mainFeatures.multiTenant.description'),
      highlights: [
        t('features.mainFeatures.multiTenant.highlights.0'),
        t('features.mainFeatures.multiTenant.highlights.1'),
        t('features.mainFeatures.multiTenant.highlights.2'),
        t('features.mainFeatures.multiTenant.highlights.3'),
        t('features.mainFeatures.multiTenant.highlights.4'),
      ],
      color: 'indigo',
    },
    {
      icon: <Leaf className="h-8 w-8 text-mint-500" />,
      title: t('features.mainFeatures.ecology.title'),
      description: t('features.mainFeatures.ecology.description'),
      highlights: [
        t('features.mainFeatures.ecology.highlights.0'),
        t('features.mainFeatures.ecology.highlights.1'),
        t('features.mainFeatures.ecology.highlights.2'),
        t('features.mainFeatures.ecology.highlights.3'),
        t('features.mainFeatures.ecology.highlights.4'),
      ],
      color: 'emerald',
    },
  ];

  const technicalFeatures = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: t('features.technicalFeatures.security.title'),
      description: t('features.technicalFeatures.security.description'),
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: t('features.technicalFeatures.cloud.title'),
      description: t('features.technicalFeatures.cloud.description'),
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: t('features.technicalFeatures.observability.title'),
      description: t('features.technicalFeatures.observability.description'),
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: t('features.technicalFeatures.reliability.title'),
      description: t('features.technicalFeatures.reliability.description'),
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: t('features.technicalFeatures.responsive.title'),
      description: t('features.technicalFeatures.responsive.description'),
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: t('features.technicalFeatures.performance.title'),
      description: t('features.technicalFeatures.performance.description'),
    },
  ];

  const useCases = [
    {
      title: t('features.useCases.agencies.title'),
      description: t('features.useCases.agencies.description'),
      features: [
        t('features.useCases.agencies.features.0'),
        t('features.useCases.agencies.features.1'),
        t('features.useCases.agencies.features.2'),
        t('features.useCases.agencies.features.3'),
      ],
      icon: <Building2 className="h-6 w-6" />,
    },
    {
      title: t('features.useCases.owners.title'),
      description: t('features.useCases.owners.description'),
      features: [
        t('features.useCases.owners.features.0'),
        t('features.useCases.owners.features.1'),
        t('features.useCases.owners.features.2'),
        t('features.useCases.owners.features.3'),
      ],
      icon: <Home className="h-6 w-6" />,
    },
    {
      title: t('features.useCases.searchers.title'),
      description: t('features.useCases.searchers.description'),
      features: [
        t('features.useCases.searchers.features.0'),
        t('features.useCases.searchers.features.1'),
        t('features.useCases.searchers.features.2'),
        t('features.useCases.searchers.features.3'),
      ],
      icon: <Search className="h-6 w-6" />,
    },
  ];

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
              {t('features.hero.badge')}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              {t('features.hero.title')}
              <span className="block text-viridial-600 mt-2">{t('features.hero.subtitle')}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              {t('features.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Button asChild size="lg" className="gradient-button-primary hover:gradient-button-primary text-white px-8 py-6 text-lg transition-all duration-300">
                <Link href="/search">
                  {t('features.hero.ctaPrimary')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg border-2">
                <Link href="/signup">
                  {t('features.hero.ctaSecondary')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('features.mainFeatures.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('features.mainFeatures.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => (
              <Card
                key={index}
                className={`border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                  feature.color === 'green' ? 'border-viridial-200 hover:border-viridial-300' :
                  feature.color === 'blue' ? 'border-blue-200 hover:border-blue-300' :
                  feature.color === 'purple' ? 'border-purple-200 hover:border-purple-300' :
                  feature.color === 'orange' ? 'border-orange-200 hover:border-orange-300' :
                  feature.color === 'indigo' ? 'border-indigo-200 hover:border-indigo-300' :
                  'border-mint-200 hover:border-mint-300'
                } animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="mb-4 bg-gray-50 rounded-lg p-4">
                    {feature.illustration}
                  </div>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      feature.color === 'green' ? 'bg-viridial-100' :
                      feature.color === 'blue' ? 'bg-blue-100' :
                      feature.color === 'purple' ? 'bg-purple-100' :
                      feature.color === 'orange' ? 'bg-orange-100' :
                      feature.color === 'indigo' ? 'bg-indigo-100' :
                      'bg-mint-100'
                    }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-viridial-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('features.useCases.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('features.useCases.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card
                key={index}
                className="border-2 border-gray-200 hover:border-viridial-300 hover:shadow-xl transition-all duration-300 text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="mx-auto mb-4 p-4 bg-viridial-100 rounded-full w-16 h-16 flex items-center justify-center">
                    {useCase.icon}
                  </div>
                  <CardTitle className="text-2xl mb-3">{useCase.title}</CardTitle>
                  <CardDescription className="text-base">{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-left">
                    {useCase.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-viridial-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('features.technicalFeatures.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('features.technicalFeatures.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalFeatures.map((feature, index) => (
              <Card
                key={index}
                className="border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights with Icons */}
      <section className="py-20 bg-gradient-to-br from-viridial-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-white rounded-2xl shadow-md w-16 h-16 flex items-center justify-center">
                <MapIcon className="h-8 w-8 text-viridial-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('features.highlights.interactiveMap.title')}</h3>
              <p className="text-sm text-gray-600">{t('features.highlights.interactiveMap.description')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-white rounded-2xl shadow-md w-16 h-16 flex items-center justify-center">
                <Filter className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('features.highlights.advancedFilters.title')}</h3>
              <p className="text-sm text-gray-600">{t('features.highlights.advancedFilters.description')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-white rounded-2xl shadow-md w-16 h-16 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('features.highlights.analytics.title')}</h3>
              <p className="text-sm text-gray-600">{t('features.highlights.analytics.description')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-white rounded-2xl shadow-md w-16 h-16 flex items-center justify-center">
                <Eye className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('features.highlights.detailedViews.title')}</h3>
              <p className="text-sm text-gray-600">{t('features.highlights.detailedViews.description')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-white rounded-2xl shadow-md w-16 h-16 flex items-center justify-center">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('features.highlights.favorites.title')}</h3>
              <p className="text-sm text-gray-600">{t('features.highlights.favorites.description')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-white rounded-2xl shadow-md w-16 h-16 flex items-center justify-center">
                <Mail className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('features.highlights.directContact.title')}</h3>
              <p className="text-sm text-gray-600">{t('features.highlights.directContact.description')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-white rounded-2xl shadow-md w-16 h-16 flex items-center justify-center">
                <Camera className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('features.highlights.richMedia.title')}</h3>
              <p className="text-sm text-gray-600">{t('features.highlights.richMedia.description')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-white rounded-2xl shadow-md w-16 h-16 flex items-center justify-center">
                <Globe2 className="h-8 w-8 text-mint-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('features.highlights.multilangue.title')}</h3>
              <p className="text-sm text-gray-600">{t('features.highlights.multilangue.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialSection />

      {/* Comparison Section */}
      <ComparisonSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-viridial-600 via-viridial-500 to-viridial-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('features.cta.title')}
            </h2>
            <p className="text-xl mb-8 text-viridial-100">
              {t('features.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-white text-viridial-600 hover:bg-gray-100 px-8 py-6 text-lg">
                <Link href="/signup">
                  {t('features.cta.ctaPrimary')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                <Link href="/search">
                  {t('features.cta.ctaSecondary')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

