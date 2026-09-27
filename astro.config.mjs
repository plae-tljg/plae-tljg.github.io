import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import { unified } from '@astrojs/markdown-remark'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { SITE_URL, STAGING } from './src/site.mjs'

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,

  // User page (username.github.io) is served from the domain root.
  // For a project page, build with BASE_PATH=/repo-name/
  base: process.env.BASE_PATH || '/',

  trailingSlash: 'ignore',

  markdown: {
    // Astro 7 defaults to the native Sätteri processor; the articles are
    // authored for the remark/rehype pipeline because they carry inline TeX.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { throwOnError: false, strict: false }]],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },

  integrations: [
    sitemap({
      // A staging build should not advertise URLs to crawlers.
      filter: (page) => !STAGING && !page.includes('/read/'),
      i18n: {
        defaultLocale: 'zh',
        locales: { zh: 'zh-CN', en: 'en' },
      },
    }),
  ],
})
