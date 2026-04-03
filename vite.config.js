import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['getqr-logo.svg', 'getqr-logo-maskable.svg', 'robots.txt'],
      manifest: {
        id: '/',
        name: 'GetQR',
        short_name: 'GetQR',
        description: 'A simple and powerful QR code generator. Create vCard, text, and URL QR codes instantly.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        background_color: '#ffffff',
        theme_color: '#7C3AED',
        lang: 'en',
        dir: 'ltr',
        orientation: 'any',
        categories: ['utilities', 'productivity'],
        launch_handler: {
          client_mode: 'navigate-existing',
        },
        handle_links: 'preferred',
        share_target: {
          action: '/',
          method: 'GET',
          params: {
            text: 'text',
            url: 'url',
            title: 'title',
          },
        },
        shortcuts: [
          {
            name: 'Contact QR',
            short_name: 'Contact',
            description: 'Generate a vCard QR code',
            url: '/?tab=vcard',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Text QR',
            short_name: 'Text',
            description: 'Generate a text QR code',
            url: '/?tab=text',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'URL QR',
            short_name: 'URL',
            description: 'Generate a URL QR code',
            url: '/?tab=url',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'getqr-logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'getqr-logo-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            // Cache QR code API responses
            urlPattern: /^https:\/\/api\.qrserver\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'qr-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
