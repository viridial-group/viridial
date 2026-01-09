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
import { Home, Plus } from 'lucide-react';

export default function PropertiesPage() {
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
      title: 'Supprimer la propriété',
      description: 'Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible.',
      variant: 'danger',
      confirmLabel: 'Supprimer',
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main id="main-content" className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8 page-transition">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Mes Propriétés
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Gérez vos annonces immobilières
              </p>
            </div>
            <Link href="/properties/new">
              <Button className="bg-primary hover:bg-viridial-700 text-white border-0 btn-press scale-on-hover">
                + Nouvelle Propriété
              </Button>
            </Link>
          </div>

          {error && (
            <Card className="mb-6 border border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {properties.length === 0 ? (
            <EmptyState
              icon={Home}
              title="Aucune propriété pour le moment"
              description="Commencez à créer votre première propriété et gérez facilement toutes vos annonces immobilières depuis un seul endroit."
              actionLabel="Créer votre première propriété"
              actionHref="/properties/new"
              className="fade-in"
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property, index) => {
                const mainTranslation = property.translations[0];
                return (
                  <Card 
                    key={property.id} 
                    className="stagger-item card-hover border border-gray-200 bg-white overflow-hidden cursor-pointer group"
                    onClick={() => router.push(`/properties/${property.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2 flex-1 group-hover:text-primary transition-colors duration-200">
                          {mainTranslation?.title || 'Sans titre'}
                        </CardTitle>
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold text-white rounded-md border border-gray-300 ${getStatusColor(
                            property.status,
                          )}`}
                        >
                          {getStatusLabel(property.status)}
                        </span>
                      </div>
                      <CardDescription className="text-xs text-gray-500 mt-2">
                        <span className="capitalize">{property.type}</span>
                        {property.city && <span> • {property.city}</span>}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-5">
                        <p className="text-xl font-bold text-gray-900">
                          {property.price.toLocaleString()} {property.currency}
                        </p>
                        {mainTranslation?.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {mainTranslation.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/properties/${property.id}`} className="flex-1 min-w-[80px]">
                          <Button variant="outline" size="sm" className="w-full border-gray-300 hover:bg-gray-50 text-sm btn-press scale-on-hover">
                            Voir
                          </Button>
                        </Link>
                        <Link href={`/properties/${property.id}/edit`} className="flex-1 min-w-[80px]">
                          <Button variant="outline" size="sm" className="w-full border-gray-300 hover:bg-gray-50 text-sm btn-press scale-on-hover">
                            Modifier
                          </Button>
                        </Link>
                        {property.status !== PropertyStatus.LISTED && (
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-1 min-w-[80px] text-sm bg-primary hover:bg-viridial-700 btn-press scale-on-hover"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublish(property.id);
                          }}
                        >
                          Publier
                        </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          className="btn-press scale-on-hover text-sm bg-red-600 hover:bg-red-700 border-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(property.id);
                          }}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

