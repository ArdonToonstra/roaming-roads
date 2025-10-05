import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'mediaType', 'country', 'relatedTrip'],
    group: 'Media',
  },
  upload: {
    staticDir: 'media',
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
      required: true,
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
      name: 'location',
      label: 'Location Information',
      type: 'group',
      fields: [
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
          name: 'locationName',
          label: 'Location Name',
          type: 'text',
          admin: {
            description: 'Name of the place (e.g., "Issyk-Kul Lake, Kyrgyzstan")',
          },
        },
        {
          name: 'gps',
          label: 'GPS Coordinates',
          type: 'point',
          admin: {
            description: 'Where this photo/video was taken',
          },
        }, 
      ],
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
    {
      name: 'mediaType',
      label: 'Media Type',
      type: 'select',
      options: [
        { label: 'Photo', value: 'photo' },
        { label: 'Video', value: 'video' },
        { label: 'Audio', value: 'audio' },
        { label: 'Document', value: 'document' },
      ],
      defaultValue: 'photo',
      admin: {
        description: 'Type of media content',
      },
    },
    {
      name: 'photographyInfo',
      label: 'Photography Information',
      type: 'group',
      admin: {
        condition: (data) => data.mediaType === 'photo',
      },
      fields: [
        {
          name: 'camera',
          label: 'Camera',
          type: 'text',
          admin: {
            description: 'Camera model used',
          },
        },
        {
          name: 'lens',
          label: 'Lens',
          type: 'text',
          admin: {
            description: 'Lens used for the photo',
          },
        },
        {
          name: 'settings',
          label: 'Camera Settings',
          type: 'group',
          fields: [
            {
              name: 'aperture',
              label: 'Aperture (f-stop)',
              type: 'text',
            },
            {
              name: 'shutterSpeed',
              label: 'Shutter Speed',
              type: 'text',
            },
            {
              name: 'iso',
              label: 'ISO',
              type: 'number',
            },
            {
              name: 'focalLength',
              label: 'Focal Length (mm)',
              type: 'number',
            },
          ],
        },
      ],
    },
    {
      name: 'usage',
      label: 'Usage Rights & Permissions',
      type: 'group',
      fields: [
        {
          name: 'photographer',
          label: 'Photographer',
          type: 'text',
          admin: {
            description: 'Name of the photographer (if not you)',
          },
        },
        {
          name: 'licenseType',
          label: 'License Type',
          type: 'select',
          options: [
            { label: 'Own Work', value: 'own' },
            { label: 'Creative Commons', value: 'cc' },
            { label: 'Stock Photo', value: 'stock' },
            { label: 'Permission Granted', value: 'permission' },
            { label: 'Fair Use', value: 'fair-use' },
          ],
          defaultValue: 'own',
        },
        {
          name: 'attribution',
          label: 'Attribution Required',
          type: 'text',
          admin: {
            description: 'Attribution text if required',
          },
        },
      ],
    },
    {
      name: 'seo',
      label: 'SEO Information',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'SEO Title',
          type: 'text',
          admin: {
            description: 'Title for search engines (if different from alt text)',
          },
        },
        {
          name: 'keywords',
          label: 'Keywords',
          type: 'array',
          fields: [
            {
              name: 'keyword',
              type: 'text',
              label: 'Keyword',
            },
          ],
          admin: {
            description: 'Keywords for better searchability',
          },
        },
      ],
    },
    {
      name: 'featured',
      label: 'Featured Media',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark as featured media for homepage or special collections',
      },
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          label: 'Tag',
        },
      ],
      admin: {
        description: 'Tags for organization and filtering (e.g., "sunset", "mountain", "street-food")',
      },
    },
  ],
};
