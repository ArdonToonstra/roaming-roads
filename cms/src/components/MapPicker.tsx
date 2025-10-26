/**
 * MapPicker - GPS coordinate selection component for Payload CMS
 * 
 * A Payload CMS field component that provides an interactive map interface for 
 * selecting GPS coordinates. Users can click on the map to preview coordinates
 * and then copy them to the associated GPS field. Handles coordinate conversion
 * between Leaflet's [lat, lng] format and Payload's [lng, lat] storage format.
 * 
 * Features:
 * - Interactive map with click-to-select coordinates
 * - Preview of selected position before confirming
 * - Automatic coordinate format conversion for Payload storage
 * - Dynamic map loading to avoid SSR issues
 * - Displays existing coordinates as markers when editing
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useField, useFormFields } from '@payloadcms/ui';
import { getCountryBounds, getCountryBoundsByName } from '../utils/countryBounds';

type Props = {
  path: string;
}

const MapPicker: React.FC<Props> = ({ path }) => {
  const { value, setValue } = useField<[number, number]>({ path });
  const formFields = useFormFields(([fields]) => fields);
  const [isClient, setIsClient] = useState(false);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [previewPosition, setPreviewPosition] = useState<[number, number] | null>(null);
  const [mapTilerKey, setMapTilerKey] = useState<string>('');
  const [countryBounds, setCountryBounds] = useState<[[number, number], [number, number]] | null>(null);

  useEffect(() => {
    if (value && Array.isArray(value) && value.length === 2) {
      // Payload stores as [lon, lat], Leaflet uses [lat, lon]
      setMarkerPosition([value[1], value[0]]);
      setPreviewPosition([value[1], value[0]]);
    }
  }, [value]);

  useEffect(() => {
    // Only run on client side to avoid hydration issues
    if (typeof window === 'undefined') return;
    
    setIsClient(true);
    
    // Get MapTiler key from environment (client-side only)
    setMapTilerKey(process.env.NEXT_PUBLIC_MAPTILER_KEY || '');
    
    // Dynamically import the map component to avoid SSR issues
    import('./DynamicMapComponent')
      .then(module => {
        setMapComponent(() => module.default);
      })
      .catch(err => console.error('Failed to load map component:', err));
  }, []);

  // Separate effect for country bounds to avoid dependency issues
  useEffect(() => {
    if (!isClient) return;
    
    try {
      // Look for country in form data (for trips)
      if (formFields?.country?.value) {
        const countryData = formFields.country.value;
        let bounds = null;
        
        // Try by country code first
        if (typeof countryData === 'object' && countryData && 'countryCode' in countryData) {
          bounds = getCountryBounds(countryData.countryCode as string);
        }
        // Try by country name
        else if (typeof countryData === 'object' && countryData && 'name' in countryData) {
          bounds = getCountryBoundsByName(countryData.name as string);
        }
        // If it's just a string, try it as a name
        else if (typeof countryData === 'string') {
          bounds = getCountryBoundsByName(countryData);
        }
        
        if (bounds) {
          setCountryBounds(bounds);
        }
      }
    } catch (error) {
      console.log('Could not detect country for map bounds:', error);
    }
  }, [formFields, isClient]);

  const copyToField = () => {
    if (previewPosition) {
      // Convert back to [lon, lat] for Payload
      setValue([previewPosition[1], previewPosition[0]]);
      setMarkerPosition(previewPosition);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPreviewPosition([lat, lng]);
  };

  const handleSearchLocation = (lat: number, lng: number) => {
    setPreviewPosition([lat, lng]);
    // Auto-copy search results to make it faster
    setValue([lng, lat]);
    setMarkerPosition([lat, lng]);
  };

  // Prevent hydration mismatches by not rendering anything until client-side
  if (!isClient) {
    return <div style={{ 
      height: '400px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      border: '1px solid #ddd',
      borderRadius: '4px'
    }}>
      Loading map interface...
    </div>;
  }

  const currentCenter: [number, number] = markerPosition || [51.505, -0.09];
  const initialZoom = markerPosition ? 13 : 2;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <p>
          Click on the map to select coordinates, then copy them to the field.
          {mapTilerKey && <span> Use the search box in the top-right to find places quickly.</span>}
        </p>
        {!mapTilerKey && (
          <div style={{ 
            padding: '0.5rem', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '4px', 
            margin: '0.5rem 0',
            fontSize: '0.8rem',
            color: '#856404'
          }}>
            💡 <strong>Tip:</strong> Add NEXT_PUBLIC_MAPTILER_KEY to .env.local for better maps and place search
          </div>
        )}
        
        {/* Current field value */}
        {value && Array.isArray(value) && value.length === 2 && (
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #e9ecef', 
            borderRadius: '4px', 
            margin: '0.5rem 0',
            fontSize: '0.9rem'
          }}>
            <strong>Current GPS coordinates:</strong> {value[1].toFixed(6)}, {value[0].toFixed(6)}
            <br />
            <small style={{ color: '#6c757d' }}>Longitude: {value[0].toFixed(6)}, Latitude: {value[1].toFixed(6)}</small>
          </div>
        )}
        
        {/* Preview selection */}
        {previewPosition && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
            <span>
              Selected: <strong>{previewPosition[0].toFixed(6)}, {previewPosition[1].toFixed(6)}</strong>
            </span>
            <button type="button" className="btn btn--style-primary" onClick={copyToField}>
              Copy to GPS field
            </button>
          </div>
        )}
      </div>
      <div style={{ height: '400px', width: '100%' }}>
        {isClient && MapComponent ? (
          <MapComponent 
            center={currentCenter} 
            zoom={initialZoom}
            onMapClick={handleMapClick}
            markerPosition={previewPosition}
            mapTilerKey={mapTilerKey}
            countryBounds={countryBounds}
            onSearch={mapTilerKey ? handleSearchLocation : undefined}
          />
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd'
          }}>
            Loading map...
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPicker;
