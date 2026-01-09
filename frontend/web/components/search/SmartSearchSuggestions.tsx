'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, TrendingUp, Clock, Home, Building } from 'lucide-react';
import { PropertySearchResult } from '@/lib/api/search';

interface SearchSuggestion {
  title: string;
  city?: string | null;
  type?: 'recent' | 'popular' | 'property';
  propertyId?: string;
}

interface SmartSearchSuggestionsProps {
  query: string;
  suggestions: SearchSuggestion[];
  recentSearches: string[];
  popularSearches: string[];
  isLoading: boolean;
  onSelect: (suggestion: SearchSuggestion) => void;
  onClose: () => void;
}

export function SmartSearchSuggestions({
  query,
  suggestions,
  recentSearches,
  popularSearches,
  isLoading,
  onSelect,
  onClose,
}: SmartSearchSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Combine all suggestions for keyboard navigation
  const allSuggestions = [
    ...(suggestions.length > 0 ? suggestions : []),
    ...(query.length < 2 && recentSearches.length > 0
      ? recentSearches.map((search) => ({
          title: search,
          type: 'recent' as const,
        }))
      : []),
    ...(query.length < 2 && popularSearches.length > 0
      ? popularSearches.map((search) => ({
          title: search,
          type: 'popular' as const,
        }))
      : []),
  ];

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allSuggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
      } else if (e.key === 'Enter' && allSuggestions[selectedIndex]) {
        e.preventDefault();
        onSelect(allSuggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allSuggestions, selectedIndex, onSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!query && recentSearches.length === 0 && popularSearches.length === 0) {
    return null;
  }

  const getIcon = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'recent') {
      return <Clock className="h-4 w-4" />;
    }
    if (suggestion.type === 'popular') {
      return <TrendingUp className="h-4 w-4" />;
    }
    if (suggestion.propertyId) {
      return suggestion.title.toLowerCase().includes('maison') || suggestion.title.toLowerCase().includes('house') ? (
        <Home className="h-4 w-4" />
      ) : (
        <Building className="h-4 w-4" />
      );
    }
    return <Search className="h-4 w-4" />;
  };

  const getSectionTitle = (suggestion: SearchSuggestion, index: number) => {
    if (index === 0 && suggestions.length > 0) {
      return 'Suggestions';
    }
    if (
      index === suggestions.length &&
      recentSearches.length > 0 &&
      query.length < 2
    ) {
      return 'Recherches récentes';
    }
    if (
      index === suggestions.length + recentSearches.length &&
      popularSearches.length > 0 &&
      query.length < 2
    ) {
      return 'Recherches populaires';
    }
    return null;
  };

  return (
    <div
      className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-gray-200 z-50 max-h-[500px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      role="listbox"
      aria-label="Suggestions de recherche"
    >
      <div className="max-h-[500px] overflow-y-auto" ref={suggestionsRef}>
        {allSuggestions.length === 0 && !isLoading && query.length >= 2 && (
          <div className="p-6 text-center text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Aucune suggestion trouvée
            </p>
            <p className="text-xs text-gray-500">
              Appuyez sur Entrée pour rechercher
            </p>
          </div>
        )}

        {isLoading && query.length >= 2 && (
          <div className="p-4">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="text-sm">Recherche de suggestions...</span>
            </div>
          </div>
        )}

        {allSuggestions.map((suggestion, index) => {
          const sectionTitle = getSectionTitle(suggestion, index);
          const isSelected = index === selectedIndex;

          return (
            <div key={`${suggestion.title}-${index}`}>
              {sectionTitle && (
                <div className="text-xs font-semibold text-gray-500 px-4 py-2 uppercase tracking-wide bg-gray-50 border-b border-gray-100 sticky top-0">
                  {sectionTitle}
                </div>
              )}
              <button
                type="button"
                onClick={() => onSelect(suggestion)}
                className={`w-full px-4 py-3 text-left hover:bg-viridial-50/50 flex items-center gap-3 transition-all duration-200 group rounded-lg mx-2 ${
                  isSelected ? 'bg-gradient-to-r from-viridial-50 to-primary/5 border-l-4 border-primary shadow-sm' : ''
                }`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-viridial-100 text-primary'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-viridial-100 group-hover:text-primary'
                  }`}
                >
                  {getIcon(suggestion)}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium truncate text-sm ${
                      isSelected ? 'text-viridial-900' : 'text-gray-900'
                    }`}
                  >
                    {suggestion.title}
                  </div>
                  {'city' in suggestion && suggestion.city && (
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {suggestion.city}
                    </div>
                  )}
                  {suggestion.type === 'recent' && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      Recherche récente
                    </div>
                  )}
                  {suggestion.type === 'popular' && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      Recherche populaire
                    </div>
                  )}
                </div>
                <div
                  className={`transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    Entrée
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {allSuggestions.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
          <span>Utilisez ↑↓ pour naviguer</span>
          <span>Entrée pour sélectionner • Esc pour fermer</span>
        </div>
      )}
    </div>
  );
}

