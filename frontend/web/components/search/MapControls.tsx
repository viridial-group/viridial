'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { Navigation, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapControlsProps {
  onLocateMe?: (position: { lat: number; lng: number }) => void;
}

export default function MapControls({ onLocateMe }: MapControlsProps) {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas disponible dans votre navigateur');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 15, {
          animate: true,
          duration: 1,
        });
        
        if (onLocateMe) {
          onLocateMe({ lat: latitude, lng: longitude });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Impossible d\'obtenir votre position. Vérifiez les permissions de géolocalisation.');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const mapContainer = map.getContainer().parentElement;
      if (mapContainer?.requestFullscreen) {
        mapContainer.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {/* Locate Me Button */}
      <Button
        onClick={handleLocateMe}
        variant="default"
        size="icon"
        className="h-10 w-10 rounded-full shadow-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-green-600 transition-all"
        title="Localiser ma position"
      >
        <Navigation className="h-5 w-5" />
      </Button>

      {/* Zoom Controls */}
      <div className="flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <Button
          onClick={handleZoomIn}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none border-b border-gray-200 hover:bg-gray-50"
          title="Zoomer"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleZoomOut}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none hover:bg-gray-50"
          title="Dézoomer"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Fullscreen Toggle */}
      <Button
        onClick={toggleFullscreen}
        variant="default"
        size="icon"
        className="h-10 w-10 rounded-full shadow-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-green-600 transition-all"
        title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
      >
        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
      </Button>
    </div>
  );
}

