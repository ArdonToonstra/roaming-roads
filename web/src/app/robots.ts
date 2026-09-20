import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'Google-Extended',
                    'CCBot',
                    'anthropic-ai',
                    'Claude-Web',
                    'Omgilibot',
                    'Bytespider',
                    'FacebookBot',
                    'Amazonbot'
                ],
                disallow: '/',
            },
        ],
        sitemap: 'https://roamingroads.nl/sitemap.xml',
    }
}
