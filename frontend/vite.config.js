import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    base: '/',
    server: {
        port: 5173, // Use default Vite port
        host: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                timeout: 10000 // 10 second timeout
            }
        }
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['vue', 'vue-router', 'vue-i18n'],
                    axios: ['axios']
                }
            }
        }
    },
    optimizeDeps: {
        include: ['vue', 'vue-router', 'vue-i18n', 'axios']
    }
}) 