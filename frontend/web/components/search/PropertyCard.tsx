'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { PropertySearchResult } from '@/lib/api/search';
import { PropertyType, PropertyStatus } from '@/lib/api/property';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Home, Building, LandPlot, Store, ChevronRight, Leaf } from 'lucide-react';
import Link from 'next/link';
import styles from './PropertyCard.module.scss';

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
      className={`${styles.propertyCard} ${isSelected ? styles.selected : ''} ${isEcoProperty ? styles.ecoProperty : ''} ${viewMode === 'list' ? styles.listView : styles.gridView} stagger-item card-hover cursor-pointer group overflow-hidden`}
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
        <div className={`${styles.propertyImage} ${viewMode === 'list' ? styles.listView : styles.gridView} relative w-full overflow-hidden`}>
          {hasImage ? (
            <>
              <div className={styles.imageContainer}>
                {imageLoading && (
                  <div className={styles.loadingPlaceholder}>
                    <div className={styles.placeholderIcon}>
                      {propertyTypeIcon(property.type)}
                    </div>
                  </div>
                )}
                <Image
                  src={imageUrl}
                  alt={property.title_fr || property.title_en || 'Property'}
                  fill
                  sizes={viewMode === 'grid' ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : '100vw'}
                  className={`${styles.propertyImageElement} object-cover ${
                    imageLoading ? styles.loading : styles.loaded
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                  priority={isSelected}
                />
                <div className={styles.imageOverlay} />
              </div>
            </>
          ) : (
            <div className={styles.noImageFallback}>
              <div className={styles.fallbackContent}>
                <div className={styles.fallbackIcon}>
                  {propertyTypeIcon(property.type)}
                </div>
                <p className={styles.fallbackText}>{property.type}</p>
              </div>
            </div>
          )}
          {/* Status badge on image */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            <Badge 
              variant={getStatusBadgeVariant(property.status)}
              className={`${styles.statusBadge} capitalize backdrop-blur-sm bg-white/95 border border-gray-200 shadow-sm text-xs font-semibold`}
            >
              {property.status}
            </Badge>
            {/* Eco-certified badge */}
            {isEcoProperty && (
              <Badge className={styles.ecoBadge}>
                <Leaf className={styles.leafIcon} />
                Éco
              </Badge>
            )}
          </div>
        </div>

        {/* Property Info */}
        <div className={styles.propertyContent}>
          <div className={styles.propertyHeader}>
            <h3 className={styles.propertyTitle}>
              {property.title_fr || property.title_en || 'Sans titre'}
            </h3>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                {propertyTypeIcon(property.type)}
                <span className="capitalize font-medium">{property.type}</span>
              </div>
              {property.city && (
                <div className={`${styles.propertyLocation} flex items-center gap-1.5`}>
                  <MapPin className={styles.locationIcon} />
                  <span className={styles.locationText}>{property.city}</span>
                </div>
              )}
            </div>
          </div>

          {property.description_fr && (
            <p className={styles.propertyDescription}>
              {property.description_fr}
            </p>
          )}

          {/* Neighborhood and eco badges */}
          {property.neighborhoodName_fr && (
            <div className={styles.propertyNeighborhood}>
              <Badge className={`${styles.neighborhoodBadge} text-xs flex items-center gap-1`}>
                <MapPin className={`${styles.neighborhoodIcon} h-3 w-3`} />
                {property.neighborhoodName_fr}
              </Badge>
              {isEcoProperty && (
                <Badge className={`${styles.neighborhoodBadge} ${styles.eco} text-xs flex items-center gap-1`}>
                  <Leaf className={`${styles.neighborhoodIcon} h-3 w-3`} />
                  Éco-quartier
                </Badge>
              )}
            </div>
          )}

          <div className={styles.propertyDetails}>
            <div className={styles.propertyPrice}>
              <DollarSign className={styles.priceIcon} />
              <span className={styles.priceValue}>
                {formatPrice(property.price, property.currency)}
              </span>
            </div>
            <Link
              href={`/property/${property.id}`}
              className={styles.propertyLink}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Voir les détails de ${property.title_fr || property.title_en || 'cette propriété'}`}
            >
              Voir détails
              <ChevronRight className={styles.linkIcon} aria-hidden="true" />
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
