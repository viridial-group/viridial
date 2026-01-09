'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNeighborhoodService, Neighborhood, NeighborhoodFilters } from '@/lib/api/neighborhood';
import NeighborhoodCard from '@/components/neighborhood/NeighborhoodCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/simple-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Home, TrendingUp } from 'lucide-react';

export default function NeighborhoodsPage() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<NeighborhoodFilters>({
    limit: 20,
    offset: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const { toast } = useToast();

  // Liste des villes disponibles (basée sur les données de test)
  const cities = [
    'Paris', 'Lyon', 'Nice', 'Bordeaux', 'Marseille', 'Toulouse', 'Lille', 'Nantes',
    'Cannes', 'Strasbourg', 'Montpellier', 'Rennes', 'Reims', 'La Rochelle', 'Annecy',
    'Grenoble', 'Dijon', 'Aix-en-Provence', 'Angers', 'Nancy', 'Clermont-Ferrand', 'Tours', 'Poitiers',
  ];

  const regions = [
    'Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur', 'Nouvelle-Aquitaine',
    'Occitanie', 'Hauts-de-France', 'Pays de la Loire', 'Grand Est', 'Bretagne',
    'Bourgogne-Franche-Comté', 'Centre-Val de Loire',
  ];

  const loadNeighborhoods = useCallback(async () => {
    try {
      setLoading(true);
      const currentService = getNeighborhoodService(); // Dynamically get service
      if (searchMode && searchQuery.trim()) {
        const results = await currentService.search(searchQuery, 20);
        setNeighborhoods(results);
        setTotal(results.length);
      } else {
        const response = await currentService.findAll(filters);
        setNeighborhoods(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Error loading neighborhoods:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les quartiers. Veuillez réessayer.',
        variant: 'error',
      });
      setNeighborhoods([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, searchMode, toast]);

  useEffect(() => {
    loadNeighborhoods();
  }, [loadNeighborhoods]);

  const handleFilterChange = (key: keyof NeighborhoodFilters, value: string | number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      offset: 0, // Reset offset when filters change
    }));
    setSearchMode(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchMode(true);
      loadNeighborhoods();
    } else {
      setSearchMode(false);
      loadNeighborhoods();
    }
  };

  const clearFilters = () => {
    setFilters({ limit: 20, offset: 0 });
    setSearchQuery('');
    setSearchMode(false);
  };

  const hasActiveFilters = filters.city || filters.region || filters.country || searchQuery.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quartiers</h1>
              <p className="text-gray-600 mt-1">Découvrez les meilleurs quartiers de France</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un quartier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-primary hover:bg-viridial-700 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-gray-300"
                >
                  Réinitialiser
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                value={filters.city || 'all'}
                onValueChange={(value) => handleFilterChange('city', value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="border-gray-300 focus:border-primary">
                  <SelectValue placeholder="Toutes les villes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.region || 'all'}
                onValueChange={(value) => handleFilterChange('region', value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="border-gray-300 focus:border-primary">
                  <SelectValue placeholder="Toutes les régions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les régions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.country || 'all'}
                onValueChange={(value) => handleFilterChange('country', value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="border-gray-300 focus:border-primary">
                  <SelectValue placeholder="Tous les pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            {!loading && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {total} quartier{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
                </span>
                {hasActiveFilters && (
                  <span className="text-primary font-medium">
                    Filtres actifs
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : neighborhoods.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Aucun quartier trouvé"
            description={
              searchMode
                ? `Aucun quartier ne correspond à "${searchQuery}". Essayez une autre recherche.`
                : "Aucun quartier ne correspond aux filtres sélectionnés."
            }
            actionLabel="Réinitialiser les filtres"
            onAction={clearFilters}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {neighborhoods.map((neighborhood) => (
                <NeighborhoodCard
                  key={neighborhood.id}
                  neighborhood={neighborhood}
                  language="fr"
                />
              ))}
            </div>

            {/* Pagination */}
            {!searchMode && total > (filters.limit || 20) && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setFilters((prev) => ({
                    ...prev,
                    offset: Math.max(0, (prev.offset || 0) - (prev.limit || 20)),
                  }))}
                  disabled={(filters.offset || 0) === 0}
                  className="border-gray-300"
                >
                  Précédent
                </Button>
                <span className="text-sm text-gray-600">
                  Page {Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1} sur{' '}
                  {Math.ceil(total / (filters.limit || 20))}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setFilters((prev) => ({
                    ...prev,
                    offset: (prev.offset || 0) + (prev.limit || 20),
                  }))}
                  disabled={(filters.offset || 0) + (filters.limit || 20) >= total}
                  className="border-gray-300"
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

