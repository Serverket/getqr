<div id="header" align="center">
<img src="./public/getqr-logo.svg" alt="GetQR Logo" title="GetQR Logo" width="120">

# GetQR &middot; ![Release Status](https://img.shields.io/badge/release-v2.1.0-brightgreen) [![npm version](https://img.shields.io/npm/v/react.svg?style=flat)](https://www.npmjs.com/package/react) ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white) [![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)
A simple and powerful QR code generator crafted with React 19, Tailwind CSS v4, and Framer Motion.
</div>

## :gear: Install & Run

You'll need [Bun](https://bun.sh) installed:

```bash
# Install dependencies
bun install

# Run the application
bun dev

# Build for production
bun run build

# Generate PWA icons from SVG source
bun run generate-pwa-assets
```

## :star2: Main features

**QR Code Generation:**
* QR generation via [qrserver.com API](https://api.qrserver.com) (square, PNG + SVG)
* **6 QR module styles** via [qr-code-styling](https://github.com/kozakdenys/qr-code-styling): square, dots, rounded, extra-rounded, classy, classy-rounded
* One-click style cycle button with a live shape indicator icon
* 4 gradient colour overlays (Violet, Amber, Ocean, Sunset) with `mix-blend-mode`
* Rounded-corner toggle and inverted-colour toggle
* Logo upload / drag-and-drop (SVG, PNG, JPG ≤ 2 MB)
* All styles fully composited in preview, PNG download, SVG download, copy, and share

**Frontend / UI:**
* React 19
* Tailwind CSS v4
* Framer Motion (preloader + zoom-in entrance)
* PWA (installable, offline-capable, Workbox caching)
* IndexedDB per-tab form persistence (Continue / Discard)
* i18n: English, Spanish, Portuguese, Italian, Chinese — all tooltips and UI strings translated
* Dark mode (OS-synced, persisted, flash-free)
* QR code scanner with live camera, flip button, and inverted-code support
* Telegram WebApp support

## :shipit: Special Thanks
* To a great and wise mentor in all things computer-related, Jaimes.

## :brain: Acknowledgments

*"Whoever loves discipline loves knowledge, but whoever hates correction is stupid."*