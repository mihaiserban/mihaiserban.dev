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
      density = nx;
      break;
    case GRADIENT_TYPES.RIGHT_TO_LEFT:
      density = 1 - nx;
      break;
    case GRADIENT_TYPES.TOP_TO_BOTTOM:
      density = ny;
      break;
    case GRADIENT_TYPES.BOTTOM_TO_TOP:
      density = 1 - ny;
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
    lineThickness,
    lineMinLength,
    lineMaxLength,
  } = options;

  const isLine = shapeType === SHAPE_TYPES.HORIZONTAL_LINE || shapeType === SHAPE_TYPES.VERTICAL_LINE;
  const isHorizontalLine = shapeType === SHAPE_TYPES.HORIZONTAL_LINE;

  const effectiveWidth = isLine
    ? (isHorizontalLine ? (lineMaxLength || shapeSize) : (lineThickness || 2))
    : shapeSize;
  const effectiveHeight = isLine
    ? (isHorizontalLine ? (lineThickness || 2) : (lineMaxLength || shapeSize))
    : shapeSize;

  const cellWidth = effectiveWidth + spacing;
  const cellHeight = effectiveHeight + spacing;

  const availableWidth = Math.max(0, width - marginLeft - marginRight);
  const availableHeight = Math.max(0, height - marginTop - marginBottom);

  if (cellWidth <= 0 || cellHeight <= 0 || availableWidth <= 0 || availableHeight <= 0) {
    return [];
  }

  const cols = Math.floor((availableWidth + spacing) / cellWidth);
  const rows = Math.floor((availableHeight + spacing) / cellHeight);

  const totalWidth = cols * effectiveWidth + (cols - 1) * spacing;
  const totalHeight = rows * effectiveHeight + (rows - 1) * spacing;
  const offsetX = marginLeft + (availableWidth - totalWidth) / 2;
  const offsetY = marginTop + (availableHeight - totalHeight) / 2;

  const shapes = [];
  const seed = options.seed || 12345;
  let randomState = seed;

  const random = () => {
    randomState = (randomState * 16807 + 0) % 2147483647;
    return (randomState - 1) / 2147483646;
  };

  const minLen = lineMinLength != null ? lineMinLength : shapeSize;
  const maxLen = lineMaxLength != null ? lineMaxLength : shapeSize;
  const thick = lineThickness || 2;

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

      const baseX = offsetX + col * cellWidth + effectiveWidth / 2;
      const baseY = offsetY + row * cellHeight + effectiveHeight / 2;

      let x = baseX + jitterX;
      let y = baseY + jitterY;

      if (isLine) {
        const lineLength = minLen + random() * (maxLen - minLen);

        if (isHorizontalLine) {
          const halfLen = lineLength / 2;
          x = Math.max(marginLeft + halfLen, Math.min(width - marginRight - halfLen, x));
          y = Math.max(marginTop + thick / 2, Math.min(height - marginBottom - thick / 2, y));
        } else {
          const halfLen = lineLength / 2;
          x = Math.max(marginLeft + thick / 2, Math.min(width - marginRight - thick / 2, x));
          y = Math.max(marginTop + halfLen, Math.min(height - marginBottom - halfLen, y));
        }

        shapes.push({
          type: shapeType,
          x,
          y,
          size: thick,
          lineLength,
        });
      } else {
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
  }

  return shapes;
}
