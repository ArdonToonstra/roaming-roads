import type { CollectionConfig } from 'payload';
import { FullDay } from '../blocks/FullDay';
import { Waypoint } from '../blocks/WayPoint';

const Trips: CollectionConfig = {
  slug: 'trips',
  access: {
    // Temporarily allow all access for debugging
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'country', 'status'],
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
        beforeValidate: [
          ({ data, operation, originalDoc }) => {
            if (operation === 'create' || operation === 'update') {
              // Only auto-generate slug if it's empty AND we have a title
              if (data?.title && (!data?.slug || data.slug === '')) {
                const newSlug = data.title
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, '') // Remove special characters
                  .replace(/\s+/g, '-') // Replace spaces with hyphens
                  .replace(/-+/g, '-') // Replace multiple hyphens with single
                  .trim();
                
                // Only set the slug if it's different to prevent infinite loops
                if (newSlug !== data.slug && newSlug !== originalDoc?.slug) {
                  data.slug = newSlug;
                }
              }
            }
            return data;
          },
        ],
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
        {
          name: 'caption',
          type: 'text',
          label: 'Highlight Caption',
          admin: {
            description: 'Brief description of why this is a trip highlight',
          },
        },
        {
          name: 'order',
          type: 'number',
          label: 'Display Order',
          defaultValue: 1,
        },
      ],
      admin: {
        position: 'sidebar',
        description: 'Select 3-10 key images that represent the best moments of this trip',
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
              name: 'country',
              label: 'Country',
              type: 'relationship',
              relationTo: 'countries', // Relationship to the Countries collection
              required: true,
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
                {
                  name: 'regionType',
                  type: 'select',
                  label: 'Region Type',
                  options: [
                    { label: 'Province', value: 'province' },
                    { label: 'Region', value: 'region' },
                    { label: 'Oblast', value: 'oblast' },
                    { label: 'State', value: 'state' },
                    { label: 'Territory', value: 'territory' },
                    { label: 'County', value: 'county' },
                    { label: 'District', value: 'district' },
                    { label: 'Other', value: 'other' },
                  ],
                  defaultValue: 'region',
                },
                {
                  name: 'highlights',
                  type: 'textarea',
                  label: 'Regional Highlights',
                  admin: {
                    description: 'Key attractions, activities, or experiences in this region',
                  },
                },
              ],
              admin: {
                description: 'Track which regions/provinces you visited within the country for better geographic organization',
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