import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env from root directory
    const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
    
    return {
      root: __dirname,
      server: {
        port: 5173,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3001/api'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@shared': path.resolve(__dirname, '../shared'),
          '@components': path.resolve(__dirname, './src/components'),
          '@services': path.resolve(__dirname, './src/services'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: true,
      }
    };
});
