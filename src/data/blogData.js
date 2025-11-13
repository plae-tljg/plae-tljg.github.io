// 博客文章数据 - 此文件由 scripts/generate-blog-data.js 自动生成
// 请勿手动编辑此文件，编辑 content/posts/*.md 文件后运行 npm run build 重新生成

const blogPosts = [
  {
    "id": "meme-1",
    "title": "示例 Meme",
    "date": "2024-01-04",
    "tags": [
      "meme",
      "图片"
    ],
    "excerpt": "这是一个包含图片的 meme 示例",
    "content": "<p>这是一个包含图片的 meme 示例。</p>\n<p><img src=\"/assets/1756958320938.jpeg\" alt=\"示例图片\"></p>\n<p>你也可以添加多个图片：</p>\n<p><img src=\"/assets/1753240510122.jpeg\" alt=\"示例图片2\"></p>\n<p>或者添加一些文字说明：</p>\n<p>这是一张有趣的图片！</p>\n<p><img src=\"/assets/Screenshot_2025-08-25-18-57-16-918_com.larus.nova.jpg\" alt=\"带说明的图片\" title=\"图片说明\"></p>\n<p>Markdown 支持标准的图片语法，图片路径使用 <code>/assets/</code> 开头的绝对路径，这样在构建后也能正确显示。</p>\n"
  },
  {
    "id": "3",
    "title": "GitHub Pages 部署实践",
    "date": "2024-01-03",
    "tags": [
      "部署",
      "GitHub"
    ],
    "excerpt": "分享如何将 React 项目部署到 GitHub Pages 的实践经验。",
    "content": "<h2>准备工作</h2>\n<p>在部署之前，需要确保项目已经配置好 GitHub Pages 的基础路径。</p>\n<h2>配置 Vite</h2>\n<p>在 <code>vite.config.js</code> 中设置 <code>base</code> 选项：</p>\n<pre><code class=\"language-javascript\">export default defineConfig({\n  base: &#39;/your-repo-name/&#39;,\n  // ... 其他配置\n})\n</code></pre>\n<h2>构建和部署</h2>\n<p>使用以下命令构建项目：</p>\n<pre><code class=\"language-bash\">npm run build\n</code></pre>\n<p>构建完成后，将 <code>dist</code> 目录的内容推送到 <code>gh-pages</code> 分支即可。</p>\n<h2>注意事项</h2>\n<ul>\n<li>确保 base 路径与仓库名称一致</li>\n<li>使用相对路径引用资源</li>\n<li>检查路由配置是否正确</li>\n</ul>\n"
  },
  {
    "id": "2",
    "title": "React 项目搭建指南",
    "date": "2024-01-02",
    "tags": [
      "React",
      "前端"
    ],
    "excerpt": "介绍如何使用 Vite 快速搭建一个现代化的 React 项目。",
    "content": "<h2>为什么选择 Vite</h2>\n<p>Vite 是一个现代化的前端构建工具，具有以下优势：</p>\n<ul>\n<li>极速的开发服务器启动</li>\n<li>快速的热模块替换（HMR）</li>\n<li>优化的生产构建</li>\n<li>丰富的插件生态</li>\n</ul>\n<h2>快速开始</h2>\n<p>使用以下命令创建一个新的 React 项目：</p>\n<pre><code class=\"language-bash\">npm create vite@latest my-app -- --template react\n</code></pre>\n<p>然后安装依赖并启动开发服务器：</p>\n<pre><code class=\"language-bash\">cd my-app\nnpm install\nnpm run dev\n</code></pre>\n<h2>项目结构</h2>\n<p>一个典型的 Vite + React 项目结构如下：</p>\n<ul>\n<li><code>src/</code> - 源代码目录</li>\n<li><code>public/</code> - 静态资源</li>\n<li><code>index.html</code> - 入口 HTML 文件</li>\n<li><code>vite.config.js</code> - Vite 配置文件</li>\n</ul>\n"
  },
  {
    "id": "1",
    "title": "欢迎来到我的博客",
    "date": "2024-01-01",
    "tags": [
      "博客",
      "介绍"
    ],
    "excerpt": "这是我的第一篇博客文章，欢迎来到我的个人博客网站！",
    "content": "<h2>欢迎</h2>\n<p>欢迎来到我的个人博客！这里将分享我的技术学习心得、项目经验以及一些有趣的技术知识。</p>\n<h2>关于这个博客</h2>\n<p>这个博客使用 React + Vite 构建，部署在 GitHub Pages 上。我会定期更新文章，分享我在学习和工作中的收获。</p>\n<h2>未来计划</h2>\n<p>我计划在这里分享：</p>\n<ul>\n<li>前端开发技术</li>\n<li>后端开发经验</li>\n<li>系统运维知识</li>\n<li>学习心得和总结</li>\n</ul>\n<p>感谢你的关注！</p>\n"
  }
]

// 获取所有文章
export function getAllPosts() {
  return blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date))
}

// 获取最近的文章
export function getRecentPosts(count = 5) {
  return getAllPosts().slice(0, count)
}

// 根据 ID 获取文章
export function getPostById(id) {
  return blogPosts.find(post => post.id === id)
}

// 根据标签获取文章
export function getPostsByTag(tag) {
  return blogPosts.filter(post => post.tags && post.tags.includes(tag))
}
