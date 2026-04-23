import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(process.cwd(), 'dist')
const indexHtml = resolve(dist, 'index.html')
const notFoundHtml = resolve(dist, '404.html')

if (!existsSync(indexHtml)) {
  console.error('gh-pages-assets: dist/index.html not found. Run vite build first.')
  process.exit(1)
}

copyFileSync(indexHtml, notFoundHtml)
console.log('gh-pages-assets: wrote dist/404.html (SPA fallback for GitHub Pages).')
