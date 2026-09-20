/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  sassOptions: {
    silenceDeprecations: ['legacy-js-api', 'import'],
    quietDeps: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
