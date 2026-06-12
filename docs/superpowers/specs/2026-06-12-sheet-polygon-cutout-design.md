# Sheet Polygon Cutout — Design Specification

**Date:** 2026-06-12
**Status:** Approved
**Scope:** Add the ability to split each of the 4 sheet edges in 2 and adjust the sub-edge lengths, transforming the sheet outline from a rectangle into a polygon. Display the interior angle of each vertex in the settings panel.

## Overview

The Design Pattern Generator currently treats the sheet as a fixed axis-aligned rectangle (defined by `width` and `height` in mm). This change makes the sheet outline configurable per edge: each of the 4 edges can optionally be split into 2 sub-edges, with a "position" parameter (0–1) along the original edge controlling the split point. The resulting polygon (4–8 vertices) replaces the rectangle in the SVG preview, the DXF export outline, and the PDF export outline. A read-only "Corners" panel in the settings lists the interior angle at every vertex.

## Requirements

- Each of the 4 original edges (top, right, bottom, left) can be independently split.
- A split is described by a single "position" value in `[0, 1]`, the fraction of the original edge length where the new vertex sits.
- Sub-edges stay on the original edge line (axis-aligned cutout). Perpendicular vertex offset is out of scope.
- The sheet outline is the single source of truth, used by SVG preview, DXF export, and PDF export.
- A "Corners" panel in the settings lists every vertex with its interior angle in degrees.
- Existing settings (width, height, margins, shapes) continue to work unchanged when no edge is split.
- Persisted settings deep-merge new defaults, so existing saved sessions load cleanly.

## Data Model

Additive change to `DEFAULT_SETTINGS` in `src/pages/design-pattern-generator.js`:

```js
sheetShape: {
  topSplit:    { enabled: false, position: 0.5 },
  rightSplit:  { enabled: false, position: 0.5 },
  bottomSplit: { enabled: false, position: 0.5 },
  leftSplit:   { enabled: false, position: 0.5 },
}
```

`position` is a fraction in `[0.001, 0.999]`. Sub-edge lengths are derived: `subEdgeA = position * totalEdgeLength`, `subEdgeB = (1 - position) * totalEdgeLength`.

`usePersistedSettings` already deep-merges parsed values over defaults via `{ ...defaults, ...parsed }`, but the spread is shallow. To get a proper deep-merge of nested `sheetShape`, the helper needs to be updated to recursively merge nested objects — or, the simpler option, `DEFAULT_SETTINGS.sheetShape` is constructed so that any missing sub-key gets its default on read in `getSheetVertices` (defensive defaults). We will do the latter to keep the helper unchanged.

## New Module — `sheetOutline.js`

Add `src/components/PatternGenerator/sheetOutline.js` with two pure functions:

### `getSheetVertices(width, height, sheetShape) -> [{x, y}, ...]`

Returns an ordered list of vertices for the closed polygon. Origin at top-left, y increases downward (matches existing SVG/DXF convention).

Order of emission (counter-clockwise in screen space, starting at top-left). For each edge, `position` is measured from the entry corner (the corner the traversal just emitted):

1. Top-left corner `(0, 0)`
2. Top edge: if `topSplit.enabled`, emit `(width * position, 0)` between the two top corners
3. Top-right corner `(width, 0)`
4. Right edge: if `rightSplit.enabled`, emit `(width, height * position)`
5. Bottom-right corner `(width, height)`
6. Bottom edge: if `bottomSplit.enabled`, emit `(width * (1 - position), height)` — entry corner is bottom-right, so the vertex is at fraction `position` from the right
7. Bottom-left corner `(0, height)`
8. Left edge: if `leftSplit.enabled`, emit `(0, height * (1 - position))` — entry corner is bottom-left, so the vertex is at fraction `position` from the bottom

The UI slider maps 0–100 to `position` 0–1 directly. For top and right edges, the slider visually represents "distance from the start of the edge" (left-to-right for top, top-to-bottom for right). For bottom and left edges, the slider visually represents "distance from the start of the edge" (right-to-left for bottom, bottom-to-top for left). The mm readout "X / Y mm" always shows the two sub-edge lengths in the order the user traverses that edge in the preview (left-to-right or top-to-bottom), which is the same order as the entry-corner-relative position semantics above.

Defensive defaults: if `sheetShape` or any of the 4 split entries is `undefined`, treat it as `{ enabled: false, position: 0.5 }`.

### `getVertexAngles(vertices) -> [{vertex, angleDegrees, role}, ...]`

Returns one entry per input vertex. `angleDegrees` is the interior angle, measured 0–360. `role` is a string identifying what the vertex represents:

- `"top-left corner"`, `"top-right corner"`, `"bottom-right corner"`, `"bottom-left corner"` for the 4 bounding-box corners
- `"top edge split"`, `"right edge split"`, `"bottom edge split"`, `"left edge split"` for split vertices

Interior angle is computed via `atan2` of the incoming and outgoing edge vectors:

```js
function angleBetween(prev, curr, next) {
  const v1x = curr.x - prev.x, v1y = curr.y - prev.y;
  const v2x = next.x - curr.x, v2y = next.y - curr.y;
  const dot = v1x * v2x + v1y * v2y;
  const det = v1x * v2y - v1y * v2x;
  return Math.atan2(det, dot) * (180 / Math.PI);
}
```

For a closed polygon, `prev` is the previous vertex (or the last vertex when `curr` is first), `next` is the next vertex (or the first when `curr` is last). The interior angle is `180 - exteriorAngle` (or, equivalently, the supplement of the signed exterior turn), but `atan2` of the two edge vectors with the polygon walked in consistent winding order directly gives the interior angle in `[0, 360]`.

## Settings Panel — new "Sheet Shape" group

In `src/components/PatternGenerator/SettingsPanel.js`, add a new group between **Canvas** and **Margins** (or at the top of the panel — exact placement to be confirmed visually). Contents:

- Heading: `"Sheet Shape"` (uppercase, same style as other group headings).
- One row per edge (Top, Right, Bottom, Left). Each row contains:
  - Checkbox labeled with the edge name: e.g. `"Split top edge"`.
  - When the checkbox is enabled, a range slider (0–100, step 1) below the label, with a live mm readout showing both sub-edge lengths, e.g. `"300 mm  /  700 mm"`. The slider is disabled (greyed out) when the checkbox is unchecked.
- A `"Corners"` sub-block below the 4 rows:
  - Heading: `"Corners"` (smaller, italic or muted).
  - A list, one row per vertex, formatted as `"Top-left corner — 90°"` or `"Top edge split — 180°"`.
- A small `"Reset all edges"` link that sets all 4 splits to `{ enabled: false }` (positions are preserved).

Slider and checkbox updates flow through the existing `onChange` prop, just like the rest of the panel. The new `sheetShape` is a nested object, so the change handler must merge it with the existing `settings.sheetShape` rather than replacing the whole top-level key. We add a small `handleSheetShapeChange(edge, updates)` helper in `SettingsPanel` for this.

## SVG Preview

In `src/components/PatternGenerator/SvgPreview.js`:

- Accept a new `sheetShape` prop alongside `width`, `height`, `shapes`, and the 4 margin props.
- Compute `vertices = getSheetVertices(width, height, sheetShape)` once at the top of the render.
- Replace the outer `<rect x={0} y={0} width={width} height={height}>` (the sheet outline) with `<polygon points={vertices.map(v => `${v.x},${v.y}`).join(' ')} ... />`. Same fill/stroke styling.
- The margin guides (the 4 red-tinted rectangles) and the working-area outline continue to use the bounding box (the original rectangle), since margins are still defined in terms of the bounding box.
- The dimension annotations ("width mm" / "height mm") continue to use `width` and `height` (the bounding box).
- The viewBox and the per-mm scaling are unchanged; only the outline path changes.

In `src/pages/design-pattern-generator.js`, pass `sheetShape={settings.sheetShape}` to `SvgPreview`.

## DXF Export

In `src/components/PatternGenerator/DxfExporter.js`:

- Extend `exportToDxf(shapes, filename, width, height)` to also accept `sheetShape = null`.
- Import `getSheetVertices` from `./sheetOutline`.
- Replace the fixed 4-vertex outline with a `LWPOLYLINE` whose `vertexCount` is `vertices.length` and whose `data` is the Y-flipped vertex list (DXF Y is bottom-up, SVG Y is top-down). No corner-rounding on the sheet outline.
- Existing per-shape entities are unchanged.

In `src/pages/design-pattern-generator.js`, pass `settings.sheetShape` to `exportToDxf`.

## PDF Export

No structural changes — `PdfExporter` clones the live SVG, so the new polygon outline renders correctly automatically. One small addition: in `buildParamRows`, append a `"Sheet Shape"` row:

- If no splits are enabled: `"Rectangle"`
- Otherwise: e.g. `"Custom (2 splits: Top, Left)"` — list the edges that are split.

## Validation & Edge Cases

- `position` clamped to `[0.001, 0.999]` on read in `getSheetVertices`. This avoids degenerate vertices that coincide with corners and gives a minimum sub-edge length of `0.001 * edgeLength` mm.
- If `width` or `height` is changed, the polygon recomputes automatically on the next render.
- Self-intersection is impossible given the axis-aligned constraint.
- If the user enables a split and then sets the position to exactly 0 or 1 (which the UI doesn't allow, but defensive code covers), the split vertex is omitted and the polygon becomes the original rectangle.
- `usePersistedSettings` shallow-merge means an old saved settings blob without `sheetShape` will get the default `sheetShape` from `DEFAULT_SETTINGS` automatically. A saved settings blob that has `sheetShape` but is missing a sub-key is handled by defensive defaults in `getSheetVertices`.

## Data Flow

```
User toggles a split in SettingsPanel
    ↓
onChange → setSettings({ ...settings, sheetShape: { ...settings.sheetShape, [edge]: { enabled, position } } })
    ↓
usePersistedSettings persists to localStorage
    ↓
getSheetVertices(width, height, settings.sheetShape) → vertices
    ↓
SvgPreview renders <polygon points={...} />
    ↓
On export: DxfExporter builds LWPOLYLINE from same vertices
           PdfExporter clones the SVG (already a polygon) and adds a "Sheet Shape" row to the parameters block
```

## Testing

Manual verification covers the bulk of the surface; the pure `sheetOutline` module is small and self-contained. Plan:

- **Manual — UI:**
  1. Default load: sheet is a rectangle, "Corners" lists 4 × 90°.
  2. Enable "Split top edge", move slider: a 5th vertex appears at the top, "Corners" shows a new "Top edge split — 180°" row. The mm readout matches the slider.
  3. Enable all 4 splits: "Corners" shows 4 × 90° + 4 × 180°. SVG outline is an 8-vertex polygon still axis-aligned.
  4. Change width / height with splits enabled: the polygon recomputes; sub-edge lengths scale proportionally.
  5. Reload page: settings persist.
- **Manual — export:**
  1. DXF with one split: open in a viewer, the LWPOLYLINE has 5 vertices, the sheet outline is the expected 5-vertex polygon.
  2. PDF with one split: the sheet outline in the PDF is a polygon (visible by visual inspection or by selecting the outline in a PDF viewer).
- **Manual — regression:**
  1. With all splits disabled, the SVG, DXF, and PDF output match the pre-change rectangle (byte-for-byte or visual-equivalent).

No automated test framework is currently configured in `package.json`. The pure module is small enough to verify by inspection plus the manual checks above.

## Out of Scope (Explicit)

- Per-vertex perpendicular depth (would produce truly irregular angles). The data model can be extended later to add `depth` to each split without breaking the API.
- More than 2 sub-edges per edge.
- Drag-handles in the SVG preview to manipulate split points. Slider inputs in the panel are sufficient for v1.
- Migrating saved settings to a new schema version. The shallow-merge + defensive defaults handle it.
- Per-vertex radius (rounded polygon corners on the sheet outline). The sheet outline is a manufacturing cut line; corners are sharp.
