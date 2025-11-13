import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { marked } from 'marked'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置 marked 选项
marked.setOptions({
  breaks: true,
  gfm: true,
})

// 读取 posts 目录
const postsDir = path.join(__dirname, '../content/posts')
const outputFile = path.join(__dirname, '../src/data/blogData.js')

// 确保 posts 目录存在
if (!fs.existsSync(postsDir)) {
  console.log('创建 posts 目录:', postsDir)
  fs.mkdirSync(postsDir, { recursive: true })
}

// 读取所有 Markdown 文件
const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'))

const blogPosts = []

files.forEach((file, index) => {
  const filePath = path.join(postsDir, file)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  
  // 解析 frontmatter 和内容
  const { data, content } = matter(fileContent)
  
  // 生成 ID（使用文件名或 frontmatter 中的 id）
  const id = data.id || path.basename(file, '.md')
  
  // 生成摘要（从 frontmatter 或内容中提取）
  let excerpt = data.excerpt
  if (!excerpt && content) {
    // 从内容中提取前 150 个字符作为摘要
    const plainText = content.replace(/[#*`]/g, '').trim()
    excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '')
  }
  
  // 将 Markdown 转换为 HTML
  const htmlContent = marked.parse(content)
  
  // 构建文章对象
  const post = {
    id: id,
    title: data.title || '未命名文章',
    date: data.date || new Date().toISOString().split('T')[0],
    tags: data.tags || [],
    excerpt: excerpt || '',
    content: htmlContent
  }
  
  blogPosts.push(post)
})

// 按日期排序（最新的在前）
blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date))

// 生成 blogData.js 文件
const blogDataContent = `// 博客文章数据 - 此文件由 scripts/generate-blog-data.js 自动生成
// 请勿手动编辑此文件，编辑 content/posts/*.md 文件后运行 npm run build 重新生成

const blogPosts = ${JSON.stringify(blogPosts, null, 2)}

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
`

// 写入文件
fs.writeFileSync(outputFile, blogDataContent, 'utf-8')
console.log(`✅ 成功生成 ${blogPosts.length} 篇博客文章到 ${outputFile}`)

