# Design Pattern Generator Dark/Light Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Design Pattern Generator page respond to the site's dark/light theme (chrome + form controls), and fix the pre-existing site-wide Tailwind `dark:` variant bug by mirroring the theme class onto `<html>`.

**Architecture:** Three layers, applied in order. (1) Theme target fix: a `gatsby-ssr.js` inline script reads the persisted theme and sets `<html class="dark">` before paint; a `gatsby-browser.js` effect keeps the mirror in sync client-side; CSS variable definitions move from `body`/`body.dark` to `html`/`html.dark`. (2) Generator chrome: SCSS variables in `pattern-generator.scss` switch from broken/undefined local vars to the existing global vars, plus one new `--pattern-surface` pair for the preview pane. (3) Theme toggle placement: import the existing `<ThemeToggler />` component into the generator page's header.

**Tech Stack:** Gatsby (static site), SCSS, Tailwind CSS (`darkMode: 'class'`), `gatsby-plugin-dark-mode`.

**Spec:** `docs/superpowers/specs/2026-06-10-pattern-generator-dark-theme-design.md`

**Working directory:** `/Users/mitzuuuu/code/personal/projects/mihaiserban.dev`

**Pre-implementation finding (already done during planning):** Grep of the codebase for `body.dark` returned only the one rule in `src/styles/global.css:41` that we are moving. No other consumers — the defensive `body.dark` fallback in the spec is unnecessary and the plan omits it.

**Testing note:** This project has no test framework (no Jest/Vitest, no `__tests__`). Verification is manual via `npm run develop` and visual inspection. Each task lists concrete manual checks. Build verification via `npm run build` is the final gate.

---

## File structure

Files modified or created by this plan:

| File | Change | Responsibility |
|---|---|---|
| `gatsby-ssr.js` | **Create** | Inline script (rendered before body content) that reads persisted theme from `localStorage` and sets `document.documentElement.classList` AND `document.body.classList` before paint, preventing white flash. |
| `gatsby-browser.js` | **Modify** | Add `onClientEntry` + `onRouteUpdate` hooks that mirror the `dark` class from `body` to `html` after every navigation. |
| `src/styles/global.css` | **Modify** | Move CSS-var blocks from `body` / `body.dark` to `html` / `html.dark`; delete the now-redundant `body.dark` block. |
| `src/styles/scss/components/pattern-generator.scss` | **Modify** | Replace 3 broken `var(--bg-color, ...)` references with existing global vars; add `--pattern-surface` pair; use `var(--secondary-color)` for `h3` headings. |
| `src/pages/design-pattern-generator.js` | **Modify** | Import existing `ThemeTogglerComponent`; render it in the header next to the title; remove the `.pattern-generator-spacer` div. |

Files NOT touched (called out for the implementer so they don't drift):
- `src/components/PatternGenerator/SvgPreview.js` — canvas stays a sheet.
- `src/components/PatternGenerator/PdfExporter.js` — PDF output is theme-independent.
- `src/components/PatternGenerator/PatternEngine.js` — pure math.
- `src/components/PatternGenerator/usePersistedSettings.js` — settings persistence, unrelated to theme.
- `src/components/themeToggler.js` — reused verbatim, no changes.

---

## Task 1: Create `gatsby-ssr.js` with theme-class mirror script

**Files:**
- Create: `gatsby-ssr.js`

The plugin's own `gatsby-ssr.js` (in `node_modules/gatsby-plugin-dark-mode/gatsby-ssr.js`) sets `document.body.classList` via an inline script rendered with `setPreBodyComponents`. We replace that with our own script that does the same AND also sets `document.documentElement.classList`, so Tailwind's `darkMode: 'class'` selector (`html.dark`) matches before first paint.

Gatsby only honors the *last* `onRenderBody` call per plugin/source, so writing our own `gatsby-ssr.js` in the project root **overrides** the plugin's. We are responsible for replicating the plugin's behavior (body class + `window.__theme` + `window.__setPreferredTheme` + `__onThemeChange`) and adding the html mirror.

- [ ] **Step 1: Create `gatsby-ssr.js` with the SSR script**

Create `gatsby-ssr.js` at the project root with this exact content:

```js
/* eslint-disable */
const React = require("react");

exports.onRenderBody = function ({ setPreBodyComponents }) {
  setPreBodyComponents([
    React.createElement("script", {
      key: "theme-mirror",
      dangerouslySetInnerHTML: {
        __html: `
void function () {
  window.__onThemeChange = function () {}

  var preferredTheme
  try {
    preferredTheme = localStorage.getItem('theme')
  } catch (err) {}

  function applyToRoot(newTheme) {
    var html = document.documentElement
    var body = document.body
    if (html.classList.contains(newTheme)) {
      // already there
    } else {
      html.classList.add(newTheme)
    }
    if (body.classList.contains(newTheme)) {
      // already there
    } else {
      body.classList.add(newTheme)
    }
  }

  function setTheme(newTheme) {
    applyToRoot(newTheme)
    window.__theme = newTheme
    preferredTheme = newTheme
    window.__onThemeChange(newTheme)
  }

  window.__setPreferredTheme = function (newTheme) {
    setTheme(newTheme)
    try {
      localStorage.setItem('theme', newTheme)
    } catch (err) {}
  }

  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
  darkQuery.addListener(function (e) {
    window.__setPreferredTheme(e.matches ? 'dark' : 'light')
  })

  setTheme(preferredTheme || (darkQuery.matches ? 'dark' : 'light'))
}()
        `,
      },
    }),
  ]);
};
```

- [ ] **Step 2: Verify the file is created and parses**

Run: `node -e "const m = require('./gatsby-ssr.js'); console.log(typeof m.onRenderBody);"`

Expected: `function`

- [ ] **Step 3: Commit**

```bash
git add gatsby-ssr.js
git commit -m "feat: mirror theme class to <html> at SSR to fix Tailwind dark: variants"
```

---

## Task 2: Add client-side mirror in `gatsby-browser.js`

**Files:**
- Modify: `gatsby-browser.js` (current contents: 5 lines importing global.scss and markdown.scss and a service worker handler)

The plugin's client-side behavior is in its `ThemeToggler.js`, which calls `window.__setPreferredTheme` and reads `window.__theme`. That keeps working untouched. We only need to ensure that whenever the plugin's `document.body` class changes, our `html` class mirrors it. The simplest approach: a small `MutationObserver` on `body.classList` that mirrors any class containing `dark` to `html`. This is robust to the plugin's own implementation and runs once per page load.

- [ ] **Step 1: Replace `gatsby-browser.js` contents**

The full new contents of `gatsby-browser.js`:

```js
/* eslint-disable */

import "./src/styles/scss/global.scss";
import "./src/styles/scss/markdown.scss";

export const onServiceWorkerUpdateReady = () => {
  window.location.reload();
};

const THEME_CLASSES = ["dark", "light"];

const syncThemeClass = () => {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;
  if (!html || !body) return;
  THEME_CLASSES.forEach((cls) => {
    if (body.classList.contains(cls)) {
      if (!html.classList.contains(cls)) html.classList.add(cls);
    } else {
      if (html.classList.contains(cls)) html.classList.remove(cls);
    }
  });
};

const startThemeObserver = () => {
  if (typeof document === "undefined" || !document.body) return;
  syncThemeClass();
  const observer = new MutationObserver(syncThemeClass);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
};

export const onClientEntry = () => {
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", startThemeObserver, {
        once: true,
      });
    } else {
      startThemeObserver();
    }
  }
};

export const onRouteUpdate = () => {
  syncThemeClass();
};
```

- [ ] **Step 2: Verify the file parses**

Run: `node --check gatsby-browser.js 2>&1 || true`

Note: `node --check` will fail because `gatsby-browser.js` uses ES module syntax that Node doesn't parse by default. The expected output is a parse error from Node, which is fine — Gatsby uses Babel to transpile this file. To verify the file is well-formed for Babel, run:

Run: `npx --no-install babel gatsby-browser.js --presets=gatsby 2>&1 | head -5 || true`

Expected: some transpiled output (Babel warning about `no babelrc` is fine; the absence of syntax errors is the signal).

If Babel isn't directly runnable, a simpler check is to just confirm the dev server starts. Run the dev server check in Step 3.

- [ ] **Step 3: Smoke-test the dev server**

Run: `timeout 25 npx gatsby develop 2>&1 | head -40 || true`

Expected: dev server starts, shows "You can now view ... at http://localhost:8000/" within 20s. Then `timeout` kills it.

If the server crashes with a syntax error in `gatsby-browser.js`, fix the file and re-run.

- [ ] **Step 4: Manual verify (light mode default)**

Open the dev server URL in a browser with `localStorage` empty (or `localStorage.removeItem('theme')` in the console, then reload).

Expected: page loads. The `body` and `html` both have NO `dark` class. (The class is applied by the inline script only when a theme is stored or the system preference is dark.)

- [ ] **Step 5: Manual verify (dark mode)**

In the browser console, run:
```js
localStorage.setItem('theme', 'dark');
location.reload();
```

Expected: page reloads, the `<html>` and `<body>` elements both have `class="dark"`. The page renders in dark mode (Tailwind `dark:` variants now work; CSS vars from `html.dark` apply).

- [ ] **Step 6: Commit**

```bash
git add gatsby-browser.js
git commit -m "feat: keep <html> class in sync with body theme class on the client"
```

---

## Task 3: Move CSS variable blocks from `body` to `html` in `global.css`

**Files:**
- Modify: `src/styles/global.css:32-48`

The pre-implementation grep confirmed that `body.dark` is only referenced in the rule we're moving. No fallback block is needed.

- [ ] **Step 1: Edit `src/styles/global.css`**

The current file (lines 32-48):

```css
body {
  --bg: white;
  --alternate-bg: transparent;
  --primary-color: #222;
  --secondary-color: rgb(96, 96, 96);
  --textLink: #1e56a9;
  --separator-color: #e6e6e6;
}

body.dark {
  --bg: #000;
  --alternate-bg: white;
  --primary-color: white;
  --secondary-color: #aaaaaa;
  --textLink: #3ea6ff;
  --separator-color: #e6e6e6;
}
```

Replace those two blocks with:

```css
html {
  --bg: white;
  --alternate-bg: transparent;
  --primary-color: #222;
  --secondary-color: rgb(96, 96, 96);
  --textLink: #1e56a9;
  --separator-color: #e6e6e6;
}

html.dark {
  --bg: #000;
  --alternate-bg: white;
  --primary-color: white;
  --secondary-color: #aaaaaa;
  --textLink: #3ea6ff;
  --separator-color: #e6e6e6;
}
```

Leave the rest of the file (the `body` rule at lines 50-59, the `::selection`, `a`, `::-webkit-scrollbar` rules, etc.) untouched.

- [ ] **Step 2: Verify the file still contains the rest of the body styling**

Run: `grep -n "^body" src/styles/global.css`

Expected: one match for the `body` rule at line 50 (now shifted by a few lines), no matches for `body.dark` anywhere.

- [ ] **Step 3: Manual verify (light + dark mode)**

In the dev server (still running from Task 2):

- With `localStorage` cleared, reload. The body bg should be `white` and text `#222` (same as before — light mode unchanged).
- Set `localStorage.setItem('theme', 'dark')` and reload. The body bg should be `#000` and text `white`. Tailwind `dark:` variants (e.g., on the theme toggle button in the main nav) should now apply.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "refactor: move CSS theme vars from body to html so Tailwind darkMode: 'class' matches"
```

---

## Task 4: Wire `pattern-generator.scss` to global theme vars

**Files:**
- Modify: `src/styles/scss/components/pattern-generator.scss`

Three references in this file use vars that don't exist (`--bg-color`, `--bg-color-secondary`, `--border-color`). Replace with the existing global vars. Add one new var pair (`--pattern-surface`) for the preview-pane background, with light/dark values scoped to the page.

- [ ] **Step 1: Add the `--pattern-surface` var pair to the outer container rule**

In `src/styles/scss/components/pattern-generator.scss`, the first rule (lines 1-13):

```scss
.pattern-generator-standalone {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: var(--bg-color, #f9fafb);
  display: flex;
  flex-direction: column;
}
```

Replace with:

```scss
.pattern-generator-standalone {
  --pattern-surface: #ffffff;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

html.dark .pattern-generator-standalone {
  --pattern-surface: #1f2937;
}
```

- [ ] **Step 2: Replace `var(--bg-color-secondary, #ffffff)` in the header**

Lines 15-23 of the original file:

```scss
.pattern-generator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-color-secondary, #ffffff);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  flex-shrink: 0;
}
```

Replace with:

```scss
.pattern-generator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg);
  border-bottom: 1px solid var(--separator-color);
  flex-shrink: 0;
}
```

- [ ] **Step 3: Replace the settings column `var(--bg-color, ...)` and `var(--border-color, ...)`**

Lines 58-65 of the original file:

```scss
.pattern-settings {
  flex: 0 0 280px;
  min-width: 280px;
  overflow-y: auto;
  padding: 1rem;
  background: var(--bg-color, #f9fafb);
  border-right: 1px solid var(--border-color, #e5e7eb);
}
```

Replace with:

```scss
.pattern-settings {
  flex: 0 0 280px;
  min-width: 280px;
  overflow-y: auto;
  padding: 1rem;
  background: var(--bg);
  border-right: 1px solid var(--separator-color);
}
```

- [ ] **Step 4: Replace the preview pane `var(--bg-color-secondary, #ffffff)`**

Lines 67-75 of the original file:

```scss
.pattern-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: auto;
  background: var(--bg-color-secondary, #ffffff);
}
```

Replace with:

```scss
.pattern-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: auto;
  background: var(--pattern-surface);
}
```

- [ ] **Step 5: Replace the hardcoded `h3` color**

In the `.settings-panel` block (lines 85-100 of the original), the `h3` rule:

```scss
  h3 {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
  }
```

Replace with:

```scss
  h3 {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--secondary-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
  }
```

- [ ] **Step 6: Update the mobile media-query border**

The mobile breakpoint (lines 123-141) re-uses `var(--border-color, ...)`. Replace it with the same global var:

```scss
@media (max-width: 768px) {
  .pattern-generator-layout {
    flex-direction: column;
  }

  .pattern-settings {
    flex: none;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid var(--separator-color);
  }

  .pattern-generator-spacer {
    display: none;
  }

  .pattern-generator-title {
    font-size: 1rem;
  }
}
```

- [ ] **Step 7: Verify no broken vars remain**

Run: `rg "var\(--bg-color|var\(--bg-color-secondary|var\(--border-color" src/styles/scss/components/pattern-generator.scss`

Expected: no matches.

- [ ] **Step 8: Manual verify (light mode unchanged)**

In the dev server, in light mode (no `dark` in `localStorage`): navigate to `/design-pattern-generator`. Compare to a screenshot/memory of the page before this change. The generator's outer background, header, settings column, and preview pane should look essentially identical to the pre-change appearance (the fallback colors we replaced happened to match what these surfaces *should* be in light mode, so the diff should be near-zero).

- [ ] **Step 9: Manual verify (dark mode)**

In the dev server, set `localStorage.setItem('theme', 'dark')` and reload `/design-pattern-generator`. Expected:

- Outer container, header, settings column: dark bg (`#000`), light text.
- Section heading labels (`h3`): light gray (`#aaaaaa`).
- Form controls (inputs, selects, range sliders): `bg-gray-800 text-white` (the existing Tailwind `dark:` classes in `SettingsPanel.js` now apply, because Layer 1 is in place).
- Preview pane: dark gray bg (`#1f2937`).
- SVG canvas itself: still white bg, black strokes, pink margin guides, black dimension annotations.

- [ ] **Step 10: Commit**

```bash
git add src/styles/scss/components/pattern-generator.scss
git commit -m "feat: wire pattern generator chrome to site theme variables"
```

---

## Task 5: Add theme toggle to generator header

**Files:**
- Modify: `src/pages/design-pattern-generator.js:1-79`

Import the existing `ThemeTogglerComponent`, render it in the header next to the title, and remove the `.pattern-generator-spacer` div. The toggle component is reused verbatim.

- [ ] **Step 1: Add the import**

The current imports at the top of `src/pages/design-pattern-generator.js`:

```js
import React, { useRef, useMemo, useCallback } from "react";
import { ArrowLeft } from "react-feather";
import SettingsPanel from "../components/PatternGenerator/SettingsPanel";
import SvgPreview from "../components/PatternGenerator/SvgPreview";
import {
  generatePattern,
  calculateCoverage,
} from "../components/PatternGenerator/PatternEngine";
import { exportToPdf } from "../components/PatternGenerator/PdfExporter";
import usePersistedSettings from "../components/PatternGenerator/usePersistedSettings";
import "../styles/scss/components/pattern-generator.scss";
```

Add one import (alphabetically after the other component imports, before the style import):

```js
import ThemeTogglerComponent from "../components/themeToggler";
```

The final imports block:

```js
import React, { useRef, useMemo, useCallback } from "react";
import { ArrowLeft } from "react-feather";
import SettingsPanel from "../components/PatternGenerator/SettingsPanel";
import SvgPreview from "../components/PatternGenerator/SvgPreview";
import {
  generatePattern,
  calculateCoverage,
} from "../components/PatternGenerator/PatternEngine";
import { exportToPdf } from "../components/PatternGenerator/PdfExporter";
import usePersistedSettings from "../components/PatternGenerator/usePersistedSettings";
import ThemeTogglerComponent from "../components/themeToggler";
import "../styles/scss/components/pattern-generator.scss";
```

- [ ] **Step 2: Replace the header JSX**

The current header (lines 72-79):

```jsx
      <div className="pattern-generator-header">
        <a href="/" className="pattern-back-button">
          <ArrowLeft size={20} />
          <span>mihaiserban.dev</span>
        </a>
        <h1 className="pattern-generator-title">Design Pattern Generator</h1>
        <div className="pattern-generator-spacer" />
      </div>
```

Replace with:

```jsx
      <div className="pattern-generator-header">
        <a href="/" className="pattern-back-button">
          <ArrowLeft size={20} />
          <span>mihaiserban.dev</span>
        </a>
        <h1 className="pattern-generator-title">Design Pattern Generator</h1>
        <div className="pattern-generator-header-actions">
          <ThemeTogglerComponent />
        </div>
      </div>
```

- [ ] **Step 3: Add a small SCSS rule for `.pattern-generator-header-actions`**

In `src/styles/scss/components/pattern-generator.scss`, add this rule (place it after the `.pattern-generator-header` rule, around line 24):

```scss
.pattern-generator-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
  justify-content: flex-end;
}
```

The `min-width: 100px` preserves the visual balance the old 100px spacer gave the header, so the title doesn't shift when the toggle's icon swaps between sun and moon (both ~40px wide, but the container needs to be wide enough to feel stable).

- [ ] **Step 4: Drop the now-unused mobile rule for `.pattern-generator-spacer`**

The mobile media-query currently hides `.pattern-generator-spacer` (line 135-137 of the original file). Since the spacer div is gone, this rule is dead code. Remove it:

The mobile block (lines 123-141 originally) should now read:

```scss
@media (max-width: 768px) {
  .pattern-generator-layout {
    flex-direction: column;
  }

  .pattern-settings {
    flex: none;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid var(--separator-color);
  }

  .pattern-generator-title {
    font-size: 1rem;
  }
}
```

- [ ] **Step 5: Manual verify (toggle works in the generator)**

In the dev server, navigate to `/design-pattern-generator`. Confirm:

- A small icon button (sun/moon) is visible in the header to the right of the title.
- Clicking it switches the page between light and dark mode.
- The header, settings column, form controls, and preview pane all respond.
- The SVG canvas itself stays a sheet in both modes.

- [ ] **Step 6: Manual verify (theme persists across navigation)**

Click the toggle to set dark mode, then click the "← mihaiserban.dev" back-button. The main site should also be in dark mode. Click back into the generator — dark mode persists. This is the existing `localStorage('theme')` behavior of the plugin, but verify the mirror still keeps `<html>` and `<body>` in sync after SPA navigation.

- [ ] **Step 7: Commit**

```bash
git add src/pages/design-pattern-generator.js src/styles/scss/components/pattern-generator.scss
git commit -m "feat: add theme toggle to design pattern generator header"
```

---

## Task 6: Final build verification

**Files:** none modified

- [ ] **Step 1: Production build**

Run: `npm run build 2>&1 | tail -30`

Expected: build completes without errors. The output should include the line `Done building in <N>s` (or equivalent Gatsby success message).

If the build fails with a SCSS error, the most likely cause is an unbalanced brace in `pattern-generator.scss` — re-check Task 4's edits.

If the build fails with a JavaScript error, the most likely cause is the new import in `design-pattern-generator.js` — confirm the path `../components/themeToggler` resolves and the component's default export exists.

- [ ] **Step 2: Serve and verify the static output**

Run: `npx --no-install gatsby serve 2>&1 | head -5 &` (then `kill %1` after a moment)

In a browser, visit `http://localhost:9000/design-pattern-generator/`. Expected:

- Page loads without console errors.
- With `localStorage('theme')` empty: light mode, looks the same as before this change.
- With `localStorage('theme') = 'dark'`: dark mode chrome, form controls, preview pane; SVG sheet stays light.
- No white flash on initial paint in dark mode (the SSR script applies the class before paint).

- [ ] **Step 3: Verify the production HTML has the inline theme script**

Run: `rg -c "applyToRoot\|__setPreferredTheme" public/ -l 2>&1 | head -3`

Expected: at least one match in `public/index.html` (or in a chunked JS file, depending on Gatsby's split behavior). The SSR script should be present in the built output.

- [ ] **Step 4: Final manual QA sweep**

Verify the full manual checklist from the spec's Testing section:

- [ ] Light mode: chrome unchanged from today.
- [ ] Toggle to dark from main nav: generator page goes dark.
- [ ] Toggle to dark from generator's own header: same result.
- [ ] Reload in dark mode: no white flash.
- [ ] Mobile breakpoint (`<768px`): everything themes correctly.
- [ ] PDF export: looks like a sheet (white bg, black strokes) regardless of theme.

- [ ] **Step 5: Commit (if any verification-driven tweaks were needed)**

If Steps 1-4 surfaced a small fix (e.g., a color tweak, a missing dark variant, a layout glitch), make the fix and commit:

```bash
git add -A
git commit -m "fix: post-build verification tweaks for pattern generator dark mode"
```

If nothing needed fixing, no commit.

---

## Self-review

**Spec coverage check** (against `docs/superpowers/specs/2026-06-10-pattern-generator-dark-theme-design.md`):

- Goal 1 (chrome responds to theme) → Tasks 4, 5 ✓
- Goal 2 (form controls respond to theme) → Task 1+2 (unblock Tailwind `dark:`), Task 4 (no JS changes needed; existing classes in `SettingsPanel.js` start working) ✓
- Goal 3 (SVG canvas stays a sheet) → explicitly NOT touched in any task ✓
- Goal 4 (PDF export stays a sheet) → explicitly NOT touched in any task ✓
- Goal 5 (theme toggle reachable from inside generator) → Task 5 ✓
- Goal 6 (fix pre-existing Tailwind `dark:` bug) → Tasks 1, 2, 3 ✓
- Theme target mismatch section → Tasks 1, 2, 3 ✓
- Files touched (5) → Tasks 1, 2, 3, 4, 5 cover exactly the 5 files; Task 6 verifies ✓
- Implementation order (Layer 1 → 2 → 3) → Tasks 1+2+3 = Layer 1, Task 4 = Layer 2, Task 5 = Layer 3 ✓
- Testing section (manual, dev server, grep, build verification) → Tasks 1-6 each have manual-verify steps; build verification in Task 6 ✓
- Rollout section → single PR with atomic commits per task; Task 6 is the final gate ✓
- Risks table → white-flash risk addressed in Task 1 (inline script sets class before paint); `body.dark` risk removed entirely (grep found no other consumers); Tailwind purge risk n/a (classes are literal); plugin override risk verified (plugin only touches `body.classList` in browser, our `MutationObserver` mirrors it); header layout shift risk addressed in Task 5 (`min-width: 100px` on `.pattern-generator-header-actions`) ✓

**Placeholder scan:** No TBDs/TODOs. Every code block is concrete. The optional Step 5 of Task 6 ("commit if tweaks were needed") is conditional on actual work, not a placeholder.

**Type/name consistency:** Theme-related class names (`dark`, `light`) used consistently across Tasks 1, 2, 3. Component name `ThemeTogglerComponent` matches the existing `src/components/themeToggler.js` default export. CSS var names (`--pattern-surface`, `--bg`, `--separator-color`, `--secondary-color`) match across Tasks 3, 4, 5.

No gaps. Plan is ready.
