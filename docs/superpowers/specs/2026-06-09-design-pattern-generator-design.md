# Design Pattern Generator — Design Specification

**Date:** 2026-06-09
**Status:** Approved

## Overview

A standalone page within the existing Gatsby site that generates decorative CNC/laser-cut patterns for sheet metal. The tool produces a live SVG preview and exports a vector PDF with exact millimeter dimensions.

## Requirements

- **Canvas dimensions:** Width and height in mm.
- **Opacity:** 0–100% — controls how densely the canvas is filled with shapes.
- **Shapes:** One shape type per design. Supported: circle, square, rounded rectangle, triangle, hexagon, horizontal line, vertical line. Each shape has a configurable size in mm.
- **Spacing:** Distance between shapes in mm.
- **Border margin:** Padding around the canvas edges in mm.
- **Gradient:** Direction of density distribution — horizontal, vertical, or radial.
- **Pattern randomization:** 0–100% factor for organic placement jitter.

## Architecture

**Approach:** React SVG preview + `svg2pdf.js` client-side PDF export.

**Components:**

1. **`PatternGenerator`** — Main page component. Holds state and coordinates settings + preview.
2. **`SettingsPanel`** — Left-side form with all input controls.
3. **`SvgPreview`** — Right-side live SVG rendering of the generated pattern.
4. **`PatternEngine`** — Pure JavaScript utility. Computes shape positions based on grid, gradient, and randomization. Returns a list of shape objects (type, x, y, size, rotation).
5. **`PdfExporter`** — Utility that uses `svg2pdf.js` to convert the SVG DOM node into a PDF with a custom page size matching the canvas dimensions.

## Pattern Generation Algorithm

1. **Available area:** `width - 2 * margin`, `height - 2 * margin`.
2. **Grid cell size:** `shapeSize + spacing`.
3. **For each cell `(row, col)`:**
   - Compute normalized position `(nx, ny)` within [0, 1].
   - Compute target density based on gradient direction and opacity:
     - _Horizontal:_ `density = opacity * nx`
     - _Vertical:_ `density = opacity * ny`
     - _Radial:_ `density = opacity * (1 - distance_from_center)` (or `distance_from_center` — user configurable invert)
   - Roll a random number in [0, 1]. If it exceeds `density`, skip the cell.
   - If not skipped, compute position with random jitter:
     - `jitterX = (random - 0.5) * randomizationFactor * spacing`
     - `jitterY = (random - 0.5) * randomizationFactor * spacing`
   - Ensure the final shape position + size stays within bounds.
4. **Return** a list of shape objects.

## Rendering

### SVG Preview

- Render an `<svg>` element with `width` and `height` set to the canvas dimensions in mm.
- Use `viewBox="0 0 width height"`.
- Shapes are rendered as native SVG primitives:
  - `circle` → `<circle>`
  - `square` → `<rect>`
  - `rounded rectangle` → `<rect rx="...">`
  - `triangle` → `<polygon>`
  - `hexagon` → `<polygon>`
  - `horizontal line`, `vertical line` → `<line>`
- Stroke: black, fill: none (outline only, like the example PDF).

### PDF Export

- Use `svg2pdf.js` (`jsPDF` plugin) to convert the live SVG DOM node into a PDF.
- Set the PDF page size to exactly the canvas dimensions (mm).
- Embed the SVG as vector paths, not rasterized.
- Trigger a download with a filename like `pattern-{width}x{height}.pdf`.

## UI Layout

- **Left panel (30–40% width):** Settings form.
  - Group 1: Canvas (width, height, margin).
  - Group 2: Shape (type, size).
  - Group 3: Distribution (spacing, opacity, gradient direction, randomization).
  - Group 4: Actions (Download PDF, Reset).
- **Right panel (60–70% width):** SVG preview. Optionally scrollable/pannable if the canvas is large.

## Data Flow

```
User input (SettingsPanel)
    ↓
State update (PatternGenerator)
    ↓
PatternEngine.compute(shapes, grid, gradient, randomization)
    ↓
SvgPreview receives shape list → renders SVG
    ↓
PdfExporter reads SVG DOM → calls svg2pdf.js → downloads PDF
```

## Error Handling

- Input validation with min/max bounds:
  - width/height: 10–3000 mm
  - shape size: 1–500 mm
  - spacing: 0–500 mm
  - margin: 0–500 mm
  - opacity: 0–100%
  - randomization: 0–100%
- Warning if shape size > available area.
- Warning if the generated pattern contains zero shapes (too sparse).

## Dependencies

- `jspdf` — PDF generation library.
- `svg2pdf.js` — Plugin to convert SVG to vector PDF.
- No backend required.

## Integration

- Add a new Gatsby page at `/src/pages/design-pattern-generator.js`.
- Add a link in the site navigation if desired.
- Install new npm packages: `jspdf`, `svg2pdf.js`.

## Testing

- Manual verification: generate a few patterns and open the PDF in a CAD viewer to confirm dimensions.
- Verify that the SVG preview matches the PDF output.
