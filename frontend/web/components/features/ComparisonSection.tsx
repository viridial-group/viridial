'use client';

import { CheckCircle2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const competitors = [
  {
    name: 'Viridial',
    tagline: 'Votre choix',
    features: {
      search: true,
      geolocation: true,
      analytics: true,
      eco: true,
      neighborhoods: true,
      leads: true,
      multiTenant: true,
      api: true,
    },
    highlight: true,
  },
  {
    name: 'Solution Classique',
    tagline: 'Limité',
    features: {
      search: true,
      geolocation: false,
      analytics: false,
      eco: false,
      neighborhoods: false,
      leads: false,
      multiTenant: false,
      api: false,
    },
    highlight: false,
  },
  {
    name: 'Autre Plateforme',
    tagline: 'Partiel',
    features: {
      search: true,
      geolocation: true,
      analytics: true,
      eco: false,
      neighborhoods: false,
      leads: true,
      multiTenant: true,
      api: false,
    },
    highlight: false,
  },
];

const featureLabels = {
  search: 'Recherche Intelligente',
  geolocation: 'Géolocalisation Auto',
  analytics: 'Analytics Avancés',
  eco: 'Immobilier Écologique',
  neighborhoods: 'Insights Quartiers',
  leads: 'Gestion Leads',
  multiTenant: 'Multi-tenant',
  api: 'API Complète',
};

export default function ComparisonSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Pourquoi choisir Viridial ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comparé aux autres solutions, Viridial offre une suite complète de fonctionnalités
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-900 border-b-2 border-gray-200">
                    Fonctionnalités
                  </th>
                  {competitors.map((competitor, index) => (
                    <th
                      key={index}
                      className={`text-center p-4 font-semibold border-b-2 ${
                        competitor.highlight
                          ? 'bg-viridial-50 text-viridial-900 border-viridial-300'
                          : 'text-gray-900 border-gray-200'
                      }`}
                    >
                      <div className="font-bold text-lg">{competitor.name}</div>
                      <div className="text-xs font-normal text-gray-600 mt-1">
                        {competitor.tagline}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(featureLabels).map(([key, label], featureIndex) => (
                  <tr
                    key={key}
                    className={featureIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="p-4 font-medium text-gray-900 border-b border-gray-200">
                      {label}
                    </td>
                    {competitors.map((competitor, compIndex) => (
                      <td
                        key={compIndex}
                        className={`text-center p-4 border-b border-gray-200 ${
                          competitor.highlight ? 'bg-viridial-50' : ''
                        }`}
                      >
                        {competitor.features[key as keyof typeof competitor.features] ? (
                          <CheckCircle2 className="h-6 w-6 text-primary mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            * Comparaison basée sur les fonctionnalités principales disponibles
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-viridial-700 transition-colors font-semibold"
            >
              Essayer gratuitement
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-semibold"
            >
              Contacter l'équipe
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

