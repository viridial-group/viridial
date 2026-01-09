'use client';

import { TrendingUp, Home, MapPin, Users, Leaf } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    {
      icon: <Home className="h-8 w-8 text-primary" />,
      value: '10,000+',
      label: 'Propriétés gérées',
      change: '+25% ce mois',
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      value: '2,500+',
      label: 'Utilisateurs actifs',
      change: '+18% ce mois',
    },
    {
      icon: <MapPin className="h-8 w-8 text-purple-600" />,
      value: '150+',
      label: 'Villes couvertes',
      change: 'Croissance continue',
    },
    {
      icon: <Leaf className="h-8 w-8 text-viridial-600" />,
      value: '500+',
      label: 'Propriétés éco-certifiées',
      change: 'Immobilier durable',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-viridial-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md group-hover:shadow-lg transition-shadow mb-4 mx-auto border border-gray-100">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-primary font-medium">
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
