'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/I18nContext";
import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Zap, DollarSign, Clock, Target } from "lucide-react";

export function CaseStudiesPageClient() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>('all');

  // Sample case studies - in real app, these would come from API
  const caseStudies = [
    {
      id: 1,
      title: "Agence Immobilière Paris - +45% de leads qualifiés",
      company: "Paris Immobilier Premium",
      category: "agencies",
      tags: ["roi", "automation", "growth"],
      challenge: "Gestion manuelle des leads, perte de temps sur les tâches répétitives",
      solution: "Implémentation complète de Viridial avec scoring automatique des leads",
      results: [
        { metric: "+45%", label: "Leads qualifiés" },
        { metric: "-60%", label: "Temps administratif" },
        { metric: "3 mois", label: "ROI" },
      ],
      testimonial: "Viridial a révolutionné notre façon de travailler. Le scoring automatique des leads nous permet de nous concentrer sur les clients les plus prometteurs.",
      author: "Jean Dupont, Directeur",
    },
    {
      id: 2,
      title: "Groupe Immobilier - Automatisation complète",
      company: "Groupe Immobilier Lyon",
      category: "enterprise",
      tags: ["automation", "growth"],
      challenge: "Multiples systèmes non connectés, données fragmentées",
      solution: "Migration vers Viridial avec intégration CRM et workflow automatisé",
      results: [
        { metric: "+80%", label: "Efficacité opérationnelle" },
        { metric: "-50%", label: "Coûts opérationnels" },
        { metric: "6 mois", label: "ROI" },
      ],
      testimonial: "L'unification de nos outils avec Viridial a transformé notre productivité. Nous gérons maintenant 3x plus de propriétés avec la même équipe.",
      author: "Marie Laurent, CEO",
    },
    {
      id: 3,
      title: "Propriétaire indépendant - Croissance rapide",
      company: "Immobilier Premium",
      category: "owners",
      tags: ["growth", "roi"],
      challenge: "Difficulté à promouvoir ses biens efficacement",
      solution: "Utilisation de Viridial pour publication et analytics avancés",
      results: [
        { metric: "+120%", label: "Visites de propriétés" },
        { metric: "+65%", label: "Taux de conversion" },
        { metric: "2 mois", label: "ROI" },
      ],
      testimonial: "En tant que propriétaire indépendant, Viridial m'a donné les outils d'une grande agence. Mes biens se vendent maintenant beaucoup plus vite.",
      author: "Pierre Martin, Propriétaire",
    },
  ];

  const filteredStudies = filter === 'all' 
    ? caseStudies 
    : caseStudies.filter(study => study.category === filter || study.tags.includes(filter));

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
            <Target className="h-4 w-4" />
            {t('case-studies.hero.subtitle')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t('case-studies.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-viridial-50 max-w-3xl mx-auto">
            {t('case-studies.hero.description')}
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="sticky top-0 z-40 py-6 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {['all', 'agencies', 'owners', 'enterprise', 'roi', 'automation', 'growth'].map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                onClick={() => setFilter(cat)}
                className={`transition-all ${
                  filter === cat 
                    ? "bg-viridial-600 hover:bg-viridial-700 text-white shadow-lg scale-105" 
                    : "hover:bg-viridial-50 hover:border-viridial-300"
                }`}
              >
                {cat === 'all' ? t('case-studies.filter.all') :
                 cat === 'agencies' ? t('case-studies.filter.agencies') :
                 cat === 'owners' ? t('case-studies.filter.owners') :
                 cat === 'enterprise' ? t('case-studies.filter.enterprise') :
                 cat === 'roi' ? t('case-studies.filter.roi') :
                 cat === 'automation' ? t('case-studies.filter.automation') :
                 t('case-studies.filter.growth')}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-viridial-100 text-viridial-700 text-sm font-medium mb-4">
            <TrendingUp className="h-4 w-4" />
            {t('case-studies.results.title')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('case-studies.results.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('case-studies.results.description')}
          </p>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto space-y-8">
          {filteredStudies.length === 0 ? (
            <Card className="border-2 border-gray-200 bg-white shadow-lg">
              <CardContent className="pt-12 pb-12 text-center">
                <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('case-studies.empty.title')}
                </h3>
                <p className="text-gray-600">
                  {t('case-studies.empty.description')}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredStudies.map((study, index) => (
              <Card 
                key={study.id} 
                className="group border-2 border-gray-200 hover:border-viridial-300 hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="bg-gradient-to-r from-viridial-50 to-teal-50 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl md:text-3xl mb-2 text-gray-900 group-hover:text-viridial-700 transition-colors">
                        {study.title}
                      </CardTitle>
                      <CardDescription className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <Users className="h-4 w-4 text-viridial-600" />
                        {study.company}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {study.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          className={`capitalize border-0 ${
                            tag === 'roi' ? 'bg-green-100 text-green-700' :
                            tag === 'automation' ? 'bg-blue-100 text-blue-700' :
                            tag === 'growth' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tag === 'roi' ? t('case-studies.filter.roi') :
                           tag === 'automation' ? t('case-studies.filter.automation') :
                           tag === 'growth' ? t('case-studies.filter.growth') :
                           tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-red-500" />
                        {t('case-studies.sections.challenge')}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{study.challenge}</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-green-500" />
                        {t('case-studies.sections.solution')}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{study.solution}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                    {study.results.map((result, resultIndex) => (
                      <div 
                        key={resultIndex} 
                        className="text-center p-4 bg-gradient-to-br from-viridial-50 to-teal-50 rounded-lg border border-viridial-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="text-4xl font-bold text-viridial-600 mb-2">
                          {result.metric}
                        </div>
                        <div className="text-sm font-medium text-gray-700">{result.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-viridial-50 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-viridial-600 flex items-center justify-center text-white font-bold text-lg">
                        {study.author.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 italic mb-3 leading-relaxed text-lg">
                          "{study.testimonial}"
                        </p>
                        <p className="text-sm font-semibold text-gray-600">— {study.author}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 bg-gradient-to-r from-viridial-600 via-viridial-500 to-teal-500 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full opacity-10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-white rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6">
            <TrendingUp className="h-4 w-4" />
            {t('case-studies.hero.subtitle')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('case-studies.cta.title')}
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto">
            {t('case-studies.cta.description')}
          </p>
          <Link href="/contact">
            <Button 
              size="lg" 
              className="bg-white text-viridial-600 hover:bg-gray-50 text-lg px-10 py-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group"
            >
              {t('case-studies.cta.button')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
