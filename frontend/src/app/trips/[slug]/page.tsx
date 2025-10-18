import { payload } from '@/lib/api';
import Link from 'next/link';
import { MapPin, Calendar, Clock, Camera, DollarSign, ArrowLeft, Navigation } from 'lucide-react';
import { Trip, Media, Country, CmsFullDayBlock, CmsWaypointBlock } from '@/types/payload';
import { notFound } from 'next/navigation';
import { getImageUrl } from '@/lib/images';
// Removed embedded map + itinerary; now lives under /journey subpage
import MountSmallOverview from '@/components/mountSmallOverview';

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
    const response = await payload.getTrip(slugOrId);
    console.log('Trip response:', response);
    return response;
  } catch (error) {
    console.error('Failed to fetch trip:', error);
    console.error('Slug/ID was:', slugOrId);
    return null;
  }
}

function renderRichText(content: unknown): string {
  if (!content) return '';
  
  // Simple rich text renderer - you might want to use a proper rich text renderer
  if (typeof content === 'string') return content;
  if (typeof content === 'object' && content !== null && 'children' in content && Array.isArray((content as {children: unknown[]}).children)) {
    return (content as {children: {text?: string}[]}).children.map((child) => {
      if (child.text) return child.text;
      return '';
    }).join('');
  }
  return '';
}

function ItineraryBlock({ block, index }: { block: CmsFullDayBlock | CmsWaypointBlock; index: number }) {
  const isFullDay = block.blockType === 'fullDay';
  // Safely read coordinates: payload data may omit location or coordinates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawCoords = (block as any).location?.coordinates;
  const hasCoords = Array.isArray(rawCoords) && rawCoords.length >= 2 && typeof rawCoords[0] === 'number' && typeof rawCoords[1] === 'number';
  const coordsText = hasCoords ? `${rawCoords[1].toFixed(4)}, ${rawCoords[0].toFixed(4)}` : null;
  
  return (
  <div id={`day-${index + 1}`} data-day-index={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start gap-4 mb-6">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-white flex-shrink-0"
          style={{ backgroundColor: '#F57D50' }}
        >
          {index + 1}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-heading font-bold mb-2" style={{ color: '#4C3A7A' }}>
            {block.locationName}
          </h3>
          
          <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: '#2A9D8F' }}>
            {block.regionProvince && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{block.regionProvince}</span>
              </div>
            )}
            
            {isFullDay && (block as CmsFullDayBlock).time && (
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{(block as CmsFullDayBlock).time}</span>
              </div>
            )}
            
            {coordsText ? (
              <div className="flex items-center gap-1">
                <Navigation size={16} />
                <span>{coordsText}</span>
              </div>
            ) : (
              // gracefully show nothing or a placeholder if coordinates are missing
              <div className="flex items-center gap-1 opacity-70 text-sm">
                <Navigation size={16} />
                <span>Location unknown</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {block.description && (
        <p className="mb-6 text-lg leading-relaxed" style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
          {block.description}
        </p>
      )}
      
      {block.activities && (
        <div className="mb-6">
          <h4 className="text-lg font-heading font-bold mb-3" style={{ color: '#2A9D8F' }}>
            Activities & Details
          </h4>
          <div className="prose max-w-none" style={{ fontFamily: 'Lato, sans-serif' }}>
            {renderRichText(block.activities)}
          </div>
        </div>
      )}
      
      {/* Transportation info for full days */}
      {isFullDay && (block as CmsFullDayBlock).transportation && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F4F1ED' }}>
          <h4 className="text-sm font-heading font-bold mb-2" style={{ color: '#4C3A7A' }}>
            Transportation
          </h4>
          <div className="text-sm" style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
            {(block as CmsFullDayBlock).transportation?.arrivalMethod && (
              <span>Arrived by: {(block as CmsFullDayBlock).transportation?.arrivalMethod?.replace('_', ' ')}</span>
            )}
          </div>
        </div>
      )}
      
      {/* Budget info for full days */}
      {isFullDay && (block as CmsFullDayBlock).budget && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F4F1ED' }}>
          <h4 className="text-sm font-heading font-bold mb-2" style={{ color: '#4C3A7A' }}>
            Cost
          </h4>
          <div className="flex items-center gap-1 text-sm" style={{ color: '#263238' }}>
            <DollarSign size={16} />
            <span>
              {(block as CmsFullDayBlock).budget?.amount} {(block as CmsFullDayBlock).budget?.currency}
            </span>
          </div>
        </div>
      )}
      
      {/* Gallery */}
      {block.gallery && block.gallery.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-heading font-bold mb-3" style={{ color: '#2A9D8F' }}>
            Photos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {block.gallery.map((item, idx) => {
              const media = typeof item.media === 'object' ? item.media as Media : null;
              if (!media) return null;
              
              return (
                <div key={idx} className="rounded-lg overflow-hidden">
                  <img 
                    src={getImageUrl(media.url)}
                    alt={item.caption || media.alt || `Photo ${idx + 1}`}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {item.caption && (
                    <p className="mt-2 text-sm italic" style={{ color: '#263238' }}>
                      {item.caption}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Tips for full days */}
      {isFullDay && (block as CmsFullDayBlock).tips && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#2A9D8F', color: 'white' }}>
          <h4 className="text-sm font-heading font-bold mb-2">Pro Tips</h4>
          <p className="text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
            {(block as CmsFullDayBlock).tips}
          </p>
        </div>
      )}
    </div>
  );
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
  
  const country = typeof trip.country === 'object' ? trip.country.name : 'Unknown';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F1ED' }}>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white -mt-16">
        <img 
          src={imageUrl}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <Link 
            href="/trips"
            className="inline-flex items-center gap-2 text-white hover:text-[#F57D50] transition-colors duration-200 mb-8"
          >
            <ArrowLeft size={20} />
            <span style={{ fontFamily: 'Lato, sans-serif' }}>Back to Trips</span>
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
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8 mb-12">
            <div className="flex-1">
              <h2 className="text-3xl font-heading font-bold mb-6" style={{ color: '#4C3A7A' }}>
                Trip Overview
              </h2>
            </div>
            <div className="mt-6 lg:mt-0 flex-shrink-0">
              <MountSmallOverview trip={trip} />
            </div>
          </div>
          
          <div className="space-y-12">
          {/* Regions Explored */}
          {trip.regionsVisited && trip.regionsVisited.length > 0 && (
            <div>
              <h2 className="text-2xl font-heading font-bold mb-4" style={{ color: '#4C3A7A' }}>
                Regions Explored
              </h2>
              <ul className="space-y-2">
                {trip.regionsVisited.map((region, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-sm font-medium" style={{ color: '#2A9D8F' }}>
                      {region.regionType}:
                    </span>
                    <div>
                      <span className="font-heading font-bold" style={{ color: '#263238' }}>
                        {region.regionName}
                      </span>
                      {region.highlights && (
                        <span className="text-sm ml-2" style={{ fontFamily: 'Lato, sans-serif', color: '#666' }}>
                          — {region.highlights}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trip Details */}
          <div>
            <h2 className="text-2xl font-heading font-bold mb-4" style={{ color: '#4C3A7A' }}>
              Trip Details
            </h2>
            <div className="space-y-4">
              {trip.budget && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F4F1ED' }}>
                  <h3 className="font-heading font-bold mb-2" style={{ color: '#263238' }}>
                    Budget
                  </h3>
                  <p style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
                    {trip.budget.amount} {trip.budget.currency}
                    {trip.budget.perPerson ? ' per person' : ''}
                  </p>
                </div>
              )}
              {trip.activities && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F4F1ED' }}>
                  <h3 className="font-heading font-bold mb-2" style={{ color: '#263238' }}>
                    Main Activities
                  </h3>
                  <div style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
                    {renderRichText(trip.activities)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* Highlights Gallery */}
      {trip.highlightsMedia && trip.highlightsMedia.length > 0 && (
        <section className="py-16" style={{ backgroundColor: '#F4F1ED' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-heading font-bold text-center mb-12" style={{ color: '#4C3A7A' }}>
              Trip Highlights
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trip.highlightsMedia
                .sort((a, b) => a.order - b.order)
                .map((highlight, index) => {
                  const media = typeof highlight.media === 'object' ? highlight.media as Media : null;
                  if (!media) return null;
                  
                  return (
                    <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                      <img 
                        src={getImageUrl(media.url)}
                        alt={highlight.caption || media.alt || `Highlight ${index + 1}`}
                        className="w-full h-64 object-cover"
                      />
                      {highlight.caption && (
                        <div className="p-4">
                          <p style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
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

            {/* Steps link instead of inline map/itinerary */}
            {trip.itinerary && trip.itinerary.length > 0 && (
              <section className="bg-white py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h2 className="text-3xl font-heading font-bold mb-4" style={{ color: '#4C3A7A' }}>Steps Map & Itinerary</h2>
                  <p className="mb-8 text-lg" style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
                    Explore the full day-by-day route and interactive map.
                  </p>
                  <Link href={`/trips/${trip.slug || trip.id}/steps`} className="inline-flex items-center gap-2 px-8 py-4 text-white font-heading font-bold rounded-full transition-colors duration-300 hover:opacity-90" style={{ backgroundColor: '#2A9D8F' }}>
                    View Steps Details
                  </Link>
                </div>
              </section>
            )}

   
    </div>
  );
}

// ClientItinerary has been moved to a dedicated client component file.