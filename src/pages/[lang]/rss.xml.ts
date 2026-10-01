import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { SITE, type LocaleCode } from '../../site.mjs'
import { localePaths, articlePath } from '../../lib/url'
import { getPosts } from '../../lib/content'

export function getStaticPaths() {
  return localePaths()
}

export const GET: APIRoute = async (context) => {
  const lang = context.params.lang as LocaleCode
  // Preview articles stay out of the feed until they are marked ready.
  const posts = (await getPosts(lang)).filter((post) => post.data.status === 'ready')

  return rss({
    title: SITE.title[lang],
    description: SITE.description[lang],
    site: context.site ?? SITE.url,
    trailingSlash: true,
    customData: `<language>${lang === 'zh' ? 'zh-cn' : 'en'}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: articlePath(lang, post.data.slug),
      categories: post.data.tags,
    })),
  })
}
