import type { CollectionConfig } from 'payload';

const Activities: CollectionConfig = {
  slug: 'activities',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'category', 'difficulty', 'duration'],
    group: 'Travel Content',
  },
  fields: [
    {
      name: 'activityType',
      label: 'Activity Type',
      type: 'select',
      required: true,
      options: [
        // Travel Types
        { label: 'Road Trip', value: 'roadtrip' },
        { label: 'City Trip', value: 'citytrip' },
        { label: 'Backpacking', value: 'backpacking' },
        { label: 'Cultural Tour', value: 'cultural-tour' },
        
        // Outdoor Activities
        { label: 'Hiking', value: 'hiking' },
        { label: 'Trekking', value: 'trekking' },
        { label: 'Mountain Climbing', value: 'mountain-climbing' },
        { label: 'Rock Climbing', value: 'rock-climbing' },
        { label: 'Camping', value: 'camping' },
        { label: 'Wildlife Safari', value: 'wildlife-safari' },
        
        // Water Activities
        { label: 'Diving', value: 'diving' },
        { label: 'Snorkeling', value: 'snorkeling' },
        { label: 'Swimming', value: 'swimming' },
        { label: 'Kayaking', value: 'kayaking' },
        { label: 'Rafting', value: 'rafting' },
        { label: 'Surfing', value: 'surfing' },
        { label: 'Fishing', value: 'fishing' },
        
        // Adventure Activities
        { label: 'Horseback Riding', value: 'horseback-riding' },
        { label: 'Cave Exploring', value: 'cave-exploring' },
        { label: 'Zip Lining', value: 'zip-lining' },
        { label: 'Paragliding', value: 'paragliding' },
        { label: 'Skydiving', value: 'skydiving' },
        { label: 'Bungee Jumping', value: 'bungee-jumping' },
        
        // Cultural & Educational
        { label: 'Museum Visit', value: 'museum-visit' },
        { label: 'Historical Site', value: 'historical-site' },
        { label: 'Local Market', value: 'local-market' },
        { label: 'Food Tour', value: 'food-tour' },
        { label: 'Cooking Class', value: 'cooking-class' },
        { label: 'Language Exchange', value: 'language-exchange' },
        
        // Relaxation & Wellness
        { label: 'Spa & Wellness', value: 'spa-wellness' },
        { label: 'Yoga Retreat', value: 'yoga-retreat' },
        { label: 'Beach Relaxation', value: 'beach-relaxation' },
        { label: 'Hot Springs', value: 'hot-springs' },
        
        // Transportation & Logistics
        { label: 'Public Transport', value: 'public-transport' },
        { label: 'Car Rental', value: 'car-rental' },
        { label: 'Flight', value: 'flight' },
        { label: 'Border Crossing', value: 'border-crossing' },
        
        // Other
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Select the type of activity or choose "Other" to specify a custom activity',
      },
    },
    {
      name: 'customActivityName',
      label: 'Custom Activity Name',
      type: 'text',
      admin: {
        condition: (data) => data.activityType === 'other',
        description: 'Specify the custom activity name when "Other" is selected',
      },
      validate: (value: any, { data }: { data: any }) => {
        if (data?.activityType === 'other' && !value) {
          return 'Custom activity name is required when "Other" is selected';
        }
        return true;
      },
    },
    {
      name: 'displayName',
      label: 'Display Name',
      type: 'text',
      admin: {
        description: 'Auto-generated from activity type or custom name, can be overridden',
      },
      hooks: {
        beforeChange: [
          ({ data }: any) => {
            if (!data?.displayName) {
              if (data?.activityType === 'other' && data?.customActivityName) {
                return data.customActivityName;
              } else if (data?.activityType) {
                // Convert kebab-case to title case
                return data.activityType
                  .split('-')
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
              }
            }
            return data?.displayName;
          },
        ],
      },
    },
    {
      name: 'category',
      label: 'Activity Category',
      type: 'select',
      options: [
        { label: 'Travel & Transport', value: 'travel-transport' },
        { label: 'Outdoor & Adventure', value: 'outdoor-adventure' },
        { label: 'Water Sports', value: 'water-sports' },
        { label: 'Cultural & Educational', value: 'cultural-educational' },
        { label: 'Relaxation & Wellness', value: 'relaxation-wellness' },
        { label: 'Extreme Sports', value: 'extreme-sports' },
        { label: 'Food & Dining', value: 'food-dining' },
        { label: 'Shopping & Markets', value: 'shopping-markets' },
        { label: 'Nightlife & Entertainment', value: 'nightlife-entertainment' },
        { label: 'Photography & Sightseeing', value: 'photography-sightseeing' },
      ],
      admin: {
        description: 'Categorize the activity for better organization',
      },
    },
    {
      name: 'difficulty',
      label: 'Difficulty Level',
      type: 'select',
      options: [
        { label: 'Easy - Suitable for everyone', value: 'easy' },
        { label: 'Moderate - Some physical fitness required', value: 'moderate' },
        { label: 'Challenging - Good fitness level needed', value: 'challenging' },
        { label: 'Expert - High fitness and experience required', value: 'expert' },
        { label: 'Not Applicable', value: 'na' },
      ],
      defaultValue: 'easy',
    },
    {
      name: 'duration',
      label: 'Typical Duration',
      type: 'group',
      fields: [
        {
          name: 'value',
          label: 'Duration Value',
          type: 'number',
          min: 0,
        },
        {
          name: 'unit',
          label: 'Duration Unit',
          type: 'select',
          options: [
            { label: 'Minutes', value: 'minutes' },
            { label: 'Hours', value: 'hours' },
            { label: 'Days', value: 'days' },
            { label: 'Weeks', value: 'weeks' },
          ],
          defaultValue: 'hours',
        },
        {
          name: 'note',
          label: 'Duration Note',
          type: 'text',
          admin: {
            description: 'e.g., "Half day", "Full day", "Multi-day trek"',
          },
        },
      ],
    },
    {
      name: 'description',
      label: 'Activity Description',
      type: 'textarea',
      admin: {
        description: 'Brief description of what this activity involves',
      },
    },
    {
      name: 'requirements',
      label: 'Requirements & Prerequisites',
      type: 'group',
      fields: [
        {
          name: 'physicalFitness',
          label: 'Physical Fitness Required',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Basic', value: 'basic' },
            { label: 'Good', value: 'good' },
            { label: 'Excellent', value: 'excellent' },
          ],
          defaultValue: 'none',
        },
        {
          name: 'equipment',
          label: 'Equipment Needed',
          type: 'array',
          fields: [
            {
              name: 'item',
              type: 'text',
              label: 'Equipment Item',
            },
            {
              name: 'essential',
              type: 'checkbox',
              label: 'Essential',
              defaultValue: false,
            },
          ],
        },
        {
          name: 'skills',
          label: 'Required Skills/Experience',
          type: 'textarea',
        },
        {
          name: 'permits',
          label: 'Permits/Licenses Required',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'costInfo',
      label: 'Cost Information',
      type: 'group',
      fields: [
        {
          name: 'priceRange',
          label: 'Price Range',
          type: 'select',
          options: [
            { label: 'Free', value: 'free' },
            { label: 'Budget (€5-25)', value: 'budget' },
            { label: 'Moderate (€25-75)', value: 'moderate' },
            { label: 'Expensive (€75-200)', value: 'expensive' },
            { label: 'Luxury (€200+)', value: 'luxury' },
            { label: 'Variable', value: 'variable' },
          ],
        },
        {
          name: 'averageCost',
          label: 'Average Cost',
          type: 'number',
          min: 0,
        },
        {
          name: 'currency',
          label: 'Currency',
          type: 'text',
          defaultValue: 'EUR',
          maxLength: 3,
        },
        {
          name: 'costNotes',
          label: 'Cost Notes',
          type: 'textarea',
          admin: {
            description: 'Additional cost information, seasonal variations, etc.',
          },
        },
      ],
    },
    {
      name: 'seasonality',
      label: 'Best Season/Time',
      type: 'group',
      fields: [
        {
          name: 'bestMonths',
          label: 'Best Months',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'January', value: '01' },
            { label: 'February', value: '02' },
            { label: 'March', value: '03' },
            { label: 'April', value: '04' },
            { label: 'May', value: '05' },
            { label: 'June', value: '06' },
            { label: 'July', value: '07' },
            { label: 'August', value: '08' },
            { label: 'September', value: '09' },
            { label: 'October', value: '10' },
            { label: 'November', value: '11' },
            { label: 'December', value: '12' },
          ],
        },
        {
          name: 'weatherDependency',
          label: 'Weather Dependency',
          type: 'select',
          options: [
            { label: 'Not weather dependent', value: 'none' },
            { label: 'Slightly weather dependent', value: 'low' },
            { label: 'Moderately weather dependent', value: 'medium' },
            { label: 'Highly weather dependent', value: 'high' },
          ],
          defaultValue: 'low',
        },
        {
          name: 'seasonalNotes',
          label: 'Seasonal Notes',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'safety',
      label: 'Safety Information',
      type: 'group',
      fields: [
        {
          name: 'riskLevel',
          label: 'Risk Level',
          type: 'select',
          options: [
            { label: 'Low Risk', value: 'low' },
            { label: 'Moderate Risk', value: 'moderate' },
            { label: 'High Risk', value: 'high' },
            { label: 'Extreme Risk', value: 'extreme' },
          ],
          defaultValue: 'low',
        },
        {
          name: 'safetyNotes',
          label: 'Safety Notes',
          type: 'textarea',
          admin: {
            description: 'Important safety considerations, warnings, precautions',
          },
        },
        {
          name: 'emergencyInfo',
          label: 'Emergency Information',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'tags',
      label: 'Activity Tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          label: 'Tag',
        },
      ],
      admin: {
        description: 'Tags for easier searching and filtering (e.g., "family-friendly", "solo-travel", "instagram-worthy")',
      },
    },
    {
      name: 'relatedActivities',
      label: 'Related Activities',
      type: 'relationship',
      relationTo: 'activities',
      hasMany: true,
      admin: {
        description: 'Activities that are commonly done together or as alternatives',
      },
    },
  ],
};

export default Activities;