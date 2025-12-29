'use client';

import { useState, useEffect } from 'react';
import { Accommodation } from '@/types/payload';
import { X, Globe, ExternalLink, Bed } from 'lucide-react';
import Image from 'next/image';
import RichText from '@/components/RichText';
import { getImageUrl } from '@/lib/images';

interface FeaturedAccommodationsProps {
    items: NonNullable<import('@/types/payload').Trip['featuredAccommodations']>;
}

export default function FeaturedAccommodations({ items }: FeaturedAccommodationsProps) {
    const [selected, setSelected] = useState<Accommodation | null>(null);

    // Hide map elements when modal is open
    useEffect(() => {
        if (selected) {
            // Find all leaflet map containers and hide them
            const mapContainers = document.querySelectorAll('.leaflet-container');
            mapContainers.forEach((container) => {
                (container as HTMLElement).style.visibility = 'hidden';
            });

            // Cleanup: restore visibility when modal closes
            return () => {
                mapContainers.forEach((container) => {
                    (container as HTMLElement).style.visibility = 'visible';
                });
            };
        }
    }, [selected]);

    // Filter valid accommodations
    const validItems = items
        .map(item => typeof item.accommodation === 'object' ? item.accommodation as Accommodation : null)
        .filter((item): item is Accommodation => item !== null);

    if (validItems.length === 0) {
        return <p className="text-gray-500 italic">No featured accommodations for this trip</p>;
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                {validItems.map((accommodation, index) => (
                    <div
                        key={accommodation.id || index}
                        onClick={() => setSelected(accommodation)}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-heading font-bold text-gray-800 group-hover:text-teal-700 transition-colors line-clamp-1">
                                    {accommodation.name}
                                </h4>
                            </div>

                            <p className="text-xs text-gray-500 capitalize mb-2 font-medium">
                                {accommodation.type?.replace(/_/g, ' ')}
                            </p>

                        </div>

                        <div className="mt-3 text-xs text-teal-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            More details <ExternalLink size={10} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selected && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
                    <div
                        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="relative">
                            {/* Close Button */}
                            <button
                                onClick={() => setSelected(null)}
                                className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                            >
                                <X size={20} />
                            </button>

                            {/* Header Image (if any) */}
                            {selected.media && selected.media.length > 0 && (() => {
                                const coverPhoto = selected.media?.[0];
                                const url = typeof coverPhoto === 'object' ? getImageUrl(coverPhoto.url) : null;
                                if (!url) return null;
                                return (
                                    <div className="relative h-64 w-full">
                                        <Image
                                            src={url}
                                            alt={typeof coverPhoto === 'object' ? coverPhoto.alt || selected.name : selected.name}
                                            fill
                                            className="object-cover rounded-t-2xl"
                                            unoptimized
                                        />
                                    </div>
                                )
                            })()}

                            <div className="p-8">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                                            {selected.name}
                                        </h2>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <span className="flex items-center gap-1 capitalize px-3 py-1 bg-gray-100 rounded-full">
                                                <Bed size={14} />
                                                {selected.type?.replace(/_/g, ' ')}
                                            </span>
                                            {selected.country && typeof selected.country === 'object' && (
                                                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full">
                                                    {selected.country.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Description */}
                                    {selected.description && (
                                        <div className="prose prose-sm max-w-none text-gray-600">
                                            <RichText content={selected.description} />
                                        </div>
                                    )}

                                    {/* Website */}
                                    {selected.website && (
                                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                            <h4 className="font-bold text-gray-900 mb-3">Visit Website</h4>
                                            <a 
                                                href={selected.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 hover:underline"
                                            >
                                                <Globe size={16} />
                                                <span>{selected.website}</span>
                                            </a>
                                        </div>
                                    )}

                                    {/* Additional Photos */}
                                    {selected.media && selected.media.length > 1 && (
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3">Photos</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {selected.media.slice(1).map((photo, i) => {
                                                    const url = typeof photo === 'object' ? getImageUrl(photo.url) : null;
                                                    if (!url) return null;
                                                    return (
                                                        <div key={i} className="relative h-32 rounded-lg overflow-hidden">
                                                            <Image
                                                                src={url}
                                                                alt={typeof photo === 'object' ? photo.alt || `Photo ${i + 2}` : `Photo ${i + 2}`}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
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
                    </div>
                </div>
            )}
        </>
    );
}
