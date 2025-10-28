"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { env } from '@/lib/config';
import type { Trip, CmsFullDayBlock, CmsWaypointBlock } from '@/types/payload';
import { useMemo, useRef, useEffect } from 'react';
import { getCombinedCountryBounds, getCountryBounds } from '@/lib/countryBounds';

// Types for Leaflet
interface LeafletMapInstance {
  fitBounds: (bounds: unknown, options?: { padding?: [number, number]; maxZoom?: number }) => void;
}

interface LeafletModule {
  latLngBounds: (coords: Array<[number, number]>) => {
    pad: (amount: number) => unknown;
  };
  divIcon: (options: { html: string; className: string; iconSize: [number, number] }) => unknown;
  Icon?: {
    Default?: {
      prototype: Record<string, unknown>;
      mergeOptions: (options: { iconUrl: string; iconRetinaUrl: string; shadowUrl: string }) => void;
    };
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MapContainer: any = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TileLayer: any = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Marker: any = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });

function toNumber(v: unknown): number | null {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return isNaN(n) ? null : n;
  }
  return null;
}

function extractBlockCoords(block: CmsFullDayBlock | CmsWaypointBlock) {
  const b: any = block;
  const candidates: any[] = [];
  if (b.location?.coordinates) candidates.push(b.location.coordinates);
  if (Array.isArray(b.location) && b.location.length >= 2) candidates.push(b.location);
  if (b.location?.lng !== undefined && b.location?.lat !== undefined) candidates.push([b.location.lng, b.location.lat]);
  if (b.locationLng !== undefined && b.locationLat !== undefined) candidates.push([b.locationLng, b.locationLat]);
  if (b.coordinates) candidates.push(b.coordinates);
  if (b.locationCoordinates) candidates.push(b.locationCoordinates);
  for (const raw of candidates) {
    if (Array.isArray(raw) && raw.length >= 2) {
      const lng = toNumber(raw[0]);
      const lat = toNumber(raw[1]);
      if (lng !== null && lat !== null) return { lat, lng };
    } else if (typeof raw === 'object' && raw) {
      const lng = toNumber(raw.lng);
      const lat = toNumber(raw.lat);
      if (lng !== null && lat !== null) return { lat, lng };
    }
  }
  return null;
}

export default function SmallOverviewMap({ trip }: { trip: Trip }) {
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);

  const markers = useMemo(() => {
    if (!trip.itinerary) return [];
    const m: { coord: { lat: number; lng: number }; idx: number }[] = [];
    trip.itinerary.forEach((block, idx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coord = extractBlockCoords(block as unknown as any);
      if (coord) {
        m.push({ coord, idx });
      }
    });
    return m;
  }, [trip.itinerary]);

  // Calculate country bounds
  const countryBounds = useMemo(() => {
    if (!trip.countries || trip.countries.length === 0) return null;
    
    const countryCodes = trip.countries
      .map(country => {
        if (typeof country === 'string') return null;
        return country?.countryCode;
      })
      .filter((code): code is string => !!code);
    
    if (countryCodes.length === 0) return null;
    
    // Get combined bounds for all countries
    if (countryCodes.length === 1) {
      return getCountryBounds(countryCodes[0]);
    } else {
      return getCombinedCountryBounds(countryCodes);
    }
  }, [trip.countries]);

  // Dynamically import Leaflet and handle bounds fitting
  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('leaflet').then((mod) => {
      leafletRef.current = (mod && (mod as any).default) || mod;
      // Configure Leaflet icon paths to use static assets
      const L = leafletRef.current;
      if (L && L.Icon && L.Icon.Default) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: '/marker-icon.png',
          iconRetinaUrl: '/marker-icon-2x.png',
          shadowUrl: '/marker-shadow.png',
        });
      }
      
      // Auto-fit bounds to countries or fallback to markers
      if (mapRef.current && L) {
        const map = mapRef.current;
        
        if (countryBounds) {
          // Use country bounds if available, expanded to show more context
          const expandFactor = 0.3; // Expand bounds by 30% in each direction
          const latDiff = countryBounds[1][0] - countryBounds[0][0];
          const lngDiff = countryBounds[1][1] - countryBounds[0][1];
          
          const expandedBounds: [[number, number], [number, number]] = [
            [countryBounds[0][0] - (latDiff * expandFactor), countryBounds[0][1] - (lngDiff * expandFactor)], // SW
            [countryBounds[1][0] + (latDiff * expandFactor), countryBounds[1][1] + (lngDiff * expandFactor)]  // NE
          ];
          
          const bounds = L.latLngBounds([expandedBounds[0], expandedBounds[1]]);
          map.fitBounds(bounds, { maxZoom: 6 });
        } else if (markers.length > 0) {
          // Fallback to marker bounds
          const bounds = L.latLngBounds(markers.map(m => [m.coord.lat, m.coord.lng]));
          
          if (markers.length === 1) {
            // For single marker, fit bounds but with reasonable zoom limit
            map.fitBounds(bounds, { padding: [20, 20], maxZoom: 10 });
          } else {
            // For multiple markers, fit all with padding
            map.fitBounds(bounds, { padding: [15, 15] });
          }
        }
      }
    }).catch(() => {});
  }, [countryBounds, markers]);

  // Initial center and zoom (will be overridden by useEffect)
  const center: [number, number] = useMemo(() => {
    if (countryBounds) {
      // Center of country bounds
      const centerLat = (countryBounds[0][0] + countryBounds[1][0]) / 2;
      const centerLng = (countryBounds[0][1] + countryBounds[1][1]) / 2;
      return [centerLat, centerLng];
    } else if (markers.length > 0) {
      return [markers[0].coord.lat, markers[0].coord.lng];
    } else {
      return [20, 0];
    }
  }, [countryBounds, markers]);

  const zoom = countryBounds ? 6 : (markers.length > 0 ? 7 : 3);

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card shadow-sm w-full md:w-96">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        className="h-48 w-full" 
        scrollWheelZoom={false} 
        dragging={false} 
        doubleClickZoom={false} 
        zoomControl={false} 
        touchZoom={false} 
        attributionControl={false}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        whenCreated={(map: any) => { mapRef.current = map; }}
      >
        <TileLayer
          attribution={env.MAPTILER_KEY ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> contributors' : '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'}
          url={env.MAPTILER_KEY ? `https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${env.MAPTILER_KEY}` : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />
        {markers.map(m => {
          const L = leafletRef.current;
          const icon = L ? L.divIcon({ html: `<div class=\"rr-marker\">${m.idx + 1}</div>`, className: '', iconSize: [24, 24] }) : undefined;
          return (
            <Marker key={m.idx} position={[m.coord.lat, m.coord.lng]} {...(icon ? { icon } : {})} />
          );
        })}
      </MapContainer>
    </div>
  );
}
