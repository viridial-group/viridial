'use client';

import { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Property, PropertyStatus, PropertyType } from '@/types/property';
import { 
  Home, 
  MapPin, 
  Euro, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Image as ImageIcon,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
  currentLanguage?: string;
  style?: React.CSSProperties;
}

const statusColors: Record<PropertyStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  review: 'bg-yellow-100 text-yellow-700',
  listed: 'bg-green-100 text-green-700',
  flagged: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
};

const statusIcons: Record<PropertyStatus, typeof CheckCircle2> = {
  draft: Clock,
  review: Clock,
  listed: CheckCircle2,
  flagged: XCircle,
  archived: XCircle,
};

const typeLabels: Record<PropertyType, string> = {
  house: 'Maison',
  apartment: 'Appartement',
  villa: 'Villa',
  land: 'Terrain',
  commercial: 'Commercial',
  other: 'Autre',
};

export const PropertyCard = memo(function PropertyCard({ 
  property, 
  isSelected = false, 
  onSelect,
  onView,
  onEdit,
  onDelete,
  onFavorite,
  isFavorited = false,
  currentLanguage = 'fr',
  style,
}: PropertyCardProps) {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[type="checkbox"]') ||
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    onView?.() || onSelect?.();
  }, [onView, onSelect]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  }, [onEdit]);

  const handleViewClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.();
  }, [onView]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  }, [onDelete]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.();
  }, [onFavorite]);

  // Get translation for current language or fallback to first translation
  const translation = property.translations?.find(t => t.language.startsWith(currentLanguage)) 
    || property.translations?.[0];

  const mainImage = property.mediaUrls && property.mediaUrls.length > 0 ? property.mediaUrls[0] : null;
  const StatusIcon = statusIcons[property.status];

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-300 ease-out hover:shadow-lg border-gray-200 bg-white animate-fade-in',
        isSelected ? 'border-viridial-400 bg-viridial-50 ring-2 ring-viridial-200' : 'hover:border-viridial-400 hover:-translate-y-0.5'
      )}
      onClick={handleCardClick}
      style={style || { animationDelay: '0ms' }}
    >
      {/* Image Section */}
      {mainImage ? (
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          <Image
            src={mainImage}
            alt={translation?.title || 'Property'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {onFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 bg-white/90 hover:bg-white',
                  isFavorited && 'text-red-500'
                )}
                onClick={handleFavoriteClick}
              >
                <Heart className={cn('h-4 w-4', isFavorited && 'fill-current')} />
              </Button>
            )}
            <Badge className={cn('bg-white/90 text-xs', statusColors[property.status])}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {t(`status.${property.status}`) || property.status}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center rounded-t-lg">
          <ImageIcon className="h-12 w-12 text-gray-400" />
          <div className="absolute top-2 right-2">
            <Badge className={cn('text-xs', statusColors[property.status])}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {t(`status.${property.status}`) || property.status}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {onSelect && (
              <div 
                className="flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
              <Home className="h-5 w-5 text-viridial-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate hover:text-viridial-600">
                {translation?.title || t('noTitle') || 'No title'}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                {property.city && property.country 
                  ? `${property.city}, ${property.country}`
                  : property.street || t('noAddress') || 'No address'}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Property Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Badge variant="outline" className="text-xs">
                {typeLabels[property.type] || property.type}
              </Badge>
              {property.details?.bedrooms && (
                <span className="text-xs">{property.details.bedrooms} {t('bedrooms') || 'ch.'}</span>
              )}
              {property.details?.bathrooms && (
                <span className="text-xs">{property.details.bathrooms} {t('bathrooms') || 'sdb'}</span>
              )}
              {property.details?.surfaceArea && (
                <span className="text-xs">{property.details.surfaceArea} m²</span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-viridial-600" />
            <span className="text-lg font-bold text-viridial-600">
              {new Intl.NumberFormat(currentLanguage === 'fr' ? 'fr-FR' : 'en-US', {
                style: 'currency',
                currency: property.currency || 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(property.price)}
            </span>
          </div>

          {/* Location */}
          {property.latitude && property.longitude && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">
                {[property.street, property.postalCode, property.city, property.country]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="h-7 px-2 gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                {tCommon('edit') || 'Edit'}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="h-7 px-2 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {tCommon('delete') || 'Delete'}
              </Button>
            )}
          </div>
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewClick}
              className="h-7 px-2 gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              {tCommon('view') || 'View'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

