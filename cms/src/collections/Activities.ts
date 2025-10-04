import { CollectionConfig } from 'payload/types';

const Activities: CollectionConfig = {
  slug: 'activities',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      label: 'Activity Name',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
};

export default Activities;