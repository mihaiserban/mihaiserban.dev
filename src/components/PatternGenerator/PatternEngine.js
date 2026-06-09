export const SHAPE_TYPES = {
  CIRCLE: 'circle',
  SQUARE: 'square',
  ROUNDED_RECTANGLE: 'roundedRectangle',
  TRIANGLE: 'triangle',
  HEXAGON: 'hexagon',
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

function getShapeArea(shapeType, size) {
  const half = size / 2;
  switch (shapeType) {
    case 'circle':
      return Math.PI * half * half;
    case 'square':
    case 'roundedRectangle':
      return size * size;
    case 'triangle': {
      const h = (size * Math.sqrt(3)) / 2;
      return (size * h) / 2;
    }
    case 'hexagon': {
      return ((3 * Math.sqrt(3)) / 2) * half * half;
    }
    case 'horizontalLine':
    case 'verticalLine':
      return 0;
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
    return sum + getShapeArea(shape.type, shape.size);
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
  } = options;

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
  const seed = options.seed || 12345;
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

      const baseX = offsetX + col * cellSize + shapeSize / 2;
      const baseY = offsetY + row * cellSize + shapeSize / 2;

      let x = baseX + jitterX;
      let y = baseY + jitterY;

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
