import { CollectionConfig, Block } from 'payload/types';
import { slugify } from '../utils/slugify';

// Itinerary step block - matches your new YAML format
const ItineraryStepBlock: Block = {
  slug: 'itineraryStep',
  interfaceName: 'ItineraryStep',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'step',
          type: 'number',
          required: true,
          admin: {
            width: '20%',
          },
        },
        {
          name: 'time',
          type: 'text',
          required: true,
          label: 'Duration',
          admin: {
            width: '30%',
          },
        },
        {
          name: 'locationName',
          type: 'text',
          required: true,
          label: 'Location Name',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'locationGpsLat',
          type: 'number',
          label: 'Latitude',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'locationGpsLon',
          type: 'number',
          label: 'Longitude',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'activities',
      type: 'array',
      label: 'Activities',
      fields: [
        {
          name: 'activity',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'accommodationTip',
      type: 'textarea',
      label: 'Accommodation Tip',
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Photos',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
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

// Main Trips collection matching your new YAML format
export const Trips: CollectionConfig = {
  slug: 'trips',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'country', 'period', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'urlKey',
      type: 'text',
      unique: true,
      index: true,
      required: true,
      label: 'URL Key',
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }: { value?: string; data: any }) => slugify(value || data.title),
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'period',
      type: 'text',
      label: 'Travel Period',
      admin: {
        position: 'sidebar',
      },
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
      name: 'capital',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'languages',
      type: 'array',
      label: 'Languages',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'language',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'currency',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'budget',
      type: 'text',
      label: 'Budget per Person',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'religion',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'travelTime',
      type: 'text',
      label: 'Travel Time from Home',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'bestTravelTime',
      type: 'text',
      label: 'Best Travel Time',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'activities',
      type: 'array',
      label: 'Main Activities',
      fields: [
        {
          name: 'activity',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'accommodations',
      type: 'array',
      label: 'Types of Accommodation',
      fields: [
        {
          name: 'accommodation',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'vegetarianFood',
      type: 'array',
      label: 'Vegetarian Food Notes',
      fields: [
        {
          name: 'note',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Header Image',
    },
    {
      name: 'travelItinerary',
      label: 'Travel Itinerary',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: [ItineraryStepBlock],
    },
  ],
};