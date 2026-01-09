'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/I18nContext";
import { ChevronDown, ChevronUp, HelpCircle, Search, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function FAQPageClient() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'general',
      questions: [
        {
          q: t('faq.general.whatIsViridial.q'),
          a: t('faq.general.whatIsViridial.a'),
        },
        {
          q: t('faq.general.howItWorks.q'),
          a: t('faq.general.howItWorks.a'),
        },
        {
          q: t('faq.general.whoCanUse.q'),
          a: t('faq.general.whoCanUse.a'),
        },
      ],
    },
    {
      category: 'pricing',
      questions: [
        {
          q: t('faq.pricing.freeTrial.q'),
          a: t('faq.pricing.freeTrial.a'),
        },
        {
          q: t('faq.pricing.pricingPlans.q'),
          a: t('faq.pricing.pricingPlans.a'),
        },
        {
          q: t('faq.pricing.cancelAnytime.q'),
          a: t('faq.pricing.cancelAnytime.a'),
        },
      ],
    },
    {
      category: 'features',
      questions: [
        {
          q: t('faq.features.propertySearch.q'),
          a: t('faq.features.propertySearch.a'),
        },
        {
          q: t('faq.features.ecoQuartiers.q'),
          a: t('faq.features.ecoQuartiers.a'),
        },
        {
          q: t('faq.features.analytics.q'),
          a: t('faq.features.analytics.a'),
        },
      ],
    },
    {
      category: 'technical',
      questions: [
        {
          q: t('faq.technical.integration.q'),
          a: t('faq.technical.integration.a'),
        },
        {
          q: t('faq.technical.dataSecurity.q'),
          a: t('faq.technical.dataSecurity.a'),
        },
        {
          q: t('faq.technical.support.q'),
          a: t('faq.technical.support.a'),
        },
      ],
    },
  ];

  const allQuestions = faqs.flatMap(category => 
    category.questions.map((item, index) => ({
      ...item,
      category: category.category,
      globalIndex: faqs.slice(0, faqs.indexOf(category)).reduce((acc, cat) => acc + cat.questions.length, 0) + index,
    }))
  );

  const filteredFAQs = searchQuery
    ? allQuestions.filter(item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allQuestions;

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-viridial-600 via-viridial-500 to-teal-500 py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6">
            <HelpCircle className="h-4 w-4" />
            {t('faq.hero.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t('faq.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-viridial-50 max-w-3xl mx-auto mb-8">
            {t('faq.hero.description')}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t('faq.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg bg-white/95 backdrop-blur-sm border-white/30 text-gray-900 placeholder-gray-500 focus:bg-white"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length === 0 ? (
            <Card className="border-2 border-gray-200 bg-white shadow-lg">
              <CardContent className="pt-12 pb-12 text-center">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('faq.empty.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('faq.empty.description')}
                </p>
                <Link href="/contact">
                  <Button className="bg-viridial-600 hover:bg-viridial-700 text-white">
                    <Mail className="mr-2 h-4 w-4" />
                    {t('faq.empty.contactButton')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {faqs.map((category, categoryIndex) => {
                const categoryQuestions = category.questions
                  .map((item, index) => {
                    const globalIndex = faqs.slice(0, categoryIndex).reduce((acc, cat) => acc + cat.questions.length, 0) + index;
                    return { ...item, globalIndex };
                  })
                  .filter(item => 
                    !searchQuery || 
                    item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.a.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                if (categoryQuestions.length === 0) return null;

                return (
                  <div key={category.category} className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 capitalize">
                      {t(`faq.categories.${category.category}`)}
                    </h2>
                    <div className="space-y-4">
                      {categoryQuestions.map((item) => (
                        <Card
                          key={item.globalIndex}
                          className="border-2 border-gray-200 hover:border-viridial-300 hover:shadow-lg transition-all duration-300 bg-white"
                        >
                          <CardHeader
                            className="cursor-pointer"
                            onClick={() => toggleQuestion(item.globalIndex)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <CardTitle className="text-lg font-semibold text-gray-900 pr-8">
                                {item.q}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleQuestion(item.globalIndex);
                                }}
                              >
                                {openIndex === item.globalIndex ? (
                                  <ChevronUp className="h-5 w-5 text-viridial-600" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          {openIndex === item.globalIndex && (
                            <CardContent className="pt-0 pb-6">
                              <div className="pl-4 border-l-4 border-viridial-300">
                                <p className="text-gray-700 leading-relaxed">
                                  {item.a}
                                </p>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-viridial-600 via-viridial-500 to-teal-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('faq.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-95">
            {t('faq.cta.description')}
          </p>
          <Link href="/contact">
            <Button 
              size="lg" 
              className="bg-white text-viridial-600 hover:bg-gray-50 text-lg px-10 py-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group"
            >
              {t('faq.cta.button')}
              <Mail className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

