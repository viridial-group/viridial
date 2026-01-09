'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/contexts/I18nContext";
import Link from "next/link";
import { Leaf, Sparkles, Eye, Users, Rocket, ArrowRight, Heart, Shield, Zap, Globe, Home } from "lucide-react";

export function AboutPageClient() {
  const { t } = useTranslation();

  const values = [
    {
      icon: <Leaf className="h-8 w-8 text-viridial-600" />,
      title: t('about.mission.values.sustainability.title'),
      description: t('about.mission.values.sustainability.description'),
    },
    {
      icon: <Sparkles className="h-8 w-8 text-blue-600" />,
      title: t('about.mission.values.innovation.title'),
      description: t('about.mission.values.innovation.description'),
    },
    {
      icon: <Eye className="h-8 w-8 text-purple-600" />,
      title: t('about.mission.values.transparency.title'),
      description: t('about.mission.values.transparency.description'),
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: t('about.mission.values.accessibility.title'),
      description: t('about.mission.values.accessibility.description'),
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-viridial-600 via-viridial-500 to-teal-500 py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-8">
            <Leaf className="h-4 w-4" />
            Notre Mission
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            {t('about.hero.title')}
          </h1>
          <p className="text-2xl md:text-3xl text-viridial-50 font-semibold mb-6">
            {t('about.hero.subtitle')}
          </p>
          <p className="text-xl md:text-2xl text-viridial-100 max-w-3xl mx-auto leading-relaxed">
            {t('about.hero.description')}
          </p>
        </div>
      </section>

      {/* Mission Section - Enhanced */}
      <section className="py-20 lg:py-28 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('about.mission.title')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('about.mission.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="group border-2 border-gray-200 hover:border-viridial-300 hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white w-fit group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-viridial-600 transition-colors">
                    {value.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section - Enhanced */}
      <section className="py-20 lg:py-28 px-4 bg-gradient-to-br from-gray-50 via-white to-viridial-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-viridial-100 text-viridial-700 text-sm font-medium mb-6">
              <Rocket className="h-4 w-4" />
              Notre Histoire
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('about.story.title')}
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                {t('about.story.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Enhanced */}
      <section className="py-20 lg:py-28 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('about.team.title')}
            </h2>
            <p className="text-xl md:text-2xl text-viridial-600 font-semibold mb-4">
              {t('about.team.subtitle')}
            </p>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('about.team.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-2 border-gray-200 hover:border-viridial-300 hover:shadow-xl transition-all duration-300 group bg-white">
              <CardHeader>
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-viridial-100 to-viridial-200 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-14 w-14 text-viridial-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Développeurs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Experts en technologies modernes et architecture cloud
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group bg-white">
              <CardHeader>
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Sparkles className="h-14 w-14 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Designers UX/UI</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Créateurs d'expériences utilisateur exceptionnelles
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 group bg-white">
              <CardHeader>
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-100 to-green-200 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Home className="h-14 w-14 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Experts Immobiliers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Connaissance approfondie du marché et des enjeux durables
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="relative py-24 lg:py-32 px-4 bg-gradient-to-br from-viridial-600 via-viridial-500 via-teal-500 to-viridial-700 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-8 border border-white/30">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('about.cta.title')}
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-viridial-50 max-w-2xl mx-auto leading-relaxed">
            {t('about.cta.description')}
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-viridial-600 hover:bg-gray-50 text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all border-0">
              {t('about.cta.button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
