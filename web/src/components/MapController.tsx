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
}

/**
 * MapController component handles map focus changes based on activeIndex.
 * Must be rendered as a child of MapContainer to access the map instance via useMap().
 */
export default function MapController({ activeIndex, markers }: MapControllerProps) {
  const map = useMap();
  const lastPanRef = useRef<number | null>(null);

  // Pan map when activeIndex changes (scroll-driven or click-driven focus) with simple throttle
  useEffect(() => {
    if (activeIndex === null || activeIndex === undefined) return;
    if (!map) return;
    
    const target = markers.find(m => m.idx === activeIndex);
    if (!target) return;
    
    const now = Date.now();
    // Throttle to avoid excessive panning during fast scroll (100ms)
    if (lastPanRef.current && (now - lastPanRef.current) < 100) return;
    lastPanRef.current = now;
    
    try {
      // Focus on the active marker with a reasonable zoom level
      const focusZoom = 10; // Fixed zoom level for focusing on individual markers (zoomed out more)
      
      if (map.flyTo) {
        map.flyTo([target.coord.lat, target.coord.lng], focusZoom, { duration: 0.8 });
      } else if (map.setView) {
        map.setView([target.coord.lat, target.coord.lng], focusZoom);
      }
    } catch (e) {
      console.warn('[MapController] pan failed', e);
    }
  }, [activeIndex, markers, map]);

  return null; // This component doesn't render anything
}
