# Mobile & PWA Changes

Summary of all changes made to enable mobile support and PWA functionality.
All mobile overrides use responsive Tailwind prefixes (`md:`, `hidden md:*`, etc.) so the desktop version is unaffected.

---

## Header — `src/App.tsx`

| Before | After |
|---|---|
| `grid-cols-3` — three columns on all screens | `flex flex-col md:grid md:grid-cols-3` — stacks vertically on mobile |
| `h-12` on the grid container | `h-auto md:h-12` |
| No gap or padding on mobile | `gap-2 py-2 md:gap-0 md:py-0` |
| Dictionary select `w-[180px]` | `w-full md:w-[180px]` |
| All header buttons `h-10` (40px) | `h-12 md:h-10` (48px touch target on mobile) |
| Learned/Skipped `min-w-[120px]` | `min-w-0 md:min-w-[120px]` |
| `hover:bg-*` only | `active:bg-* focus-visible:bg-* hover:bg-*` |
| Version badge `bottom: 3` | `bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px))` |

## Tooltip — `src/components/WordsList.tsx`

| Before | After |
|---|---|
| `TOOLTIP_MIN_WIDTH = 320` (hardcoded) | `Math.min(320, window.innerWidth - 32)` — won't overflow on 320px screens |
| `flex-shrink-0` on word action group | `md:flex-shrink-0` — wraps on mobile |
| English word `w-24` without break | `w-24 md:w-24 break-words` |
| Ukrainian word `flex-1` | `flex-1 break-words min-w-0` |
| InfoButton `w-6 h-6` (24×24px) | `w-10 h-10 md:w-6 md:h-6` (40×40px on mobile) |
| InfoButton `hover:border-on-surface` only | `active:border-on-surface focus-visible:border-on-surface hover:border-on-surface` |
| InfoButton mouse-only | Added `onTouchStart` handler |
| PlayButton `w-6 h-6` (24×24px) | `w-10 h-10 md:w-6 md:h-6` |
| PlayButton `flex-shrink-0` | `md:flex-shrink-0` |
| Search input `py-2` (~32px) | `py-3 md:py-2` |
| Search clear `w-8 h-8` (32×32px) | `w-10 h-10 md:w-8 md:h-8` |
| Close button `py-3` (~40px) | `py-4 md:py-3` |
| Global `mousemove` listener only | Added `touchmove` listener |
| No touch dismiss for tooltip | Global `touchstart` listener hides tooltip on tap outside |
| Tooltip mouse-only | Added `onTouchStart` handler on tooltip |

## Stars decoration — `src/components/VocabularyApp.tsx`

| Before | After |
|---|---|
| Left/Right stars `flex absolute` on all screens | `hidden md:flex absolute` — hidden on mobile |

## Toggle row — `src/components/VocabularyApp.tsx`

| Before | After |
|---|---|
| `flex justify-center gap-8` | `flex flex-col md:flex-row justify-center gap-4 md:gap-8` — stacks on mobile |

## Toggle — `src/components/Toggle.tsx`

| Before | After |
|---|---|
| `h-7` (28px touch target) | `h-11 md:h-7` (44px touch target on mobile) |
| Thumb `absolute top-0.5` | `absolute top-1/2 -translate-y-1/2` (centered on larger track) |

## VoiceSelector — `src/components/VoiceSelector.tsx`

| Before | After |
|---|---|
| `h-10` | `h-12 md:h-10` |
| `min-w-[180px]` | `min-w-0 md:min-w-[180px] w-full md:w-auto` |

## Button — `src/components/Button.tsx`

| Before | After |
|---|---|
| All variants `hover:bg-*` only | `active:bg-* focus-visible:bg-* hover:bg-*` |

## WordCard — `src/components/WordCard.tsx`

| Before | After |
|---|---|
| Ukrainian word `fontSize: 48px` without overflow protection | `overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%'` |
| Speaker button mouse-only | Added `onTouchStart`/`onTouchEnd` handlers |

## Stats — `src/components/Stats.tsx`

| Before | After |
|---|---|
| `flex gap-3` (no wrap) | `flex flex-wrap gap-3` — buttons wrap on narrow screens |

## PWA — `index.html`

Additions:
- `viewport-fit=cover` and `interactive-widget=resizes-content` to viewport meta
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- `<link rel="apple-touch-icon" href="/icon-192x192.png">`
- `<link rel="manifest" href="/manifest.json">`

## PWA — `vite.config.ts`

- Added `VitePWA` plugin with:
  - `registerType: 'autoUpdate'` — service worker auto-updates
  - Full manifest (name, short_name, description, theme_color, background_color, display: standalone)
  - Icons config for 192×192 and 512×512
  - Workbox caching for `{js,css,html,ico,png,svg,woff2}`

## PWA — `public/` icons

- `icon-192x192.png` — created
- `icon-512x512.png` — created
