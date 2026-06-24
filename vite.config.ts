import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// For GitHub project Pages use VITE_BASE_PATH=/<repo-name>/ (see .github/workflows).
// Local dev: omit or use `/` so assets load from the dev server root.
const base = process.env.VITE_BASE_PATH?.replace(/\/?$/, '/') || '/'

export default defineConfig({
  base,
  // Listen on IPv4 + IPv6 so Chrome (127.0.0.1) and other tools (localhost → ::1) both work.
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // Prevent browser / Cursor Simple Browser from serving stale bundles in dev.
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    },
  },
  preview: {
    host: true,
    port: 5173,
  },
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
