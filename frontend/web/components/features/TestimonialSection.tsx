'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sophie Martin',
    role: 'Directrice',
    company: 'ImmoLux Paris',
    avatar: '👩‍💼',
    rating: 5,
    text: 'Viridial a transformé notre façon de gérer nos propriétés. La recherche intelligente et les insights sur les quartiers nous font gagner un temps précieux.',
  },
  {
    name: 'Jean Dupont',
    role: 'Propriétaire',
    company: 'Immobilier Privé',
    avatar: '👨‍💻',
    rating: 5,
    text: 'Interface intuitive, géolocalisation automatique, tout est pensé pour simplifier la mise en ligne de nos biens. La fonctionnalité éco-certification est un vrai plus !',
  },
  {
    name: 'Marie Leroy',
    role: 'Rechercheuse',
    company: 'Particulier',
    avatar: '🔍',
    rating: 5,
    text: 'J\'ai trouvé ma nouvelle maison grâce à Viridial ! La carte interactive et les filtres écologiques m\'ont permis de trouver exactement ce que je cherchais.',
  },
  {
    name: 'Thomas Bernard',
    role: 'CEO',
    company: 'AgencyPro',
    avatar: '👔',
    rating: 5,
    text: 'La gestion multi-utilisateurs et les analytics nous permettent de suivre nos performances en temps réel. Un outil indispensable pour notre agence.',
  },
];

export default function TestimonialSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Des milliers d'agences et de propriétaires nous font confiance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-2 border-gray-200 hover:border-viridial-300 hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-primary mb-4 opacity-50" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  &quot;{testimonial.text}&quot;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {testimonial.role} • {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

