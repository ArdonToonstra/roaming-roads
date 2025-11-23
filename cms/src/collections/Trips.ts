import type { CollectionConfig } from 'payload';
import { FullDay } from '../blocks/FullDay';
import { Waypoint } from '../blocks/WayPoint';
import formatSlug from '../utils/formatSlug';

const Trips: CollectionConfig = {
  slug: 'trips',
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
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'category',
      label: 'Trip Category',
      type: 'select',
      options: [
        { label: 'City Trip', value: 'city_trip' },
        { label: 'Road Trip', value: 'road_trip' },
        { label: 'Backpacking', value: 'backpacking' },
        { label: 'Hiking', value: 'hiking' },
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
              name: 'regionsVisited',
              label: 'Regions/Provinces Visited',
              type: 'array',
              fields: [
                {
                  name: 'regionName',
                  type: 'text',
                  label: 'Region/Province Name',
                  required: true,
                  admin: {
                    description: 'e.g., "Issyk-Kul Region", "Naryn Province", "Chuy Oblast"',
                  },
                },
              ],
              admin: {
                description: 'Track which regions/provinces you visited within the country',
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
        Waypoint
      ]
    },
  ],
};

export default Trips;