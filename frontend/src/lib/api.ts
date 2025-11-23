import { env, API_ENDPOINTS } from './config'
import type { Trip, PayloadCollection } from '../types/payload'

// Helper constants for environment checks
const IS_PROD = env.NODE_ENV === 'production'
const IS_DEV = env.NODE_ENV === 'development'

class PayloadAPI {
  private baseURL: string

  constructor() {
    this.baseURL = env.CMS_URL
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Ensure no double slashes if baseURL ends with / and endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${this.baseURL}${cleanEndpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      // Cache Strategy:
      // Dev: No store (fresh data)
      // Prod: Revalidate every hour
      ...(IS_DEV 
        ? { cache: 'no-store' as RequestCache }
        : { next: { revalidate: 3600 } }
      ),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    return response.json()
  }
}

const api = new PayloadAPI()

export const payload = {
  // -------------------------------------------------------------------------
  // Get all trips
  // -------------------------------------------------------------------------
  getTrips: async (params?: { 
    limit?: number; 
    page?: number; 
    where?: Record<string, unknown>; 
    depth?: number 
  }) : Promise<PayloadCollection<Trip>> => {
    
    const searchParams = new URLSearchParams()

    // 1. Handle Pagination
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.page) searchParams.set('page', params.page.toString())
    if (typeof params?.depth === 'number') searchParams.set('depth', String(params.depth))

    // 2. Handle 'Where' Filters
    let whereCondition = { ...(params?.where || {}) }

    // PRODUCTION RULE: Only show published trips
    if (IS_PROD) {
      whereCondition = {
        ...whereCondition,
        status: { equals: 'published' }
      }
    }

    // Only attach 'where' param if conditions exist
    if (Object.keys(whereCondition).length > 0) {
      searchParams.set('where', JSON.stringify(whereCondition))
    }
    
    // 3. Handle Draft Mode (Development only)
    if (IS_DEV) {
      searchParams.set('draft', 'true')
    }
    
    const query = searchParams.toString()
    const endpoint = `${API_ENDPOINTS.TRIPS}${query ? `?${query}` : ''}`
    
    // In dev, we want instant updates. In prod, cache lists for 6 mins.
    const fetchOptions = IS_DEV ? undefined : { next: { revalidate: 360 } }

    return api.get<PayloadCollection<Trip>>(endpoint, fetchOptions)
  },

  // -------------------------------------------------------------------------
  // Get single trip by slug or ID
  // -------------------------------------------------------------------------
  getTrip: async (slugOrId: string): Promise<Trip | null> => {
    console.log(`[getTrip] Fetching: ${slugOrId}`)
    
    // WORKAROUND: Fetching all because server-side filtering is behaving unexpectedly.
    // TODO: Once backend 'where' clauses are fixed, switch to specific query for performance.
    
    const searchParams = new URLSearchParams()
    
    if (IS_DEV) {
      searchParams.set('draft', 'true')
    }

    // We keep the limit high to ensure we find the item in the list
    searchParams.set('limit', '1000') 
    
    const endpoint = `${API_ENDPOINTS.TRIPS}?${searchParams.toString()}`
    
    // Cache detail calls for 1 hour in production
    const fetchOptions = IS_DEV ? undefined : { next: { revalidate: 3600 } }

    try {
      const response = await api.get<{ docs: Trip[] }>(endpoint, fetchOptions)
      
      // Client-side find
      const trip = response.docs?.find(t => {
        const isIdMatch = t.id?.toString() === slugOrId
        const isSlugMatch = t.slug === slugOrId
        return isIdMatch || isSlugMatch
      })

      if (!trip) return null

      // PRODUCTION RULE: Filter out non-published trips found via ID/Slug
      if (IS_PROD && trip.status !== 'published') {
        console.warn(`[getTrip] Blocked access to non-published trip: ${slugOrId}`)
        return null
      }

      return trip
    } catch (error) {
      console.error(`[getTrip] Error fetching trip ${slugOrId}:`, error)
      return null
    }
  },

  // -------------------------------------------------------------------------
  // Get all countries
  // -------------------------------------------------------------------------
  getCountries: async () => {
    return api.get(API_ENDPOINTS.COUNTRIES)
  },

  // -------------------------------------------------------------------------
  // Get country by slug
  // -------------------------------------------------------------------------
  getCountry: async (slug: string) => {
    // Note: If you have issues with standard Payload 'where' syntax here, 
    // you might need to use the JSON.stringify approach used in getTrips.
    // Current standard syntax: ?where[slug][equals]=value
    const endpoint = `${API_ENDPOINTS.COUNTRIES}?where[slug][equals]=${slug}&limit=1`
    const response = await api.get<{ docs: Record<string, unknown>[] }>(endpoint)
    return response.docs[0] || null
  },

  // -------------------------------------------------------------------------
  // Get media
  // -------------------------------------------------------------------------
  getMedia: async (id: string) => {
    return api.get(`${API_ENDPOINTS.MEDIA}/${id}`)
  },
}