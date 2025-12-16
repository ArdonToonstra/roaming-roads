import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Allow public read access to media
    read: () => true,
    // Restrict other operations to authenticated users
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'mediaType', 'country', 'relatedTrip'],
    group: 'Media',
  },
  upload: {
    // Using Vercel Blob storage via plugin - no local staticDir needed
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'video/*', 'audio/*'],
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt Text',
      type: 'text',
      required: false,
      admin: {
        description: 'Alternative text for accessibility and SEO (describe what\'s in the image)',
      },
    },
    {
      name: 'caption',
      label: 'Caption',
      type: 'text',
      admin: {
        description: 'Optional caption to display with the media',
      },
    },
    {
      name: 'country',
      label: 'Country',
      type: 'relationship',
      relationTo: 'countries',
      admin: {
        description: 'Country where this media was captured',
      },
    },
    {
      name: 'relatedTrip',
      label: 'Related Trip',
      type: 'relationship',
      relationTo: 'trips',
      admin: {
        description: 'Trip this media is associated with',
      },
    },
  ],
};
