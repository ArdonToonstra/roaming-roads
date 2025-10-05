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
    { name: 'accommodation', type: 'richText', label: 'Accommodation' },
    
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

       // Accommodation Details
    {
      name: 'accommodationDetails',
      label: 'Accommodation Details',
      type: 'group',
      fields: [
        {
          name: 'accommodation',
          type: 'relationship',
          relationTo: 'accommodations',
          label: 'Accommodation Used',
        },
        {
          name: 'alternativeAccommodation',
          type: 'text',
          label: 'Alternative/Unlisted Accommodation',
          admin: {
            description: 'If not in the accommodations database',
          },
        },
        {
          name: 'checkIn',
          type: 'text',
          label: 'Check-in Time',
        },
        {
          name: 'checkOut',
          type: 'text',
          label: 'Check-out Time',
        },
        {
          name: 'roomType',
          type: 'text',
          label: 'Room/Accommodation Type',
          admin: {
            description: 'e.g., "Double room", "Dormitory bed", "Private yurt"',
          },
        },
        {
          name: 'accommodationNotes',
          type: 'richText',
          label: 'Accommodation experience',
          admin: {
            description: 'Your experience, what was included, pros/cons',
          },
        },
      ],
    },
    // Budget & Expenses
    {
      name: 'expenses',
      label: 'Daily Expenses',
      type: 'array',
      fields: [
        {
          name: 'category',
          type: 'select',
          options: [
            { label: 'Accommodation', value: 'accommodation' },
            { label: 'Food & Drinks', value: 'food' },
            { label: 'Transportation', value: 'transportation' },
            { label: 'Activities & Tours', value: 'activities' },
            { label: 'Shopping & Souvenirs', value: 'shopping' },
            { label: 'Fuel', value: 'fuel' },
            { label: 'Entrance Fees', value: 'entrance_fees' },
            { label: 'Tips & Gratuities', value: 'tips' },
            { label: 'Emergency/Medical', value: 'emergency' },
            { label: 'Other', value: 'other' },
          ],
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: 'What was purchased',
        },
        {
          name: 'amount',
          type: 'number',
          label: 'Amount',
          min: 0,
        },
        {
          name: 'currency',
          type: 'text',
          label: 'Currency',
          defaultValue: 'EUR',
          maxLength: 3,
        },
        {
          name: 'exchangeRate',
          type: 'number',
          label: 'Exchange rate to EUR',
          admin: {
            description: 'If paid in local currency',
          },
        },
        {
          name: 'paymentMethod',
          type: 'select',
          options: [
            { label: 'Cash', value: 'cash' },
            { label: 'Card', value: 'card' },
            { label: 'Mobile Payment', value: 'mobile' },
            { label: 'Bank Transfer', value: 'transfer' },
          ],
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