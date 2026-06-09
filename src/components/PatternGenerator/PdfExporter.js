import { jsPDF } from 'jspdf';

const PARAM_LABEL_COLOR = '#666666';
const PARAM_VALUE_COLOR = '#000000';
const PARAM_HEADER_COLOR = '#000000';
const PARAM_FONT_LABEL = 18;
const PARAM_FONT_VALUE = 22;
const PARAM_FONT_HEADER = 28;
const PARAM_LINE_HEIGHT = 38;
const PARAM_PAD_X = 30;
const PARAM_PAD_Y = 30;
const PARAM_BLOCK_WIDTH = 280;
const PARAM_GAP = 24;
const PARAM_RULE_COLOR = '#cccccc';
const PARAM_RULE_WIDTH = 1;

const formatShapeLabel = (shapeType) => {
  switch (shapeType) {
    case 'circle':
      return 'Circle';
    case 'square':
      return 'Square';
    case 'horizontalLine':
      return 'Horizontal Line';
    case 'verticalLine':
      return 'Vertical Line';
    default:
      return shapeType;
  }
};

const formatGradientLabel = (gradientType) => {
  switch (gradientType) {
    case 'uniform':
      return 'Uniform';
    case 'leftToRight':
      return 'Left to Right';
    case 'rightToLeft':
      return 'Right to Left';
    case 'topToBottom':
      return 'Top to Bottom';
    case 'bottomToTop':
      return 'Bottom to Top';
    case 'radial':
      return 'Radial';
    default:
      return gradientType;
  }
};

const isLineShape = (shapeType) =>
  shapeType === 'horizontalLine' || shapeType === 'verticalLine';

const buildParamRows = (settings) => {
  const isLine = isLineShape(settings.shapeType);
  const rows = [
    { label: 'Width', value: `${settings.width} mm` },
    { label: 'Height', value: `${settings.height} mm` },
    {
      label: 'Margins',
      value: `T ${settings.marginTop} / B ${settings.marginBottom} / L ${settings.marginLeft} / R ${settings.marginRight} mm`,
    },
    { label: 'Shape', value: formatShapeLabel(settings.shapeType) },
    {
      label: isLine ? 'Line Height' : 'Shape Size',
      value: `${isLine ? settings.lineThickness : settings.shapeSize} mm`,
    },
  ];

  if (isLine) {
    rows.push({
      label: 'Line Length',
      value: `${settings.lineMinLength}–${settings.lineMaxLength} mm`,
    });
    rows.push({
      label: 'Line Corner Radius',
      value: `${settings.lineCornerRadius != null ? settings.lineCornerRadius : 50}%`,
    });
  } else if (settings.shapeType === 'square') {
    rows.push({
      label: 'Corner Radius',
      value: `${settings.cornerRadius != null ? settings.cornerRadius : 0}%`,
    });
  }

  rows.push({ label: 'Spacing', value: `${settings.spacing} mm` });
  rows.push({ label: 'Density', value: `${settings.opacity}%` });
  rows.push({ label: 'Gradient', value: formatGradientLabel(settings.gradientType) });
  return rows;
};

const svgNS = 'http://www.w3.org/2000/svg';

const createSvgElement = (name, attrs = {}) => {
  const el = document.createElementNS(svgNS, name);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) el.setAttribute(k, String(v));
  });
  return el;
};

const drawParametersBlock = (clone, settings, originX) => {
  const rows = buildParamRows(settings);
  const blockHeight =
    PARAM_PAD_Y * 2 +
    PARAM_FONT_HEADER +
    PARAM_GAP +
    rows.length * PARAM_LINE_HEIGHT +
    Math.max(0, rows.length - 1) * 6;

  const group = createSvgElement('g', { 'data-parameters': 'true' });

  group.appendChild(
    createSvgElement('rect', {
      x: originX,
      y: 0,
      width: PARAM_BLOCK_WIDTH,
      height: blockHeight,
      fill: 'none',
      stroke: PARAM_RULE_COLOR,
      'stroke-width': PARAM_RULE_WIDTH,
    })
  );

  const headerY = PARAM_PAD_Y + PARAM_FONT_HEADER;
  group.appendChild(
    createSvgElement('text', {
      x: originX + PARAM_PAD_X,
      y: headerY,
      'font-size': PARAM_FONT_HEADER,
      'font-family': 'sans-serif',
      'font-weight': 'bold',
      fill: PARAM_HEADER_COLOR,
    })
  ).textContent = 'Parameters';

  let cursorY = headerY + PARAM_GAP;
  rows.forEach((row) => {
    group.appendChild(
      createSvgElement('line', {
        x1: originX + PARAM_PAD_X,
        y1: cursorY - PARAM_LINE_HEIGHT * 0.35,
        x2: originX + PARAM_BLOCK_WIDTH - PARAM_PAD_X,
        y2: cursorY - PARAM_LINE_HEIGHT * 0.35,
        stroke: PARAM_RULE_COLOR,
        'stroke-width': PARAM_RULE_WIDTH,
      })
    );

    group.appendChild(
      createSvgElement('text', {
        x: originX + PARAM_PAD_X,
        y: cursorY,
        'font-size': PARAM_FONT_LABEL,
        'font-family': 'sans-serif',
        fill: PARAM_LABEL_COLOR,
      })
    ).textContent = row.label;

    const valueX = originX + PARAM_BLOCK_WIDTH - PARAM_PAD_X;
    const valueEl = createSvgElement('text', {
      x: valueX,
      y: cursorY,
      'font-size': PARAM_FONT_VALUE,
      'font-family': 'sans-serif',
      'font-weight': 'bold',
      'text-anchor': 'end',
      fill: PARAM_VALUE_COLOR,
    });
    valueEl.textContent = row.value;
    group.appendChild(valueEl);

    cursorY += PARAM_LINE_HEIGHT + 6;
  });

  clone.appendChild(group);
  return blockHeight;
};

export async function exportToPdf(svgElement, filename, widthMm, heightMm, settings) {
  if (!svgElement) {
    throw new Error('No SVG element provided');
  }

  const clone = svgElement.cloneNode(true);

  clone.querySelectorAll('.margin-guide').forEach((el) => el.remove());

  const vbParts = (svgElement.getAttribute('viewBox') || '').split(/[\s,]+/);
  const vbX = parseFloat(vbParts[0]) || 0;
  const vbY = parseFloat(vbParts[1]) || 0;
  const vbW = parseFloat(vbParts[2]) || widthMm;
  const vbH = parseFloat(vbParts[3]) || heightMm;

  const PAD = 50;
  const PARAM_GUTTER = 40;
  const newVbX = vbX - PAD;
  const newVbY = vbY - PAD;
  const newVbW = vbW + PAD * 2 + PARAM_BLOCK_WIDTH + PARAM_GUTTER;

  let newVbH = vbH + PAD * 2;
  if (settings) {
    const blockHeight = drawParametersBlock(clone, settings, vbW + PARAM_GUTTER);
    newVbH = Math.max(newVbH, blockHeight);
  }

  clone.setAttribute('viewBox', `${newVbX} ${newVbY} ${newVbW} ${newVbH}`);
  clone.setAttribute('width', newVbW);
  clone.setAttribute('height', newVbH);

  clone.style.maxWidth = null;
  clone.style.maxHeight = null;
  clone.style.border = null;
  clone.style.background = null;

  const pdf = new jsPDF({
    unit: 'mm',
    format: [newVbW, newVbH],
    orientation: newVbW > newVbH ? 'landscape' : 'portrait',
    compress: true,
  });

  const { svg2pdf } = await import('svg2pdf.js');
  await svg2pdf(clone, pdf, {
    x: 0,
    y: 0,
    width: newVbW,
    height: newVbH,
  });

  pdf.save(filename);
}
