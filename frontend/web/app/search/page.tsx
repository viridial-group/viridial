'use client';

import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSearch } from '@/hooks/useSearch';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PropertyType, PropertyStatus } from '@/lib/api/property';
import { PropertySearchResult } from '@/lib/api/search';
import { 
  Search, X, MapPin, DollarSign, Home, Building, LandPlot, Store, 
  ChevronRight, SlidersHorizontal, List, Map, ChevronLeft, 
  Navigation, Star, Clock, Layers, Crosshair, TrendingUp, Filter, Square, CheckSquare, Leaf
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import SearchStats from '@/components/search/SearchStats';
import PriceRangeSlider from '@/components/search/PriceRangeSlider';
import KeyboardShortcuts from '@/components/search/KeyboardShortcuts';
import SavedSearches, { useSaveSearch } from '@/components/search/SavedSearches';
import NeighborhoodFilter from '@/components/search/NeighborhoodFilter';
import { useToast } from '@/components/ui/simple-toast';
import { SearchResultsSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import PropertyQuickDetailPanel from '@/components/search/PropertyQuickDetailPanel';
import POIFloatingPanel from '@/components/search/POIFloatingPanel';
import QuickFilters from '@/components/search/QuickFilters';
import PropertyCard from '@/components/search/PropertyCard';
import { SmartSearchSuggestions } from '@/components/search/SmartSearchSuggestions';
import { ScrollArea } from '@/components/ui/scroll-area';
import styles from './search.module.scss';

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
  const { t } = useTranslation();
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
  const handleSelectProperty = useCallback((property: PropertySearchResult) => {
    setSelectedProperty(property);
  }, []);
  const [showResultsPanel, setShowResultsPanel] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'distance'>('relevance');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [drawBoundsEnabled, setDrawBoundsEnabled] = useState(false);
  const { saveSearch } = useSaveSearch();
  const { toast } = useToast();
  const [quickFilters, setQuickFilters] = useState({
    ecoCertified: false,
    newListings: false,
    priceReduced: false,
    featured: false,
    withReviews: false,
    withContact: false,
  });

  // Recent and popular searches from localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentSearches');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [popularSearches] = useState<string[]>([
    'Appartement Paris',
    'Maison Lyon',
    'Villa Nice',
    'Studio Marseille',
    'Loft Bordeaux',
  ]);

  // Save search to recent searches
  const saveToRecentSearches = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches((prev) => {
      const updated = [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 5);
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Memoize eco properties count for QuickFilters
  const ecoPropertiesCount = useMemo(() => {
    if (!results?.hits) return 0;
    return results.hits.filter((p: PropertySearchResult) => 
      p.neighborhoodName_fr?.toLowerCase().includes('éco') || 
      p.neighborhoodName_en?.toLowerCase().includes('eco') ||
      p.neighborhoodSlug?.includes('eco')
    ).length;
  }, [results?.hits]);

  // Memoize properties with reviews count
  const propertiesWithReviewsCount = useMemo(() => {
    if (!results?.hits) return 0;
    // Assuming properties with reviews have a rating or reviewCount field
    // For now, we'll simulate this - in real implementation, this would come from the API
    return results.hits.filter((p: PropertySearchResult) => 
      (p as any).rating || (p as any).reviewCount || false
    ).length;
  }, [results?.hits]);

  // Memoize properties with contact count
  const propertiesWithContactCount = useMemo(() => {
    if (!results?.hits) return 0;
    // Assuming properties with contact have phone or email
    // For now, we'll simulate this - in real implementation, this would come from the API
    return results.hits.filter((p: PropertySearchResult) => 
      (p as any).contactPhone || (p as any).contactEmail || false
    ).length;
  }, [results?.hits]);

  // Memoized handler for quick filter changes
  const handleQuickFilterChange = useCallback((filterId: string, value: boolean) => {
    const newQuickFilters = { ...quickFilters, [filterId]: value };
    setQuickFilters(newQuickFilters);
    // Apply filter logic
    if (filterId === 'ecoCertified' && value) {
      toast({
        variant: 'info',
        title: 'Filtre appliqué',
        description: 'Affichage des propriétés éco-certifiées uniquement.',
      });
    } else if (filterId === 'withReviews' && value) {
      toast({
        variant: 'info',
        title: 'Filtre appliqué',
        description: 'Affichage des propriétés avec avis uniquement.',
      });
    } else if (filterId === 'withContact' && value) {
      toast({
        variant: 'info',
        title: 'Filtre appliqué',
        description: 'Affichage des propriétés avec contact disponible uniquement.',
      });
    }
    // Trigger search with updated filters
    search();
  }, [quickFilters, toast, search]);
  

  // Count active filters (excluding bounds coordinates when using radius) - Memoized
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, v]) => {
      if (v === undefined || v === null || v === '') return false;
      // Don't count individual bound coordinates if radius is set (they're redundant)
      if (filters.radiusKm && (key === 'northEastLat' || key === 'northEastLng' || key === 'southWestLat' || key === 'southWestLng')) {
        return false;
      }
      return true;
    }).length;
  }, [filters]);

  // Perform initial search if query exists
  useEffect(() => {
    if (query || Object.keys(filters).length > 0) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToRecentSearches(query);
      search();
      setIsSearchFocused(false);
      searchInputRef.current?.blur();
    }
  }, [query, search, saveToRecentSearches]);

  const handleSuggestionClick = useCallback((suggestion: { title: string; city?: string | null; type?: string; propertyId?: string }) => {
    setQuery(suggestion.title || '');
    saveToRecentSearches(suggestion.title);
    setIsSearchFocused(false);
    search();
    searchInputRef.current?.blur();
  }, [search, saveToRecentSearches]);

  const propertyTypeIcon = useCallback((type: PropertyType) => {
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
  }, []);

  const formatPrice = useCallback((price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  const getStatusBadgeVariant = useCallback((status: PropertyStatus) => {
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
  }, []);

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
    <div className={styles.searchPage}>
      {/* Main content area for skip link */}
      <div id="main-content" className="sr-only" aria-label="Contenu principal"></div>
      
      {/* Top Search Bar - Enhanced with SASS styles */}
      <div className={styles.searchBar}>
        <div className={styles.searchContainer}>
          <div className={styles.searchRow}>
            {/* Logo/Brand - Enhanced */}
            <Link href="/" className={`${styles.searchLogo} hidden sm:block`}>
              <div className={styles.logoLink}>
                <span className={styles.logoText}>Viridial</span>
              </div>
            </Link>

            {/* Enhanced Search Input - Modern clean style with smooth animations */}
            <form onSubmit={handleSubmit} className={styles.searchInputWrapper} ref={searchInputRef as any}>
              <div className={styles.searchForm}>
                <div className={styles.searchGroup}>
                  <Search className={`${styles.searchIcon} ${isSearchFocused ? styles.focused : ''}`} />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder={t('search.placeholder')}
                    className={`${styles.searchInput} ${isSearchFocused ? styles.focused : ''}`}
                    aria-label="Recherche de propriété"
                    aria-autocomplete="list"
                    aria-expanded={isSearchFocused}
                    aria-controls="search-suggestions"
                    role="combobox"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        search();
                        setIsSearchFocused(false);
                      }}
                      className={styles.clearButton}
                      aria-label="Effacer la recherche"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  {query && (
                    <button
                      type="submit"
                      className={styles.searchSubmitButton}
                      aria-label="Rechercher"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Smart Search Suggestions */}
              {isSearchFocused && (
                <SmartSearchSuggestions
                  query={query}
                  suggestions={suggestions || []}
                  recentSearches={recentSearches}
                  popularSearches={popularSearches}
                  isLoading={isLoading}
                  onSelect={handleSuggestionClick}
                  onClose={() => setIsSearchFocused(false)}
                />
              )}
            </form>

            {/* Action Buttons Group - Enhanced with better spacing and animations */}
            <div className={styles.searchActions}>
              {/* Save Search Button - Enhanced */}
              {(query || activeFiltersCount > 0) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const name = prompt('Nom de la recherche à sauvegarder:', query || 'Recherche sans nom');
                    if (name !== null) {
                      saveSearch(name, query, filters, searchOptions);
                      toast({
                        variant: 'success',
                        title: 'Recherche sauvegardée',
                        description: 'Votre recherche a été sauvegardée avec succès.',
                      });
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105 active:scale-95"
                  title="Sauvegarder cette recherche"
                >
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Enregistrer</span>
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


            {/* Draw Zone Button */}
            <Button
              type="button"
              variant={drawBoundsEnabled ? 'default' : 'outline'}
              onClick={() => {
                setDrawBoundsEnabled(!drawBoundsEnabled);
                if (drawBoundsEnabled && mapBounds) {
                  // Clear bounds when disabling
                  setMapBounds(null);
                  const { northEastLat, northEastLng, southWestLat, southWestLng, ...restFilters } = filters;
                  updateFilters(restFilters);
                }
              }}
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
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

            {/* Locate Me Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!navigator.geolocation) {
                  toast({
                    variant: 'error',
                    title: 'Géolocalisation indisponible',
                    description: 'Votre navigateur ne supporte pas la géolocalisation.',
                  });
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
                    toast({
                      variant: 'success',
                      title: 'Position détectée',
                      description: 'Recherche des propriétés à proximité...',
                    });
                  },
                  (error) => {
                    console.error('Geolocation error:', error);
                    toast({
                      variant: 'error',
                      title: 'Erreur de géolocalisation',
                      description: 'Impossible d\'obtenir votre position. Veuillez vérifier les permissions.',
                    });
                  }
                );
              }}
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
              title="Rechercher autour de moi"
            >
              <Crosshair className="h-4 w-4" />
              <span className="hidden sm:inline">Moi</span>
            </Button>

            {/* Filter Toggle Button - Enhanced with smooth animations */}
            <Button
              type="button"
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 relative rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                showFilters 
                  ? 'bg-gradient-to-r from-primary to-viridial-600 hover:from-viridial-700 hover:to-viridial-700 text-white border-primary shadow-lg' 
                  : 'border-gray-300 hover:border-primary hover:bg-primary/5'
              }`}
            >
              <Filter className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              <span className="hidden sm:inline font-medium">Filtres</span>
              {activeFiltersCount > 0 && (
                <Badge className={`ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  showFilters 
                    ? 'bg-white text-primary shadow-md animate-pulse' 
                    : 'bg-primary text-white shadow-sm'
                }`}>
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* View Toggle Button - Desktop */}
            <div className="hidden md:flex items-center gap-1 bg-white border border-gray-300 rounded-md p-1">
              <Button
                type="button"
                variant={showResultsPanel ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowResultsPanel(true)}
                className={`h-9 ${showResultsPanel ? 'bg-primary hover:bg-viridial-700 text-white' : 'hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4 mr-1.5" />
                Liste
              </Button>
              <Button
                type="button"
                variant={!showResultsPanel ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowResultsPanel(false)}
                className={`h-9 ${!showResultsPanel ? 'bg-primary hover:bg-viridial-700 text-white' : 'hover:bg-gray-50'}`}
              >
                <Map className="h-4 w-4 mr-1.5" />
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

          {/* Enhanced Filters Panel - Modern design with SASS styles */}
          {showFilters && (
            <div className={styles.filtersPanel}>
              <div className={styles.filtersHeader}>
                <h3 className={styles.filtersTitle}>
                  <Filter className={styles.filterIcon} />
                  Filtres de recherche
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className={styles.closeButton}
                  aria-label="Fermer les filtres"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className={styles.filtersGrid}>
                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    placeholder="France, Espagne..."
                    value={filters.country || ''}
                    onChange={(e) => updateFilters({ country: e.target.value || undefined })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Paris, Lyon..."
                    value={filters.city || ''}
                    onChange={(e) => updateFilters({ city: e.target.value || undefined })}
                  />
                </div>

                <NeighborhoodFilter
                  value={filters.neighborhood}
                  onChange={(slug) => updateFilters({ neighborhood: slug })}
                  city={filters.city}
                />

                <PriceRangeSlider
                  minPrice={filters.minPrice}
                  maxPrice={filters.maxPrice}
                  currency={filters.currency || 'EUR'}
                  onPriceChange={(min, max) => {
                    updateFilters({ minPrice: min, maxPrice: max });
                  }}
                />

                <div className={styles.filtersActions}>
                  <Button 
                    onClick={clearFilters} 
                    variant="outline" 
                    className="w-full rounded-xl border-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={activeFiltersCount === 0}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowFilters(false);
                      search();
                    }} 
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-viridial-600 hover:from-viridial-700 hover:to-viridial-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Appliquer
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
                  {filters.neighborhood && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Quartier: {filters.neighborhood}
                      <button
                        onClick={() => updateFilters({ neighborhood: undefined })}
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

      {/* Main Content Area - Map + Results + Quick Detail */}
      <div className={styles.mainContentArea}>
        {/* Results Panel - Left Side with smooth transitions - Enhanced with SASS */}
        {showResultsPanel && (
          <div 
            className={`${styles.resultsPanel} ${
              showResultsPanel ? styles.show : styles.hide
            }`}
          >
            {/* Enhanced Results Header - Modern design with SASS */}
            <div className={styles.resultsHeader}>
              <div className={styles.resultsTitleRow}>
                <div className="flex items-center gap-3 flex-1">
                  <h2 className={styles.resultsTitle}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                        <span className="text-base">Recherche en cours...</span>
                      </span>
                    ) : (
                      <>
                        Résultats
                        {results && results.totalHits > 0 && (
                          <span className="text-sm font-normal text-gray-500">({results.totalHits})</span>
                        )}
                      </>
                    )}
                  </h2>
                  {results && results.totalHits > 0 && (
                    <Badge variant="secondary" className="text-xs font-bold bg-viridial-100 text-viridial-700 border border-viridial-300 shadow-sm">
                      {results.totalHits} {results.totalHits > 1 ? 'biens' : 'bien'}
                    </Badge>
                  )}
                </div>
                {/* Close panel button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResultsPanel(false)}
                  className="md:hidden hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Sort & Query Info */}
              <div className={styles.resultsInfoRow}>
                {query && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 flex-1 font-medium">
                    <Search className="h-3.5 w-3.5" />
                    <span className="truncate">&quot;{query}&quot;</span>
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle - Enhanced with smooth transitions */}
                  {results && results.totalHits > 0 && (
                    <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={`h-9 rounded-none border-0 transition-all duration-200 ${
                          viewMode === 'list' 
                            ? 'bg-gradient-to-r from-primary to-viridial-600 hover:from-viridial-700 hover:to-viridial-700 text-white shadow-md' 
                            : 'hover:bg-gray-50'
                        }`}
                        title="Vue liste"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={`h-9 rounded-none border-0 transition-all duration-200 ${
                          viewMode === 'grid' 
                            ? 'bg-gradient-to-r from-primary to-viridial-600 hover:from-viridial-700 hover:to-viridial-700 text-white shadow-md' 
                            : 'hover:bg-gray-50'
                        }`}
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
                      <SelectTrigger className="w-[160px] h-9 text-sm border-2 border-gray-300 rounded-xl hover:border-primary transition-colors duration-200" aria-label="Trier les résultats">
                        <SelectValue placeholder="Trier par..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Pertinence</SelectItem>
                        <SelectItem value="price_asc">Prix croissant ↑</SelectItem>
                        <SelectItem value="price_desc">Prix décroissant ↓</SelectItem>
                        {userLocation && <SelectItem value="distance">Distance</SelectItem>}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Filters - Enhanced with Reviews and Contact */}
            {results && results.totalHits > 0 && (
              <div className="sticky top-[73px] z-10 bg-white border-b border-gray-200 shadow-sm">
                <QuickFilters
                  filters={quickFilters}
                  onFilterChange={handleQuickFilterChange}
                  totalEcoProperties={ecoPropertiesCount}
                  totalWithReviews={propertiesWithReviewsCount}
                  totalWithContact={propertiesWithContactCount}
                />
              </div>
            )}

            {/* Search Stats */}
            {results && results.totalHits > 0 && (
              <div className="sticky top-[133px] z-10 bg-white border-b border-gray-200">
                <SearchStats 
                  totalHits={results.totalHits} 
                  processingTimeMs={results.processingTimeMs}
                  query={query}
                />
              </div>
            )}

            {/* Results List with ScrollArea component */}
            <ScrollArea className="flex-1 h-full">
              <div>
                {error && (
                  <div className={styles.errorMessage}>
                    <div className={styles.errorIcon}>
                      <X className={styles.icon} />
                    </div>
                    <div className={styles.errorContent}>
                      <p className={styles.errorTitle}>Erreur de recherche</p>
                      <p className={styles.errorDescription}>{error}</p>
                    </div>
                  </div>
                )}

                {!isLoading && results && results.hits.length === 0 && (
                  <div className={styles.emptyState}>
                    <EmptyState
                      icon={Search}
                      title="Aucun résultat trouvé"
                      description="Essayez de modifier vos critères de recherche ou d'élargir vos filtres pour trouver plus de propriétés."
                      actionLabel="Réinitialiser les filtres"
                      onAction={clearFilters}
                      className="animate-in fade-in zoom-in-95 duration-500"
                    />
                  </div>
                )}

                {isLoading && !results && (
                  <div className={styles.loadingState}>
                    <SearchResultsSkeleton />
                  </div>
                )}

                {!isLoading && results && results.hits.length > 0 && (
                  <div className={viewMode === 'grid' ? styles.resultsGrid : styles.resultsList}>
                    {results.hits.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        viewMode={viewMode}
                        isSelected={selectedProperty?.id === property.id}
                        onSelect={handleSelectProperty}
                        propertyTypeIcon={propertyTypeIcon}
                        formatPrice={formatPrice}
                        getStatusBadgeVariant={getStatusBadgeVariant}
                      />
                    ))}
                  </div>
                )}

                {/* Enhanced Pagination with SASS styles */}
                {!isLoading && results && results.totalHits > (results.limit || 20) && (
                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                      <span className={styles.infoText}>
                        Affichage de {results.offset + 1} à {Math.min(results.offset + results.limit, results.totalHits)} sur {results.totalHits} résultats
                      </span>
                      <span className={styles.infoText}>
                        Page {Math.floor(results.offset / results.limit) + 1} sur {Math.ceil(results.totalHits / results.limit)}
                      </span>
                    </div>
                    <div className={styles.paginationControls}>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={results.offset === 0}
                        onClick={() => {
                          const newOffset = Math.max(0, results.offset - (results.limit || 20));
                          setSearchOptions((prev) => ({ ...prev, offset: newOffset }));
                          search();
                        }}
                        className={styles.pageButton}
                        aria-label="Page précédente"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Précédent
                      </Button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, Math.ceil(results.totalHits / results.limit)) }, (_, i) => {
                          const currentPage = Math.floor(results.offset / results.limit) + 1;
                          const totalPages = Math.ceil(results.totalHits / results.limit);
                          let pageNum: number;
                          
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          const isActive = pageNum === currentPage;
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={isActive ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const newOffset = (pageNum - 1) * (results.limit || 20);
                                setSearchOptions((prev) => ({ ...prev, offset: newOffset }));
                                search();
                              }}
                              className={`${styles.pageButton} ${isActive ? styles.active : ''}`}
                              aria-label={`Aller à la page ${pageNum}`}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        {Math.ceil(results.totalHits / results.limit) > 5 && (
                          <>
                            <span className="px-2 text-gray-400">...</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOffset = (Math.ceil(results.totalHits / results.limit) - 1) * (results.limit || 20);
                                setSearchOptions((prev) => ({ ...prev, offset: newOffset }));
                                search();
                              }}
                              className={styles.pageButton}
                              aria-label={`Aller à la dernière page (${Math.ceil(results.totalHits / results.limit)})`}
                            >
                              {Math.ceil(results.totalHits / results.limit)}
                            </Button>
                          </>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={results.offset + results.limit >= results.totalHits}
                        onClick={() => {
                          const newOffset = results.offset + (results.limit || 20);
                          setSearchOptions((prev) => ({ ...prev, offset: newOffset }));
                          search();
                        }}
                        className={styles.pageButton}
                        aria-label="Page suivante"
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Quick Detail Panel - Middle (when property selected) - Enhanced with animations */}
        {selectedProperty && (
          <div className="hidden lg:block w-[480px] xl:w-[520px] border-r-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/30 flex-shrink-0 animate-in slide-in-from-right duration-300 shadow-xl">
            <PropertyQuickDetailPanel
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
              onViewFull={() => setSelectedProperty(null)}
            />
          </div>
        )}

        {/* Map - Right Side / Full Screen with toggle button */}
        <div className={styles.mapContainer}>
          {/* Toggle Results Panel Button - Floating with SASS styles */}
          {!showResultsPanel && (
            <button
              onClick={() => setShowResultsPanel(true)}
              className={styles.floatingToggleButton}
              title="Afficher les résultats"
              aria-label="Afficher le panneau de résultats"
            >
              <List className="h-5 w-5 text-gray-700" />
            </button>
          )}

          {/* Quick Detail Panel Overlay - Mobile/Tablet - Enhanced */}
          {selectedProperty && (
            <div className="lg:hidden absolute inset-0 z-[900] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-white rounded-t-2xl max-h-[80vh] flex flex-col shadow-2xl border-t-4 border-primary animate-in slide-in-from-bottom duration-300">
                <PropertyQuickDetailPanel
                  property={selectedProperty}
                  onClose={() => setSelectedProperty(null)}
                  onViewFull={() => setSelectedProperty(null)}
                />
              </div>
            </div>
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

      {/* POI Floating Panel - Bottom Right (when property selected) */}
      {selectedProperty && (
        <POIFloatingPanel
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

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
