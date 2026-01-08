/**
 * Custom hook for search functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchService, SearchFilters, SearchOptions, SearchResult, SearchSuggestion } from '@/lib/api/search';

export interface UseSearchOptions {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  initialOptions?: SearchOptions;
  debounceMs?: number;
}

export function useSearch(options: UseSearchOptions = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(options.initialQuery || searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilters>(options.initialFilters || {});
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    limit: 20,
    offset: 0,
    language: 'fr',
    ...options.initialOptions,
  });
  const [results, setResults] = useState<SearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Load filters from URL params on mount
  useEffect(() => {
    const urlFilters: SearchFilters = {};
    const typeParam = searchParams.get('type');
    // Only set type filter if it's a valid PropertyType (not 'all')
    if (typeParam && typeParam !== 'all') {
      urlFilters.type = typeParam as any;
    }
    if (searchParams.get('country')) urlFilters.country = searchParams.get('country') || undefined;
    if (searchParams.get('city')) urlFilters.city = searchParams.get('city') || undefined;
    if (searchParams.get('minPrice')) urlFilters.minPrice = parseFloat(searchParams.get('minPrice') || '0');
    if (searchParams.get('maxPrice')) urlFilters.maxPrice = parseFloat(searchParams.get('maxPrice') || '0');
    if (searchParams.get('currency')) urlFilters.currency = searchParams.get('currency') || undefined;
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...urlFilters }));
    }

    const urlLimit = searchParams.get('limit');
    const urlOffset = searchParams.get('offset');
    if (urlLimit) setSearchOptions((prev) => ({ ...prev, limit: parseInt(urlLimit, 10) }));
    if (urlOffset) setSearchOptions((prev) => ({ ...prev, offset: parseInt(urlOffset, 10) }));
  }, [searchParams]);

  // Update URL when search changes
  const updateURL = useCallback(
    (newQuery: string, newFilters: SearchFilters, newOptions: SearchOptions) => {
      const params = new URLSearchParams();
      
      if (newQuery) params.set('q', newQuery);
      if (newFilters.type) params.set('type', newFilters.type);
      if (newFilters.country) params.set('country', newFilters.country);
      if (newFilters.city) params.set('city', newFilters.city);
      if (newFilters.minPrice !== undefined) params.set('minPrice', newFilters.minPrice.toString());
      if (newFilters.maxPrice !== undefined) params.set('maxPrice', newFilters.maxPrice.toString());
      if (newFilters.currency) params.set('currency', newFilters.currency);
      if (newOptions.limit) params.set('limit', newOptions.limit.toString());
      if (newOptions.offset) params.set('offset', newOptions.offset.toString());

      router.push(`/search?${params.toString()}`);
    },
    [router],
  );

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: SearchFilters, searchOpts: SearchOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await searchService.search(searchQuery, searchFilters, searchOpts);
        setResults(result);
        updateURL(searchQuery, searchFilters, searchOpts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    },
    [updateURL],
  );

  // Debounced search suggestions
  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const suggs = await searchService.getSuggestions(
          searchQuery,
          5,
          searchOptions.language || 'fr',
        );
        setSuggestions(suggs);
      } catch (err) {
        // Silently fail for suggestions
        setSuggestions([]);
      }
    },
    [searchOptions.language],
  );

  // Handle query change with debounce for suggestions
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      // Clear previous debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Fetch suggestions with debounce
      const timer = setTimeout(() => {
        fetchSuggestions(newQuery);
      }, options.debounceMs || 300);

      setDebounceTimer(timer);
    },
    [debounceTimer, fetchSuggestions, options.debounceMs],
  );

  // Handle search (immediate)
  const handleSearch = useCallback(
    (searchQuery?: string, searchFilters?: SearchFilters, searchOpts?: SearchOptions) => {
      const finalQuery = searchQuery !== undefined ? searchQuery : query;
      const finalFilters = searchFilters || filters;
      const finalOpts = searchOpts || searchOptions;

      // Reset offset when performing new search
      const opts = { ...finalOpts, offset: 0 };
      setSearchOptions(opts);

      performSearch(finalQuery, finalFilters, opts);
    },
    [query, filters, searchOptions, performSearch],
  );

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      handleSearch(query, updatedFilters, searchOptions);
    },
    [filters, query, searchOptions, handleSearch],
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {};
    setFilters(clearedFilters);
    handleSearch(query, clearedFilters, searchOptions);
  }, [query, searchOptions, handleSearch]);

  // Pagination
  const loadMore = useCallback(() => {
    const newOffset = (searchOptions.offset || 0) + (searchOptions.limit || 20);
    const newOptions = { ...searchOptions, offset: newOffset };
    setSearchOptions(newOptions);
    performSearch(query, filters, newOptions);
  }, [query, filters, searchOptions, performSearch]);

  const goToPage = useCallback(
    (page: number) => {
      const limit = searchOptions.limit || 20;
      const newOffset = (page - 1) * limit;
      const newOptions = { ...searchOptions, offset: newOffset };
      setSearchOptions(newOptions);
      performSearch(query, filters, newOptions);
    },
    [query, filters, searchOptions, performSearch],
  );

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    query,
    setQuery: handleQueryChange,
    filters,
    updateFilters,
    clearFilters,
    searchOptions,
    setSearchOptions,
    results,
    suggestions,
    setSuggestions,
    isLoading,
    error,
    search: handleSearch,
    loadMore,
    goToPage,
  };
}

