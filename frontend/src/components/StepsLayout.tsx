"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import TripDetailMap from '@/components/TripDetailMap';
import RichText from '@/components/RichText';
import { Trip, CmsFullDayBlock, CmsWaypointBlock, Media } from '@/types/payload';
import { MapPin, Clock, Navigation, EuroIcon, ChevronLeft, ChevronRight, X, Bed, Car, Plane, Train, Bus, Ship, MapPinIcon } from 'lucide-react';
import { getImageUrl } from '@/lib/images';

interface StepsLayoutProps { trip: Trip }

function getTransportationIcon(method: string) {
  const iconMap: { [key: string]: any } = {
    'rental_car': Car,
    'taxi': Car,
    'private_car': Car,
    'car': Car,
    'flight': Plane,
    'plane': Plane,
    'airplane': Plane,
    'train': Train,
    'bus': Bus,
    'boat': Ship,
    'ship': Ship,
    'ferry': Ship,
    'walking': MapPinIcon,
    'walk': MapPinIcon,
  };
  
  const normalizedMethod = method.toLowerCase().replace(/[_\s-]/g, '_');
  return iconMap[normalizedMethod] || Car; // Default to car icon
}

function buildConnectorLabel(prev: CmsFullDayBlock | CmsWaypointBlock | null, current: CmsFullDayBlock | CmsWaypointBlock): { method: string; time: string; icon: any } | null {
  if (!prev) return null;
  
  // Check both the previous block and current block for transportation info
  const prevTransport: any = (prev as any).transportation;
  const currentTransport: any = (current as any).transportation;
  
  // Try to get transportation method (prefer departure from current, then arrival to current)
  let method = currentTransport?.arrivalMethod || prevTransport?.departureMethod || currentTransport?.departureMethod;
  
  if (!method) return null;
  
  // Get travel time from either block
  const timeInfo = currentTransport?.travelTime || prevTransport?.travelTime;
  const travelTime = timeInfo?.value ? `${timeInfo.value} ${timeInfo.unit || ''}`.trim() : '';
  
  // Clean up method name for display
  const displayMethod = method.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  
  return {
    method: displayMethod,
    time: travelTime,
    icon: getTransportationIcon(method)
  };
}



function GalleryCarousel({ items }: { items: any[] }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; alt: string } | null>(null);

  const updateScrollState = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = containerRef.current;
    if (!el) return;
    const handler = () => updateScrollState();
    el.addEventListener('scroll', handler);
    window.addEventListener('resize', handler);
    return () => {
      el.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, []);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const delta = el.clientWidth * 0.8 * (dir === 'left' ? -1 : 1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className="mb-4 relative group">
      <div ref={containerRef} className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2" style={{ scrollbarWidth: 'none' }}>
        {items.map((item, idx) => {
          const media: Media | null = typeof (item as any).media === 'object' ? (item as any).media : null;
          if (!media) return null;
          const alt = media.alt || `Photo ${idx + 1}`;
          return (
            <button key={idx} type="button" onClick={() => setLightbox({ url: getImageUrl(media.url), alt })} className="flex-shrink-0 w-40 h-32 rounded overflow-hidden snap-start relative focus:outline-none focus:ring-2 focus:ring-primary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getImageUrl(media.url)} alt={alt} className="w-full h-full object-cover" />
            </button>
          );
        })}
      </div>
      {canScrollLeft && (
        <button type="button" onClick={() => scrollBy('left')} aria-label="Scroll photos left" className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={18} /></button>
      )}
      {canScrollRight && (
        <button type="button" onClick={() => scrollBy('right')} aria-label="Scroll photos right" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={18} /></button>
      )}
      {lightbox && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-3xl w-full">
            <button type="button" aria-label="Close image" className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white" onClick={() => setLightbox(null)}><X size={20} /></button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.url} alt={lightbox.alt} className="w-full max-h-[80vh] object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
}

function ItineraryBlock({ block, index, active, onClick }: { block: CmsFullDayBlock | CmsWaypointBlock; index: number; active: boolean; onClick?: () => void }) {
  const isFullDay = block.blockType === 'fullDay';
  const rawCoords: any = (block as any).location?.coordinates;
  const hasCoords = Array.isArray(rawCoords) && rawCoords.length >= 2 && typeof rawCoords[0] === 'number' && typeof rawCoords[1] === 'number';
  const coordsText = hasCoords ? `${rawCoords[1].toFixed(4)}, ${rawCoords[0].toFixed(4)}` : null;

  return (
    <div
      id={`day-${index + 1}`}
      data-day-index={index}
      onClick={onClick}
      className={`rounded-xl p-6 transition-all duration-300 cursor-pointer ${active ? 'bg-card shadow-md border-2' : 'bg-card hover:shadow-md border border-border hover:border-gray-300'}`}
      style={active ? { borderColor: '#F57D50' } : undefined}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-heading text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: '#F57D50' }}>{index + 1}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-heading font-bold mb-1 truncate" style={{ color: '#4C3A7A' }}>{block.locationName}</h3>
          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: '#2A9D8F' }}>
            {block.regionProvince && <div className="flex items-center gap-1"><MapPin size={14} /><span>{block.regionProvince}</span></div>}
            {isFullDay && (block as CmsFullDayBlock).time && <div className="flex items-center gap-1"><Clock size={14} /><span>{(block as CmsFullDayBlock).time}</span></div>}
          </div>
        </div>
      </div>
      {block.description && <p className="mb-4 text-sm leading-relaxed" style={{ color: '#263238' }}>{block.description}</p>}
  {block.gallery && block.gallery.length > 0 && <GalleryCarousel items={block.gallery.slice(0, 20)} />}
      {block.activities && (
        <div className="mb-4">
          <h4 className="text-xs font-heading font-bold mb-2" style={{ color: '#2A9D8F' }}>Activities</h4>
          <RichText content={block.activities} className="text-xs prose max-w-none" />
        </div>
      )}
      {(block as any).accommodation && (
        <div className="mb-4 p-3 rounded-md bg-gray-50 border border-gray-200">
          <div className="flex items-start gap-2">
            <Bed size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#4C3A7A' }} />
            <div className="text-xs flex-1" style={{ color: '#263238' }}>
              {typeof (block as any).accommodation === 'string' ? (
                <div>{(block as any).accommodation}</div>
              ) : (
                <div>
                  {(block as any).accommodation?.name && <div className="font-heading font-semibold">{(block as any).accommodation.name}</div>}
                  {(block as any).accommodation?.notes && <RichText content={(block as any).accommodation.notes} className="text-[11px] italic mt-1" />}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {isFullDay && (block as CmsFullDayBlock).budget && (
        <div className="mb-3 p-3 rounded-md" style={{ backgroundColor: '#F4F1ED' }}>
          <h4 className="text-xs font-heading font-bold mb-1" style={{ color: '#4C3A7A' }}>Cost</h4>
          <div className="flex items-center gap-1 text-xs" style={{ color: '#263238' }}><EuroIcon size={12} /><span>{(block as CmsFullDayBlock).budget?.amount} {(block as CmsFullDayBlock).budget?.currency}</span></div>
        </div>
      )}
      {isFullDay && (block as CmsFullDayBlock).tips && (
        <div className="p-3 rounded-md text-[11px]" style={{ backgroundColor: '#2A9D8F', color: 'white' }}>
          <h4 className="font-heading font-bold mb-1">Pro Tips</h4>
          <p>{(block as CmsFullDayBlock).tips}</p>
        </div>
      )}
    </div>
  );
}

export default function StepsLayout({ trip }: StepsLayoutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const handleStepClick = (index: number) => {
    setActiveIndex(index);
    // Scroll the clicked step into view
    const element = document.querySelector(`[data-day-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    // Determine the element whose vertical center is closest to the viewport vertical center
    const viewportCenter = window.innerHeight / 2;
    let closest: { idx: number; distance: number } | null = null;
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elementCenter - viewportCenter);
      const idx = Number((e.target as HTMLElement).dataset.dayIndex);
      if (!Number.isFinite(idx)) return;
      if (!closest || distance < closest.distance) closest = { idx, distance };
    });
    if (closest !== null) setActiveIndex((closest as { idx: number; distance: number }).idx);
  }, []);

  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll('[data-day-index]')) as HTMLElement[];
    if (blocks.length === 0) return;
    // Adjust thresholds to capture earlier focus change
    const observer = new IntersectionObserver(observerCallback, { root: null, rootMargin: '-20% 0px -50% 0px', threshold: [0.1, 0.25, 0.5] });
    blocks.forEach(b => observer.observe(b));
    return () => observer.disconnect();
  }, [observerCallback, trip.itinerary?.length]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Fixed map on large screens (right side, below nav) */}
      <div className="hidden lg:block fixed top-16 right-0 h-[calc(100vh-4rem)] w-[45%] border-l border-border bg-card z-10 overflow-y-auto custom-map-scroll">
        <TripDetailMap trip={trip} heightClass="h-full" activeIndex={activeIndex} />
      </div>
      {/* Scrollable itinerary (reserve space for map on right) */}
      <div className="lg:w-[55%] px-4 sm:px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-heading font-bold mb-6 text-[#4C3A7A]">Steps Itinerary</h2>
          {trip.itinerary?.map((block, index) => (
            <React.Fragment key={(block as any).id || index}>
              <ItineraryBlock 
                block={block} 
                index={index} 
                active={activeIndex === index} 
                onClick={() => handleStepClick(index)}
              />
              {index < (trip.itinerary!.length - 1) && (
                <Connector prevBlock={block} nextBlock={trip.itinerary![index + 1]} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function Connector({ prevBlock, nextBlock }: { prevBlock: CmsFullDayBlock | CmsWaypointBlock; nextBlock: CmsFullDayBlock | CmsWaypointBlock }) {
  const transportInfo = buildConnectorLabel(prevBlock, nextBlock);
  return (
    <div className="flex flex-col items-center my-6">
      
      <div className="relative w-full flex items-center">
        <div className="mx-auto h-6 w-[2px] bg-border" />
        {transportInfo && (
          <div className="absolute left-1/2 -translate-x-1/2 top-0 text-[11px] px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm">
            <div className="flex items-center justify-center gap-1.5">
              <transportInfo.icon size={12} />
              <span>{transportInfo.method}</span>
              {transportInfo.time && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{transportInfo.time}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
