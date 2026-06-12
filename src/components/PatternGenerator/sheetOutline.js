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

function getCornerIndices(sheetShape) {
  const topOn = !!(sheetShape && sheetShape.topSplit && sheetShape.topSplit.enabled);
  const rightOn = !!(sheetShape && sheetShape.rightSplit && sheetShape.rightSplit.enabled);
  const bottomOn = !!(sheetShape && sheetShape.bottomSplit && sheetShape.bottomSplit.enabled);
  const leftOn = !!(sheetShape && sheetShape.leftSplit && sheetShape.leftSplit.enabled);
  const tl = 0;
  const tr = tl + (topOn ? 2 : 1);
  const br = tr + (rightOn ? 2 : 1);
  const bl = br + (bottomOn ? 2 : 1);
  return { tl, tr, br, bl, leftOn };
}

function classifyVertex(index, sheetShape) {
  const { tl, tr, br, bl } = getCornerIndices(sheetShape);
  if (index === tl) return 'top-left corner';
  if (index === tr) return 'top-right corner';
  if (index === br) return 'bottom-right corner';
  if (index === bl) return 'bottom-left corner';
  return null;
}

export function getVertexAngles(vertices, sheetShape) {
  if (!Array.isArray(vertices) || vertices.length < 3) {
    return [];
  }

  const total = vertices.length;
  const topOn = !!(sheetShape && sheetShape.topSplit && sheetShape.topSplit.enabled);
  const rightOn = !!(sheetShape && sheetShape.rightSplit && sheetShape.rightSplit.enabled);
  const bottomOn = !!(sheetShape && sheetShape.bottomSplit && sheetShape.bottomSplit.enabled);
  const leftOn = !!(sheetShape && sheetShape.leftSplit && sheetShape.leftSplit.enabled);

  return vertices.map((vertex, i) => {
    const prev = vertices[(i - 1 + total) % total];
    const next = vertices[(i + 1) % total];
    const signed = angleBetween(prev, vertex, next);
    const interior = 180 - signed;
    const normalized = ((interior % 360) + 360) % 360;

    const cornerRole = classifyVertex(i, sheetShape);
    let role = cornerRole;
    if (!role) {
      if (topOn && i === 1) role = 'top edge split';
      else if (rightOn && i === (topOn ? 3 : 2)) role = 'right edge split';
      else if (bottomOn && i === (topOn ? 2 : 1) + (rightOn ? 2 : 1) + 1) role = 'bottom edge split';
      else if (leftOn && i === total - 1) role = 'left edge split';
      else role = 'vertex';
    }

    return {
      vertex,
      angleDegrees: Math.round(normalized * 100) / 100,
      role,
    };
  });
}

export const SHEET_SHAPE_DEFAULT = {
  topSplit: { enabled: false, position: 0.5 },
  rightSplit: { enabled: false, position: 0.5 },
  bottomSplit: { enabled: false, position: 0.5 },
  leftSplit: { enabled: false, position: 0.5 },
};
