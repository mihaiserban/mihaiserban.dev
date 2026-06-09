export const SHAPE_TYPES = {
  CIRCLE: 'circle',
  SQUARE: 'square',
  HORIZONTAL_LINE: 'horizontalLine',
  VERTICAL_LINE: 'verticalLine',
};

export const GRADIENT_TYPES = {
  UNIFORM: 'uniform',
  LEFT_TO_RIGHT: 'leftToRight',
  RIGHT_TO_LEFT: 'rightToLeft',
  TOP_TO_BOTTOM: 'topToBottom',
  BOTTOM_TO_TOP: 'bottomToTop',
  RADIAL: 'radial',
};

const GRADIENT_CURVE_EXPONENT = 1.8;
const GRADIENT_MIN_FLOOR = 0.1;

function getGradientPosition(nx, ny, gradientType) {
  switch (gradientType) {
    case GRADIENT_TYPES.UNIFORM:
      return 0.5;
    case GRADIENT_TYPES.LEFT_TO_RIGHT:
      return 1 - nx;
    case GRADIENT_TYPES.RIGHT_TO_LEFT:
      return nx;
    case GRADIENT_TYPES.TOP_TO_BOTTOM:
      return 1 - ny;
    case GRADIENT_TYPES.BOTTOM_TO_TOP:
      return ny;
    case GRADIENT_TYPES.RADIAL: {
      const dist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2);
      return 1 - dist / Math.SQRT2;
    }
    default:
      return 0.5;
  }
}

function getTargetDensity(nx, ny, gradientType, densityMax) {
  const pos = getGradientPosition(nx, ny, gradientType);
  const curved = Math.pow(pos, GRADIENT_CURVE_EXPONENT);
  const value = densityMax * (GRADIENT_MIN_FLOOR + (1 - GRADIENT_MIN_FLOOR) * curved);
  return Math.max(0, Math.min(1, value));
}

function ditherGrid(target, random) {
  const rows = target.length;
  const cols = target[0].length;
  const error = Array.from({ length: rows }, () => new Array(cols).fill(0));
  const filled = Array.from({ length: rows }, () => new Array(cols).fill(false));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = target[r][c] + error[r][c];
      const isFilled = random() < t;
      filled[r][c] = isFilled;
      const err = t - (isFilled ? 1 : 0);
      if (c + 1 < cols) {
        error[r][c + 1] += err * (7 / 16);
      }
      if (r + 1 < rows) {
        if (c - 1 >= 0) {
          error[r + 1][c - 1] += err * (3 / 16);
        }
        error[r + 1][c] += err * (5 / 16);
        if (c + 1 < cols) {
          error[r + 1][c + 1] += err * (1 / 16);
        }
      }
    }
  }
  return filled;
}

function getShapeArea(shape) {
  const { type, size } = shape;
  const half = size / 2;
  switch (type) {
    case 'circle':
      return Math.PI * half * half;
    case 'square':
      return size * size;
    case 'horizontalLine':
    case 'verticalLine':
      return shape.lineLength ? size * shape.lineLength : 0;
    default:
      return 0;
  }
}

export function calculateCoverage(shapes, width, height) {
  if (shapes.length === 0 || width <= 0 || height <= 0) {
    return 0;
  }
  const canvasArea = width * height;
  const totalShapeArea = shapes.reduce((sum, shape) => {
    return sum + getShapeArea(shape);
  }, 0);
  return Math.min(100, (totalShapeArea / canvasArea) * 100);
}

function generateLinePattern(options, random) {
  const {
    width,
    height,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    shapeType,
    spacing,
    opacity,
    gradientType,
    randomization,
    lineThickness,
    lineMinLength,
    lineMaxLength,
  } = options;

  const isHorizontal = shapeType === SHAPE_TYPES.HORIZONTAL_LINE;
  const thick = lineThickness || 30;
  const minLen = lineMinLength || 100;
  const maxLen = lineMaxLength || 400;
  const densityMax = Math.max(0, Math.min(1, opacity / 100));

  const availableWidth = Math.max(0, width - marginLeft - marginRight);
  const availableHeight = Math.max(0, height - marginTop - marginBottom);

  if (availableWidth <= 0 || availableHeight <= 0) return [];

  const cornerRadius = options.lineCornerRadius != null ? options.lineCornerRadius : 50;

  if (isHorizontal) {
    const rowHeight = thick + spacing;
    if (rowHeight <= 0) return [];

    const maxRows = Math.floor((availableHeight + spacing) / rowHeight);
    const totalHeight = maxRows * thick + (maxRows - 1) * spacing;
    const offsetY = marginTop + (availableHeight - totalHeight) / 2;
    const step = maxLen + spacing;
    const maxCols = step > 0 ? Math.floor((availableWidth + spacing) / step) : 0;
    if (maxRows === 0 || maxCols === 0) return [];

    const target = Array.from({ length: maxRows }, (_, row) => {
      const ny = maxRows > 1 ? row / (maxRows - 1) : 0.5;
      return new Array(maxCols).fill(0).map((_, col) => {
        const nx = maxCols > 1 ? col / (maxCols - 1) : 0.5;
        return getTargetDensity(nx, ny, gradientType, densityMax);
      });
    });

    const filled = ditherGrid(target, random);

    const shapes = [];
    for (let row = 0; row < maxRows; row++) {
      const ny = maxRows > 1 ? row / (maxRows - 1) : 0.5;
      const y = offsetY + row * rowHeight + thick / 2;

      for (let col = 0; col < maxCols; col++) {
        if (!filled[row][col]) continue;

        const cursorX = marginLeft + col * step;
        const maxAvail = (width - marginRight) - cursorX;
        let lineLength = minLen + random() * (maxLen - minLen);
        lineLength = Math.min(lineLength, maxAvail);
        if (lineLength < minLen) continue;

        const halfLen = lineLength / 2;

        let x = cursorX + halfLen;
        x = Math.max(marginLeft + halfLen, Math.min(width - marginRight - halfLen, x));

        shapes.push({
          type: shapeType,
          x,
          y,
          size: thick,
          lineLength,
          cornerRadius,
        });
      }
    }
    return shapes;
  }

  const colWidth = thick + spacing;
  if (colWidth <= 0) return [];

  const maxCols = Math.floor((availableWidth + spacing) / colWidth);
  const totalWidth = maxCols * thick + (maxCols - 1) * spacing;
  const offsetX = marginLeft + (availableWidth - totalWidth) / 2;
  const step = maxLen + spacing;
  const maxRows = step > 0 ? Math.floor((availableHeight + spacing) / step) : 0;
  if (maxCols === 0 || maxRows === 0) return [];

  const target = Array.from({ length: maxRows }, (_, row) => {
    const ny = maxRows > 1 ? row / (maxRows - 1) : 0.5;
    return new Array(maxCols).fill(0).map((_, col) => {
      const nx = maxCols > 1 ? col / (maxCols - 1) : 0.5;
      return getTargetDensity(nx, ny, gradientType, densityMax);
    });
  });

  const filled = ditherGrid(target, random);

  const shapes = [];
  for (let col = 0; col < maxCols; col++) {
    const nx = maxCols > 1 ? col / (maxCols - 1) : 0.5;
    const x = offsetX + col * colWidth + thick / 2;

    for (let row = 0; row < maxRows; row++) {
      if (!filled[row][col]) continue;

      const cursorY = marginTop + row * step;
      const maxAvail = (height - marginBottom) - cursorY;
      let lineLength = minLen + random() * (maxLen - minLen);
      lineLength = Math.min(lineLength, maxAvail);
      if (lineLength < minLen) continue;

      const halfLen = lineLength / 2;

      let y = cursorY + halfLen;
      y = Math.max(marginTop + halfLen, Math.min(height - marginBottom - halfLen, y));

      shapes.push({
        type: shapeType,
        x,
        y,
        size: thick,
        lineLength,
        cornerRadius,
      });
    }
  }
  return shapes;
}

export function generatePattern(options) {
  const {
    width,
    height,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    shapeType,
    shapeSize,
    spacing,
    opacity,
    gradientType,
    randomization,
  } = options;

  const isLine = shapeType === SHAPE_TYPES.HORIZONTAL_LINE || shapeType === SHAPE_TYPES.VERTICAL_LINE;

  if (isLine) {
    return generateLinePattern(options, Math.random);
  }

  const availableWidth = Math.max(0, width - marginLeft - marginRight);
  const availableHeight = Math.max(0, height - marginTop - marginBottom);
  const cellSize = shapeSize + spacing;
  const densityMax = Math.max(0, Math.min(1, opacity / 100));

  if (cellSize <= 0 || availableWidth <= 0 || availableHeight <= 0) {
    return [];
  }

  const cols = Math.floor((availableWidth + spacing) / cellSize);
  const rows = Math.floor((availableHeight + spacing) / cellSize);

  if (cols === 0 || rows === 0) {
    return [];
  }

  const totalWidth = cols * shapeSize + (cols - 1) * spacing;
  const totalHeight = rows * shapeSize + (rows - 1) * spacing;
  const offsetX = marginLeft + (availableWidth - totalWidth) / 2;
  const offsetY = marginTop + (availableHeight - totalHeight) / 2;

  const random = Math.random;

  const target = Array.from({ length: rows }, (_, row) => {
    const ny = rows > 1 ? row / (rows - 1) : 0.5;
    return new Array(cols).fill(0).map((_, col) => {
      const nx = cols > 1 ? col / (cols - 1) : 0.5;
      return getTargetDensity(nx, ny, gradientType, densityMax);
    });
  });

  const filled = ditherGrid(target, random);

  const shapes = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!filled[row][col]) continue;

      const baseX = offsetX + col * cellSize + shapeSize / 2;
      const baseY = offsetY + row * cellSize + shapeSize / 2;

      let x = baseX;
      let y = baseY;

      const halfSize = shapeSize / 2;
      x = Math.max(marginLeft + halfSize, Math.min(width - marginRight - halfSize, x));
      y = Math.max(marginTop + halfSize, Math.min(height - marginBottom - halfSize, y));

      shapes.push({
        type: shapeType,
        x,
        y,
        size: shapeSize,
        cornerRadius: shapeType === 'square' ? (options.cornerRadius || 0) : undefined,
      });
    }
  }

  return shapes;
}
