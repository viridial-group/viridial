'use client';

import { useTranslation } from "@/contexts/I18nContext";
import { FileText, CheckCircle, AlertCircle, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TermsPageClient() {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-viridial-600 via-viridial-500 to-teal-500 py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl animate-pulse"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6">
            <Scale className="h-4 w-4" />
            Conditions légales
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t('terms.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-viridial-50 max-w-3xl mx-auto">
            {t('terms.hero.description')}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <div className="space-y-8">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-viridial-600" />
                  {t('terms.sections.acceptance.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {t('terms.sections.acceptance.content')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-viridial-600" />
                  {t('terms.sections.useOfService.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('terms.sections.useOfService.content')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>{t('terms.sections.useOfService.items.legal')}</li>
                  <li>{t('terms.sections.useOfService.items.accurate')}</li>
                  <li>{t('terms.sections.useOfService.items.respect')}</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-viridial-600" />
                  {t('terms.sections.liability.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {t('terms.sections.liability.content')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-viridial-600" />
                  {t('terms.sections.changes.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {t('terms.sections.changes.content')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 p-6 bg-viridial-50 rounded-lg border border-viridial-200">
            <p className="text-sm text-gray-600">
              <strong>{t('terms.lastUpdated')}:</strong> {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {t('terms.contact')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

