'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Viridial est-il gratuit ?',
    answer:
      'Oui, nous proposons un plan gratuit avec les fonctionnalités de base. Vous pouvez créer un compte et commencer à utiliser Viridial sans frais. Des plans payants sont disponibles pour accéder à des fonctionnalités avancées.',
  },
  {
    question: 'Comment fonctionne la géolocalisation automatique ?',
    answer:
      'Notre système utilise un service de géocodage dédié pour convertir automatiquement les adresses en coordonnées géographiques. Il suffit d\'entrer une adresse lors de la création d\'une propriété, et la localisation est calculée automatiquement.',
  },
  {
    question: 'Puis-je intégrer Viridial avec mon CRM existant ?',
    answer:
      'Oui, Viridial propose une API complète et une synchronisation avec les CRM populaires comme HubSpot. Les plans Pro et Enterprise incluent des intégrations prêtes à l\'emploi.',
  },
  {
    question: 'Qu\'est-ce qu\'un éco-quartier certifié ?',
    answer:
      'Les éco-quartiers sont des zones résidentielles conçues selon des principes de développement durable. Viridial identifie et documente ces quartiers avec leurs certifications, scores écologiques, et commodités durables.',
  },
  {
    question: 'Combien de propriétés puis-je gérer ?',
    answer:
      'Le nombre de propriétés dépend de votre plan. Le plan gratuit permet de gérer jusqu\'à 10 propriétés. Les plans payants offrent des quotas plus élevés, avec des options illimitées pour les grandes agences.',
  },
  {
    question: 'La plateforme est-elle disponible en plusieurs langues ?',
    answer:
      'Oui, Viridial supporte plusieurs langues (français, anglais, etc.) grâce à son système i18n intégré. Vous pouvez basculer entre les langues à tout moment.',
  },
  {
    question: 'Comment fonctionne le système de leads et de scoring ?',
    answer:
      'Notre système de gestion des leads collecte automatiquement les contacts et les interactions. Le scoring est calculé en fonction de critères personnalisables (engagement, budget, timeline) pour identifier les meilleures opportunités.',
  },
  {
    question: 'Puis-je essayer Viridial avant de m\'abonner ?',
    answer:
      'Absolument ! Créez un compte gratuit pour explorer toutes les fonctionnalités. Vous pouvez également demander une démonstration personnalisée avec notre équipe pour les plans Enterprise.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur Viridial
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="border-2 border-gray-200 hover:border-viridial-300 transition-all duration-200"
            >
              <CardContent className="p-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

