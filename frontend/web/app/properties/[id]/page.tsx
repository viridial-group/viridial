'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const propertyService = usePropertyService();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && propertyId) {
      loadProperty();
    }
  }, [isAuthenticated, propertyId]);

  const loadProperty = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await propertyService.findOne(propertyId);
      setProperty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Propriété non trouvée');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Publier cette propriété ? Elle sera visible publiquement.')) {
      return;
    }

    try {
      setIsPublishing(true);
      await propertyService.publish(propertyId);
      await loadProperty();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la publication');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible.')) {
      return;
    }

    try {
      await propertyService.delete(propertyId);
      router.push('/properties');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-green-600 mb-4"></div>
          <div className="text-sm font-medium text-gray-700">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="border border-gray-200 bg-white">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-red-700 mb-5">{error}</p>
              <Link href="/properties">
                <Button className="bg-green-600 hover:bg-green-700 text-white border-0">
                  Retour à la liste
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const mainTranslation = property.translations[0];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-6">
            <Link href="/properties" className="text-sm text-gray-500 hover:text-gray-700 font-medium inline-flex items-center gap-1">
              ← Retour à la liste
            </Link>
          </div>

          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                {mainTranslation?.title || 'Sans titre'}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-2.5 py-1 text-xs font-semibold text-white rounded-md border border-gray-300 ${getStatusColor(
                    property.status,
                  )}`}
                >
                  {getStatusLabel(property.status)}
                </span>
                <span className="text-sm text-gray-500">
                  <span className="capitalize">{property.type}</span>
                  {property.city && <span> • {property.city}</span>}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link href={`/properties/${property.id}/edit`}>
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                  Modifier
                </Button>
              </Link>
              {property.status !== PropertyStatus.LISTED && (
                <Button
                  variant="success"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-green-600 hover:bg-green-700 text-white border-0"
                >
                  {isPublishing ? 'Publication...' : 'Publier'}
                </Button>
              )}
              <Button variant="danger" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-0">
                Supprimer
              </Button>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-5">
              {/* Description */}
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Description</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {mainTranslation?.description ? (
                    <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">
                      {mainTranslation.description}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">Aucune description</p>
                  )}
                </CardContent>
              </Card>

              {/* Médias */}
              {property.mediaUrls && property.mediaUrls.length > 0 && (
                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">Médias</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      {property.mediaUrls.map((url, index) => (
                        <div key={index} className="relative aspect-video bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                          <img
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Traductions */}
              {property.translations.length > 1 && (
                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">Traductions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {property.translations.map((trans, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                          <div className="font-semibold text-xs uppercase text-gray-500 mb-2">
                            {trans.language}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{trans.title}</h3>
                          {trans.description && (
                            <p className="text-sm text-gray-600 leading-relaxed">{trans.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Prix */}
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Prix</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl font-bold text-gray-900">
                    {property.price.toLocaleString()} {property.currency}
                  </p>
                </CardContent>
              </Card>

              {/* Adresse */}
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Adresse</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1.5 text-sm text-gray-700">
                    {property.street && <p className="font-medium">{property.street}</p>}
                    {(property.postalCode || property.city) && (
                      <p>
                        {property.postalCode} {property.city}
                      </p>
                    )}
                    {(property.region || property.country) && (
                      <p>
                        {property.region}
                        {property.region && property.country ? ', ' : ''}
                        {property.country}
                      </p>
                    )}
                    {property.latitude && property.longitude && (
                      <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                        📍 {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informations */}
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Informations</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium text-gray-900 capitalize">{property.type}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">Créé le:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(property.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {property.publishedAt && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                        <span className="text-gray-500">Publié le:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(property.publishedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

