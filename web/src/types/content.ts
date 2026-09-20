// Content types for the static, file-based content model.
// These mirror the field shapes the frontend already renders, but with all
// relationships fully embedded (no ids to resolve) since content now lives
// as plain JSON files instead of a database.

// [longitude, latitude], as exported straight from the CMS's point field.
export type GeoPoint = [number, number]

export interface MediaItem {
  url: string
  alt?: string
  caption?: string
  width?: number
  height?: number
}

export type TransportMethod =
  | 'walking'
  | 'rental_car'
  | 'public_bus'
  | 'taxi'
  | 'train'
  | 'flight'
  | 'boat'
  | 'bicycle'
  | 'hitchhiking'
  | 'tour_bus'
  | 'other'

export interface Transportation {
  arrivalMethod?: TransportMethod
  departureMethod?: TransportMethod
  travelTime?: { value?: number; unit?: 'minutes' | 'hours' | 'days' }
  distance?: { value?: number; unit?: 'km' | 'mi' }
  transportationNotes?: string
}

export type AccommodationType =
  | 'hotel'
  | 'hostel'
  | 'camping'
  | 'guesthouse'
  | 'resort'
  | 'apartment'
  | 'yurt'
  | 'wild_camping'
  | 'homestay'
  | 'ecolodge'
  | 'other'

export interface Accommodation {
  id: string
  name: string
  type: AccommodationType
  description?: string // markdown
  country?: Country
  website?: string
  media?: MediaItem[]
}

export type Continent =
  | 'africa'
  | 'antarctica'
  | 'asia'
  | 'europe'
  | 'north_america'
  | 'oceania'
  | 'south_america'

export type SafetyLevel = 'very_safe' | 'safe' | 'moderate' | 'caution' | 'high_risk'

export interface Country {
  id: string
  name: string
  countryCode?: string
  continent?: Continent
  capital?: string
  currency?: string
  currencyName?: string
  officialLanguages?: string[]
  mainReligion?: string
  mainReligionPercentage?: number
  visaRequirements?: string // markdown
  safetyLevel?: SafetyLevel
  bestTimeToVisit?: string[]
  travelTimeFromBrussels?: number
}

export interface FullDayBlock {
  blockType: 'fullDay'
  time?: string
  locationName: string
  location?: GeoPoint
  description?: string
  activities?: string // markdown
  accommodation?: Accommodation
  transportation?: Transportation
  gallery: MediaItem[]
}

export interface WaypointBlock {
  blockType: 'waypoint'
  locationName: string
  description?: string
  activities?: string // markdown
  location?: GeoPoint
  connectionType?: 'route' | 'side_trip'
  transportation?: Transportation
  gallery: MediaItem[]
}

export interface PointBlock {
  blockType: 'point'
  locationName: string
  description?: string
  location?: GeoPoint
  pointType?: 'intermediate' | 'start' | 'end'
  transportation?: Transportation
}

export type ItineraryBlock = FullDayBlock | WaypointBlock | PointBlock

export type TripCategory =
  | 'city_trip'
  | 'road_trip'
  | 'backpacking'
  | 'hiking'
  | 'base_camp'
  | 'diving'
  | 'wintersport'
  | 'culinary'

export interface Trip {
  id: string
  title: string
  slug: string
  status: 'draft' | 'coming_soon' | 'published'
  category?: TripCategory[]
  coverImage: MediaItem
  highlightsMedia?: MediaItem[]
  description?: string
  countries: Country[]
  period?: string
  budget?: { amount?: number; currency?: string; perPerson?: boolean }
  activities?: string // markdown
  featuredAccommodations?: Accommodation[]
  importantPreparations?: string // markdown
  itinerary: ItineraryBlock[]
  /** Date the trip was added to the site (YYYY-MM-DD), used by the sort options. */
  added: string
}
