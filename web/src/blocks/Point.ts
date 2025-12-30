import type { Block } from 'payload';
import { transportFields } from '../fields/transportation';

export const Point: Block = {
  slug: 'point',
  labels: {
    singular: 'Route Point',
    plural: 'Route Points',
  },
  fields: [
    { name: 'locationName', type: 'text', label: 'Point Name', required: true },
    { name: 'description', type: 'textarea', label: 'Description' },
    {
      name: 'location',
      type: 'point',
      label: 'GPS Coordinates',
      admin: {
        description: 'The exact coordinates for this point. You can use the map picker below to set these coordinates.',
        components: {
          Field: '/components/MapPicker#default',
        }
      }
    },
    {
      name: 'pointType',
      label: 'Point Type',
      type: 'select',
      defaultValue: 'intermediate',
      options: [
        { label: 'Intermediate Point', value: 'intermediate' },
        { label: 'Start Point', value: 'start' },
        { label: 'End Point', value: 'end' },
      ],
      admin: {
        description: 'Mark this as a start or end point if it represents the beginning or end of your route.',
      },
    },
    transportFields,
  ],
};
