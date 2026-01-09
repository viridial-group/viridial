'use client';

import { useState } from 'react';
import { Property } from '@/lib/api/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin, Phone, Globe, Share2, Bookmark, Navigation, Copy,
  School, Train, ShoppingBag, UtensilsCrossed, Waves, Activity, TreePine,
  Home, Building, TrendingUp, Shield, Star, Users, AlertCircle, CheckCircle2, Info
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/simple-toast';

interface PropertyDetailSidebarProps {
  property: Property;
  onShare?: () => void;
  onSave?: () => void;
}

type TabType = 'overview' | 'neighborhood' | 'amenities';

export default function PropertyDetailSidebar({ property, onShare, onSave }: PropertyDetailSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { toast } = useToast();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCopyAddress = () => {
    const address = [
      property.street,
      property.postalCode,
      property.city,
      property.country,
    ].filter(Boolean).join(', ');

    navigator.clipboard.writeText(address);
    toast({
      variant: 'success',
      title: 'Adresse copiée',
      description: 'L\'adresse a été copiée dans le presse-papiers.',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.translations[0]?.title || 'Propriété',
        text: property.translations[0]?.description || '',
        url: window.location.href,
      }).catch(() => {});
    } else if (onShare) {
      onShare();
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Présentation', icon: Home },
    { id: 'neighborhood' as TabType, label: 'Quartier', icon: MapPin },
    { id: 'amenities' as TabType, label: 'Équipements', icon: Building },
  ];

  return (
    <Card className="border border-gray-200 bg-white sticky top-24 h-fit">
      {/* Header with Price */}
      <CardHeader className="pb-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatPrice(property.price, property.currency)}
            </p>
            <Badge variant="outline" className="capitalize border-viridial-300 text-viridial-700">
              {property.type}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
          {property.latitude && property.longitude && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`;
                window.open(url, '_blank');
              }}
              className="border-gray-300 hover:bg-gray-50"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6 pt-4">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <CardContent className="pt-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Address */}
            <div>
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {property.street && (
                    <p className="font-medium text-gray-900 text-sm">{property.street}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {[property.postalCode, property.city, property.country].filter(Boolean).join(', ')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{property.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Statut</span>
                <Badge variant={property.status === 'listed' ? 'default' : 'secondary'} className="capitalize">
                  {property.status}
                </Badge>
              </div>
              {property.latitude && property.longitude && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Coordonnées</span>
                  <span className="text-xs text-gray-500 font-mono">
                    {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                  </span>
                </div>
              )}
            </div>

            {/* Description Preview */}
            {property.translations[0]?.description && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {property.translations[0].description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Neighborhood Tab */}
        {activeTab === 'neighborhood' && property.neighborhood && (
          <div className="space-y-4">
            <div>
              <Link
                href={`/neighborhoods/${property.neighborhood.slug}`}
                className="text-lg font-semibold text-primary hover:text-viridial-700 transition-colors duration-200 inline-flex items-center gap-2"
              >
                {property.neighborhood.name}
                <span className="text-xs">→</span>
              </Link>
              {property.neighborhood.description?.fr && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {property.neighborhood.description.fr}
                </p>
              )}
            </div>

            {/* Neighborhood Stats */}
            {property.neighborhood.stats && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                {property.neighborhood.stats.averagePriceOverall && (
                  <div>
                    <p className="text-xs text-gray-500">Prix moyen</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(property.neighborhood.stats.averagePriceOverall, 'EUR')}/m²
                    </p>
                  </div>
                )}
                {property.neighborhood.stats.propertyCount !== undefined && (
                  <div>
                    <p className="text-xs text-gray-500">Propriétés</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {property.neighborhood.stats.propertyCount}
                    </p>
                  </div>
                )}
                {property.neighborhood.features?.safetyScore !== undefined && (
                  <div>
                    <p className="text-xs text-gray-500">Sécurité</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {property.neighborhood.features.safetyScore}/10
                    </p>
                  </div>
                )}
                {property.neighborhood.features?.qualityOfLife !== undefined && (
                  <div>
                    <p className="text-xs text-gray-500">Qualité de vie</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {property.neighborhood.features.qualityOfLife}/10
                    </p>
                  </div>
                )}
              </div>
            )}

            <Link
              href={`/neighborhoods/${property.neighborhood.slug}`}
              className="block pt-3 border-t border-gray-200"
            >
              <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50">
                Voir tous les détails du quartier
              </Button>
            </Link>
          </div>
        )}

        {/* Amenities Tab - Points d'intérêt */}
        {activeTab === 'amenities' && property.neighborhood && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">À proximité</h3>

            {/* Transport */}
            {property.neighborhood.features?.publicTransport && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Train className="h-4 w-4 text-blue-600" />
                  Transports en commun
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {property.neighborhood.features.publicTransport.metro && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                      Métro
                    </Badge>
                  )}
                  {property.neighborhood.features.publicTransport.tram && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                      Tramway
                    </Badge>
                  )}
                  {property.neighborhood.features.publicTransport.bus && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                      Bus
                    </Badge>
                  )}
                  {property.neighborhood.features.publicTransport.train && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                      Train
                    </Badge>
                  )}
                </div>
                {property.neighborhood.features.publicTransport.stations &&
                 property.neighborhood.features.publicTransport.stations.length > 0 && (
                  <p className="text-xs text-gray-600 ml-6">
                    Stations: {property.neighborhood.features.publicTransport.stations.slice(0, 3).join(', ')}
                    {property.neighborhood.features.publicTransport.stations.length > 3 && '...'}
                  </p>
                )}
              </div>
            )}

            {/* Équipements */}
            {property.neighborhood.features?.amenities && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                {property.neighborhood.features.amenities.schools !== undefined && (
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Écoles</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {property.neighborhood.features.amenities.schools}
                      </p>
                    </div>
                  </div>
                )}
                {property.neighborhood.features.amenities.hospitals !== undefined && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500">Hôpitaux</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {property.neighborhood.features.amenities.hospitals}
                      </p>
                    </div>
                  </div>
                )}
                {property.neighborhood.features.amenities.parks !== undefined && (
                  <div className="flex items-center gap-2">
                    <TreePine className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-gray-500">Parcs</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {property.neighborhood.features.amenities.parks}
                      </p>
                    </div>
                  </div>
                )}
                {property.neighborhood.features.amenities.shopping && (
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500">Shopping</p>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
                {property.neighborhood.features.amenities.restaurants && (
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-500">Restaurants</p>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
                {property.neighborhood.features.amenities.beaches && (
                  <div className="flex items-center gap-2">
                    <Waves className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500">Plages</p>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Démographie */}
            {property.neighborhood.features?.demographics && (
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Démographie</h4>
                <div className="grid grid-cols-2 gap-3">
                  {property.neighborhood.features.demographics.population && (
                    <div>
                      <p className="text-xs text-gray-500">Population</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Intl.NumberFormat('fr-FR').format(property.neighborhood.features.demographics.population)}
                      </p>
                    </div>
                  )}
                  {property.neighborhood.features.demographics.averageAge && (
                    <div>
                      <p className="text-xs text-gray-500">Âge moyen</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {property.neighborhood.features.demographics.averageAge} ans
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {property.neighborhood.features.demographics.familyFriendly && (
                    <Badge variant="outline" className="border-viridial-300 text-viridial-700 text-xs">
                      Familles
                    </Badge>
                  )}
                  {property.neighborhood.features.demographics.studentArea && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                      Étudiants
                    </Badge>
                  )}
                  {property.neighborhood.features.demographics.seniorFriendly && (
                    <Badge variant="outline" className="border-purple-300 text-purple-700 text-xs">
                      Seniors
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {!property.neighborhood && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Aucune information de quartier disponible</p>
              </div>
            )}
          </div>
        )}

        {!property.neighborhood && activeTab === 'neighborhood' && (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Aucune information de quartier disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  function handleSave() {
    if (onSave) {
      onSave();
    } else {
      toast({
        variant: 'info',
        title: 'Fonctionnalité à venir',
        description: 'La sauvegarde de propriétés sera disponible bientôt.',
      });
    }
  }
}

