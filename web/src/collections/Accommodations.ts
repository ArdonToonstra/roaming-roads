import type { CollectionConfig } from 'payload';

const Accommodations: CollectionConfig = {
  slug: 'accommodations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type',  'country'],
  },
  access: {
    // Allow public read access for the frontend API to fetch accommodations
    read: () => true,

    // Only authenticated users can create, update, and delete
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      label: 'Accommodation Name',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 200,
      admin: {
        description: 'Full name of the accommodation',
      },
    },
    {
      name: 'type',
      label: 'Accommodation Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Hotel', value: 'hotel' },
        { label: 'Hostel', value: 'hostel' },
        { label: 'Camping/Campground', value: 'camping' },
        { label: 'Guesthouse', value: 'guesthouse' },
        { label: 'Resort', value: 'resort' },
        { label: 'Apartment/Vacation Rental', value: 'apartment' },
        { label: 'Yurt Camp', value: 'yurt' },
        { label: 'Wild Camping', value: 'wild_camping' },
        { label: 'Homestay', value: 'homestay' },
        { label: 'Eco-lodge', value: 'ecolodge' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Type of accommodation',
      },
    },
    {
      name: 'description',
      label: 'Description',
      required: false,
      type: 'richText',
      admin: {
        description: 'Detailed description of the accommodation, amenities, and unique features',
      },
    },
    {
      name: 'country',
      label: 'Country',
      type: 'relationship',
      relationTo: 'countries',
      required: false,
      admin: {
        description: 'Select the country where this accommodation is located',
      },
    },
    {
      name: 'website',
      label: 'Website',
      type: 'text',
      validate: (val: string | null | undefined) => {
        if (val && !/^https?:\/\/.+/.test(val)) {
          return 'Website must be a valid URL starting with http:// or https://';
        }
        return true;
      },
      admin: {
        description: 'Official website URL',
      },
    },
    {
      name: 'media',
      label: 'Media',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: false,
      admin: {
        description: 'Upload photos of this accommodation',
      },
    },
  ],
};

export default Accommodations;