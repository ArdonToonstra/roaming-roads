import type { RichTextContent, Trip, Country } from '@/types/payload';

// Extract activities from rich text content
export function extractActivitiesFromRichText(richText: RichTextContent | undefined): string[] {
  if (!richText || typeof richText !== 'object') return [];

  const activities: string[] = [];

  function traverseNode(node: Record<string, unknown>): void {
    if (typeof node !== 'object' || !node) return;

    // Handle different node types based on Lexical format
    if (node.type === 'paragraph' || node.type === 'listitem') {
      if (node.children && Array.isArray(node.children)) {
        let textContent = '';
        node.children.forEach((child: Record<string, unknown>) => {
          if (child.type === 'text' && typeof child.text === 'string') {
            textContent += child.text;
          }
        });

        if (textContent.trim()) {
          activities.push(textContent.trim());
        }
      }
    }

    // Recursively traverse children
    if (node.children && Array.isArray(node.children)) {
      (node.children as Record<string, unknown>[]).forEach(traverseNode);
    }

    // Handle root level nodes
    if (node.root && typeof node.root === 'object' && node.root !== null) {
      const root = node.root as Record<string, unknown>;
      if (root.children && Array.isArray(root.children)) {
        (root.children as Record<string, unknown>[]).forEach(traverseNode);
      }
    }
  }

  // Start traversal
  traverseNode(richText);

  return activities.filter(activity => activity.length > 0);
}

// Get unique continents from trips (through their countries)
export function getUniqueContinents(trips: Trip[]): string[] {
  const continents = new Set<string>();

  trips.forEach(trip => {
    if (trip.countries && Array.isArray(trip.countries)) {
      trip.countries.forEach(country => {
        if (typeof country === 'object' && country.continent) {
          continents.add(country.continent);
        }
      });
    }
  });

  return Array.from(continents).sort();
}

// Get unique countries from trips
export function getUniqueCountries(trips: Trip[]): Country[] {
  const countriesMap = new Map<string, Country>();

  trips.forEach(trip => {
    if (trip.countries && Array.isArray(trip.countries)) {
      trip.countries.forEach(country => {
        if (typeof country === 'object' && country.id && country.name) {
          countriesMap.set(country.id, country);
        }
      });
    }
  });

  return Array.from(countriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Get unique activities from all trips
export function getUniqueActivities(trips: Trip[]): string[] {
  const activities = new Set<string>();

  trips.forEach(trip => {
    const tripActivities = extractActivitiesFromRichText(trip.activities);
    tripActivities.forEach(activity => activities.add(activity));
  });

  return Array.from(activities).sort();
}

// Parse period strings for sorting (e.g., "June 2025", "December 2024")
export function parsePeriod(period: string | undefined): Date | null {
  if (!period) return null;

  try {
    // Handle formats like "June 2025", "December 2024", etc.
    const monthYearRegex = /^(\w+)\s+(\d{4})$/i;
    const match = period.match(monthYearRegex);

    if (match) {
      const [, monthStr, yearStr] = match;
      const year = parseInt(yearStr, 10);

      // Month names to numbers
      const monthMap: Record<string, number> = {
        'january': 0, 'jan': 0,
        'february': 1, 'feb': 1,
        'march': 2, 'mar': 2,
        'april': 3, 'apr': 3,
        'may': 4,
        'june': 5, 'jun': 5,
        'july': 6, 'jul': 6,
        'august': 7, 'aug': 7,
        'september': 8, 'sep': 8, 'sept': 8,
        'october': 9, 'oct': 9,
        'november': 10, 'nov': 10,
        'december': 11, 'dec': 11
      };

      const month = monthMap[monthStr.toLowerCase()];
      if (month !== undefined) {
        return new Date(year, month);
      }
    }

    // Fallback: try to parse as regular date string
    return new Date(period);
  } catch {
    return null;
  }
}

// Format category for display
export function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'city_trip': 'City Trip',
    'road_trip': 'Road Trip',
    'backpacking': 'Backpacking',
    'hiking': 'Hiking',
    'base_camp': 'Base Camp'
  };

  return categoryMap[category] || category;
}

// Format continent for display
export function formatContinent(continent: string): string {
  const continentMap: Record<string, string> = {
    'africa': 'Africa',
    'antarctica': 'Antarctica',
    'asia': 'Asia',
    'europe': 'Europe',
    'north_america': 'North America',
    'oceania': 'Oceania',
    'south_america': 'South America'
  };

  return continentMap[continent] || continent;
}

// Filter trips based on selected filters
export interface TripFilters {
  category?: string;
  continent?: string;
  country?: string;
  activity?: string;
}

export function filterTrips(trips: Trip[], filters: TripFilters): Trip[] {
  return trips.filter(trip => {
    // Category filter
    if (filters.category) {
      // Check if the trip has categories and if the selected filter is in its list
      if (!trip.category || !Array.isArray(trip.category) || !trip.category.includes(filters.category as Trip['category'][number])) {
        return false;
      }
    }

    // Continent filter (check through countries)
    if (filters.continent) {
      const hasContinent = trip.countries?.some(country => {
        if (typeof country === 'object' && country.continent) {
          return String(country.continent).toLowerCase() === String(filters.continent).toLowerCase();
        }
        return false;
      });
      if (!hasContinent) return false;
    }

    // Country filter
    if (filters.country) {
      const hasCountry = trip.countries?.some(country => {
        if (typeof country === 'object') {
          // Compare as strings to ensure ID match works regardless of type (number vs string)
          return String(country.id) === String(filters.country) || country.name === filters.country;
        } else if (typeof country === 'string') {
          // Handle case where country is just an ID string
          return String(country) === String(filters.country);
        }
        return false;
      });
      if (!hasCountry) return false;
    }

    // Activity filter
    if (filters.activity) {
      const activities = extractActivitiesFromRichText(trip.activities);
      const hasActivity = activities.some(activity =>
        activity.toLowerCase().includes(filters.activity!.toLowerCase())
      );
      if (!hasActivity) return false;
    }

    return true;
  });
}

// Sort trips by different criteria
export type SortOption = 'newest' | 'oldest' | 'title';

export function sortTrips(trips: Trip[], sortBy: SortOption): Trip[] {
  return [...trips].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        const dateA = parsePeriod(a.period);
        const dateB = parsePeriod(b.period);
        if (dateA && dateB) {
          return dateB.getTime() - dateA.getTime();
        }
        // Fallback to creation date if periods can't be parsed
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      case 'oldest':
        const dateC = parsePeriod(a.period);
        const dateD = parsePeriod(b.period);
        if (dateC && dateD) {
          return dateC.getTime() - dateD.getTime();
        }
        // Fallback to creation date if periods can't be parsed
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

      case 'title':
        return a.title.localeCompare(b.title);

      default:
        return 0;
    }
  });
}