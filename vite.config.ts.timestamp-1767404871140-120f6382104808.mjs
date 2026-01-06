// vite.config.ts
import { defineConfig } from "file:///C:/Users/cheic/OneDrive/Documents/Django/EntrepriseProjet/Front/node_modules/.pnpm/vite@5.4.19_@types+node@22.16.4_terser@5.43.1/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/cheic/OneDrive/Documents/Django/EntrepriseProjet/Front/node_modules/.pnpm/@vitejs+plugin-react@4.6.0__25147fb4dad4f5638d2a65f965ba7339/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/cheic/OneDrive/Documents/Django/EntrepriseProjet/Front/node_modules/.pnpm/vite-plugin-pwa@0.21.2_vite_9ac9cb93dbf803d7cc2290b8e5b9a4db/node_modules/vite-plugin-pwa/dist/index.js";
import { imagetools } from "file:///C:/Users/cheic/OneDrive/Documents/Django/EntrepriseProjet/Front/node_modules/.pnpm/vite-imagetools@7.1.0_rollup@2.79.2/node_modules/vite-imagetools/dist/index.js";
import viteCompression from "file:///C:/Users/cheic/OneDrive/Documents/Django/EntrepriseProjet/Front/node_modules/.pnpm/vite-plugin-compression@0.5_8e045cbff2be6c6c140becca082d77ce/node_modules/vite-plugin-compression/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "icon-192x192.png",
        "icon-512x512.png",
        "icon-180x180.png",
        "icon-167x167.png",
        "icon-152x152.png",
        "icon-120x120.png",
        "C_D.ico",
        "offline.html"
      ],
      manifest: {
        name: "Gest Stocks",
        short_name: "Gest Stocks",
        description: "Meilleur application pour votre gestion de stock",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        display_override: ["standalone", "fullscreen"],
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        categories: ["business", "productivity"],
        lang: "fr",
        dir: "ltr",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
          // Icônes spécifiques pour iOS
          {
            src: "/icon-32x32.png",
            sizes: "32x32",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icon-16x16.png",
            sizes: "16x16",
            type: "image/png",
            purpose: "any"
          }
        ],
        screenshots: [
          {
            src: "/assets/img/dashboard.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*{js,css,html,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: "/offline.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/diakitedigital\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "diakitedigital",
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
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false,
        type: "module"
      }
    }),
    imagetools(),
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 10240,
      deleteOriginFile: false
    }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 10240,
      deleteOriginFile: false
    })
  ],
  build: {
    target: "esnext",
    rollupOptions: {
      external: ["workbox-window"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjaGVpY1xcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcRGphbmdvXFxcXEVudHJlcHJpc2VQcm9qZXRcXFxcRnJvbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGNoZWljXFxcXE9uZURyaXZlXFxcXERvY3VtZW50c1xcXFxEamFuZ29cXFxcRW50cmVwcmlzZVByb2pldFxcXFxGcm9udFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvY2hlaWMvT25lRHJpdmUvRG9jdW1lbnRzL0RqYW5nby9FbnRyZXByaXNlUHJvamV0L0Zyb250L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xyXG5pbXBvcnQgeyBpbWFnZXRvb2xzIH0gZnJvbSAndml0ZS1pbWFnZXRvb2xzJztcclxuaW1wb3J0IHZpdGVDb21wcmVzc2lvbiBmcm9tICd2aXRlLXBsdWdpbi1jb21wcmVzc2lvbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgcGx1Z2luczogW3JlYWN0KCksIFZpdGVQV0Eoe1xyXG4gICAgICAgIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXHJcbiAgICAgICAgaW5jbHVkZUFzc2V0czogW1xyXG4gICAgICAgICAgICAnZmF2aWNvbi5zdmcnLCBcclxuICAgICAgICAgICAgJ2ljb24tMTkyeDE5Mi5wbmcnLCBcclxuICAgICAgICAgICAgJ2ljb24tNTEyeDUxMi5wbmcnLCBcclxuICAgICAgICAgICAgJ2ljb24tMTgweDE4MC5wbmcnLFxyXG4gICAgICAgICAgICAnaWNvbi0xNjd4MTY3LnBuZycsXHJcbiAgICAgICAgICAgICdpY29uLTE1MngxNTIucG5nJyxcclxuICAgICAgICAgICAgJ2ljb24tMTIweDEyMC5wbmcnLFxyXG4gICAgICAgICAgICAnQ19ELmljbycsIFxyXG4gICAgICAgICAgICAnb2ZmbGluZS5odG1sJ1xyXG4gICAgICAgIF0sXHJcbiAgICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICAgICAgbmFtZTogJ0dlc3QgU3RvY2tzJyxcclxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ0dlc3QgU3RvY2tzJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdNZWlsbGV1ciBhcHBsaWNhdGlvbiBwb3VyIHZvdHJlIGdlc3Rpb24gZGUgc3RvY2snLFxyXG4gICAgICAgICAgICB0aGVtZV9jb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcclxuICAgICAgICAgICAgZGlzcGxheV9vdmVycmlkZTogW1wic3RhbmRhbG9uZVwiLCBcImZ1bGxzY3JlZW5cIl0sXHJcbiAgICAgICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxyXG4gICAgICAgICAgICBzY29wZTogJy8nLFxyXG4gICAgICAgICAgICBzdGFydF91cmw6ICcvJyxcclxuICAgICAgICAgICAgY2F0ZWdvcmllczogWydidXNpbmVzcycsICdwcm9kdWN0aXZpdHknXSxcclxuICAgICAgICAgICAgbGFuZzogJ2ZyJyxcclxuICAgICAgICAgICAgZGlyOiAnbHRyJyxcclxuICAgICAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzcmM6ICcvaWNvbi0xOTJ4MTkyLnBuZycsXHJcbiAgICAgICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzcmM6ICcvaWNvbi01MTJ4NTEyLnBuZycsXHJcbiAgICAgICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAvLyBJY1x1MDBGNG5lcyBzcFx1MDBFOWNpZmlxdWVzIHBvdXIgaU9TXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3JjOiAnL2ljb24tMzJ4MzIucG5nJyxcclxuICAgICAgICAgICAgICAgIHNpemVzOiAnMzJ4MzInLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICBwdXJwb3NlOiAnYW55J1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3JjOiAnL2ljb24tMTZ4MTYucG5nJyxcclxuICAgICAgICAgICAgICAgIHNpemVzOiAnMTZ4MTYnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICBwdXJwb3NlOiAnYW55J1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgc2NyZWVuc2hvdHM6IFtcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzcmM6ICcvYXNzZXRzL2ltZy9kYXNoYm9hcmQucG5nJyxcclxuICAgICAgICAgICAgICAgIHNpemVzOiAnMTI4MHg3MjAnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICBmb3JtX2ZhY3RvcjogJ3dpZGUnXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyp7anMsY3NzLGh0bWwsaWNvLHBuZyxzdmd9J10sXHJcbiAgICAgICAgICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiA1ICogMTAyNCAqIDEwMjQsXHJcbiAgICAgICAgICAgIG5hdmlnYXRlRmFsbGJhY2s6ICcvb2ZmbGluZS5odG1sJyxcclxuICAgICAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2RpYWtpdGVkaWdpdGFsXFwuY29tXFwvLiovaSxcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdkaWFraXRlZGlnaXRhbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzPzpcXC9cXC8uKlxcLig/OnBuZ3xqcGd8anBlZ3xzdmd8Z2lmKSQvLFxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2ltYWdlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDYwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogMzAgKiAyNCAqIDYwICogNjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGV2T3B0aW9uczoge1xyXG4gICAgICAgICAgICBlbmFibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgdHlwZTogJ21vZHVsZSdcclxuICAgICAgICB9XHJcbiAgICB9KSxcclxuICAgIGltYWdldG9vbHMoKSxcclxuICAgIHZpdGVDb21wcmVzc2lvbih7XHJcbiAgICAgICAgYWxnb3JpdGhtOiAnZ3ppcCcsXHJcbiAgICAgICAgZXh0OiAnLmd6JyxcclxuICAgICAgICB0aHJlc2hvbGQ6IDEwMjQwLFxyXG4gICAgICAgIGRlbGV0ZU9yaWdpbkZpbGU6IGZhbHNlXHJcbiAgICB9KSxcclxuICAgIHZpdGVDb21wcmVzc2lvbih7XHJcbiAgICAgICAgYWxnb3JpdGhtOiAnYnJvdGxpQ29tcHJlc3MnLFxyXG4gICAgICAgIGV4dDogJy5icicsXHJcbiAgICAgICAgdGhyZXNob2xkOiAxMDI0MCxcclxuICAgICAgICBkZWxldGVPcmlnaW5GaWxlOiBmYWxzZVxyXG4gICAgfSldLFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgICB0YXJnZXQ6ICdlc25leHQnLFxyXG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgZXh0ZXJuYWw6IFsnd29ya2JveC13aW5kb3cnXSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUErWCxTQUFTLG9CQUFvQjtBQUM1WixPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBQ3hCLFNBQVMsa0JBQWtCO0FBQzNCLE9BQU8scUJBQXFCO0FBRTVCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUFDLE1BQU07QUFBQSxJQUFHLFFBQVE7QUFBQSxNQUN2QixjQUFjO0FBQUEsTUFDZCxlQUFlO0FBQUEsUUFDWDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ04sTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsUUFDbEIsU0FBUztBQUFBLFFBQ1Qsa0JBQWtCLENBQUMsY0FBYyxZQUFZO0FBQUEsUUFDN0MsYUFBYTtBQUFBLFFBQ2IsT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsWUFBWSxDQUFDLFlBQVksY0FBYztBQUFBLFFBQ3ZDLE1BQU07QUFBQSxRQUNOLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUE7QUFBQSxVQUVBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLFFBQ0EsYUFBYTtBQUFBLFVBQ1g7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLGFBQWE7QUFBQSxVQUNmO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNGLFNBQVM7QUFBQSxRQUNMLGNBQWMsQ0FBQywrQkFBK0I7QUFBQSxRQUM5QywrQkFBK0IsSUFBSSxPQUFPO0FBQUEsUUFDMUMsa0JBQWtCO0FBQUEsUUFDbEIsZ0JBQWdCO0FBQUEsVUFDWjtBQUFBLFlBQ0ksWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ0wsV0FBVztBQUFBLGNBQ1gsWUFBWTtBQUFBLGdCQUNSLFlBQVk7QUFBQSxnQkFDWixlQUFlO0FBQUEsY0FDbkI7QUFBQSxjQUNBLG1CQUFtQjtBQUFBLGdCQUNmLFVBQVUsQ0FBQyxHQUFHLEdBQUc7QUFBQSxjQUNyQjtBQUFBLFlBQ0o7QUFBQSxVQUNKO0FBQUEsVUFDQTtBQUFBLFlBQ0ksWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ0wsV0FBVztBQUFBLGNBQ1gsWUFBWTtBQUFBLGdCQUNSLFlBQVk7QUFBQSxnQkFDWixlQUFlLEtBQUssS0FBSyxLQUFLO0FBQUEsY0FDbEM7QUFBQSxZQUNKO0FBQUEsVUFDSjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDUixTQUFTO0FBQUEsUUFDVCxNQUFNO0FBQUEsTUFDVjtBQUFBLElBQ0osQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBLElBQ1gsZ0JBQWdCO0FBQUEsTUFDWixXQUFXO0FBQUEsTUFDWCxLQUFLO0FBQUEsTUFDTCxXQUFXO0FBQUEsTUFDWCxrQkFBa0I7QUFBQSxJQUN0QixDQUFDO0FBQUEsSUFDRCxnQkFBZ0I7QUFBQSxNQUNaLFdBQVc7QUFBQSxNQUNYLEtBQUs7QUFBQSxNQUNMLFdBQVc7QUFBQSxNQUNYLGtCQUFrQjtBQUFBLElBQ3RCLENBQUM7QUFBQSxFQUFDO0FBQUEsRUFDRixPQUFPO0FBQUEsSUFDSCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDWCxVQUFVLENBQUMsZ0JBQWdCO0FBQUEsSUFDL0I7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
