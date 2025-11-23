"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Calendar, Filter, Grid, List, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Trip } from '@/types/payload';
import { getImageUrl } from '@/lib/images';
import {
  filterTrips,
  sortTrips,
  getUniqueContinents,
  getUniqueCountries,
  getUniqueActivities,
  formatCategory,
  formatContinent,
  type TripFilters,
  type SortOption
} from '@/lib/utils/tripFilters';

interface AdventureFiltersProps {
  trips: Trip[];
}

function TripCard({ trip }: { trip: Trip }) {
  const imageUrl = getImageUrl(trip.coverImage);

  const country = (trip.countries && Array.isArray(trip.countries) && trip.countries.length > 0 && typeof trip.countries[0] === 'object') 
    ? (trip.countries[0] as { name: string }).name 
    : 'Adventure';

  return (
    <Link href={`/trips/${trip.slug || trip.id}`} className="group">
      <article className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
        <div className="aspect-[4/3] bg-muted overflow-hidden">
          <img 
            src={imageUrl}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          {/* Category Badge */}
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
              {formatCategory(trip.category)}
            </span>
          </div>
          
          <h3 className="font-heading font-bold text-xl text-card-foreground mb-2 group-hover:text-primary transition-colors">
            {trip.title}
          </h3>
          
          <p className="text-muted-foreground mb-4 line-clamp-2 flex-grow">
            {trip.description}
          </p>
          
          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{country}</span>
            </div>
            {trip.period && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{trip.period}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function FilterDropdown({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "All" 
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1.5 text-sm bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function AdventureFilters({ trips }: AdventureFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [filters, setFilters] = useState<TripFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlFilters: TripFilters = {};
    
    if (searchParams.get('category')) urlFilters.category = searchParams.get('category')!;
    if (searchParams.get('continent')) urlFilters.continent = searchParams.get('continent')!;
    if (searchParams.get('country')) urlFilters.country = searchParams.get('country')!;
    if (searchParams.get('activity')) urlFilters.activity = searchParams.get('activity')!;
    
    const hasUrlFilters = Object.values(urlFilters).some(v => v);
    if (hasUrlFilters) {
      setFilters(urlFilters);
      setShowFilters(true); // Show filters if URL has parameters
    }

    if (searchParams.get('search')) {
      setSearchTerm(searchParams.get('search')!);
    }

    if (searchParams.get('sort')) {
      setSortBy(searchParams.get('sort')! as SortOption);
    }
  }, [searchParams]);

  // Extract filter options from trips data
  const filterOptions = useMemo(() => {
    const categories = [...new Set(trips.map(trip => trip.category))].filter(Boolean).map(category => ({
      value: category,
      label: formatCategory(category)
    }));

    const continents = getUniqueContinents(trips).map(continent => ({
      value: continent,
      label: formatContinent(continent)
    }));

    const countries = getUniqueCountries(trips).map(country => ({
      value: country.id,
      label: country.name
    }));

    const activities = getUniqueActivities(trips).map(activity => ({
      value: activity,
      label: activity
    }));

    // Debug logging
    console.log('Filter options generated:', {
      categoriesCount: categories.length,
      continentsCount: continents.length,
      countriesCount: countries.length,
      activitiesCount: activities.length,
      sampleCountries: countries.slice(0, 3)
    });

    return { categories, continents, countries, activities };
  }, [trips]);

  // Filter and sort trips
  const filteredAndSortedTrips = useMemo(() => {
    let result = trips;

    // Apply text search
    if (searchTerm) {
      result = result.filter(trip => 
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.countries?.some(country => 
          typeof country === 'object' && country.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    result = filterTrips(result, filters);

    // Apply sorting
    result = sortTrips(result, sortBy);

    return result;
  }, [trips, filters, sortBy, searchTerm]);

  const updateFilter = (key: keyof TripFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined
    };
    
    console.log('Updating filter:', key, 'to:', value);
    console.log('New filters:', newFilters);
    
    setFilters(newFilters);
    updateURL(newFilters, searchTerm, sortBy);
  };

  const updateURL = (newFilters: TripFilters, search: string, sort: SortOption) => {
    const params = new URLSearchParams();
    
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.continent) params.set('continent', newFilters.continent);
    if (newFilters.country) params.set('country', newFilters.country);
    if (newFilters.activity) params.set('activity', newFilters.activity);
    if (search) params.set('search', search);
    if (sort !== 'newest') params.set('sort', sort);
    
    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newURL, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSortBy('newest');
    router.replace(pathname, { scroll: false });
  };

  const updateSearch = (value: string) => {
    setSearchTerm(value);
    updateURL(filters, value, sortBy);
  };

  const updateSort = (value: SortOption) => {
    setSortBy(value);
    updateURL(filters, searchTerm, value);
  };

  const hasActiveFilters = Object.values(filters).some(v => v) || searchTerm;

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title, description, or country..."
                value={searchTerm}
                onChange={(e) => updateSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle and Sort */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-border text-foreground hover:bg-muted'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="ml-1 text-xs">({Object.values(filters).filter(v => v).length})</span>}
            </button>

            <select
              value={sortBy}
              onChange={(e) => updateSort(e.target.value as SortOption)}
              className="px-3 py-2 text-sm bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">A-Z</option>
            </select>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <FilterDropdown
                label="Category"
                options={filterOptions.categories}
                value={filters.category || ''}
                onChange={(value) => updateFilter('category', value)}
              />
              
              <FilterDropdown
                label="Continent"
                options={filterOptions.continents}
                value={filters.continent || ''}
                onChange={(value) => updateFilter('continent', value)}
              />
              
              <FilterDropdown
                label="Country"
                options={filterOptions.countries}
                value={filters.country || ''}
                onChange={(value) => updateFilter('country', value)}
              />
              
              <FilterDropdown
                label="Activity"
                options={filterOptions.activities}
                value={filters.activity || ''}
                onChange={(value) => updateFilter('activity', value)}
                placeholder="All Activities"
              />
            </div>
            
            {hasActiveFilters && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {filteredAndSortedTrips.length} of {trips.length} adventures
                </span>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold text-foreground">
            {filteredAndSortedTrips.length === trips.length 
              ? `All Adventures (${trips.length})`
              : `${filteredAndSortedTrips.length} of ${trips.length} Adventures`
            }
          </h2>
        </div>

        {/* Trip Grid */}
        {filteredAndSortedTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-card rounded-xl p-12 max-w-md mx-auto border border-border">
              <h3 className="text-2xl font-heading font-bold mb-4 text-card-foreground">
                No Adventures Found
              </h3>
              <p className="mb-6 text-muted-foreground">
                No adventures match your current search and filter criteria. Try adjusting your filters or clearing them to see more results.
              </p>
              <button
                onClick={clearFilters}
                className="inline-block px-6 py-3 bg-primary text-primary-foreground font-heading font-bold rounded-full transition-opacity duration-300 hover:opacity-90"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}