'use client';

import TripMap from '@/components/TripMap';
import { Trip } from '@/types/payload';

interface TripsInteractiveProps {
  trips: Trip[];
}

export default function TripsInteractive({ trips }: TripsInteractiveProps) {
  return (
    <div className="h-full w-full">
      <TripMap trips={trips} />
    </div>
  );
}