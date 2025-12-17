import { env } from './config'

// Simple test to check CMS connection
export async function testCMSConnection() {
  try {
    console.log('Testing CMS connection to:', env.CMS_URL)
    
    // Try different endpoints
    const endpoints = [
      '/api/trips',
      '/api/trips?depth=0&limit=1', 
      '/trips',
      '/admin/api/trips'
    ]
    
    for (const endpoint of endpoints) {
      try {
        const url = `${env.CMS_URL}${endpoint}`
        console.log('Trying endpoint:', url)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-store', // Don't cache during testing
        })
        
        console.log(`${endpoint} status:`, response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`${endpoint} success:`, data)
          return { endpoint, data, status: response.status }
        } else {
          console.log(`${endpoint} failed:`, response.status, response.statusText)
        }
      } catch (error) {
        console.log(`${endpoint} error:`, error instanceof Error ? error.message : 'Unknown error')
      }
    }
    
    return { error: 'All endpoints failed' }
  } catch (error) {
    console.error('CMS connection test failed:', error)
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Mock data for testing while we fix the API connection
export const mockTrips = [
  {
    id: '1',
    slug: 'kyrgyzstan-adventure',
    title: 'Kyrgyzstan Adventure',
    description: 'An amazing journey through the mountains and valleys of Kyrgyzstan, experiencing nomadic culture and breathtaking landscapes.',
    status: 'published',
    coverImage: {
      url: '/api/placeholder/800/600',
      alt: 'Kyrgyzstan landscape'
    },
    country: {
      name: 'Kyrgyzstan'
    },
    period: 'August 2023',
    regionsVisited: [
      { regionName: 'Bishkek' },
      { regionName: 'Issyk-Kul' },
      { regionName: 'Naryn' }
    ],
    budget: {
      amount: 1200,
      currency: 'EUR',
      perPerson: true
    },
    highlightsMedia: [
      { media: { url: '/api/placeholder/400/300' }, caption: 'Mountain view' },
      { media: { url: '/api/placeholder/400/300' }, caption: 'Local culture' }
    ]
  },
  {
    id: '2', 
    slug: 'iceland-road-trip',
    title: 'Iceland Ring Road',
    description: 'A complete circuit of Iceland\'s Ring Road, discovering waterfalls, glaciers, and volcanic landscapes.',
    status: 'published',
    coverImage: {
      url: '/api/placeholder/800/600',
      alt: 'Iceland waterfall'
    },
    country: {
      name: 'Iceland'
    },
    period: 'June 2023',
    regionsVisited: [
      { regionName: 'Reykjavik' },
      { regionName: 'Golden Circle' },
      { regionName: 'South Coast' }
    ],
    budget: {
      amount: 2500,
      currency: 'EUR',
      perPerson: true  
    },
    highlightsMedia: [
      { media: { url: '/api/placeholder/400/300' }, caption: 'Northern lights' },
      { media: { url: '/api/placeholder/400/300' }, caption: 'Blue lagoon' },
      { media: { url: '/api/placeholder/400/300' }, caption: 'Glacier hike' }
    ]
  },
  {
    id: '3',
    slug: 'japan-culture-journey', 
    title: 'Japan Cultural Journey',
    description: 'Exploring traditional and modern Japan, from ancient temples to bustling Tokyo streets.',
    status: 'published',
    coverImage: {
      url: '/api/placeholder/800/600',
      alt: 'Japanese temple'
    },
    country: {
      name: 'Japan'
    },
    period: 'April 2023',
    regionsVisited: [
      { regionName: 'Tokyo' },
      { regionName: 'Kyoto' },
      { regionName: 'Osaka' }
    ],
    budget: {
      amount: 3000,
      currency: 'EUR',
      perPerson: true
    },
    highlightsMedia: [
      { media: { url: '/api/placeholder/400/300' }, caption: 'Cherry blossoms' },
      { media: { url: '/api/placeholder/400/300' }, caption: 'Temple visit' }
    ]
  }
]