'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSearch } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyType, PropertyStatus } from '@/lib/api/property';
import { PropertySearchResult } from '@/lib/api/search';
import { 
  Search, X, MapPin, DollarSign, Home, Building, LandPlot, Store, 
  ChevronRight, SlidersHorizontal, List, Map, ChevronLeft, 
  Navigation, Star, Clock, Layers, Crosshair, TrendingUp, Filter, Square, CheckSquare
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import SearchStats from '@/components/search/SearchStats';
import PriceRangeSlider from '@/components/search/PriceRangeSlider';
import KeyboardShortcuts from '@/components/search/KeyboardShortcuts';
import SavedSearches, { useSaveSearch } from '@/components/search/SavedSearches';

// Dynamically import Map component (client-side only)
const MapComponent = dynamic(() => import('@/components/search/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-500">Chargement de la carte...</div>
    </div>
  ),
});

function SearchPageContent() {
  const {
    query,
    setQuery,
    filters,
    updateFilters,
    clearFilters,
    searchOptions,
    setSearchOptions,
    results,
    suggestions,
    isLoading,
    error,
    search,
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertySearchResult | null>(null);
  const [showResultsPanel, setShowResultsPanel] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'distance'>('relevance');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [drawBoundsEnabled, setDrawBoundsEnabled] = useState(false);
  const { saveSearch } = useSaveSearch();
  
  // Mock mode state - initialized from env, then synced with localStorage on client
  const [isMockMode, setIsMockMode] = useState(() => 
    process.env.NEXT_PUBLIC_USE_MOCK_SEARCH === 'true'
  );
  
  // Sync mock mode with localStorage on client mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMockMode = localStorage.getItem('useMockSearch') === 'true';
      const envMockMode = process.env.NEXT_PUBLIC_USE_MOCK_SEARCH === 'true';
      setIsMockMode(envMockMode || savedMockMode);
    }
  }, []);

  // Count active filters (excluding bounds coordinates when using radius)
  useEffect(() => {
    const count = Object.entries(filters).filter(([key, v]) => {
      if (v === undefined || v === null || v === '') return false;
      // Don't count individual bound coordinates if radius is set (they're redundant)
      if (filters.radiusKm && (key === 'northEastLat' || key === 'northEastLng' || key === 'southWestLat' || key === 'southWestLng')) {
        return false;
      }
      return true;
    }).length;
    setActiveFiltersCount(count);
  }, [filters]);

  // Perform initial search if query exists
  useEffect(() => {
    if (query || Object.keys(filters).length > 0) {
      search();
    }
  }, []); // Only run on mount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search();
    setIsSearchFocused(false);
    searchInputRef.current?.blur();
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.title || '');
    setIsSearchFocused(false);
    search();
    searchInputRef.current?.blur();
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

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadgeVariant = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.LISTED:
        return 'default';
      case PropertyStatus.DRAFT:
        return 'secondary';
      case PropertyStatus.REVIEW:
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    if (isSearchFocused) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearchFocused]);

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Search Bar - Enhanced Google Maps style */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Logo/Brand */}
            <Link href="/" className="flex-shrink-0 hidden sm:block">
              <div className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors">
                Viridial
              </div>
            </Link>

            {/* Enhanced Search Input - Google Maps style */}
            <form onSubmit={handleSubmit} className="flex-1 relative max-w-2xl" ref={searchInputRef as any}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Rechercher une propriété, un lieu, une adresse..."
                  className={`pl-12 pr-12 h-12 text-base border-2 rounded-full shadow-sm transition-all ${
                    isSearchFocused
                      ? 'border-green-500 shadow-lg'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      search();
                      setIsSearchFocused(false);
                    }}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {query && (
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-green-600 hover:bg-green-700 rounded-full p-2 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Enhanced Suggestions dropdown */}
              {isSearchFocused && suggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[400px] overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase">
                      Suggestions
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 rounded-md transition-colors group"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <Search className="h-4 w-4 text-gray-500 group-hover:text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{suggestion.title || 'Suggestion'}</div>
                          {suggestion.city && (
                            <div className="text-sm text-gray-500">{suggestion.city}</div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No suggestions message */}
              {isSearchFocused && query.length >= 2 && !isLoading && suggestions && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 p-4 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Aucune suggestion trouvée</p>
                  <p className="text-sm">Appuyez sur Entrée pour rechercher</p>
                </div>
              )}
            </form>

            {/* Action Buttons Group */}
            <div className="flex items-center gap-2">
              {/* Save Search Button */}
              {(query || activeFiltersCount > 0) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const name = prompt('Nom de la recherche à sauvegarder:', query || 'Recherche sans nom');
                    if (name !== null) {
                      saveSearch(name, query, filters, searchOptions);
                      alert('Recherche sauvegardée !');
                    }
                  }}
                  className="flex items-center gap-2 rounded-full"
                  title="Sauvegarder cette recherche"
                >
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Enregistrer</span>
                </Button>
              )}

              {/* Saved Searches */}
              <div className="relative">
                <SavedSearches
                  onLoadSearch={(searchQuery, searchFilters, searchOpts) => {
                    // Update query using setQuery from useSearch
                    setQuery(searchQuery);
                    // Update filters
                    updateFilters(searchFilters);
                    // Update search options if provided
                    if (searchOpts) {
                      setSearchOptions(searchOpts);
                    }
                    // Trigger search with new parameters
                    search(searchQuery, searchFilters, searchOpts || searchOptions);
                  }}
                />
              </div>

              {/* Toggle Mock Mode Button (Development) */}
              {process.env.NODE_ENV === 'development' && (
              <Button
                type="button"
                variant={isMockMode ? 'default' : 'outline'}
                onClick={() => {
                  const newValue = !isMockMode;
                  if (typeof window !== 'undefined') {
                    if (newValue) {
                      localStorage.setItem('useMockSearch', 'true');
                    } else {
                      localStorage.removeItem('useMockSearch');
                    }
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-2 rounded-full text-xs"
                title={isMockMode ? 'Désactiver le mode test' : 'Activer le mode test'}
              >
                🧪 {isMockMode ? 'Mock ON' : 'Mock OFF'}
              </Button>
            )}

            {/* Saved Searches */}
            <div className="relative">
              <SavedSearches
                onLoadSearch={(savedQuery, savedFilters, savedOptions) => {
                  setQuery(savedQuery);
                  updateFilters(savedFilters);
                  if (savedOptions) {
                    setSearchOptions(savedOptions);
                  }
                  search(savedQuery, savedFilters, savedOptions);
                }}
              />
            </div>

            {/* Draw Bounds Toggle */}
            <Button
              type="button"
              variant={drawBoundsEnabled ? 'default' : 'outline'}
              onClick={() => {
                setDrawBoundsEnabled(!drawBoundsEnabled);
                if (!drawBoundsEnabled) {
                  // Clear bounds filter when disabling
                  setMapBounds(null);
                  updateFilters({ 
                    northEastLat: undefined,
                    northEastLng: undefined,
                    southWestLat: undefined,
                    southWestLng: undefined,
                  });
                }
              }}
              className="flex items-center gap-2 rounded-full"
              title={drawBoundsEnabled ? 'Désactiver le dessin de zone' : 'Dessiner une zone de recherche'}
            >
              <Square className="h-4 w-4" />
              <span className="hidden sm:inline">Zone</span>
            </Button>

            {/* Locate Me Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!navigator.geolocation) {
                  alert('La géolocalisation n\'est pas disponible');
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    // Optionally search nearby properties
                    updateFilters({ 
                      latitude, 
                      longitude, 
                      radiusKm: 10 
                    });
                    search();
                  },
                  (error) => {
                    console.error('Geolocation error:', error);
                    alert('Impossible d\'obtenir votre position');
                  }
                );
              }}
              className="flex items-center gap-2 rounded-full"
              title="Rechercher autour de moi"
            >
              <Crosshair className="h-4 w-4" />
              <span className="hidden sm:inline">Moi</span>
            </Button>

            {/* Save Search Button */}
            {results && results.totalHits > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const name = prompt('Nom de la recherche (optionnel) :') || '';
                  saveSearch(name, query, filters, searchOptions);
                  alert('Recherche sauvegardée !');
                }}
                className="flex items-center gap-2 rounded-full"
                title="Sauvegarder cette recherche"
              >
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Sauver</span>
              </Button>
            )}

            {/* Draw Zone Button */}
            <Button
              type="button"
              variant={drawBoundsEnabled ? 'default' : 'outline'}
              onClick={() => {
                setDrawBoundsEnabled(!drawBoundsEnabled);
                if (drawBoundsEnabled && mapBounds) {
                  // Clear bounds when disabling
                  setMapBounds(null);
                  const { latitude, longitude, radiusKm, ...restFilters } = filters;
                  updateFilters(restFilters);
                }
              }}
              className="flex items-center gap-2 rounded-full"
              title={drawBoundsEnabled ? 'Désactiver le dessin de zone' : 'Dessiner une zone de recherche'}
            >
              {drawBoundsEnabled ? (
                <>
                  <CheckSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Zone active</span>
                </>
              ) : (
                <>
                  <Square className="h-4 w-4" />
                  <span className="hidden sm:inline">Dessiner zone</span>
                </>
              )}
            </Button>

            {/* Filter Toggle Button - Enhanced */}
            <Button
              type="button"
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-full relative"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtres</span>
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-green-600 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* View Toggle Button - Desktop */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-full p-1">
              <Button
                type="button"
                variant={showResultsPanel ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowResultsPanel(true)}
                className="rounded-full"
              >
                <List className="h-4 w-4 mr-1" />
                Liste
              </Button>
              <Button
                type="button"
                variant={!showResultsPanel ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowResultsPanel(false)}
                className="rounded-full"
              >
                <Map className="h-4 w-4 mr-1" />
                Carte
              </Button>
            </div>

            {/* Results Panel Toggle (Mobile) */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowResultsPanel(!showResultsPanel)}
              className="md:hidden flex items-center gap-2 rounded-full"
            >
              {showResultsPanel ? <Map className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </Button>
          </div>

          {/* Enhanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={filters.type || 'all'}
                    onValueChange={(value: string) =>
                      updateFilters({ type: value !== 'all' ? (value as PropertyType) : undefined })
                    }
                  >
                    <SelectTrigger id="type" className="w-full">
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

                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    placeholder="France, Espagne..."
                    value={filters.country || ''}
                    onChange={(e) => updateFilters({ country: e.target.value || undefined })}
                  />
                </div>

                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Paris, Lyon..."
                    value={filters.city || ''}
                    onChange={(e) => updateFilters({ city: e.target.value || undefined })}
                  />
                </div>

                <PriceRangeSlider
                  minPrice={filters.minPrice}
                  maxPrice={filters.maxPrice}
                  currency={filters.currency || 'EUR'}
                  onPriceChange={(min, max) => {
                    updateFilters({ minPrice: min, maxPrice: max });
                  }}
                />

                <div className="flex items-end gap-2">
                  <Button 
                    onClick={clearFilters} 
                    variant="outline" 
                    className="w-full"
                    disabled={activeFiltersCount === 0}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 font-medium">Filtres actifs:</span>
                  {filters.type && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Type: {filters.type}
                      <button
                        onClick={() => updateFilters({ type: undefined })}
                        className="ml-1 hover:text-red-500"
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
                        className="ml-1 hover:text-red-500"
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
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Prix: {filters.minPrice || 0}€ - {filters.maxPrice || '∞'}€
                      <button
                        onClick={() => updateFilters({ minPrice: undefined, maxPrice: undefined })}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {(filters.latitude && filters.longitude && filters.radiusKm) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Rayon: {Math.round(filters.radiusKm)}km
                      <button
                        onClick={() => updateFilters({ latitude: undefined, longitude: undefined, radiusKm: undefined })}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {(filters.northEastLat || mapBounds) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Square className="h-3 w-3" />
                      Zone sélectionnée
                      <button
                        onClick={() => {
                          setMapBounds(null);
                          setDrawBoundsEnabled(false);
                          const { northEastLat, northEastLng, southWestLat, southWestLng, ...restFilters } = filters;
                          updateFilters(restFilters);
                          search();
                        }}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Main Content Area - Map + Results */}
      <div className={`flex-1 flex ${isMockMode ? 'pt-24 md:pt-28' : 'pt-16 md:pt-20'} overflow-hidden`}>
        {/* Results Panel - Left Side with smooth transitions */}
        {showResultsPanel && (
          <div 
            className={`w-full md:w-96 lg:w-[450px] bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ${
              showResultsPanel ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Enhanced Results Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        Recherche...
                      </span>
                    ) : (
                      `Résultats`
                    )}
                  </h2>
                  {results && results.totalHits > 0 && (
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {results.totalHits}
                    </Badge>
                  )}
                </div>
                {/* Close panel button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResultsPanel(false)}
                  className="md:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Sort & Query Info */}
              <div className="flex items-center justify-between gap-2">
                {query && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 flex-1">
                    <Search className="h-3 w-3" />
                    <span className="truncate">&quot;{query}&quot;</span>
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  {results && results.totalHits > 0 && (
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8 rounded-none border-0"
                        title="Vue liste"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 rounded-none border-0"
                        title="Vue grille"
                      >
                        <Layers className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {/* Sort Select */}
                  {results && results.totalHits > 1 && (
                    <Select
                      value={sortBy}
                      onValueChange={(value: 'relevance' | 'price_asc' | 'price_desc' | 'distance') => {
                        setSortBy(value);
                        // Update search options with sort
                        const sortArray = value === 'relevance' 
                          ? [] 
                          : value === 'distance' && userLocation
                          ? ['distance:asc']
                          : [`price:${value === 'price_asc' ? 'asc' : 'desc'}`];
                        
                        const newOptions = { 
                          ...searchOptions, 
                          sort: sortArray.length > 0 ? sortArray : undefined,
                          offset: 0 // Reset to first page when sorting
                        };
                        setSearchOptions(newOptions);
                        search(query, filters, newOptions);
                      }}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Pertinence</SelectItem>
                        <SelectItem value="price_asc">Prix croissant</SelectItem>
                        <SelectItem value="price_desc">Prix décroissant</SelectItem>
                        {userLocation && <SelectItem value="distance">Distance</SelectItem>}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            {/* Search Stats */}
            {results && results.totalHits > 0 && (
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <SearchStats 
                  totalHits={results.totalHits} 
                  processingTimeMs={results.processingTimeMs}
                  query={query}
                />
              </div>
            )}

            {/* Results List with enhanced scroll */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {error && (
                <div className="m-4 p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <X className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Erreur de recherche</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {!isLoading && results && results.hits.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-lg font-medium mb-2">Aucun résultat trouvé</p>
                  <p className="text-sm mb-4">Essayez de modifier vos critères de recherche</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}

              {isLoading && !results && (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-3"></div>
                  <p className="text-gray-500">Recherche en cours...</p>
                </div>
              )}

              {!isLoading && results && results.hits.length > 0 && (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-3' : 'divide-y divide-gray-100'}>
                  {results.hits.map((property, index) => (
                    <Card
                      key={property.id}
                      className={`${viewMode === 'grid' ? '' : 'm-3'} cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.01] border-l-4 group ${
                        selectedProperty?.id === property.id
                          ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200 scale-[1.02]'
                          : 'border-transparent hover:border-green-200'
                      }`}
                      onClick={() => setSelectedProperty(property)}
                      style={{ 
                        animationDelay: `${index * 30}ms`,
                        animation: 'fadeInUp 0.3s ease-out forwards',
                        opacity: 0,
                      }}
                    >
                      <CardContent className="p-0">
                        {/* Property Image with gradient overlay */}
                        <div className={`relative w-full ${viewMode === 'grid' ? 'h-56' : 'h-48'} bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden`}>
                          {property.mediaUrls && property.mediaUrls.length > 0 ? (
                            <>
                              <img
                                src={property.mediaUrls[0]}
                                alt={property.title_fr || 'Property'}
                                className="property-card-image w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                {propertyTypeIcon(property.type)}
                                <p className="text-xs mt-2 capitalize">{property.type}</p>
                              </div>
                            </div>
                          )}
                          {/* Status badge on image */}
                          <div className="absolute top-2 right-2">
                            <Badge 
                              variant={getStatusBadgeVariant(property.status)}
                              className="capitalize backdrop-blur-sm bg-white/90"
                            >
                              {property.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Property Info */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">
                              {property.title_fr || property.title_en || 'Sans titre'}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                {propertyTypeIcon(property.type)}
                                <span className="capitalize">{property.type}</span>
                              </div>
                              {property.city && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{property.city}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              <span className="text-xl font-bold text-green-600">
                                {formatPrice(property.price, property.currency)}
                              </span>
                            </div>
                            <Link
                              href={`/properties/${property.id}`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Détails
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>

                          {property.description_fr && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {property.description_fr}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Enhanced Pagination */}
              {!isLoading && results && results.totalHits > (results.limit || 20) && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="font-medium">
                      Page {Math.floor(results.offset / results.limit) + 1} sur{' '}
                      {Math.ceil(results.totalHits / results.limit)}
                    </span>
                    <span className="text-gray-500">
                      {results.offset + 1}-{Math.min(results.offset + results.limit, results.totalHits)} sur{' '}
                      {results.totalHits}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={results.offset === 0}
                      onClick={() => {
                        const newOffset = Math.max(0, results.offset - (results.limit || 20));
                        setSearchOptions((prev) => ({ ...prev, offset: newOffset }));
                        search();
                      }}
                      className="flex-1"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={results.offset + results.limit >= results.totalHits}
                      onClick={() => {
                        const newOffset = results.offset + (results.limit || 20);
                        setSearchOptions((prev) => ({ ...prev, offset: newOffset }));
                        search();
                      }}
                      className="flex-1"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map - Right Side / Full Screen with toggle button */}
        <div className="flex-1 relative">
          {/* Toggle Results Panel Button - Floating */}
          {!showResultsPanel && (
            <button
              onClick={() => setShowResultsPanel(true)}
              className="absolute top-4 left-4 z-[1000] bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all hover:scale-110"
              title="Afficher les résultats"
            >
              <List className="h-5 w-5 text-gray-700" />
            </button>
          )}

          <MapComponent
            properties={results?.hits || []}
            selectedProperty={selectedProperty}
            onPropertySelect={setSelectedProperty}
            drawBoundsEnabled={drawBoundsEnabled}
            clusteringEnabled={true}
            onBoundsChange={(bounds) => {
              setMapBounds(bounds);
              // Check if bounds are cleared (all zeros)
              if (bounds.north === 0 && bounds.south === 0 && bounds.east === 0 && bounds.west === 0) {
                // Clear bounds filter
                const { latitude, longitude, radiusKm, northEastLat, northEastLng, southWestLat, southWestLng, ...restFilters } = filters;
                updateFilters(restFilters);
                search();
                return;
              }

              // Update filters with bounding box coordinates
              updateFilters({
                ...filters,
                // Clear radius-based filters when using bounds
                latitude: undefined,
                longitude: undefined,
                radiusKm: undefined,
                // Set bounding box
                northEastLat: bounds.north,
                northEastLng: bounds.east,
                southWestLat: bounds.south,
                southWestLng: bounds.west,
              });
              search();
            }}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        shortcuts={[
          {
            key: 'ctrl+k',
            description: 'Focus sur la barre de recherche',
            action: () => {
              searchInputRef.current?.focus();
              setIsSearchFocused(true);
            },
          },
          {
            key: 'escape',
            description: 'Fermer les suggestions / Réinitialiser',
            action: () => {
              if (isSearchFocused) {
                setIsSearchFocused(false);
                searchInputRef.current?.blur();
              } else if (showFilters) {
                setShowFilters(false);
              } else if (selectedProperty) {
                setSelectedProperty(null);
              }
            },
          },
          {
            key: 'ctrl+f',
            description: 'Ouvrir/Fermer les filtres',
            action: () => setShowFilters(!showFilters),
          },
          {
            key: 'ctrl+m',
            description: 'Basculer entre liste et carte',
            action: () => setShowResultsPanel(!showResultsPanel),
          },
          {
            key: '/',
            description: 'Focus sur la recherche (quand le champ est vide)',
            action: () => {
              if (!query) {
                searchInputRef.current?.focus();
                setIsSearchFocused(true);
              }
            },
          },
        ]}
        enabled={true}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Chargement...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
