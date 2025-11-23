"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import TripDetailMap from '@/components/TripDetailMap';
import RichText from '@/components/RichText';
import { Trip, CmsFullDayBlock, CmsWaypointBlock, Media } from '@/types/payload';
import { 
  Clock, MapPin, Euro, ChevronLeft, ChevronRight, X, Bed, 
  Car, Plane, Train, Bus, Ship, MapPinIcon, Footprints 
} from 'lucide-react';
import { getImageUrl } from '@/lib/images';

// --- Types ---

interface TransportationData {
  departureMethod?: string;
  arrivalMethod?: string;
  travelTime?: {
    value?: number;
    unit?: string;
  };
}

// Override specific fields for better typing in this component
type StepFieldsOverride = {
  transportation?: TransportationData;
  accommodation?: string | { name?: string; notes?: any };
};

// Define StepBlock as a UNION of the two modified types
// This allows TS to narrow types based on blockType
type FullDayStep = Omit<CmsFullDayBlock, 'transportation' | 'accommodation'> & StepFieldsOverride;
type WaypointStep = Omit<CmsWaypointBlock, 'transportation' | 'accommodation'> & StepFieldsOverride;

export type StepBlock = FullDayStep | WaypointStep;

interface StepsLayoutProps { trip: Trip }

// --- Helpers ---

function getTransportationIcon(method: string) {
  const normalizedMethod = method.toLowerCase().replace(/[_\s-]/g, '_');
  
  const iconMap: Record<string, React.ElementType> = {
    'rental_car': Car, 'taxi': Car, 'private_car': Car, 'car': Car,
    'flight': Plane, 'plane': Plane, 'airplane': Plane,
    'train': Train, 'rail': Train,
    'bus': Bus, 'shuttle': Bus,
    'boat': Ship, 'ship': Ship, 'ferry': Ship,
    'walking': Footprints, 'walk': Footprints, 'hike': Footprints,
  };
  
  return iconMap[normalizedMethod] || MapPinIcon;
}

function buildConnectorLabel(prev: StepBlock | null, current: StepBlock) {
  if (!prev) return null;
  
  const prevTransport = prev.transportation;
  const currentTransport = current.transportation;
  
  // Logic: Prefer arrival method of current, then departure of prev
  const method = currentTransport?.arrivalMethod || prevTransport?.departureMethod;
  
  if (!method) return null;
  
  const timeInfo = currentTransport?.travelTime || prevTransport?.travelTime;
  const travelTime = timeInfo?.value ? `${timeInfo.value} ${timeInfo.unit || ''}`.trim() : '';
  
  const displayMethod = method.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  
  return {
    method: displayMethod,
    time: travelTime,
    Icon: getTransportationIcon(method)
  };
}

// --- Sub-Components ---

function GalleryCarousel({ items }: { items: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; alt: string } | null>(null);

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const delta = el.clientWidth * 0.8 * (dir === 'left' ? -1 : 1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (!items || items.length === 0) return null;

  return (
    <>
      <div className="mb-4 relative group">
        <div 
          ref={containerRef} 
          className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, idx) => {
            const media: Media | null = typeof item.media === 'object' ? item.media : null;
            if (!media) return null;
            const alt = media.alt || `Photo ${idx + 1}`;
            
            return (
              <button 
                key={idx} 
                type="button" 
                onClick={() => setLightbox({ url: getImageUrl(media.url), alt })} 
                className="flex-shrink-0 w-40 h-32 rounded-lg overflow-hidden snap-start relative focus:outline-none focus:ring-2 focus:ring-[#F57D50] transition-transform active:scale-95"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getImageUrl(media.url)} alt={alt} className="w-full h-full object-cover" loading="lazy" />
              </button>
            );
          })}
        </div>
        
        {/* Scroll Controls */}
        {canScrollLeft && (
          <button 
            type="button" 
            onClick={() => scrollBy('left')} 
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {canScrollRight && (
          <button 
            type="button" 
            onClick={() => scrollBy('right')} 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <button 
              type="button" 
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X size={24} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={lightbox.url} 
              alt={lightbox.alt} 
              className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl" 
            />
          </div>
        </div>
      )}
    </>
  );
}

function Connector({ prevBlock, nextBlock }: { prevBlock: StepBlock; nextBlock: StepBlock }) {
  const transportInfo = buildConnectorLabel(prevBlock, nextBlock);
  
  return (
    <div className="flex flex-col items-center my-6 group" aria-hidden="true">
      <div className="relative w-full flex items-center justify-center">
        {/* Dotted line background */}
        <div className="absolute h-full w-[2px] bg-border group-hover:bg-primary/30 transition-colors" />
        
        {/* Transport Pill */}
        {transportInfo ? (
          <div className="relative z-10 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full bg-background border border-border text-muted-foreground shadow-sm flex items-center gap-2 group-hover:border-primary/50 group-hover:text-primary transition-colors">
            <transportInfo.Icon size={12} />
            <span>{transportInfo.method}</span>
            {transportInfo.time && (
              <>
                <span className="text-border">•</span>
                <span>{transportInfo.time}</span>
              </>
            )}
          </div>
        ) : (
          // Simple dot if no transport info
          <div className="relative z-10 w-2 h-2 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />
        )}
      </div>
    </div>
  );
}

function ItineraryBlock({ 
  block, 
  index, 
  active, 
  onClick 
}: { 
  block: StepBlock; 
  index: number; 
  active: boolean; 
  onClick: () => void 
}) {
  const isFullDay = block.blockType === 'fullDay';

  return (
    <div
      id={`day-${index + 1}`}
      data-day-index={index}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        relative rounded-xl p-6 transition-all duration-300 cursor-pointer outline-none
        ${active 
          ? 'bg-card shadow-lg ring-2 ring-[#F57D50] scale-[1.01]' 
          : 'bg-card shadow-sm border border-border hover:shadow-md hover:border-primary/30'
        }
      `}
    >
      <div className="flex items-start gap-4 mb-4">
        {/* Number Badge */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center font-heading text-sm font-bold text-white flex-shrink-0 shadow-md transition-transform"
          style={{ backgroundColor: active ? '#F57D50' : '#F57D50cc' }}
        >
          {index + 1}
        </div>
        
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-xl font-heading font-bold mb-1 truncate text-[#4C3A7A]">
            {block.locationName}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#2A9D8F] font-medium">
            {block.regionProvince && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{block.regionProvince}</span>
              </div>
            )}
            {/* Automatic Type Narrowing via blockType check */}
            {block.blockType === 'fullDay' && block.time && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{block.time}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {block.description && (
        <p className="mb-6 text-sm leading-relaxed text-foreground/80">
          {block.description}
        </p>
      )}

      {block.gallery && block.gallery.length > 0 && (
        <GalleryCarousel items={block.gallery.slice(0, 20)} />
      )}

      {block.activities && (
        <div className="mb-5">
          <h4 className="text-xs font-heading font-bold mb-2 uppercase tracking-wide text-[#2A9D8F]">
            Activities
          </h4>
          <div className="text-xs prose prose-sm max-w-none prose-p:my-1 prose-headings:text-foreground/90 text-foreground/70">
            <RichText content={block.activities} />
          </div>
        </div>
      )}

      {block.accommodation && (
        <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-border">
          <div className="flex items-start gap-3">
            <Bed size={16} className="flex-shrink-0 mt-0.5 text-[#4C3A7A]" />
            <div className="text-xs flex-1 text-foreground/80">
              {typeof block.accommodation === 'string' ? (
                <div>{block.accommodation}</div>
              ) : (
                <div>
                  {block.accommodation?.name && (
                    <div className="font-heading font-semibold text-[#4C3A7A] mb-0.5">
                      {block.accommodation.name}
                    </div>
                  )}
                  {block.accommodation?.notes && (
                    <div className="italic text-muted-foreground">
                      <RichText content={block.accommodation.notes} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {block.blockType === 'fullDay' && block.budget && (
          <div className="px-3 py-1.5 rounded-full bg-[#F4F1ED] dark:bg-stone-900 flex items-center gap-1.5 text-xs text-[#4C3A7A] font-medium">
            <Euro size={12} />
            <span>
              {block.budget?.amount} {block.budget?.currency}
            </span>
          </div>
        )}
        
        {block.blockType === 'fullDay' && block.tips && (
          <div className="px-3 py-1.5 rounded-full bg-[#2A9D8F]/10 dark:bg-[#2A9D8F]/20 text-[#2A9D8F] text-xs font-medium">
             Pro Tip Available
          </div>
        )}
      </div>

      {block.blockType === 'fullDay' && block.tips && active && (
        <div className="mt-4 p-4 rounded-lg bg-[#2A9D8F] text-white text-sm shadow-md animate-in slide-in-from-top-2 duration-300">
          <h4 className="font-heading font-bold mb-1 flex items-center gap-2">
             Inside Scoop
          </h4>
          <p className="text-white/90">{block.tips}</p>
        </div>
      )}
    </div>
  );
}

// --- Main Layout ---

export default function StepsLayout({ trip }: StepsLayoutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const isProgrammaticScroll = useRef(false);

  const handleStepClick = (index: number) => {
    setActiveIndex(index);
    isProgrammaticScroll.current = true;
    
    const element = document.querySelector(`[data-day-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Reset the lock after scrolling is likely finished (approximate)
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 1000);
    }
  };

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    if (isProgrammaticScroll.current) return;

    const viewportCenter = window.innerHeight / 2;

    // Use reduce to find the closest element safely
    // This avoids "type 'never'" errors by explicitly typing the accumulator in the generic
    const closest = entries.reduce<{ idx: number; distance: number } | null>((acc, entry) => {
      if (!entry.isIntersecting) return acc;
      
      const rect = entry.target.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elementCenter - viewportCenter);
      
      const idx = Number((entry.target as HTMLElement).dataset.dayIndex);
      
      if (!Number.isFinite(idx)) return acc;

      // If no closest found yet, or this one is closer, update accumulator
      if (!acc || distance < acc.distance) {
        return { idx, distance };
      }
      return acc;
    }, null);

    if (closest) {
      setActiveIndex(closest.idx);
    }
  }, []);

  useEffect(() => {
    const blocks = document.querySelectorAll('[data-day-index]');
    if (blocks.length === 0) return;

    const observer = new IntersectionObserver(observerCallback, { 
      root: null, 
      rootMargin: '-30% 0px -30% 0px', 
      threshold: [0, 0.5, 1.0] 
    });
    
    blocks.forEach(b => observer.observe(b));
    return () => observer.disconnect();
  }, [observerCallback, trip.itinerary]); 

  if (!trip.itinerary || trip.itinerary.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No itinerary steps found.</div>;
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      
      {/* Scrollable Itinerary - Left/Top */}
      <div className="w-full lg:w-[55%] px-4 sm:px-6 py-10 order-2 lg:order-1 min-h-[100vh]">
        <div className="max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-heading font-bold mb-8 text-[#4C3A7A]">
            Detailed Itinerary
          </h2>
          
          {trip.itinerary.map((block, index) => {
            // Force cast to our enhanced Type Union.
            // This is safe because we are only reading properties that exist, 
            // but we need to tell TS that 'transportation' matches our structure.
            const step = block as unknown as StepBlock;
            
            return (
              <React.Fragment key={block.id || index}>
                <ItineraryBlock 
                  block={step} 
                  index={index} 
                  active={activeIndex === index} 
                  onClick={() => handleStepClick(index)}
                />
                
                {index < (trip.itinerary!.length - 1) && (
                  <Connector 
                    prevBlock={step} 
                    nextBlock={trip.itinerary![index + 1] as unknown as StepBlock} 
                  />
                )}
              </React.Fragment>
            );
          })}
          
          {/* End of trip marker */}
          <div className="flex flex-col items-center pt-8 text-muted-foreground">
            <div className="w-3 h-3 bg-primary rounded-full mb-2" />
            <span className="text-xs uppercase tracking-widest font-semibold">End of Trip</span>
          </div>
        </div>
      </div>

      {/* Fixed Map - Right/Bottom */}
      <div className="hidden lg:block lg:w-[45%] h-[calc(100vh-4rem)] sticky top-16 border-l border-border bg-card z-10 order-1 lg:order-2 overflow-hidden">
        <div className="h-full w-full">
          <TripDetailMap 
            trip={trip} 
            heightClass="h-full" 
            activeIndex={activeIndex} 
          />
        </div>
      </div>

    </div>
  );
}