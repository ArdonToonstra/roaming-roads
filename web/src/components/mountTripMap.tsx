"use client";
import dynamic from 'next/dynamic';
import type { Trip } from '@/types/payload';

const TripMap = dynamic(() => import('@/components/TripMap'), { ssr: false });

export default function MountTripMap({ trips }: { trips: Trip[] }) {
    return <TripMap trips={trips} />;
}
