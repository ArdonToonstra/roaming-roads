import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  sassOptions: {
    silenceDeprecations: ['legacy-js-api', 'import'],
    quietDeps: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      }
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
