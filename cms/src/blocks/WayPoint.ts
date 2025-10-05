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
    { name: 'location', type: 'point', label: 'GPS Coordinates' },

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