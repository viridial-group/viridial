'use client';

import { useState, useEffect, useMemo } from 'react';
import { PropertySearchResult } from '@/lib/api/search';
import { getNeighborhoodService } from '@/lib/api/neighborhood';
import type { Neighborhood } from '@/lib/api/neighborhood';
import { X, MapPin, School, Building2, Train, ShoppingBag, UtensilsCrossed, Trees, Waves, ChevronDown, ChevronUp, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import Map component
const PropertyQuickDetailMap = dynamic(() => import('@/components/search/PropertyQuickDetailMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm border border-gray-200 animate-pulse">
      Chargement de la carte...
    </div>
  ),
});

interface POIFloatingPanelProps {
  property: PropertySearchResult | null;
  onClose: () => void;
}

interface POI {
  type: 'school' | 'hospital' | 'metro' | 'shopping' | 'restaurant' | 'park' | 'beach';
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}

export default function POIFloatingPanel({ property, onClose }: POIFloatingPanelProps) {
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [isLoadingNeighborhood, setIsLoadingNeighborhood] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMap, setShowMap] = useState(false);

  // Load neighborhood data
  useEffect(() => {
    if (property?.neighborhoodSlug) {
      setIsLoadingNeighborhood(true);
      const service = getNeighborhoodService();
      service.findBySlug(property.neighborhoodSlug)
        .then((data) => {
          setNeighborhood(data);
        })
        .catch(() => {
          setNeighborhood(null);
        })
        .finally(() => {
          setIsLoadingNeighborhood(false);
        });
    } else {
      setNeighborhood(null);
    }
  }, [property?.neighborhoodSlug]);

  // Generate POI list from neighborhood data
  const pois = useMemo<POI[]>(() => {
    if (!neighborhood?.features) return [];

    const poiList: POI[] = [];

    if (neighborhood.features.amenities?.schools) {
      poiList.push({
        type: 'school',
        icon: <School className="h-4 w-4" />,
        label: 'Écoles',
        count: neighborhood.features.amenities.schools,
        color: '#3B82F6',
      });
    }

    if (neighborhood.features.amenities?.hospitals) {
      poiList.push({
        type: 'hospital',
        icon: <Building2 className="h-4 w-4" />,
        label: 'Hôpitaux',
        count: neighborhood.features.amenities.hospitals,
        color: '#EF4444',
      });
    }

    if (neighborhood.features.publicTransport?.metro || 
        neighborhood.features.publicTransport?.tram || 
        neighborhood.features.publicTransport?.bus || 
        neighborhood.features.publicTransport?.train) {
      const stationCount = neighborhood.features.publicTransport.stations?.length || 0;
      poiList.push({
        type: 'metro',
        icon: <Train className="h-4 w-4" />,
        label: 'Transports',
        count: stationCount || 1,
        color: '#8B5CF6',
      });
    }

    if (neighborhood.features.amenities?.parks) {
      poiList.push({
        type: 'park',
        icon: <Trees className="h-4 w-4" />,
        label: 'Parcs',
        count: neighborhood.features.amenities.parks,
        color: '#10B981',
      });
    }

    if (neighborhood.features.amenities?.shopping) {
      poiList.push({
        type: 'shopping',
        icon: <ShoppingBag className="h-4 w-4" />,
        label: 'Shopping',
        count: 1,
        color: '#F59E0B',
      });
    }

    if (neighborhood.features.amenities?.restaurants) {
      poiList.push({
        type: 'restaurant',
        icon: <UtensilsCrossed className="h-4 w-4" />,
        label: 'Restaurants',
        count: 1,
        color: '#EC4899',
      });
    }

    if (neighborhood.features.amenities?.beaches) {
      poiList.push({
        type: 'beach',
        icon: <Waves className="h-4 w-4" />,
        label: 'Plages',
        count: 1,
        color: '#3B82F6',
      });
    }

    return poiList;
  }, [neighborhood]);

  if (!property || !property.neighborhoodSlug) {
    return null;
  }

  const cityName = property.city || 'la ville';
  const neighborhoodName = property.neighborhoodName_fr || property.neighborhoodName_en || 'ce quartier';

  return (
    <div className="fixed bottom-6 right-6 z-[1000] max-w-md w-full md:w-auto">
      <Card className="shadow-2xl border border-gray-200 bg-white/95 backdrop-blur-sm transition-all duration-300">
        <CardHeader className="pb-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
                <MapPin className="h-5 w-5 text-blue-600" />
                Points d'intérêt
              </CardTitle>
              <p className="text-xs text-gray-600 mt-1">
                {neighborhoodName}, {cityName}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0 hover:bg-white/50"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-4 pb-4">
            {isLoadingNeighborhood ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : pois.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Aucun point d'intérêt disponible pour ce quartier</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* POI List */}
                <div className="grid grid-cols-2 gap-2">
                  {pois.map((poi, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
                      style={{ borderLeftColor: poi.color, borderLeftWidth: '3px' }}
                    >
                      <div 
                        className="p-1.5 rounded-md flex-shrink-0"
                        style={{ backgroundColor: `${poi.color}15`, color: poi.color }}
                      >
                        {poi.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{poi.label}</p>
                        <p className="text-xs text-gray-500">
                          {poi.count > 1 ? `${poi.count} disponibles` : 'Disponible'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Toggle Map Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                  className="w-full border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Map className="h-4 w-4" />
                  {showMap ? 'Masquer la carte' : 'Voir sur la carte'}
                </Button>

                {/* Map */}
                {showMap && property.latitude && property.longitude && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                    <PropertyQuickDetailMap property={property} zoom={16} />
                  </div>
                )}

                {/* Neighborhood Link */}
                {property.neighborhoodSlug && (
                  <Link href={`/neighborhoods/${property.neighborhoodSlug}`}>
                    <Button
                      variant="outline"
                      className="w-full border-blue-300 hover:bg-blue-50 text-blue-700 mt-2"
                    >
                      Voir les détails du quartier
                      <ChevronDown className="h-4 w-4 ml-2 rotate-[-90deg]" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
