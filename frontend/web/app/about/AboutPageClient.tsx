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
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-viridial-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t('about.hero.title')}
          </h1>
          <p className="text-2xl text-viridial-600 font-semibold mb-4">
            {t('about.hero.subtitle')}
          </p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('about.hero.description')}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('about.mission.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.mission.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {values.map((value, index) => (
              <Card key={index} className="border-2 hover:border-viridial-200 transition-colors">
                <CardHeader>
                  <div className="mb-4">{value.icon}</div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('about.story.title')}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {t('about.story.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('about.team.title')}
            </h2>
            <p className="text-xl text-viridial-600 font-semibold mb-4">
              {t('about.team.subtitle')}
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('about.team.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <Card className="text-center border-2">
              <CardHeader>
                <div className="w-24 h-24 rounded-full bg-viridial-100 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-12 w-12 text-viridial-600" />
                </div>
                <CardTitle>Développeurs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Experts en technologies modernes et architecture cloud
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2">
              <CardHeader>
                <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle>Designers UX/UI</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Créateurs d'expériences utilisateur exceptionnelles
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2">
              <CardHeader>
                <div className="w-24 h-24 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                  <Home className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle>Experts Immobiliers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connaissance approfondie du marché et des enjeux durables
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-viridial-600 to-viridial-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            {t('about.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('about.cta.description')}
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-viridial-600 hover:bg-gray-100 text-lg px-8">
              {t('about.cta.button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
