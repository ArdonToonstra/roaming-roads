import { CollectionConfig } from 'payload/types';

const Countries: CollectionConfig = {
  slug: 'countries',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      label: 'Country Name',
      type: 'text',
      required: true,
      unique: true,
    },
    // You can add more country-specific fields here later
  ],
};

export default Countries;