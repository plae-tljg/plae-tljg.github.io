import type { APIRoute } from 'astro'
import { SITE_URL, STAGING } from '../site.mjs'

export const GET: APIRoute = () => {
  const body = STAGING
    ? [
        '# Staging build: nothing here should be indexed yet.',
        '# Set SITE_STAGING=false (see .github/workflows/deploy.yml) at launch.',
        'User-agent: *',
        'Disallow: /',
        '',
      ].join('\n')
    : ['User-agent: *', 'Allow: /', '', `Sitemap: ${new URL('sitemap-index.xml', SITE_URL).href}`, ''].join(
        '\n'
      )

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
