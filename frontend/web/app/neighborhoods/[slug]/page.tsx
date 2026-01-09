'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getNeighborhoodService, Neighborhood } from '@/lib/api/neighborhood';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin, TrendingUp, Users, Shield, Star, School, Train, ShoppingBag,
  UtensilsCrossed, Waves, Home, Building, LandPlot, Store, Activity, TreePine,
  ArrowLeft, Loader2, AlertCircle, ChevronRight
} from 'lucide-react';
import { useToast } from '@/components/ui/simple-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import Map component (client-side only)
const NeighborhoodMap = dynamic(() => import('@/components/neighborhood/NeighborhoodMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
      Chargement de la carte...
    </div>
  ),
});

export default function NeighborhoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadNeighborhood = async () => {
      try {
        setLoading(true);
        const currentService = getNeighborhoodService(); // Dynamically get service
        const data = await currentService.findBySlug(slug);
        setNeighborhood(data);
      } catch (error) {
        console.error('Error loading neighborhood:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les informations du quartier.',
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadNeighborhood();
    }
  }, [slug, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!neighborhood) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Quartier non trouvé</h2>
            <p className="text-gray-600 mb-6">
              Le quartier que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button onClick={() => router.push('/neighborhoods')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux quartiers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeLabels: Record<string, { fr: string; en: string; color: string }> = {
    residential: { fr: 'Résidentiel', en: 'Residential', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    commercial: { fr: 'Commerçant', en: 'Commercial', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    mixed: { fr: 'Mixte', en: 'Mixed', color: 'bg-viridial-100 text-viridial-800 border-viridial-200' },
    tourist: { fr: 'Touristique', en: 'Tourist', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    industrial: { fr: 'Industriel', en: 'Industrial', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  };

  const typeLabel = typeLabels[neighborhood.features?.type || 'mixed'] || typeLabels.mixed;
  const description = neighborhood.description.fr || neighborhood.description.en || '';

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const propertyTypeIcon = (type: string) => {
    switch (type) {
      case 'apartment':
        return <Building className="h-4 w-4" />;
      case 'house':
        return <Home className="h-4 w-4" />;
      case 'villa':
        return <Home className="h-4 w-4" />;
      case 'land':
        return <LandPlot className="h-4 w-4" />;
      case 'commercial':
        return <Store className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
        {neighborhood.mediaUrls && neighborhood.mediaUrls.length > 0 ? (
          <div className="relative h-full w-full">
            <Image
              src={neighborhood.mediaUrls[0]}
              alt={neighborhood.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ) : null}
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={typeLabel.color}>
                    {typeLabel.fr}
                  </Badge>
                  {neighborhood.features?.qualityOfLife && (
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        Qualité de vie {neighborhood.features.qualityOfLife}/10
                      </span>
                    </div>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {neighborhood.name}
                </h1>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">
                    {neighborhood.city}
                    {neighborhood.region && `, ${neighborhood.region}`}
                    {neighborhood.country && `, ${neighborhood.country}`}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/neighborhoods')}
                className="bg-white/90 backdrop-blur-sm hover:bg-white border-gray-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl">À propos du quartier</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </CardContent>
            </Card>

            {/* Statistics */}
            {neighborhood.stats && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Statistiques du marché
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {neighborhood.stats.propertyCount !== undefined && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{neighborhood.stats.propertyCount}</p>
                        <p className="text-sm text-gray-600">Propriétés</p>
                      </div>
                    )}
                    {neighborhood.stats.averagePriceOverall && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(neighborhood.stats.averagePriceOverall)}
                        </p>
                        <p className="text-sm text-gray-600">Prix moyen / m²</p>
                      </div>
                    )}
                    {neighborhood.stats.medianPrice && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(neighborhood.stats.medianPrice)}
                        </p>
                        <p className="text-sm text-gray-600">Prix médian / m²</p>
                      </div>
                    )}
                    {neighborhood.stats.minPrice && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(neighborhood.stats.minPrice)}
                        </p>
                        <p className="text-sm text-gray-600">Prix min</p>
                      </div>
                    )}
                    {neighborhood.stats.maxPrice && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(neighborhood.stats.maxPrice)}
                        </p>
                        <p className="text-sm text-gray-600">Prix max</p>
                      </div>
                    )}
                  </div>

                  {/* Average prices by type */}
                  {neighborhood.stats.averagePrice && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Prix moyen par type</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(neighborhood.stats.averagePrice).map(([type, price]) => (
                          price ? (
                            <div key={type} className="text-center p-3 bg-viridial-50 rounded-lg">
                              <div className="flex justify-center mb-2 text-primary">
                                {propertyTypeIcon(type)}
                              </div>
                              <p className="text-lg font-bold text-gray-900">{formatPrice(price)}</p>
                              <p className="text-xs text-gray-600 capitalize">{type}</p>
                            </div>
                          ) : null
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {neighborhood.features && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-2xl">Caractéristiques du quartier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Safety & Quality */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {neighborhood.features.safetyScore !== undefined && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Shield className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600">Sécurité</p>
                          <p className="text-xl font-bold text-gray-900">
                            {neighborhood.features.safetyScore}/10
                          </p>
                        </div>
                      </div>
                    )}
                    {neighborhood.features.qualityOfLife !== undefined && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Star className="h-6 w-6 text-yellow-500" />
                        <div>
                          <p className="text-sm text-gray-600">Qualité de vie</p>
                          <p className="text-xl font-bold text-gray-900">
                            {neighborhood.features.qualityOfLife}/10
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transport */}
                  {neighborhood.features.publicTransport && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Train className="h-5 w-5 text-blue-600" />
                        Transports en commun
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {neighborhood.features.publicTransport.metro && (
                          <Badge variant="outline" className="border-blue-300 text-blue-700">
                            Métro
                          </Badge>
                        )}
                        {neighborhood.features.publicTransport.tram && (
                          <Badge variant="outline" className="border-blue-300 text-blue-700">
                            Tramway
                          </Badge>
                        )}
                        {neighborhood.features.publicTransport.bus && (
                          <Badge variant="outline" className="border-blue-300 text-blue-700">
                            Bus
                          </Badge>
                        )}
                        {neighborhood.features.publicTransport.train && (
                          <Badge variant="outline" className="border-blue-300 text-blue-700">
                            Train
                          </Badge>
                        )}
                      </div>
                      {neighborhood.features.publicTransport.stations && 
                       neighborhood.features.publicTransport.stations.length > 0 && (
                        <p className="text-sm text-gray-600 mt-2">
                          Stations: {neighborhood.features.publicTransport.stations.join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Amenities */}
                  {neighborhood.features.amenities && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Équipements</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {neighborhood.features.amenities.schools !== undefined && (
                          <div className="flex items-center gap-2">
                            <School className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-gray-700">
                              {neighborhood.features.amenities.schools} écoles
                            </span>
                          </div>
                        )}
                        {neighborhood.features.amenities.hospitals !== undefined && (
                          <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-red-600" />
                            <span className="text-sm text-gray-700">
                              {neighborhood.features.amenities.hospitals} hôpital{neighborhood.features.amenities.hospitals > 1 ? 'aux' : ''}
                            </span>
                          </div>
                        )}
                        {neighborhood.features.amenities.parks !== undefined && (
                          <div className="flex items-center gap-2">
                            <TreePine className="h-5 w-5 text-primary" />
                            <span className="text-sm text-gray-700">
                              {neighborhood.features.amenities.parks} parc{neighborhood.features.amenities.parks > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        {neighborhood.features.amenities.shopping && (
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-purple-600" />
                            <span className="text-sm text-gray-700">Shopping</span>
                          </div>
                        )}
                        {neighborhood.features.amenities.restaurants && (
                          <div className="flex items-center gap-2">
                            <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                            <span className="text-sm text-gray-700">Restaurants</span>
                          </div>
                        )}
                        {neighborhood.features.amenities.beaches && (
                          <div className="flex items-center gap-2">
                            <Waves className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-gray-700">Plages</span>
                          </div>
                        )}
                        {neighborhood.features.amenities.sports && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Sports</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Demographics */}
                  {neighborhood.features.demographics && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Démographie</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {neighborhood.features.demographics.population && (
                          <div>
                            <p className="text-sm text-gray-600">Population</p>
                            <p className="text-lg font-bold text-gray-900">
                              {new Intl.NumberFormat('fr-FR').format(neighborhood.features.demographics.population)}
                            </p>
                          </div>
                        )}
                        {neighborhood.features.demographics.averageAge && (
                          <div>
                            <p className="text-sm text-gray-600">Âge moyen</p>
                            <p className="text-lg font-bold text-gray-900">
                              {neighborhood.features.demographics.averageAge} ans
                            </p>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {neighborhood.features.demographics.familyFriendly && (
                            <Badge variant="outline" className="border-viridial-300 text-viridial-700">
                              Familles
                            </Badge>
                          )}
                          {neighborhood.features.demographics.studentArea && (
                            <Badge variant="outline" className="border-blue-300 text-blue-700">
                              Étudiants
                            </Badge>
                          )}
                          {neighborhood.features.demographics.seniorFriendly && (
                            <Badge variant="outline" className="border-purple-300 text-purple-700">
                              Seniors
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Properties in this neighborhood */}
            {neighborhood.stats && neighborhood.stats.propertyCount !== undefined && neighborhood.stats.propertyCount > 0 && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-2xl">Propriétés dans ce quartier</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Découvrez les {neighborhood.stats.propertyCount} propriété{neighborhood.stats.propertyCount > 1 ? 's' : ''} disponible{neighborhood.stats.propertyCount > 1 ? 's' : ''} dans ce quartier.
                  </p>
                  <Link href={`/search?neighborhood=${neighborhood.slug}`}>
                    <Button className="bg-primary hover:bg-viridial-700 text-white">
                      Voir les propriétés
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map */}
            {neighborhood.centerLatitude && neighborhood.centerLongitude && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    Localisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <NeighborhoodMap
                    latitude={neighborhood.centerLatitude}
                    longitude={neighborhood.centerLongitude}
                    name={neighborhood.name}
                  />
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="border-gray-200 sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">En résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Type</span>
                    <Badge className={typeLabel.color}>
                      {typeLabel.fr}
                    </Badge>
                  </div>
                  {neighborhood.postalCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Code postal</span>
                      <span className="text-sm font-semibold text-gray-900">{neighborhood.postalCode}</span>
                    </div>
                  )}
                  {neighborhood.stats?.propertyCount !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Propriétés</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {neighborhood.stats.propertyCount}
                      </span>
                    </div>
                  )}
                  {neighborhood.stats?.averagePriceOverall && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prix moyen</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(neighborhood.stats.averagePriceOverall)}/m²
                      </span>
                    </div>
                  )}
                  {neighborhood.features?.safetyScore !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sécurité</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {neighborhood.features.safetyScore}/10
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Link href={`/search?neighborhood=${neighborhood.slug}`} className="w-full">
                    <Button className="w-full bg-primary hover:bg-viridial-700 text-white">
                      Rechercher dans ce quartier
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

