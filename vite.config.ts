import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { componentTagger } from "lovable-tagger"
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: '/',
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      mode === 'production' && visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "::",
      port: 8080,
      open: true
    },
    build: {
      chunkSizeWarningLimit: 3000,
      target: 'es2020',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: false,
          pure_funcs: [],
          passes: 1,
          global_defs: {
            '@@process.env.NODE_ENV': '"production"'
          }
        },
        mangle: false
      },
      cssCodeSplit: true,
      cssMinify: false,
      rollupOptions: {
        output: {
          format: 'es',
          entryFileNames: 'assets/[name]-[hash:8].js',
          chunkFileNames: 'assets/[name]-[hash:8].js',
          assetFileNames: 'assets/[name]-[hash:8].[ext]',
          manualChunks: {
            'mapbox': ['mapbox-gl'],
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select']
          }
        },
        treeshake: false
      },
      sourcemap: false,
      reportCompressedSize: true
    },
    define: {
      'process.env': env
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['lucide-react']
    }
  }
})