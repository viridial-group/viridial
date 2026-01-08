'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PropertySearchResult } from '@/lib/api/search';
import { MapPin, DollarSign, Home, Building, LandPlot, Store, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import MapControls from './MapControls';
import dynamic from 'next/dynamic';

// Dynamically import MapDrawBounds and MapCluster to avoid SSR issues
const MapDrawBounds = dynamic(() => import('./MapDrawBounds'), { ssr: false });
const MapCluster = dynamic(() => import('./MapCluster'), { ssr: false });

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon function
const createCustomIcon = (color: string = '#22c55e') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">📍</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to handle map updates when selected property changes
function MapUpdater({
  selectedProperty,
  properties,
}: {
  selectedProperty: PropertySearchResult | null;
  properties: PropertySearchResult[];
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedProperty && selectedProperty.latitude && selectedProperty.longitude) {
      map.setView([selectedProperty.latitude, selectedProperty.longitude], 15, {
        animate: true,
        duration: 0.5,
      });
    } else if (properties.length > 0) {
      // Fit bounds to show all properties
      const bounds = properties
        .filter((p) => p.latitude && p.longitude)
        .map((p) => [p.latitude!, p.longitude!] as [number, number]);

      if (bounds.length > 0) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
        });
      }
    } else {
      // Default view: Paris, France
      map.setView([48.8566, 2.3522], 10);
    }
  }, [selectedProperty, properties, map]);

  return null;
}

interface MapComponentProps {
  properties: PropertySearchResult[];
  selectedProperty: PropertySearchResult | null;
  onPropertySelect: (property: PropertySearchResult) => void;
  onLocateMe?: (position: { lat: number; lng: number }) => void;
  drawBoundsEnabled?: boolean;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  clusteringEnabled?: boolean;
}

export default function MapComponent({
  properties,
  selectedProperty,
  onPropertySelect,
  onLocateMe,
  drawBoundsEnabled = false,
  onBoundsChange,
  clusteringEnabled = false,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'house':
        return <Home className="h-4 w-4" />;
      case 'apartment':
        return <Building className="h-4 w-4" />;
      case 'villa':
        return <Home className="h-4 w-4" />;
      case 'land':
        return <LandPlot className="h-4 w-4" />;
      case 'commercial':
        return <Store className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  // Filter properties with valid coordinates
  const propertiesWithCoords = properties.filter(
    (p) => p.latitude !== null && p.longitude !== null && p.latitude !== undefined && p.longitude !== undefined,
  );

  return (
    <div className="w-full h-full">
      <style jsx global>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
          z-index: 1;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-content {
          margin: 12px;
          min-width: 250px;
        }
      `}</style>
      <MapContainer
        center={[48.8566, 2.3522]} // Default: Paris, France
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater selectedProperty={selectedProperty} properties={properties} />
        
        {/* Map Controls */}
        <MapControls onLocateMe={onLocateMe} />

        {/* Draw Bounds Component */}
        {drawBoundsEnabled && (
          <MapDrawBounds
            enabled={drawBoundsEnabled}
            onBoundsChange={onBoundsChange}
          />
        )}

        {/* Clustering - Show clusters when enabled and more than 10 markers */}
        {clusteringEnabled && propertiesWithCoords.length > 10 ? (
          <MapCluster
            markers={propertiesWithCoords.map((p) => ({
              id: p.id,
              lat: p.latitude!,
              lng: p.longitude!,
            }))}
            onClusterClick={(clusterMarkers) => {
              // Zoom to cluster when clicked
              const bounds = clusterMarkers.map((m) => [m.lat, m.lng] as [number, number]);
              mapRef.current?.fitBounds(bounds, { padding: [50, 50] });
            }}
          />
        ) : (
          // Individual markers when clustering is disabled or few markers
          propertiesWithCoords.map((property) => {
            const isSelected = selectedProperty?.id === property.id;
            return (
              <Marker
                key={property.id}
                position={[property.latitude!, property.longitude!]}
                icon={createCustomIcon(isSelected ? '#16a34a' : '#22c55e')}
                eventHandlers={{
                  click: () => {
                    onPropertySelect(property);
                  },
                  mouseover: (e) => {
                    e.target.openPopup();
                  },
                }}
              >
                <Popup className="property-popup-wrapper" closeButton={true} autoPan={true}>
                  <div className="property-popup min-w-[280px] max-w-[320px]">
                    {property.mediaUrls && property.mediaUrls.length > 0 && (
                      <div className="relative w-full h-40 bg-gray-200 rounded-lg overflow-hidden mb-3">
                        <img
                          src={property.mediaUrls[0]}
                          alt={property.title_fr || 'Property'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                    )}
                    <h3 className="font-semibold text-base mb-2 line-clamp-2 text-gray-900">
                      {property.title_fr || property.title_en || 'Sans titre'}
                    </h3>
                    <div className="flex items-center gap-2 text-green-600 font-bold text-lg mb-3">
                      <DollarSign className="h-5 w-5" />
                      {formatPrice(property.price, property.currency)}
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {property.city}
                          {property.country && `, ${property.country}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        {getPropertyTypeIcon(property.type)}
                        <span className="capitalize">{property.type}</span>
                      </div>
                    </div>
                    <Link
                      href={`/properties/${property.id}`}
                      className="inline-flex items-center justify-center w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Voir les détails
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })
        )}
      </MapContainer>
    </div>
  );
}

