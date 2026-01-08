'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { useAuth } from '@/contexts/AuthContext';

export default function BrowsePropertiesPage() {
  const propertyService = usePropertyService();
  const { isAuthenticated } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Load only LISTED properties (public)
      const response = await propertyService.findAll({ 
        status: PropertyStatus.LISTED,
        limit: 50 
      });
      setProperties(response.properties);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des propriétés');
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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[var(--color-primary)]">
                Propriétés Disponibles
              </h1>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Découvrez nos propriétés immobilières
              </p>
            </div>
            {isAuthenticated && (
              <Link href="/properties">
                <Button variant="outline">Mes Propriétés</Button>
              </Link>
            )}
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
                <p className="text-[var(--color-muted)]">
                  Aucune propriété disponible pour le moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => {
                const mainTranslation = property.translations[0];
                return (
                  <Card key={property.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {mainTranslation?.title || 'Sans titre'}
                      </CardTitle>
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
                      <Link href={`/property/${property.id}`}>
                        <Button variant="outline" className="w-full">
                          Voir les détails
                        </Button>
                      </Link>
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

