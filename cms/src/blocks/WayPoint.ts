import type { Block } from 'payload';

export const Waypoint: Block = {
  slug: 'waypoint',
  labels: {
    singular: 'Waypoint',
    plural: 'Waypoints',
  },
  fields: [
    { name: 'locationName', type: 'text', label: 'Waypoint Name', required: true },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'activities', type: 'richText', label: 'Activities and details' },
    { name: 'location', type: 'point', label: 'GPS Coordinates' },
    {
      name: 'regionProvince',
      type: 'text',
      label: 'Region/Province',
      admin: {
        description: 'Which region/province this waypoint is in (e.g., "Issyk-Kul Region", "Naryn Province")',
      },
    },

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
        {
          name: 'caption',
          type: 'text',
          label: 'Caption',
          localized: true, 
        },
      ]
    }
  ],
  
};