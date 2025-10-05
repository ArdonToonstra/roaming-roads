import type { CollectionConfig } from 'payload';
import { FullDay } from '../blocks/FullDay'; 
import { Waypoint } from '../blocks/WayPoint';

const Trips: CollectionConfig = {
  slug: 'trips',
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
            {
              name: 'characteristics',
              label: 'Characteristics',
              type: 'group',
              fields: [
                {
                  name: 'mainActivities',
                  label: 'Main Trip Activities',
                  type: 'array',
                  minRows: 1,
                  maxRows: 8,
                  fields: [
                    {
                      name: 'activity',
                      type: 'relationship',
                      relationTo: 'activities',
                      required: true,
                    },
                    {
                      name: 'priority',
                      type: 'select',
                      label: 'Activity Priority',
                      options: [
                        { label: 'Primary Highlight', value: 'primary' },
                        { label: 'Secondary Highlight', value: 'secondary' },
                        { label: 'Notable Experience', value: 'notable' },
                      ],
                      defaultValue: 'notable',
                    },
                    {
                      name: 'daysSpent',
                      type: 'number',
                      label: 'Days Spent on Activity',
                      min: 0,
                      admin: {
                        description: 'Approximate days dedicated to this activity',
                      },
                    },
                    {
                      name: 'personalRating',
                      type: 'select',
                      label: 'Personal Rating',
                      options: [
                        { label: '⭐ Poor', value: '1' },
                        { label: '⭐⭐ Fair', value: '2' },
                        { label: '⭐⭐⭐ Good', value: '3' },
                        { label: '⭐⭐⭐⭐ Great', value: '4' },
                        { label: '⭐⭐⭐⭐⭐ Excellent', value: '5' },
                      ],
                    },
                    {
                      name: 'notes',
                      type: 'textarea',
                      label: 'Personal Notes',
                      admin: {
                        description: 'Your experience, tips, or memorable moments with this activity',
                      },
                    },
                  ],
                  admin: {
                    description: 'Select and rank the main activities that defined this trip',
                  },
                },
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
                    {
                      name: 'nights',
                      type: 'number',
                      label: 'Nights Stayed',
                      min: 1,
                      admin: {
                        description: 'How many nights you stayed here during this trip',
                      },
                    },
                    {
                      name: 'tripNotes',
                      type: 'textarea',
                      label: 'Trip-Specific Notes',
                      admin: {
                        description: 'Your personal experience at this accommodation during this specific trip',
                      },
                    },
                  ],
                  admin: {
                    description: 'Select accommodations you want to highlight from this trip',
                  },
                },
              ]
            }
          ],
        },
        {
          label: 'Itinerary',
          fields: [
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
          ]
        },
      ],
    },
  ],
};

export default Trips;