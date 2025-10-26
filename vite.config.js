import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    server: {
        port: 5173
    },
    build: {
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Optimize chunk size
        rollupOptions: {
            output: {
                // Manual chunk splitting for better caching
                manualChunks: {
                    // Vendor chunks
                    'vue-vendor': ['vue', 'vue-router'],
                    'supabase-vendor': ['@supabase/supabase-js'],
                },
                // Optimize chunk file names
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            }
        },
        // Minify options
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.log in production
                drop_debugger: true
            }
        },
        // Chunk size warning limit
        chunkSizeWarningLimit: 500
    },
    // CSS optimization
    css: {
        devSourcemap: false,
        postcss: './postcss.config.js',
        // CSS modules configuration
        modules: {
            localsConvention: 'camelCase',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
        },
        // Preprocessor options
        preprocessorOptions: {
            css: {
                // Charset will be added by cssnano
                charset: false
            }
        }
    }
});
