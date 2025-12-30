"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from 'react';
import TripDetailMap from '@/components/TripDetailMap';
import RichText from '@/components/RichText';
import { Trip, CmsFullDayBlock, CmsWaypointBlock, CmsPointBlock, Media } from '@/types/payload';
import { Clock, Navigation, DollarSign } from 'lucide-react';
import { getImageUrl } from '@/lib/images';



function ItineraryBlock({ block, index, displayNumber }: { block: CmsFullDayBlock | CmsWaypointBlock; index: number; displayNumber: number }) {
  const isFullDay = block.blockType === 'fullDay';
  const blockData = block as any;
  const rawCoords = blockData.location?.coordinates;
  const hasCoords = Array.isArray(rawCoords) && rawCoords.length >= 2 && typeof rawCoords[0] === 'number' && typeof rawCoords[1] === 'number';
  const coordsText = hasCoords ? `${rawCoords[1].toFixed(4)}, ${rawCoords[0].toFixed(4)}` : null;

  return (
    <div id={`day-${index + 1}`} data-day-index={index} className={`bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 ${block.blockType === 'waypoint' && (block as any).connectionType === 'side_trip' ? 'ml-8 border-l-4 border-dashed border-gray-300' : ''}`}>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-white flex-shrink-0" style={{ backgroundColor: '#F57D50' }}>{displayNumber}</div>
        <div className="flex-1">
          <h3 className="text-2xl font-heading font-bold mb-2" style={{ color: '#4C3A7A' }}>{block.locationName}</h3>
          <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: '#2A9D8F' }}>
            {isFullDay && (block as CmsFullDayBlock).time && <div className="flex items-center gap-1"><Clock size={16} /><span>{(block as CmsFullDayBlock).time}</span></div>}
            {coordsText ? <div className="flex items-center gap-1"><Navigation size={16} /><span>{coordsText}</span></div> : <div className="flex items-center gap-1 opacity-70 text-sm"><Navigation size={16} /><span>Location unknown</span></div>}
          </div>
          {/* Transportation Summary */}
          {(block as any).transportation && (
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
              {(block as any).transportation.arrivalMethod && (
                <span className="bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1">
                  Arrived via <span className="font-semibold uppercase">{(block as any).transportation.arrivalMethod.replace(/_/g, ' ')}</span>
                </span>
              )}
              {(block as any).transportation.travelTime?.value && (
                <span className="bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1">
                  Duration: <span className="font-semibold">{(block as any).transportation.travelTime.value} {(block as any).transportation.travelTime.unit}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {block.description && <p className="mb-6 text-lg leading-relaxed" style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>{block.description}</p>}

      {/* Activities (rich text) */}
      {block.activities && (
        <div className="mb-6">
          <h4 className="text-lg font-heading font-bold mb-3" style={{ color: '#2A9D8F' }}>Activities</h4>
          <RichText content={block.activities} className="prose max-w-none" style={{ fontFamily: 'Lato, sans-serif' }} />
        </div>
      )}

      {/* Accommodation block (if present) */}
      {/* accommodation may be a string or object from CMS */}
      {(block as unknown as any).accommodation && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F4F1ED' }}>
          <h4 className="text-sm font-heading font-bold mb-2" style={{ color: '#4C3A7A' }}>Accommodation</h4>
          <div style={{ color: '#263238' }}>
            {typeof (block as unknown as any).accommodation === 'string' ? (
              <div style={{ fontFamily: 'Lato, sans-serif' }}>{(block as unknown as any).accommodation}</div>
            ) : (
              <div>
                {(block as unknown as any).accommodation?.name && <div className="font-heading font-bold">{(block as unknown as any).accommodation.name}</div>}
                {(block as unknown as any).accommodation?.address && <div className="text-sm">{formatAddress((block as unknown as any).accommodation.address)}</div>}
                {(block as unknown as any).accommodation?.notes && <RichText content={(block as unknown as any).accommodation.notes} className="text-sm italic mt-1" />}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gallery */}
      {blockData.gallery && blockData.gallery.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-heading font-bold mb-3" style={{ color: '#2A9D8F' }}>Photos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blockData.gallery.map((item: any, idx: number) => {
              const media = typeof item.media === 'object' ? item.media as Media : null;
              if (!media) return null;
              return (
                <div key={idx} className="rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getImageUrl(media.url)} alt={item.caption || media.alt || `Photo ${idx + 1}`} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
                  {item.caption && <p className="mt-2 text-sm italic" style={{ color: '#263238' }}>{item.caption}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Budget */}
      {isFullDay && blockData.budget && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F4F1ED' }}>
          <h4 className="text-sm font-heading font-bold mb-2" style={{ color: '#4C3A7A' }}>Cost</h4>
          <div className="flex items-center gap-1 text-sm" style={{ color: '#263238' }}><DollarSign size={16} /><span>{blockData.budget?.amount} {blockData.budget?.currency}</span></div>
        </div>
      )}

      {/* Tips */}
      {isFullDay && blockData.tips && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#2A9D8F', color: 'white' }}>
          <h4 className="text-sm font-heading font-bold mb-2">Pro Tips</h4>
          <p className="text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>{blockData.tips}</p>
        </div>
      )}
    </div>
  );
}

export default function ClientItinerary({ trip }: { trip: Trip }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Filter out 'point' blocks - they only appear on the map, not as step cards
  const visibleBlocks = useMemo(() => {
    if (!trip.itinerary) return [];
    return trip.itinerary
      .map((block, originalIndex) => ({ block, originalIndex }))
      .filter(({ block }) => (block as any).blockType !== 'point');
  }, [trip.itinerary]);

  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll('[data-day-index]')) as HTMLElement[];
    if (blocks.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
      if (visible.length > 0) {
        const idx = Number((visible[0].target as HTMLElement).dataset.dayIndex);
        setActiveIndex(idx);
      }
    }, { root: null, rootMargin: '0px 0px -60% 0px', threshold: [0.2, 0.4, 0.6] });
    blocks.forEach(b => observer.observe(b));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-heading font-bold text-center pt-16 mb-12" style={{ color: '#4C3A7A' }}>Journey Map & Itinerary</h2>
      <div className="relative">
        <div className="mb-12">
          <TripDetailMap trip={trip} heightClass="h-[50vh]" activeIndex={activeIndex} />
        </div>
        <div className="space-y-8 pb-16">
          {visibleBlocks.map(({ block, originalIndex }, displayIndex) => (
            <ItineraryBlock 
              key={((block as unknown as any).id as string) || originalIndex} 
              block={block as CmsFullDayBlock | CmsWaypointBlock} 
              index={originalIndex}
              displayNumber={displayIndex + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatAddress(addr: unknown) {
  if (!addr) return null;
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object') {
    const a: any = addr;
    const parts: string[] = [];
    if (a.street) parts.push(a.street);
    if (a.city) parts.push(a.city);
    if (a.region) parts.push(a.region);
    if (a.postalCode) parts.push(a.postalCode);
    if (a.country) parts.push(a.country);
    return parts.join(', ');
  }
  return String(addr);
}
