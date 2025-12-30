import type { Block } from 'payload';
import { transportFields } from '../fields/transportation';

export const FullDay: Block = {
  slug: 'fullDay',
  labels: {
    singular: 'Full Day',
    plural: 'Full Days',
  },
  fields: [
    { name: 'time', type: 'text', label: 'Time Span (e.g., 1 day - 1 night)' },
    { name: 'locationName', type: 'text', label: 'Location Name', required: true },
    {
      name: 'location',
      type: 'point',
      label: 'GPS Coordinates',
      admin: {
        description: 'The exact coordinates for this waypoint. You can use the map picker below to set these coordinates.',
        components: {
          Field: '/components/MapPicker#default',
        }
      }
    },
    { name: 'description', type: 'textarea', label: 'Short description' },
    { name: 'activities', type: 'richText', label: 'Activities and details' },
    {
      name: 'accommodation',
      type: 'relationship',
      relationTo: 'accommodations',
      label: 'Accommodation Used',
      filterOptions: ({ data }) => {
        // Filter by countries present in the parent trip doc
        // 'data' here refers to the document being edited (the Trip)
        const countryIds = data?.countries || [];
        if (Array.isArray(countryIds) && countryIds.length > 0) {
          return {
            country: {
              in: countryIds,
            }
          }
        }
        return true;
      },
    },
    // Transportation & Logistics
    transportFields,

    {
      name: 'gallery',
      label: 'Media Gallery',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ]
    }
  ],
};