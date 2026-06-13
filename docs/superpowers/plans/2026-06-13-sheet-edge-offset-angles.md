# Sheet Edge Offset Angles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the split-based sheet outline with per-edge endpoint offsets so corners can be acute/obtuse and sides can extend beyond the original width/height.

**Architecture:** A pure module `sheetOutline.js` exports `normalizeSheetShape`, `getSheetVertices`, and `getVertexAngles`. `getSheetVertices` computes each corner by adding the perpendicular offsets from the two adjacent edges. The SettingsPanel binds eight numeric inputs (two per edge) to the new `topEdge`/`rightEdge`/`bottomEdge`/`leftEdge` model. SvgPreview and DxfExporter require no changes because they already call `getSheetVertices`. PdfExporter's parameter block is updated to describe the new edge offsets.

**Tech Stack:** Gatsby (static site), React 18, plain JS, Tailwind utility classes, Node 22 built-in test runner.

**Spec:** `docs/superpowers/specs/2026-06-13-sheet-edge-offset-angles-design.md`

**Working directory:** `/Users/mitzuuuu/code/personal/projects/mihaiserban.dev`

**Testing note:** The project has no installed test framework. Use Node 22's native test runner. Tests live in `src/components/PatternGenerator/sheetOutline.test.mjs` and run with `node --test src/components/PatternGenerator/sheetOutline.test.mjs`. The `.mjs` extension causes Node to treat the test file as ESM and auto-detect the imported `.js` source as ESM.

---

## File structure

| File | Change | Responsibility |
|---|---|---|
| `src/pages/design-pattern-generator.js` | **Modify** | Replace `sheetShape` default with `topEdge`/`rightEdge`/`bottomEdge`/`leftEdge`; bump persisted settings key from `"settings.v1"` to `"settings.v2"`. |
| `src/components/PatternGenerator/sheetOutline.test.mjs` | **Create** | Node native tests for geometry, normalization, bounds, and angles. |
| `src/components/PatternGenerator/sheetOutline.js` | **Modify** | Rewrite to compute displaced corners from per-edge endpoint offsets; add `normalizeSheetShape`; update `getVertexAngles` to classify only the four corners. |
| `src/components/PatternGenerator/SettingsPanel.js` | **Modify** | Replace "Sheet Shape" split UI with eight numeric inputs (two per edge) and a read-only "Corners" angle list. |
| `src/components/PatternGenerator/PdfExporter.js` | **Modify** | Update the "Sheet Shape" parameter row in `buildParamRows` to report edge offsets instead of splits. |
| `package.json` | **Modify** | Replace the placeholder `"test"` script with `node --test src/components/PatternGenerator/sheetOutline.test.mjs`. |

Files NOT touched:
- `src/components/PatternGenerator/SvgPreview.js` — already calls `getSheetVertices(width, height, sheetShape)`.
- `src/components/PatternGenerator/DxfExporter.js` — already calls `getSheetVertices(width, height, sheetShape)`.
- `src/components/PatternGenerator/PatternEngine.js` — shape generation is independent of the outline.
- `src/components/PatternGenerator/usePersistedSettings.js` — storage key is changed in the page component.

---

## Task 1: Update `DEFAULT_SETTINGS` and persisted settings key

**Files:**
- Modify: `src/pages/design-pattern-generator.js`

- [ ] **Step 1: Remove the old `SHEET_SHAPE_DEFAULT` import**

Open `src/pages/design-pattern-generator.js`.

Find and delete:

```js
import { SHEET_SHAPE_DEFAULT } from "../components/PatternGenerator/sheetOutline";
```

- [ ] **Step 2: Replace the `sheetShape` default and bump the storage key**

Replace the `sheetShape` line in `DEFAULT_SETTINGS`:

```js
const DEFAULT_SETTINGS = {
  width: 1000,
  height: 2000,
  marginTop: 50,
  marginBottom: 50,
  marginLeft: 50,
  marginRight: 50,
  sheetShape: {
    topEdge: { startOffsetMm: 0, endOffsetMm: 0 },
    rightEdge: { startOffsetMm: 0, endOffsetMm: 0 },
    bottomEdge: { startOffsetMm: 0, endOffsetMm: 0 },
    leftEdge: { startOffsetMm: 0, endOffsetMm: 0 },
  },
  shapeType: "circle",
  // ... rest unchanged
};
```

Then find this line:

```js
const [settings, setSettings, resetSettings] = usePersistedSettings(
  DEFAULT_SETTINGS,
  "settings.v1",
);
```

Change `"settings.v1"` to `"settings.v2"`:

```js
const [settings, setSettings, resetSettings] = usePersistedSettings(
  DEFAULT_SETTINGS,
  "settings.v2",
);
```

- [ ] **Step 3: Verify the file still imports and exports cleanly**

Run: `npm run lint -- src/pages/design-pattern-generator.js`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/design-pattern-generator.js
git commit -m "feat(pattern-generator): bump settings key and adopt new sheetShape default"
```

---

## Task 2: Write failing geometry tests

**Files:**
- Create: `src/components/PatternGenerator/sheetOutline.test.mjs`

- [ ] **Step 1: Create the test file**

Write this exact content to `src/components/PatternGenerator/sheetOutline.test.mjs`:

```js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  normalizeSheetShape,
  getSheetVertices,
  getVertexAngles,
  SHEET_SHAPE_DEFAULT,
} from './sheetOutline.js';

const closeTo = (actual, expected, epsilon = 0.0001) => {
  assert.ok(
    Math.abs(actual.x - expected.x) < epsilon && Math.abs(actual.y - expected.y) < epsilon,
    `Expected {x: ${expected.x}, y: ${expected.y}}, got {x: ${actual.x}, y: ${actual.y}}`,
  );
};

describe('normalizeSheetShape', () => {
  it('returns default zero offsets when input is missing', () => {
    const result = normalizeSheetShape(null, 100, 200);
    assert.deepStrictEqual(result, SHEET_SHAPE_DEFAULT);
  });

  it('fills missing edges with zero offsets', () => {
    const result = normalizeSheetShape({ topEdge: { startOffsetMm: 5 } }, 100, 200);
    assert.strictEqual(result.topEdge.startOffsetMm, 5);
    assert.strictEqual(result.topEdge.endOffsetMm, 0);
    assert.deepStrictEqual(result.rightEdge, { startOffsetMm: 0, endOffsetMm: 0 });
    assert.deepStrictEqual(result.bottomEdge, { startOffsetMm: 0, endOffsetMm: 0 });
    assert.deepStrictEqual(result.leftEdge, { startOffsetMm: 0, endOffsetMm: 0 });
  });

  it('clamps offsets to half the shortest dimension', () => {
    const result = normalizeSheetShape(
      { topEdge: { startOffsetMm: 100, endOffsetMm: -100 } },
      100,
      200,
    );
    assert.strictEqual(result.topEdge.startOffsetMm, 50);
    assert.strictEqual(result.topEdge.endOffsetMm, -50);
  });

  it('rejects non-numeric offsets', () => {
    const result = normalizeSheetShape(
      { topEdge: { startOffsetMm: 'foo', endOffsetMm: NaN } },
      100,
      200,
    );
    assert.strictEqual(result.topEdge.startOffsetMm, 0);
    assert.strictEqual(result.topEdge.endOffsetMm, 0);
  });
});

describe('getSheetVertices', () => {
  it('returns the original rectangle when all offsets are zero', () => {
    const v = getSheetVertices(100, 200, SHEET_SHAPE_DEFAULT);
    assert.strictEqual(v.length, 4);
    closeTo(v[0], { x: 0, y: 0 });
    closeTo(v[1], { x: 100, y: 0 });
    closeTo(v[2], { x: 100, y: 200 });
    closeTo(v[3], { x: 0, y: 200 });
  });

  it('extends an edge equally when start and end offsets are equal', () => {
    const v = getSheetVertices(100, 200, {
      topEdge: { startOffsetMm: 10, endOffsetMm: 10 },
    });
    closeTo(v[0], { x: -10, y: 0 });
    closeTo(v[1], { x: 110, y: 0 });
    closeTo(v[2], { x: 100, y: 200 });
    closeTo(v[3], { x: 0, y: 200 });
  });

  it('tilts an edge when start and end offsets differ', () => {
    const v = getSheetVertices(100, 200, {
      topEdge: { startOffsetMm: 0, endOffsetMm: 20 },
    });
    closeTo(v[0], { x: 0, y: 0 });
    closeTo(v[1], { x: 120, y: 0 });
    closeTo(v[2], { x: 100, y: 200 });
    closeTo(v[3], { x: 0, y: 200 });
  });

  it('moves opposite edges outward to enlarge the sheet', () => {
    const v = getSheetVertices(100, 200, {
      topEdge: { startOffsetMm: 10, endOffsetMm: 10 },
      bottomEdge: { startOffsetMm: 10, endOffsetMm: 10 },
    });
    assert.strictEqual(v[0].x, -10);
    assert.strictEqual(v[2].x, 110);
  });

  it('moves shared corners diagonally when adjacent edges offset', () => {
    const v = getSheetVertices(100, 200, {
      topEdge: { startOffsetMm: 10, endOffsetMm: 0 },
      leftEdge: { startOffsetMm: 0, endOffsetMm: 20 },
    });
    closeTo(v[0], { x: -10, y: -20 });
  });

  it('moves corners inward with negative offsets', () => {
    const v = getSheetVertices(100, 200, {
      topEdge: { startOffsetMm: -10, endOffsetMm: -10 },
    });
    closeTo(v[0], { x: 10, y: 0 });
    closeTo(v[1], { x: 90, y: 0 });
  });

  it('clamps offsets beyond the bound', () => {
    const v = getSheetVertices(100, 200, {
      topEdge: { startOffsetMm: 1000, endOffsetMm: -1000 },
    });
    closeTo(v[0], { x: -50, y: 0 });
    closeTo(v[1], { x: 50, y: 0 });
  });

  it('handles missing sheetShape defensively', () => {
    const v = getSheetVertices(100, 200, undefined);
    closeTo(v[0], { x: 0, y: 0 });
    closeTo(v[1], { x: 100, y: 0 });
    closeTo(v[2], { x: 100, y: 200 });
    closeTo(v[3], { x: 0, y: 200 });
  });
});

describe('getVertexAngles', () => {
  it('reports 90° corners for the default rectangle', () => {
    const angles = getVertexAngles(getSheetVertices(100, 200, SHEET_SHAPE_DEFAULT));
    assert.strictEqual(angles.length, 4);
    for (const a of angles) {
      assert.strictEqual(a.angleDegrees, 90);
    }
  });

  it('reports non-90° angles for displaced corners', () => {
    const angles = getVertexAngles(getSheetVertices(100, 200, {
      topEdge: { startOffsetMm: 0, endOffsetMm: 20 },
    }));
    assert.strictEqual(angles[0].angleDegrees, 90);
    assert.notStrictEqual(angles[1].angleDegrees, 90);
    assert.notStrictEqual(angles[2].angleDegrees, 90);
    assert.strictEqual(angles[3].angleDegrees, 90);
  });

  it('classifies all four vertices as corners', () => {
    const angles = getVertexAngles(getSheetVertices(100, 200, {
      topEdge: { startOffsetMm: 10, endOffsetMm: -5 },
      rightEdge: { startOffsetMm: 7, endOffsetMm: 3 },
      bottomEdge: { startOffsetMm: -2, endOffsetMm: 4 },
      leftEdge: { startOffsetMm: 6, endOffsetMm: -8 },
    }));
    assert.deepStrictEqual(
      angles.map((a) => a.role),
      ['top-left corner', 'top-right corner', 'bottom-right corner', 'bottom-left corner'],
    );
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `node --test src/components/PatternGenerator/sheetOutline.test.mjs`
Expected: failures because `sheetOutline.js` still uses the old split model and does not export `normalizeSheetShape` or the new `SHEET_SHAPE_DEFAULT`.

- [ ] **Step 3: Commit the failing tests**

```bash
git add src/components/PatternGenerator/sheetOutline.test.mjs
git commit -m "test(pattern-generator): add sheet outline offset tests"
```

---

## Task 3: Implement the new geometry

**Files:**
- Modify: `src/components/PatternGenerator/sheetOutline.js`

- [ ] **Step 1: Replace the entire file content**

Write this exact content to `src/components/PatternGenerator/sheetOutline.js`:

```js
const DEFAULT_EDGE = { startOffsetMm: 0, endOffsetMm: 0 };

function clampOffset(value, width, height) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const bound = Math.min(Number(width) || 0, Number(height) || 0) / 2;
  if (bound <= 0) return 0;
  return Math.max(-bound, Math.min(bound, n));
}

export function normalizeSheetShape(sheetShape, width, height) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const normalizeEdge = (edge) => ({
    startOffsetMm: clampOffset(edge && edge.startOffsetMm, w, h),
    endOffsetMm: clampOffset(edge && edge.endOffsetMm, w, h),
  });

  return {
    topEdge: normalizeEdge(sheetShape && sheetShape.topEdge),
    rightEdge: normalizeEdge(sheetShape && sheetShape.rightEdge),
    bottomEdge: normalizeEdge(sheetShape && sheetShape.bottomEdge),
    leftEdge: normalizeEdge(sheetShape && sheetShape.leftEdge),
  };
}

function round(n) {
  return Math.round(n * 10000) / 10000;
}

export function getSheetVertices(width, height, sheetShape) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const shape = normalizeSheetShape(sheetShape, w, h);

  const topStart = shape.topEdge.startOffsetMm;
  const topEnd = shape.topEdge.endOffsetMm;
  const rightStart = shape.rightEdge.startOffsetMm;
  const rightEnd = shape.rightEdge.endOffsetMm;
  const bottomStart = shape.bottomEdge.startOffsetMm;
  const bottomEnd = shape.bottomEdge.endOffsetMm;
  const leftStart = shape.leftEdge.startOffsetMm;
  const leftEnd = shape.leftEdge.endOffsetMm;

  const tl = { x: round(-topStart), y: round(-leftEnd) };
  const tr = { x: round(w + topEnd), y: round(-rightStart) };
  const br = { x: round(w + bottomStart), y: round(h + rightEnd) };
  const bl = { x: round(-bottomEnd), y: round(h + leftStart) };

  return [tl, tr, br, bl];
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

export function getVertexAngles(vertices) {
  if (!Array.isArray(vertices) || vertices.length < 3) {
    return [];
  }

  const total = vertices.length;
  const roles = [
    'top-left corner',
    'top-right corner',
    'bottom-right corner',
    'bottom-left corner',
  ];

  return vertices.map((vertex, i) => {
    const prev = vertices[(i - 1 + total) % total];
    const next = vertices[(i + 1) % total];
    const signed = angleBetween(prev, vertex, next);
    const interior = 180 - signed;
    const normalized = ((interior % 360) + 360) % 360;

    return {
      vertex,
      angleDegrees: Math.round(normalized * 100) / 100,
      role: roles[i] || 'vertex',
    };
  });
}

export const SHEET_SHAPE_DEFAULT = {
  topEdge: { startOffsetMm: 0, endOffsetMm: 0 },
  rightEdge: { startOffsetMm: 0, endOffsetMm: 0 },
  bottomEdge: { startOffsetMm: 0, endOffsetMm: 0 },
  leftEdge: { startOffsetMm: 0, endOffsetMm: 0 },
};
```

- [ ] **Step 2: Run the tests**

Run: `node --test src/components/PatternGenerator/sheetOutline.test.mjs`
Expected: all tests pass.

- [ ] **Step 3: Run linter**

Run: `npm run lint -- src/components/PatternGenerator/sheetOutline.js`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/PatternGenerator/sheetOutline.js
git commit -m "feat(pattern-generator): compute sheet outline from per-edge endpoint offsets"
```

---

## Task 4: Update SettingsPanel for per-edge offsets

**Files:**
- Modify: `src/components/PatternGenerator/SettingsPanel.js`

- [ ] **Step 1: Update imports**

Change:

```js
import { getSheetVertices, getVertexAngles, SHEET_SHAPE_DEFAULT } from './sheetOutline';
```

to:

```js
import {
  getSheetVertices,
  getVertexAngles,
  normalizeSheetShape,
  SHEET_SHAPE_DEFAULT,
} from './sheetOutline';
```

- [ ] **Step 2: Replace helpers and edge metadata**

Find and delete these definitions:

```js
  const sheetShape = settings.sheetShape || SHEET_SHAPE_DEFAULT;
  const corners = useMemo(
    () => getVertexAngles(getSheetVertices(settings.width, settings.height, sheetShape), sheetShape),
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

Replace with:

```js
  const sheetShape = normalizeSheetShape(settings.sheetShape, settings.width, settings.height);
  const corners = useMemo(
    () => getVertexAngles(getSheetVertices(settings.width, settings.height, sheetShape)),
    [settings.width, settings.height, sheetShape],
  );

  const updateEdge = (key, field, value) => {
    const current = settings.sheetShape || SHEET_SHAPE_DEFAULT;
    onChange({
      ...settings,
      sheetShape: {
        ...current,
        [key]: { ...(current[key] || {}), [field]: Number(value) },
      },
    });
  };

  const handleResetAllEdges = () => {
    onChange({ ...settings, sheetShape: SHEET_SHAPE_DEFAULT });
  };

  const EDGE_META = [
    { key: 'topEdge', label: 'Top', startCorner: 'Top-left', endCorner: 'Top-right' },
    { key: 'rightEdge', label: 'Right', startCorner: 'Top-right', endCorner: 'Bottom-right' },
    { key: 'bottomEdge', label: 'Bottom', startCorner: 'Bottom-right', endCorner: 'Bottom-left' },
    { key: 'leftEdge', label: 'Left', startCorner: 'Bottom-left', endCorner: 'Top-left' },
  ];

  const maxOffset = Math.min(settings.width, settings.height) / 2;
```

- [ ] **Step 3: Replace the "Sheet Shape" JSX block**

Find the JSX block that starts with:

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
              <li key={`corner-${i}`}>
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

Replace with:

```jsx
      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Sheet Shape</h3>
        {EDGE_META.map(({ key, label, startCorner, endCorner }) => {
          const edge = sheetShape[key] || SHEET_SHAPE_DEFAULT[key];
          return (
            <div key={key} className="mt-3">
              <div className="text-sm font-medium">{label}</div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <label className="block text-xs text-gray-500">{startCorner}</label>
                  <input
                    type="number"
                    min={-maxOffset}
                    max={maxOffset}
                    step={1}
                    value={edge.startOffsetMm}
                    onChange={(e) => updateEdge(key, 'startOffsetMm', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">{endCorner}</label>
                  <input
                    type="number"
                    min={-maxOffset}
                    max={maxOffset}
                    step={1}
                    value={edge.endOffsetMm}
                    onChange={(e) => updateEdge(key, 'endOffsetMm', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <input
                type="range"
                min={-maxOffset}
                max={maxOffset}
                step={1}
                value={edge.startOffsetMm}
                onChange={(e) => updateEdge(key, 'startOffsetMm', e.target.value)}
                className="block w-full mt-1"
              />
              <input
                type="range"
                min={-maxOffset}
                max={maxOffset}
                step={1}
                value={edge.endOffsetMm}
                onChange={(e) => updateEdge(key, 'endOffsetMm', e.target.value)}
                className="block w-full mt-1"
              />
            </div>
          );
        })}

        <div className="mt-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Corners</h4>
          <ul className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            {corners.map((c, i) => (
              <li key={`corner-${i}`}>
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

- [ ] **Step 4: Run linter**

Run: `npm run lint -- src/components/PatternGenerator/SettingsPanel.js`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/PatternGenerator/SettingsPanel.js
git commit -m "feat(pattern-generator): replace split UI with per-edge offset controls"
```

---

## Task 5: Update PDF parameter block

**Files:**
- Modify: `src/components/PatternGenerator/PdfExporter.js`

- [ ] **Step 1: Replace the Sheet Shape parameter row**

Find this block in `buildParamRows`:

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
      value: enabledEdges.length === 0
        ? 'Rectangle'
        : `Custom (${enabledEdges.length} split${enabledEdges.length === 1 ? '' : 's'}: ${enabledEdges.join(', ')})`,
    });
  }
```

Replace with:

```js
  const shape = settings.sheetShape;
  if (shape) {
    const edges = ['topEdge', 'rightEdge', 'bottomEdge', 'leftEdge'];
    const labels = { topEdge: 'T', rightEdge: 'R', bottomEdge: 'B', leftEdge: 'L' };
    const nonZero = [];
    for (const key of edges) {
      const edge = shape[key];
      if (!edge) continue;
      const start = Number(edge.startOffsetMm) || 0;
      const end = Number(edge.endOffsetMm) || 0;
      if (start !== 0 || end !== 0) {
        nonZero.push(`${labels[key]} ${start}/${end}`);
      }
    }
    rows.push({
      label: 'Sheet Shape',
      value: nonZero.length === 0 ? 'Rectangle' : nonZero.join(', '),
    });
  }
```

- [ ] **Step 2: Run linter**

Run: `npm run lint -- src/components/PatternGenerator/PdfExporter.js`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PatternGenerator/PdfExporter.js
git commit -m "feat(pattern-generator): report edge offsets in PDF parameter block"
```

---

## Task 6: Add test npm script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Replace the placeholder test script**

Find:

```json
    "test": "echo \"Error: no test specified\" && exit 1",
```

Replace with:

```json
    "test": "node --test src/components/PatternGenerator/sheetOutline.test.mjs",
```

- [ ] **Step 2: Run the test script**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore(pattern-generator): add npm test script for sheet outline tests"
```

---

## Task 7: Manual verification and build

**Files:**
- No file changes.

- [ ] **Step 1: Start the development server**

Run: `npm run dev`
Wait for the site to be available at `http://localhost:8000/design-pattern-generator`.

- [ ] **Step 2: Verify default rectangle**

With all offsets at 0, confirm:
- The SVG preview shows a rectangle matching the width/height.
- The Corners list shows four 90° angles.
- DXF export produces a 4-vertex rectangle.
- PDF export shows "Sheet Shape: Rectangle".

- [ ] **Step 3: Verify parallel edge shift**

Set Top start offset = 50 and Top end offset = 50. Confirm:
- The top edge moves upward, parallel to the original.
- The top-left and top-right angles are no longer 90°.
- The bottom edge stays unchanged.

- [ ] **Step 4: Verify tilted edge**

Set Top start offset = 0 and Top end offset = 50. Confirm:
- The top edge tilts, with the top-right corner higher than the top-left.
- Only the top-right angle changes (plus the adjacent right-edge angle).

- [ ] **Step 5: Verify bounds**

Type 10000 into any offset input. Confirm the value is clamped and the shape does not self-intersect.

- [ ] **Step 6: Run the production build**

Run: `npm run build`
Expected: build completes without errors.

- [ ] **Step 7: Commit any final tweaks**

If any fixes were needed during manual verification, commit them.

---

## Self-review checklist

**Spec coverage:**
- [x] Per-edge endpoint offsets — Task 3, Task 2 tests, Task 4 UI.
- [x] Positive outward / negative inward — geometry in Task 3, tests in Task 2.
- [x] Closed polygon from adjacent edge sums — geometry in Task 3.
- [x] Equal offsets shift edge parallel — test in Task 2.
- [x] Unequal offsets tilt edge — test in Task 2.
- [x] Bounds clamping — `normalizeSheetShape` in Task 3, tests in Task 2.
- [x] SettingsPanel numeric inputs — Task 4.
- [x] SVG/DXF no changes — called out in file structure.
- [x] PDF parameter block update — Task 5.
- [x] Pattern generation independent — no PatternEngine changes.
- [x] No migration; settings key bumped — Task 1.

**Placeholder scan:**
- [x] No "TBD", "TODO", "implement later", or vague steps.
- [x] Every code step contains the actual code.

**Type consistency:**
- [x] `sheetShape` uses `topEdge`/`rightEdge`/`bottomEdge`/`leftEdge` consistently.
- [x] `normalizeSheetShape` signature and usage match.
- [x] `getVertexAngles` now takes only `vertices`.
