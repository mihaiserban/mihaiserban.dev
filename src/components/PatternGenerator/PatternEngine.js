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
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  RADIAL: 'radial',
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
  const seed = 12345;
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
