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
