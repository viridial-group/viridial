'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
// @ts-ignore - leaflet-draw doesn't have TypeScript definitions for event constants
import * as leafletDraw from 'leaflet-draw';

interface MapDrawBoundsProps {
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  enabled?: boolean;
}

export default function MapDrawBounds({ onBoundsChange, enabled = true }: MapDrawBoundsProps) {
  const map = useMap();
  const drawnLayerRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  useEffect(() => {
    if (!enabled) {
      // Remove draw control if disabled
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
      // Remove drawn shapes
      if (drawnLayerRef.current) {
        map.removeLayer(drawnLayerRef.current);
        drawnLayerRef.current = null;
      }
      return;
    }

    // Create a feature group to store drawn shapes
    if (!drawnLayerRef.current) {
      drawnLayerRef.current = new L.FeatureGroup();
      map.addLayer(drawnLayerRef.current);
    }

    // Configure draw control - only rectangle for bounding box
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: false,
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
        rectangle: {
          shapeOptions: {
            color: '#22c55e',
            fillColor: '#22c55e',
            fillOpacity: 0.1,
            weight: 2,
          },
        },
      },
      edit: {
        featureGroup: drawnLayerRef.current,
        remove: true,
      },
    });

    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    // Handle drawing events
    const DrawEvents = (leafletDraw as any).Event || (window as any).L.Draw.Event || {};
    
    const handleDrawCreated = (e: any) => {
      const layer = e.layer;
      drawnLayerRef.current?.addLayer(layer);

      // Get bounds from the drawn rectangle
      const bounds = layer.getBounds();
      const north = bounds.getNorth();
      const south = bounds.getSouth();
      const east = bounds.getEast();
      const west = bounds.getWest();

      if (onBoundsChange) {
        onBoundsChange({ north, south, east, west });
      }
    };

    const handleDrawEdited = () => {
      if (drawnLayerRef.current) {
        const layers = drawnLayerRef.current.getLayers();
        if (layers.length > 0) {
          const layer = layers[0] as L.Layer;
          const bounds = (layer as any).getBounds?.() as L.LatLngBounds | undefined;
          if (bounds && onBoundsChange) {
            const north = bounds.getNorth();
            const south = bounds.getSouth();
            const east = bounds.getEast();
            const west = bounds.getWest();
            onBoundsChange({ north, south, east, west });
          }
        }
      }
    };

    const handleDrawDeleted = (e: any) => {
      // Clear all drawn shapes
      if (drawnLayerRef.current) {
        drawnLayerRef.current.clearLayers();
      }
      if (onBoundsChange) {
        // Clear bounds when shape is deleted
        onBoundsChange({ north: 0, south: 0, east: 0, west: 0 });
      }
    };

    if (DrawEvents.CREATED) {
      map.on(DrawEvents.CREATED, handleDrawCreated);
    }
    if (DrawEvents.EDITED) {
      map.on(DrawEvents.EDITED, handleDrawEdited);
    }
    if (DrawEvents.DELETED) {
      map.on(DrawEvents.DELETED, handleDrawDeleted);
    }

    return () => {
      if (DrawEvents.CREATED) {
        map.off(DrawEvents.CREATED, handleDrawCreated);
      }
      if (DrawEvents.EDITED) {
        map.off(DrawEvents.EDITED, handleDrawEdited);
      }
      if (DrawEvents.DELETED) {
        map.off(DrawEvents.DELETED, handleDrawDeleted);
      }

      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }

      if (drawnLayerRef.current) {
        map.removeLayer(drawnLayerRef.current);
        drawnLayerRef.current = null;
      }
    };
  }, [map, enabled, onBoundsChange]);

  return null;
}

