'use client';

import { useState } from 'react';
import { PropertySearchResult } from '@/lib/api/search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, MapPin, DollarSign, Home, Building, LandPlot, Store, ChevronRight, Share2, Copy, Phone, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/simple-toast';

interface PropertyQuickDetailPanelProps {
  property: PropertySearchResult;
  onClose: () => void;
  onViewFull?: () => void;
}

export default function PropertyQuickDetailPanel({ property, onClose, onViewFull }: PropertyQuickDetailPanelProps) {
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const propertyTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'apartment':
        return <Building className="h-4 w-4" />;
      case 'house':
        return <Home className="h-4 w-4" />;
      case 'villa':
        return <Home className="h-4 w-4" />;
      case 'commercial':
        return <Store className="h-4 w-4" />;
      case 'land':
        return <LandPlot className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'listed':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'review':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleCopyAddress = () => {
    const address = [
      property.street,
      property.postalCode,
      property.city,
      property.country,
    ].filter(Boolean).join(', ');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(address);
      toast({
        variant: 'success',
        title: 'Adresse copiée',
        description: 'L\'adresse a été copiée dans le presse-papiers.',
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - Enhanced */}
      <div className="flex items-center justify-between p-5 border-b-2 border-gray-200 bg-gradient-to-r from-white to-gray-50/50 sticky top-0 z-20 backdrop-blur-sm">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          Détails rapides
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-5 space-y-5">
          {/* Main Image - Enhanced */}
          {property.mediaUrls && property.mediaUrls.length > 0 && !imageError ? (
            <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg group/image">
              <img
                src={property.mediaUrls[0]}
                alt={property.title_fr || property.title_en || 'Property'}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute top-3 right-3">
                <Badge
                  variant={getStatusBadgeVariant(property.status)}
                  className="capitalize backdrop-blur-sm bg-white/95 border border-gray-200 shadow-sm text-xs font-semibold"
                >
                  {property.status}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="w-full h-64 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
              <div className="text-center text-gray-400">
                {propertyTypeIcon(property.type)}
                <p className="text-xs mt-2 capitalize">{property.type}</p>
              </div>
            </div>
          )}

          {/* Title and Basic Info */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {property.title_fr || property.title_en || 'Sans titre'}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1.5">
                {propertyTypeIcon(property.type)}
                <span className="capitalize font-medium">{property.type}</span>
              </div>
              {property.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{property.city}</span>
                  {property.postalCode && <span>({property.postalCode})</span>}
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="p-4 bg-viridial-50 rounded-lg border border-viridial-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Prix</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(property.price, property.currency)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Address */}
          {(property.street || property.postalCode || property.city) && (
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Adresse
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 text-sm text-gray-700">
                  {property.street && <p className="font-medium">{property.street}</p>}
                  {(property.postalCode || property.city) && (
                    <p>
                      {property.postalCode} {property.city}
                    </p>
                  )}
                  {(property.region || property.country) && (
                    <p className="text-gray-600">
                      {property.region}
                      {property.region && property.country ? ', ' : ''}
                      {property.country}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 border-2 border-gray-300 hover:border-primary hover:bg-primary/5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  onClick={handleCopyAddress}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copier l'adresse
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {(property.description_fr || property.description_en) && (
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-6">
                  {property.description_fr || property.description_en}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Neighborhood Info */}
          {property.neighborhoodSlug && (property.neighborhoodName_fr || property.neighborhoodName_en) && (
            <Card className="border-gray-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Quartier
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {property.neighborhoodName_fr || property.neighborhoodName_en}
                </p>
                <Link href={`/neighborhoods/${property.neighborhoodSlug}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-2 border-viridial-300 hover:border-viridial-400 hover:bg-viridial-50 text-viridial-700 rounded-xl transition-all duration-200 hover:scale-[1.02] font-medium"
                  >
                    Voir le quartier
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Additional Images */}
          {property.mediaUrls && property.mediaUrls.length > 1 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Plus d'images</h4>
              <div className="grid grid-cols-2 gap-2">
                {property.mediaUrls.slice(1, 5).map((url, index) => (
                  <div key={index} className="relative aspect-video rounded-md overflow-hidden border border-gray-200">
                    <img
                      src={url}
                      alt={`Image ${index + 2}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons - Enhanced */}
          <div className="space-y-3 pt-4 border-t-2 border-gray-200">
            <Link href={`/property/${property.id}`} className="block">
              <Button 
                className="w-full bg-gradient-to-r from-primary to-viridial-600 hover:from-viridial-700 hover:to-viridial-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 font-semibold" 
                onClick={onViewFull}
              >
                Voir tous les détails
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="border-2 border-gray-300 hover:border-primary hover:bg-primary/5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
              >
                <Phone className="h-4 w-4 mr-2" />
                Contacter
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-gray-300 hover:border-primary hover:bg-primary/5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
