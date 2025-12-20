'use client';

import { useState } from 'react';
import { Accommodation, Media } from '@/types/payload';
import { X, MapPin, Globe, Phone, Mail, Star, ExternalLink, Bed, EuroIcon } from 'lucide-react';
import Image from 'next/image';
import RichText from '@/components/RichText';
import { getImageUrl } from '@/lib/images';

interface FeaturedAccommodationsProps {
    items: NonNullable<import('@/types/payload').Trip['featuredAccommodations']>;
}

export default function FeaturedAccommodations({ items }: FeaturedAccommodationsProps) {
    const [selected, setSelected] = useState<Accommodation | null>(null);

    // Filter valid accommodations
    const validItems = items
        .map(item => typeof item.accommodation === 'object' ? item.accommodation as Accommodation : null)
        .filter((item): item is Accommodation => item !== null);

    if (validItems.length === 0) {
        return <p className="text-gray-500 italic">No featured accommodations for this trip</p>;
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                {accommodation.starRating && (
                                    <div className="flex items-center text-yellow-400 shrink-0 ml-2">
                                        <span className="text-xs font-bold text-gray-600 mr-1">{accommodation.starRating}</span>
                                        <Star size={14} fill="currentColor" />
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-gray-500 capitalize mb-2 font-medium">
                                {accommodation.type?.replace(/_/g, ' ')}
                            </p>

                            {accommodation.priceRange && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <EuroIcon size={12} />
                                    <span className="capitalize">{accommodation.priceRange}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-3 text-xs text-teal-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            More details <ExternalLink size={10} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
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
                            {selected.photos && selected.photos.length > 0 && (() => {
                                const coverPhoto = selected.photos[0];
                                const url = typeof coverPhoto === 'object' ? getImageUrl(coverPhoto.url) : null;
                                if (!url) return null;
                                return (
                                    <div className="relative h-64 w-full">
                                        <Image
                                            src={url}
                                            alt={typeof coverPhoto === 'object' ? coverPhoto.alt : selected.name}
                                            fill
                                            className="object-cover"
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
                                            {selected.starRating && (
                                                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full">
                                                    {selected.starRating} <Star size={14} fill="currentColor" />
                                                </span>
                                            )}
                                            {selected.priceRange && (
                                                <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full capitalize">
                                                    <EuroIcon size={14} /> {selected.priceRange}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Left: Description & Info */}
                                    <div className="md:col-span-2 space-y-6">
                                        {selected.description && (
                                            <div className="prose prose-sm max-w-none text-gray-600">
                                                <RichText content={selected.description} />
                                            </div>
                                        )}

                                        {selected.amenities && selected.amenities.length > 0 && (
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-3">Amenities</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selected.amenities.map((amenity, i) => (
                                                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full capitalize">
                                                            {amenity.replace(/_/g, ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Contact & Location */}
                                    <div className="space-y-6">
                                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                            <h4 className="font-bold text-gray-900 mb-4">Contact & Location</h4>
                                            <div className="space-y-3 text-sm">
                                                {(selected.address?.city || selected.address?.country) && (
                                                    <div className="flex items-start gap-2 text-gray-600">
                                                        <MapPin size={16} className="mt-1 shrink-0" />
                                                        <span>
                                                            {[
                                                                selected.address.street,
                                                                selected.address.city,
                                                                typeof selected.address.country === 'object' ? selected.address.country?.name : selected.address.country
                                                            ].filter(Boolean).join(', ')}
                                                        </span>
                                                    </div>
                                                )}

                                                {selected.contact?.website && (
                                                    <a href={selected.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-teal-600 hover:underline">
                                                        <Globe size={16} />
                                                        <span>Website</span>
                                                    </a>
                                                )}

                                                {selected.contact?.phone && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone size={16} />
                                                        <span>{selected.contact.phone}</span>
                                                    </div>
                                                )}

                                                {selected.bookingLinks && selected.bookingLinks.length > 0 && (
                                                    <div className="pt-3 mt-3 border-t border-gray-200">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Book via</p>
                                                        <div className="space-y-2">
                                                            {selected.bookingLinks.map((link, i) => (
                                                                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs font-bold">
                                                                    {link.platform}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
