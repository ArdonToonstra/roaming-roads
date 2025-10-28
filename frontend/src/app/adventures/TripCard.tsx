"use client";
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getImageUrl } from '@/lib/images';
import type { Trip } from '@/types/payload';

export default function TripCard({ trip }: { trip: Trip }) {
  const imageUrl = getImageUrl(trip.coverImage);
  const country = (trip.countries && Array.isArray(trip.countries) && trip.countries.length > 0 && typeof trip.countries[0] === 'object') 
    ? trip.countries[0].name 
    : 'Adventure';
  return (
    <Link href={`/trips/${trip.slug || trip.id}`} className="group">
      <article className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
        <div className="aspect-[4/3] bg-muted overflow-hidden">
          <img 
            src={imageUrl}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="font-heading font-bold text-xl text-card-foreground mb-2 group-hover:text-primary transition-colors">
            {trip.title}
          </h3>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {trip.description}
          </p>
          <div className="mt-auto pt-4 text-sm text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{country}</span>
            </div>
            {trip.period && <div>{trip.period}</div>}
          </div>
        </div>
      </article>
    </Link>
  );
}
