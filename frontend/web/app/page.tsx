'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  Search, Home as HomeIcon, MapPin, TrendingUp, Shield, Globe, 
  Zap, ArrowRight, CheckCircle2, Sparkles, Layers, Rocket, Star, Leaf
} from 'lucide-react';
import HeroIllustration from '@/components/home/HeroIllustration';
import FeatureIllustration from '@/components/home/FeatureIllustration';
import StatsSection from '@/components/home/StatsSection';
import HowItWorks from '@/components/home/HowItWorks';
import EcologySection from '@/components/home/EcologySection';
import {
  DashboardBackofficeSVG,
  PropertyManagementBackofficeSVG,
  AnalyticsBackofficeSVG,
  LeadManagementBackofficeSVG,
  SearchBackofficeSVG,
} from '@/components/home/BackofficeIllustrations';
import { useTranslation } from '@/contexts/I18nContext';
import { TrustSignals, SocialProofBadge, GuaranteeBadge } from '@/components/marketing/TrustSignals';

export default function Home() {
  const { t } = useTranslation();
  const colorClassMap: Record<string, string> = {
    green: 'bg-viridial-100 text-viridial-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  const features = [
    {
      icon: <Search className="h-6 w-6 text-viridial-600" />,
      illustration: <SearchBackofficeSVG className="w-full h-48 mx-auto mb-4" />,
      title: t('home.features.search.title'),
      description: t('home.features.search.description'),
      color: 'green',
      link: '/search',
      linkText: t('common.search'),
    },
    {
      icon: <HomeIcon className="h-6 w-6 text-blue-600" />,
      illustration: <PropertyManagementBackofficeSVG className="w-full h-48 mx-auto mb-4" />,
      title: t('home.features.manage.title'),
      description: t('home.features.manage.description'),
      color: 'blue',
      link: '/properties',
      linkText: t('home.features.manage.linkText'),
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      illustration: <AnalyticsBackofficeSVG className="w-full h-48 mx-auto mb-4" />,
      title: t('home.features.analytics.title'),
      description: t('home.features.analytics.description'),
      color: 'purple',
      link: '/dashboard',
      linkText: t('home.features.analytics.linkText'),
    },
    {
      icon: <Shield className="h-6 w-6 text-red-600" />,
      illustration: <FeatureIllustration type="secure" className="w-32 h-32 mx-auto mb-4" />,
      title: t('home.features.secure.title'),
      description: t('home.features.secure.description'),
      color: 'red',
    },
    {
      icon: <Globe className="h-6 w-6 text-orange-600" />,
      illustration: <FeatureIllustration type="global" className="w-32 h-32 mx-auto mb-4" />,
      title: t('home.features.global.title'),
      description: t('home.features.global.description'),
      color: 'orange',
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      illustration: <FeatureIllustration type="performance" className="w-32 h-32 mx-auto mb-4" />,
      title: t('home.features.performance.title'),
      description: t('home.features.performance.description'),
      color: 'yellow',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      
      <main id="main-content" className="flex-1">
        {/* Hero Section - Modern Design */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-viridial-50/30 py-20 lg:py-32">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-viridial-300 rounded-full opacity-10 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200 rounded-full opacity-5 blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-viridial-50 border border-viridial-200 text-viridial-700 text-sm font-medium mb-8 shadow-sm backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" />
                  {t('home.hero.badge1')}
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mint-50 border border-mint-200 text-viridial-700 text-sm font-medium mb-4 ml-3 shadow-sm backdrop-blur-sm">
                  <Leaf className="h-4 w-4" />
                  {t('home.hero.badge2')}
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  {t('home.hero.title1')}
                  <span className="block bg-gradient-to-r from-viridial-500 via-viridial-600 to-viridial-700 bg-clip-text text-transparent">
                    {t('home.hero.title2')}
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  {t('home.hero.description')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8">
                  <Link href="/signup">
                    <Button size="lg" className="bg-gradient-to-r from-viridial-500 via-viridial-600 to-viridial-700 hover:from-viridial-600 hover:via-viridial-700 hover:to-viridial-800 text-white border-0 px-8 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                      {t('home.hero.ctaPrimary')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/browse">
                    <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:bg-gray-50 px-8 h-14 text-base font-semibold">
                      {t('home.hero.ctaSecondary')}
                    </Button>
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-viridial-600" />
                    <span className="font-medium">{t('home.trustIndicators.noCommitment')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-viridial-600" />
                    <span className="font-medium">{t('home.trustIndicators.freeTrial')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-viridial-600" />
                    <span className="font-medium">{t('home.trustIndicators.support24')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-viridial-500" />
                    <span className="font-medium">{t('home.trustIndicators.sustainableRealEstate')}</span>
                  </div>
                </div>
                
                {/* Social Proof Badge */}
                <div className="mt-6">
                  <SocialProofBadge />
                </div>
              </div>

              {/* Right: Hero Illustration */}
              <div className="relative lg:order-2">
                <div className="relative">
                  <HeroIllustration />
                  {/* Floating badges */}
                  <div className="absolute top-10 right-10 bg-white rounded-xl shadow-xl p-4 border border-gray-200 animate-float">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-viridial-100 flex items-center justify-center">
                        <Rocket className="h-5 w-5 text-viridial-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">{t('home.hero.searchSpeed')}</div>
                        <div className="text-sm font-bold text-gray-900">&lt; 100ms</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-20 left-10 bg-white rounded-xl shadow-xl p-4 border border-gray-200 animate-float" style={{ animationDelay: '1s' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">{t('home.hero.neighborhoods')}</div>
                        <div className="text-sm font-bold text-gray-900">150+ {t('home.hero.cities')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-32 left-10 bg-gradient-to-br from-mint-50 to-viridial-50 rounded-xl shadow-xl p-4 border-2 border-mint-200 animate-float" style={{ animationDelay: '2s' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-mint-100 flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-viridial-600" />
                      </div>
                      <div>
                        <div className="text-xs text-viridial-700 font-medium">{t('home.hero.ecoCertified')}</div>
                        <div className="text-sm font-bold text-gray-900">500+ {t('home.hero.ecoProperties')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <StatsSection />

        {/* Features Section - Enhanced */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                {t('home.features.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="group border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                >
                  <CardHeader className="pb-4">
                    <div className="mb-4 bg-gray-50 rounded-lg p-4">
                      {feature.illustration}
                    </div>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colorClassMap[feature.color]} mb-4`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  {feature.link && (
                    <CardContent className="pt-0">
                      <Link href={feature.link} className="text-viridial-600 hover:text-viridial-700 font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        {feature.linkText}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Ecology Section */}
        <EcologySection />

        {/* Social Proof / Testimonials */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {t('home.testimonials.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('home.testimonials.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: t('home.testimonials.sophie.name'),
                  role: t('home.testimonials.sophie.role'),
                  company: t('home.testimonials.sophie.company'),
                  content: t('home.testimonials.sophie.content'),
                  rating: 5,
                },
                {
                  name: t('home.testimonials.jean.name'),
                  role: t('home.testimonials.jean.role'),
                  company: t('home.testimonials.jean.company'),
                  content: t('home.testimonials.jean.content'),
                  rating: 5,
                },
                {
                  name: t('home.testimonials.marie.name'),
                  role: t('home.testimonials.marie.role'),
                  company: t('home.testimonials.marie.company'),
                  content: t('home.testimonials.marie.content'),
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <Card key={index} className="border border-gray-200 bg-white hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Enhanced */}
        <section className="py-20 lg:py-32 bg-gradient-to-br from-viridial-600 via-viridial-500 via-teal-500 to-viridial-700 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {t('home.cta.title')}
              </h2>
              <p className="text-lg md:text-xl text-viridial-50 mb-10 max-w-2xl mx-auto leading-relaxed">
                {t('home.cta.description')}
              </p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Leaf className="h-5 w-5 text-viridial-100" />
                <p className="text-sm text-viridial-100 font-medium">{t('home.cta.ecoCommitment')}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-viridial-600 hover:bg-gray-50 border-0 px-8 h-14 text-base font-semibold shadow-xl hover:shadow-2xl transition-all">
                    {t('home.cta.ctaPrimary')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 h-14 text-base font-semibold">
                    {t('home.cta.ctaSecondary')}
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-viridial-100 mt-6 mb-8">
                {t('home.cta.features')}
              </p>
              
              {/* Trust Signals */}
              <div className="mt-8 pt-8 border-t border-white/20">
                <TrustSignals className="max-w-4xl mx-auto" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

