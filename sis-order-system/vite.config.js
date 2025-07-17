import { defineConfig, loadEnv } from 'vite';

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
                    meat: './meat.html',
                    seafood: './seafood.html',
                    others: './others.html'
                },
                output: {
                    entryFileNames: '[name].js',
                    chunkFileNames: 'assets/[name].js',
                    assetFileNames: 'assets/[name].[ext]'
                }
            }
        },
        define: {
            'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
            'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        },
        envPrefix: 'VITE_'
    };
});
