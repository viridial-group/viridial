'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { propertyApi, PropertyApiError } from '@/lib/property-api';
import { Property, PropertyStatus, PropertyType } from '@/types/property';
import dynamic from 'next/dynamic';
import { AgencyLayout } from '@/components/layout/AgencyLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  MapPin,
  Euro,
  Home,
  Calendar,
  User,
  Image as ImageIcon,
  Heart,
  Share2,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Pencil,
  Settings,
  Building,
  Bed,
  Bath,
  Ruler,
  ExternalLink,
  Car,
  ParkingCircle,
  TreePine,
  Wind,
  Flame,
  Layers,
  DoorOpen,
  X,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { DetailPageSkeleton } from '@/components/ui/skeleton-loader';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { format } from 'date-fns';

// Lazy load modals
const EditPropertyModal = dynamic(() => import('@/components/properties/EditPropertyModal').then(mod => ({ default: mod.EditPropertyModal })), {
  loading: () => null,
  ssr: false,
});

const statusColors: Record<PropertyStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  listed: 'bg-green-100 text-green-700 border-green-200',
  flagged: 'bg-red-100 text-red-700 border-red-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
};

const statusIcons: Record<PropertyStatus, typeof CheckCircle2> = {
  draft: Clock,
  review: Clock,
  listed: CheckCircle2,
  flagged: AlertTriangle,
  archived: XCircle,
};

const typeColors: Partial<Record<PropertyType, string>> = {
  apartment: 'bg-blue-100 text-blue-700 border-blue-200',
  house: 'bg-green-100 text-green-700 border-green-200',
  villa: 'bg-purple-100 text-purple-700 border-purple-200',
  land: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  commercial: 'bg-red-100 text-red-700 border-red-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  const { user } = useAuth();

  const propertyId = params.id as string;
  const locale = params.locale as string || 'fr';

  // State
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean }>({ open: false });
  const [activeTab, setActiveTab] = useState('overview');

  // Load property
  const loadProperty = useCallback(async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    try {
      const data = await propertyApi.getById(propertyId);
      setProperty(data);
      
      // Load favorite status
      try {
        const favoriteStatus = await propertyApi.isFavorited(propertyId);
        setIsFavorited(favoriteStatus.isFavorited);
      } catch (error) {
        // User might not be authenticated, ignore
      }
      
      // Load favorite count
      try {
        const count = await propertyApi.getFavoriteCount(propertyId);
        setFavoriteCount(count.count);
      } catch (error) {
        // Ignore errors
      }
    } catch (error) {
      console.error('Error loading property:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof PropertyApiError 
          ? error.message 
          : t('errors.loadFailed') || 'Failed to load property',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, toast, tCommon, t]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  // Handlers
  const handleEditSuccess = useCallback(() => {
    setIsEditModalOpen(false);
    loadProperty();
    toast({
      title: tCommon('success') || 'Success',
      description: t('updated') || 'Property updated successfully',
      variant: 'success',
    });
  }, [loadProperty, toast, tCommon, t]);

  const handleDelete = useCallback(async () => {
    if (!property) return;
    
    setIsProcessing(true);
    try {
      await propertyApi.delete(property.id);
      toast({
        title: tCommon('success') || 'Success',
        description: t('deleted') || 'Property deleted successfully',
        variant: 'success',
      });
      router.push('/properties');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof PropertyApiError 
          ? error.message 
          : t('errors.deleteFailed') || 'Failed to delete property',
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
      setConfirmDelete({ open: false });
    }
  }, [property, router, toast, tCommon, t]);

  const handlePublish = useCallback(async () => {
    if (!property) return;
    
    setIsProcessing(true);
    try {
      await propertyApi.publish(property.id);
      toast({
        title: tCommon('success') || 'Success',
        description: t('published') || 'Property published successfully',
        variant: 'success',
      });
      loadProperty();
    } catch (error) {
      console.error('Error publishing property:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof PropertyApiError 
          ? error.message 
          : t('errors.publishFailed') || 'Failed to publish property',
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [property, loadProperty, toast, tCommon, t]);

  const handleToggleFavorite = useCallback(async () => {
    if (!property) return;
    
    try {
      if (isFavorited) {
        await propertyApi.removeFavorite(property.id);
        setIsFavorited(false);
        setFavoriteCount(prev => Math.max(0, prev - 1));
        toast({
          title: tCommon('success') || 'Success',
          description: t('removedFromFavorites') || 'Removed from favorites',
          variant: 'success',
        });
      } else {
        await propertyApi.addFavorite(property.id);
        setIsFavorited(true);
        setFavoriteCount(prev => prev + 1);
        toast({
          title: tCommon('success') || 'Success',
          description: t('addedToFavorites') || 'Added to favorites',
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: tCommon('error') || 'Error',
        description: error instanceof PropertyApiError 
          ? error.message 
          : t('errors.favoriteFailed') || 'Failed to update favorite',
        variant: 'error',
      });
    }
  }, [property, isFavorited, toast, tCommon, t]);

  // Get translation for current language
  const currentLanguage = locale || 'fr';
  const translation = property?.translations?.find(t => t.language.startsWith(currentLanguage)) 
    || property?.translations?.[0];

  if (isLoading) {
    return (
      <AgencyLayout>
        <div className="p-6">
          <DetailPageSkeleton />
        </div>
      </AgencyLayout>
    );
  }

  if (!property) {
    return (
      <AgencyLayout>
        <div className="p-6">
          <Card className="bg-white border-gray-200">
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('notFound') || 'Property not found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('notFoundDescription') || 'The property you are looking for does not exist.'}
              </p>
              <Button onClick={() => router.push('/properties')}>
                {t('backToProperties') || 'Back to Properties'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AgencyLayout>
    );
  }

  // Handle both 'status' and 'statusCode' fields, with fallback to 'draft'
  const propertyStatus = (property as any).status || (property as any).statusCode || 'draft';
  const StatusIcon = statusIcons[propertyStatus as PropertyStatus] || Clock; // Fallback to Clock if status not found

  return (
    <AgencyLayout
      headerContent={
        <>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 text-gray-600 hover:text-gray-900"
            title={tCommon('back')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{translation?.title || t('property') || 'Property'}</h1>
            <p className="text-xs text-gray-500">
              {property.city && property.country 
                ? `${property.city}, ${property.country}`
                : property.street || t('noAddress') || 'No address'}
            </p>
          </div>
        </>
      }
      headerActions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFavorite}
            className={cn('gap-2 text-sm h-9 px-4', isFavorited && 'text-red-600 hover:text-red-700')}
          >
            <Heart className={cn('h-3.5 w-3.5', isFavorited && 'fill-current')} />
            {favoriteCount > 0 && <span>{favoriteCount}</span>}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadProperty}
            disabled={isLoading}
            className="gap-2 text-sm h-9 px-4"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            {tCommon('refresh') || 'Refresh'}
          </Button>
          <Button variant="outline" size="sm" className="text-sm h-9 px-4">
            <Settings className="h-3.5 w-3.5 mr-2" />
            {tCommon('settings')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-sm h-9 px-4">
                <MoreVertical className="h-3.5 w-3.5" />
                {tCommon('more') || 'More'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                {tCommon('edit') || 'Edit'}
              </DropdownMenuItem>
              {propertyStatus === PropertyStatus.DRAFT && (
                <DropdownMenuItem onClick={handlePublish} disabled={isProcessing}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t('publish') || 'Publish'}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConfirmDelete({ open: true })} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                {tCommon('delete') || 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    >
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('stats.price') || 'Price'}</div>
            <div className="text-2xl font-bold text-viridial-600">
              {new Intl.NumberFormat(locale || 'fr-FR', {
                style: 'currency',
                currency: property.currency || 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(property.price)}
            </div>
          </div>
          {property.details?.surfaceArea && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('stats.surface') || 'Surface'}</div>
              <div className="text-2xl font-bold text-gray-900">{property.details.surfaceArea} m²</div>
            </div>
          )}
          {property.details?.bedrooms && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('stats.bedrooms') || 'Bedrooms'}</div>
              <div className="text-2xl font-bold text-gray-900">{property.details.bedrooms}</div>
            </div>
          )}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('stats.status') || 'Status'}</div>
            <div className="text-sm font-medium text-gray-900">
              <Badge className={cn('text-xs px-2.5 py-1 font-medium', statusColors[propertyStatus as PropertyStatus] || 'bg-gray-100 text-gray-700')}>
                <StatusIcon className="h-3.5 w-3.5 mr-1" />
                {t(`status.${propertyStatus}`) || propertyStatus}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* General Information Card */}
          <Card className="lg:col-span-2 border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900">{t('generalInformation') || 'General Information'}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="gap-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Pencil className="h-3.5 w-3.5" />
                {tCommon('edit')}
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                  <Home className="h-6 w-6 text-viridial-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-gray-900 mb-1">{translation?.title || t('noTitle') || 'No title'}</h2>
                  {translation?.description && (
                    <p className="text-sm text-gray-700 leading-relaxed mt-2">{translation.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('form.type') || 'Type'}</p>
                  <Badge className={cn('text-xs px-2.5 py-1 font-medium', typeColors[property.type] || typeColors.other)}>
                    {t(`type.${property.type}`) || property.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('form.status') || 'Status'}</p>
                  {propertyStatus === PropertyStatus.LISTED ? (
                    <Badge variant="success" className="gap-1.5 text-xs px-2.5 py-1 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t(`status.${propertyStatus}`) || propertyStatus}
                    </Badge>
                  ) : propertyStatus === PropertyStatus.FLAGGED ? (
                    <Badge variant="destructive" className="gap-1.5 text-xs px-2.5 py-1 font-medium">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {t(`status.${propertyStatus}`) || propertyStatus}
                    </Badge>
                  ) : (
                    <Badge className={cn('gap-1.5 text-xs px-2.5 py-1 font-medium', statusColors[propertyStatus as PropertyStatus] || 'bg-gray-100 text-gray-700')}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {t(`status.${propertyStatus}`) || propertyStatus}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information Card */}
          <Card className="border-gray-200 bg-white">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">{t('location') || 'Location'}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="gap-2 text-sm h-8 px-3 text-gray-600 hover:text-gray-900"
                  title={tCommon('edit')}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {tCommon('edit')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Address */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                    <MapPin className="h-4 w-4 text-viridial-600" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('address') || 'Address'}</span>
                </div>
                {property.street || property.city || property.country ? (
                  <div className="pl-12 space-y-2">
                    <div>
                      {property.street && (
                        <p className="text-sm font-medium text-gray-900 leading-tight">{property.street}</p>
                      )}
                      {property.postalCode && property.city && (
                        <p className="text-sm text-gray-600">{property.postalCode} {property.city}</p>
                      )}
                      {property.region && (
                        <p className="text-sm text-gray-600">{property.region}</p>
                      )}
                      {property.country && (
                        <p className="text-sm text-gray-600">{property.country}</p>
                      )}
                    </div>
                    {property.latitude && property.longitude && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-300 font-normal">
                          {Number(property.latitude).toFixed(6)}, {Number(property.longitude).toFixed(6)}
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="pl-12 text-sm text-gray-400 italic">{t('noAddress') || 'No address'}</p>
                )}
              </div>

              {/* Neighborhood */}
              {property.neighborhood && (
                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                      <MapPin className="h-4 w-4 text-viridial-600" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('neighborhood') || 'Neighborhood'}</span>
                  </div>
                  <div className="pl-12">
                    <p className="text-sm font-medium text-gray-900">{property.neighborhood.name}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="bg-white border border-gray-200 rounded-lg p-1 mb-6 inline-block">
            <TabsList className="bg-transparent h-auto p-0 gap-1">
              <TabsTrigger 
                value="overview" 
                className="gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors data-[state=active]:bg-viridial-50 data-[state=active]:text-viridial-700 data-[state=active]:border data-[state=active]:border-viridial-200 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-50"
              >
                <Home className="h-4 w-4" />
                {t('tabs.overview') || 'Overview'}
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors data-[state=active]:bg-viridial-50 data-[state=active]:text-viridial-700 data-[state=active]:border data-[state=active]:border-viridial-200 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                {t('tabs.details') || 'Details'}
              </TabsTrigger>
              <TabsTrigger 
                value="location" 
                className="gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors data-[state=active]:bg-viridial-50 data-[state=active]:text-viridial-700 data-[state=active]:border data-[state=active]:border-viridial-200 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-50"
              >
                <MapPin className="h-4 w-4" />
                {t('tabs.location') || 'Location'}
              </TabsTrigger>
              {property.mediaUrls && property.mediaUrls.length > 0 && (
                <TabsTrigger 
                  value="media" 
                  className="gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors data-[state=active]:bg-viridial-50 data-[state=active]:text-viridial-700 data-[state=active]:border data-[state=active]:border-viridial-200 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-50"
                >
                  <ImageIcon className="h-4 w-4" />
                  {t('tabs.media') || 'Media'} ({property.mediaUrls.length})
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0">
            <Card className="border-gray-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">{t('overview') || 'Overview'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {translation?.description && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{t('description') || 'Description'}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{translation.description}</p>
                  </div>
                )}

                {property.details && (
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">{t('propertyDetails') || 'Property Details'}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {property.details.bedrooms && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100">
                              <Bed className="h-4 w-4 text-viridial-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.bedrooms') || 'Bedrooms'}</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{property.details.bedrooms}</p>
                        </div>
                      )}
                      {property.details.bathrooms && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100">
                              <Bath className="h-4 w-4 text-viridial-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.bathrooms') || 'Bathrooms'}</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{property.details.bathrooms}</p>
                        </div>
                      )}
                      {property.details.surfaceArea && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100">
                              <Ruler className="h-4 w-4 text-viridial-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.surface') || 'Surface'}</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{property.details.surfaceArea} m²</p>
                        </div>
                      )}
                      {property.details.landArea && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100">
                              <Ruler className="h-4 w-4 text-viridial-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.landArea') || 'Land Area'}</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{property.details.landArea} m²</p>
                        </div>
                      )}
                      {property.details.totalRooms && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100">
                              <DoorOpen className="h-4 w-4 text-viridial-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.totalRooms') || 'Total Rooms'}</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{property.details.totalRooms}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-0">
            <Card className="border-gray-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">{t('propertyDetails') || 'Property Details'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {property.details ? (
                  <div className="space-y-8">
                    {/* Rooms Section */}
                    {(property.details.bedrooms || property.details.bathrooms || property.details.totalRooms) && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Rooms</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {property.details.bedrooms && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100">
                                <Bed className="h-4 w-4 text-viridial-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.bedrooms') || 'Bedrooms'}</p>
                                <p className="text-lg font-bold text-gray-900">{property.details.bedrooms}</p>
                              </div>
                            </div>
                          )}
                          {property.details.bathrooms && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100">
                                <Bath className="h-4 w-4 text-viridial-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.bathrooms') || 'Bathrooms'}</p>
                                <p className="text-lg font-bold text-gray-900">{property.details.bathrooms}</p>
                              </div>
                            </div>
                          )}
                          {property.details.totalRooms && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100">
                                <DoorOpen className="h-4 w-4 text-viridial-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.totalRooms') || 'Total Rooms'}</p>
                                <p className="text-lg font-bold text-gray-900">{property.details.totalRooms}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Parking & Garage Section */}
                    {(property.details.hasGarage || property.details.garageSpaces || property.details.hasParking || property.details.parkingSpaces) && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Parking & Garage</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {property.details.hasGarage && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                                <Car className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.hasGarage') || 'Garage'}</p>
                                {property.details.garageSpaces ? (
                                  <p className="text-lg font-bold text-gray-900">
                                    {property.details.garageSpaces} {t('details.garageSpaces') || 'spaces'}
                                  </p>
                                ) : (
                                  <p className="text-sm font-medium text-green-600">Yes</p>
                                )}
                              </div>
                            </div>
                          )}
                          {property.details.hasParking && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                                <ParkingCircle className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.hasParking') || 'Parking'}</p>
                                {property.details.parkingSpaces ? (
                                  <p className="text-lg font-bold text-gray-900">
                                    {property.details.parkingSpaces} {t('details.parkingSpaces') || 'spaces'}
                                  </p>
                                ) : (
                                  <p className="text-sm font-medium text-blue-600">Yes</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Amenities Section */}
                    {(property.details.hasGarden || property.details.hasAirConditioning || property.details.hasHeating) && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Amenities</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {property.details.hasGarden && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                                <TreePine className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{t('details.hasGarden') || 'Garden'}</span>
                            </div>
                          )}
                          {property.details.hasAirConditioning && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                                <Wind className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{t('details.hasAirConditioning') || 'Air Conditioning'}</span>
                            </div>
                          )}
                          {property.details.hasHeating && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-orange-50 rounded-lg border border-orange-100">
                                <Flame className="h-4 w-4 text-orange-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{t('details.hasHeating') || 'Heating'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Building Information Section */}
                    {(property.details.totalFloors || property.details.constructionYear || property.details.surfaceArea || property.details.landArea) && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Building Information</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {property.details.surfaceArea && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100">
                                <Ruler className="h-4 w-4 text-viridial-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.surface') || 'Surface'}</p>
                                <p className="text-lg font-bold text-gray-900">{property.details.surfaceArea} m²</p>
                              </div>
                            </div>
                          )}
                          {property.details.landArea && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-viridial-50 rounded-lg border border-viridial-100">
                                <Ruler className="h-4 w-4 text-viridial-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.landArea') || 'Land Area'}</p>
                                <p className="text-lg font-bold text-gray-900">{property.details.landArea} m²</p>
                              </div>
                            </div>
                          )}
                          {property.details.totalFloors && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                                <Layers className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.totalFloors') || 'Floors'}</p>
                                <p className="text-lg font-bold text-gray-900">{property.details.totalFloors}</p>
                              </div>
                            </div>
                          )}
                          {property.details.constructionYear && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                                <Calendar className="h-4 w-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('details.constructionYear') || 'Construction Year'}</p>
                                <p className="text-lg font-bold text-gray-900">{property.details.constructionYear}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">{t('noDetails') || 'No details available'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="mt-0">
            <Card className="border-gray-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">{t('location') || 'Location'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                    <MapPin className="h-6 w-6 text-viridial-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{t('address') || 'Address'}</h3>
                    <div className="space-y-1">
                      {property.street && (
                        <p className="text-sm font-medium text-gray-900 leading-tight">{property.street}</p>
                      )}
                      {property.postalCode && property.city && (
                        <p className="text-sm text-gray-600">{property.postalCode} {property.city}</p>
                      )}
                      {property.region && (
                        <p className="text-sm text-gray-600">{property.region}</p>
                      )}
                      {property.country && (
                        <p className="text-sm text-gray-600">{property.country}</p>
                      )}
                    </div>
                    {property.latitude && property.longitude && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{t('coordinates') || 'Coordinates'}</p>
                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-300 font-normal">
                          {Number(property.latitude).toFixed(6)}, {Number(property.longitude).toFixed(6)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {property.neighborhood && (
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                        <MapPin className="h-6 w-6 text-viridial-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 mb-2">{t('neighborhood') || 'Neighborhood'}</h3>
                        <p className="text-sm text-gray-700">{property.neighborhood.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {property.mediaUrls && property.mediaUrls.length > 0 && (
            <TabsContent value="media" className="mt-0">
              <Card className="border-gray-200 bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold text-gray-900">{t('media') || 'Media'} ({property.mediaUrls.length})</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.mediaUrls.map((url, index) => (
                      <div key={index} className="relative h-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <Image
                          src={url}
                          alt={`${translation?.title || 'Property'} ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Modals */}
      {property && (
        <EditPropertyModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          property={property}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open })}
        title={t('confirmDelete.title') || 'Delete Property'}
        description={t('confirmDelete.description') || 'Are you sure you want to delete this property? This action cannot be undone.'}
        variant="danger"
        confirmText={tCommon('delete') || 'Delete'}
        cancelText={tCommon('cancel') || 'Cancel'}
        onConfirm={handleDelete}
      />
    </AgencyLayout>
  );
}
