# Sheet Polygon Cutout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Design Pattern Generator's sheet outline configurable per edge. Each of the 4 edges can be split into 2 sub-edges, with a "position" slider (0–1) controlling the split point. The resulting 4–8 vertex polygon replaces the rectangle in the SVG preview, DXF export, and PDF export. The settings panel lists every vertex with its interior angle in degrees.

**Architecture:** A new pure module `sheetOutline.js` exports `getSheetVertices(width, height, sheetShape)` and `getVertexAngles(vertices)`. These are the single source of truth used by the SVG preview, the DXF exporter, and (transitively, via the SVG clone) the PDF exporter. A new `sheetShape` block in `DEFAULT_SETTINGS` carries 4 `{ enabled, position }` entries, one per edge. The settings panel gets a new "Sheet Shape" group with 4 checkboxes + sliders and a read-only "Corners" list.

**Tech Stack:** Gatsby (static site), React 18, plain JS, Tailwind utility classes for the settings panel.

**Spec:** `docs/superpowers/specs/2026-06-12-sheet-polygon-cutout-design.md`

**Working directory:** `/Users/mitzuuuu/code/personal/projects/mihaiserban.dev`

**Testing note:** This project has no test framework (no Jest/Vitest, no `__tests__`). Verification is manual via `npm run develop` and visual inspection. Each task lists concrete manual checks. Build verification via `npm run build` is the final gate.

---

## File structure

Files modified or created by this plan:

| File | Change | Responsibility |
|---|---|---|
| `src/components/PatternGenerator/sheetOutline.js` | **Create** | Pure functions: `getSheetVertices` and `getVertexAngles`. No React, no DOM. |
| `src/pages/design-pattern-generator.js` | **Modify** | Add `sheetShape` to `DEFAULT_SETTINGS`; pass `sheetShape` to `<SvgPreview />` and to `exportToDxf()`. |
| `src/components/PatternGenerator/SettingsPanel.js` | **Modify** | New "Sheet Shape" group: 4 checkboxes + sliders + read-only "Corners" list + "Reset all edges" link. New `handleSheetShapeChange` helper. |
| `src/components/PatternGenerator/SvgPreview.js` | **Modify** | Accept new `sheetShape` prop; replace outer `<rect>` sheet outline with `<polygon>` built from `getSheetVertices`. |
| `src/components/PatternGenerator/DxfExporter.js` | **Modify** | Accept new optional `sheetShape` arg; build sheet outline `LWPOLYLINE` from `getSheetVertices` (Y-flipped) instead of a hard-coded 4-vertex rectangle. |
| `src/components/PatternGenerator/PdfExporter.js` | **Modify** | Append a "Sheet Shape" row to the parameters block in `buildParamRows`. |

Files NOT touched (called out so the implementer doesn't drift):
- `src/components/PatternGenerator/PatternEngine.js` — pure shape generator, unrelated to the outline.
- `src/components/PatternGenerator/usePersistedSettings.js` — shallow-merge `{ ...defaults, ...parsed }` already handles the new nested `sheetShape` block as long as `DEFAULT_SETTINGS` includes it.

---

## Task 1: Create `sheetOutline.js` pure module

**Files:**
- Create: `src/components/PatternGenerator/sheetOutline.js`

This module is the single source of truth for the sheet polygon. Every other module that needs the outline (SvgPreview, DxfExporter) imports from here.

- [ ] **Step 1: Create the file with the two pure functions**

Create `src/components/PatternGenerator/sheetOutline.js` with this exact content:

```js
const DEFAULT_SPLIT = { enabled: false, position: 0.5 };

const POSITION_MIN = 0.001;
const POSITION_MAX = 0.999;

function clampPosition(p) {
  if (p == null) return 0.5;
  const n = Number(p);
  if (!Number.isFinite(n)) return 0.5;
  if (n < POSITION_MIN) return POSITION_MIN;
  if (n > POSITION_MAX) return POSITION_MAX;
  return n;
}

function getSplit(sheetShape, key) {
  const split = sheetShape && sheetShape[key];
  if (!split) return DEFAULT_SPLIT;
  return {
    enabled: Boolean(split.enabled),
    position: clampPosition(split.position),
  };
}

function round(n) {
  return Math.round(n * 10000) / 10000;
}

export function getSheetVertices(width, height, sheetShape) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const top = getSplit(sheetShape, 'topSplit');
  const right = getSplit(sheetShape, 'rightSplit');
  const bottom = getSplit(sheetShape, 'bottomSplit');
  const left = getSplit(sheetShape, 'leftSplit');

  const tl = { x: 0, y: 0 };
  const tr = { x: w, y: 0 };
  const br = { x: w, y: h };
  const bl = { x: 0, y: h };

  const vertices = [tl];

  if (top.enabled) {
    vertices.push({ x: round(w * top.position), y: 0 });
  }

  vertices.push(tr);

  if (right.enabled) {
    vertices.push({ x: w, y: round(h * right.position) });
  }

  vertices.push(br);

  if (bottom.enabled) {
    vertices.push({ x: round(w * (1 - bottom.position)), y: h });
  }

  vertices.push(bl);

  if (left.enabled) {
    vertices.push({ x: 0, y: round(h * (1 - left.position)) });
  }

  return vertices;
}

function angleBetween(prev, curr, next) {
  const v1x = curr.x - prev.x;
  const v1y = curr.y - prev.y;
  const v2x = next.x - curr.x;
  const v2y = next.y - curr.y;
  const dot = v1x * v2x + v1y * v2y;
  const det = v1x * v2y - v1y * v2x;
  return Math.atan2(det, dot) * (180 / Math.PI);
}

function classifyVertex(index, vertices, flags) {
  const total = vertices.length;
  if (total === 4) {
    return ['top-left corner', 'top-right corner', 'bottom-right corner', 'bottom-left corner'][index];
  }
  const roleByFlag = flags[index];
  if (roleByFlag) return roleByFlag;
  return 'corner';
}

export function getVertexAngles(vertices) {
  if (!Array.isArray(vertices) || vertices.length < 3) {
    return [];
  }

  const total = vertices.length;
  const flags = new Array(total).fill(null);

  if (total > 4) {
    const extras = total - 4;
    let topSplitSeen = false;
    let rightSplitSeen = false;
    let bottomSplitSeen = false;
    let leftSplitSeen = false;
    for (let i = 0; i < total; i++) {
      const prev = vertices[(i - 1 + total) % total];
      const curr = vertices[i];
      const next = vertices[(i + 1) % total];

      const prevHorizontal = prev.y === curr.y;
      const nextHorizontal = next.y === curr.y;
      const prevVertical = prev.x === curr.x;
      const nextVertical = next.x === curr.x;

      if (prevHorizontal && nextHorizontal && !topSplitSeen) {
        flags[i] = 'top edge split';
        topSplitSeen = true;
      } else if (prevVertical && nextVertical && !rightSplitSeen) {
        flags[i] = 'right edge split';
        rightSplitSeen = true;
      } else if (prevHorizontal && nextHorizontal && !bottomSplitSeen) {
        flags[i] = 'bottom edge split';
        bottomSplitSeen = true;
      } else if (prevVertical && nextVertical && !leftSplitSeen) {
        flags[i] = 'left edge split';
        leftSplitSeen = true;
      }
    }
    void extras;
  }

  return vertices.map((vertex, i) => {
    const prev = vertices[(i - 1 + total) % total];
    const next = vertices[(i + 1) % total];
    const signed = angleBetween(prev, vertex, next);
    const interior = 180 - signed;
    const normalized = ((interior % 360) + 360) % 360;
    return {
      vertex,
      angleDegrees: Math.round(normalized * 100) / 100,
      role: classifyVertex(i, vertices, flags),
    };
  });
}

export const SHEET_SHAPE_DEFAULT = {
  topSplit: { enabled: false, position: 0.5 },
  rightSplit: { enabled: false, position: 0.5 },
  bottomSplit: { enabled: false, position: 0.5 },
  leftSplit: { enabled: false, position: 0.5 },
};
```

- [ ] **Step 2: Verify the file loads without syntax errors**

Run: `node -e "require('./src/components/PatternGenerator/sheetOutline.js'); console.log('ok')"`
Expected: `ok` printed, exit code 0.

(If the project uses ESM-style imports elsewhere and the file fails to require, switch the `node -e` to `node --input-type=module -e "import('./src/components/PatternGenerator/sheetOutline.js').then(() => console.log('ok'))"`. The file uses `export` and is consumed by Gatsby's bundler, not Node directly, so the syntax is correct either way; this command is just a syntax check.)

- [ ] **Step 3: Commit**

```bash
git add src/components/PatternGenerator/sheetOutline.js
git commit -m "feat(pattern-generator): add sheetOutline pure module"
```

---

## Task 2: Add `sheetShape` to `DEFAULT_SETTINGS` and wire through the page

**Files:**
- Modify: `src/pages/design-pattern-generator.js:15-32` (the `DEFAULT_SETTINGS` object)
- Modify: `src/pages/design-pattern-generator.js:107-118` (the `<SvgPreview />` props)
- Modify: `src/pages/design-pattern-generator.js:47-73` (the `handleExport` function)

This task makes the new setting persistable and feeds it to the only consumer that needs it in this task (SvgPreview). The next tasks add the consumer modules.

- [ ] **Step 1: Import `SHEET_SHAPE_DEFAULT` in the page**

In `src/pages/design-pattern-generator.js`, change the import from `PatternEngine`:

```js
import {
  generatePattern,
  calculateCoverage,
} from "../components/PatternGenerator/PatternEngine";
```

to:

```js
import {
  generatePattern,
  calculateCoverage,
} from "../components/PatternGenerator/PatternEngine";
import { SHEET_SHAPE_DEFAULT } from "../components/PatternGenerator/sheetOutline";
```

- [ ] **Step 2: Add `sheetShape` to `DEFAULT_SETTINGS`**

In `src/pages/design-pattern-generator.js`, replace the `DEFAULT_SETTINGS` object (currently lines 15–32) with:

```js
const DEFAULT_SETTINGS = {
  width: 1000,
  height: 2000,
  marginTop: 50,
  marginBottom: 50,
  marginLeft: 50,
  marginRight: 50,
  sheetShape: SHEET_SHAPE_DEFAULT,
  shapeType: "circle",
  shapeSize: 20,
  spacing: 40,
  opacity: 20,
  gradientType: "topToBottom",
  lineThickness: 30,
  lineMinLength: 100,
  lineMaxLength: 400,
  cornerRadius: 0,
  lineCornerRadius: 50,
};
```

- [ ] **Step 3: Pass `sheetShape` to `<SvgPreview />`**

In the JSX of `DesignPatternPage` (the `<SvgPreview />` element around line 108), change the existing:

```jsx
<SvgPreview
  ref={svgRef}
  width={settings.width}
  height={settings.height}
  shapes={shapes}
  marginTop={settings.marginTop}
  marginBottom={settings.marginBottom}
  marginLeft={settings.marginLeft}
  marginRight={settings.marginRight}
/>
```

to:

```jsx
<SvgPreview
  ref={svgRef}
  width={settings.width}
  height={settings.height}
  shapes={shapes}
  marginTop={settings.marginTop}
  marginBottom={settings.marginBottom}
  marginLeft={settings.marginLeft}
  marginRight={settings.marginRight}
  sheetShape={settings.sheetShape}
/>
```

- [ ] **Step 4: Pass `sheetShape` to `exportToDxf`**

In `handleExport` (around line 47–73), find the DXF branch:

```js
if (format === "dxf") {
  try {
    const filename = `pattern-${settings.width}x${settings.height}.dxf`;
    exportToDxf(shapes, filename, settings.width, settings.height);
  } catch (error) {
    console.error("DXF export failed:", error);
    alert("DXF export failed. Please try again.");
  }
  return;
}
```

Change the `exportToDxf` call to pass `settings.sheetShape`:

```js
    exportToDxf(shapes, filename, settings.width, settings.height, settings.sheetShape);
```

(DxfExporter will accept the new optional arg in Task 5. For now, this call passes the 5th argument; it will be ignored by the current DxfExporter signature, which is harmless.)

- [ ] **Step 5: Manual check — page still loads and the SVG is unchanged**

Run: `npm run develop` (or rely on an already-running dev server).

Open `http://localhost:8000/design-pattern-generator/`.

Expected:
- Page renders without console errors.
- Sheet outline is still a rectangle (no splits enabled by default).
- Width/height/margins/patterns work exactly as before.

- [ ] **Step 6: Commit**

```bash
git add src/pages/design-pattern-generator.js
git commit -m "feat(pattern-generator): add sheetShape setting default and wire to SvgPreview"
```

---

## Task 3: Update `SvgPreview` to render the polygon outline

**Files:**
- Modify: `src/components/PatternGenerator/SvgPreview.js:9-13` (the component props)
- Modify: `src/components/PatternGenerator/SvgPreview.js:133-143` (the outer sheet-outline rect)

- [ ] **Step 1: Add the import**

At the top of `src/components/PatternGenerator/SvgPreview.js`, add (keep the existing `import React, { forwardRef } from "react";` line):

```js
import { getSheetVertices } from "./sheetOutline";
```

- [ ] **Step 2: Accept the new `sheetShape` prop**

Change the component's props destructure (currently `{ width, height, shapes, marginTop, marginBottom, marginLeft, marginRight }`) to:

```js
    { width, height, shapes, marginTop, marginBottom, marginLeft, marginRight, sheetShape },
```

- [ ] **Step 3: Compute vertices at the top of the render**

In the component body, just after the existing `const mr = marginRight || 0;` line (and the `DIM_PAD` / `dimBotY` / `dimLeftX` constants if you want vertices computed alongside them), add:

```js
    const vertices = getSheetVertices(width || 0, height || 0, sheetShape);
    const pointsAttr = vertices.map((v) => `${v.x},${v.y}`).join(' ');
```

(`width` and `height` are already destructured above and can be 0/undefined; `getSheetVertices` already handles those.)

- [ ] **Step 4: Replace the sheet-outline `<rect>` with a `<polygon>`**

Find the existing sheet-outline rect inside `<g className="svg-guides">`:

```jsx
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="white"
              stroke="black"
              strokeWidth="1"
            />
```

Replace it with:

```jsx
            <polygon
              points={pointsAttr}
              fill="white"
              stroke="black"
              strokeWidth="1"
            />
```

(The `width` and `height` references for the outline are no longer needed; they are still used by the margin guides and the dimension annotations below, which we leave alone.)

- [ ] **Step 5: Manual check — default state still shows a rectangle, polygon semantics correct**

The dev server should hot-reload. Refresh `/design-pattern-generator/`.

Expected:
- Sheet outline is still a rectangle (4 vertices, all on the bounding box).
- Margin guides, dimension annotations, and shape patterns render exactly as before.

- [ ] **Step 6: Commit**

```bash
git add src/components/PatternGenerator/SvgPreview.js
git commit -m "feat(pattern-generator): render sheet outline as polygon in SvgPreview"
```

---

## Task 4: Add the "Sheet Shape" group to `SettingsPanel`

**Files:**
- Modify: `src/components/PatternGenerator/SettingsPanel.js:1-3` (imports)
- Modify: `src/components/PatternGenerator/SettingsPanel.js:4-26` (component signature + helper)
- Modify: `src/components/PatternGenerator/SettingsPanel.js:30-103` (insertion point between Canvas and Margins)

- [ ] **Step 1: Add the import**

At the top of `src/components/PatternGenerator/SettingsPanel.js`, change:

```js
import React, { useState } from 'react';
import { SHAPE_TYPES, GRADIENT_TYPES } from './PatternEngine';
```

to:

```js
import React, { useState, useMemo } from 'react';
import { SHAPE_TYPES, GRADIENT_TYPES } from './PatternEngine';
import { getSheetVertices, getVertexAngles, SHEET_SHAPE_DEFAULT } from './sheetOutline';
```

- [ ] **Step 2: Add the `handleSheetShapeChange` helper and derived data**

In the `SettingsPanel` component body, just after the existing `const isLine = ...` line, add:

```js
    const sheetShape = settings.sheetShape || SHEET_SHAPE_DEFAULT;
    const corners = useMemo(
      () => getVertexAngles(getSheetVertices(settings.width, settings.height, sheetShape)),
      [settings.width, settings.height, sheetShape],
    );

    const updateSheetShape = (key, patch) => {
      const current = settings.sheetShape || SHEET_SHAPE_DEFAULT;
      onChange({
        ...settings,
        sheetShape: {
          ...current,
          [key]: { ...(current[key] || { enabled: false, position: 0.5 }), ...patch },
        },
      });
    };

    const handleSheetShapeChange = (key, field, value) => {
      if (field === 'enabled') {
        updateSheetShape(key, { enabled: Boolean(value) });
        return;
      }
      if (field === 'position') {
        const n = Number(value);
        const clamped = Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));
        updateSheetShape(key, { position: clamped / 100 });
      }
    };

    const handleResetAllEdges = () => {
      onChange({ ...settings, sheetShape: SHEET_SHAPE_DEFAULT });
    };

    const EDGE_META = [
      { key: 'topSplit', label: 'Top', totalAxis: settings.width },
      { key: 'rightSplit', label: 'Right', totalAxis: settings.height },
      { key: 'bottomSplit', label: 'Bottom', totalAxis: settings.width },
      { key: 'leftSplit', label: 'Left', totalAxis: settings.height },
    ];

    const formatSubEdges = (split, totalAxis) => {
      const pos = (split && split.position != null) ? split.position : 0.5;
      const a = Math.round(totalAxis * pos);
      const b = Math.round(totalAxis * (1 - pos));
      return `${a} mm  /  ${b} mm`;
    };
```

(All these helpers are pure derivations from `settings` and `onChange`, so the only state added is what's already in `settings`.)

- [ ] **Step 3: Insert the "Sheet Shape" group JSX**

Find the end of the **Canvas** group (the `</div>` that closes it, just before the `<div className={groupClass}>` for **Margins**). Insert this new group between them:

```jsx
      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Sheet Shape</h3>
        {EDGE_META.map(({ key, label, totalAxis }) => {
          const split = sheetShape[key] || { enabled: false, position: 0.5 };
          const sliderValue = Math.round((split.position || 0) * 100);
          return (
            <div key={key} className="mt-2">
              <label className="flex items-center text-sm font-medium">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={Boolean(split.enabled)}
                  onChange={(e) => handleSheetShapeChange(key, 'enabled', e.target.checked)}
                />
                <span>Split {label.toLowerCase()} edge</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={sliderValue}
                disabled={!split.enabled}
                onChange={(e) => handleSheetShapeChange(key, 'position', e.target.value)}
                className="block w-full mt-1 disabled:opacity-40"
              />
              <div className="text-xs text-gray-500 text-right">
                {formatSubEdges(split, totalAxis)}
              </div>
            </div>
          );
        })}

        <div className="mt-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Corners</h4>
          <ul className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            {corners.map((c, i) => (
              <li key={i}>
                {c.role} — {c.angleDegrees}°
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={handleResetAllEdges}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
        >
          Reset all edges
        </button>
      </div>
```

- [ ] **Step 4: Manual check — controls work end-to-end**

Reload the page.

Expected:
- New "Sheet Shape" group appears between "Canvas" and "Margins".
- 4 checkboxes: "Split top edge", "Split right edge", "Split bottom edge", "Split left edge".
- Each is initially unchecked; the slider below it is greyed out.
- "Corners" sub-block lists 4 rows: top-left corner, top-right corner, bottom-right corner, bottom-left corner, all at 90°.
- Click "Split top edge": checkbox ticks, slider enables, a 5th vertex appears at the top of the SVG preview, and the "Corners" list grows to 5 rows with a new "top edge split — 180°" entry. The mm readout next to the slider shows two sub-edge lengths that sum to `settings.width` (e.g. "500 mm  /  500 mm" for default width=1000).
- Move the slider: the SVG split vertex slides left/right, the mm readout updates, the corners list still shows "top edge split — 180°".
- Enable all 4 splits: SVG shows an 8-vertex polygon; "Corners" lists 4 corners at 90° and 4 edge splits at 180°.
- Change "Width" or "Height" in the Canvas group: sub-edge mm readouts update automatically.
- Click "Reset all edges": all 4 checkboxes uncheck; sliders grey out; SVG returns to a rectangle; "Corners" shows 4 × 90°.

- [ ] **Step 5: Verify persistence**

With at least one split enabled, reload the page in the browser (Cmd-R / Ctrl-R).

Expected: split state is restored from localStorage; SVG still shows the polygon; "Corners" still lists the split vertex.

- [ ] **Step 6: Commit**

```bash
git add src/components/PatternGenerator/SettingsPanel.js
git commit -m "feat(pattern-generator): add Sheet Shape group with per-edge splits and Corners list"
```

---

## Task 5: Update `DxfExporter` to export the polygon outline

**Files:**
- Modify: `src/components/PatternGenerator/DxfExporter.js:1-30` (import + add helper)
- Modify: `src/components/PatternGenerator/DxfExporter.js:68-77` (the `exportToDxf` signature and outline LWPOLYLINE)

- [ ] **Step 1: Add the import**

At the top of `src/components/PatternGenerator/DxfExporter.js`, add after the existing `const BULGE_90 = ...` line:

```js
import { getSheetVertices } from './sheetOutline';
```

(If the file already has an `import` line elsewhere, add this alongside it; otherwise this becomes the first `import`. Convert any later CommonJS-style references if needed — but the file as-is already uses `import` via Gatsby's bundler, so an ESM `import` is correct.)

- [ ] **Step 2: Extend `exportToDxf` to accept `sheetShape`**

Change:

```js
export function exportToDxf(shapes, filename, width, height) {
```

to:

```js
export function exportToDxf(shapes, filename, width, height, sheetShape) {
```

- [ ] **Step 3: Replace the fixed 4-vertex outline with a polygon outline**

Replace the existing block in `exportToDxf`:

```js
  const outlineData = polygonToDxf(0, height, width, 0, 0);
  entities.push({
    type: 'LWPOLYLINE',
    vertexCount: 4,
    data: outlineData,
  });
```

with:

```js
  const vertices = getSheetVertices(width, height, sheetShape);
  const flipY = (svgy) => round4(height - svgy);
  const outlineData = [];
  for (const v of vertices) {
    outlineData.push(['10', round4(v.x)]);
    outlineData.push(['20', flipY(v.y)]);
  }
  entities.push({
    type: 'LWPOLYLINE',
    vertexCount: vertices.length,
    data: outlineData,
  });
```

(Remove the duplicate `const flipY = ...` declaration further down in the function — the new declaration above is the only one needed.)

- [ ] **Step 4: Manual check — DXF export uses the polygon outline**

In the dev server, enable a split (e.g. "Split top edge" at slider=30), then click **Export → DXF**.

Open the downloaded `.dxf` file in a DXF viewer (LibreCAD, QCAD, online viewer like https://sharecad.org, etc.).

Expected:
- The file contains a `LWPOLYLINE` with `vertexCount` = `5` (4 corners + 1 split).
- The 5 vertices trace a 5-sided polygon that matches the SVG preview.

With all splits disabled, export and re-open: `vertexCount` = `4` and the outline is a rectangle, matching the pre-change output (a small numeric rounding difference in the vertex list is acceptable — it's the same shape).

- [ ] **Step 5: Commit**

```bash
git add src/components/PatternGenerator/DxfExporter.js
git commit -m "feat(pattern-generator): export sheet polygon outline in DXF"
```

---

## Task 6: Update `PdfExporter` to add a "Sheet Shape" row

**Files:**
- Modify: `src/components/PatternGenerator/PdfExporter.js:54-90` (the `buildParamRows` function)

- [ ] **Step 1: Add the helper + new row**

Find the `buildParamRows` function in `src/components/PatternGenerator/PdfExporter.js`. Just before `return rows;`, add:

```js
  const shape = settings.sheetShape;
  if (shape) {
    const enabledEdges = [];
    if (shape.topSplit && shape.topSplit.enabled) enabledEdges.push('Top');
    if (shape.rightSplit && shape.rightSplit.enabled) enabledEdges.push('Right');
    if (shape.bottomSplit && shape.bottomSplit.enabled) enabledEdges.push('Bottom');
    if (shape.leftSplit && shape.leftSplit.enabled) enabledEdges.push('Left');
    rows.push({
      label: 'Sheet Shape',
      value: enabledEdges.length === 0 ? 'Rectangle' : `Custom (${enabledEdges.length} split${enabledEdges.length === 1 ? '' : 's'}: ${enabledEdges.join(', ')})`,
    });
  }
```

- [ ] **Step 2: Manual check — PDF export shows the new row**

With at least one split enabled, click **Export → PDF** and open the PDF.

Expected:
- The parameters block in the PDF has a new row labeled "Sheet Shape".
- With no splits: value is "Rectangle".
- With one split (e.g. top): value is "Custom (1 split: Top)".
- With multiple splits: value lists them, e.g. "Custom (2 splits: Top, Left)".
- The sheet outline in the PDF visually matches the SVG preview (a polygon when splits are enabled, a rectangle when they are not).

- [ ] **Step 3: Commit**

```bash
git add src/components/PatternGenerator/PdfExporter.js
git commit -m "feat(pattern-generator): add Sheet Shape row to PDF parameters block"
```

---

## Task 7: Final manual regression sweep and build

**Files:** none modified.

- [ ] **Step 1: Sweep the manual checks from the spec's "Testing" section**

Run the dev server if not already running: `npm run develop`.

Walk through each of these:

1. Default load (no splits): sheet is a rectangle; "Corners" lists 4 × 90°; SVG, DXF, and PDF all show a rectangle.
2. Enable "Split top edge", set slider to ~30: SVG shows 5-vertex polygon, "Corners" shows 4 × 90° + 1 × 180° (the split), mm readout matches the slider.
3. Enable all 4 splits: SVG shows an 8-vertex polygon; "Corners" shows 4 × 90° + 4 × 180°; mm readouts are all sensible.
4. Change width or height with splits enabled: the polygon recomputes; sub-edge mm readouts scale proportionally.
5. Reload the page: all split state persists across the reload.
6. Export DXF with one split: open in a viewer, the `LWPOLYLINE` has the expected vertex count.
7. Export PDF with one split: the parameters block has the "Sheet Shape" row, and the outline is a polygon.
8. With all splits disabled, export DXF and PDF: output matches the pre-change behavior (rectangle, no "Sheet Shape" row or "Rectangle" value).

- [ ] **Step 2: Run the lint script**

Run: `npm run lint`
Expected: exit code 0, no errors. (ESLint is configured in `.eslintrc`; the existing project lints clean, and the new code follows the same conventions as the surrounding files: `'use strict'` is not used, JSX/ES module `import`/`export` syntax, single quotes, no trailing semicolons inconsistent with neighbors.)

If lint reports issues, fix them before continuing. Common candidates: unused imports (e.g. `useMemo` if you forget to use it), missing key on the corner `<li>` (we added one).

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: build completes without errors. (The Gatsby build runs SSR, which will exercise the `sheetOutline` module and the `SettingsPanel` rendering. A failure here usually means a syntax or import error; a warning about chunk size or a deprecated dependency is not a failure.)

- [ ] **Step 4: Final commit (if any small fixes were needed)**

If the lint or build steps required fixes, commit them:

```bash
git add -A
git commit -m "chore(pattern-generator): fix lint/build issues from sheet-shape work"
```

If no fixes were needed, skip this step.

---

## Spec coverage self-check

Each spec section maps to a task as follows:

- **Data Model** → Task 2 (Step 2) and Task 4 (Step 2 for `SHEET_SHAPE_DEFAULT`).
- **New Module — `sheetOutline.js`** → Task 1.
- **Settings Panel — new "Sheet Shape" group** → Task 4.
- **SVG Preview** → Task 3.
- **DXF Export** → Task 5.
- **PDF Export** → Task 6.
- **Validation & Edge Cases** → Task 1 (clamping in `getSheetVertices`); the rest (recompute on width/height change, no self-intersection, defensive defaults) are inherent to the data model and don't need a separate task.
- **Testing** → Task 7 (final manual sweep covers all 8 cases listed in the spec's Testing section).
