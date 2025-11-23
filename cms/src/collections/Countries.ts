import type { CollectionConfig } from 'payload';

const Countries: CollectionConfig = {
  slug: 'countries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'countryCode', 'capital', 'currency'],
  },
  access: {
    // Allow public read access for the frontend API to fetch countries
    read: () => true,
    
    // Only authenticated users can create, update, and delete
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      label: 'Country Name',
      type: 'text',
      required: true,
      unique: true,
      minLength: 2,
      maxLength: 100,
      admin: {
        description: 'Official country name',
      },
    },
    {
      name: 'countryCode',
      label: 'Country Code (3 letter)',
      type: 'text',
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 3,
      validate: (val: string | null | undefined) => {
        if (val && !/^[A-Z]{3}$/.test(val)) {
          return 'Country code must be exactly 3 uppercase letters';
        }
        return true;
      },
      admin: {
        description: 'ISO 3166-1 alpha-3 country code (e.g., USA, GBR, KGZ)',
        placeholder: 'KGZ',
      },
    },
    {
      name: 'continent',
      label: 'Continent',
      type: 'select',
      options: [
        { label: 'Africa', value: 'africa' },
        { label: 'Antarctica', value: 'antarctica' },
        { label: 'Asia', value: 'asia' },
        { label: 'Europe', value: 'europe' },
        { label: 'North America', value: 'north_america' },
        { label: 'Oceania', value: 'oceania' },
        { label: 'South America', value: 'south_america' },
      ],
      required: false,
      admin: {
        description: 'Select the continent this country belongs to',
      },
    },
    {
      name: 'capital',
      label: 'Capital City',
      type: 'text',
      required: true,
      minLength: 1,
      maxLength: 100,
      admin: {
        description: 'Official capital city name',
      },
    },
    {
      name: 'currency',
      label: 'Currency Code',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 3,
      validate: (val: string | null | undefined) => {
        if (val && !/^[A-Z]{3}$/.test(val)) {
          return 'Currency code must be exactly 3 uppercase letters';
        }
        return true;
      },
      admin: {
        description: 'ISO 4217 currency code (e.g., USD, EUR, KGS)',
        placeholder: 'KGS',
      },
    },
    {
      name: 'currencyName',
      label: 'Currency Name',
      type: 'text',
      admin: {
        description: 'Full currency name (e.g., US Dollar, Euro, Kyrgyzstani Som)',
      },
    },
    {
      name: 'officialLanguages',
      label: 'Official Languages',
      type: 'array',
      fields: [
        {
          name: 'language',
          label: 'Language',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'List of official languages',
      },
    },
    {
      name: 'mainReligion',
      label: 'Main Religion',
      type: 'select',
      options: [
        { label: 'Christianity', value: 'christianity' },
        { label: 'Catholicism', value: 'catholicism' },
        { label: 'Islam', value: 'islam' },
        { label: 'Judaism', value: 'judaism' },
        { label: 'Hinduism', value: 'hinduism' },
        { label: 'Buddhism', value: 'buddhism' },
        { label: 'Sikhism', value: 'sikhism' },
        { label: 'Secular/Non-religious', value: 'secular' },
        { label: 'Mixed/Multiple', value: 'mixed' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Primary or most practiced religion in the country',
      },
    },
    {
      name: 'mainReligionPercentage',
      label: 'Main Religion Percentage',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Percentage of population practicing the main religion',
        step: 0.1,
      },
    },
    {
      name: 'visaRequirements',
      label: 'Visa Requirements',
      type: 'richText',
      admin: {
        description: 'General visa requirements and travel information',
      },
    },
    {
      name: 'safetyLevel',
      label: 'Safety Level',
      type: 'select',
      options: [
        { label: 'Very Safe', value: 'very_safe' },
        { label: 'Safe', value: 'safe' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Caution Advised', value: 'caution' },
        { label: 'High Risk', value: 'high_risk' },
      ],
      admin: {
        description: 'General safety assessment for travelers',
      },
    },
    {
      name: 'bestTimeToVisit',
      label: 'Best Time to Visit',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'January', value: 'january' },
        { label: 'February', value: 'february' },
        { label: 'March', value: 'march' },
        { label: 'April', value: 'april' },
        { label: 'May', value: 'may' },
        { label: 'June', value: 'june' },
        { label: 'July', value: 'july' },
        { label: 'August', value: 'august' },
        { label: 'September', value: 'september' },
        { label: 'October', value: 'october' },
        { label: 'November', value: 'november' },
        { label: 'December', value: 'december' },
      ],
      admin: {
        description: 'Select the recommended months to visit this country',
      },
    },
    { 
      name: 'travelTimeFromBrussels',
      label: 'Travel Time from Brussels (hours)',
      type: 'number',
      min: 0,
      admin: {
        description: 'Approximate flight time from Brussels to the country in hours',
      },
    },
  ],
};

export default Countries;