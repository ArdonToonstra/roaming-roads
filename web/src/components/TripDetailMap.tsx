'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef } from 'react';
import type { Trip, CmsFullDayBlock, CmsWaypointBlock } from '@/types/payload';
import 'leaflet/dist/leaflet.css';
import { env } from '@/lib/config';
import MapController from './MapController';
import type * as L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

// Types for Leaflet
interface LeafletMapInstance extends L.Map {
  fitBounds(bounds: unknown, options?: { padding?: [number, number]; maxZoom?: number }): this;
  _container?: HTMLElement;
}

interface LeafletModule {
  latLngBounds: (coords: Array<[number, number]>) => any;
  divIcon: (options: { html: string; className: string; iconSize: [number, number] }) => any;
  Icon?: {
    Default?: {
      prototype: Record<string, unknown>;
      mergeOptions: (options: { iconUrl: string; iconRetinaUrl: string; shadowUrl: string }) => void;
    };
  };
}

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
  // Candidate fields in descending priority
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

// Function to get transportation icon based on method
function getTransportationIcon(method: string): string {
  switch (method) {
    case 'walking': return '🚶';
    case 'rental_car': return '🚗';
    case 'public_bus': return '🚌';
    case 'taxi': return '🚕';
    case 'train': return '🚂';
    case 'flight': return '✈️';
    case 'boat': return '🚢';
    case 'bicycle': return '🚴';
    case 'hitchhiking': return '👍';
    case 'tour_bus': return '🚐';
    default: return '🚶'; // Default to walking
  }
}

export interface TripDetailMapProps {
  trip: Trip;
  heightClass?: string; // height applied to outer wrapper now
  activeIndex?: number | null; // highlighted itinerary block index for scroll spy
}

export default function TripDetailMap({ trip, heightClass, activeIndex }: TripDetailMapProps) {
  // mapRef is used for initial bounds fitting when the map loads
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);

  const markers = useMemo(() => {
    if (!trip.itinerary) return [];
    const m: { coord: { lat: number; lng: number }; block: CmsFullDayBlock | CmsWaypointBlock; idx: number }[] = [];
    trip.itinerary.forEach((block, idx) => {
      const coord = extractBlockCoords(block as unknown as any);
      if (coord) {
        m.push({ coord, block, idx });
      } else if (process.env.NODE_ENV === 'development') {
        console.debug('[TripDetailMap] no coords for block', idx, {
          location: (block as unknown as any).location,
          locationType: typeof (block as unknown as any).location,
        });
      }
    });
    if (process.env.NODE_ENV === 'development') {
      console.debug('[TripDetailMap] itinerary blocks:', trip.itinerary.length, 'markers:', m.length);
    }
    return m;
  }, [trip.itinerary]);

  // Dynamically import Leaflet and handle initial bounds fitting
  // Note: MapController handles dynamic focus changes, while this handles initial view
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

      // Fit bounds after Leaflet is loaded to show all markers initially
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
    }).catch(() => { });

    return () => {
      mapRef.current = null;
    };
  }, [markers]);

  const initialCenter: [number, number] = markers.length > 0 ? [markers[0].coord.lat, markers[0].coord.lng] : [20, 0];
  const initialZoom = markers.length > 0 ? 9 : 2; // slightly more zoomed-in default

  return (
    <div className={`overflow-hidden border border-border bg-card shadow-sm ${heightClass || 'h-[360px]'} z-0`}>
      <MapContainer
        key={`${trip.id}-${initialCenter[0]}`}
        center={initialCenter}
        zoom={initialZoom}
        className="h-full w-full"
        ref={(map: any) => { if (map) mapRef.current = map; }}
        scrollWheelZoom={true}
        zoomControl={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
      >
        <MapController activeIndex={activeIndex} markers={markers} />
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
            url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.png?key=${env.MAPTILER_KEY}`}
            // Ensure overlay sits above base tiles
            zIndex={650}
            opacity={1}
          />
        )}
        {markers.map(m => {
          const L = leafletRef.current;
          const isActive = activeIndex === m.idx;
          const blockType = (m.block as any).blockType;
          const isFullDay = blockType === 'fullDay';
          const typeClass = isFullDay ? 'rr-marker-fullday' : 'rr-marker-waypoint';
          const classes = `rr-marker ${typeClass} ${isActive ? 'rr-marker-active' : ''}`;

          // All markers use simple step numbering
          const iconContent = `${m.idx + 1}`;

          const icon = L ? L.divIcon({ html: `<div class=\"${classes}\">${iconContent}</div>`, className: '', iconSize: [40, 40] }) : undefined;
          // If Leaflet hasn't loaded yet, render marker without custom icon
          return (
            <Marker key={m.idx} position={[m.coord.lat, m.coord.lng]} {...(icon ? { icon } : {})}>
              <Popup>
                <div className="text-sm max-w-[240px]">
                  <div className="flex items-center gap-1 mb-1">
                    <strong>Step {m.idx + 1}: {m.block.locationName || `Stop ${m.idx + 1}`}</strong>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full text-white ${isFullDay ? 'bg-orange-500' : 'bg-blue-500'}`}>
                      {isFullDay ? 'Stay' : 'Visit'}
                    </span>
                  </div>
                  {m.block.regionProvince && <div className="text-xs opacity-80 mb-1">{m.block.regionProvince}</div>}
                  {m.block.description && (
                    <div className="text-xs leading-relaxed">
                      {String(m.block.description).slice(0, 120)}{String(m.block.description).length > 120 ? '…' : ''}
                    </div>
                  )}
                  <a href={`#day-${m.idx + 1}`} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">Jump to step</a>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Segmented polylines with transportation icons */}
        {/* Main Route Polyline */}
        {(() => {
          const mainRouteMarkers = markers.filter(m => (m.block as any).connectionType !== 'side_trip');
          if (mainRouteMarkers.length <= 1) return null;

          return mainRouteMarkers.slice(0, -1).map((currentMarker, i) => {
            const nextMarker = mainRouteMarkers[i + 1];
            // Fix: We need to check transportation of the NEXT block in the sequence
            // but nextMarker.block might not be the immediate next block in the original list if we skipped side trips.
            // However, visually we want the line.
            // For transportation icons, we technically should check the *nextMarker's* transportation info.
            const nextBlock = nextMarker.block as any;
            const arrivalMethod = nextBlock.transportation?.arrivalMethod;

            const midLat = (currentMarker.coord.lat + nextMarker.coord.lat) / 2;
            const midLng = (currentMarker.coord.lng + nextMarker.coord.lng) / 2;

            return (
              <div key={`main-segment-${i}`}>
                <Polyline
                  positions={[
                    [currentMarker.coord.lat, currentMarker.coord.lng],
                    [midLat, midLng]
                  ]}
                  pathOptions={{ color: '#F57D50', weight: 4, opacity: 0.9 }}
                />

                {/* Transportation icon */}
                {arrivalMethod && (() => {
                  const L = leafletRef.current;
                  const transportIcon = getTransportationIcon(arrivalMethod);
                  const icon = L ? L.divIcon({
                    html: `<div class="rr-transport-icon">${transportIcon}</div>`,
                    className: '',
                    iconSize: [32, 32]
                  }) : undefined;

                  return (
                    <Marker position={[midLat, midLng]} {...(icon ? { icon } : {})}>
                      <Popup>
                        <div className="text-sm max-w-[200px]">
                          <strong className="block mb-1">Transportation</strong>
                          <div className="text-xs font-medium mt-1">
                            Method: {arrivalMethod.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })()}

                <Polyline
                  positions={[
                    [midLat, midLng],
                    [nextMarker.coord.lat, nextMarker.coord.lng]
                  ]}
                  pathOptions={{ color: '#F57D50', weight: 4, opacity: 0.9 }}
                />
              </div>
            );
          });
        })()}

        {/* Side Trip Connections (Dashed Lines) */}
        {markers.filter(m => (m.block as any).connectionType === 'side_trip').map((sideMarker, i) => {
          // Find the last FullDay before this sideMarker
          // We search backwards from sideMarker.idx
          // Note: markers are ordered by idx, so we can just look in the markers array
          const precedingFullDay = markers
            .slice(0, markers.indexOf(sideMarker))
            .reverse()
            .find(m => (m.block as any).blockType === 'fullDay');

          if (!precedingFullDay) return null;

          return (
            <Polyline
              key={`side-trip-${i}`}
              positions={[
                [precedingFullDay.coord.lat, precedingFullDay.coord.lng],
                [sideMarker.coord.lat, sideMarker.coord.lng]
              ]}
              pathOptions={{ color: '#F57D50', weight: 3, opacity: 0.8, dashArray: '10, 10' }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
