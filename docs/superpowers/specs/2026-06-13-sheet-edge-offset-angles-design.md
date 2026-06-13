# Sheet Edge Offset Angles — Design Specification

**Date:** 2026-06-13
**Status:** Approved
**Scope:** Replace the split-based sheet outline with per-edge endpoint offsets. Moving the endpoints of each original rectangle edge perpendicular to the edge creates non-90° corners and lets the sheet extend or retract on any side.

## Overview

The Design Pattern Generator currently supports splitting each of the 4 rectangle edges and keeping the sub-edges axis-aligned, so every corner remains 90°. This change removes the split concept and instead lets each edge's two endpoints be offset perpendicular to the original edge. Because every corner is shared by two edges, the final corner position is the original rectangle corner plus the perpendicular offsets from both adjacent edges. The result is a configurable polygon where corners can be acute or obtuse and sides can be longer than the original width or height.

The sheet outline is still the single source of truth for the SVG preview, DXF export, and PDF export. Pattern generation continues to fill the full width/height rectangle independently of the outline.

## Requirements

- Each of the 4 original edges (top, right, bottom, left) has a signed offset for each of its two endpoints.
- An offset is measured in millimeters, perpendicular to the original edge. Positive values move the endpoint outward from the original rectangle; negative values move it inward.
- A corner's final position is derived from the two adjacent edge offsets, so the polygon is always closed.
- Equal start/end offsets on an edge shift the whole edge parallel to itself (the side becomes longer or shorter).
- Unequal start/end offsets tilt the edge.
- Offsets are bounded so the polygon cannot self-intersect or collapse.
- The SettingsPanel exposes each edge's two offsets as numeric inputs with optional sliders.
- The SVG preview, DXF export, and PDF export use `getSheetVertices()` and require no exporter changes.
- Pattern generation is independent of the outline.
- Existing saved settings are not migrated; the app is not in active use and backward compatibility is not required.
- Bump the persisted settings key from `"settings.v1"` to `"settings.v2"` so old `topSplit`/`rightSplit`/etc. values are ignored.

## Data Model

Replace `DEFAULT_SETTINGS.sheetShape` in `src/pages/design-pattern-generator.js`:

```js
sheetShape: {
  topEdge:    { startOffsetMm: 0, endOffsetMm: 0 },
  rightEdge:  { startOffsetMm: 0, endOffsetMm: 0 },
  bottomEdge: { startOffsetMm: 0, endOffsetMm: 0 },
  leftEdge:   { startOffsetMm: 0, endOffsetMm: 0 },
}
```

Each edge is traversed clockwise, starting at the top-left corner:

| Edge        | Start corner       | End corner         |
|-------------|--------------------|--------------------|
| `topEdge`   | top-left           | top-right          |
| `rightEdge` | top-right          | bottom-right       |
| `bottomEdge`| bottom-right       | bottom-left        |
| `leftEdge`  | bottom-left        | top-left           |

Defensive defaults: if `sheetShape` or any edge entry is missing, treat its offsets as `0`.

A small `normalizeSheetShape(sheetShape)` helper should be added to `sheetOutline.js`. It returns a fully populated object with all four `topEdge`/`rightEdge`/`bottomEdge`/`leftEdge` entries, defaulting missing fields to `0`. Both `getSheetVertices` and the SettingsPanel UI should use this helper so the UI never reads `undefined` values.

## Geometry Algorithm

`getSheetVertices(width, height, sheetShape)` returns the ordered polygon vertices `[{x, y}, ...]`.

Coordinate system: origin at top-left, y increases downward (matches SVG/DXF).

Per-edge unit normals (positive = outward from the original rectangle interior):

- Top edge: `(0, -1)`
- Right edge: `(1, 0)`
- Bottom edge: `(0, 1)`
- Left edge: `(-1, 0)`

For each corner, compute the displacement as the sum of the perpendicular offsets from the two edges that meet there:

- Top-left corner: `topEdge.startOffsetMm * (0, -1) + leftEdge.endOffsetMm * (-1, 0)`
- Top-right corner: `topEdge.endOffsetMm * (0, -1) + rightEdge.startOffsetMm * (1, 0)`
- Bottom-right corner: `rightEdge.endOffsetMm * (1, 0) + bottomEdge.startOffsetMm * (0, 1)`
- Bottom-left corner: `bottomEdge.endOffsetMm * (0, 1) + leftEdge.startOffsetMm * (-1, 0)`

Emit the four displaced corners in clockwise order:

```
top-left -> top-right -> bottom-right -> bottom-left
```

No midpoint vertices are emitted; the outline is always a 4-vertex polygon.

### Bounds

Each offset is clamped individually to prevent the polygon from self-intersecting. A simple conservative bound for the first implementation:

```
|offset| <= min(width, height) / 2
```

This keeps every corner within the original bounding box and guarantees a simple polygon for any combination of offsets.

A stricter bound can be added later by checking the actual polygon for self-intersection and reducing the offending offset until the polygon is simple.

## Angle Display

`getVertexAngles(vertices, sheetShape)` currently classifies vertices as corners or split points based on the old `*Split` config. Update it to classify the four polygon vertices as the four rectangle corners (`top-left`, `top-right`, `bottom-right`, `bottom-left`) regardless of offsets. It should still report the interior angle at each vertex, which will now be non-90° when edges are displaced.

The SettingsPanel can keep the read-only "Corners" list showing each corner and its angle.

## SettingsPanel UI

Replace the existing "Sheet Shape" section:

- For each edge, show two labeled numeric inputs:
  - **Start offset (mm)**
  - **End offset (mm)**
- Optional slider next to each input, range `[-min(width, height)/2, +min(width, height)/2]`.
- Small labels or icons indicate which corner each offset controls (e.g., "top-left" / "top-right" for the top edge).
- Remove the old split toggles, position sliders, and sub-edge length readouts.
- Keep the "Reset all edges" button, which zeros all offsets.
- Keep the "Corners" angle list read-only, using `getVertexAngles` to show the new corner angles.
- Read edge values through `normalizeSheetShape(settings.sheetShape)` so missing keys default to `0`.

## SVG Preview / DXF / PDF

`SvgPreview`, `DxfExporter`, and `PdfExporter` already call `getSheetVertices()`. Once the geometry function is updated, all three consumers render and export the new angled outline automatically.

## Testing

Add `src/components/PatternGenerator/sheetOutline.test.js`:

- `normalizeSheetShape` fills missing keys and defaults all offsets to `0`.
- All offsets zero: `getSheetVertices` returns the original rectangle.
- Single edge with equal positive start/end offsets: the two adjacent corners move outward and the edge shifts parallel.
- Single edge with unequal offsets: the edge tilts and corner angles change.
- Opposite edges with positive offsets: the sheet becomes larger in both dimensions.
- Adjacent edges with positive offsets: the shared corner moves diagonally outward.
- Negative offsets: corners move inward.
- Bounds: offsets beyond `min(width, height) / 2` are clamped.
- `getVertexAngles` reports 90° for the default rectangle and non-90° values for displaced corners.
- `getVertexAngles` classifies all four vertices as corners.

Add smoke tests in `SvgPreview` and `DxfExporter` to confirm the outline polygon is consumed unchanged.

## Migration

No migration is required. Bump the persisted settings key from `"settings.v1"` to `"settings.v2"` in `design-pattern-generator.js` so any saved `topSplit`/`rightSplit`/etc. values are ignored. The old `topSplit` / `rightSplit` / `bottomSplit` / `leftSplit` settings keys are replaced by `topEdge` / `rightEdge` / `bottomEdge` / `leftEdge`.
