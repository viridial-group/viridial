'use client';

import { Suspense, useEffect } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PropertyType, PropertyStatus } from '@/lib/api/property';
import { Search, SlidersHorizontal, MapPin, DollarSign, Home, Building, LandPlot, Store, X } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

function SearchPageContent() {
  const {
    query,
    setQuery,
    filters,
    updateFilters,
    clearFilters,
    searchOptions,
    results,
    suggestions,
    isLoading,
    error,
    search,
  } = useSearch();

  // Perform initial search if query exists
  useEffect(() => {
    if (query || Object.keys(filters).length > 0) {
      search();
    }
  }, []); // Only run on mount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search();
  };

  const propertyTypeIcon = (type: PropertyType) => {
    switch (type) {
      case PropertyType.HOUSE:
        return <Home className="h-4 w-4" />;
      case PropertyType.APARTMENT:
        return <Building className="h-4 w-4" />;
      case PropertyType.VILLA:
        return <Home className="h-4 w-4" />;
      case PropertyType.LAND:
        return <LandPlot className="h-4 w-4" />;
      case PropertyType.COMMERCIAL:
        return <Store className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || query.length > 0;

  return (
    <div className="min-h-screen bg-[var(--color-neutral-200)]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">
            Recherche de Propriétés
          </h1>
          <p className="text-[var(--color-muted)]">
            Trouvez la propriété idéale parmi nos annonces
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--color-muted)] z-10" />
                <Input
                  type="text"
                  placeholder="Rechercher une propriété (ex: appartement Paris, villa côte d'azur...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-10 h-12 text-lg"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      search('', filters);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-primary)] z-10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto top-full">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => {
                          setQuery(suggestion.title);
                          search(suggestion.title, filters);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        <div className="font-medium text-[var(--color-primary)]">{suggestion.title}</div>
                        {suggestion.city && (
                          <div className="text-sm text-[var(--color-muted)]">{suggestion.city}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={filters.type || 'all'}
                    onValueChange={(value: string) =>
                      updateFilters({ type: value !== 'all' ? (value as PropertyType) : undefined })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {Object.values(PropertyType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Country Filter */}
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    placeholder="France, Espagne..."
                    value={filters.country || ''}
                    onChange={(e) => updateFilters({ country: e.target.value || undefined })}
                  />
                </div>

                {/* City Filter */}
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Paris, Lyon..."
                    value={filters.city || ''}
                    onChange={(e) => updateFilters({ city: e.target.value || undefined })}
                  />
                </div>

                {/* Price Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="minPrice">Prix min</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) =>
                        updateFilters({
                          minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPrice">Prix max</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ''}
                      onChange={(e) =>
                        updateFilters({
                          maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Recherche...' : 'Rechercher'}
                </Button>
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setQuery('');
                      clearFilters();
                    }}
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[var(--color-muted)]">
                {results.total} résultat{results.total !== 1 ? 's' : ''} trouvé{results.total !== 1 ? 's' : ''}
                {results.processingTimeMs && (
                  <span className="ml-2 text-sm">
                    (en {results.processingTimeMs}ms)
                  </span>
                )}
              </p>
              {hasActiveFilters && (
                <div className="flex gap-2 flex-wrap">
                  {query && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {query}
                      <button
                        onClick={() => {
                          setQuery('');
                          search('', filters);
                        }}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.type && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Type: {filters.type}
                      <button
                        onClick={() => updateFilters({ type: undefined })}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.country && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Pays: {filters.country}
                      <button
                        onClick={() => updateFilters({ country: undefined })}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.city && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Ville: {filters.city}
                      <button
                        onClick={() => updateFilters({ city: undefined })}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {results.hits.length === 0 ? (
              <Card className="p-8 text-center">
                <CardTitle>Aucun résultat trouvé</CardTitle>
                <p className="text-[var(--color-muted)] mt-2">
                  Essayez de modifier vos critères de recherche
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.hits.map((property) => {
                  const translation = property.translations.find((t) => t.language === 'fr') || property.translations[0];
                  return (
                    <Link key={property.id} href={`/properties/${property.id}`}>
                      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-xl text-[var(--color-primary)] line-clamp-2">
                              {translation?.title || 'Titre non disponible'}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-[var(--color-muted)]">
                            {propertyTypeIcon(property.type)}
                            <span>{property.type.charAt(0).toUpperCase() + property.type.slice(1)}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col">
                          <div className="flex items-center gap-1 text-lg font-bold text-[var(--color-accent)] mb-2">
                            <DollarSign className="h-5 w-5" />
                            {property.price.toLocaleString()} {property.currency}
                          </div>
                          {property.city && (
                            <div className="flex items-center gap-1 text-sm text-[var(--color-muted)] mb-2">
                              <MapPin className="h-4 w-4" />
                              {property.city}
                              {property.country && `, ${property.country}`}
                            </div>
                          )}
                          {translation?.description && (
                            <p className="text-sm text-[var(--color-muted)] line-clamp-3 mb-4 flex-grow">
                              {translation.description}
                            </p>
                          )}
                          {property.mediaUrls && property.mediaUrls.length > 0 && (
                            <div className="relative aspect-video overflow-hidden rounded-md bg-gray-200">
                              <img
                                src={property.mediaUrls[0]}
                                alt={translation?.title || 'Property'}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {results.total > (results.limit || 20) && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: Math.ceil(results.total / (results.limit || 20)) }, (_, i) => i + 1)
                  .slice(0, 10)
                  .map((page) => (
                    <Button
                      key={page}
                      variant={results.offset === (page - 1) * (results.limit || 20) ? 'default' : 'outline'}
                      onClick={() => {
                        const limit = searchOptions.limit || 20;
                        const newOffset = (page - 1) * limit;
                        // Use the hook's goToPage method
                        search(query, filters, { ...searchOptions, offset: newOffset });
                      }}
                    >
                      {page}
                    </Button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Initial state */}
        {!results && !isLoading && !error && (
          <Card className="p-8 text-center">
            <CardTitle>Commencez votre recherche</CardTitle>
            <p className="text-[var(--color-muted)] mt-2">
              Utilisez le formulaire ci-dessus pour rechercher des propriétés
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}

