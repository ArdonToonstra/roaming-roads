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
  { name: 'location', type: 'point', label: 'GPS Coordinates', admin: { components: { Field: './components/MapPicker' } } },
    {
      name: 'regionProvince',
      type: 'text',
      label: 'Region/Province',
      admin: {
        description: 'Which region/province this location is in (e.g., "Issyk-Kul Region", "Naryn Province")',
      },
    },
    { name: 'description', type: 'textarea', label: 'Short description' },
    { name: 'activities', type: 'richText', label: 'Activities and details' },
    { name: 'accommodation', type: 'relationship', relationTo: 'accommodations', label: 'Accommodation Used' },
    // Transportation & Logistics
    {
      name: 'transportation',
      label: 'Transportation Details',
      type: 'group',
      fields: [
        {
          name: 'arrivalMethod',
          type: 'select',
          label: 'How we arrived',
          options: [
            { label: 'Walking', value: 'walking' },
            { label: 'Rental Car', value: 'rental_car' },
            { label: 'Public Bus', value: 'public_bus' },
            { label: 'Taxi/Uber', value: 'taxi' },
            { label: 'Train', value: 'train' },
            { label: 'Flight', value: 'flight' },
            { label: 'Boat/Ferry', value: 'boat' },
            { label: 'Bicycle', value: 'bicycle' },
            { label: 'Hitchhiking', value: 'hitchhiking' },
            { label: 'Tour Bus', value: 'tour_bus' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'departureMethod',
          type: 'select',
          label: 'How we left',
          options: [
            { label: 'Walking', value: 'walking' },
            { label: 'Rental Car', value: 'rental_car' },
            { label: 'Public Bus', value: 'public_bus' },
            { label: 'Taxi/Uber', value: 'taxi' },
            { label: 'Train', value: 'train' },
            { label: 'Flight', value: 'flight' },
            { label: 'Boat/Ferry', value: 'boat' },
            { label: 'Bicycle', value: 'bicycle' },
            { label: 'Hitchhiking', value: 'hitchhiking' },
            { label: 'Tour Bus', value: 'tour_bus' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'travelTime',
          type: 'group',
          label: 'Travel time to get here',
          fields: [
            {
              name: 'value',
              type: 'number',
              min: 0,
            },
            {
              name: 'unit',
              type: 'select',
              options: [
                { label: 'Minutes', value: 'minutes' },
                { label: 'Hours', value: 'hours' },
                { label: 'Days', value: 'days' },
              ],
              defaultValue: 'hours',
            },
          ],
        },
        {
          name: 'distance',
          type: 'group',
          label: 'Distance traveled',
          fields: [
            {
              name: 'value',
              type: 'number',
              min: 0,
            },
            {
              name: 'unit',
              type: 'select',
              options: [
                { label: 'Kilometers', value: 'km' },
                { label: 'Miles', value: 'mi' },
              ],
              defaultValue: 'km',
            },
          ],
        },
        {
          name: 'transportationNotes',
          type: 'textarea',
          label: 'Transportation notes',
          admin: {
            description: 'Tips, costs, booking info, etc.',
          },
        },
      ],
    },

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
        {
          name: 'isHighlight',
          type: 'checkbox',
          label: 'Day highlight',
          defaultValue: false,
        },
      ]
    }
  ],
};