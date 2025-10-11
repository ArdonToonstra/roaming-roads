// Environment variables
export const env = {
  CMS_URL: process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000',
  CMS_SECRET: process.env.CMS_SECRET || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const

// API endpoints
export const API_ENDPOINTS = {
  TRIPS: '/api/trips',
  COUNTRIES: '/api/countries', 
  MEDIA: '/api/media',
  ACCOMMODATIONS: '/api/accommodations',
} as const

// Site configuration
export const SITE_CONFIG = {
  name: 'Roaming Roads',
  description: 'Discover extraordinary travel adventures and hidden gems around the world',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  author: {
    name: 'Roaming Roads',
    email: 'hello@roamingroads.com',
  },
  social: {
    twitter: '@roamingroads',
    instagram: '@roamingroads',
  },
} as const