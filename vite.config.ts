import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath, URL} from 'node:url';

function normalizeBasePath(value: string | undefined) {
  const path = value?.trim();
  if (!path || path === '/') return '/';
  return `/${path.replace(/^\/+|\/+$/g, '')}/`;
}

function manualChunks(id: string) {
  const normalizedId = id.replace(/\\/g, '/');
  if (!normalizedId.includes('/node_modules/')) return undefined;
  if (normalizedId.includes('/node_modules/pdfjs-dist/')) return 'pdfjs';
  if (/\/node_modules\/(react|react-dom|scheduler|zustand|use-sync-external-store)\//.test(normalizedId)) {
    return 'react-vendor';
  }
  if (/\/node_modules\/(@tanstack\/react-query|@tanstack\/query-core|axios)\//.test(normalizedId)) {
    return 'data-vendor';
  }
  if (/\/node_modules\/(@base-ui\/react|lucide-react)\//.test(normalizedId)) return 'ui-vendor';
  return 'vendor';
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: normalizeBasePath(env.VITE_BASE_PATH),
    plugins: [react(), tailwindcss()],
    resolve: {alias: {'@': fileURLToPath(new URL('./src', import.meta.url))}},
    server: {
      port: 5173,
      proxy: {
        '^/(ai-api|filebase)': {
          target: 'https://uatbims.boton-tech.com',
          changeOrigin: true
        }
      }
    },
    build: {
      target: 'es2022',
      rollupOptions: {output: {manualChunks}}
    }
  };
});
