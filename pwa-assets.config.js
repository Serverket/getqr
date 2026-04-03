import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    // Full-bleed: SVG already has gradient bg + safe-zone white circle
    maskable: {
      sizes: [192, 512],
      padding: 0,
      resizeOptions: { background: 'transparent', fit: 'contain' },
    },
    // iOS: full-bleed, iOS applies its own squircle clip to the full 180x180
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: { background: 'transparent', fit: 'contain' },
    },
  },
  images: ['public/getqr-logo-maskable.svg'],
});
