'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/I18nContext";
import Link from "next/link";
import { Star, Quote, ArrowRight, TrendingUp, Users, Award, Zap } from "lucide-react";

export function TestimonialsPageClient() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>('all');

  const stats = [
    {
      icon: <TrendingUp className="h-8 w-8 text-viridial-600" />,
      value: t('testimonials.stats.satisfaction.value'),
      label: t('testimonials.stats.satisfaction.label'),
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      value: t('testimonials.stats.clients.value'),
      label: t('testimonials.stats.clients.label'),
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      value: t('testimonials.stats.roi.value'),
      label: t('testimonials.stats.roi.label'),
    },
    {
      icon: <Award className="h-8 w-8 text-orange-600" />,
      value: t('testimonials.stats.uptime.value'),
      label: t('testimonials.stats.uptime.label'),
    },
  ];

  // Sample testimonials - in real app, these would come from API
  const testimonials = [
    {
      id: 1,
      name: "Jean Dupont",
      role: "Directeur Agence Immobilière",
      company: "Paris Immobilier",
      category: "agencies",
      rating: 5,
      text: "Viridial a transformé notre façon de gérer nos propriétés. L'interface est intuitive et les analytics nous aident à prendre de meilleures décisions. ROI impressionnant en seulement 3 mois.",
      avatar: "JD",
    },
    {
      id: 2,
      name: "Marie Laurent",
      role: "Propriétaire",
      category: "owners",
      rating: 5,
      text: "En tant que propriétaire, j'apprécie la simplicité de la plateforme. Publier mes biens est devenu un jeu d'enfant, et je reçois beaucoup plus de contacts qualifiés.",
      avatar: "ML",
    },
    {
      id: 3,
      name: "Pierre Martin",
      role: "CEO",
      company: "Immobilier Premium",
      category: "enterprise",
      rating: 5,
      text: "Plan Enterprise personnalisé qui répond parfaitement à nos besoins. L'équipe dédiée est toujours là pour nous aider. Investissement qui en vaut vraiment la peine.",
      avatar: "PM",
    },
    {
      id: 4,
      name: "Sophie Bernard",
      role: "Responsable Marketing",
      company: "Agence Lyon",
      category: "agencies",
      rating: 5,
      text: "La gestion des leads est devenue tellement plus simple. Le scoring automatique nous fait gagner des heures chaque semaine. Support excellent et réactif.",
      avatar: "SB",
    },
  ];

  const filteredTestimonials = filter === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.category === filter);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-viridial-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('testimonials.hero.title')}
          </h1>
          <p className="text-2xl text-viridial-600 font-semibold mb-4">
            {t('testimonials.hero.subtitle')}
          </p>
          <p className="text-xl text-gray-600">
            {t('testimonials.hero.description')}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-2">
                <CardHeader>
                  <div className="flex justify-center mb-2">{stat.icon}</div>
                  <CardTitle className="text-3xl font-bold text-viridial-600">
                    {stat.value}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {stat.label}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {['all', 'agencies', 'owners', 'enterprise'].map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                onClick={() => setFilter(cat)}
                className={filter === cat ? "bg-viridial-600" : ""}
              >
                {cat === 'all' ? t('testimonials.filter.all') : 
                 cat === 'agencies' ? t('testimonials.categories.agencies') :
                 cat === 'owners' ? t('testimonials.categories.owners') :
                 t('testimonials.categories.enterprise')}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-viridial-100 flex items-center justify-center text-viridial-600 font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <CardDescription>
                          {testimonial.role}
                          {testimonial.company && ` • ${testimonial.company}`}
                        </CardDescription>
                      </div>
                    </div>
                    <Quote className="h-8 w-8 text-viridial-200" />
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-viridial-600 to-viridial-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            {t('testimonials.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('testimonials.cta.description')}
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-viridial-600 hover:bg-gray-100 text-lg px-8">
              {t('testimonials.cta.button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
