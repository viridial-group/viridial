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

export default function PropertiesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const propertyService = usePropertyService();
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette propriété ?')) {
      return;
    }

    try {
      await propertyService.delete(id);
      await loadProperties();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await propertyService.publish(id);
      await loadProperties();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la publication');
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
      [PropertyStatus.LISTED]: 'bg-green-500',
      [PropertyStatus.FLAGGED]: 'bg-red-500',
      [PropertyStatus.ARCHIVED]: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[var(--color-primary)]">
                Mes Propriétés
              </h1>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Gérez vos annonces immobilières
              </p>
            </div>
            <Link href="/properties/new">
              <Button className="rounded-md">
                + Nouvelle Propriété
              </Button>
            </Link>
          </div>

          {error && (
            <Card className="mb-6 border-red-500 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {properties.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-[var(--color-muted)] mb-4">
                  Vous n'avez pas encore de propriétés.
                </p>
                <Link href="/properties/new">
                  <Button>Créer votre première propriété</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => {
                const mainTranslation = property.translations[0];
                return (
                  <Card key={property.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          {mainTranslation?.title || 'Sans titre'}
                        </CardTitle>
                        <span
                          className={`px-2 py-1 text-xs text-white rounded ${getStatusColor(
                            property.status,
                          )}`}
                        >
                          {getStatusLabel(property.status)}
                        </span>
                      </div>
                      <CardDescription>
                        {property.type} • {property.city || 'Ville non spécifiée'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-2xl font-bold text-[var(--color-primary)]">
                          {property.price.toLocaleString()} {property.currency}
                        </p>
                        {mainTranslation?.description && (
                          <p className="text-sm text-[var(--color-muted)] line-clamp-2">
                            {mainTranslation.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Link href={`/properties/${property.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Voir
                          </Button>
                        </Link>
                        <Link href={`/properties/${property.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Modifier
                          </Button>
                        </Link>
                        {property.status !== PropertyStatus.LISTED && (
                          <Button
                            variant="success"
                            size="sm"
                            className="flex-1"
                            onClick={() => handlePublish(property.id)}
                          >
                            Publier
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(property.id)}
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

