export const SHAPE_TYPES = {
  CIRCLE: 'circle',
  SQUARE: 'square',
  ROUNDED_RECTANGLE: 'roundedRectangle',
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

function getDensity(nx, ny, gradientType, opacity) {
  const normalizedOpacity = opacity / 100;
  let density;

  switch (gradientType) {
    case GRADIENT_TYPES.UNIFORM:
      density = 1;
      break;
    case GRADIENT_TYPES.LEFT_TO_RIGHT:
      density = 1 - nx;
      break;
    case GRADIENT_TYPES.RIGHT_TO_LEFT:
      density = nx;
      break;
    case GRADIENT_TYPES.TOP_TO_BOTTOM:
      density = 1 - ny;
      break;
    case GRADIENT_TYPES.BOTTOM_TO_TOP:
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

function getShapeArea(shape) {
  const { type, size } = shape;
  const half = size / 2;
  switch (type) {
    case 'circle':
      return Math.PI * half * half;
    case 'square':
    case 'roundedRectangle':
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

function generateLinePattern(options, random, randomState) {
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

  const availableWidth = Math.max(0, width - marginLeft - marginRight);
  const availableHeight = Math.max(0, height - marginTop - marginBottom);

  if (availableWidth <= 0 || availableHeight <= 0) return [];

  const shapes = [];

  if (isHorizontal) {
    const rowHeight = thick + spacing;
    if (rowHeight <= 0) return [];

    const maxRows = Math.floor((availableHeight + spacing) / rowHeight);
    const totalHeight = maxRows * thick + (maxRows - 1) * spacing;
    const offsetY = marginTop + (availableHeight - totalHeight) / 2;

    for (let row = 0; row < maxRows; row++) {
      const ny = maxRows > 1 ? row / (maxRows - 1) : 0.5;
      const y = offsetY + row * rowHeight + thick / 2;
      let cursorX = marginLeft;

      while (cursorX < width - marginRight) {
        const nx = availableWidth > 0 ? (cursorX - marginLeft) / availableWidth : 0.5;
        const density = getDensity(nx, ny, gradientType, opacity);

        if (random() > density) {
          cursorX += minLen + spacing;
          continue;
        }

        const maxAvail = (width - marginRight) - cursorX;
        let lineLength = minLen + random() * (maxLen - minLen);
        lineLength = Math.min(lineLength, maxAvail);
        if (lineLength < minLen) break;

        const halfLen = lineLength / 2;

        let x = cursorX + halfLen;
        x = Math.max(marginLeft + halfLen, Math.min(width - marginRight - halfLen, x));

        shapes.push({
          type: shapeType,
          x,
          y,
          size: thick,
          lineLength,
        });

        cursorX = x + halfLen + spacing;
      }
    }
  } else {
    const colWidth = thick + spacing;
    if (colWidth <= 0) return [];

    const maxCols = Math.floor((availableWidth + spacing) / colWidth);
    const totalWidth = maxCols * thick + (maxCols - 1) * spacing;
    const offsetX = marginLeft + (availableWidth - totalWidth) / 2;

    for (let col = 0; col < maxCols; col++) {
      const nx = maxCols > 1 ? col / (maxCols - 1) : 0.5;
      const x = offsetX + col * colWidth + thick / 2;
      let cursorY = marginTop;

      while (cursorY < height - marginBottom) {
        const ny = availableHeight > 0 ? (cursorY - marginTop) / availableHeight : 0.5;
        const density = getDensity(nx, ny, gradientType, opacity);

        if (random() > density) {
          cursorY += minLen + spacing;
          continue;
        }

        const maxAvail = (height - marginBottom) - cursorY;
        let lineLength = minLen + random() * (maxLen - minLen);
        lineLength = Math.min(lineLength, maxAvail);
        if (lineLength < minLen) break;

        const halfLen = lineLength / 2;

        let y = cursorY + halfLen;
        y = Math.max(marginTop + halfLen, Math.min(height - marginBottom - halfLen, y));

        shapes.push({
          type: shapeType,
          x,
          y,
          size: thick,
          lineLength,
        });

        cursorY = y + halfLen + spacing;
      }
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

  const seed = options.seed || 12345;
  let randomState = seed;

  const random = () => {
    randomState = (randomState * 16807 + 0) % 2147483647;
    return (randomState - 1) / 2147483646;
  };

  const isLine = shapeType === SHAPE_TYPES.HORIZONTAL_LINE || shapeType === SHAPE_TYPES.VERTICAL_LINE;

  if (isLine) {
    return generateLinePattern(options, random, randomState);
  }

  const availableWidth = Math.max(0, width - marginLeft - marginRight);
  const availableHeight = Math.max(0, height - marginTop - marginBottom);
  const cellSize = shapeSize + spacing;

  if (cellSize <= 0 || availableWidth <= 0 || availableHeight <= 0) {
    return [];
  }

  const cols = Math.floor((availableWidth + spacing) / cellSize);
  const rows = Math.floor((availableHeight + spacing) / cellSize);

  const totalWidth = cols * shapeSize + (cols - 1) * spacing;
  const totalHeight = rows * shapeSize + (rows - 1) * spacing;
  const offsetX = marginLeft + (availableWidth - totalWidth) / 2;
  const offsetY = marginTop + (availableHeight - totalHeight) / 2;

  const shapes = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const nx = cols > 1 ? col / (cols - 1) : 0.5;
      const ny = rows > 1 ? row / (rows - 1) : 0.5;

      const density = getDensity(nx, ny, gradientType, opacity);

      if (random() > density) {
        continue;
      }

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
      });
    }
  }

  return shapes;
}
