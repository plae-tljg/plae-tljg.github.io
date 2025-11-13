import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 使用相对路径 './' 以实现最大灵活性
// 构建后的 dist 文件夹可以部署到任何路径，无需重新构建
// 例如：
//   - /var/www/html/ (根路径)
//   - /var/www/html/myblog/ (子路径)
//   - GitHub Pages 用户页面或项目页面
// 如果需要绝对路径，可以通过环境变量覆盖：BASE_PATH=/ npm run build
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})

