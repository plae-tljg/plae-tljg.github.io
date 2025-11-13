import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 默认使用 '/' 适用于 GitHub Pages 用户页面 (username.github.io)
// 对于子路径部署，可以通过环境变量覆盖：BASE_PATH=/subfolder/ npm run build
// 对于相对路径部署（最大灵活性），使用：BASE_PATH=./ npm run build
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})

