import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        checkout: './checkout.html',
        summary: './summary.html',
        veg: './veg.html',
        checkout_js: './checkout.js' // Include checkout.js in the build
      }
    }
  },
  envPrefix: 'VITE_' // Ensure VITE_ variables are exposed to client
});