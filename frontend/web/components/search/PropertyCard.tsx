'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { PropertySearchResult } from '@/lib/api/search';
import { PropertyType, PropertyStatus } from '@/lib/api/property';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Home, Building, LandPlot, Store, ChevronRight, Leaf } from 'lucide-react';
import Link from 'next/link';

interface PropertyCardProps {
  property: PropertySearchResult;
  viewMode: 'list' | 'grid';
  isSelected: boolean;
  onSelect: (property: PropertySearchResult) => void;
  propertyTypeIcon: (type: PropertyType) => React.ReactNode;
  formatPrice: (price: number, currency: string) => string;
  getStatusBadgeVariant: (status: PropertyStatus) => 'default' | 'secondary' | 'outline';
}

const PropertyCard = memo(function PropertyCard({
  property,
  viewMode,
  isSelected,
  onSelect,
  propertyTypeIcon,
  formatPrice,
  getStatusBadgeVariant,
}: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const isEcoProperty = property.neighborhoodName_fr?.toLowerCase().includes('éco') || 
                       property.neighborhoodName_en?.toLowerCase().includes('eco') ||
                       property.neighborhoodSlug?.includes('eco');

  const hasImage = property.mediaUrls && property.mediaUrls.length > 0 && !imageError;
  const imageUrl = property.mediaUrls?.[0] || '';

  return (
    <Card
      className={`stagger-item card-hover ${viewMode === 'grid' ? '' : 'mx-3 mb-3'} cursor-pointer border-2 group bg-white overflow-hidden transition-all duration-300 rounded-2xl ${
        isSelected
          ? 'border-primary shadow-xl ring-4 ring-primary/20 scale-[1.02]'
          : isEcoProperty
          ? 'border-viridial-200 hover:border-viridial-400 hover:shadow-xl hover:-translate-y-1'
          : 'border-gray-200 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1'
      }`}
      onClick={() => onSelect(property)}
      role="button"
      tabIndex={0}
      aria-label={`Propriété: ${property.title_fr || property.title_en || 'Sans titre'}, ${formatPrice(property.price, property.currency)}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(property);
        }
      }}
    >
      <CardContent className="p-0">
        {/* Property Image with gradient overlay */}
        <div className={`relative w-full ${viewMode === 'grid' ? 'h-56' : 'h-48'} bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden`}>
          {hasImage ? (
            <>
              <div className="relative w-full h-full">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400">
                      {propertyTypeIcon(property.type)}
                    </div>
                  </div>
                )}
                <Image
                  src={imageUrl}
                  alt={property.title_fr || property.title_en || 'Property'}
                  fill
                  sizes={viewMode === 'grid' ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : '100vw'}
                  className={`property-card-image object-cover transition-all duration-500 ease-out group-hover:scale-110 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                  priority={isSelected}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-75" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                {propertyTypeIcon(property.type)}
                <p className="text-xs mt-2 capitalize">{property.type}</p>
              </div>
            </div>
          )}
          {/* Status badge on image */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            <Badge 
              variant={getStatusBadgeVariant(property.status)}
              className="capitalize backdrop-blur-sm bg-white/95 border border-gray-200 shadow-sm text-xs font-semibold"
            >
              {property.status}
            </Badge>
            {/* Eco-certified badge */}
            {isEcoProperty && (
              <Badge 
                className="backdrop-blur-sm bg-gradient-to-br from-viridial-500 to-primary text-white border border-viridial-600 shadow-md text-xs font-semibold flex items-center gap-1"
              >
                <Leaf className="h-3 w-3" />
                Éco
              </Badge>
            )}
          </div>
        </div>

        {/* Property Info */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-viridial-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 leading-tight">
              {property.title_fr || property.title_en || 'Sans titre'}
            </h3>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                {propertyTypeIcon(property.type)}
                <span className="capitalize font-medium">{property.type}</span>
              </div>
              {property.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate font-medium">{property.city}</span>
                </div>
              )}
            </div>
          </div>

          {property.description_fr && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed group-hover:text-gray-800 transition-colors duration-200">
              {property.description_fr}
            </p>
          )}

          {/* Neighborhood and eco badges */}
          {property.neighborhoodName_fr && (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs bg-gray-50 border-gray-300 text-gray-700 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {property.neighborhoodName_fr}
              </Badge>
              {isEcoProperty && (
                <Badge className="text-xs bg-gradient-to-r from-viridial-50 to-viridial-50 border-viridial-300 text-viridial-700 flex items-center gap-1 shadow-sm">
                  <Leaf className="h-3 w-3" />
                  Éco-quartier
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-viridial-50">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {formatPrice(property.price, property.currency)}
              </span>
            </div>
            <Link
              href={`/property/${property.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-viridial-600 hover:from-viridial-700 hover:to-viridial-700 transition-all duration-200 px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 group/link"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Voir les détails de ${property.title_fr || property.title_en || 'cette propriété'}`}
            >
              Voir détails
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.property.id === nextProps.property.id &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.property.title_fr === nextProps.property.title_fr &&
    prevProps.property.price === nextProps.property.price
  );
});

export default PropertyCard;
