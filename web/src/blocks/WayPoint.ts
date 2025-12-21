import type { Block } from 'payload';
import { transportFields } from '../fields/transportation';

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

    {
      name: 'regionProvince',
      type: 'text',
      label: 'Region/Province',
      admin: {
        description: 'Which region/province this waypoint is in (e.g., "Issyk-Kul Region", "Naryn Province")',
      },
    },

    {
      name: 'connectionType',
      label: 'Connection Type',
      type: 'select',
      defaultValue: 'route',
      options: [
        { label: 'Main Route', value: 'route' },
        { label: 'Side Trip', value: 'side_trip' },
      ],
      admin: {
        description: 'Side trips will be visually displayed as branching off from the previous main stop.',
      },
    },

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