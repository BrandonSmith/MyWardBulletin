import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer'; // Uncomment to analyze bundle

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // visualizer({ open: true }) // Uncomment to analyze bundle
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'es2017', // Only support modern browsers
    cssTarget: 'chrome61', // Modern CSS features
    // Uncomment below to analyze bundle after build
    // rollupOptions: { plugins: [visualizer({ open: true })] },
  },
});
