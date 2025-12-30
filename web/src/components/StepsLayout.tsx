"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';

const TripDetailMap = dynamic(() => import('@/components/TripDetailMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse flex items-center justify-center text-muted-foreground text-sm">Loading Map...</div>
});
import RichText from '@/components/RichText';
import { Trip, CmsFullDayBlock, CmsWaypointBlock, Media, Accommodation } from '@/types/payload';
import {
  Clock, ChevronLeft, ChevronRight, X, Bed,
  Car, Plane, Train, Bus, Ship, MapPinIcon, Footprints,
  ArrowLeft, Map as MapIcon, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
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
  accommodation?: string | { name?: string; notes?: Record<string, unknown>[] };
};

// Define StepBlock as a UNION of the two modified types
type FullDayStep = Omit<CmsFullDayBlock, 'transportation' | 'accommodation'> & StepFieldsOverride;
type WaypointStep = Omit<CmsWaypointBlock, 'transportation' | 'accommodation'> & StepFieldsOverride;

export type StepBlock = FullDayStep | WaypointStep;

interface StepsLayoutProps { trip: Trip }

interface GalleryItem {
  media?: Media | string | null;
  id?: string | null;
}

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

function GalleryCarousel({ items }: { items: GalleryItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; alt: string; index: number; gallery: Array<{ url: string; alt: string }> } | null>(null);

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

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightbox) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightbox(null);
      } else if (e.key === 'ArrowLeft' && lightbox.index > 0) {
        const prevIndex = lightbox.index - 1;
        const prevImage = lightbox.gallery[prevIndex];
        setLightbox({ ...lightbox, ...prevImage, index: prevIndex });
      } else if (e.key === 'ArrowRight' && lightbox.index < lightbox.gallery.length - 1) {
        const nextIndex = lightbox.index + 1;
        const nextImage = lightbox.gallery[nextIndex];
        setLightbox({ ...lightbox, ...nextImage, index: nextIndex });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

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
                onClick={(e) => {
                  e.stopPropagation(); // Prevent clicking image from activating the step card
                  const galleryImages = items.map((item, i) => {
                    const m: Media | null = typeof item.media === 'object' ? item.media : null;
                    return m ? { url: getImageUrl(m.url), alt: m.alt || `Photo ${i + 1}` } : null;
                  }).filter(Boolean) as Array<{ url: string; alt: string }>;

                  setLightbox({
                    url: getImageUrl(media.url),
                    alt,
                    index: idx,
                    gallery: galleryImages
                  });
                }}
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
            onClick={(e) => { e.stopPropagation(); scrollBy('left'); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); scrollBy('right'); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Lightbox - Using Portal to escape parent stacking contexts */}
      {lightbox && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setLightbox(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              type="button"
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20"
              onClick={() => setLightbox(null)}
            >
              <X size={24} />
            </button>

            {/* Previous image button */}
            {lightbox.index > 0 && (
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  const prevIndex = lightbox.index - 1;
                  const prevImage = lightbox.gallery[prevIndex];
                  setLightbox({ ...lightbox, ...prevImage, index: prevIndex });
                }}
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Next image button */}
            {lightbox.index < lightbox.gallery.length - 1 && (
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextIndex = lightbox.index + 1;
                  const nextImage = lightbox.gallery[nextIndex];
                  setLightbox({ ...lightbox, ...nextImage, index: nextIndex });
                }}
              >
                <ChevronRight size={32} />
              </button>
            )}

            {/* Image counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/50 rounded-full text-white text-sm z-20 backdrop-blur-sm">
              {lightbox.index + 1} / {lightbox.gallery.length}
            </div>

            {/* Main image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt={lightbox.alt}
              className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
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
  onClick,
  setSelectedAccommodation
}: {
  block: StepBlock;
  index: number;
  active: boolean;
  onClick: () => void;
  setSelectedAccommodation: (acc: Accommodation) => void;
}) {
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
            {block.accommodation && (
              <div className="flex items-center gap-1" title="Accommodation">
                <Bed size={14} />
                <span 
                  className="truncate max-w-[150px] sm:max-w-[200px] cursor-pointer hover:underline transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof block.accommodation === 'object' && block.accommodation) {
                      setSelectedAccommodation(block.accommodation as Accommodation);
                    }
                  }}
                >
                  {typeof block.accommodation === 'string'
                    ? block.accommodation
                    : (block.accommodation?.name || 'Accommodation')}
                </span>
              </div>
            )}

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

      <div className="flex flex-wrap gap-2">



      </div>


    </div>
  );
}

// --- Main Layout ---

export default function StepsLayout({ trip }: StepsLayoutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [showMap, setShowMap] = useState(true);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const isProgrammaticScroll = useRef(false);

  const handleStepClick = (index: number) => {
    setActiveIndex(index);
    isProgrammaticScroll.current = true;

    const element = document.querySelector(`[data-day-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 1000);
    }
  };

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    if (isProgrammaticScroll.current) return;

    // If activeIndex is already 0 and we are near top, keep it 0 to avoid jumping to 1
    // or if we are just simply near the top, force 0.
    if (window.scrollY < 100) {
      setActiveIndex(0);
      return;
    }

    const viewportCenter = window.innerHeight / 2;

    const closest = entries.reduce<{ idx: number; distance: number } | null>((acc, entry) => {
      if (!entry.isIntersecting) return acc;

      const rect = entry.target.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elementCenter - viewportCenter);

      const idx = Number((entry.target as HTMLElement).dataset.dayIndex);

      if (!Number.isFinite(idx)) return acc;

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
    <div className="steps-page min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Roaming Roads Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
            >
              <div className="w-6 h-6 flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg width="24" height="24" viewBox="0 0 579 521" className="w-6 h-6">
                  <path fill="#F47626" d="M108.075 96.6192C115.974 87.9534 123.274 79.8919 132.1 72.0797C172.308 36.5263 223.552 15.9324 277.183 13.7741C335.842 11.0093 399.496 32.2106 443.016 72.0095C451.97 80.1985 459.462 88.3167 467.303 97.5713C481.783 112.509 492.198 133.189 501.241 151.744C502.778 154.896 503.935 158.322 505.4 161.327C504.244 162.121 502.82 163.161 501.656 163.886C484.289 175.9 459.69 185.052 439.295 190.425C395.672 201.73 349.643 199.521 307.303 184.089C286.618 176.57 269.694 168.173 248.189 161.937C207.533 150.294 164.469 149.971 123.643 161.003C98.4094 167.971 79.1274 179.411 58.3923 194.882C59.5204 191.959 60.7079 187.608 61.6538 184.53C63.3785 178.814 65.2432 173.141 67.2465 167.516C74.3151 147.999 83.8524 129.468 95.6261 112.373C99.619 106.548 103.054 101.608 108.075 96.6192Z" />
                  <path fill="url(#gradient_0)" d="M68.8246 336.919C68.437 336.054 67.8729 335.151 68.0907 334.29C69.9127 332.819 81.6823 326.815 84.1418 325.525C121.868 306.055 164.508 298.173 206.702 302.87C222.267 304.52 237.502 307.702 252.398 312.526C276.038 320.18 298.389 331.104 322.366 337.828C363.24 349.289 402.789 348.925 443.913 339.306C449.832 337.459 456.135 335.694 461.945 333.634C474.196 329.295 485.96 323.686 497.045 316.9C503.441 313.041 511.301 306.881 517.025 303.701L516.858 304.04C515.399 307.046 513.502 313.575 512.404 317.03C510.707 322.522 508.805 327.948 506.702 333.298C498.354 354.571 487.113 374.591 473.296 392.794C471.763 394.809 467.282 400.547 465.356 401.789C456.667 411.564 449.066 419.578 438.965 428.184C400.959 460.55 353.553 479.841 303.745 483.21C240.386 487.52 177.96 466.143 130.546 423.901C123.753 417.763 117.236 411.326 111.014 404.61C108.209 402.567 103.226 395.968 101.018 393.029C87.9502 375.639 76.8481 357.191 68.8246 336.919Z" />
                  <defs>
                    <linearGradient id="gradient_0" gradientUnits="userSpaceOnUse" x1="112.27674" y1="406.53159" x2="456.16324" y2="455.32516">
                      <stop offset="0" stopColor="#603B81" />
                      <stop offset="1" stopColor="#344BA0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="font-heading font-bold text-sm text-muted-foreground group-hover:text-primary transition-colors">
                Roaming Roads
              </span>
            </Link>

            {/* Trip title and Detailed Itinerary */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-muted-foreground"></span>
              <span className="text-sm font-medium text-foreground/80 truncate max-w-xs">
                {trip.title}
              </span>
              <span className="text-xs text-muted-foreground">-</span>
              <span className="text-xs font-medium text-muted-foreground/70 tracking-wide">
                Detailed Itinerary
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Map Toggle */}
            <button
              onClick={() => setShowMap(!showMap)}
              className={`
                hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border
                ${showMap
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
                }
              `}
            >
              <MapIcon size={16} />
              <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
            </button>

            {/* Back button */}
            <Link
              href={`/trips/${trip.slug}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-card transition-all duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Trip Overview</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative">

        {/* Scrollable Itinerary - Left/Top */}
        <div className={`
          px-4 sm:px-6 py-10 order-2 lg:order-1 min-h-[100vh]
          transition-all duration-500 ease-in-out
          ${showMap ? 'w-full lg:w-[55%]' : 'w-full max-w-5xl mx-auto'}
        `}>
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-heading font-bold mb-8 text-[#4C3A7A]">
              Detailed Itinerary
            </h2>

            {trip.itinerary.map((block, index) => {
              const step = block as unknown as StepBlock;
              return (
                <React.Fragment key={block.id || index}>
                  <ItineraryBlock
                    block={step}
                    index={index}
                    active={activeIndex === index}
                    onClick={() => handleStepClick(index)}                    setSelectedAccommodation={setSelectedAccommodation}                  />

                  {index < (trip.itinerary!.length - 1) && (
                    <Connector
                      prevBlock={step}
                      nextBlock={trip.itinerary![index + 1] as unknown as StepBlock}
                    />
                  )}
                </React.Fragment>
              );
            })}

            <div className="flex flex-col items-center pt-8 text-muted-foreground">
              <div className="w-3 h-3 bg-primary rounded-full mb-2" />
              <span className="text-xs uppercase tracking-widest font-semibold">End of Trip</span>
            </div>
          </div>
        </div>

        {/* Fixed Map - Right/Bottom */}
        <div className={`
            hidden lg:block h-[calc(100vh-3.5rem)] sticky top-14 border-l border-border bg-card z-10 order-1 lg:order-2 overflow-hidden
            transition-all duration-500 ease-in-out
            ${showMap ? 'lg:w-[45%] opacity-100' : 'lg:w-0 opacity-0'}
            ${!showMap && 'pointer-events-none'}
        `}>
          <div className="h-full w-full">
            <TripDetailMap
              trip={trip}
              heightClass="h-full"
              activeIndex={activeIndex}
            />
          </div>
        </div>
      </div>

      {/* Accommodation Modal */}
      {selectedAccommodation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAccommodation(null)}>
          <div 
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
              onClick={() => setSelectedAccommodation(null)}
              aria-label="Close"
            >
              <X size={24} className="text-gray-700" />
            </button>

            {/* Header Image */}
            {selectedAccommodation.media && selectedAccommodation.media.length > 0 && (() => {
              const coverPhoto = selectedAccommodation.media[0];
              const url = typeof coverPhoto === 'object' ? getImageUrl(coverPhoto.url) : getImageUrl(coverPhoto);
              if (!url) return null;
              return (
                <div className="relative h-64 w-full bg-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={selectedAccommodation.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })()}

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Title and Type */}
              <div>
                <h2 className="text-3xl font-heading font-bold text-[#4C3A7A] mb-2">
                  {selectedAccommodation.name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#2A9D8F]/10 text-[#2A9D8F] border border-[#2A9D8F]/20">
                    {selectedAccommodation.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {selectedAccommodation.country && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {typeof selectedAccommodation.country === 'string' 
                        ? selectedAccommodation.country 
                        : selectedAccommodation.country.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedAccommodation.description && (
                <div className="prose prose-lg max-w-none">
                  <RichText content={selectedAccommodation.description} />
                </div>
              )}

              {/* Website */}
              {selectedAccommodation.website && (
                <div className="pt-4 border-t border-gray-200">
                  <a
                    href={selectedAccommodation.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#2A9D8F] hover:text-[#1f7a6f] font-medium transition-colors"
                  >
                    Visit Website
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}

              {/* Additional Photos */}
              {selectedAccommodation.media && selectedAccommodation.media.length > 1 && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">More Photos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedAccommodation.media.slice(1).map((photo, idx) => {
                      const url = typeof photo === 'object' ? getImageUrl(photo.url) : getImageUrl(photo);
                      if (!url) return null;
                      return (
                        <div key={idx} className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`${selectedAccommodation.name} - Photo ${idx + 2}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}