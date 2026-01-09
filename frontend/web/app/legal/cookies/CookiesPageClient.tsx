'use client';

import { useTranslation } from "@/contexts/I18nContext";
import { Cookie, Shield, Settings, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function CookiesPageClient() {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-viridial-600 via-viridial-500 to-teal-500 py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl animate-pulse"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-white relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6">
            <Cookie className="h-4 w-4" />
            Gestion des cookies
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t('cookies.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-viridial-50 max-w-3xl mx-auto">
            {t('cookies.hero.description')}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs
            items={[
              { label: t('cookies.breadcrumb.legal'), href: '/legal/privacy' },
              { label: t('cookies.breadcrumb.cookies') },
            ]}
          />

          <div className="space-y-8">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-viridial-600" />
                  {t('cookies.sections.whatAre.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('cookies.sections.whatAre.content')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-viridial-600" />
                  {t('cookies.sections.types.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {t('cookies.sections.types.essential.title')}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {t('cookies.sections.types.essential.description')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {t('cookies.sections.types.analytics.title')}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {t('cookies.sections.types.analytics.description')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {t('cookies.sections.types.marketing.title')}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {t('cookies.sections.types.marketing.description')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-viridial-600" />
                  {t('cookies.sections.management.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('cookies.sections.management.content')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 p-6 bg-viridial-50 rounded-lg border border-viridial-200">
            <p className="text-sm text-gray-600">
              <strong>{t('cookies.lastUpdated')}:</strong> {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {t('cookies.contact')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

