'use client';

import { Search, Plus, BarChart3, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: <Search className="h-6 w-6" />,
      title: 'Recherchez',
      description: 'Utilisez notre moteur de recherche avancé avec filtres géographiques et carte interactive pour trouver la propriété idéale.',
      color: 'green',
    },
    {
      number: '02',
      icon: <Plus className="h-6 w-6" />,
      title: 'Ajoutez',
      description: 'Créez et gérez vos propriétés facilement avec géolocalisation automatique et upload de médias multiples.',
      color: 'blue',
    },
    {
      number: '03',
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Analysez',
      description: 'Accédez à des insights détaillés sur les quartiers, les prix du marché et les tendances immobilières.',
      color: 'purple',
    },
    {
      number: '04',
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: 'Optimisez',
      description: 'Publiez et promouvez vos propriétés avec notre système de workflow et outils de gestion avancés.',
      color: 'orange',
    },
  ];

  const colorClasses = {
    green: 'bg-viridial-100 text-primary border-viridial-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
  };

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Comment ça fonctionne
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Une plateforme intuitive pour gérer votre activité immobilière en quelques étapes simples
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-viridial-200 via-blue-200 via-purple-200 to-orange-200 z-0" />

          {steps.map((step, index) => (
            <div key={index} className="relative z-10">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Step number */}
                <div className="text-6xl font-bold text-gray-100 mb-4 leading-none">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl border-2 mb-6 ${colorClasses[step.color as keyof typeof colorClasses]}`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
