# Design Pattern Generator — Dark/Light Theme Support

**Date:** 2026-06-10
**Status:** Approved (brainstorming complete, awaiting implementation plan)
**Scope:** Make the Design Pattern Generator page (and the form controls on it) properly respond to the site's dark/light theme, and fix a pre-existing site-wide bug that prevents Tailwind's `dark:` variants from working.

## Problem

The Design Pattern Generator page (`/design-pattern-generator`) is a fullscreen overlay that does not adapt to the site's dark/light theme. The surrounding chrome (header, settings column) uses CSS variables (`--bg-color`, `--bg-color-secondary`, `--border-color`) that **do not exist** in the global stylesheet, so they fall back to hardcoded light-gray values regardless of theme. Form controls in the settings panel use Tailwind `dark:` variants that are silently broken because of a separate, pre-existing bug (see "Theme target mismatch" below).

The SVG canvas preview itself is intentionally not theme-aware: it represents a physical sheet for fabrication/cutting, and should always look like that sheet.

## Goals

1. The generator's chrome (header, settings column, preview pane background) responds to the site's active theme.
2. Form controls (number inputs, selects, range sliders) in the settings panel respond to the active theme.
3. The SVG canvas preview stays a "sheet" — white background, black strokes, pink margin guides, black dimension annotations — in both themes.
4. The exported PDF stays a sheet, regardless of theme.
5. A theme toggle is reachable from inside the generator (the page is fullscreen, so the main nav is not visible).
6. Fix the pre-existing site-wide Tailwind `dark:` variant bug as part of this work.

## Non-Goals

- Refactoring unrelated styling across the rest of the site.
- Changing the SVG canvas appearance based on theme.
- Adding per-user "preview as dark/light/sheet" options.
- Adding automated tests (project has no test framework; verification is manual).

## Theme target mismatch (pre-existing bug, fixed here)

`gatsby-plugin-dark-mode` writes the `dark` class to `document.body`:

```js
// node_modules/gatsby-plugin-dark-mode/gatsby-ssr.js
document.body.classList.replace(preferredTheme, newTheme)
```

Tailwind is configured with `darkMode: 'class'` (`tailwind.config.js:3`), which by default inspects the `<html>` element. As a result, **every `dark:` Tailwind variant in this codebase is currently a no-op**, including the ones in `src/components/PatternGenerator/SettingsPanel.js` and the existing `src/components/themeToggler.js`.

This task fixes the mismatch by mirroring the `dark` class onto `<html>` in `gatsby-browser.js` and `gatsby-ssr.js`, and by moving the CSS variable definitions in `src/styles/global.css` from `body` / `body.dark` to `html` / `html.dark`. A `body.dark` fallback rule is kept so any other code that still targets `body.dark` does not break during the transition.

## Architecture

Three layers, implemented in this order so each step is independently verifiable.

### Layer 1 — Theme target fix (site-wide)

- **`gatsby-browser.js`**: add a client-side effect that mirrors `document.body.classList` → `document.documentElement.classList` for the `dark` class. Guard with `typeof window !== 'undefined'`. Hook into `onClientEntry` and `onRouteUpdate` (SPA navigations) so the mirror re-applies after route changes.
- **`gatsby-ssr.js`** (new file): add an `onRenderBody` hook that calls `setHtmlAttributes({ lang, class: themeFromStorage })` so the initial server-rendered HTML already has the correct class — eliminating the white flash for dark-mode users. Read the persisted theme from `localStorage` (available at SSR via the plugin's existing mechanism, or via an inline `setPreBodyComponents` script that runs before paint).
- **`src/styles/global.css`**: move the existing `body { --bg: ...; --primary-color: ...; }` and `body.dark { --bg: #000; ... }` blocks to `html` and `html.dark` respectively. Keep one defensive `body.dark` block with the same variables as a fallback during the transition. The `html` block is the source of truth.

### Layer 2 — Generator chrome

- **`src/styles/scss/components/pattern-generator.scss`**: replace the three broken variable references with the existing global vars. Add one new variable pair (`--pattern-surface`) for the preview-pane background, which the main site does not define.

| Surface | Current (broken) | New |
|---|---|---|
| Outer container bg | `var(--bg-color, #f9fafb)` | `var(--bg)` |
| Header bg | `var(--bg-color-secondary, #ffffff)` | `var(--bg)` |
| Header border-bottom | `var(--border-color, #e5e7eb)` | `var(--separator-color)` |
| Settings column bg | `var(--bg-color, #f9fafb)` | `var(--bg)` |
| Settings column border-right | `var(--border-color, #e5e7eb)` | `var(--separator-color)` |
| Preview pane bg | `var(--bg-color-secondary, #ffffff)` | `var(--pattern-surface)` |
| Section heading color (`h3`) | hardcoded `#6b7280` | `var(--secondary-color)` |
| Buttons | hardcoded `#2563eb` | unchanged (brand blue) |

New variables, scoped to `.pattern-generator-standalone`:

```scss
.pattern-generator-standalone {
  --pattern-surface: #ffffff; // light: matches existing fallback
}

html.dark .pattern-generator-standalone {
  --pattern-surface: #1f2937; // dark: Tailwind gray-800 for harmony
}
```

Settings panel form controls (`input`, `select`, range slider) already have Tailwind `dark:` classes in `SettingsPanel.js`. Once Layer 1 lands, those classes will start applying automatically — no JS changes needed.

### Layer 3 — Theme toggle in generator header

- **`src/pages/design-pattern-generator.js`**: import the existing `ThemeTogglerComponent` from `../components/themeToggler`, render it in the header next to the title, and remove the `.pattern-generator-spacer` div (the toggle replaces the spacer's right-alignment job).
- The existing `ThemeToggler` component is reused verbatim. No changes to `src/components/themeToggler.js`.
- Header layout remains `display: flex; justify-content: space-between;` (already in the SCSS), so the toggle naturally sits on the right.

## What does NOT change

- `src/components/PatternGenerator/SvgPreview.js` — SVG canvas is a fabrication preview, not a UI surface. Stays white background, black strokes, pink (`rgba(255, 200, 200, 0.3)`) margin guides, black dimension annotations.
- `src/components/PatternGenerator/PdfExporter.js` — exported PDF reflects the on-screen sheet, not the site theme.
- `src/components/PatternGenerator/PatternEngine.js` — pure math, no theming.
- `src/components/PatternGenerator/usePersistedSettings.js` — settings persistence, unrelated to theme.

## Files touched (5)

1. `gatsby-browser.js` — add theme-class mirroring (client).
2. `gatsby-ssr.js` — new file; SSR theme-class application to prevent flash.
3. `src/styles/global.css` — move CSS variable blocks from `body`/`body.dark` to `html`/`html.dark`; keep `body.dark` as fallback.
4. `src/styles/scss/components/pattern-generator.scss` — wire to global vars; add `--pattern-surface` pair.
5. `src/pages/design-pattern-generator.js` — drop `<ThemeToggler />` into header; remove spacer div.

Approximate diff size: ~50 lines total. No new dependencies, no new files in `src/components`.

## Implementation order

1. **Layer 1** (theme target fix). Verify: existing `dark:` Tailwind variants on the main site now actually apply in dark mode.
2. **Layer 2** (generator chrome). Verify: header, settings column, preview pane all read the dark vars in dark mode; form controls become `bg-gray-800 text-white` via the now-functional Tailwind `dark:` variants.
3. **Layer 3** (toggle in header). Verify: theme can be toggled from inside the generator; toggle's own `dark:` styling now works.
4. **Manual QA pass** — see "Testing" below.

## Testing

This project has no test framework (no Jest/Vitest config, no `__tests__` directory). All commits to date have been verified by manual visual inspection. Testing for this change is:

- **Manual, dev server**: `npm run develop`, then exercise:
  - Light mode: chrome unchanged from today (the new fallbacks match the broken fallback colors already in the SCSS, so visual diff should be ~zero in light mode).
  - Toggle to dark mode from the main nav: every surface on the generator page becomes dark, including form controls.
  - Toggle to dark mode from the generator's own header: same result.
  - Reload the page in dark mode: no white flash before theme applies.
  - Mobile breakpoint (`<768px`): header, settings column, preview pane all theme-aware.
  - PDF export: still looks like a sheet (white bg, black strokes) regardless of theme.
- **Pre-implementation grep**: search the codebase for any other `body.dark` references before changing the CSS variable selectors. If found, either update them or keep the `body.dark` fallback rule.
- **Build verification**: `npm run build`, then visually confirm `public/design-pattern-generator/index.html` does not flash light in dark mode.

No automated tests added.

## Rollout

- Single PR, no feature flag. The change is CSS-driven and a theme-toggle placement — fully backward compatible.
- After merge, run the production build to confirm the static output behaves correctly.
- Monitor for visual regressions on the rest of the site; the only behavior change site-wide is that previously-no-op `dark:` Tailwind variants will now apply, which is the intended fix.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| White flash on dark-mode first paint | Medium | `gatsby-ssr.js` reads persisted theme and sets `<html class="dark">` at SSR time. If the plugin does not expose the persisted theme at SSR, fall back to a `setPreBodyComponents` inline script that reads `localStorage` and sets the class before paint. |
| `body.dark` references elsewhere in the codebase | Low | Grep before changing selectors. Keep a defensive `body.dark` fallback rule in `global.css` for one release. |
| Tailwind purges `dark:` classes | None | `dark:` classes are literal in JSX, so they're already in the content scan (`./src/**/*.{js,jsx,ts,tsx}` in `tailwind.config.js:1`). |
| `gatsby-plugin-dark-mode` overrides our class mirror | Low | Verified plugin source: it only manipulates `document.body.classList` in browser code, not SSR. No conflict. |
| Toggle placement shifts the header layout | Low | The existing header uses `justify-content: space-between` with a 100px spacer on the right. Removing the spacer and adding the toggle (which has its own width) preserves the visual balance. |
