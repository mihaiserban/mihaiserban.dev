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

  const tl = { x: round(-leftEnd), y: round(-topStart) };
  const tr = { x: round(w + rightStart), y: round(-topEnd) };
  const br = { x: round(w + rightEnd), y: round(h + bottomStart) };
  const bl = { x: round(-leftStart), y: round(h + bottomEnd) };

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
