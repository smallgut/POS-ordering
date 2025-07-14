import { defineConfig } from 'vite';
   import { loadEnv } from 'vite';

   export default defineConfig(({ mode }) => {
     const env = loadEnv(mode, process.cwd(), 'VITE_');
     return {
       build: {
         outDir: 'dist',
         assetsDir: 'assets',
         rollupOptions: {
           input: {
             main: './index.html',
             checkout: './checkout.html',
             summary: './summary.html',
             veg: './veg.html',
             checkout_js: './checkout.js'
           },
           output: {
             entryFileNames: '[name].js',
             chunkFileNames: 'assets/[name].js',
             assetFileNames: 'assets/[name].[ext]'
           }
         }
       },
       envPrefix: 'VITE_', // Ensure VITE_ variables are exposed
       mode: 'production' // Explicitly set production mode
     };
   });