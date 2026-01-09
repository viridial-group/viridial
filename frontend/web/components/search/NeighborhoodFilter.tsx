'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNeighborhoodService, Neighborhood } from '@/lib/api/neighborhood';

const neighborhoodService = getNeighborhoodService(); // Get service instance
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, X, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NeighborhoodFilterProps {
  value?: string;
  onChange: (neighborhoodSlug: string | undefined) => void;
  city?: string; // Optional city filter to narrow down neighborhoods
}

export default function NeighborhoodFilter({ value, onChange, city }: NeighborhoodFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Load selected neighborhood when value changes
  useEffect(() => {
    const loadSelected = async () => {
      if (value) {
        try {
          const currentService = getNeighborhoodService(); // Dynamically get service
          const neighborhood = await currentService.findBySlug(value);
          setSelectedNeighborhood(neighborhood);
        } catch (error) {
          console.error('Error loading neighborhood:', error);
          setSelectedNeighborhood(null);
        }
      } else {
        setSelectedNeighborhood(null);
      }
    };
    loadSelected();
  }, [value]);

  // Search neighborhoods
  const searchNeighborhoods = useCallback(async (query: string) => {
    if (!query.trim()) {
      setNeighborhoods([]);
      return;
    }

    setLoading(true);
    try {
      const results = await neighborhoodService.search(query, 10);
      setNeighborhoods(results);
    } catch (error) {
      console.error('Error searching neighborhoods:', error);
      setNeighborhoods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showSearch) {
        searchNeighborhoods(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showSearch, searchNeighborhoods]);

  // Load neighborhoods by city if city filter is set
  useEffect(() => {
    if (city && !searchQuery.trim() && showSearch) {
      neighborhoodService.findAll({ city, limit: 20 }).then((response) => {
        setNeighborhoods(response.data);
      });
    }
  }, [city, showSearch, searchQuery]);

  const handleSelect = (neighborhood: Neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    onChange(neighborhood.slug);
    setShowSearch(false);
    setSearchQuery('');
    setNeighborhoods([]);
  };

  const handleClear = () => {
    setSelectedNeighborhood(null);
    onChange(undefined);
    setSearchQuery('');
    setNeighborhoods([]);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="neighborhood">Quartier</Label>
      <div className="relative">
        {selectedNeighborhood ? (
          <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-white">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedNeighborhood.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {selectedNeighborhood.city}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <Input
              id="neighborhood"
              placeholder="Rechercher un quartier..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
              className="pr-10 border-gray-300 focus:border-primary focus:ring-primary"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </>
        )}

        {/* Dropdown with search results */}
        {showSearch && (searchQuery.trim() || city) && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Recherche...
              </div>
            ) : neighborhoods.length > 0 ? (
              <div className="py-1">
                {neighborhoods.map((neighborhood) => (
                  <button
                    key={neighborhood.id}
                    type="button"
                    onClick={() => handleSelect(neighborhood)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {neighborhood.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {neighborhood.city}
                          {neighborhood.region && `, ${neighborhood.region}`}
                        </p>
                      </div>
                      {neighborhood.features?.qualityOfLife && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs font-semibold text-gray-600">
                            {neighborhood.features.qualityOfLife}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Aucun quartier trouvé
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Selected neighborhood badge */}
      {selectedNeighborhood && (
        <div className="mt-2">
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <MapPin className="h-3 w-3" />
            {selectedNeighborhood.name}
            <button
              type="button"
              onClick={handleClear}
              className="ml-1 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
}

