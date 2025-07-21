/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Vite options tailored for Tauri development
  clearScreen: false,

  // Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Tell Vite to ignore watching src-tauri
      ignored: ["**/src-tauri/**"],
    },
  },

  // Path resolution for clean imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/agents': resolve(__dirname, 'src/agents'),
      '@/components': resolve(__dirname, 'src/components'),
    },
  },

  // Tauri environment variable for production build
  envPrefix: ['VITE_', 'TAURI_'],

  // Define global variables for Node.js polyfills
  define: {
    global: 'globalThis',
  },

  // Optimizations
  optimizeDeps: {
    exclude: ['ollama'],
  },

  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',

    // Don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,

    // Produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,

    // Output directory for Tauri
    outDir: 'dist',

    // Rollup options for handling Node.js modules
    rollupOptions: {
      external: ['ollama'],
    }
  },

  // Test configuration for Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
  },
});
