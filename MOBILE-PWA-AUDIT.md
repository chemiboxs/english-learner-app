# Mobile & PWA Audit

Audit of the English Learner App for mobile compatibility and PWA readiness.
All changes should be implemented with responsive overrides so the desktop version is unaffected.

---

## Contents

- [Critical — Will break on mobile](#critical--will-break-on-mobile)
- [High — Significant mobile UX problems](#high--significant-mobile-ux-problems)
- [Medium — Minor but should be fixed](#medium--minor-but-should-be-fixed)
- [Low — Cosmetic or edge-case](#low--cosmetic-or-edge-case)
- [PWA / Meta Tags](#pwa--meta-tags)

---

## Critical — Will break on mobile

### C1. Header `grid-cols-3` cannot fit on narrow screens

**File:** `src/App.tsx:111`

The header uses `grid-cols-3` with no responsive breakpoint. It packs a dictionary `<select>` (180px), "Current words" button, "All words" button, VoiceSelector (180px), "Learned" button (`min-w-[120px]`), "Skipped" button (`min-w-[120px]`), and "Reset" button into three columns. The right column alone needs ~320px — equal to the entire viewport width of a small phone.

**What fails:** The entire header overflows horizontally on any screen < ~850px wide.

**Desktop-safe fix:** Override the grid at `md:` or `lg:` breakpoint — switch to a stacked layout (e.g., `grid-cols-1` or flex-wrap) or collapse controls into a hamburger / bottom navigation. All existing `grid-cols-3` classes stay for desktop.

### C2. Tooltip is entirely mouse-driven — never shows on touch

**File:** `src/components/WordsList.tsx:637-638, 367-376`

- Tooltip triggers via `onMouseEnter`
- Tooltip hides via `onMouseLeave`
- Global `mousemove` listener tracks pointer coords
- `document.elementFromPoint()` checks pointer location
- **No touch event handlers exist** (`onTouchStart`/`onTouchEnd`/`onTouchMove`)

**What fails:** The tooltip never appears on a touch-only device. Additionally, the hide logic cannot function because `lastPointerRef` is only populated by `mousemove`.

**Desktop-safe fix:** Add `onTouchStart`/`onTouchEnd` handlers alongside mouse events. Use a "tap to toggle" pattern on touch — first tap shows the tooltip, second tap (or tap outside) hides it.

### C3. Tooltip `minWidth: 320` exceeds available space

**File:** `src/components/WordsList.tsx:107, 352-353`

- `minWidth: 320` is set on the tooltip
- `maxWidth: calc(100vw - 32px)` evaluates to **288px** on a 320px-wide screen
- CSS `min-width` overrides `max-width`, forcing the tooltip to 320px → horizontal overflow

**What fails:** Tooltip extends beyond the viewport, user must scroll sideways to read content.

**Desktop-safe fix:** Adjust `minWidth` to be responsive — e.g., use `Math.min(320, window.innerWidth - 32)` or simply set a smaller minimum on mobile via a breakpoint check.

### C4. Negative-width calculation in VocabularyApp stars

**File:** `src/components/VocabularyApp.tsx:111, 144`

The left/right star decorations use:

```css
w-[calc((100vw-1024px)/2)]
```

On any viewport narrower than 1024px, this evaluates to a negative width. The `min-w-[90px]` at line 112 clamps it, but the `absolute left-0` / `right-0` positioning places the gutters at the screen edges, potentially overlapping the main content.

**What fails:** Decorative star gutters render incorrectly or overlap content on mobile.

**Desktop-safe fix:** Conditionally hide star gutters on mobile (`hidden md:block`) or switch to a fixed small padding instead of `calc`.

### C5. No PWA manifest or service worker

**File:** `index.html:5`, `vite.config.ts`

- No `<link rel="manifest">` — the app cannot be installed on Android or iOS
- No service worker registration — no offline support
- No `vite-plugin-pwa` configured
- No `apple-mobile-web-app-capable` meta — iOS won't use full-screen standalone mode
- No `apple-touch-icon` or favicon references

---

## High — Significant mobile UX problems

### H1. Touch targets below 44×44px

| Element | File | Size | Minimum |
|---|---|---|---|
| InfoButton | `WordsList.tsx:624` | 24×24px | 44×44px |
| Play button (modal) | `WordsList.tsx:687` | 24×24px | 44×44px |
| Stop button (modal) | `WordsList.tsx:738` | 24×24px | 44×44px |
| Search clear button | `WordsList.tsx:482` | 32×32px | 44×44px |
| Search input | `WordsList.tsx:458` | ~32px tall | 44px tall |
| Close button (modal) | `WordsList.tsx:561` | ~40px tall | 44px tall |
| Header `<select>` | `App.tsx:122` | 40px tall | 44px tall |
| Header nav buttons | `App.tsx:144,162` | 40px tall | 44px tall |
| Learned/Skipped btn | `App.tsx:189,206` | 40px tall | 44px tall |
| Reset button | `App.tsx:224` | 40px tall | 44px tall |
| Button sm/md sizes | `Button.tsx:17-19` | ~28-40px | 44px tall |
| Toggle | `Toggle.tsx:27` | 28px tall | 44px tall |
| Clear button (input) | `InputField.tsx:88` | 32×32px | 44×44px |
| Dict buttons | `DictionarySelector.tsx:49` | ~32px tall | 44px tall |

**Desktop-safe fix:** Increase sizes only at mobile breakpoints (e.g., `md:w-10 md:h-10` on InfoButton), or use a global CSS variable that adjusts on narrow viewports.

### H2. No touch equivalents for hover/tooltip interactions

All components that rely on hover for visual feedback will not respond on touch:

- `App.tsx:152,170` — `hover:bg-*` on header buttons
- `Button.tsx:10,11,13` — `hover:bg-*` on all button variants
- `WordsList.tsx:527` — `hover:bg-surface-container` on word rows
- `WordsList.tsx:637,700` — InfoButton/PlayButton hover visuals via `onMouseEnter`
- `WordCard.tsx:129-130` — Speaker button hover state
- `DictionarySelector.tsx:53` — `hover:bg-surface-container-high`
- `SkippedWordsList.tsx:111` — `hover:bg-surface-container`

**Desktop-safe fix:** Add `active:` and `focus:` variants alongside `hover:`. These work on both touch and desktop.

### H3. Header `min-w-[120px]` prevents shrinking

**File:** `src/App.tsx:190, 208`

"Learned" and "Skipped" buttons have `min-w-[120px]`. Even if the header were to wrap, these buttons cannot shrink below 120px each, making them impossible to fit on a narrow row.

**Desktop-safe fix:** Remove the `min-w-[120px]` at mobile breakpoints, or use shorter labels/abbreviations.

### H4. Word row action group uses `flex-shrink-0`

**File:** `src/components/WordsList.tsx:533`

```html
<div class="flex items-center gap-2 flex-shrink-0">
```

The right-side action group (English word + Info + Play + Stop) refuses to shrink. On narrow screens the row overflows.

**Desktop-safe fix:** Remove `flex-shrink-0` on mobile, or let the English word wrap (`whitespace-normal`), or stack the action group below the Ukrainian word.

### H5. Toggle labels overflow on mobile

**File:** `src/components/VocabularyApp.tsx:224`

Two `<Toggle>` components placed side by side with `gap-8` (32px). The "Repeat skipped words" label is ~20 characters wide at `text-base` — on a 320px screen, two such labels with 32px gap cannot fit.

**Desktop-safe fix:** Stack toggles vertically on mobile (`flex-col md:flex-row`).

### H6. Global `mousemove` listener — no `touchmove`

**File:** `src/components/WordsList.tsx:98-104`

Only tracks `mousemove`. Touch devices emit `touchmove`, so `lastPointerRef` is never populated on touch. The tooltip hide logic's `elementFromPoint` fallback path at line 247 is also state-based (which itself is only set by mouse events).

**Desktop-safe fix:** Also listen for `touchmove` and convert `e.touches[0].clientX/clientY`.

---

## Medium — Minor but should be fixed

### M1. English word fixed width may clip content

**File:** `src/components/WordsList.tsx:534`

```html
<p class="w-24">  <!-- 96px fixed width -->
```

Long English words will overflow this fixed column.

**Desktop-safe fix:** Use `min-w-0` + allow wrapping, or use responsive width.

### M2. WordCard large font sizes lack overflow protection

**File:** `src/components/WordCard.tsx:44,57`

- Ukrainian word: `fontSize: '48px'`
- Phrases: `fontSize: '30px'`
- No `word-break` or `overflow-wrap` set

Long compound words could overflow horizontally on 320px screens.

### M3. Search/close inputs below touch target

**File:** `src/components/WordsList.tsx:458, 561`

- Search input: `py-2` → ~32px total height
- Close button: `py-3` → ~40px total height

Both below the recommended 44px for touch.

### M4. Search clear button 32×32px

**File:** `src/components/WordsList.tsx:482`

The × button in the search field is `w-8 h-8` — below the 44×44px touch target.

### M5. InputField autoFocus opens keyboard immediately

**File:** `src/components/InputField.tsx:53`

The `autoFocus` prop will immediately open the virtual keyboard when the modal mounts on mobile, potentially pushing content behind the keyboard.

**Desktop-safe fix:** Only autoFocus on non-touch devices, or add `interactive-widget=resizes-content` to the viewport meta.

### M6. Star gutters take up space even when empty

**File:** `src/components/VocabularyApp.tsx:112,145`

`min-w-[90px]` on both left and right star containers consumes 180px of horizontal space on mobile — over half the viewport width.

**Desktop-safe fix:** `hidden md:block` — hide stars entirely on narrow screens.

---

## Low — Cosmetic or edge-case

### L1. Version badge overlap with system nav

**File:** `src/App.tsx:274`

`fixed bottom-3 right-3` — may overlap the system navigation bar on Android or the home indicator on iOS.

**Desktop-safe fix:** Add `env(safe-area-inset-bottom)` to the positioning.

### L2. Missing viewport meta attributes

**File:** `index.html:5`

Current: `<meta name="viewport" content="width=device-width, initial-scale=1" />`

Missing:
- `viewport-fit=cover` — notch support
- `interactive-widget=resizes-content` — keyboard handling

### L3. Stats.tsx buttons may overflow on 320px

**File:** `src/components/Stats.tsx:20`

Three buttons (Learned, Skipped, Reset) in a single `flex gap-3` row. On the smallest screens the buttons may not fit.

**Desktop-safe fix:** Allow wrapping or stack vertically on mobile.

---

## PWA / Meta Tags

All missing PWA essentials:

| Item | Needed | Location |
|---|---|---|
| `<link rel="manifest">` | PWA installability | `index.html` |
| `vite-plugin-pwa` | Auto-generates manifest + SW | `vite.config.ts` |
| Service worker | Offline support | Auto-generated by plugin |
| `<meta name="apple-mobile-web-app-capable" content="yes">` | iOS full-screen | `index.html` |
| `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` | iOS status bar | `index.html` |
| `<link rel="apple-touch-icon">` | iOS home screen icon | `index.html` |
| App icons (192×192, 512×512) | PWA manifest icons | `/public/` |
| Screenshots (optional) | Enhanced install prompt | `/public/` |

---

## Implementation approach

1. **Use responsive Tailwind prefixes** (`md:`, `lg:`, `xl:`) for all layout overrides — existing desktop classes remain unchanged
2. **Add touch event handlers** alongside mouse handlers — use feature detection or a shared hook
3. **Configure `vite-plugin-pwa`** — handles manifest generation, service worker, icon processing
4. **Update `index.html`** — add PWA meta tags, manifest link, viewport improvements
5. **Fix tooltip `minWidth`** — make it responsive to viewport size
6. **Adjust touch targets** — `md:w-10 md:h-10` or similar on small interactive elements
7. **Replace hover-only states** — add `active:` and `focus:` variants
