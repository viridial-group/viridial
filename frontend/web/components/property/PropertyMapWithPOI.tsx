'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon, LatLngExpression, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/lib/api/property';
import { useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Fix Leaflet default icon issue with Next.js
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to fit map bounds to show all markers
function MapBounds({ bounds }: { bounds: LatLngBounds | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [bounds, map]);

  return null;
}

interface PropertyMapWithPOIProps {
  property: Property;
  showNeighborhood?: boolean;
  zoom?: number;
}

interface POI {
  type: 'school' | 'hospital' | 'metro' | 'shopping' | 'restaurant' | 'park' | 'beach';
  position: [number, number];
  name: string;
  icon: string;
  color: string;
}

export default function PropertyMapWithPOI({ property, showNeighborhood = true, zoom = 15 }: PropertyMapWithPOIProps) {
  // Generate POIs based on neighborhood data
  const pois = useMemo<POI[]>(() => {
    if (!property.neighborhood || !property.latitude || !property.longitude) {
      return [];
    }

    const baseLat = property.latitude;
    const baseLng = property.longitude;
    const poiList: POI[] = [];

    // Generate POIs with small random offsets to simulate real locations
    const getOffset = (index: number, maxOffset: number = 0.002) => {
      const angle = (index * 137.508) % 360; // Golden angle for uniform distribution
      const distance = (index % 3 + 1) * 0.001; // 3 distance levels
      return {
        lat: baseLat + Math.cos(angle * Math.PI / 180) * distance,
        lng: baseLng + Math.sin(angle * Math.PI / 180) * distance,
      };
    };

    let index = 0;

    // Schools
    if (property.neighborhood.features?.amenities?.schools) {
      const count = Math.min(property.neighborhood.features.amenities.schools, 5);
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
    if (property.neighborhood.features?.amenities?.hospitals) {
      const count = Math.min(property.neighborhood.features.amenities.hospitals, 3);
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

    // Metro stations
    if (property.neighborhood.features?.publicTransport?.stations) {
      property.neighborhood.features.publicTransport.stations.slice(0, 3).forEach((station, i) => {
        const offset = getOffset(index++);
        poiList.push({
          type: 'metro',
          position: [offset.lat, offset.lng],
          name: station,
          icon: '🚇',
          color: '#8B5CF6',
        });
      });
    }

    // Parks
    if (property.neighborhood.features?.amenities?.parks) {
      const count = Math.min(property.neighborhood.features.amenities.parks, 3);
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
    if (property.neighborhood.features?.amenities?.shopping) {
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
    if (property.neighborhood.features?.amenities?.restaurants) {
      for (let i = 0; i < 2; i++) {
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

    return poiList;
  }, [property.neighborhood, property.latitude, property.longitude]);

  if (!property.latitude || !property.longitude) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
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

  // Create custom icons for POIs with emoji
  const createPOIIcon = (color: string, emoji: string) => new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2" opacity="0.9"/>
        <text x="16" y="20" font-size="16" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Calculate bounds to fit all markers
  const mapBounds = useMemo<LatLngBounds | null>(() => {
    if (!property.latitude || !property.longitude || pois.length === 0) {
      return null;
    }

    const bounds = new LatLngBounds(
      [property.latitude, property.longitude],
      [property.latitude, property.longitude]
    );

    pois.forEach(poi => {
      bounds.extend([poi.position[0], poi.position[1]]);
    });

    if (property.neighborhood?.centerLatitude && property.neighborhood?.centerLongitude) {
      bounds.extend([property.neighborhood.centerLatitude, property.neighborhood.centerLongitude]);
    }

    return bounds;
  }, [property, pois]);

  const poiTypes: Record<string, { emoji: string; color: string; label: string }> = {
    school: { emoji: '🏫', color: '#3B82F6', label: 'École' },
    hospital: { emoji: '🏥', color: '#EF4444', label: 'Hôpital' },
    metro: { emoji: '🚇', color: '#8B5CF6', label: 'Transport' },
    park: { emoji: '🌳', color: '#10B981', label: 'Parc' },
    shopping: { emoji: '🛍️', color: '#F59E0B', label: 'Shopping' },
    restaurant: { emoji: '🍽️', color: '#EC4899', label: 'Restaurant' },
    beach: { emoji: '🏖️', color: '#3B82F6', label: 'Plage' },
  };

  return (
    <div className="relative">
      <MapContainer
        center={[property.latitude, property.longitude] as LatLngExpression}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full rounded-lg z-0"
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-fit bounds to show all markers */}
        {mapBounds && <MapBounds bounds={mapBounds} />}

        {/* Property marker */}
        <Marker position={[property.latitude, property.longitude] as LatLngExpression} icon={propertyIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-sm">{property.translations[0]?.title || 'Propriété'}</p>
              <p className="text-xs text-gray-600 mt-1">
                {property.price.toLocaleString()} {property.currency}
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
                <p className="text-lg mb-1">{poi.icon}</p>
                <p className="font-semibold text-xs">{poi.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Neighborhood circle if available */}
        {showNeighborhood && property.neighborhood?.centerLatitude && property.neighborhood?.centerLongitude && (
          <Circle
            center={[property.neighborhood.centerLatitude, property.neighborhood.centerLongitude] as LatLngExpression}
            radius={500} // 500m radius
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
                <p className="font-semibold text-sm">{property.neighborhood.name}</p>
                {property.neighborhood.slug && (
                  <Link 
                    href={`/neighborhoods/${property.neighborhood.slug}`}
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    Voir le quartier
                  </Link>
                )}
              </div>
            </Popup>
          </Circle>
        )}
      </MapContainer>

      {/* Map Legend */}
      {pois.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000] text-xs border border-gray-200">
          <h3 className="font-semibold mb-2 text-sm text-gray-900">Légende</h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-red-500">📍</span>
              <span className="text-gray-700">Propriété</span>
            </div>
            {Array.from(new Set(pois.map(poi => poi.type))).map(type => {
              const poiType = poiTypes[type];
              if (!poiType) return null;
              return (
                <div key={type} className="flex items-center gap-2">
                  <span>{poiType.emoji}</span>
                  <span className="text-gray-700">{poiType.label}</span>
                </div>
              );
            })}
            {showNeighborhood && property.neighborhood && (
              <div className="flex items-center gap-2 pt-1.5 border-t border-gray-200 mt-1.5">
                <div className="w-3 h-3 rounded-full border-2 border-primary bg-viridial-100"></div>
                <span className="text-gray-700">Quartier</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

