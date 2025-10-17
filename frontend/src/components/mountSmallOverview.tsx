"use client";
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const SmallOverviewMap = dynamic(() => import('@/components/SmallOverviewMap'), { ssr: false });

export default function MountSmallOverview({ trip }: { trip: any }) {
  useEffect(() => {
    // no-op here; component itself renders into the DOM
  }, []);

  return (
    <div>
      <SmallOverviewMap trip={trip} />
    </div>
  );
}
