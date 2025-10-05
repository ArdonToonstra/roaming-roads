import type { CollectionConfig } from 'payload';

const Accommodations: CollectionConfig = {
  slug: 'accommodations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'starRating', 'priceRange', 'country'],
  },
  access: {
    read: () => true,
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
      type: 'richText',
      admin: {
        description: 'Detailed description of the accommodation, amenities, and unique features',
      },
    },
    {
      name: 'location',
      label: 'GPS Coordinates',
      type: 'point',
      admin: {
        description: 'Exact location coordinates',
      },
    },
    {
      name: 'address',
      label: 'Address',
      type: 'group',
      fields: [
        {
          name: 'street',
          label: 'Street Address',
          type: 'text',
        },
        {
          name: 'city',
          label: 'City',
          type: 'text',
        },
        {
          name: 'region',
          label: 'State/Province/Region',
          type: 'text',
        },
        {
          name: 'postalCode',
          label: 'Postal Code',
          type: 'text',
        },
        {
          name: 'country',
          label: 'Country',
          type: 'relationship',
          relationTo: 'countries',
          required: true,
          admin: {
            description: 'Select the country where this accommodation is located',
          },
        },
      ],
      admin: {
        description: 'Full address information',
      },
    },
    {
      name: 'contact',
      label: 'Contact Information',
      type: 'group',
      fields: [
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
          name: 'phone',
          label: 'Phone Number',
          type: 'text',
          admin: {
            description: 'Primary phone number with country code',
          },
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          admin: {
            description: 'Contact email address',
          },
        },
      ]
    },
    {
      name: 'priceRange',
      label: 'Price Range',
      type: 'select',
      options: [
        { label: 'Budget (€) - Under €50/night', value: 'budget' },
        { label: 'Mid-range (€€) - €50-150/night', value: 'midrange' },
        { label: 'Luxury (€€€) - €150-300/night', value: 'luxury' },
        { label: 'Ultra-luxury (€€€€) - Over €300/night', value: 'ultra_luxury' },
      ],
      admin: {
        description: 'General price category for this accommodation',
      },
    },
    {
      name: 'quality',
      label: 'Quality Assessment',
      type: 'group',
      fields: [
        {
          name: 'starRating',
          label: 'Star Rating',
          type: 'select',
          options: [
            { label: '1 Star', value: '1' },
            { label: '2 Stars', value: '2' },
            { label: '3 Stars', value: '3' },
            { label: '4 Stars', value: '4' },
            { label: '5 Stars', value: '5' },
            { label: 'Not Rated', value: 'unrated' },
          ],
          admin: {
            description: 'Our star rating or equivalent',
          },
        },
        {
          name: 'cleanliness',
          label: 'Cleanliness Rating',
          type: 'select',
          options: [
            { label: 'Excellent', value: 'excellent' },
            { label: 'Very Good', value: 'very_good' },
            { label: 'Good', value: 'good' },
            { label: 'Fair', value: 'fair' },
            { label: 'Poor', value: 'poor' },
          ],
        },
        {
          name: 'service',
          label: 'Service Quality',
          type: 'select',
          options: [
            { label: 'Excellent', value: 'excellent' },
            { label: 'Very Good', value: 'very_good' },
            { label: 'Good', value: 'good' },
            { label: 'Fair', value: 'fair' },
            { label: 'Poor', value: 'poor' },
          ],
        },
      ],
    },
    {
      name: 'amenities',
      label: 'Amenities',
      type: 'array',
      fields: [
        {
          name: 'amenity',
          label: 'Amenity',
          type: 'select',
          options: [
            { label: 'Free WiFi', value: 'wifi' },
            { label: 'Parking', value: 'parking' },
            { label: 'Restaurant', value: 'restaurant' },
            { label: 'Bar', value: 'bar' },
            { label: 'Pool', value: 'pool' },
            { label: 'Spa', value: 'spa' },
            { label: 'Gym', value: 'gym' },
            { label: 'Laundry', value: 'laundry' },
            { label: 'Kitchen Access', value: 'kitchen' },
            { label: 'Air Conditioning', value: 'ac' },
            { label: 'Heating', value: 'heating' },
            { label: 'Hot Water', value: 'hot_water' },
            { label: 'Breakfast Included', value: 'breakfast' },
            { label: 'Pet Friendly', value: 'pet_friendly' },
            { label: 'Family Friendly', value: 'family_friendly' },
            { label: 'Accessible', value: 'accessible' },
            { label: 'Luggage Storage', value: 'luggage_storage' },
            { label: 'Tour Desk', value: 'tour_desk' },
            { label: 'Other', value: 'other' },
          ],
          required: false,
        },
        {
          name: 'notes',
          label: 'Notes',
          type: 'text',
          admin: {
            description: 'Additional details about this amenity',
          },
        },
      ],
      admin: {
        description: 'Available amenities and services',
      },
    },
    {
      name: 'suitableFor',
      label: 'Suitable For',
      type: 'array',
      fields: [
        {
          name: 'travelerType',
          label: 'Traveler Type',
          type: 'select',
          options: [
            { label: 'Solo Travelers', value: 'solo' },
            { label: 'Couples', value: 'couples' },
            { label: 'Families', value: 'families' },
            { label: 'Groups', value: 'groups' },
            { label: 'Backpackers', value: 'backpackers' },
            { label: 'Business Travelers', value: 'business' },
            { label: 'Adventure Seekers', value: 'adventure' },
            { label: 'Digital Nomads', value: 'digital_nomads' },
          ],
          required: true,
        },
      ],
      admin: {
        description: 'Types of travelers this accommodation is best suited for',
      },
    },
    {
      name: 'personalNotes',
      label: 'Personal Experience',
      type: 'group',
      fields: [
        {
          name: 'stayDate',
          label: 'Date of Stay',
          type: 'date',
          admin: {
            description: 'When you stayed at this accommodation',
          },
        },
        {
          name: 'wouldRecommend',
          label: 'Would Recommend',
          type: 'checkbox',
          admin: {
            description: 'Would you recommend this accommodation to others?',
          },
        },
        {
          name: 'highlights',
          label: 'Highlights',
          type: 'textarea',
          admin: {
            description: 'What you liked most about this place',
          },
        },
        {
          name: 'drawbacks',
          label: 'Drawbacks',
          type: 'textarea',
          admin: {
            description: 'Any issues or things to be aware of',
          },
        },
        {
          name: 'tips',
          label: 'Travel Tips',
          type: 'richText',
          admin: {
            description: 'Helpful tips for future guests',
          },
        },
      ],
    },
  ],
};

export default Accommodations;