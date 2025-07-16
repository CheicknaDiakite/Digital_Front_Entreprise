import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from "vite-plugin-pwa";
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { imagetools } from 'vite-imagetools';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), VitePWA({
        registerType: "autoUpdate",
        includeAssets: ['favicon.svg', 'icon-192x192.png', 'icon-512x512.png', 'C_D.ico'],
        manifest: {
            name: 'Gest Stocks',
            short_name: 'Gest Stocks',
            description: 'Meilleur application pour votre gestion de stock',
            theme_color: '#ffffff',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            categories: ['business', 'productivity'],
            lang: 'fr',
            dir: 'ltr',
            icons: [
              {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
              },
              // Icônes spécifiques pour iOS
              {
                src: '/icon-180x180.png',
                sizes: '180x180',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/icon-167x167.png',
                sizes: '167x167',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/icon-152x152.png',
                sizes: '152x152',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/icon-120x120.png',
                sizes: '120x120',
                type: 'image/png',
                purpose: 'any'
              }
            ],
            screenshots: [
              {
                src: '/dashboard.png',
                sizes: '1280x720',
                type: 'image/png',
                form_factor: 'wide'
              }
            ]
          },
        workbox: {
            globPatterns: ['**/*{js,css,html,ico,png,svg}'],
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB par exemple
            runtimeCaching: [
                {
                    urlPattern: /^https:\/\/diakitedigital\.com\/.*/i,
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'diakitedigital',
                        expiration: {
                            maxEntries: 10,
                            maxAgeSeconds: 60
                        },
                        cacheableResponse: {
                            statuses: [0, 200]
                        }
                    }
                },
                {
                    urlPattern: /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif)$/,
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'images',
                        expiration: {
                            maxEntries: 60,
                            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
                        },
                    },
                }
            ]
        },
        devOptions: {
            enabled: true,
            type: 'module'
        }
    }),
    imagetools(),
    viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240,
        deleteOriginFile: false
    }),
    viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240,
        deleteOriginFile: false
    })],
    build: {
        target: 'esnext', // Pour utiliser les fonctionnalités modernes
        rollupOptions: {
            external: ['workbox-window'],
        },
    },
    // base: '/monapp/', // Base de ton application dans le sous-dossier
});
