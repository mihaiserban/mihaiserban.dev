# Design Refresh — Precision with Warmth

**Date:** 2026-07-02
**Status:** Approved
**Scope:** Thoughtful refresh of existing site design. Keep sidebar layout and content structure. Refine typography, color palette, spacing, and add one signature detail.

---

## Color Palette

**Primary inspiration:** Linear.app (precision, discipline) + Claude (warmth, humanist touch)

### Tokens

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--canvas` | `#faf9f5` | `#141413` | Page background |
| `--surface` | `#f3f0ea` | `#1a1918` | Elevated surfaces (sidebar, cards) |
| `--ink` | `#141413` | `#f3f0ea` | Primary text |
| `--ink-muted` | `#5a5753` | `#8e8b82` | Secondary text, captions |
| `--hairline` | `#e6dfd8` | `#2a2825` | Borders, dividers, tag outlines |
| `--accent` | `#cc7858` | `#d4845a` | Links, active states, selection, key details |
| `--accent-hover` | `#b5674a` | `#e0966a` | Hover state for accent elements |

### Rules
- **Single chromatic accent.** The old blue link color (`#1e56a9` / `#3ea6ff`) is removed entirely. The warm amber-coral accent carries all chromatic load.
- **Dark mode is warm black** (`#141413`), not pure `#000`. Text is warm off-white (`#f3f0ea`), not pure `#fff`.
- **Light mode has cream depth** (`#faf9f5`), not sterile white.
- **Layered surfaces.** Dark mode uses `#1a1918` for sidebar/elevated areas. Light mode uses `#f3f0ea`. One level of depth — no nested card pyramids.

---

## Typography

### Font stack
- **Primary:** Inter (via `@fontsource/inter`) — variable font with optical sizing
- **Code:** JetBrains Mono (via `@fontsource/jetbrains-mono`)
- System font stack removed as the primary face

### Type scale

| Role | Selector | Size | Weight | Line-height | Tracking | Usage |
|------|----------|------|--------|-------------|----------|-------|
| Display | h1 | 36px | 600 | 1.15 | -0.8px | Page headings |
| Heading | h2 | 24px | 600 | 1.25 | -0.4px | Section headings |
| Subhead | h3 | 18px | 500 | 1.4 | -0.1px | Card/blog titles |
| Body | p, body | 16px | 400 | 1.65 | 0 | All body copy |
| Body sm | small, caption | 14px | 400 | 1.55 | 0 | Captions, dates, tags |
| Code | code, pre | 14px | 400 | 1.7 | 0 | Inline code, code blocks |

### Rules
- **Headings get negative tracking.** H1/H2 use measured tracking for precision feel.
- **Body line-height is 1.65.** Up from ~1.5. Gives paragraphs editorial breathing room.
- **All headings stay sans-serif.** Inter handles both display and body.
- **Weight 600 (Semibold) for headings**, not 700 (Bold). Reads confident, not shouting.

---

## Layout

### Sidebar
- **Width:** 260px (up from 240px) — breathing room for refined typography
- **Padding:** Increased internal padding between headshot / name / nav / social zones
- **Background:** Uses `--surface` instead of `--canvas`. The sidebar is a deliberate, elevated surface.

### Content area
- **Max-width:** 680px default, 740px on blog posts
- **Padding:** Consistent 48px/32px/24px vertical rhythm scale (replacing arbitrary `mt-8`/`mt-4` classes)

### Active nav
- **Left accent bar:** 2px solid `--accent` bar on the left edge of the active nav item. Replaces the current underline treatment.

### Dividers
- **1px solid `--hairline`.** Replaces the gradient fade CSS trick. Cleaner, more confident.

### Tags
- **Border-radius: 4px** (from 15px). Sharper edges read as precise rather than candy-like.

---

## Signature Element

### Ambient sidebar gradient
The sidebar background carries an extremely subtle diagonal gradient — `--canvas` to `--surface` — that deepens slightly when the active page shifts. Barely visible but registers as intentional rather than default.

- **Light mode:** `#faf9f5` → `#f3f0ea`, diagonal (135deg), opacity shift only
- **Dark mode:** `#141413` → `#1a1918`, warm-to-cool whisper
- **No animation beyond the gradient.** No scroll effects, page transitions, or parallax.

### Blinking cursor (preserved)
The existing styled-components cursor animation in the sidebar bio is kept. It's already the site's most distinctive detail.

---

## Implementation Notes

- All color tokens defined as CSS custom properties in `global.css`/`global.scss`, replacing the current `--bg`, `--primary-color`, `--secondary-color`, `--textLink`, `--separator-color` variables.
- Inter and JetBrains Mono installed via `@fontsource` packages.
- Tailwind config extended with custom colors matching the CSS variables for utility class usage.
- Tailwind config extended with custom font families.
- SCSS files updated only where they set colors/fonts manually. Tailwind utility classes in JSX are preferred for layout/spacing but existing SCSS component styles can stay if they don't conflict.
- Dark mode SSR script in `gatsby-ssr.js` updated for new variable names if needed.
- `gatsby-browser.js` MutationObserver kept as-is for class sync.
- Pattern Generator page gets the new tokens but keeps its own Tailwind utility colors for controls (green/blue buttons are functional, not brand).
- Bookshelf, projects, about, blog pages all inherit changes from the base token updates. No page-level restructuring.
