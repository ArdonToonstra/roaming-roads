"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Trip } from '@/types/payload';
import TripCard from '@/app/(frontend)/adventures/TripCard';
import { fetchTripsAction } from '@/app/actions';

export default function TripsPaginator({ initial, initialPage = 1, pageSize = 9 }: { initial: Trip[]; initialPage?: number; pageSize?: number }) {
  const [items, setItems] = useState<Trip[]>(initial);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const { docs, hasMore: moreAvailable } = await fetchTripsAction({ page: nextPage, limit: pageSize });

      setItems(prev => [...prev, ...docs]);
      setPage(nextPage);
      setHasMore(moreAvailable);
    } catch (err) {
      console.error('Failed to load more trips', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, pageSize]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loader.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loader, loadMore]);


  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map(t => (
          <TripCard key={t.id} trip={t} />
        ))}
      </div>

      <div ref={loader} className="mt-8 text-center">
        {loading && <p>Loading more adventures...</p>}
        {!hasMore && <p className="text-sm text-muted-foreground">No more adventures.</p>}
      </div>
    </>
  );
}