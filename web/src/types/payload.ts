// Rich text content type (Lexical editor format)
export interface RichTextContent {
  [k: string]: unknown
}

// Point/Location data type
export interface PointLocation {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}

// Base types from Payload CMS
export interface PayloadCollection<T = unknown> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage?: number
  nextPage?: number
}

// Accommodation type
export interface Accommodation {
  id: string
  name: string
  type: 'hotel' | 'hostel' | 'camping' | 'guesthouse' | 'resort' | 'apartment' | 'yurt' | 'wild_camping' | 'homestay' | 'ecolodge' | 'other'
  description?: RichTextContent
  country?: string | Country
  website?: string
  media?: Media[] | string[]
  createdAt: string
  updatedAt: string
}

// Media type
export interface Media {
  id: string
  alt: string
  filename: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  sizes?: {
    thumbnail?: ImageSize
    card?: ImageSize
    tablet?: ImageSize
    hero?: ImageSize
  }
  url: string
  createdAt: string
  updatedAt: string
}

interface ImageSize {
  width: number
  height: number
  filename: string
  url: string
}

// Country type
export interface Country {
  id: string
  name: string
  slug: string
  countryCode?: string
  continent?: 'africa' | 'antarctica' | 'asia' | 'europe' | 'north_america' | 'oceania' | 'south_america'
  flagEmoji?: string
  description?: RichTextContent
  capital?: string
  currency?: string
  language?: string
  timezone?: string
  bestTimeToVisit?: string[]
  mainReligion?: string
  safetyLevel?: 'very_safe' | 'safe' | 'moderate' | 'caution' | 'high_risk'
  visaRequirements?: RichTextContent
  culturalTips?: RichTextContent
  headerImage?: Media
  gallery?: Media[]
  createdAt: string
  updatedAt: string
}

// Trip type based on actual CMS structure
export interface Trip {
  id: string
  title: string
  slug: string
  status: 'draft' | 'coming_soon' | 'published'
  category: ('city_trip' | 'road_trip' | 'backpacking' | 'hiking' | 'base_camp')[]
  coverImage: string | Media
  highlightsMedia?: Array<{
    media: string | Media
    caption: string
    order: number
  }>
  description?: string
  countries?: Array<string | Country>
  regionsVisited?: Array<{
    regionName: string
    regionType: 'province' | 'region' | 'oblast' | 'state' | 'territory' | 'county' | 'district' | 'other'
    highlights?: string
  }>
  period?: string
  budget?: {
    amount: number
    currency: string
    perPerson: boolean
  }
  activities?: RichTextContent
  featuredAccommodations?: Array<{
    accommodation: string | Accommodation // Accommodation relationship
  }>
  importantPreparations?: RichTextContent
  itinerary?: Array<CmsFullDayBlock | CmsWaypointBlock>
  createdAt: string
  updatedAt: string
}

// CMS Block types for itinerary
export interface CmsFullDayBlock {
  blockType: 'fullDay'
  id: string
  time?: string
  locationName: string
  location?: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  regionProvince?: string
  description?: string
  activities?: RichTextContent // Rich text content
  accommodation?: string | Accommodation // Accommodation relationship
  transportation?: Transportation
  gallery?: Array<{
    media: string | Media
    caption?: string
  }>
}

export interface CmsWaypointBlock {
  blockType: 'waypoint'
  id: string
  locationName: string
  description?: string
  activities?: RichTextContent // Rich text content
  location?: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  regionProvince?: string
  connectionType?: 'route' | 'side_trip'
  transportation?: Transportation
  gallery?: Array<{
    media: string | Media
    caption?: string
  }>
}

// Trip blocks (daily itinerary)
export type TripBlock = FullDayBlock

interface FullDayBlock {
  blockType: 'fullDay'
  id: string
  dayNumber: number
  date: string
  title: string
  weather?: {
    temperature: number
    condition: string
    description?: string
  }
  accommodation?: {
    name: string
    location?: PointLocation // Point field
    checkIn?: string
    checkOut?: string
    notes?: string
  }
  transportation?: Transportation[]
  wayPoints?: WayPoint[]
  summary?: RichTextContent // Rich text content
  photos?: Media[]
  personalNotes?: RichTextContent // Rich text content
}

interface Transportation {
  arrivalMethod?: string
  departureMethod?: string
  travelTime?: {
    value: number
    unit: 'minutes' | 'hours' | 'days'
  }
  distance?: {
    value: number
    unit: 'km' | 'mi'
  }
  transportationNotes?: string
}

// Waypoint type (from blocks)
export interface WayPoint {
  id: string
  name: string
  location?: PointLocation // Point field
  type: 'attraction' | 'restaurant' | 'viewpoint' | 'accommodation' | 'transport_hub' | 'shop' | 'other'
  visitTime?: {
    arrival: string
    departure?: string
  }
  description?: RichTextContent // Rich text content
  photos?: Media[]
  rating?: number
  cost?: {
    amount: number
    currency: string
  }
  tips?: RichTextContent // Rich text content
  coordinates?: {
    lat: number
    lng: number
  }
}