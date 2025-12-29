"use client";
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { getImageUrl } from '@/lib/images';
import type { Trip } from '@/types/payload';

export default function TripCard({ trip }: { trip: Trip }) {
  const imageUrl = getImageUrl(trip.coverImage);
  const country = (trip.countries && Array.isArray(trip.countries) && trip.countries.length > 0 && typeof trip.countries[0] === 'object')
    ? trip.countries[0].name
    : 'Adventure';

  const isComingSoon = trip.status === 'coming_soon';

  const cardContent = (
    <article className={`bg-card rounded-lg border border-border overflow-hidden shadow-sm transition-all duration-300 flex flex-col h-full relative ${isComingSoon ? 'opacity-60' : 'hover:shadow-lg hover:-translate-y-1'}`}>
      {isComingSoon && (
        <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <Clock size={12} />
          Coming Soon
        </div>
      )}
      <div className="aspect-[4/3] bg-muted overflow-hidden relative">
        <Image
          src={imageUrl}
          alt={trip.title}
          fill
          className={`object-cover transition-transform duration-500 ${isComingSoon ? 'grayscale' : 'group-hover:scale-105'}`}
          unoptimized
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className={`font-heading font-bold text-xl text-card-foreground mb-2 transition-colors ${!isComingSoon && 'group-hover:text-primary'}`}>
          {trip.title}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-2 flex-grow">
          {trip.description}
        </p>

        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{country}</span>
          </div>
          {trip.period && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{trip.period}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );

  if (isComingSoon) {
    return <div className="group cursor-default">{cardContent}</div>;
  }

  return (
    <Link href={`/trips/${trip.slug || trip.id}`} className="group">
      {cardContent}
    </Link>
  );
}
