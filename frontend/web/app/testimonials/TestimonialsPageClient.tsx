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
      <section className="relative bg-gradient-to-br from-viridial-600 via-viridial-500 to-teal-500 py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6">
            <Quote className="h-4 w-4" />
            {t('testimonials.hero.subtitle')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t('testimonials.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-viridial-50 max-w-3xl mx-auto">
            {t('testimonials.hero.description')}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('testimonials.stats.title')}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="text-center border-2 border-gray-200 hover:border-viridial-300 hover:shadow-xl transition-all duration-300 bg-white group"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <CardTitle className="text-4xl md:text-5xl font-bold text-viridial-600 mb-2">
                    {stat.value}
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-gray-700">
                    {stat.label}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="sticky top-0 z-40 py-6 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {['all', 'agencies', 'owners', 'enterprise'].map((cat) => (
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
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          {filteredTestimonials.length === 0 ? (
            <Card className="border-2 border-gray-200 bg-white shadow-lg">
              <CardContent className="pt-12 pb-12 text-center">
                <Quote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('testimonials.empty.title')}
                </h3>
                <p className="text-gray-600">
                  {t('testimonials.empty.description')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredTestimonials.map((testimonial, index) => (
                <Card 
                  key={testimonial.id} 
                  className="group border-2 border-gray-200 hover:border-viridial-300 hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="bg-gradient-to-r from-viridial-50 to-teal-50 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-viridial-600 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {testimonial.avatar}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900 mb-1">
                            {testimonial.name}
                          </CardTitle>
                          <CardDescription className="text-sm font-medium text-gray-600">
                            {testimonial.role}
                            {testimonial.company && ` • ${testimonial.company}`}
                          </CardDescription>
                        </div>
                      </div>
                      <Quote className="h-10 w-10 text-viridial-300 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-700 leading-relaxed text-base italic relative pl-4 border-l-4 border-viridial-300">
                      "{testimonial.text}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
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
            <Award className="h-4 w-4" />
            Rejoignez nos clients satisfaits
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('testimonials.cta.title')}
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto">
            {t('testimonials.cta.description')}
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              className="bg-white text-viridial-600 hover:bg-gray-50 text-lg px-10 py-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group"
            >
              {t('testimonials.cta.button')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
