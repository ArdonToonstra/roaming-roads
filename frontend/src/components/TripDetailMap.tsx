"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Trip, CmsFullDayBlock, CmsWaypointBlock } from '@/types/payload';
import 'leaflet/dist/leaflet.css';
import { env } from '@/lib/config';

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

// Dynamic imports to avoid SSR issues - using any due to dynamic import limitations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MapContainer: any = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TileLayer: any = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Marker: any = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Popup: any = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const b: any = block;
  // Candidate fields in descending priority
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candidates: any[] = [];
  if (b.location?.coordinates) candidates.push(b.location.coordinates);
  // If location itself is an array (direct [lng, lat])
  if (Array.isArray(b.location) && b.location.length >= 2) candidates.push(b.location);
  if (b.location?.lng !== undefined && b.location?.lat !== undefined) candidates.push([b.location.lng, b.location.lat]);
  if (b.locationLng !== undefined && b.locationLat !== undefined) candidates.push([b.locationLng, b.locationLat]);
  if (b.coordinates) candidates.push(b.coordinates);
  if (b.locationCoordinates) candidates.push(b.locationCoordinates);
  // Try each candidate
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

export interface TripDetailMapProps {
  trip: Trip;
  heightClass?: string; // height applied to outer wrapper now
  activeIndex?: number | null; // highlighted itinerary block index for scroll spy
}

export default function TripDetailMap({ trip, heightClass, activeIndex }: TripDetailMapProps) {
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const lastPanRef = useRef<number | null>(null);

  const markers = useMemo(() => {
    if (!trip.itinerary) return [];
    const m: { coord: { lat: number; lng: number }; block: CmsFullDayBlock | CmsWaypointBlock; idx: number }[] = [];
    trip.itinerary.forEach((block, idx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coord = extractBlockCoords(block as unknown as any);
      if (coord) {
        m.push({ coord, block, idx });
      } else if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('[TripDetailMap] no coords for block', idx, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          location: (block as unknown as any).location,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          locationType: typeof (block as unknown as any).location,
        });
      }
    });
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug('[TripDetailMap] itinerary blocks:', trip.itinerary.length, 'markers:', m.length);
    }
    return m;
  }, [trip.itinerary]);

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

      // Fit bounds after Leaflet is loaded
      if (mapRef.current && markers.length > 0 && L) {
        const bounds = L.latLngBounds(markers.map(m => [m.coord.lat, m.coord.lng]));
        
        if (markers.length === 1) {
          // For single marker, fit bounds but with reasonable zoom limit
          mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        } else {
          // For multiple markers, fit all with padding
          mapRef.current.fitBounds(bounds, { padding: [30, 30] });
        }
      }
    }).catch(() => {});
  }, [markers]);

  // Pan map when activeIndex changes (scroll-driven focus) with simple throttle
  useEffect(() => {
    if (activeIndex === null || activeIndex === undefined) return;
    if (!mapRef.current) return;
    const target = markers.find(m => m.idx === activeIndex);
    if (!target) return;
    const now = Date.now();
    // Throttle to avoid excessive panning during fast scroll (200ms)
    if (lastPanRef.current && (now - lastPanRef.current) < 200) return;
    lastPanRef.current = now;
    try {
      // Slightly higher zoom for focus without being too tight
      // Leaflet flyTo if available, fallback to setView
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapAny: any = mapRef.current;
      if (mapAny.flyTo) {
        mapAny.flyTo([target.coord.lat, target.coord.lng], Math.max(mapAny.getZoom(), 7), { duration: 0.6 });
      } else if (mapAny.setView) {
        mapAny.setView([target.coord.lat, target.coord.lng], Math.max(mapAny.getZoom(), 7));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[TripDetailMap] pan failed', e);
    }
  }, [activeIndex, markers]);

  const initialCenter: [number, number] = markers.length > 0 ? [markers[0].coord.lat, markers[0].coord.lng] : [20, 0];
  const initialZoom = markers.length > 0 ? 9 : 2; // slightly more zoomed-in default

  return (
    <div className={`rounded-xl overflow-hidden border border-border bg-card shadow-sm ${heightClass || 'h-[360px]'} z-0`}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="h-full w-full"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        whenCreated={(map: any) => { mapRef.current = map; }}
        scrollWheelZoom={true}
        zoomControl={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
      >
        <TileLayer
          attribution={env.MAPTILER_KEY ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> contributors' : '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'}
          // Use MapTiler raster tiles (satellite imagery) when a key is provided; fall back to OSM raster tiles
          url={
            env.MAPTILER_KEY
              ? `https://api.maptiler.com/maps/satellite-v2/{z}/{x}/{y}.jpg?key=${env.MAPTILER_KEY}`
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
        {env.MAPTILER_KEY && (
          // Add a label/hybrid overlay on top of the satellite imagery so city names, borders and POI labels are visible.
          // MapTiler provides hybrid/label tiles you can overlay; this keeps satellite imagery as the base layer.
          <TileLayer
            attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> contributors'
            url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.png?key=${env.MAPTILER_KEY}`}
            // Ensure overlay sits above base tiles
            zIndex={650}
            opacity={1}
          />
        )}
        {markers.map(m => {
          const L = leafletRef.current;
          const isActive = activeIndex === m.idx;
          const classes = `rr-marker ${isActive ? 'rr-marker-active' : ''}`;
          const icon = L ? L.divIcon({ html: `<div class=\"${classes}\">${m.idx + 1}</div>`, className: '', iconSize: [40, 40] }) : undefined;
          // If Leaflet hasn't loaded yet, render marker without custom icon
          return (
            <Marker key={m.idx} position={[m.coord.lat, m.coord.lng]} {...(icon ? { icon } : {})}>
              <Popup>
                <div className="text-sm max-w-[240px]">
                  <strong className="block mb-1">Day {m.idx + 1}: {m.block.locationName || `Stop ${m.idx + 1}`}</strong>
                  {m.block.regionProvince && <div className="text-xs opacity-80 mb-1">{m.block.regionProvince}</div>}
                  {m.block.description && (
                    <div className="text-xs leading-relaxed">
                      {String(m.block.description).slice(0, 120)}{String(m.block.description).length > 120 ? '…' : ''}
                    </div>
                  )}
                  <a href={`#day-${m.idx + 1}`} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">Jump to day</a>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {markers.length > 1 && (
          <Polyline
            positions={markers.map(m => [m.coord.lat, m.coord.lng])}
            pathOptions={{ color: '#F57D50', weight: 3, opacity: 0.8 }}
          />
        )}
      </MapContainer>
      <div className="p-3 text-xs text-muted-foreground border-t border-border">
        {markers.length > 0 ? `${markers.length} itinerary point${markers.length === 1 ? '' : 's'} mapped` : 'No coordinates for this itinerary yet'}
      </div>
    </div>
  );
}
