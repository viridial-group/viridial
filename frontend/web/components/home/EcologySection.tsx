'use client';

import { Leaf, Droplets, Zap, Recycle, Trees, Building2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import EcologyIllustration from './EcologyIllustration';

export default function EcologySection() {
  const ecoFeatures = [
    {
      icon: <Leaf className="h-6 w-6 text-emerald-700" />,
      title: 'Éco-quartiers certifiés',
      description: 'Accédez à des données détaillées sur les quartiers écologiques, leurs certifications environnementales et leurs performances énergétiques.',
      gradient: 'from-emerald-50 via-green-50 to-teal-50',
      border: 'border-emerald-200/60',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500',
      hoverShadow: 'hover:shadow-emerald-200/50',
    },
    {
      icon: <Zap className="h-6 w-6 text-amber-700" />,
      title: 'Énergies renouvelables',
      description: 'Identifiez les propriétés équipées de panneaux solaires, éoliennes ou autres systèmes d\'énergie verte pour réduire votre empreinte carbone.',
      gradient: 'from-amber-50 via-yellow-50 to-orange-50',
      border: 'border-amber-200/60',
      iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
      hoverShadow: 'hover:shadow-amber-200/50',
    },
    {
      icon: <Droplets className="h-6 w-6 text-cyan-700" />,
      title: 'Gestion de l\'eau',
      description: 'Informations sur les systèmes de récupération d\'eau de pluie, jardins écologiques et infrastructures hydrauliques durables.',
      gradient: 'from-cyan-50 via-blue-50 to-sky-50',
      border: 'border-cyan-200/60',
      iconBg: 'bg-gradient-to-br from-cyan-400 to-blue-500',
      hoverShadow: 'hover:shadow-cyan-200/50',
    },
    {
      icon: <Recycle className="h-6 w-6 text-violet-700" />,
      title: 'Construction durable',
      description: 'Découvrez les matériaux écologiques, les normes de construction durable et les certifications environnementales des bâtiments.',
      gradient: 'from-violet-50 via-purple-50 to-fuchsia-50',
      border: 'border-violet-200/60',
      iconBg: 'bg-gradient-to-br from-violet-400 to-purple-500',
      hoverShadow: 'hover:shadow-violet-200/50',
    },
    {
      icon: <Trees className="h-6 w-6 text-green-700" />,
      title: 'Espaces verts',
      description: 'Analysez la présence de parcs, jardins partagés, toits végétalisés et la qualité de l\'air dans chaque quartier.',
      gradient: 'from-green-50 via-emerald-50 to-lime-50',
      border: 'border-green-200/60',
      iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
      hoverShadow: 'hover:shadow-green-200/50',
    },
    {
      icon: <Building2 className="h-6 w-6 text-teal-700" />,
      title: 'Transport durable',
      description: 'Informations sur les transports en commun, pistes cyclables, bornes de recharge électrique et accessibilité piétonne.',
      gradient: 'from-teal-50 via-cyan-50 to-sky-50',
      border: 'border-teal-200/60',
      iconBg: 'bg-gradient-to-br from-teal-400 to-cyan-500',
      hoverShadow: 'hover:shadow-teal-200/50',
    },
  ];

  const ecoStats = [
    { value: '500+', label: 'Propriétés éco-certifiées', icon: <Leaf className="h-5 w-5 text-white" /> },
    { value: '2.5T', label: 'CO₂ économisé par an', icon: <Recycle className="h-5 w-5 text-white" /> },
    { value: '80%', label: 'Énergies renouvelables', icon: <Zap className="h-5 w-5 text-white" /> },
    { value: '150+', label: 'Éco-quartiers référencés', icon: <Trees className="h-5 w-5 text-white" /> },
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-viridial-50 via-viridial-50/30 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-viridial-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-viridial-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-viridial-100 border border-viridial-300 text-viridial-700 text-sm font-semibold mb-6">
            <Leaf className="h-4 w-4" />
            Immobilier Durable
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Investir dans un avenir{' '}
            <span className="bg-gradient-to-r from-primary to-viridial-600 bg-clip-text text-transparent">
              plus vert
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez comment Viridial vous aide à identifier et promouvoir des propriétés durables, 
            contribuant ainsi à la transition écologique de l'immobilier.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* Left: Illustration */}
          <div className="order-2 lg:order-1">
            <EcologyIllustration />
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Notre engagement écologique
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Viridial s'engage à promouvoir un immobilier responsable en mettant en avant 
                  les propriétés et quartiers qui respectent les normes environnementales les plus strictes.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Nous facilitons l'identification de biens immobiliers durables, permettant aux acheteurs 
                  et investisseurs de faire des choix éclairés pour un avenir plus respectueux de l'environnement.
                </p>
              </div>

              {/* Eco Stats */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {ecoStats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-viridial-200/50 shadow-md hover:shadow-lg hover:border-viridial-300 transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-viridial-400 to-viridial-600 flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-viridial-700 group-hover:to-viridial-600 transition-all">
                        {stat.value}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{stat.label}</div>
                  </div>
                ))}
              </div>

              <Link href="/search">
                <button className="mt-6 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-viridial-600 hover:from-viridial-700 hover:to-viridial-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2">
                  Explorer les propriétés durables
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Eco Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ecoFeatures.map((feature, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden border-2 ${feature.border} bg-gradient-to-br ${feature.gradient} backdrop-blur-sm hover:shadow-xl ${feature.hoverShadow} transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group`}
            >
              {/* Decorative gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
              
              <CardHeader className="pb-3 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 backdrop-blur-sm`}>
                  <div className="text-white drop-shadow-sm">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-950 transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-700 leading-relaxed text-[15px] group-hover:text-gray-800 transition-colors">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="border-2 border-viridial-200 bg-gradient-to-br from-viridial-50 to-viridial-50">
            <CardContent className="p-8">
              <Leaf className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Rejoignez le mouvement vers un immobilier durable
              </h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Ensemble, construisons un avenir plus vert en favorisant les investissements 
                immobiliers responsables et durables.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <button className="px-6 py-3 bg-primary hover:bg-viridial-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2">
                    Commencer maintenant
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <Link href="/neighborhoods">
                  <button className="px-6 py-3 bg-white hover:bg-gray-50 text-viridial-700 font-semibold rounded-lg border-2 border-viridial-300 transition-all inline-flex items-center justify-center gap-2">
                    Découvrir les éco-quartiers
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
