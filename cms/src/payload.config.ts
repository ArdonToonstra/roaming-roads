// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
  },
  // Public base URL of the deployed CMS (used for generating absolute asset URLs)
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  // Allow frontend origins (comma-separated list in ALLOWED_ORIGINS) or default to serverURL
  cors: (process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : [process.env.NEXT_PUBLIC_SERVER_URL || '']).filter(Boolean),
  // CSRF protection origins (usually same as CORS for browser POST forms)
  csrf: (process.env.CSRF_ORIGINS
    ? process.env.CSRF_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : [process.env.NEXT_PUBLIC_SERVER_URL || '']).filter(Boolean),
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
    // storage-adapter-placeholder
  ],
})
