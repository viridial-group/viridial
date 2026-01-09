'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, X, Clock, Trash2 } from 'lucide-react';
import { SearchFilters, SearchOptions } from '@/lib/api/search';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  options?: SearchOptions;
  savedAt: Date;
}

interface SavedSearchesProps {
  onLoadSearch: (query: string, filters: SearchFilters, options?: SearchOptions) => void;
}

const STORAGE_KEY = 'viridial_saved_searches';
const MAX_SAVED_SEARCHES = 10;

export default function SavedSearches({ onLoadSearch }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  // Load saved searches from localStorage
  useEffect(() => {
    const loadSearches = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored).map((s: any) => ({
            ...s,
            savedAt: new Date(s.savedAt),
          }));
          setSavedSearches(parsed);
        }
      } catch (error) {
        console.error('Error loading saved searches:', error);
      }
    };

    loadSearches();
  }, []);

  // Save searches to localStorage
  const saveSearches = (searches: SavedSearch[]) => {
    try {
      // Keep only the most recent MAX_SAVED_SEARCHES
      const sorted = searches.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
      const limited = sorted.slice(0, MAX_SAVED_SEARCHES);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
      setSavedSearches(limited);
    } catch (error) {
      console.error('Error saving searches:', error);
    }
  };

  const saveCurrentSearch = (name: string, query: string, filters: SearchFilters, options?: SearchOptions) => {
    const newSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      name: name || `Recherche du ${new Date().toLocaleDateString('fr-FR')}`,
      query,
      filters,
      options,
      savedAt: new Date(),
    };

    const updated = [newSearch, ...savedSearches];
    saveSearches(updated);
    setShowPanel(false);
  };

  const deleteSearch = (id: string) => {
    const updated = savedSearches.filter((s) => s.id !== id);
    saveSearches(updated);
  };

  const loadSearch = (search: SavedSearch) => {
    onLoadSearch(search.query, search.filters, search.options);
    setShowPanel(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (!showPanel && savedSearches.length === 0) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center gap-2"
        title="Recherches sauvegardées"
      >
        <Star className={`h-4 w-4 ${savedSearches.length > 0 ? 'fill-yellow-400 text-yellow-500' : ''}`} />
        {savedSearches.length > 0 && (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
            {savedSearches.length}
          </Badge>
        )}
      </Button>

      {/* Panel */}
      {showPanel && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
              Recherches sauvegardées
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPanel(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {savedSearches.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Aucune recherche sauvegardée</p>
                <p className="text-xs mt-1">Enregistrez vos recherches favorites</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedSearches.map((search) => (
                  <div
                    key={search.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-viridial-300 hover:bg-viridial-50 transition-colors cursor-pointer group"
                    onClick={() => loadSearch(search)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate mb-1">
                          {search.name}
                        </h4>
                        {search.query && (
                          <p className="text-xs text-gray-600 truncate mb-1">
                            &quot;{search.query}&quot;
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {search.filters.type && (
                            <Badge variant="outline" className="text-xs">
                              {search.filters.type}
                            </Badge>
                          )}
                          {search.filters.city && (
                            <Badge variant="outline" className="text-xs">
                              {search.filters.city}
                            </Badge>
                          )}
                          {(search.filters.minPrice || search.filters.maxPrice) && (
                            <Badge variant="outline" className="text-xs">
                              {search.filters.minPrice || 0}€ - {search.filters.maxPrice || '∞'}€
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(search.savedAt)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSearch(search.id);
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Hook to use saved searches
export function useSaveSearch() {
  const saveSearch = (name: string, query: string, filters: SearchFilters, options?: SearchOptions) => {
    const STORAGE_KEY = 'viridial_saved_searches';
    const MAX_SAVED_SEARCHES = 10;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const existing = stored ? JSON.parse(stored) : [];

      const newSearch = {
        id: `search-${Date.now()}`,
        name: name || `Recherche du ${new Date().toLocaleDateString('fr-FR')}`,
        query,
        filters,
        options,
        savedAt: new Date().toISOString(),
      };

      const updated = [newSearch, ...existing]
        .sort((a: any, b: any) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
        .slice(0, MAX_SAVED_SEARCHES);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error saving search:', error);
      return false;
    }
  };

  return { saveSearch };
}

