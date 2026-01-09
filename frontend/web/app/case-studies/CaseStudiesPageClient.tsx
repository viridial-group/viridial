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
      <section className="bg-gradient-to-b from-viridial-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('case-studies.hero.title')}
          </h1>
          <p className="text-2xl text-viridial-600 font-semibold mb-4">
            {t('case-studies.hero.subtitle')}
          </p>
          <p className="text-xl text-gray-600">
            {t('case-studies.hero.description')}
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {['all', 'agencies', 'owners', 'enterprise', 'roi', 'automation', 'growth'].map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                onClick={() => setFilter(cat)}
                className={filter === cat ? "bg-viridial-600" : ""}
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
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('case-studies.results.title')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('case-studies.results.description')}
          </p>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto space-y-8">
          {filteredStudies.map((study) => (
            <Card key={study.id} className="border-2 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{study.title}</CardTitle>
                    <CardDescription className="text-base font-semibold text-gray-700">
                      {study.company}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {study.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="capitalize">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Défi</h4>
                    <p className="text-gray-600">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                    <p className="text-gray-600">{study.solution}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                  {study.results.map((result, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-viridial-600 mb-1">
                        {result.metric}
                      </div>
                      <div className="text-sm text-gray-600">{result.label}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 italic mb-2">"{study.testimonial}"</p>
                  <p className="text-sm text-gray-600 font-semibold">— {study.author}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-viridial-600 to-viridial-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            {t('case-studies.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('case-studies.cta.description')}
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-viridial-600 hover:bg-gray-100 text-lg px-8">
              {t('case-studies.cta.button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
