'use server';

import { data } from '@/lib/data';
import { Trip } from '@/types/payload';

/**
 * Server Action to fetch trips using the Local API (lib/data).
 * This allows Client Components to fetch data without hitting the REST API.
 */
export async function fetchTripsAction({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    try {
        console.log(`[ServerAction] Fetching trips page=${page} limit=${limit}`);
        const result = await data.getTrips({ page, limit });

        // Convert to plain objects to ensure serializability (though Payload types should be serializable)
        // and return only what's needed.
        return {
            docs: result.docs as Trip[],
            hasMore: result.hasNextPage,
        };
    } catch (error) {
        console.error('Failed to fetch trips via Server Action:', error);
        return {
            docs: [],
            hasMore: false,
        };
    }
}
