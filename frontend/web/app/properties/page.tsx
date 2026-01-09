'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePropertyService } from '@/hooks/usePropertyService';
import { Property, PropertyStatus } from '@/lib/api/property';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useToast } from '@/components/ui/simple-toast';
import { useConfirm } from '@/components/ui/simple-alert-dialog';
import { PropertyListSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useTranslation } from '@/contexts/I18nContext';
import { Home, Plus, MapPin, Eye, Edit, Trash2, Upload, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function PropertiesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const propertyService = usePropertyService();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Load properties for authenticated users (their own properties + all)
    if (!authLoading) {
      loadProperties();
    }
  }, [authLoading]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await propertyService.findAll({ limit: 50 });
      setProperties(response.properties);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des propriétés');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirm({
      title: t('property.delete'),
      description: t('property.deleteConfirmation'),
      variant: 'danger',
      confirmLabel: t('common.delete'),
      onConfirm: async () => {
        try {
          await propertyService.delete(id);
          await loadProperties();
          toast({
            variant: 'success',
            title: 'Propriété supprimée',
            description: 'La propriété a été supprimée avec succès.',
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
          toast({
            variant: 'error',
            title: 'Erreur',
            description: errorMessage,
          });
        }
      },
    });
  };

  const handlePublish = async (id: string) => {
    try {
      await propertyService.publish(id);
      await loadProperties();
      toast({
        variant: 'success',
        title: 'Propriété publiée',
        description: 'La propriété est maintenant visible publiquement.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la publication';
      toast({
        variant: 'error',
        title: 'Erreur',
        description: errorMessage,
      });
    }
  };

  const getStatusLabel = (status: PropertyStatus) => {
    const labels: Record<PropertyStatus, string> = {
      [PropertyStatus.DRAFT]: 'Brouillon',
      [PropertyStatus.REVIEW]: 'En révision',
      [PropertyStatus.LISTED]: 'Publiée',
      [PropertyStatus.FLAGGED]: 'Signalée',
      [PropertyStatus.ARCHIVED]: 'Archivée',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: PropertyStatus) => {
    const colors: Record<PropertyStatus, string> = {
      [PropertyStatus.DRAFT]: 'bg-gray-500',
      [PropertyStatus.REVIEW]: 'bg-yellow-500',
      [PropertyStatus.LISTED]: 'bg-primary',
      [PropertyStatus.FLAGGED]: 'bg-red-500',
      [PropertyStatus.ARCHIVED]: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-primary mb-4"></div>
          <div className="text-sm font-medium text-gray-700">Chargement...</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main id="main-content" className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8 page-transition">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="h-10 w-40 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <PropertyListSkeleton count={6} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-viridial-50/30">
      <Header />
      <main id="main-content" className="flex flex-1 flex-col page-transition">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-viridial-600 via-viridial-500 to-teal-500 py-12 lg:py-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full opacity-10 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-white rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {t('property.list.hero.title')}
                </h1>
                <p className="text-lg text-viridial-50">
                  {t('property.list.hero.subtitle')}
                </p>
              </div>
              <Link href="/properties/new">
                <Button size="lg" className="bg-white text-viridial-600 hover:bg-gray-50 border-0 shadow-xl hover:shadow-2xl transition-all">
                  <Plus className="mr-2 h-5 w-5" />
                  {t('property.list.hero.newProperty')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">

          {error && (
            <Card className="mb-8 border-2 border-red-200 bg-red-50 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {properties.length === 0 ? (
            <EmptyState
              icon={Home}
              title={t('property.list.empty.title')}
              description={t('property.list.empty.description')}
              actionLabel={t('property.list.empty.action')}
              actionHref="/properties/new"
              className="fade-in"
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property, index) => {
                const mainTranslation = property.translations[0];
                const imageUrl = property.mediaUrls && property.mediaUrls.length > 0
                  ? property.mediaUrls[0]
                  : `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80`;
                
                return (
                  <Card 
                    key={property.id} 
                    className="group border-2 border-gray-200 hover:border-viridial-300 hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => router.push(`/properties/${property.id}`)}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <Image
                        src={imageUrl}
                        alt={mainTranslation?.title || 'Propriété'}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge 
                          className={`${getStatusColor(property.status)} text-white border-0 shadow-lg backdrop-blur-sm`}
                        >
                          {getStatusLabel(property.status)}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-viridial-600 transition-colors duration-200">
                        {mainTranslation?.title || 'Sans titre'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                        <MapPin className="h-4 w-4 text-viridial-500" />
                        <span className="capitalize">{property.type}</span>
                        {property.city && <span> • {property.city}</span>}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-5">
                        <p className="text-2xl font-bold text-gray-900">
                          {property.price.toLocaleString('fr-FR')} {property.currency}
                        </p>
                        {mainTranslation?.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {mainTranslation.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/properties/${property.id}`} className="flex-1 min-w-[90px]">
                          <Button variant="outline" size="sm" className="w-full border-gray-300 hover:bg-gray-50 text-sm transition-all">
                            <Eye className="mr-1.5 h-4 w-4" />
                            {t('property.list.actions.view')}
                          </Button>
                        </Link>
                        <Link href={`/properties/${property.id}/edit`} className="flex-1 min-w-[90px]">
                          <Button variant="outline" size="sm" className="w-full border-gray-300 hover:bg-gray-50 text-sm transition-all">
                            <Edit className="mr-1.5 h-4 w-4" />
                            {t('property.list.actions.edit')}
                          </Button>
                        </Link>
                        {property.status !== PropertyStatus.LISTED && (
                          <Button
                            variant="success"
                            size="sm"
                            className="flex-1 min-w-[90px] text-sm bg-gradient-to-r from-viridial-500 to-viridial-600 hover:from-viridial-600 hover:to-viridial-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublish(property.id);
                            }}
                          >
                            <Upload className="mr-1.5 h-4 w-4" />
                            Publier
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          className="text-sm bg-red-600 hover:bg-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(property.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

