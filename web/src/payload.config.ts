// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Trips from './collections/Trips'
import Countries from './collections/Countries'
import Accommodations from './collections/Accommodations'



const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: './components/AdminGraphics#Logo',
        Icon: './components/AdminGraphics#Icon',
      },
      // You can add future custom Nav or Dashboard components here
    },
  },
  // Public base URL of the deployed CMS (used for generating absolute asset URLs)
  // Critical: This MUST match the domain you are visiting the Admin panel on.
  // If you are on roamingroads.nl/admin, this needs to be https://roamingroads.nl
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.roamingroads.nl',

  // Explicitly allowing both the main domain and Vercel Deployment URLs
  cors: [
    'https://roamingroads.nl',
    'https://www.roamingroads.nl',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ].filter(Boolean),
  csrf: [
    'https://roamingroads.nl',
    'https://www.roamingroads.nl',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ].filter(Boolean),
  collections: [Users, Media, Trips, Countries, Accommodations],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // Use Vercel Blob storage for all environments
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
