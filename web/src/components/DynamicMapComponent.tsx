/**
 * DynamicMapComponent - Interactive Leaflet map for location selection
 * 
 * A client-side React component that renders an interactive map using Leaflet.
 * Allows users to click on the map to select coordinates and displays markers
 * for selected positions. Dynamically loads Leaflet CSS and handles proper
 * cleanup of map instances.
 * 
 * Used in the CMS for location-based content like trip waypoints and accommodations.
 */
'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface DynamicMapProps {
  center: [number, number];
  zoom: number;
  onMapClick: (lat: number, lng: number) => void;
  markerPosition?: [number, number] | null;
  mapTilerKey?: string;
  countryBounds?: [[number, number], [number, number]] | null;
  onSearch?: (lat: number, lng: number) => void;
}

const DynamicMapComponent: React.FC<DynamicMapProps> = ({
  center,
  zoom,
  onMapClick,
  markerPosition,
  mapTilerKey,
  countryBounds,
  onSearch
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);


  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Load Leaflet CSS dynamically - only once
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Fix for default icon issue with webpack
    if (L && L.Icon && L.Icon.Default) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    }
  }, []);

  useEffect(() => {
    // Only initialize map on client side
    if (typeof window === 'undefined') return;
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);

    // Add tile layers with better labels for place names
    if (mapTilerKey) {
      // Use streets map for better place name visibility in admin interface
      L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${mapTilerKey}`, {
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> contributors',
        maxZoom: 18
      }).addTo(map);
    } else {
      // Fallback to OpenStreetMap with better labels
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);
    }

    // Add click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;

    // Fit to country bounds if provided
    if (countryBounds) {
      const bounds = L.latLngBounds(countryBounds[0], countryBounds[1]);
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 8 });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, onMapClick, countryBounds]);

  // Update marker position
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    // Add new marker if position is provided
    if (markerPosition) {
      markerRef.current = L.marker(markerPosition).addTo(mapInstanceRef.current);
    }
  }, [markerPosition]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {/* Search control overlay */}
      {mapTilerKey && onSearch && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <SearchControl mapTilerKey={mapTilerKey} onLocationSelect={onSearch} />
        </div>
      )}
    </div>
  );
}

// Search component
interface SearchControlProps {
  mapTilerKey: string;
  onLocationSelect: (lat: number, lng: number) => void;
}

const SearchControl: React.FC<SearchControlProps> = ({ mapTilerKey, onLocationSelect }) => {
  const [query, setQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSearch = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${mapTilerKey}&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        onLocationSelect(lat, lng);
        setQuery(''); // Clear search after successful search
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '5px', minWidth: '200px' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search places..."
        style={{
          flex: 1,
          padding: '4px 8px',
          border: '1px solid #ddd',
          borderRadius: '3px',
          fontSize: '12px'
        }}
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e);
          }
        }}
      />
      <button
        type="button"
        onClick={handleSearch}
        disabled={isLoading || !query.trim()}
        style={{
          padding: '4px 8px',
          backgroundColor: '#007cba',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '12px',
          minWidth: '50px'
        }}
      >
        {isLoading ? '...' : '🔍'}
      </button>
    </div>
  );
};

export default DynamicMapComponent;