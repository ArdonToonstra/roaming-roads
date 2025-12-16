"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { env } from '@/lib/config';
import type { Trip, CmsFullDayBlock, CmsWaypointBlock } from '@/types/payload';
import { useMemo, useRef, useEffect, useState } from 'react';
import { getCombinedCountryBounds, getCountryBounds } from '@/lib/countryBounds';
import type * as L from 'leaflet';

// Types for Leaflet
interface LeafletMapInstance extends L.Map {
  fitBounds(bounds: unknown, options?: { padding?: [number, number]; maxZoom?: number }): this;
  _container?: HTMLElement;
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Polyline: any = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

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
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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

  // Track when component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dynamically import Leaflet and handle bounds fitting
  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;
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

      // Mark Leaflet as loaded so we can render custom markers
      setIsLeafletLoaded(true);

    }).catch(() => { });

    // Cleanup: remove map instance if strict mode re-mounts
    return () => {
      const map = mapRef.current;
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, [isMounted]);

  // Separate effect for bounds fitting that runs when map, markers, or countries change
  useEffect(() => {
    if (!isMounted || !isLeafletLoaded || !mapRef.current || !leafletRef.current) return;

    const map = mapRef.current;
    const L = leafletRef.current;

    // Longer delay to ensure map and tiles are fully loaded, especially on page refresh
    const timeoutId = setTimeout(() => {
      // Double check everything is still available
      if (!mapRef.current || !leafletRef.current) return;

      const currentMap = mapRef.current;
      const currentL = leafletRef.current;

      try {
        if (markers.length > 0) {
          // Always use marker bounds to ensure all markers are visible
          const markerBounds = currentL.latLngBounds(markers.map(m => [m.coord.lat, m.coord.lng]));

          if (markers.length === 1) {
            // For single marker, fit bounds but with reasonable zoom limit
            currentMap.fitBounds(markerBounds as any, { padding: [30, 30], maxZoom: 10 });
          } else {
            // For multiple markers, fit all with generous padding to ensure visibility
            currentMap.fitBounds(markerBounds as any, { padding: [50, 50], maxZoom: 10 });
          }
        } else if (countryBounds) {
          // Only use country bounds if there are no markers to show
          const bounds = currentL.latLngBounds([countryBounds[0], countryBounds[1]]);
          currentMap.fitBounds(bounds as any, { padding: [20, 20], maxZoom: 10 });
        }
      } catch (error) {
        console.warn('[SmallOverviewMap] Error fitting bounds:', error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isMounted, isLeafletLoaded, markers, countryBounds]);

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

  const zoom = countryBounds ? 8 : (markers.length > 0 ? 7 : 3);

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card shadow-sm w-full md:w-96">
      <MapContainer
        key={`${trip.id}-${center[0]}`}
        center={center}
        zoom={zoom}
        className="h-48 w-full"
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        touchZoom={false}
        attributionControl={false}
        ref={(map: LeafletMapInstance | null) => { mapRef.current = map; }}
      >
        <TileLayer
          attribution={env.MAPTILER_KEY ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> contributors' : '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'}
          url={env.MAPTILER_KEY ? `https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${env.MAPTILER_KEY}` : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />
        {/* Connecting line between markers */}
        {markers.length > 1 && (
          <Polyline
            positions={markers.map(m => [m.coord.lat, m.coord.lng])}
            pathOptions={{ color: '#F57D50', weight: 2, opacity: 0.8 }}
          />
        )}
        {/* Small orange dot markers - only render when Leaflet is loaded */}
        {isLeafletLoaded && markers.map(m => {
          const L = leafletRef.current;
          if (!L) return null;

          const icon = L.divIcon({
            html: '<div class=\"rr-small-dot\"></div>',
            className: '',
            iconSize: [8, 8]
          });

          return (
            <Marker key={m.idx} position={[m.coord.lat, m.coord.lng]} icon={icon} />
          );
        })}
      </MapContainer>
    </div>
  );
}
