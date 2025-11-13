import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import About from './pages/About'

// 动态检测当前部署路径
// 使用相对路径 base 时，从实际加载的资源路径中提取部署路径
function getBasename() {
  // 方法1: 从 document.baseURI 获取（如果设置了 <base> 标签）
  if (document.baseURI) {
    try {
      const baseUrl = new URL(document.baseURI)
      const basePath = baseUrl.pathname.replace(/\/$/, '') || '/'
      if (basePath !== '/') {
        return basePath
      }
    } catch (e) {
      // 忽略错误
    }
  }
  
  // 方法2: 从第一个 script 标签的完整 URL 提取部署路径
  // 这是最可靠的方法，因为 script 标签的路径总是相对于 HTML 文件的
  const scripts = Array.from(document.getElementsByTagName('script'))
  for (let script of scripts) {
    if (script.src) {
      try {
        // 解析 script 的完整 URL
        const scriptUrl = new URL(script.src, window.location.origin)
        const scriptPath = scriptUrl.pathname
        
        // 提取 assets 目录的父目录，这就是部署路径
        // 例如: /myblog/assets/index-xxx.js -> /myblog
        const match = scriptPath.match(/^(.+?)\/assets\/[^/]+$/)
        if (match && match[1]) {
          return match[1] || '/'
        }
        
        // 如果没有 assets 目录，提取到脚本文件所在目录
        const dirMatch = scriptPath.match(/^(.+)\/[^/]+\.js$/)
        if (dirMatch && dirMatch[1]) {
          return dirMatch[1] || '/'
        }
      } catch (e) {
        // 如果 script.src 是相对路径（如 './assets/xxx.js'）
        // 说明部署路径就是当前 HTML 文件所在目录
        if (script.src.startsWith('./') || (!script.src.startsWith('http') && !script.src.startsWith('/'))) {
          const pathname = window.location.pathname
          const htmlDir = pathname.substring(0, pathname.lastIndexOf('/') + 1)
          return htmlDir === '/' ? '/' : htmlDir.slice(0, -1) // 移除末尾斜杠
        }
      }
    }
  }
  
  // 方法3: 从当前页面路径推断（如果包含 index.html）
  const pathname = window.location.pathname
  if (pathname.includes('/index.html')) {
    const dir = pathname.replace(/\/index\.html.*$/, '')
    return dir || '/'
  }
  
  // 默认：部署在根路径
  return '/'
}

function App() {
  // 在开发模式下，使用 Vite 的 BASE_URL
  // 在生产模式下，动态检测部署路径
  const basename = import.meta.env.DEV 
    ? import.meta.env.BASE_URL 
    : getBasename()

  return (
    <BrowserRouter basename={basename}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

