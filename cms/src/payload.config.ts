// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import React from 'react'

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
        Logo: (() => {
          return React.createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1rem' } },
            React.createElement('img', { src: '/roaming-roads-logo.png', alt: 'Roaming Roads', style: { height: 32, width: 'auto' } }),
            React.createElement('span', null, 'Roaming Roads CMS')
          )
        }) as any,
        Icon: (() => React.createElement('img', { src: '/admin-logo.png', alt: 'RR', style: { height: 24, width: 24, objectFit: 'contain' } })) as any,
      },
      // You can add future custom Nav or Dashboard components here
    },
  },
  // Public base URL of the deployed CMS (used for generating absolute asset URLs)
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  // Build allowed origin arrays only if we actually have values; otherwise let Payload defaults apply
  ...(function(){
    const resolvedServer = process.env.NEXT_PUBLIC_SERVER_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
    const corsList = (process.env.ALLOWED_ORIGINS?.split(',') || []).map(o=>o.trim()).filter(Boolean)
    const csrfList = (process.env.CSRF_ORIGINS?.split(',') || []).map(o=>o.trim()).filter(Boolean)
    if (resolvedServer && !corsList.length) corsList.push(resolvedServer)
    if (resolvedServer && !csrfList.length) csrfList.push(resolvedServer)
    const conf:any = {}
    if (corsList.length) conf.cors = corsList
    if (csrfList.length) conf.csrf = csrfList
    return conf
  })(),
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
