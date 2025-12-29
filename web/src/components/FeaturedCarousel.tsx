"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Trip } from '@/types/payload';
import { getImageUrl } from '@/lib/images';

// This is the card component
function FeaturedTripCard({ trip }: { trip: Trip }) {
  const imageUrl = getImageUrl(trip.coverImage);
  const isComingSoon = trip.status === 'coming_soon';

  const cardContent = (
    <article className={`relative rounded-lg overflow-hidden shadow-lg h-80 ${isComingSoon ? 'opacity-60' : ''}`}>
      {isComingSoon && (
        <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <Clock size={12} />
          Coming Soon
        </div>
      )}
      <Image
        src={imageUrl}
        alt={trip.title}
        fill
        className={`object-cover transition-transform duration-500 ${isComingSoon ? 'grayscale' : 'group-hover:scale-105'}`}
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <h3 className={`absolute bottom-0 left-0 p-6 font-heading font-bold text-xl text-white transition-colors ${!isComingSoon && 'group-hover:text-primary'}`}>
        {trip.title}
      </h3>
    </article>
  );

  return isComingSoon ? (
    <div className="group block w-full h-full cursor-default">
      {cardContent}
    </div>
  ) : (
    <Link href={`/trips/${trip.slug || trip.id}`} className="group block w-full h-full">
      {cardContent}
    </Link>
  );
}


interface FeaturedCarouselProps {
  items: Trip[];
  itemsToShow?: number;
}

export default function FeaturedCarousel({ items, itemsToShow = 4 }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalPages = useMemo(() => {
    if (!items || items.length === 0) return 0;
    return Math.ceil(items.length / itemsToShow);
  }, [items, itemsToShow]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalPages) % totalPages);
  };

  const goToPage = (pageIndex: number) => {
    setCurrentIndex(pageIndex);
  };

  const startIndex = currentIndex * itemsToShow;
  const visibleItems = items.slice(startIndex, startIndex + itemsToShow);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Carousel content */}
      <div className="overflow-hidden">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {visibleItems.map((item) => (
            <div key={item.id}>
              <FeaturedTripCard trip={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 space-x-6">
          {/* Left Arrow */}
          <button
            onClick={goToPrev}
            className="p-2 rounded-full bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <button
                key={pageIndex}
                onClick={() => goToPage(pageIndex)}
                className={`w-2 h-2 rounded-full transition-colors ${currentIndex === pageIndex ? 'bg-primary' : 'bg-medium-gray'
                  }`}
                aria-label={`Go to slide ${pageIndex + 1}`}
              />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={goToNext}
            className="p-2 rounded-full bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}