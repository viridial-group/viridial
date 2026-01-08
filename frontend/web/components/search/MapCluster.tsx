'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapClusterProps {
  markers: Array<{ id: string; lat: number; lng: number }>;
  onClusterClick?: (markers: Array<{ id: string; lat: number; lng: number }>) => void;
}

/**
 * Simple marker clustering implementation
 * Groups nearby markers and shows count on clusters
 */
export default function MapCluster({ markers, onClusterClick }: MapClusterProps) {
  const map = useMap();
  const clusterGroupRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    // Simple clustering: Create markers and group them by proximity
    if (markers.length === 0) {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
      return;
    }

    // Create a feature group for all markers
    const clusterGroup = L.featureGroup();
    
    // Group markers by proximity (simple grid-based clustering)
    const gridSize = 0.05; // degrees (roughly 5km at equator)
    const clusters: { [key: string]: typeof markers } = {};
    
    markers.forEach((marker) => {
      const gridKey = `${Math.floor(marker.lat / gridSize)}_${Math.floor(marker.lng / gridSize)}`;
      if (!clusters[gridKey]) {
        clusters[gridKey] = [];
      }
      clusters[gridKey].push(marker);
    });
    
    // Create cluster markers or individual markers
    Object.entries(clusters).forEach(([gridKey, clusterMarkers]) => {
      if (clusterMarkers.length > 1) {
        // Multiple markers in this cluster - show cluster marker
        const centerLat = clusterMarkers.reduce((sum, m) => sum + m.lat, 0) / clusterMarkers.length;
        const centerLng = clusterMarkers.reduce((sum, m) => sum + m.lng, 0) / clusterMarkers.length;
        
        const clusterMarker = L.marker([centerLat, centerLng], {
          icon: L.divIcon({
            html: `<div style="
              background-color: #22c55e;
              color: white;
              border-radius: 50%;
              width: ${clusterMarkers.length > 100 ? '50px' : clusterMarkers.length > 20 ? '40px' : '30px'};
              height: ${clusterMarkers.length > 100 ? '50px' : clusterMarkers.length > 20 ? '40px' : '30px'};
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: ${clusterMarkers.length > 100 ? '14px' : clusterMarkers.length > 20 ? '12px' : '10px'};
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">${clusterMarkers.length}</div>`,
            className: 'marker-cluster',
            iconSize: L.point(
              clusterMarkers.length > 100 ? 50 : clusterMarkers.length > 20 ? 40 : 30,
              clusterMarkers.length > 100 ? 50 : clusterMarkers.length > 20 ? 40 : 30
            ),
          }),
        });
        
        clusterMarker.on('click', () => {
          if (onClusterClick) {
            onClusterClick(clusterMarkers);
          }
          // Zoom in to show individual markers
          const bounds = L.latLngBounds(clusterMarkers.map(m => [m.lat, m.lng]));
          map.fitBounds(bounds, { padding: [50, 50] });
        });
        
        clusterGroup.addLayer(clusterMarker);
      } else {
        // Single marker - add individual marker with same styling
        const singleMarker = clusterMarkers[0];
        const marker = L.marker([singleMarker.lat, singleMarker.lng], {
          icon: L.divIcon({
            html: `
              <div style="
                background-color: #22c55e;
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
            className: 'custom-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
        });

        marker.on('click', () => {
          if (onClusterClick) {
            onClusterClick([singleMarker]);
          }
        });

        clusterGroup.addLayer(marker);
      }
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [markers, map, onClusterClick]);

  return null;
}
