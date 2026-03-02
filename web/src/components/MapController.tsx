"use client";

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { CmsFullDayBlock, CmsWaypointBlock, CmsPointBlock } from '@/types/payload';

interface MapControllerProps {
  activeIndex: number | null | undefined;
  markers: Array<{
    idx: number;
    coord: { lat: number; lng: number };
    block: CmsFullDayBlock | CmsWaypointBlock | CmsPointBlock;
  }>;
  interactive?: boolean; // when false: lock interactions and fit all markers; when true: enable interactions
}

/**
 * MapController component handles map interaction state and focus.
 * Must be rendered as a child of MapContainer to access the map instance via useMap().
 */
export default function MapController({ activeIndex, markers, interactive = true }: MapControllerProps) {
  const map = useMap();
  const lastPanRef = useRef<number | null>(null);

  // Enable or disable map interactions based on the interactive prop.
  // Also invalidates size so Leaflet re-renders tiles when the container resizes
  // (e.g. split 45% → fullmap fixed fullscreen, or hidden → visible on mobile).
  useEffect(() => {
    if (!map) return;

    // Tell Leaflet the container may have changed size
    try { map.invalidateSize(); } catch (_) { /* ignore */ }

    if (!interactive) {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoom.disable();
      // Fit after a short delay so the container dimensions are finalised
      if (markers.length > 0) {
        const latlngs = markers.map(m => [m.coord.lat, m.coord.lng] as [number, number]);
        const timer = setTimeout(() => {
          try {
            map.invalidateSize();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (map as any).fitBounds(latlngs, { padding: [30, 30] });
          } catch (e) {
            console.warn('[MapController] fitBounds failed', e);
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.touchZoom.enable();
      // After the fixed container settles: invalidate size then fit all markers so tiles
      // load at the same zoom that works in split view (avoids 404s from high-zoom tiles)
      const latlngs = markers.map(m => [m.coord.lat, m.coord.lng] as [number, number]);
      const timer = setTimeout(() => {
        try {
          map.invalidateSize();
          if (latlngs.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (map as any).fitBounds(latlngs, { padding: [50, 50] });
          }
        } catch (_) { /* ignore */ }
      }, 150);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, map]);

  // Auto-pan to active marker only when interactive (fullmap view has no cards, so this mainly fires in split → disabled there anyway)
  useEffect(() => {
    if (!interactive) return;
    if (activeIndex === null || activeIndex === undefined) return;
    if (!map) return;

    const target = markers.find(m => m.idx === activeIndex);
    if (!target) return;

    const now = Date.now();
    // Throttle to avoid excessive panning during fast scroll (100ms)
    if (lastPanRef.current && (now - lastPanRef.current) < 100) return;
    lastPanRef.current = now;

    try {
      const focusZoom = 10;
      if (map.flyTo) {
        map.flyTo([target.coord.lat, target.coord.lng], focusZoom, { duration: 0.8 });
      } else if (map.setView) {
        map.setView([target.coord.lat, target.coord.lng], focusZoom);
      }
    } catch (e) {
      console.warn('[MapController] pan failed', e);
    }
  }, [activeIndex, markers, map, interactive]);

  return null;
}
