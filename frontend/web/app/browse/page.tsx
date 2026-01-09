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
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-green-600 mb-4"></div>
            <div className="text-sm font-medium text-gray-700">Chargement...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Propriétés Disponibles
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Découvrez nos propriétés immobilières
              </p>
            </div>
            {isAuthenticated && (
              <Link href="/properties">
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                  Mes Propriétés
                </Button>
              </Link>
            )}
          </div>

          {error && (
            <Card className="mb-6 border border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {properties.length === 0 ? (
            <Card className="border border-gray-200 bg-white">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">
                  Aucune propriété disponible pour le moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => {
                const mainTranslation = property.translations[0];
                return (
                  <Card key={property.id} className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {mainTranslation?.title || 'Sans titre'}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 mt-1">
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
                      <Link href={`/property/${property.id}`}>
                        <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50">
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

