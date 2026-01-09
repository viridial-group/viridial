'use client';

import { Neighborhood } from '@/lib/api/neighborhood';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp, Users, Shield, Star, School, Train, ShoppingBag, UtensilsCrossed, Waves } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NeighborhoodCardProps {
  neighborhood: Neighborhood;
  language?: 'fr' | 'en';
  onClick?: () => void;
}

export default function NeighborhoodCard({ neighborhood, language = 'fr', onClick }: NeighborhoodCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const description = neighborhood.description[language] || neighborhood.description.fr || neighborhood.description.en || '';
  const typeLabels: Record<string, { fr: string; en: string; color: string }> = {
    residential: { fr: 'Résidentiel', en: 'Residential', color: 'bg-blue-100 text-blue-800' },
    commercial: { fr: 'Commerçant', en: 'Commercial', color: 'bg-purple-100 text-purple-800' },
    mixed: { fr: 'Mixte', en: 'Mixed', color: 'bg-viridial-100 text-viridial-800' },
    tourist: { fr: 'Touristique', en: 'Tourist', color: 'bg-orange-100 text-orange-800' },
    industrial: { fr: 'Industriel', en: 'Industrial', color: 'bg-gray-100 text-gray-800' },
  };

  const typeLabel = typeLabels[neighborhood.features?.type || 'mixed'] || typeLabels.mixed;
  const formattedPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/neighborhoods/${neighborhood.slug}`);
    }
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200 bg-white"
      onClick={handleCardClick}
    >
      {/* Image Header */}
      {neighborhood.mediaUrls && neighborhood.mediaUrls.length > 0 && !imageError ? (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            src={neighborhood.mediaUrls[0]}
            alt={neighborhood.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
          <div className="absolute top-3 right-3">
            <Badge className={typeLabel.color}>
              {typeLabel[language]}
            </Badge>
          </div>
          {neighborhood.features?.qualityOfLife && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-semibold text-gray-800">
                {neighborhood.features.qualityOfLife}/10
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center">
          <MapPin className="h-16 w-16 text-blue-300" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-200">
              {neighborhood.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1 text-sm text-gray-600">
              <MapPin className="h-3 w-3" />
              {neighborhood.city}
              {neighborhood.region && `, ${neighborhood.region}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Stats Grid */}
        {neighborhood.stats && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            {neighborhood.stats.averagePriceOverall && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-gray-500">Prix moyen</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formattedPrice(neighborhood.stats.averagePriceOverall)}/m²
                  </p>
                </div>
              </div>
            )}
            {neighborhood.stats.propertyCount !== undefined && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Propriétés</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {neighborhood.stats.propertyCount}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features Icons */}
        {neighborhood.features && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {neighborhood.features.amenities?.schools !== undefined && neighborhood.features.amenities.schools > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                <School className="h-3 w-3" />
                <span>{neighborhood.features.amenities.schools}</span>
              </div>
            )}
            {neighborhood.features.publicTransport?.metro && (
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                <Train className="h-3 w-3" />
                <span>Métro</span>
              </div>
            )}
            {neighborhood.features.amenities?.shopping && (
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                <ShoppingBag className="h-3 w-3" />
                <span>Shopping</span>
              </div>
            )}
            {neighborhood.features.amenities?.restaurants && (
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                <UtensilsCrossed className="h-3 w-3" />
                <span>Restos</span>
              </div>
            )}
            {neighborhood.features.amenities?.beaches && (
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                <Waves className="h-3 w-3" />
                <span>Plages</span>
              </div>
            )}
            {neighborhood.features.safetyScore && (
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                <Shield className="h-3 w-3 text-primary" />
                <span>Sécurité {neighborhood.features.safetyScore}/10</span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="outline"
          className="w-full mt-4 border-gray-300 hover:bg-viridial-50 hover:border-viridial-300 hover:text-viridial-700 transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          Voir le quartier
        </Button>
      </CardContent>
    </Card>
  );
}

