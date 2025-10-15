import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Suppress Sass deprecation warnings from Payload CMS dependencies
    const rules = webpackConfig.module.rules
    const sassRule = rules.find((rule) => rule.test && rule.test.toString().includes('scss'))
    if (sassRule && sassRule.oneOf) {
      sassRule.oneOf.forEach((rule) => {
        if (rule.use) {
          rule.use.forEach((loader) => {
            if (loader.loader && loader.loader.includes('sass-loader')) {
              loader.options = {
                ...loader.options,
                sassOptions: {
                  ...loader.options?.sassOptions,
                  quietDeps: true, // Suppress deprecation warnings from dependencies
                  silenceDeprecations: ['import'], // Specifically silence @import deprecations
                },
              }
            }
          })
        }
      })
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
