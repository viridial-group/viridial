'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Property, PropertyStatus, PropertyService } from '@/lib/api/property';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import PropertyDetailSidebar from '@/components/property/PropertyDetailSidebar';
import dynamic from 'next/dynamic';

// Dynamically import Map component (client-side only)
const PropertyMapWithPOI = dynamic(() => import('@/components/property/PropertyMapWithPOI'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
      Chargement de la carte...
    </div>
  ),
});

// Create a public property service instance (no authentication)
const PROPERTY_API_URL = process.env.NEXT_PUBLIC_PROPERTY_API_URL || 'http://localhost:3001';
const publicPropertyService = new PropertyService(PROPERTY_API_URL, () => null);

export default function PublicPropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { isAuthenticated } = useAuth();
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
      const data = await publicPropertyService.findOne(propertyId);
      setProperty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Propriété non trouvée ou non disponible');
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
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-primary mb-4"></div>
            <div className="text-sm font-medium text-gray-700">Chargement...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="border border-gray-200 bg-white">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-red-700 mb-5">{error}</p>
              <div className="flex gap-2">
                <Link href="/browse">
                  <Button variant="outline" className="border-gray-300 hover:bg-gray-50">Retour à la liste</Button>
                </Link>
                {isAuthenticated && (
                  <Link href="/properties">
                    <Button className="bg-primary hover:bg-viridial-700 text-white border-0">Mes Propriétés</Button>
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-6">
            <Link href="/browse" className="text-sm text-gray-500 hover:text-gray-700 font-medium inline-flex items-center gap-1">
              ← Retour à la liste
            </Link>
          </div>

          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                {mainTranslation?.title || 'Sans titre'}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-2.5 py-1 text-xs font-semibold text-white rounded-md bg-primary border border-gray-300">
                  Disponible
                </span>
                <span className="text-sm text-gray-500">
                  <span className="capitalize">{property.type}</span>
                  {property.city && <span> • {property.city}</span>}
                </span>
              </div>
            </div>
            {isAuthenticated && isOwner && (
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/properties/${property.id}/edit`}>
                  <Button variant="outline" className="border-gray-300 hover:bg-gray-50">Modifier</Button>
                </Link>
                <Link href={`/properties/${property.id}`}>
                  <Button variant="outline" className="border-gray-300 hover:bg-gray-50">Vue gestion</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Map Section - Full Width with POIs */}
          {property.latitude && property.longitude && (
            <Card className="border border-gray-200 bg-white mb-6 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Localisation et Points d'intérêt</CardTitle>
                  {property.neighborhood && (
                    <Badge variant="outline" className="border-viridial-300 text-viridial-700">
                      {property.neighborhood.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 p-0">
                <div className="h-[500px] w-full rounded-lg overflow-hidden border-t border-gray-200">
                  <PropertyMapWithPOI property={property} showNeighborhood={true} />
                </div>
              </CardContent>
            </Card>
          )}

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

            {/* Sidebar - Enhanced with tabs */}
            <div>
              <PropertyDetailSidebar property={property} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

