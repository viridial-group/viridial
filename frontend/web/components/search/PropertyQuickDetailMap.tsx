'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon, LatLngExpression, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PropertySearchResult } from '@/lib/api/search';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getNeighborhoodService } from '@/lib/api/neighborhood';
import type { Neighborhood } from '@/lib/api/neighborhood';

// Fix Leaflet default icon issue with Next.js
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to adjust map bounds and zoom
function MapBoundsAdjuster({ property, pois, neighborhood }: { property: PropertySearchResult, pois: POI[], neighborhood: Neighborhood | null }) {
  const map = useMap();

  useEffect(() => {
    if (!property.latitude || !property.longitude) return;

    const bounds = new LatLngBounds(
      [property.latitude, property.longitude],
      [property.latitude, property.longitude]
    );

    // Add POIs to bounds
    pois.forEach(poi => {
      bounds.extend(poi.position);
    });

    // Add neighborhood center if available
    if (neighborhood?.centerLatitude && neighborhood?.centerLongitude) {
      const [lat, lng] = [neighborhood.centerLatitude, neighborhood.centerLongitude];
      bounds.extend([lat + 0.005, lng + 0.005]);
      bounds.extend([lat - 0.005, lng - 0.005]);
    }

    // Fit bounds with higher zoom (city level)
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
  }, [map, property, pois, neighborhood]);

  return null;
}

interface PropertyQuickDetailMapProps {
  property: PropertySearchResult;
  zoom?: number;
}

interface POI {
  type: 'school' | 'hospital' | 'metro' | 'shopping' | 'restaurant' | 'park' | 'beach';
  position: [number, number];
  name: string;
  icon: string;
  color: string;
}

export default function PropertyQuickDetailMap({ property, zoom = 16 }: PropertyQuickDetailMapProps) {
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [isLoadingNeighborhood, setIsLoadingNeighborhood] = useState(false);

  // Load neighborhood data if slug is available
  useEffect(() => {
    if (property.neighborhoodSlug) {
      setIsLoadingNeighborhood(true);
      const service = getNeighborhoodService();
      service.findBySlug(property.neighborhoodSlug)
        .then((data) => {
          setNeighborhood(data);
        })
        .catch(() => {
          // Silently fail - neighborhood is optional
        })
        .finally(() => {
          setIsLoadingNeighborhood(false);
        });
    }
  }, [property.neighborhoodSlug]);

  // Generate POIs based on neighborhood data
  const pois = useMemo<POI[]>(() => {
    if (!neighborhood || !property.latitude || !property.longitude) {
      return [];
    }

    const baseLat = property.latitude;
    const baseLng = property.longitude;
    const poiList: POI[] = [];

    // Generate POIs with small random offsets to simulate real locations
    const getOffset = (index: number, maxOffset: number = 0.003) => {
      const angle = (index * 137.508) % 360; // Golden angle for uniform distribution
      const distance = (index % 3 + 1) * 0.0015; // 3 distance levels, slightly wider spread for city view
      return {
        lat: baseLat + Math.cos(angle * Math.PI / 180) * distance,
        lng: baseLng + Math.sin(angle * Math.PI / 180) * distance,
      };
    };

    let index = 0;

    // Schools
    if (neighborhood.features?.amenities?.schools) {
      const count = Math.min(neighborhood.features.amenities.schools, 6);
      for (let i = 0; i < count; i++) {
        const offset = getOffset(index++);
        poiList.push({
          type: 'school',
          position: [offset.lat, offset.lng],
          name: `École ${i + 1}`,
          icon: '🏫',
          color: '#3B82F6',
        });
      }
    }

    // Hospitals
    if (neighborhood.features?.amenities?.hospitals) {
      const count = Math.min(neighborhood.features.amenities.hospitals, 3);
      for (let i = 0; i < count; i++) {
        const offset = getOffset(index++);
        poiList.push({
          type: 'hospital',
          position: [offset.lat, offset.lng],
          name: `Hôpital ${i + 1}`,
          icon: '🏥',
          color: '#EF4444',
        });
      }
    }

    // Metro/Public transport
    if (neighborhood.features?.publicTransport?.metro || 
        neighborhood.features?.publicTransport?.tram || 
        neighborhood.features?.publicTransport?.bus || 
        neighborhood.features?.publicTransport?.train) {
      const stations = neighborhood.features.publicTransport.stations || [];
      stations.slice(0, 4).forEach((stationName, i) => {
        const offset = getOffset(index++);
        poiList.push({
          type: 'metro',
          position: [offset.lat, offset.lng],
          name: stationName,
          icon: '🚇',
          color: '#8B5CF6',
        });
      });
    }

    // Parks
    if (neighborhood.features?.amenities?.parks) {
      const count = Math.min(neighborhood.features.amenities.parks, 4);
      for (let i = 0; i < count; i++) {
        const offset = getOffset(index++);
        poiList.push({
          type: 'park',
          position: [offset.lat, offset.lng],
          name: `Parc ${i + 1}`,
          icon: '🌳',
          color: '#10B981',
        });
      }
    }

    // Shopping
    if (neighborhood.features?.amenities?.shopping) {
      const offset = getOffset(index++);
      poiList.push({
        type: 'shopping',
        position: [offset.lat, offset.lng],
        name: 'Centre commercial',
        icon: '🛍️',
        color: '#F59E0B',
      });
    }

    // Restaurants
    if (neighborhood.features?.amenities?.restaurants) {
      for (let i = 0; i < 3; i++) {
        const offset = getOffset(index++);
        poiList.push({
          type: 'restaurant',
          position: [offset.lat, offset.lng],
          name: `Restaurant ${i + 1}`,
          icon: '🍽️',
          color: '#EC4899',
        });
      }
    }

    // Beaches
    if (neighborhood.features?.amenities?.beaches) {
      const offset = getOffset(index++);
      poiList.push({
        type: 'beach',
        position: [offset.lat, offset.lng],
        name: 'Plage',
        icon: '🏖️',
        color: '#3B82F6',
      });
    }

    return poiList;
  }, [neighborhood, property.latitude, property.longitude]);

  if (!property.latitude || !property.longitude) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm border border-gray-200">
        <p>Coordonnées géographiques non disponibles</p>
      </div>
    );
  }

  // Create custom icon for property
  const propertyIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#EF4444" stroke="white" stroke-width="3"/>
        <path d="M16 10 L16 22 M10 16 L22 16" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Create custom icons for POIs
  const createPOIIcon = (color: string, emoji: string) => new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="12" fill="${color}" stroke="white" stroke-width="2" opacity="0.9"/>
        <text x="14" y="18" font-size="14" text-anchor="middle" alignment-baseline="middle">${emoji}</text>
      </svg>
    `),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

  // Get unique POI types for legend
  const uniquePOITypes = useMemo(() => {
    const types = new Map<string, { icon: string, color: string, name: string }>();
    pois.forEach(poi => {
      if (!types.has(poi.type)) {
        const typeNames: Record<string, string> = {
          school: 'École',
          hospital: 'Hôpital',
          metro: 'Transport',
          shopping: 'Shopping',
          restaurant: 'Restaurant',
          park: 'Parc',
          beach: 'Plage',
        };
        types.set(poi.type, {
          icon: poi.icon,
          color: poi.color,
          name: typeNames[poi.type] || poi.type,
        });
      }
    });
    return Array.from(types.values());
  }, [pois]);

  return (
    <div className="relative w-full">
      <MapContainer
        center={[property.latitude, property.longitude] as LatLngExpression}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full rounded-lg z-0"
        style={{ height: '300px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsAdjuster property={property} pois={pois} neighborhood={neighborhood} />

        {/* Property marker */}
        <Marker position={[property.latitude, property.longitude] as LatLngExpression} icon={propertyIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-sm">{property.title_fr || property.title_en || 'Propriété'}</p>
              <p className="text-xs text-gray-600 mt-1">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: property.currency || 'EUR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(property.price)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* POI markers */}
        {pois.map((poi, index) => (
          <Marker
            key={index}
            position={poi.position as LatLngExpression}
            icon={createPOIIcon(poi.color, poi.icon)}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-xs">{poi.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Neighborhood circle if available */}
        {neighborhood?.centerLatitude && neighborhood?.centerLongitude && (
          <Circle
            center={[neighborhood.centerLatitude, neighborhood.centerLongitude] as LatLngExpression}
            radius={800} // 800m radius for city-level view
            pathOptions={{
              color: '#10B981',
              fillColor: '#10B981',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5',
            }}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-sm">{neighborhood.name}</p>
                <Link href={`/neighborhoods/${neighborhood.slug}`} className="text-xs text-blue-600 hover:underline">
                  Voir le quartier
                </Link>
              </div>
            </Popup>
          </Circle>
        )}
      </MapContainer>

      {/* Map Legend */}
      {uniquePOITypes.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-white p-2 rounded-lg shadow-lg z-10 text-xs">
          <h3 className="font-semibold mb-1.5 text-xs">Points d'intérêt</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
              <span className="text-xs">Propriété</span>
            </div>
            {uniquePOITypes.map((type, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ backgroundColor: type.color, border: '1px solid white' }}>
                  <span className="text-xs leading-none">{type.icon}</span>
                </div>
                <span className="text-xs">{type.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
