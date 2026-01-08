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

export default function PublicPropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { isAuthenticated } = useAuth();
  const propertyService = usePropertyService();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Public access - no authentication required
      const data = await propertyService.findOne(propertyId);
      setProperty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Propriété non trouvée ou non disponible');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <div className="text-lg">Chargement...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex gap-2">
                <Link href="/browse">
                  <Button variant="outline">Retour à la liste</Button>
                </Link>
                {isAuthenticated && (
                  <Link href="/properties">
                    <Button>Mes Propriétés</Button>
                  </Link>
                )}
              </div>
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
  const isOwner = isAuthenticated && property.userId; // You can add user ID check here if needed

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-6">
            <Link href="/browse" className="text-sm text-[var(--color-muted)] hover:underline">
              ← Retour à la liste
            </Link>
          </div>

          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[var(--color-primary)]">
                {mainTranslation?.title || 'Sans titre'}
              </h1>
              <div className="mt-2 flex items-center gap-4">
                <span className="px-3 py-1 text-sm text-white rounded bg-green-500">
                  Disponible
                </span>
                <span className="text-sm text-[var(--color-muted)]">
                  {property.type} • {property.city || 'Ville non spécifiée'}
                </span>
              </div>
            </div>
            {isAuthenticated && isOwner && (
              <div className="flex gap-2">
                <Link href={`/properties/${property.id}/edit`}>
                  <Button variant="outline">Modifier</Button>
                </Link>
                <Link href={`/properties/${property.id}`}>
                  <Button variant="outline">Vue gestion</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {mainTranslation?.description ? (
                    <p className="whitespace-pre-wrap text-[var(--color-muted)]">
                      {mainTranslation.description}
                    </p>
                  ) : (
                    <p className="text-[var(--color-muted)] italic">Aucune description</p>
                  )}
                </CardContent>
              </Card>

              {/* Médias */}
              {property.mediaUrls && property.mediaUrls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Médias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {property.mediaUrls.map((url, index) => (
                        <div key={index} className="relative aspect-video bg-gray-100 rounded overflow-hidden">
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
                <Card>
                  <CardHeader>
                    <CardTitle>Traductions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {property.translations.map((trans, index) => (
                        <div key={index} className="border-b border-[var(--color-neutral-400)] pb-4 last:border-0">
                          <div className="font-semibold text-sm uppercase text-[var(--color-muted)] mb-2">
                            {trans.language}
                          </div>
                          <h3 className="font-semibold mb-2">{trans.title}</h3>
                          {trans.description && (
                            <p className="text-sm text-[var(--color-muted)]">{trans.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Prix */}
              <Card>
                <CardHeader>
                  <CardTitle>Prix</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[var(--color-primary)]">
                    {property.price.toLocaleString()} {property.currency}
                  </p>
                </CardContent>
              </Card>

              {/* Adresse */}
              <Card>
                <CardHeader>
                  <CardTitle>Adresse</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    {property.street && <p>{property.street}</p>}
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
                      <p className="text-xs text-[var(--color-muted)] mt-2">
                        📍 {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informations */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Type:</span>
                      <span className="font-medium">{property.type}</span>
                    </div>
                    {property.publishedAt && (
                      <div className="flex justify-between">
                        <span className="text-[var(--color-muted)]">Publié le:</span>
                        <span className="font-medium">
                          {new Date(property.publishedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Button */}
              {isAuthenticated && (
                <Card>
                  <CardContent className="pt-6">
                    <Button className="w-full">
                      Contacter le propriétaire
                    </Button>
                    <p className="text-xs text-center text-[var(--color-muted)] mt-2">
                      Connectez-vous pour contacter
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

