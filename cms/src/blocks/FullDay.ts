import type { Block } from 'payload';

export const FullDay: Block = {
  slug: 'fullDay',
  labels: {
    singular: 'Full Day',
    plural: 'Full Days',
  },
  fields: [
    { name: 'time', type: 'text', label: 'Time Span (e.g., 1 day - 1 night)' },
    { name: 'locationName', type: 'text', label: 'Location Name', required: true },
    { name: 'location', type: 'point', label: 'GPS Coordinates' },
    { name: 'description', type: 'textarea', label: 'Short description' },
    { name: 'activities', type: 'richText', label: 'Activities and details' },
    { name: 'accommodation', type: 'richText', label: 'Accommodation' },
    
    // --- NEW GALLERY FIELD ADDED BELOW ---
    {
      name: 'gallery',
      label: 'Media Gallery',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media', // Make sure you have a 'media' collection
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Caption',
          localized: true, // Captions can be translated
        },
      ]
    }
  ],
};