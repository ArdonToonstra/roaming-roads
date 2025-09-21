import { CollectionConfig, Block } from 'payload/types';
import { slugify } from '../utils/slugify';

// First, we define a "Block" for a single day in the itinerary.
// Using a Block is powerful because you could add other types of content later,
// like a "Travel Tip Block" or a "Photo Gallery Block".
const DayStepBlock: Block = {
  slug: 'dayStep',
  interfaceName: 'DayStep', // For generated TypeScript types
  fields: [
    {
      type: 'row', // Organizes fields side-by-side in the admin UI
      fields: [
        {
          name: 'dayNumber',
          type: 'number',
          required: true,
          admin: {
            width: '30%',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Day Title', // e.g., "Arrival in Bishkek & Chong-Kemin"
          admin: {
            width: '70%',
          },
        },
      ],
    },
    {
      name: 'location',
      type: 'point', // Stores [longitude, latitude] for map integration
      label: 'GPS Location (Longitude, Latitude)',
    },
    {
      name: 'activities',
      type: 'richText', // A rich text editor is much more flexible than a simple list
      label: 'Daily Plan & Activities',
    },
    {
      name: 'accommodation',
      type: 'text',
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Daily Photos',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media', // This links to the Media collection below
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
  ],
};

// Now, we define the main "Trips" collection.
export const Trips: CollectionConfig = {
  slug: 'trips',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'country', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => slugify(value || data.title),
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'country',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tripDetails',
      type: 'group',
      label: 'Trip Details',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'startDate',
          type: 'date',
        },
        {
          name: 'endDate',
          type: 'date',
        },
        {
          name: 'budget',
          type: 'number',
        },
        {
          name: 'currency',
          type: 'select',
          options: ['EUR', 'USD', 'GBP'],
          defaultValue: 'EUR',
        },
      ],
    },
    {
      name: 'itinerary',
      label: 'Daily Itinerary',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: [DayStepBlock], // Here we use the DayStepBlock defined above
    },
  ],
};