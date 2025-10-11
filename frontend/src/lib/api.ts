import { env, API_ENDPOINTS } from './config'

// Base API client for Payload CMS
class PayloadAPI {
  private baseURL: string

  constructor() {
    this.baseURL = env.CMS_URL
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      next: {
        revalidate: 3600, // Cache for 1 hour by default
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    return response.json()
  }
}

const api = new PayloadAPI()

// API functions for each collection
export const payload = {
  // Get all trips
  getTrips: async (params?: { limit?: number; where?: any }) => {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.where) searchParams.set('where', JSON.stringify(params.where))
    
    const query = searchParams.toString()
    const endpoint = `${API_ENDPOINTS.TRIPS}${query ? `?${query}` : ''}`
    
    return api.get(endpoint)
  },

  // Get single trip by slug
  getTrip: async (slug: string) => {
    const endpoint = `${API_ENDPOINTS.TRIPS}?where[slug][equals]=${slug}&limit=1`
    const response = await api.get<{ docs: any[] }>(endpoint)
    return response.docs[0] || null
  },

  // Get all countries
  getCountries: async () => {
    return api.get(API_ENDPOINTS.COUNTRIES)
  },

  // Get country by slug
  getCountry: async (slug: string) => {
    const endpoint = `${API_ENDPOINTS.COUNTRIES}?where[slug][equals]=${slug}&limit=1`
    const response = await api.get<{ docs: any[] }>(endpoint)
    return response.docs[0] || null
  },

  // Get media
  getMedia: async (id: string) => {
    return api.get(`${API_ENDPOINTS.MEDIA}/${id}`)
  },
}