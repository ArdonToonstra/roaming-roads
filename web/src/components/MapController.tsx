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
  // Note: MapContainer is keyed on interactive, so this always runs on a fresh map instance.
  useEffect(() => {
    if (!map) return;
    if (!interactive) {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoom.disable();
    } else {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.touchZoom.enable();
    }
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
