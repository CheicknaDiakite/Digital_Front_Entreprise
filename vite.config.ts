import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), VitePWA({
        registerType: "prompt",
        includeAssets: ['favicon.svg', 'icon-192x192.png', 'icon-512x512.png'],
        manifest: {
            name: 'Gest Stocks',
            short_name: 'Gest Stocks',
            description: 'Meilleur application pour votre gestion de stock',
            theme_color: '#ffffff',
            start_url: '/',
            icons: [
              {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
              },
            ],
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
        }
    })],
    build: {
        target: 'esnext', // Pour utiliser les fonctionnalités modernes
        rollupOptions: {
            external: ['workbox-window'], // Ajoutez cette ligne
        },
    },
    // base: '/monapp/', // Base de ton application dans le sous-dossier
});
