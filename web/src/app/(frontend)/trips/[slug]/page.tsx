import { data } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Camera, Navigation, Globe, AlertTriangle, Bed, Target, Euro } from 'lucide-react';
import { Trip, Country, Media } from '@/types/payload';
import { notFound } from 'next/navigation';
import { getImageUrl } from '@/lib/images';
// Removed embedded map + itinerary; now lives under /journey subpage
import MountSmallOverview from '@/components/mountSmallOverview';
import RichText from '@/components/RichText';
import FeaturedAccommodations from '@/components/FeaturedAccommodations';

interface TripPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getTrip(slugOrId: string): Promise<Trip | null> {
  try {
    // Skip API calls for static assets (images, css, js, etc.)
    if (slugOrId.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico|woff|woff2|ttf|eot)$/i)) {
      return null;
    }

    console.log('Fetching trip with slug/ID:', slugOrId);
    const response = await data.getTrip(slugOrId);
    console.log('Trip response:', response ? 'Found' : 'Not Found');
    return response;
  } catch (error) {
    console.error('Failed to fetch trip:', error);
    console.error('Slug/ID was:', slugOrId);
    return null;
  }
}



export default async function TripDetailPage({ params }: TripPageProps) {
  const { slug } = await params;
  const trip = await getTrip(slug);

  if (!trip) {
    notFound();
  }

  const coverImage = trip.coverImage;
  // Prefer hero size if available
  let imageUrl = '/placeholder-trip.jpg';
  if (typeof coverImage === 'object' && coverImage) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sizes: any = (coverImage as any).sizes;
    const heroSizeUrl = sizes?.hero?.url;
    const baseUrl = coverImage.url;
    imageUrl = getImageUrl(heroSizeUrl || baseUrl || '/placeholder-trip.jpg');
  } else if (typeof coverImage === 'string') {
    imageUrl = getImageUrl(coverImage);
  }

  const country = (trip.countries && Array.isArray(trip.countries) && trip.countries.length > 0 && typeof trip.countries[0] === 'object')
    ? (trip.countries[0] as Country).name
    : 'Unknown Country';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F1ED' }}>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white -mt-16">
        <Image
          src={imageUrl}
          alt={trip.title}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-white hover:text-[#F57D50] transition-colors duration-200 mb-8">
          </Link>

          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
            {trip.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-lg mb-8">
            <div className="flex items-center gap-2">
              <MapPin size={20} />
              <span style={{ fontFamily: 'Lato, sans-serif' }}>{country}</span>
            </div>

            {trip.period && (
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span style={{ fontFamily: 'Lato, sans-serif' }}>{trip.period}</span>
              </div>
            )}
          </div>

          {trip.description && (
            <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Lato, sans-serif' }}>
              {trip.description}
            </p>
          )}
        </div>
      </section>

      {/* Trip Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Detailed Information */}
            <div className="lg:col-span-2 space-y-12">

              {/* Quick Stats */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-2xl font-heading font-bold mb-6" style={{ color: '#4C3A7A' }}>
                  Trip Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Countries */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe size={18} />
                      <span className="font-medium">Countries</span>
                    </div>
                    <div className="space-y-1">
                      {trip.countries && trip.countries.length > 0 ? (
                        trip.countries.map((country, index) => (
                          <p key={index} className="font-medium text-gray-800">
                            {typeof country === 'object' ? (country as Country).name : country}
                          </p>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">Not specified</p>
                      )}
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Euro size={18} />
                      <span className="font-medium">Budget</span>
                    </div>
                    {trip.budget ? (
                      <div>
                        <p className="text-xl font-bold" style={{ color: '#2A9D8F' }}>
                          {trip.budget.amount} {trip.budget.currency}
                        </p>
                        <p className="text-sm text-gray-500">
                          {trip.budget.perPerson ? 'per person' : 'total'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Not specified</p>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={18} />
                      <span className="font-medium">Our Travel Period</span>
                    </div>
                    {trip.period ? (
                      <p className="font-medium text-gray-800">{trip.period}</p>
                    ) : (
                      <p className="text-gray-500 italic">Not specified</p>
                    )}
                  </div>
                </div>
              </div>

             

              {/* Itinerary with Map and List */}
              {trip.itinerary && trip.itinerary.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#2A9D8F', color: 'white' }}>
                      <Navigation size={24} />
                    </div>
                    <h3 className="text-2xl font-heading font-bold" style={{ color: '#4C3A7A' }}>
                      Itinerary
                    </h3>
                  </div>
                  
                  {/* Large Map with Hover CTA */}
                  <div className="relative group cursor-pointer mb-8">
                    <Link href={`/trips/${trip.slug || trip.id}/steps`}>
                      <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 min-h-[500px]">
                        <MountSmallOverview trip={trip} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none">
                          <div className="text-center">
                            <p className="text-white text-2xl font-heading font-bold mb-2">
                              View Step-by-Step
                            </p>
                            <p className="text-white/90 text-lg" style={{ fontFamily: 'Lato, sans-serif' }}>
                              Explore the complete itinerary
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Itinerary List */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <ul className="space-y-3 mb-6">
                      {trip.itinerary
                        .filter((item) => item.blockType === 'fullDay')
                        .map((day, index) => {
                          const fullDay = day as any;
                          return (
                            <li key={index} className="flex justify-between items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                              <span className="text-gray-800 font-medium flex-1" style={{ fontFamily: 'Lato, sans-serif' }}>
                                {fullDay.locationName}
                              </span>
                              {fullDay.time && (
                                <span className="text-gray-500 text-sm whitespace-nowrap" style={{ fontFamily: 'Lato, sans-serif' }}>
                                  {fullDay.time}
                                </span>
                              )}
                            </li>
                          );
                        })}
                    </ul>
                    <Link
                      href={`/trips/${trip.slug || trip.id}/steps`}
                      className="block w-full text-center px-6 py-3 text-white font-heading font-bold rounded-xl transition-all duration-300 hover:opacity-90 hover:scale-105"
                      style={{ backgroundColor: '#2A9D8F' }}
                    >
                      View Detailed Step-by-Step Journey
                    </Link>
                  </div>
                </div>
              )}

 {/* Important Preparations */}
              <div className="border-b border-gray-200 pb-8">
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle size={20} style={{ color: '#F57D50' }} />
                  <h3 className="text-xl font-heading font-bold" style={{ color: '#4C3A7A' }}>
                    Before You Go: The Essentials
                  </h3>
                </div>
                {trip.importantPreparations ? (
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg">
                    <RichText
                      content={trip.importantPreparations}
                      className="prose max-w-none text-gray-700"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    />
                  </div>
                ) : (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                    <p className="text-green-700">No special preparations required for this trip</p>
                  </div>
                )}
              </div>

            </div>



            {/* Right Column - Sidebar Information */}
            <div className="lg:col-span-1 space-y-8">
              <div className="sticky top-8 space-y-8">
                {/* Best Time to Visit */}
                {trip.countries && trip.countries.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar size={20} style={{ color: '#2A9D8F' }} />
                      <h3 className="text-xl font-heading font-bold" style={{ color: '#4C3A7A' }}>
                        Best Time to Visit
                      </h3>
                    </div>
                    {trip.countries.map((country, index) => {
                      const countryData = typeof country === 'object' ? country as Country : null;
                      if (!countryData?.bestTimeToVisit || countryData.bestTimeToVisit.length === 0) return null;
                      
                      return (
                        <div key={index} className="mb-4">
                          {(trip.countries?.length ?? 0) > 1 && (
                            <p className="font-semibold text-gray-700 mb-2">{countryData.name}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {countryData.bestTimeToVisit.map((month, i) => (
                              <span key={i} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium border border-teal-200">
                                {month.charAt(0).toUpperCase() + month.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Main Activities */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target size={20} style={{ color: '#2A9D8F' }} />
                    <h3 className="text-xl font-heading font-bold" style={{ color: '#4C3A7A' }}>
                      Main Activities
                    </h3>
                  </div>
                  {trip.activities ? (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <RichText
                        content={trip.activities}
                        className="prose prose-sm max-w-none text-gray-700"
                        style={{ fontFamily: 'Lato, sans-serif' }}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No specific activities documented for this trip</p>
                  )}
                </div>

                {/* Featured Accommodations */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Bed size={20} style={{ color: '#2A9D8F' }} />
                    <h3 className="text-xl font-heading font-bold" style={{ color: '#4C3A7A' }}>
                      Featured Accommodations
                    </h3>
                  </div>
                  {trip.featuredAccommodations && trip.featuredAccommodations.length > 0 ? (
                    <FeaturedAccommodations items={trip.featuredAccommodations} />
                  ) : (
                    <p className="text-gray-500 italic">No featured accommodations for this trip</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Gallery */}
      {trip.highlightsMedia && trip.highlightsMedia.length > 0 && (
        <section className="py-20" style={{ backgroundColor: '#F4F1ED' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#4C3A7A', color: 'white' }}>
                  <Camera size={32} />
                </div>
                <h2 className="text-4xl font-heading font-bold" style={{ color: '#4C3A7A' }}>
                  Trip Highlights
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trip.highlightsMedia
                .sort((a, b) => a.order - b.order)
                .map((highlight, index) => {
                  const media = typeof highlight.media === 'object' ? highlight.media as Media : null;
                  if (!media) return null;

                  return (
                    <div key={index} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                      <div className="relative overflow-hidden h-80">
                        <Image
                          src={getImageUrl(media.url)}
                          alt={highlight.caption || media.alt || `Highlight ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      {highlight.caption && (
                        <div className="p-6">
                          <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Lato, sans-serif' }}>
                            {highlight.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}




    </div>
  );
}

// ClientItinerary has been moved to a dedicated client component file.