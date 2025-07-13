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
           checkout_js: './checkout.js'
         },
         output: {
           entryFileNames: '[name].js',
           chunkFileNames: 'assets/[name].js',
           assetFileNames: 'assets/[name].[ext]'
         }
       }
     },
     envPrefix: 'VITE_', // Ensure VITE_ variables are exposed to client
     define: {
       'import.meta.env': 'import.meta.env' // Ensure env variables are available
     }
   });