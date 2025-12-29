"use client";
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Trip } from '@/types/payload';

const SmallOverviewMap = dynamic(() => import('@/components/SmallOverviewMap'), { ssr: false });

export default function MountSmallOverview({ trip }: { trip: Trip }) {
  useEffect(() => {
    // no-op here; component itself renders into the DOM
  }, []);

  return (
    <SmallOverviewMap trip={trip} />
  );
}
