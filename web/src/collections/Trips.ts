import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';
import { revalidatePath } from 'next/cache';
import { FullDay } from '../blocks/FullDay';
import { Waypoint } from '../blocks/WayPoint';
import { Point } from '../blocks/Point';
import formatSlug from '../utils/formatSlug';

/**
 * Revalidate all pages that display trip data after a trip is created or updated.
 */
const revalidateTripAfterChange: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload },
}) => {
  // Revalidate the specific trip page
  if (doc.slug) {
    payload.logger.info(`Revalidating /trips/${doc.slug}`);
    revalidatePath(`/trips/${doc.slug}`);
  }

  // If the slug changed, also revalidate the old URL
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    payload.logger.info(`Revalidating old slug /trips/${previousDoc.slug}`);
    revalidatePath(`/trips/${previousDoc.slug}`);
  }

  // Revalidate listing pages
  payload.logger.info('Revalidating trip listing pages');
  revalidatePath('/trips');
  revalidatePath('/adventures');
  revalidatePath('/'); // Homepage shows featured trips

  return doc;
};

/**
 * Revalidate all pages that display trip data after a trip is deleted.
 */
const revalidateTripAfterDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload },
}) => {
  // Revalidate the specific trip page (will now show 404)
  if (doc.slug) {
    payload.logger.info(`Revalidating deleted trip /trips/${doc.slug}`);
    revalidatePath(`/trips/${doc.slug}`);
  }

  // Revalidate listing pages
  payload.logger.info('Revalidating trip listing pages after deletion');
  revalidatePath('/trips');
  revalidatePath('/adventures');
  revalidatePath('/'); // Homepage shows featured trips

  return doc;
};

const Trips: CollectionConfig = {
  slug: 'trips',
  hooks: {
    afterChange: [revalidateTripAfterChange],
    afterDelete: [revalidateTripAfterDelete],
  },
  access: {
    // Public read access; restrict write operations to authenticated users
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'countries', 'status'],
  },
  fields: [
    {
      name: 'title',
      label: 'Trip Title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'URL Slug',
      type: 'text',
      required: true, // Required after migration populates existing data
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly version of the title (e.g., "kyrgyzstan-adventure")',
      },
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Coming Soon', value: 'coming_soon' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
        description: 'Draft: Not visible. Coming Soon: Shows as preview (grayed out, not clickable). Published: Fully available.',
      }
    },
    {
      name: 'category',
      label: 'Trip Category',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'City Trip', value: 'city_trip' },
        { label: 'Road Trip', value: 'road_trip' },
        { label: 'Backpacking', value: 'backpacking' },
        { label: 'Hiking', value: 'hiking' },
        { label: 'Base Camp', value: 'base_camp' },
        { label: 'Diving', value: 'diving' },
        { label: 'Wintersport', value: 'wintersport' },
        { label: 'Culinary', value: 'culinary' },

      ],
      required: false,
      admin: {
        position: 'sidebar',
        description: 'Select the type of trip this represents',
      },
    },
    {
      name: 'coverImage',
      label: 'Cover Image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'highlightsMedia',
      label: 'Trip Highlights Media',
      type: 'array',
      minRows: 0,
      maxRows: 10,
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
      admin: {
        position: 'sidebar',
        description: 'Select up to 10 key images that represent the best moments of this trip',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General Details',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              label: 'Short Description',
            },
            {
              name: 'countries',
              label: 'Countries Visited',
              type: 'relationship',
              relationTo: 'countries', // Relationship to the Countries collection
              hasMany: true,
              required: true,
              minRows: 1,
              admin: {
                description: 'Select all countries visited during this trip (for multi-country adventures)',
              },
            },
            {
              name: 'period',
              label: 'Our Travel Period (e.g., June 2025)',
              type: 'text',
            },
            {
              name: 'budget',
              label: 'Our budget for this trip',
              type: 'group',
              fields: [
                { name: 'amount', type: 'number', label: 'Amount' },
                { name: 'currency', type: 'text', label: 'Currency (e.g., EUR)', defaultValue: 'EUR' },
                { name: 'perPerson', type: 'checkbox', label: 'Per person', defaultValue: true },
              ]
            },
            { name: 'activities', type: 'richText', label: 'Main activities to do in this country/trip.' },
            {
              name: 'featuredAccommodations',
              label: 'Featured Accommodations',
              type: 'array',
              minRows: 0,
              maxRows: 5,
              fields: [
                {
                  name: 'accommodation',
                  type: 'relationship',
                  relationTo: 'accommodations',
                  required: true,
                },
              ],
              admin: {
                description: 'Highlight up to 5 key accommodations used during this trip',
              },
            },
            {
              name: 'importantPreparations',
              label: 'Important Preparations',
              type: 'richText',
              admin: {
                description: 'Key preparations or considerations for this trip (e.g., visas, vaccinations, gear)',
              },
            }
          ]
        }
      ],
    },
    {
      name: 'itinerary',
      label: 'Daily Schedule',
      type: 'blocks',
      minRows: 1,
      blocks: [
        FullDay,
        Waypoint,
        Point
      ]
    },
  ],
};

export default Trips;