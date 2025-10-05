import type { CollectionConfig } from 'payload';
import { FullDay } from '../blocks/FullDay'; // We'll create these blocks next
import { Waypoint } from '../blocks/WayPoint';

const Trips: CollectionConfig = {
  slug: 'trips',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'country', 'status'], // A helpful overview in the list view
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
        position: 'sidebar', // Places this field in the sidebar
      }
    },
    {
      name: 'coverImage',
      label: 'Cover Image',
      type: 'upload',
      relationTo: 'media', // Ensure you have a 'media' collection
      required: true,
      admin: {
        position: 'sidebar',
      }
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
              name: 'period',
              label: 'Travel Period (e.g., June 2025)',
              type: 'text',
            },
            {
              name: 'budget',
              label: 'Budget',
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
                  name: 'activities',
                  label: 'Activities',
                  type: 'relationship',
                  relationTo: 'activities',
                  hasMany: true,
                },
                {
                  name: 'accommodations',
                  label: 'Accommodations',
                  type: 'relationship',
                  relationTo: 'accommodations',
                  hasMany: true,
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
              type: 'blocks', // Blocks are perfect for a flexible itinerary!
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