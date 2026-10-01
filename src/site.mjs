/**
 * Single source of truth for site identity, locales, series registry,
 * and the content-sync convention.
 *
 * Edit this file to change the site title, taglines, series metadata,
 * or where `npm run content:sync` reads articles from.
 */

/** Public URL. Change to the real domain at launch, e.g. https://plae.dev */
export const SITE_URL = process.env.SITE_URL || 'https://plae-tljg.github.io'

/**
 * Staging mode: while true the site ships `noindex` + a disallow-all
 * robots.txt, so it can be used as a private staging area without being
 * picked up by search engines. Set SITE_STAGING=false at launch.
 */
export const STAGING = process.env.SITE_STAGING ? process.env.SITE_STAGING !== 'false' : true

export const SITE = {
  url: SITE_URL,
  staging: STAGING,
  author: 'LKM',
  github: 'https://github.com/plae-tljg',
  title: {
    zh: 'LKM 的个人主页',
    en: 'LKM — Personal Site',
  },
  tagline: {
    zh: '写数学与 AI 系统：把结构交给 AI 维护，把执行留给确定性引擎。',
    en: 'Notes on mathematics and AI systems. Let AI maintain the structure; let deterministic engines execute.',
  },
  description: {
    zh: '数学、AI 系统与可维护项目结构的长期写作。',
    en: 'Long-form writing on mathematics, AI systems, and maintainable project structure.',
  },
}

/** Supported locales. Add a locale here and it appears in the language switcher. */
export const LOCALES = [
  { code: 'zh', label: '中文', short: '中', htmlLang: 'zh-CN', ogLocale: 'zh_CN' },
  { code: 'en', label: 'English', short: 'EN', htmlLang: 'en', ogLocale: 'en_US' },
]

export const DEFAULT_LOCALE = 'zh'

export const UI = {
  zh: {
    home: '首页',
    writing: '文章',
    docs: '文档',
    projects: '项目',
    archive: '索引',
    about: '关于',
    series: '系列',
    path: '路径',
    notes: '旧文',
    latest: '最近更新',
    allSeries: '全部系列',
    allPosts: '全部文章',
    allWriting: '全部文章',
    allDocs: '全部文档',
    allProjects: '全部项目',
    viewAll: '查看全部',
    sectionWriting: '成熟的写作，按系列组织',
    sectionDocs: '教程、学习路径与旧文档',
    sectionProjects: '做过的东西：应用、工具与实验',
    repoForks: '含 fork 与移植',
    repoStars: '星标',
    repoUpdated: '更新于',
    repoDemo: '演示',
    repoSource: '源码',
    repoFork: 'fork',
    repoImported: '已收录本站',
    repoNote: '数据来自 GitHub API 快照，见 scripts/repos.mjs。',
    readMore: '阅读全文',
    readAll: '连续阅读整个系列',
    part: '篇',
    posts: '篇',
    minRead: '分钟',
    next: '下一篇',
    prev: '上一篇',
    inSeries: '本系列',
    toc: '目录',
    tags: '标签',
    published: '发布于',
    updated: '更新于',
    original: '中文原文',
    translation: '英文版',
    noTranslation: '此文暂无英文版',
    preview: '草稿预览',
    previewNote: '这篇文章尚未标记为 ready，仅在预览模式下显示。',
    backHome: '返回首页',
    notFound: '页面不存在',
    notFoundNote: '这个地址没有对应的内容。',
    emptyState: '还没有已发布的文章。',
    emptyStateHint: '在写作仓库里把文章状态改成 ready，然后运行 npm run content:sync。',
    rss: 'RSS',
    languageSwitch: '语言',
    theme: '主题',
    seriesOngoing: '连载中',
    seriesClosed: '已完结',
    seriesBilingual: '中英双语',
    seriesZhOnly: '中文',
    photoCredit: '图片',
    credits: '图片来源',
    photoBy: '摄影',
    inThisStage: '本阶段内容',
    stage: '阶段',
    startHere: '开始学习',
    browseStages: '全部阶段',
    footerNote: '本页内容为作者个人观点。',
    chatOpen: '问问我的作品',
    chatClose: '收起',
    chatChats: '对话',
    chatNew: '新对话',
    chatBack: '返回对话',
    chatAsk: '问一个关于作品的问题…',
    chatSend: '提问',
    chatYou: '你',
    chatDelete: '删除这个对话',
    chatNoChats: '还没有对话',
    chatEmptyNote: '答案来自表格，不经过模型；不知道的会直接说不知道。',
    chatDragHint: '按住可拖动',
    chatLoading: '正在加载…',
    chatFailed: '加载失败',
    chatRetry: '重试',
    chatTokens: '0 tokens',
    chatSelfCheck: '在这里跑一遍冻结用例',
    chatStatic: '静态页面 · 无需服务器',
    chatRefs: '指代',
    chatFromTables: '来自表格',
    chatRefused: '已记录这次提问',
    chatFuzzy: '近似匹配',
    chatTry: '试试',
    chatLangNote:
      '中英文都能问：每条问句都有两种语言的入口。答案本身是英文写成的（一个问句形状只对应一句答案）。',
  },
  en: {
    home: 'Home',
    writing: 'Writing',
    docs: 'Docs',
    projects: 'Projects',
    archive: 'Index',
    about: 'About',
    series: 'Series',
    path: 'Path',
    notes: 'Notes',
    latest: 'Recently updated',
    allSeries: 'All series',
    allPosts: 'All posts',
    allWriting: 'All writing',
    allDocs: 'All docs',
    allProjects: 'All projects',
    viewAll: 'View all',
    sectionWriting: 'Longer pieces, grouped into series',
    sectionDocs: 'Guides, learning paths and older documentation',
    sectionProjects: 'Things I have built: apps, tools and experiments',
    repoForks: 'Includes forks and ports',
    repoStars: 'stars',
    repoUpdated: 'updated',
    repoDemo: 'Demo',
    repoSource: 'Source',
    repoFork: 'fork',
    repoImported: 'on this site',
    repoNote: 'Snapshot of the GitHub API — see scripts/repos.mjs.',
    readMore: 'Read more',
    readAll: 'Read the whole series',
    part: 'Part',
    posts: 'posts',
    minRead: 'min read',
    next: 'Next',
    prev: 'Previous',
    inSeries: 'In this series',
    toc: 'Contents',
    tags: 'Tags',
    published: 'Published',
    updated: 'Updated',
    original: 'Chinese original',
    translation: 'English version',
    noTranslation: 'No English version yet',
    preview: 'Draft preview',
    previewNote: 'This article is not marked ready yet and only shows in preview mode.',
    backHome: 'Back home',
    notFound: 'Page not found',
    notFoundNote: 'Nothing lives at this address.',
    emptyState: 'No published articles yet.',
    emptyStateHint: 'Set an article to ready in the writing repo, then run npm run content:sync.',
    rss: 'RSS',
    languageSwitch: 'Language',
    theme: 'Theme',
    seriesOngoing: 'Ongoing',
    seriesClosed: 'Complete',
    seriesBilingual: 'Bilingual',
    seriesZhOnly: 'Chinese',
    photoCredit: 'Photo',
    credits: 'Image credits',
    photoBy: 'by',
    inThisStage: 'In this stage',
    stage: 'Stage',
    startHere: 'Start here',
    browseStages: 'All stages',
    footerNote: 'Opinions are the author’s own.',
    chatOpen: 'Ask about my work',
    chatClose: 'Close',
    chatChats: 'Chats',
    chatNew: 'New chat',
    chatBack: 'Back to the chat',
    chatAsk: 'Ask something about the work…',
    chatSend: 'Ask',
    chatYou: 'You',
    chatDelete: 'Delete this chat',
    chatNoChats: 'No chats yet',
    chatEmptyNote: 'Answers come from tables, not a model. What it does not know, it refuses.',
    chatDragHint: 'hold to drag',
    chatLoading: 'Loading…',
    chatFailed: 'Could not load the bot',
    chatRetry: 'Retry',
    chatTokens: '0 tokens',
    chatSelfCheck: 'run the frozen cases here',
    chatStatic: 'static page · no server',
    chatRefs: 'refs',
    chatFromTables: 'from tables',
    chatRefused: 'question recorded',
    chatFuzzy: 'near match',
    chatTry: 'try',
    chatLangNote:
      'Chinese and English both work — every row carries phrasings in both. The answers themselves are written in English.',
  },
}

/**
 * Series registry.
 *
 * `id`      stable URL segment: /zh/series/<id>/
 * `aliases` raw `series:` values found in source drafts, mapped to this entry
 * `order`   display order on the series index (lower first)
 */
export const SERIES = [
  {
    id: 'why-ai-takes-over-math',
    order: 1,
    title: {
      zh: '为什么两年前我就知道 AI 会接管数学',
      en: 'Why I Already Knew AI Would Take Over Mathematics',
    },
    description: {
      zh: '一个封闭的合集：从数学学习的经验出发，说明哪一层可以被机器接管，哪一层不能。',
      en: 'A closed arc: starting from how mathematics is learned, which layer machines can take over and which they cannot.',
    },
    state: 'closed',
    languages: ['zh'],
    /** Key into IMAGE_CREDITS for the cover photo. */
    cover: 'series-math',
    /** Where `content new --series` puts a new draft. */
    dir: 'drafts/v2',
    aliases: [
      'Why I Already Knew AI Would Take Over Mathematics',
      'why-ai-takes-over-math',
    ],
  },
  {
    id: 'ai-era-programming-structure',
    order: 2,
    title: {
      zh: 'AI 时代的编程结构',
      en: 'Programming Structure in the AI Era',
    },
    description: {
      zh: '三篇正文加一篇附录：当 AI 能大量生成和修改代码时，系统靠什么结构让改动可执行、可验证、可回滚、可累积。',
      en: 'Three articles and an appendix: what structure lets a system absorb — executably, verifiably, reversibly — the changes an AI can now generate in bulk.',
    },
    state: 'ongoing',
    languages: ['zh', 'en'],
    /** Key into IMAGE_CREDITS for the cover photo. */
    cover: 'series-systems',
    /** Where `content new --series` puts a new draft. */
    dir: 'seasons/02-systems',
    aliases: [
      'AI 时代的编程结构',
      'AI-Era Programming Structure',
      'Programming Structure in the AI Era',
      'ai-era-programming-structure',
      'AI-Maintainable Systems',
      'ai-maintainable-systems',
      'AI 可维护的系统',
    ],
  },
]

/**
 * Guide/track registry.
 *
 * A track is a *tree*, not a linear series: stages → pages. Articles that carry
 * `track:` in their frontmatter are synced into the paths collection and routed
 * to /<lang>/path/<stage>/<slug>/ instead of /<lang>/posts/<slug>/.
 *
 * `slug: "index"` + `stageIndex: true` marks a page that is rendered *at* the
 * stage URL, with the stage's other pages listed underneath.
 */
export const TRACKS = [
  {
    id: 'math-path',
    order: 1,
    title: { zh: '数学学习路径', en: 'Math Learning Path' },
    subtitle: {
      zh: '这跟坐牢有什么区别吗',
      en: 'Monad Collisions, Beauty of Mathematics',
    },
    description: {
      zh: '从入门到大学数学的一条路径。每个科目给出概念清单，以及一条可以照着走的推进顺序。',
      en: 'A route from the basics into university mathematics: each subject gets a concept list and an order to work through.',
    },
    state: 'ongoing',
    languages: ['zh', 'en'],
    stages: [
      {
        id: 'getting-started',
        title: { zh: '入门指南', en: 'Getting Started' },
        description: { zh: '从哪里开始，以及高中阶段该读什么。', en: 'Where to start, and what to read first.' },
      },
      {
        id: 'university',
        title: { zh: '大学数学', en: 'University Math' },
        description: {
          zh: '从基础到抽象，逐步深入：集合论、数理逻辑、数论、群论、数学分析、拓扑学。',
          en: 'From foundations to abstraction: set theory, logic, number theory, group theory, analysis, topology.',
        },
      },
    ],
    /** Shown on the landing page. */
    hero: {
      image: 'path-hero',
      pets: ['pet01.gif', 'pet02.gif', 'pet03.gif', 'pet04.gif', 'pet05.gif'],
    },
  },
]

/**
 * Photo credits. Anything not in the public domain is attributed on the page
 * where it appears (see src/components/SeriesCard.astro and the series header)
 * and listed in CREDITS.md.
 */
export const IMAGE_CREDITS = {
  'hero-formulas': {
    title: 'Pure mathematics formulæ blackboard',
    author: 'Wallpoper',
    license: 'Public domain',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    source:
      'https://commons.wikimedia.org/wiki/File:Pure-mathematics-formul%C3%A6-blackboard.jpg',
  },
  'series-math': {
    title: "Einstein's theory of relative blackboard",
    author: 'thepatrick',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    source: 'https://www.flickr.com/photos/93529274@N00/1508924823',
  },
  'series-systems': {
    title: 'edifício acal, são paulo, april 2006',
    author: 'seier+seier',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    source: 'https://www.flickr.com/photos/94852245@N00/866397659',
  },
}

/**
 * Content-sync convention.
 *
 * Articles stay in the private writing workspace and are copied here by
 * `npm run content:sync`. Only files whose `status` is listed in
 * `publishStatuses` are published; `--preview` additionally pulls
 * `previewStatuses` in as clearly-marked draft previews.
 */
export const CONTENT_SYNC = {
  /** Writing workspace root. Override with CONTENT_SOURCE=/path/to/workspace */
  source: process.env.CONTENT_SOURCE || '~/Music/blogs',
  /** Directories scanned for content, relative to `source`. */
  include: ['seasons', 'paths'],
  /** Extra directories to skip while walking. */
  excludeDirs: ['v1', '_old', 'node_modules', '.git'],
  /** Non-article markdown that should never be published. */
  ignoreFiles: [
    'README.md',
    'AGENTS.md',
    'CONTENT_PLAN.md',
    'ARTICLE_TEMPLATE.md',
    'collection-plan.md',
    'plan-proposal.md',
    'research-notes*.md',
    'REVIEW-*.md',
  ],
  /** Files starting with this prefix are drafts the author retired. */
  ignorePrefix: '_',
  /** Only these statuses are published by a plain `sync`. */
  publishStatuses: ['ready'],
  /** Additional statuses published by `sync --preview` (marked as preview). */
  previewStatuses: ['zh draft', 'en draft', 'tech review', 'visuals', 'staging'],
  /** Statuses that count as "in progress" for `content status`. */
  workingStatuses: ['idea', 'outline', 'zh draft', 'en draft', 'tech review', 'visuals', 'staging'],
  /** Assumed language when a file has no `.zh.md` / `.en.md` suffix. */
  defaultLang: 'zh',
  /** Where synced articles are written, relative to the repo root. */
  outputDir: 'src/content/posts',
  /** Where synced guide/track pages are written (frontmatter `track:`). */
  pathsDir: 'src/content/paths',
  /** Where copied images are written, relative to the repo root. */
  assetDir: 'public/content',
  /** URL prefix for copied images. */
  assetUrlBase: '/content',
  /** Manifest recording what sync produced (used by `content verify`). */
  manifest: 'src/content/.sync-manifest.json',
}

/**
 * Chatbot-sync convention.
 *
 * The "ask about my work" bot is compiled in a separate repository
 * (`personal-chatbots`): its rows are data, so `pc export --bundle` writes the
 * whole knowledge base as JSON plus the browser engine that reads it.
 * `npm run bot:sync` runs that compiler and copies the result into
 * `public/bot/`; `npm run bot:verify` (CI) fails if the committed bundle was
 * edited by hand. Full walkthrough: docs/CHATBOT.md
 */
export const BOT_SYNC = {
  /** Compiler repository root. Override with BOT_SOURCE=/path/to/repo */
  source: process.env.BOT_SOURCE || '~/Music/personal-chatbots',
  /** Where the compiled artifacts land, relative to the repo root. */
  outDir: 'public/bot',
  /** The files the compiler writes — the bundle, in full. */
  files: ['data.json', 'engine.js', 'CONTRACT.md'],
  /** Manifest recording what sync produced (used by `bot verify`). */
  manifest: 'src/content/.bot-manifest.json',
  /**
   * Python that runs the compiler in `source`. Empty means: use
   * `<source>/.venv/bin/python` if it exists, else `python3`.
   */
  python: process.env.BOT_PYTHON || '',
  /** Launcher label, shown before the engine has loaded. */
  label: {
    zh: '问问我的作品',
    en: 'Ask about my work',
  },
  /**
   * Questions the empty state offers. These are the ones the tables actually
   * answer — a click must never land on a refusal. The knowledge rows are
   * English, which is why both locales show the same list.
   */
  samples: [
    '你的网站是什么',
    'what projects does LKM have?',
    '最近在做什么',
    'what is dsh-review about?',
    '你会哪些编程语言',
    '怎么联系你',
  ],
}
