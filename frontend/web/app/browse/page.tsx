'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  ArrowRight, 
  Heart,
  Home,
  Leaf,
  Sparkles
} from 'lucide-react';

export default function BrowsePropertiesPage() {
  const { t } = useTranslation();
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

  const getPropertyImage = (property: Property) => {
    if (property.mediaUrls && property.mediaUrls.length > 0) {
      return property.mediaUrls[0];
    }
    // Placeholder image based on property type
    return `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80`;
  };

  const getPropertyFeatures = (property: Property) => {
    const features: { icon: React.ReactNode; label: string }[] = [];
    
    // Extract from translations or use defaults
    // Note: Features are stored in the backend but not in the frontend Property interface yet
    // For now, we'll use placeholder data or extract from translations if available
    const mainTranslation = property.translations[0];
    
    // Try to extract from description or use neighborhood features if available
    if (property.neighborhood?.features) {
      const neighborhoodFeatures = property.neighborhood.features;
      // Add neighborhood-based features if available
    }
    
    // For now, return empty array - features will be added when backend provides them
    // This prevents TypeScript errors while maintaining the UI structure
    
    return features;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-viridial-50/30">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-viridial-200 border-t-primary mb-4"></div>
            <div className="text-base font-medium text-gray-700">{t('search.browse.loading')}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-viridial-50/30">
      <Header />
      <main id="main-content" className="flex flex-1 flex-col">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-viridial-600 via-viridial-500 to-teal-500 py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <div className="text-center text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                {t('search.browse.hero.badge')}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t('search.browse.hero.title')}
              </h1>
              <p className="text-xl md:text-2xl text-viridial-50 max-w-3xl mx-auto mb-8">
                {t('search.browse.hero.subtitle')}
              </p>
              {isAuthenticated && (
                <Link href="/properties">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm">
                    <Home className="mr-2 h-5 w-5" />
                    {t('search.browse.hero.myProperties')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            {error && (
              <Card className="mb-8 border-2 border-red-200 bg-red-50 shadow-lg">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </CardContent>
              </Card>
            )}

            {properties.length === 0 ? (
              <Card className="border-2 border-gray-200 bg-white shadow-lg">
                <CardContent className="pt-12 pb-12 text-center">
                  <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('search.browse.empty.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('search.browse.empty.description')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((property, index) => {
                  const mainTranslation = property.translations[0];
                  const imageUrl = getPropertyImage(property);
                  const features = getPropertyFeatures(property);
                  // Check if property is eco-certified from neighborhood or other sources
                  const isEco = property.neighborhood?.features?.qualityOfLife 
                    ? property.neighborhood.features.qualityOfLife > 7 
                    : false;

                  return (
                    <Card 
                      key={property.id} 
                      className="group border-2 border-gray-200 hover:border-viridial-300 hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Image Section */}
                      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <Image
                          src={imageUrl}
                          alt={mainTranslation?.title || 'Propriété'}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {isEco && (
                            <Badge className="bg-viridial-500 text-white border-0 shadow-lg backdrop-blur-sm">
                              <Leaf className="h-3 w-3 mr-1" />
                              {t('search.browse.ecoCertified')}
                            </Badge>
                          )}
                          <Badge className="bg-white/90 text-gray-900 border-0 shadow-lg backdrop-blur-sm capitalize">
                            {property.type}
                          </Badge>
                        </div>

                        {/* Favorite Button */}
                        <button 
                          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Heart className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
                        </button>
                      </div>

                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-viridial-600 transition-colors line-clamp-2">
                          {mainTranslation?.title || 'Sans titre'}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                          <MapPin className="h-4 w-4 text-viridial-500" />
                          {property.city && <span>{property.city}</span>}
                          {property.region && property.city && <span> • </span>}
                          {property.region && <span>{property.region}</span>}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Price */}
                        <div className="mb-4">
                          <p className="text-2xl font-bold text-gray-900">
                            {property.price.toLocaleString('fr-FR')} {property.currency}
                          </p>
                        </div>

                        {/* Features */}
                        {features.length > 0 && (
                          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                            {features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-sm text-gray-600">
                                <span className="text-viridial-600">{feature.icon}</span>
                                <span>{feature.label}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Description */}
                        {mainTranslation?.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                            {mainTranslation.description}
                          </p>
                        )}

                        {/* CTA Button */}
                        <Link href={`/property/${property.id}`}>
                          <Button 
                            className="w-full bg-gradient-to-r from-viridial-500 via-viridial-600 to-viridial-700 hover:from-viridial-600 hover:via-viridial-700 hover:to-viridial-800 text-white border-0 shadow-lg hover:shadow-xl transition-all group/btn"
                          >
                            {t('search.browse.viewDetails')}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
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

