"use client";
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Trip } from '@/types/payload';

const SmallOverviewMap = dynamic(() => import('@/components/SmallOverviewMap'), { ssr: false });

export default function MountSmallOverview({ trip }: { trip: Trip }) {
  useEffect(() => {
    // no-op here; component itself renders into the DOM
  }, []);

  const href = `/trips/${trip.slug || trip.id}/steps`;

  return (
    <div className="relative group">
      <Link
        href={href}
        className="absolute inset-0 z-10 block cursor-pointer"
        aria-label="View Detailed Journey Map"
      />
      <SmallOverviewMap trip={trip} />
    </div>
  );
}
