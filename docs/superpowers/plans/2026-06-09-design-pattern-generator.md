# Design Pattern Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Gatsby page (`/design-pattern-generator`) that generates CNC/laser-cut sheet metal patterns with a live SVG preview and vector PDF export.

**Architecture:** React components (SettingsPanel + SvgPreview) backed by a pure JS PatternEngine that computes shape positions. PDF export uses svg2pdf.js to convert the live SVG DOM into a vector PDF with exact mm page dimensions.

**Tech Stack:** React 18, Gatsby 5, Tailwind CSS, SCSS, jsPDF, svg2pdf.js

---

### File Structure

| File                                                | Responsibility                                         |
| --------------------------------------------------- | ------------------------------------------------------ |
| `src/components/PatternGenerator/PatternEngine.js`  | Pure function: generates shape positions from settings |
| `src/components/PatternGenerator/PdfExporter.js`    | Pure function: converts SVG DOM node to PDF download   |
| `src/components/PatternGenerator/SettingsPanel.js`  | React form: all user inputs                            |
| `src/components/PatternGenerator/SvgPreview.js`     | React component: renders generated shapes as SVG       |
| `src/components/PatternGenerator/index.js`          | Barrel export of SettingsPanel + SvgPreview            |
| `src/pages/design-pattern-generator.js`             | Gatsby page: orchestrates state, engine, and exporter  |
| `src/styles/scss/components/pattern-generator.scss` | Component-specific styles                              |
| `src/components/about.js`                           | Add navigation link to new page                        |
| `package.json`                                      | Add `jspdf` and `svg2pdf.js` dependencies              |

---

### Task 1: Install Dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install jspdf and svg2pdf.js**

Run: `npm install jspdf svg2pdf.js`

Expected: packages added to `dependencies` in `package.json`.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add jspdf and svg2pdf.js dependencies"
```

---

### Task 2: Create PatternEngine

**Files:**

- Create: `src/components/PatternGenerator/PatternEngine.js`

- [ ] **Step 1: Write PatternEngine**

```javascript
// src/components/PatternGenerator/PatternEngine.js

export const SHAPE_TYPES = {
  CIRCLE: "circle",
  SQUARE: "square",
  ROUNDED_RECTANGLE: "roundedRectangle",
  TRIANGLE: "triangle",
  HEXAGON: "hexagon",
  HORIZONTAL_LINE: "horizontalLine",
  VERTICAL_LINE: "verticalLine",
};

export const GRADIENT_TYPES = {
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
  RADIAL: "radial",
};

function getDensity(nx, ny, gradientType, opacity) {
  const normalizedOpacity = opacity / 100;
  let density;

  switch (gradientType) {
    case GRADIENT_TYPES.HORIZONTAL:
      density = nx;
      break;
    case GRADIENT_TYPES.VERTICAL:
      density = ny;
      break;
    case GRADIENT_TYPES.RADIAL: {
      const cx = 0.5;
      const cy = 0.5;
      const dist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);
      density = 1 - dist / Math.sqrt(0.5);
      break;
    }
    default:
      density = 1;
  }

  return Math.max(0, Math.min(1, density * normalizedOpacity));
}

export function generatePattern(options) {
  const {
    width,
    height,
    margin,
    shapeType,
    shapeSize,
    spacing,
    opacity,
    gradientType,
    randomization,
  } = options;

  const availableWidth = Math.max(0, width - 2 * margin);
  const availableHeight = Math.max(0, height - 2 * margin);
  const cellSize = shapeSize + spacing;

  if (cellSize <= 0 || availableWidth <= 0 || availableHeight <= 0) {
    return [];
  }

  const cols = Math.floor(availableWidth / cellSize);
  const rows = Math.floor(availableHeight / cellSize);

  const shapes = [];
  const seed = 12345; // fixed seed for reproducibility
  let randomState = seed;

  const random = () => {
    randomState = (randomState * 16807 + 0) % 2147483647;
    return (randomState - 1) / 2147483646;
  };

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const nx = cols > 1 ? col / (cols - 1) : 0.5;
      const ny = rows > 1 ? row / (rows - 1) : 0.5;

      const density = getDensity(nx, ny, gradientType, opacity);

      if (random() > density) {
        continue;
      }

      const jitterScale = (randomization / 100) * spacing;
      const jitterX = (random() - 0.5) * jitterScale;
      const jitterY = (random() - 0.5) * jitterScale;

      const baseX = margin + col * cellSize + cellSize / 2;
      const baseY = margin + row * cellSize + cellSize / 2;

      let x = baseX + jitterX;
      let y = baseY + jitterY;

      // Clamp to bounds
      const halfSize = shapeSize / 2;
      x = Math.max(margin + halfSize, Math.min(width - margin - halfSize, x));
      y = Math.max(margin + halfSize, Math.min(height - margin - halfSize, y));

      shapes.push({
        type: shapeType,
        x,
        y,
        size: shapeSize,
      });
    }
  }

  return shapes;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PatternGenerator/PatternEngine.js
git commit -m "feat: add pattern generation engine"
```

---

### Task 3: Create PdfExporter

**Files:**

- Create: `src/components/PatternGenerator/PdfExporter.js`

- [ ] **Step 1: Write PdfExporter**

```javascript
// src/components/PatternGenerator/PdfExporter.js

import { jsPDF } from "jspdf";
import { svg2pdf } from "svg2pdf.js";

export async function exportToPdf(svgElement, filename, widthMm, heightMm) {
  if (!svgElement) {
    throw new Error("No SVG element provided");
  }

  const pdf = new jsPDF({
    unit: "mm",
    format: [widthMm, heightMm],
    orientation: widthMm > heightMm ? "landscape" : "portrait",
    compress: true,
  });

  await svg2pdf(svgElement, pdf, {
    x: 0,
    y: 0,
    width: widthMm,
    height: heightMm,
  });

  pdf.save(filename);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PatternGenerator/PdfExporter.js
git commit -m "feat: add PDF export utility"
```

---

### Task 4: Create SettingsPanel Component

**Files:**

- Create: `src/components/PatternGenerator/SettingsPanel.js`

- [ ] **Step 1: Write SettingsPanel**

```javascript
// src/components/PatternGenerator/SettingsPanel.js

import React from "react";
import { SHAPE_TYPES, GRADIENT_TYPES } from "./PatternEngine";

const SettingsPanel = ({ settings, onChange, onExport, shapeCount }) => {
  const handleChange = (key, value) => {
    onChange({ ...settings, [key]: value });
  };

  const inputClass =
    "block w-full mt-1 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 dark:text-white";
  const labelClass = "block text-sm font-medium mt-4";
  const groupClass = "mb-4";

  return (
    <div className="settings-panel">
      <h2 className="text-lg font-bold mb-4">Pattern Settings</h2>

      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Canvas
        </h3>
        <label className={labelClass}>Width (mm)</label>
        <input
          type="number"
          min={10}
          max={3000}
          value={settings.width}
          onChange={(e) => handleChange("width", Number(e.target.value))}
          className={inputClass}
        />

        <label className={labelClass}>Height (mm)</label>
        <input
          type="number"
          min={10}
          max={3000}
          value={settings.height}
          onChange={(e) => handleChange("height", Number(e.target.value))}
          className={inputClass}
        />

        <label className={labelClass}>Margin (mm)</label>
        <input
          type="number"
          min={0}
          max={500}
          value={settings.margin}
          onChange={(e) => handleChange("margin", Number(e.target.value))}
          className={inputClass}
        />
      </div>

      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Shape
        </h3>
        <label className={labelClass}>Shape Type</label>
        <select
          value={settings.shapeType}
          onChange={(e) => handleChange("shapeType", e.target.value)}
          className={inputClass}
        >
          <option value={SHAPE_TYPES.CIRCLE}>Circle</option>
          <option value={SHAPE_TYPES.SQUARE}>Square</option>
          <option value={SHAPE_TYPES.ROUNDED_RECTANGLE}>
            Rounded Rectangle
          </option>
          <option value={SHAPE_TYPES.TRIANGLE}>Triangle</option>
          <option value={SHAPE_TYPES.HEXAGON}>Hexagon</option>
          <option value={SHAPE_TYPES.HORIZONTAL_LINE}>Horizontal Line</option>
          <option value={SHAPE_TYPES.VERTICAL_LINE}>Vertical Line</option>
        </select>

        <label className={labelClass}>Shape Size (mm)</label>
        <input
          type="number"
          min={1}
          max={500}
          value={settings.shapeSize}
          onChange={(e) => handleChange("shapeSize", Number(e.target.value))}
          className={inputClass}
        />

        <label className={labelClass}>Spacing (mm)</label>
        <input
          type="number"
          min={0}
          max={500}
          value={settings.spacing}
          onChange={(e) => handleChange("spacing", Number(e.target.value))}
          className={inputClass}
        />
      </div>

      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Distribution
        </h3>
        <label className={labelClass}>Opacity / Density (%)</label>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.opacity}
          onChange={(e) => handleChange("opacity", Number(e.target.value))}
          className="block w-full mt-1"
        />
        <div className="text-xs text-gray-500 text-right">
          {settings.opacity}%
        </div>

        <label className={labelClass}>Gradient Direction</label>
        <select
          value={settings.gradientType}
          onChange={(e) => handleChange("gradientType", e.target.value)}
          className={inputClass}
        >
          <option value={GRADIENT_TYPES.HORIZONTAL}>Horizontal</option>
          <option value={GRADIENT_TYPES.VERTICAL}>Vertical</option>
          <option value={GRADIENT_TYPES.RADIAL}>Radial</option>
        </select>

        <label className={labelClass}>Randomization (%)</label>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.randomization}
          onChange={(e) =>
            handleChange("randomization", Number(e.target.value))
          }
          className="block w-full mt-1"
        />
        <div className="text-xs text-gray-500 text-right">
          {settings.randomization}%
        </div>
      </div>

      <div className={groupClass}>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Shapes: {shapeCount}
        </div>
        <button
          onClick={onExport}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PatternGenerator/SettingsPanel.js
git commit -m "feat: add settings panel component"
```

---

### Task 5: Create SvgPreview Component

**Files:**

- Create: `src/components/PatternGenerator/SvgPreview.js`

- [ ] **Step 1: Write SvgPreview**

```javascript
// src/components/PatternGenerator/SvgPreview.js

import React, { forwardRef } from "react";

const SvgPreview = forwardRef(({ width, height, shapes }, ref) => {
  const renderShape = (shape, index) => {
    const { type, x, y, size } = shape;
    const half = size / 2;
    const key = `shape-${index}`;

    switch (type) {
      case "circle":
        return (
          <circle
            key={key}
            cx={x}
            cy={y}
            r={half}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );

      case "square":
        return (
          <rect
            key={key}
            x={x - half}
            y={y - half}
            width={size}
            height={size}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );

      case "roundedRectangle":
        return (
          <rect
            key={key}
            x={x - half}
            y={y - half}
            width={size}
            height={size}
            rx={size * 0.2}
            ry={size * 0.2}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );

      case "triangle": {
        const h = (size * Math.sqrt(3)) / 2;
        const points = [
          `${x},${y - h / 2}`,
          `${x - half},${y + h / 2}`,
          `${x + half},${y + h / 2}`,
        ].join(" ");
        return (
          <polygon
            key={key}
            points={points}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );
      }

      case "hexagon": {
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          hexPoints.push(
            `${x + half * Math.cos(angle)},${y + half * Math.sin(angle)}`,
          );
        }
        return (
          <polygon
            key={key}
            points={hexPoints.join(" ")}
            fill="none"
            stroke="black"
            strokeWidth="0.5"
          />
        );
      }

      case "horizontalLine":
        return (
          <line
            key={key}
            x1={x - half}
            y1={y}
            x2={x + half}
            y2={y}
            stroke="black"
            strokeWidth="0.5"
          />
        );

      case "verticalLine":
        return (
          <line
            key={key}
            x1={x}
            y1={y - half}
            x2={x}
            y2={y + half}
            stroke="black"
            strokeWidth="0.5"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="svg-preview-container">
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          border: "1px solid #ccc",
          background: "white",
        }}
      >
        {shapes.map((shape, index) => renderShape(shape, index))}
      </svg>
    </div>
  );
});

SvgPreview.displayName = "SvgPreview";

export default SvgPreview;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PatternGenerator/SvgPreview.js
git commit -m "feat: add SVG preview component"
```

---

### Task 6: Create PatternGenerator Page

**Files:**

- Create: `src/pages/design-pattern-generator.js`

- [ ] **Step 1: Write the page component**

```javascript
// src/pages/design-pattern-generator.js

import React, { useState, useRef, useMemo, useCallback } from "react";
import Layout from "../components/layout";
import SettingsPanel from "../components/PatternGenerator/SettingsPanel";
import SvgPreview from "../components/PatternGenerator/SvgPreview";
import { generatePattern } from "../components/PatternGenerator/PatternEngine";
import { exportToPdf } from "../components/PatternGenerator/PdfExporter";
import "../styles/scss/components/pattern-generator.scss";

const DEFAULT_SETTINGS = {
  width: 1000,
  height: 2000,
  margin: 50,
  shapeType: "circle",
  shapeSize: 20,
  spacing: 40,
  opacity: 50,
  gradientType: "vertical",
  randomization: 30,
};

const DesignPatternPage = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const svgRef = useRef(null);

  const shapes = useMemo(() => generatePattern(settings), [settings]);

  const handleExport = useCallback(async () => {
    if (!svgRef.current) return;
    try {
      const filename = `pattern-${settings.width}x${settings.height}.pdf`;
      await exportToPdf(
        svgRef.current,
        filename,
        settings.width,
        settings.height,
      );
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF export failed. Please try again.");
    }
  }, [settings]);

  return (
    <Layout>
      <div className="pattern-generator-page">
        <div className="pattern-generator-layout">
          <div className="pattern-settings">
            <SettingsPanel
              settings={settings}
              onChange={setSettings}
              onExport={handleExport}
              shapeCount={shapes.length}
            />
          </div>
          <div className="pattern-preview">
            <SvgPreview
              ref={svgRef}
              width={settings.width}
              height={settings.height}
              shapes={shapes}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DesignPatternPage;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/design-pattern-generator.js
git commit -m "feat: add design pattern generator page"
```

---

### Task 7: Add Styles

**Files:**

- Create: `src/styles/scss/components/pattern-generator.scss`

- [ ] **Step 1: Write SCSS styles**

```scss
// src/styles/scss/components/pattern-generator.scss

.pattern-generator-page {
  width: 100%;
  min-height: 100vh;
}

.pattern-generator-layout {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  height: 100%;
  min-height: calc(100vh - 4rem);
}

.pattern-settings {
  flex: 0 0 280px;
  min-width: 280px;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  padding: 1rem;
  background: var(--bg-color, #f9fafb);
  border-right: 1px solid var(--border-color, #e5e7eb);
}

.pattern-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: auto;
  background: var(--bg-color-secondary, #ffffff);
}

.svg-preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.settings-panel {
  h2 {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
  }

  input[type="range"] {
    width: 100%;
    margin-top: 0.25rem;
  }

  button {
    width: 100%;
    padding: 0.5rem 1rem;
    background-color: #2563eb;
    color: white;
    border-radius: 0.25rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #1d4ed8;
    }
  }
}

@media (max-width: 768px) {
  .pattern-generator-layout {
    flex-direction: column;
  }

  .pattern-settings {
    flex: none;
    max-height: none;
    border-right: none;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/scss/components/pattern-generator.scss
git commit -m "feat: add pattern generator styles"
```

---

### Task 8: Add Navigation Link

**Files:**

- Modify: `src/components/about.js`

- [ ] **Step 1: Add link to navigation menu**

Insert after the "Projects" link (around line 124):

```jsx
<Link
  aria-label="Head over to the design pattern generator"
  to="/design-pattern-generator"
  className={classNames("menuLink mt-1", {
    active: currentPath === "/design-pattern-generator",
  })}
>
  Pattern Generator
</Link>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/about.js
git commit -m "feat: add design pattern generator navigation link"
```

---

### Task 9: Verify Build

- [ ] **Step 1: Run Gatsby develop**

Run: `npm run dev`

Expected: Development server starts successfully.

- [ ] **Step 2: Open the page in browser**

Navigate to `http://localhost:8000/design-pattern-generator`

Verify: Settings panel appears on the left, SVG preview appears on the right, shapes are rendered correctly.

- [ ] **Step 3: Test PDF export**

Click "Download PDF" and verify the generated PDF has correct dimensions and vector paths.

- [ ] **Step 4: Stop dev server**

Press Ctrl+C or run `kill` on the process.

- [ ] **Step 5: Commit (if any fixes were needed)**

If no fixes were needed, no extra commit is necessary.

---

## Spec Coverage Check

| Spec Requirement                                | Task         |
| ----------------------------------------------- | ------------ |
| Canvas dimensions (width/height)                | Task 4, 6    |
| Opacity control                                 | Task 4       |
| Shape type selection (7 shapes)                 | Task 2, 4, 5 |
| Shape size in mm                                | Task 4       |
| Spacing in mm                                   | Task 4       |
| Border margin                                   | Task 4       |
| Gradient direction (horizontal/vertical/radial) | Task 2, 4    |
| Randomization factor                            | Task 2, 4    |
| Live SVG preview                                | Task 5, 6    |
| Vector PDF export                               | Task 3, 6    |
| Gatsby page integration                         | Task 6, 8    |

## Placeholder Scan

- No TBDs, TODOs, or incomplete sections.
- All code blocks contain complete, runnable code.
- All commands have expected output.

## Type Consistency

- `settings` object shape is consistent across SettingsPanel, PatternEngine, and page.
- `shape` object shape `{type, x, y, size}` is consistent across PatternEngine and SvgPreview.
