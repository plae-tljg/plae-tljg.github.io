/**
 * Repository index configuration.
 *
 * The GitHub API supplies the facts (stars, language, last push, description);
 * this file supplies everything the API cannot know: which accounts belong on
 * the page, how they are labelled, how the repos are grouped, and the handful of
 * hand-written corrections. `scripts/repos.mjs` merges the two into
 * `src/content/repos.json`; a repo that appears on GitHub but not here is
 * reported by `npm run repos:status` and listed under "ungrouped" until it is
 * curated.
 */

/** Accounts shown on /projects/, in display order. */
export const ACCOUNTS = [
  {
    login: 'plae-tljg',
    label: { zh: '主账号', en: 'Main account' },
    note: {
      zh: '长期主线：写作、工具与个人项目。',
      en: 'The long-running main account: writing, tools and personal projects.',
    },
  },
  {
    login: 'LKM-Repo',
    label: { zh: '组织', en: 'Organization' },
    note: {
      zh: '由主账号建立的组织，放模板与实验性项目。',
      en: 'An organization created from the main account, for templates and experiments.',
    },
  },
  {
    login: 'plae-lkm',
    label: { zh: '小项目', en: 'Small projects' },
    note: {
      zh: '较小的工具、玩笑页面与文档站。',
      en: 'Smaller tools, joke pages and documentation sites.',
    },
  },
  {
    login: 'ellkaimu',
    label: { zh: '早期应用', en: 'Earlier apps' },
    note: {
      zh: '较早完成、相对完整的手机应用。',
      en: 'Earlier, more finished mobile apps.',
    },
  },
]

/**
 * Never listed. `fit-lkm` is the company account; angular-practise is private
 * and a practice repo besides.
 */
export const EXCLUDE = ['fit-lkm', 'plae-lkm/angular-practise']

/** Groups, in display order. Every listed repo id must exist on GitHub. */
export const GROUPS = [
  {
    id: 'apps',
    title: { zh: '应用与工具', en: 'Apps & tools' },
    description: {
      zh: '可以直接用的东西：记账、SSH、下载器、文件整理。',
      en: 'Things you can actually use: finance, SSH, downloaders, file tools.',
    },
    repos: [
      'plae-tljg/Finance-Management-App',
      'ellkaimu/Anime-Webview',
      'ellkaimu/SSH-Management-App',
      'ellkaimu/Image_Download_Organizer',
      'ellkaimu/Finance-Management-Web',
      'ellkaimu/Sharedboard',
      'plae-lkm/Finance_Lux_Web',
      'plae-lkm/term-copilot',
      'plae-tljg/MaaFwPhoneAI',
      'ellkaimu/AmazeFileUtilities',
      'ellkaimu/BiliDownload',
      'ellkaimu/FGA',
      'ellkaimu/camera-link',
      'plae-lkm/Dictionary-Anywhere',
    ],
  },
  {
    id: 'ai',
    title: { zh: 'AI 与智能体', en: 'AI & agents' },
    description: {
      zh: '围绕模型、检索与工具调用的实验，也是这个站点背后的思路来源。',
      en: 'Experiments around models, retrieval and tool use — the line of thinking behind this site.',
    },
    repos: [
      'LKM-Repo/domain-ops-agent',
      'LKM-Repo/PIKE-RAG_Verbose',
      'plae-tljg/personal-chatbot-template',
      'plae-tljg/dsh-review',
      'LKM-Repo/Graph_Chatbot',
      'LKM-Repo/AI_Plan_Cost_Web',
      'LKM-Repo/AI_Phishing_Playground',
      'plae-tljg/awesome-dsh-plugin',
      'plae-lkm/dsh-skin',
    ],
  },
  {
    id: 'gpu',
    title: { zh: 'GPU 与移植', en: 'GPU & ports' },
    description: {
      zh: '把语音与推理项目移植到摩尔线程 MUSA 上的工作。',
      en: 'Porting speech and inference projects to MooreThreads MUSA.',
    },
    repos: [
      'LKM-Repo/MUSA_GPU_Monitor',
      'LKM-Repo/GPT-SoVITS-Musa',
      'LKM-Repo/Retrieval-based-Voice-Conversion-WebUI-musa',
      'LKM-Repo/so-vits-svc-musa',
    ],
  },
  {
    id: 'systems',
    title: { zh: '系统与脚本', en: 'Systems & scripts' },
    description: {
      zh: '服务器、终端、硬件与一点底层实现。',
      en: 'Servers, terminals, hardware, and a little low-level work.',
    },
    repos: [
      'LKM-Repo/Asterisk-Stress-Test',
      'plae-lkm/Capture_Running_Terminal',
      'plae-lkm/Match_Ethernet_Cable',
      'plae-lkm/Flush_Youtube_Account',
      'LKM-Repo/lyrics_render',
      'LKM-Repo/Transformer-Implementation-C-Python',
      'plae-lkm/ThreeBodySystemAnimation',
      'plae-lkm/Restart-Router',
      'ellkaimu/maaMines',
    ],
  },
  {
    id: 'docs',
    title: { zh: '文档与站点', en: 'Docs & sites' },
    description: {
      zh: '文档站与这个站点本身。',
      en: 'Documentation sites, and this site itself.',
    },
    repos: [
      'plae-lkm/ubuntu_setup',
      'plae-lkm/Math-Learning-Path',
      'plae-tljg/plae-tljg.github.io',
      'plae-tljg/plae-tljg',
    ],
  },
  {
    id: 'toys',
    title: { zh: '小玩意', en: 'Toys' },
    description: {
      zh: '玩笑、动画与纯粹写着玩的东西。',
      en: 'Jokes, animations, and things written purely for fun.',
    },
    repos: [
      'plae-tljg/designer-is-dad',
      'plae-lkm/Type_As_If_You_Are_Working',
      'plae-lkm/i_love_you_web',
      'plae-lkm/slow_life_web',
      'plae-lkm/yinyang_generator',
    ],
  },
]

/** Shown at the top of /projects/. */
export const FEATURED = [
  'plae-tljg/Finance-Management-App',
  'plae-tljg/MaaFwPhoneAI',
  'plae-tljg/personal-chatbot-template',
  'LKM-Repo/domain-ops-agent',
  'ellkaimu/Anime-Webview',
  'plae-lkm/ubuntu_setup',
]

/**
 * Hand-written overrides. `description` replaces the GitHub one (three repos
 * have none); `note` adds a line only this site can say.
 */
export const OVERRIDES = {
  'plae-tljg/personal-chatbot-template': {
    description: {
      zh: '静态问答机器人的公开模板：知识行 + 浏览器引擎，无服务器、无模型调用。',
      en: 'Public template for a static Q&A bot: knowledge rows plus a browser engine, no server and no model call.',
    },
    note: {
      zh: '本站右下角的问答机器人就是它的一个实例。',
      en: 'The chat widget on this site is one instance of it.',
    },
  },
  'plae-lkm/Finance_Lux_Web': {
    description: {
      zh: '一次富文本与界面设计的练习，记账应用的另一种外观。',
      en: 'A rich-text and interface-design exercise — the finance app with a different look.',
    },
  },
  'plae-lkm/Math-Learning-Path': {
    description: {
      zh: '数学学习路径的原始站点，已经并入本站的文档区。',
      en: 'The original learning-path site, now merged into this site’s docs section.',
    },
    note: {
      zh: '内容已收录：文档 → 数学学习路径。',
      en: 'Content imported: Docs → Math Learning Path.',
    },
  },
  'plae-tljg/MaaFwPhoneAI': {
    note: {
      zh: '基于 MaaFwApp 的深度改造：Android GUI 自动化，MaaFramework 流水线。',
      en: 'A deep rework of MaaFwApp: Android GUI automation on MaaFramework pipelines.',
    },
  },
  'plae-tljg/plae-tljg.github.io': {
    note: {
      zh: '就是你现在看的这个站点：Astro 静态站，内容从写作仓库同步。',
      en: 'The site you are reading: static Astro, content synced from the writing workspace.',
    },
  },
  'plae-lkm/ubuntu_setup': {
    note: {
      // The manual lives here now: the VuePress repo is frozen, and this note
      // should send readers to the copy that gets maintained.
      zh: 'Ubuntu 安装与配置手册的来源仓库。手册已迁移到本站的 [Ubuntu 环境](/zh/docs/ubuntu/) 与 [家庭网络](/zh/docs/homelab/)。',
      en: 'Where the Ubuntu setup manual came from. It is maintained here now, under [Ubuntu](/en/docs/ubuntu/) and [Homelab](/en/docs/homelab/).',
    },
  },
}

/** Repos whose content also lives on this site, with where it landed. */
export const IMPORTED_HERE = {
  'plae-lkm/Math-Learning-Path': '/docs/math-path/',
  'plae-tljg/personal-chatbot-template': '/projects/',
}

/** GitHub API output is stored here (committed, so CI needs no token). */
export const REPOS_SYNC = {
  outFile: 'src/content/repos.json',
  manifest: 'src/content/.repos-manifest.json',
  /** `gh` is used locally; CI only verifies the committed snapshot. */
  perPage: 100,
}
