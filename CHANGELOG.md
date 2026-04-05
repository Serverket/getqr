# Changelog

All notable changes to GetQR are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.2.0] — 2026-04-04

### Added

#### Full Offline QR Generation
- **Eliminated all `api.qrserver.com` dependencies** — every QR code (preview, PNG download, SVG download, copy, share) is now generated entirely client-side via `qr-code-styling`.
- **`getRawQRData()` helper** — centralises raw data resolution for all tab types (vCard, text, URL).
- **`MiniQRPreview` component** — lightweight 40×40 canvas-based QR preview used in the `ResolutionSelector`, replacing the old API-fetched `<img>`.
- Precache size: **22 entries, 707 KB** (~200 KB gzipped network transfer). Zero runtime network requests after install.

#### Privacy Policy — Full i18n
- All Privacy Policy content translated into all 5 languages (en, es, pt, it, zh) via dedicated translation keys.
- Footer links ("Contribute", "MIT License") now use translated keys.
- Privacy Policy page links use gradient styling matching the app brand.

### Changed

#### Dark Mode Toggle
- **Emoji → SVG** — replaced invisible emoji sun/moon (`🌞`/`🌜`) with **Heroicons outline** SVG icons (sun with rays, crescent moon). Renders reliably on all platforms.
- **Theme persistence fix** — removed the system `prefers-color-scheme` change listener that was overriding the user's manual toggle. `localStorage` value now persists correctly across reloads, PWA restarts, and offline usage. System preference is only used as an initial fallback for first-time visitors.

#### vCard Tab — Conditional Panel
- `ResolutionSelector` (colour/style controls) on the vCard tab now appears only after first and last name are entered, matching the behaviour of the Text and URL tabs.

#### Workbox Configuration
- Removed `runtimeCaching` for `api.qrserver.com` (no longer needed).
- Simplified to precache-only strategy — all assets served from service worker cache.

### Removed
- **`getQRCodeUrl()` function** — deleted; was the sole entry point to the external QR API.
- **7 dead assets** from `public/`: `chinchillaqr.svg`, `chinchillaqr.webp`, `chinchillaqr_hd.webp`, `chinchillaqr_ti.webp`, `chinchillaqr_wbg.webp`, `favicon-16x16.png`, `favicon-32x32.png` (−252 KB from precache).

---

## [2.1.0] — 2026-04-03

### Added

#### QR Module Style Cycling
- **`qr-code-styling` v1.9.2** added as a runtime dependency for client-side QR module rendering.
- **6 QR dot styles** selectable via a single cycle button: `square` (default), `dots`, `rounded`, `extra-rounded`, `classy`, `classy-rounded`.
- **`StyleDotIcon`** — a tiny dynamic 2×2 SVG grid whose shape updates live to reflect the active style (circles for dots, progressively rounded rectangles for rounded variants, sharp squares for square/classy). Provides instant visual feedback without any text label.
- **`QR_STYLES` constant** at module level; each entry carries `id` and `labelKey` for clean i18n lookup.
- **`qrStyle` state** (`useState('square')`) added to the App component.
- **`cycleStyle()`** function cycles through all six styles in order on each button click.
- Style button placed to the right of the rounded-corners toggle in `ResolutionSelector`; turns blue and scales up when any non-square style is active.

#### Styled QR — Full Pipeline Support
- **Preview (`QRImage`)**: rewritten as a proper React hook component. When `qrStyle !== 'square'`, `qr-code-styling` renders a `<canvas>` into a `div` ref. All existing overlays (gradient, logo, rounded clip) still apply on top via the same absolute-position layer stack.
- **PNG download / copy / share (`generateQRCanvas`)**: non-square styles call `qrCode.getRawData('png')` to produce the base image, then the unchanged gradient → logo compositing pipeline runs over it.
- **SVG download (`downloadQR`)**: non-square styles call `qrCode.getRawData('svg')` instead of the `qrserver.com` API; the identical gradient `<linearGradient>`, logo `<image>`, and rounded `<clipPath>` injection is then applied to the resulting SVG text.
- `rawData` prop added to all three `<QRImage>` usages (vcard, text, url tabs) so the hook has the decoded content string it needs.

#### Button Layout
- The `ResolutionSelector` control row is now split into two visually distinct groups using `justify-between`:
  - **Left** — gradient color swatches (no-gradient + 4 presets).
  - **Right** — rounded-corners toggle + style cycle button.
- Removed the hard-coded vertical separator `div`; the flex spacing does the job.

#### i18n — Tooltip Coverage
- **11 new translation keys** added to all 5 languages (en, es, pt, it, zh):
  - Gradient names: `gradientViolet`, `gradientAmber`, `gradientOcean`, `gradientSunset`
  - QR style names: `styleSquare`, `styleDots`, `styleRounded`, `styleExtraRounded`, `styleClassy`, `styleClassyRounded`
  - Style button prefix: `qrStyleLabel` ("Style" / "Estilo" / "Stile" / "风格")
- `GRADIENT_PRESETS` entries: `label` field replaced by `labelKey` pointing to the translation map.
- `QR_STYLES` entries: `label` field replaced by `labelKey`.
- All gradient swatch `title` attributes and the style cycle button `title` attribute now resolve through `translations[selectedLanguage][key]`.

---

### Fixed

#### Canvas Rendering
- **Logo blending on colored QR codes** — gradient pixel-processing in `generateQRCanvas` now runs *before* the logo is composited onto the canvas. Previously the gradient recolored logo pixels too, making the logo invisible on colored backgrounds. Now matches the SVG download behaviour where the gradient `<rect>` sits below the logo `<image>`.
- **`ObjectURL` memory leak** — `URL.revokeObjectURL()` is now called in both `onload` and `onerror` handlers of the image loader. Refactored into a shared `blobToImg()` helper used by both the API path and the `qr-code-styling` path.

#### SVG Download
- **Rounded corners + gradient conflict** — replaced CSS `clip-path` on the SVG wrapper with a native SVG `<clipPath>` element and `<g clip-path="…">` group wrapping. `mix-blend-mode` on the gradient `<rect>` now works correctly inside the clipped group (CSS `clip-path` suppresses `mix-blend-mode` in most browsers).

#### Persistence (IndexedDB)
- **Logo changes not triggering auto-save** — `logoData` added as a dependency to all three `useEffect` auto-save hooks (vcard, text, url). Logo uploads and removals are now persisted.
- **`handleDiscard` clearing logo across unrelated tabs** — logo state is only set to `null` when the saved data for that specific tab actually contained a logo.

#### QR Scanner
- **Inverted QR codes not decoded** — `jsQR` option `inversionAttempts` set to `'attemptBoth'`, enabling detection of both normal and colour-inverted QR codes in a single decode pass.

#### Telegram WebApp
- **`btoa` call-stack overflow on large PNG downloads** — replaced `String.fromCharCode(...new Uint8Array(buffer))` (spread of large typed array into function arguments) with a character-by-character `for` loop to avoid hitting the JS call-stack limit.

---

### Changed

#### Scanner UX
- **Start Camera button color** changed from `bg-violet-600` to `bg-blue-500` / `hover:bg-blue-600` to match the "Save to Photos" button and the overall blue brand colour.
- **Camera viewport theming** — all scanner states (idle, requesting, error) that were hardcoded to `bg-gray-900` now use `bg-gray-100 dark:bg-gray-900`, correctly adapting to light mode. Inner icon circle, error text, and error icon colours updated correspondingly.

---

## [2.0.0] — 2026-02-22

### Added
- **GetQR rebrand** — renamed from Chinchilla QR; new gradient SVG logo, updated manifest, meta tags, and PWA identity.
- i18n expanded to 5 languages: added Portuguese, Italian, and Chinese on top of existing English and Spanish.
- React 19 + Vite 6 + Tailwind CSS v4 migration; full codebase overhaul.
- PWA 2026 manifest: `id`, `launch_handler`, `display_override`, `categories`, `shortcuts` (3), `share_target`, `handle_links`.
- Workbox NetworkFirst cache for `api.qrserver.com` (7-day, 100 entries).
- IndexedDB per-tab form persistence with Continue / Discard restore banner.
- QR code scanner via `jsQR` with live camera feed, flip button, and URL open shortcut.
- Copy-to-clipboard and Web Share API integration.
- SVG download with inline gradient, logo, and rounded-corner injection.
- Framer Motion animated preloader + zoom-in app entrance.
- Dark mode flash-free initialisation from `localStorage`.

---

## [1.5.1] — 2025-03-13

### Fixed
- Telegram WebApp save context improvements to fix broken download interactions.

---

## [1.5.0] — 2025-02-24

### Added
- Telegram WebApp file download support via canvas export and base64 fallback.

---

## [1.4.0] — 2025-02-19

### Added
- Inverted-colour toggle: one-click button to flip QR foreground and background colours.

---

## [1.3.0] — 2025-02-02

### Added
- Logo upload and compositing in the centre of the QR code.
- Drag-and-drop file upload for the logo.
- 1000 px resolution option.
- Improved overall layout.

---

## [1.2.0] — 2025-02-02

### Added
- Position (Work) and Company fields to the vCard contact form.

---

## [1.1.0] — 2025-01-12

### Added
- User settings (dark mode, language) persisted to `localStorage`.

---

## [1.0.0] — 2025-01-12 *(initial release — Chinchilla QR)*

### Added
- React single-page app with three QR tabs: Contact (vCard 3.0), Text, URL.
- QR code generation via `api.qrserver.com` (PNG + SVG formats, multiple resolutions).
- Gradient colour overlays (Violet, Amber, Ocean, Sunset) with `mix-blend-mode`.
- Rounded-corner toggle for QR preview and downloads.
- i18n: English and Spanish.
- Dark mode.
